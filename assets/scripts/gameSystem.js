
import * as audio from './audio.js';
import * as drinks from './drinks.js';

export function set_tilemap(scene) {
  scene.TILE_SIZE = 32;
  scene.map_width = 12;
  scene.map_height = 23;
  scene.mapData = [];
  for (let y = 0; y < scene.map_height; y++) {
    const row = [];
    for (let x = 0; x < scene.map_width; x++) {
      row.push(0)
    }
    scene.mapData.push(row);
  }
  let blockedTiles = [
    [0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8], [0, 9], [0, 10], [0, 11],
    [7, 0], [7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6], [7, 7], [7, 8], [7, 10], [7, 11],
    [8, 0], [8, 3], [8, 4], [8, 11], [8, 7],
    [9, 0], [9, 1], [9, 3], [9, 4], [9, 11],
    [10, 0], [10, 10], [10, 11],
    [11, 0], [11, 11],
    [12, 0], [12, 11],
    [13, 0], [13, 11],
    [14, 0], [14, 11],
    [15, 0], [15, 11],
    [16, 0], [16, 11],
    [17, 0], [17, 1], [17, 2], [17, 3], [17, 5], [17, 6], [17, 7], [17, 10], [17, 11],
    [18, 0], [18, 1], [18, 2], [18, 3], [18, 5], [18, 6], [18, 7], [18, 10], [18, 11],
    [19, 0], [19, 7], [19, 10], [19, 11],
    [20, 0], [20, 1], [20, 2], [20, 3], [20, 4], [20, 5], [20, 6], [20, 7], [20, 10], [20, 11],
  ]
  let coffeeTiles = [
   [9,10],[10,9],[11,10]
  ]
  for (let index = 0; index < coffeeTiles.length; index++) {
    let id = coffeeTiles[index]
    scene.mapData[id[0]][id[1]] = 4;
  }

  let playerlockedTiles = [
    [11, 1], [11, 2], [11, 3], [11, 4], [11, 5], [11, 6],
    [7, 9],
    [13, 1], [13, 2], [13, 3], [13, 4], [13, 5], [13, 6],
  ]
  for (let index = 0; index < playerlockedTiles.length; index++) {
    let id = playerlockedTiles[index]
    scene.mapData[id[0]][id[1]] = 2;
  }
  let npclockedTiles = [
    [12, 1], [12, 2], [12, 3], [12, 4], [12, 5], [12, 6],
    [14, 1], [14, 2], [14, 3], [14, 4], [14, 5], [14, 6],
  ]
  for (let index = 0; index < npclockedTiles.length; index++) {
    let id = npclockedTiles[index]
    scene.mapData[id[0]][id[1]] = 3;
  }
  for (let index = 0; index < blockedTiles.length; index++) {
    let id = blockedTiles[index]
    scene.mapData[id[0]][id[1]] = 1;
  }
}

export function createRoom(scene) {
  scene.roomBack = scene.add.sprite(scene.cameras.main.centerX, scene.cameras.main.centerY, 'room_background')
    .setDepth(-1)
    .setInteractive()
  scene.roomBack.on('pointerdown', (pointer) => {
    if (scene.activePath) return;
    if (scene.player.pauseMovement) return
    const tileX = Math.floor(pointer.worldX / scene.TILE_SIZE);
    const tileY = Math.floor(pointer.worldY / scene.TILE_SIZE);
    const playerTileX = Math.floor(scene.player.x / scene.TILE_SIZE);
    const playerTileY = Math.floor(scene.player.y / scene.TILE_SIZE);

    console.log(`y:${tileY} x:${tileX}`)
    

    scene.easystar = new EasyStar.js();
    scene.easystar.setGrid(scene.mapData);
    scene.easystar.setAcceptableTiles([0,3,4]);
    scene.easystar.findPath(playerTileX, playerTileY, tileX, tileY, (path) => {
      if (path === null || path.length <= 1) {
        return
        // console.log("No path found.");
      } else {
        updateEnergy(scene, (scene.energy[0] - 1))
        scene.newPos.x = Math.floor(tileX * 32 + 16), scene.newPos.y = Math.floor(tileY * 32 + 16);
        scene.newPos.setVisible(true)
        scene.activePath = true
        moveAlongPath(scene, path, scene.player);
      }
    });
    scene.easystar.calculate();
   // console.log('roomBack clicked!');
  });

  scene.roomTop = scene.add.sprite(scene.cameras.main.centerX, scene.cameras.main.centerY, 'room_top')
    .setDepth(100)
}


export function createPlayer(scene) {
  scene.player = scene.add.sprite(5 * scene.TILE_SIZE + 16, 8 * scene.TILE_SIZE + 16 / 2, 'player')
    .setFrame(1)
    .setDepth(1)
  scene.player.pauseMovement = false  
  scene.newPos = scene.add.sprite(0, 0, 'newPos')
  scene.newPos.setDepth(200)
  scene.newPos.setVisible(false)
}

export function playerJump(scene){
  scene.player.pauseMovement = true
  scene.tweens.add({
    targets: scene.player,
    y: scene.player.y - 20,
    duration: 150,
    ease: 'Quad.easeOut',
    yoyo: true,            
    delay: 100,
    onComplete: () => {
      scene.player.pauseMovement = false
    }
  });  
} 

export function changePlayerDir(scene,player,target){
  let playerX = Math.floor(player.x / scene.TILE_SIZE)
  let playerY = Math.floor(player.y / scene.TILE_SIZE)
  let targetX = Math.floor(target.x / scene.TILE_SIZE)
  let targetY = Math.floor(target.y / scene.TILE_SIZE)
  if (playerY === targetY && playerX < targetX) {
    player.setFrame(7)
  } else if (playerY === targetY && playerX > targetX) {
    player.setFrame(4)
  } else if (playerY < targetY) {
    player.setFrame(1)
  } else if (playerY > targetY) {
    player.setFrame(10)
  }
} 

export function moveAlongPath(scene, path, entity) {
  let currentTween = null;
  let player_direction = 0;
  if (path.length <= 1) {
    scene.activePath = false
    return;
  }
  let tileID
  let i = 1;
  if (currentTween) {
    currentTween.stop();
    currentTween = null;
  }
  function moveNext() {
    if (i >= path.length) {
      entity.anims.stop();
      let dirs = [1, 4, 7, 10]
      entity.setFrame(dirs[player_direction])
      scene.activePath = false
      scene.newPos.setVisible(false)
      return;
    }
    audio.playSound('playerStep')
    const nextTile = path[i];
    const nextX = nextTile.x * scene.TILE_SIZE + scene.TILE_SIZE / 2;
    const nextY = nextTile.y * scene.TILE_SIZE + 16 / 2;
    tileID = scene.mapData[nextTile.y][nextTile.x]
    if (tileID === 3) {
      entity.setDepth(101)
    }
    const prevTile = path[i - 1];
    const dx = nextTile.x - prevTile.x;
    const dy = nextTile.y - prevTile.y;
    if (dy > 0) {
      player_direction = 0
      entity.anims.play('player_walk_down', true);
    } else if (dx < 0) {
      player_direction = 1
      entity.anims.play('player_walk_left', true);
    } else if (dx > 0) {
      player_direction = 2
      entity.anims.play('player_walk_right', true);
    } else if (dy < 0) {
      player_direction = 3
      entity.anims.play('player_walk_up', true);
    }
    currentTween = scene.tweens.add({
      targets: entity,
      x: nextX,
      y: nextY,
      duration: 200,
      ease: 'Linear',
      onComplete: () => {
        if (tileID === 3) {
          entity.setDepth(101)
        } else {
          entity.setDepth(nextTile.y)
        }
        i++;
        moveNext();
      }
    });
  }
  moveNext();
}

export function createClock(scene) {
  scene.dayNightOverlay = scene.add.rectangle(0, 0, scene.scale.width, scene.scale.height, 0x000000)
    .setOrigin(0)
    .setScrollFactor(0)
    .setDepth(200)
    .setAlpha(0);
  scene.timeColors = {
    night: new Phaser.Display.Color(0, 0, 139),
    lateNight: new Phaser.Display.Color(75, 0, 130),
    morning: new Phaser.Display.Color(255, 250, 205),
    evening: new Phaser.Display.Color(244, 164, 96)
  };
  scene.timeElapsed = 0;
  scene.dayLength = 1440;
  scene.timeSpeed = 1;         // 1 = real time; 2 = twice as fast
  scene.isTimePaused = false;
  scene.clock = scene.add.sprite(Math.floor(scene.scale.width / 2), 25, 'dayNight')
  scene.clock.setDepth(1000)
}

export function dayNightCycle(scene, delta) {
  if (!scene.isTimePaused) {
    scene.timeElapsed += (delta / 1000) * scene.timeSpeed;
  }
  const progress = (scene.timeElapsed % scene.dayLength) / scene.dayLength;
  const phases = [
    { name: "night", start: 0.875, color: scene.timeColors.night },
    { name: "lateNight", start: 0.0, color: scene.timeColors.lateNight },
    { name: "morning", start: 0.375, color: scene.timeColors.morning },
    { name: "evening", start: 0.666, color: scene.timeColors.evening },
  ];
  phases.push({ ...phases[0], start: 1.0 });
  let fromPhase = null;
  let toPhase = null;
  let lerp = 0;
  for (let i = 0; i < phases.length - 1; i++) {
    const curr = phases[i];
    const next = phases[i + 1];
    const inRange = progress >= curr.start && progress < next.start;
    const wrapped = curr.start > next.start && (progress >= curr.start || progress < next.start);
    if (inRange || wrapped) {
      fromPhase = curr;
      toPhase = next;
      const start = curr.start;
      const end = next.start < start ? next.start + 1 : next.start;
      const adjustedProgress = progress < start ? progress + 1 : progress;
      const rawLerp = (adjustedProgress - start) / (end - start);
      lerp = Phaser.Math.Easing.Sine.InOut(rawLerp);
      break;
    }
  }
  const r = Phaser.Math.Linear(fromPhase.color.red, toPhase.color.red, lerp);
  const g = Phaser.Math.Linear(fromPhase.color.green, toPhase.color.green, lerp);
  const b = Phaser.Math.Linear(fromPhase.color.blue, toPhase.color.blue, lerp);
  const tintColor = Phaser.Display.Color.GetColor(r, g, b);
  scene.dayNightOverlay.fillColor = tintColor;
  const alphaMap = {
    night: 0.15,
    lateNight: 0.15,
    morning: 0.15,
    evening: 0.15,
  };
  const fromAlpha = alphaMap[fromPhase.name] || 0.1;
  const toAlpha = alphaMap[toPhase.name] || 0.1;
  const smoothAlpha = Phaser.Math.Linear(fromAlpha, toAlpha, lerp);
  scene.dayNightOverlay.setAlpha(smoothAlpha);
  const currentPhase = fromPhase.name;
  if (scene.lastPhase !== currentPhase) {
    scene.lastPhase = currentPhase;
    const phaseToFrame = {
      night: 0,
      lateNight: 1,
      morning: 2,
      evening: 3,
    };
    scene.clock.setFrame(phaseToFrame[currentPhase]);
    scene.clock.y = -scene.clock.height;
    scene.tweens.add({
      targets: scene.clock,
      y: 25,
      duration: 400,
      ease: 'Bounce.Out',
    });
  }
}

export function skipToTime(scene, hour24) {
  const normalized = hour24 / 24;
  scene.timeElapsed = normalized * scene.dayLength;
};

export function updateEnergy(scene, newEnergy) {
  const fullHeight = scene.energyFill.height;
  const current = scene.energy[0];
  const max = scene.energy[1];
  newEnergy = Phaser.Math.Clamp(newEnergy, 0, max);
  const fromHeight = fullHeight * (current / max);
  const toHeight = fullHeight * (newEnergy / max);
  const x = scene.energyFill.x - scene.energyFill.width / 2;
  const yBottom = scene.energyFill.y;
  scene.energy[0] = newEnergy;
  scene.energyText.setText(`${scene.energy[0]}`);
  const index = getEnergyColor(newEnergy, max)
  scene.energyFill.setFrame(index)
  scene.tweens.addCounter({
    from: fromHeight,
    to: toHeight,
    duration: 300,
    ease: 'Cubic.Out',
    onUpdate: tween => {
      const h = tween.getValue();
      scene.energyMaskShape.clear();
      scene.energyMaskShape.fillRect(x, yBottom - h, scene.energyFill.width, h);
    },
    onComplete: () => {
      //  scene.energy[0] = newEnergy;
    }
  });
}

export function getEnergyColor(current, max) {
  const percent = (current / max) * 100;
  if (percent > 50) return 0;
  else if (percent > 34) return 1;
  else if (percent > 19) return 2;
  else return 3;
}

export function createEnergyBar(scene) {
  scene.energy = [100, 100];
  scene.energyBar = scene.add.sprite(0, 0, 'energyBar').setOrigin(0.5, 1).setDepth(1000);
  scene.energyBar.x = scene.scale.width - scene.energyBar.width / 2 - 10;
  scene.energyBar.y = scene.scale.height - 80;
  scene.energyFill = scene.add.sprite(0, 0, 'energyFill').setOrigin(0.5, 1).setDepth(1000);
  scene.energyFill.x = scene.energyBar.x;
  scene.energyFill.y = scene.energyBar.y - (111 - 105) / 2;
  const maskShape = scene.add.graphics()
  maskShape.fillRect(
    scene.energyFill.x - scene.energyFill.width / 2,
    scene.energyFill.y - scene.energyFill.height,
    scene.energyFill.width,
    scene.energyFill.height
  );
  const energyMask = maskShape.createGeometryMask();
  scene.energyFill.setMask(energyMask);
  scene.energyMaskShape = maskShape;
  scene.energyText = scene.add.text(0, 0, '', {
    fontFamily: 'DefaultFont',
    fontSize: '18px',
    stroke: '#3a3a50',
    strokeThickness: 4,
    fill: '#ffffff',
    padding: { x: 0, y: 0 }
  }).setDepth(1002).setVisible(false);
  scene.energyText.setOrigin(0.5, 0.5); 

  scene.energyBorder = scene.add.sprite(0, 0, 'energyBorder')
    .setDepth(1000)
    .setVisible(false);
  scene.energyBar.setInteractive();

  scene.energyBorder.setPosition(
    scene.energyBar.x,
    scene.energyBar.y - scene.energyBar.height - 20
  );
  scene.energyText.setPosition(
    scene.energyBorder.x,
    scene.energyBorder.y
  );

  scene.energyBar.on('pointerover', () => {
    const colors = ['#00ff00', '#ffff00', '#ffa500', '#ff0000']
    const [current, max] = scene.energy;
    const color = colors[getEnergyColor(current, max)];
    scene.energyText.setText(`${scene.energy[0]}`);
    scene.energyText.setStyle({ fill: color });
    scene.energyBorder.setVisible(true)
    scene.energyText.setVisible(true);
  });

  scene.energyBar.on('pointerout', () => {
    scene.energyBorder.setVisible(false);
    scene.energyText.setVisible(false);
  });
}

export function flashFill(sprite, color = 0xffff00, flashCount = 2, flashDuration = 100) {
  const scene = sprite.scene;
  let count = 0;
  const flash = () => {
    sprite.setTintFill(color);
    scene.tweens.add({
      targets: sprite,
      alpha: 0.4,         // fade to 40% alpha
      duration: flashDuration / 2,
      yoyo: true,         // fade back to 1
      ease: 'Sine.easeInOut',
      onYoyo: () => {
        sprite.clearTint(); // clear tint mid-way (as alpha returns)
      },
      onComplete: () => {
        count++;
        if (count < flashCount) {
          scene.time.delayedCall(flashDuration / 2, flash);
        }
      }
    });
  };

  flash();
}



export function startCooldown(scene, sprite, duration = 2000) {
  let elapsed = 0;
  const interval = 16;

  // Create and link a new overlay to the sprite
  const overlay = scene.add.graphics();
  overlay.setDepth(sprite.depth+1)
  sprite.cooldownOverlay = overlay;

  sprite.alpha = 0.5;

  const event = scene.time.addEvent({
    delay: interval,
    repeat: (duration / interval) - 1,
    callback: () => {
      elapsed += interval;
      const progress = Phaser.Math.Clamp(elapsed / duration, 0, 1);
      const angle = Phaser.Math.Linear(360, 0, progress);

      overlay.clear();
      overlay.lineStyle(); 
      overlay.fillStyle(); 
      overlay.fillStyle(0x7FFFD4, 0.35);           // Fill color
      overlay.lineStyle(1, 0x2F4F4F, 1);           // Stroke color
      overlay.slice(
        sprite.x,
        sprite.y,
        sprite.width / 2,
        Phaser.Math.DegToRad(-90),
        Phaser.Math.DegToRad(angle - 90),
        false
      );
      overlay.fillPath();
      overlay.strokePath();
    },
    callbackScope: scene,
  });

  // After cooldown ends
  scene.time.delayedCall(duration + 50, () => {
    if (sprite.cooldownOverlay) {
      sprite.cooldownOverlay.destroy();   // 🔥 Properly delete the overlay
      sprite.cooldownOverlay = null;
    }
    console.log(sprite.type)
    if (sprite.type !== null) {
     callSpecialFunction(scene,sprite.type)
    } 
    sprite.alpha = 1;
    flashFill(sprite, 0xffffff, 2, 100);
    scene.time.delayedCall(200, () => {
      sprite.onCoolDown = false;
    });    
    console.log("Cooldown completed!");
  });
}

export function callSpecialFunction(scene,type){
  if (type === "drink") {
  drinks.setCoffeeTableSprite(scene)
  }
}



import * as audio from './audio.js';
import * as drinks from './drinks.js';
import * as player from './player.js';
import * as SaveGame from './SaveGame.js';
import * as scene_room from './scene_room.js';

export function createRoom(scene) {
  scene.roomBack = scene.add.sprite(scene.cameras.main.centerX, scene.cameras.main.centerY, 'room_background')
    .setDepth(-1)
    .setInteractive()
  scene.roomTop = scene.add.sprite(scene.cameras.main.centerX, scene.cameras.main.centerY, 'room_top')
    .setDepth(100)
  scene.roomTopEx = scene.add.sprite((scene.cameras.main.centerX - (32 * 2)) - 1, scene.cameras.main.centerY + (32 * 2), 'room_top_ex')
    .setDepth(85)

  scene.tips = scene.add.sprite(7 * scene.TILE_SIZE + scene.TILE_SIZE / 2, 8 * scene.TILE_SIZE - 1 / 2, 'tips')
    .setDepth(8)

  scene.mapData[19][4] = 6; // clients
  scene.mapData[21][7] = 5; // open/close sign
  scene.closeOpenSign = scene.add.sprite(0, 0, 'closeOpen')
    .setPosition(7 * scene.TILE_SIZE + 16, 19 * scene.TILE_SIZE + 16)
    .setInteractive()
  scene.closeOpenSign.open = false
  scene.closeOpenSign.on('pointerdown', (pointer) => {
    let tileX = Math.floor(scene.player.x / scene.TILE_SIZE)
    let tileY = Math.floor((scene.player.y + scene.player.height / 2) / scene.TILE_SIZE) - 1
    let inRange = scene.mapData[tileY][tileX] === 5
    if (!inRange) return
    if (scene.closeOpenSign.open) return
    scene.dayPhase = 'active'
    player.setPlayerDir(scene, 'up')
    audio.playSound('systemSign', scene);
    scene.isTimePaused = false
    scene.closeOpenSign.setFrame(1)
    scene.closeOpenSign.open = true
    scene.time.delayedCall(100, () => {
      scene_room.generateClient(scene)
    })
  });
}

export function createPauseIcon(scene) {
  scene.pauseIcon = scene.add.sprite(0, 0, 'pauseIcon')
    .setDepth(1000)
  scene.pauseIcon.setPosition(scene.scale.width - scene.pauseIcon.width + 10, -scene.pauseIcon.height)
  scene.tweens.add({
    targets: scene.pauseIcon,
    y: 25,
    duration: 400,
    ease: 'Bounce.Out',
  });
  const moneyBorder = scene.add.sprite(0, 5, 'moneyBorder');

  scene.money = scene.add.sprite(0, 0, 'moneyIdle');
  scene.moneyValue = scene.add.text(0, 15, `${SaveGame.loadGameValue('money')}`, {
    fontFamily: 'DefaultFont',
    fontSize: '18px',
    stroke: '#3a3a50',
    strokeThickness: 4,
    fill: '#9ACD32',
    padding: { x: 0, y: 0 },
    align: 'right'
  })
    .setOrigin(0, -1);
  scene.time.delayedCall(0, () => {
    const spacing = 4;
    const containerX = scene.calendar.x + scene.calendar.width + 125
    scene.moneyValue.setPosition(scene.money.width - 30, -scene.money.height / 2 + 7);
    scene.money.setPosition(-25, 6);
    moneyBorder.setPosition(scene.money.width, 8);
    scene.moneyUI = scene.add.container(containerX, -scene.money.height, [moneyBorder, scene.money, scene.moneyValue])
      .setDepth(1000)
      .setSize(scene.money.width + scene.moneyValue.width + spacing, scene.money.height);
    scene.tweens.add({
      targets: scene.moneyUI,
      y: 10,
      duration: 400,
      ease: 'Bounce.Out',
    });

  });


}

export function updateMoneyValueAnimated(scene, newValue, duration = 1500) {
  const text = scene.moneyValue;
  const currentValue = parseInt(text.text);
  const targetValue = Phaser.Math.Clamp(parseInt(newValue), 0, 99_999_999);
  SaveGame.saveGameValue('money', targetValue);
  audio.playSound('systemMoney', scene);
  if (currentValue === targetValue) return;
  if (scene.moneyTween && scene.moneyTween.isPlaying()) {
    scene.moneyTween.stop();
  } else {
    scene.money.play('moneyAni');
  }
  const obj = { value: currentValue };
  scene.moneyTween = scene.tweens.add({
    targets: obj,
    value: targetValue,
    duration: duration,
    ease: 'Linear',
    onUpdate: () => {
      const val = Math.floor(obj.value);
      text.setText(val);
    },
    onComplete: () => {
      scene.money.stop();
      scene.money.setTexture('moneyIdle');
      text.setText(targetValue);
    }
  });
}

export function entityPath(scene, entity, y, x, finalDir) {
  const tileX = Math.floor(x);
  const tileY = Math.floor(y);
  const entityTileX = Math.floor(entity.x / scene.TILE_SIZE);
  const entityTileY = Math.floor(entity.y / scene.TILE_SIZE);
  entity.easystar = new EasyStar.js();
  entity.easystar.setGrid(scene.mapData);
  const allTileIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  let unacceptable
  if (entity === scene.player) {
    unacceptable = [1, 2];
  } else {
    unacceptable = [1, 3];
  }
  const acceptable = allTileIndices.filter(t => !unacceptable.includes(t));
  entity.easystar.setAcceptableTiles(acceptable);
  entity.easystar.findPath(entityTileX, entityTileY, tileX, tileY, (path) => {
    if (path === null || path.length <= 1) {
      return
    } else {
      if (scene.gameActive && entity === scene.player) {
        updateEnergy(scene, (scene.energy[0] - 1))
        scene.newPos.x = Math.floor(tileX * 32 + 16), scene.newPos.y = Math.floor(tileY * 32 + 16);
        scene.newPos.setVisible(true)
      }
      entity.activePath = true
      moveAlongPath(scene, path, entity, finalDir);
    }
  });
  entity.easystar.calculate();
}

export function setEntityPos(scene, entity, y, x) {
  entity.setPosition(x * scene.TILE_SIZE + 16, y * scene.TILE_SIZE + 16 / 2)
}

export function changeEntityDir(entity, d) {
  let dirs = [1, 4, 7, 10]
  if (d === "down") {
    entity.direction = 0
  } else if (d === "left") {
    entity.direction = 1
  } else if (d === "right") {
    entity.direction = 2
  } else if (d === "up") {
    entity.direction = 3
  }
  entity.setFrame(dirs[entity.direction])
}

export function moveAlongPath(scene, path, entity, finalDir) {
  if (path.length <= 1) {
    entity.activePath = false
    return;
  }
  let tileID
  let i = 1;
  if (entity.currentTween) {
    entity.currentTween.stop();
    entity.currentTween = null;
  }
  function moveNext() {
    if (i >= path.length) {
      entity.anims.stop();
      if (finalDir) {
       changeEntityDir(entity, finalDir) 
      } else {
       let dirs = ["down", "left", "right", "up"]
       changeEntityDir(entity, dirs[entity.direction]) 
      }
      entity.activePath = false
      if (entity === scene.player && scene.newPos) {
        scene.newPos.setVisible(false)
      }
      return;
    }
    audio.playSound('playerStep', scene)
    const nextTile = path[i];
    const nextX = nextTile.x * scene.TILE_SIZE + scene.TILE_SIZE / 2;
    const nextY = nextTile.y * scene.TILE_SIZE + 16 / 2;
    tileID = scene.mapData[nextTile.y][nextTile.x]
    if (tileID === 3) {
      entity.setDepth(86)
    }
    const prevTile = path[i - 1];
    const dx = nextTile.x - prevTile.x;
    const dy = nextTile.y - prevTile.y;
    if (dy > 0) {
      entity.direction = 0
      entity.anims.play(`${entity.spriteKey}_walk_down`, true);
    } else if (dx < 0) {
      entity.direction = 1
      entity.anims.play(`${entity.spriteKey}_walk_left`, true);
    } else if (dx > 0) {
      entity.direction = 2
      entity.anims.play(`${entity.spriteKey}_walk_right`, true);
    } else if (dy < 0) {
      entity.direction = 3
      entity.anims.play(`${entity.spriteKey}_walk_up`, true);
    }
    entity.currentTween = scene.tweens.add({
      targets: entity,
      x: nextX,
      y: nextY,
      duration: 200,
      ease: 'Linear',
      onComplete: () => {
        if (tileID === 3) {
          entity.setDepth(86)
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

export function createEnergyBar(scene) {
  scene.energy = [100, 100];
  scene.energyBar = scene.add.sprite(0, 0, 'energyBar').setOrigin(0.5, 1).setDepth(1000);
  scene.energyBar.x = 30//scene.scale.width - scene.energyBar.width / 2 - 20;
  scene.energyBar.y = scene.scale.height - 20//scene.scale.height - 160;
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

export function getEnergyColor(current, max) {
  const percent = (current / max) * 100;
  if (percent > 50) return 0;
  else if (percent > 34) return 1;
  else if (percent > 19) return 2;
  else return 3;
}

export function showClock(scene, state) {
  if (state) {
    scene.calendar.setVisible(true);
    scene.calendar.y = -100; // Reset starting Y
    scene.tweens.add({
      targets: scene.calendar,
      y: 54,
      duration: 400,
      ease: 'Bounce.Out',
    });
  } else {
    scene.calendar.setVisible(false);
  }
}

export function createClock(scene) {
  scene.clockHide = true
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
  scene.timeSpeed = 3;         // 1 = real time; 2 = twice as fast
  scene.isTimePaused = false;
  scene.clock = scene.add.sprite(0, 0, 'dayNight')
    .setDepth(1000)

  const calendar = scene.add.sprite(0, 0, 'calendar');
  const dayText = scene.add.text(0, 7, 'Day 1', {
    fontFamily: 'DefaultFont',
    fontSize: '18px',
    stroke: '#3a3a50',
    strokeThickness: 4,
    fill: '#ffffff',
    padding: { x: 0, y: 0 }
  }).setOrigin(0.5, 0.5);

  scene.calendar = scene.add.container(70, 0, [scene.clock, calendar, dayText])
    .setDepth(1000)
    .setVisible(false)


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
    scene.clock.y = -29;
    scene.calendar.y = -100;
    scene.tweens.add({
      targets: scene.calendar,
      y: 54,
      duration: 400,
      ease: 'Bounce.Out',
    });

  }
}

export function skipToTime(scene, hour24) {
  const normalized = hour24 / 24;
  scene.timeElapsed = normalized * scene.dayLength;
};

export function flashFill(sprite, color = 0xffff00, flashCount = 2, flashDuration = 100) {
  if (sprite.isFlashing) return
  sprite.isFlashing = true
  const scene = sprite.scene;
  let count = 0;
  const flash = () => {
    sprite.setTintFill(color);
    scene.tweens.add({
      targets: sprite,
      alpha: 0.4,
      duration: flashDuration / 2,
      yoyo: true,
      ease: 'Sine.easeInOut',
      onYoyo: () => {
        sprite.clearTint();
      },
      onComplete: () => {
        count++;
        sprite.isFlashing = false
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
  const totalFrames = 10;
  if (!sprite.cooldownOverlay) {
    sprite.cooldownOverlay = scene.add.sprite(sprite.x, sprite.y, 'coolDownA');
    sprite.cooldownOverlay.setOrigin(0.5);
    sprite.cooldownOverlay.setDepth(sprite.depth - 1);
  }
  sprite.cooldownOverlay.setVisible(true);
  sprite.cooldownOverlay.setFrame(0);
  //  sprite.alpha = 0.5;
  const event = scene.time.addEvent({
    delay: interval,
    repeat: (duration / interval) - 1,
    callback: () => {
      elapsed += interval;
      const progress = Phaser.Math.Clamp(elapsed / duration, 0, 1);
      const frameIndex = Math.min(Math.floor(progress * 10), totalFrames - 1);
      sprite.cooldownOverlay.setFrame(frameIndex);
      sprite.cooldownOverlay.setPosition(sprite.x, sprite.y);
    },
    callbackScope: scene,
  });
  scene.time.delayedCall(duration + 50, () => {
    if (sprite.cooldownOverlay) {
      //sprite.cooldownOverlay.setVisible(false);
      sprite.cooldownOverlay.destroy()
      sprite.cooldownOverlay = null
    }
    // console.log(sprite.type);
    if (sprite.type !== null) {
      callSpecialFunction(scene, sprite.type);
    }
    sprite.alpha = 1;
    flashFill(sprite, 0xffffff, 2, 100);
    scene.time.delayedCall(200, () => {
      sprite.onCoolDown = false;
    });
  });
}

export function callSpecialFunction(scene, type) {
  if (type === "drink") {
    drinks.setCoffeeTableSprite(scene)
  }
}


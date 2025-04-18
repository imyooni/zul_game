
import * as audio from './audio.js';
import * as drinks from './drinks.js';
import * as player from './player.js';

export function createRoom(scene) {
  scene.roomBack = scene.add.sprite(scene.cameras.main.centerX, scene.cameras.main.centerY, 'room_background')
    .setDepth(-1)
    .setInteractive()
  scene.roomTop = scene.add.sprite(scene.cameras.main.centerX, scene.cameras.main.centerY, 'room_top')
    .setDepth(100)
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
  scene.timeSpeed = 1;         // 1 = real time; 2 = twice as fast
  scene.isTimePaused = false;
  scene.clock = scene.add.sprite(Math.floor(scene.scale.width / 2), 25, 'dayNight')
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
      overlay.fillStyle(0x7FFFD4,0.35); 
      overlay.lineStyle(2,0x2F4F4F,1); 
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
  scene.time.delayedCall(duration + 50, () => {
    if (sprite.cooldownOverlay) {
      sprite.cooldownOverlay.destroy(); 
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
  });
}

export function callSpecialFunction(scene,type){
  if (type === "drink") {
  drinks.setCoffeeTableSprite(scene)
  }
}


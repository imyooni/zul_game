
import * as audio from './audio.js';
import * as gameSystem from './gameSystem.js';
import * as SaveGame from './SaveGame.js';
import * as lang from './lang.js';



export function generateClient(scene) {
  if (scene.dayPhase != 'active') return
  const delay = 1000 //Phaser.Math.Between(10000, 30000);
  scene.time.addEvent({
    delay: delay,
    callback: () => {
      if (Math.random() < 0.55) {
        spawnClient(scene);
      } else {
        //   console.log("spawn failed")
      }
      generateClient(scene);
    }
  });
}

export function spawnClient(scene) {
  if (scene.clients.length > 0) return
  audio.playSound('doorBell', scene);
  let tempclient = scene.add.sprite(0 * scene.TILE_SIZE + 16, 21 * scene.TILE_SIZE + 16 / 2, 'npc1')
  tempclient.spriteKey = 'npc1'
  tempclient.pauseTimer = false
  tempclient.setInteractive()
  tempclient.on('pointerdown', (pointer) => {
    let tileX = Math.floor(scene.player.x / scene.TILE_SIZE)
    let tileY = Math.floor((scene.player.y + scene.player.height / 2) / scene.TILE_SIZE) - 1
    let inRange = scene.mapData[tileY][tileX] === 6
    if (!inRange || scene.player.activePath || tempclient.activePath) return
    tempclient.pauseTimer = true
    showTickets(scene)
  });
  scene.time.delayedCall(1, () => {
    gameSystem.entityPath(scene, tempclient, 21, 4, 'up')
    clientTime(scene, tempclient, (60 * 3) * 1000)
  })
  scene.clients.push(tempclient)
}

export function showTickets(scene) {
  scene.player.pauseMovement = true
  if (scene.tickets) {
    scene.tickets.forEach(t => {
      t.destroy()
    });
  }
  scene.tickets = [];
  const ticketCount = Phaser.Math.Between(2, 4);
  audio.playSound('tickets', scene);
  for (let i = 0; i < ticketCount; i++) {
    let ticket = generateTicket(scene, ticketCount, i)
    scene.tickets.push(ticket);
  }
}

function generateTicket(scene, ticketCount, i) {
  let Colors = ['#cd7f32', '#c0c0c0', '#ffd700', '#f1e3ff', '#b9f2ff']
  const ticketSpacing = 55;
  const totalHeight = (ticketCount - 1) * ticketSpacing;
  const centerX = scene.cameras.main.centerX;
  const centerY = scene.cameras.main.centerY;
  let ID = Phaser.Math.Between(0, 4)
  let types = ["bronze", "silver", "gold", "platinum", "diamond"]
  let fontS 
  if (SaveGame.loadGameValue('language') === 'kor') {
   fontS = 13
  } else {
   fontS = 12
  }
  const offsetY = -totalHeight / 2 + i * ticketSpacing;
  const ticketBase = scene.add.sprite(0, 0, 'tickets', ID)
    .setInteractive();
  const ticketTitle = scene.add.text(0, 0, `${lang.Text('concert')}`, {
    fontFamily: 'DefaultFont',
    fontSize: `${fontS}px`,
    stroke: '#3a3a50',
    strokeThickness: 4,
    color: '#ebe4f2',
    padding: { top: 8, bottom: 4 },
    align: 'right'
  })
  ticketTitle.setPosition(-125, -27)
  const ticketType = scene.add.text(0, 0, `${lang.Text(types[ID])}`, {
    fontFamily: 'DefaultFont',
    fontSize: `${fontS}px`,
    stroke: '#3a3a50',
    strokeThickness: 4,
    color: Colors[ID],
    padding: { top: 8, bottom: 4 },
    align: 'right'
  })
  ticketType.setPosition(0, -3)
  const probability = Phaser.Math.Between(1, 100);
  const procColors = ['#FF0000', '#FF8C00', '#FFFF00', '#ADFF2F'];
  const thresholds = [25, 50, 75];

  const colorIndex = thresholds.filter(t => probability > t).length;
  const color = procColors[colorIndex];

  const procText = scene.add.text(0, 0, `${probability}%`, {
    fontFamily: 'DefaultFont',
    fontSize: '16px',
    stroke: '#3a3a50',
    strokeThickness: 4,
    color: color,
    padding: { top: 8, bottom: 4 },
    align: 'center'
  });

procText.setOrigin(0.5, 0.5);
procText.setPosition(98, -3); // Adjust these to match your circle's exact center

  const ticketContainer = scene.add.container(-100, centerY + offsetY, [ticketBase, ticketTitle, ticketType, procText])
    .setDepth(5000)
  scene.tweens.add({
    targets: ticketContainer,
    x: centerX,
    duration: 800,
    ease: 'Back.Out',
    onComplete: () => {
        scene.tweens.add({
        targets: ticketContainer,
        y: ticketContainer.y - 3,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  });
  return ticketContainer
}


export function clientTime(scene, client, duration = 2000) {
  let elapsed = 0;
  const interval = 16;
  const totalFrames = 10;
  if (!client.timeOverlay) {
    client.timeOverlay = scene.add.sprite(client.x, client.y, 'clientStatus');
    client.timeOverlay.setOrigin(0.5, 1.5);
    client.timeOverlay.setDepth(105);
    scene.tweens.add({
      targets: client.timeOverlay,
      y: client.timeOverlay.y - 5,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
  client.timeOverlay.setVisible(true);
  client.timeOverlay.setFrame(0);
  const event = scene.time.addEvent({
    delay: interval,
    repeat: (duration / interval) - 1,
    callback: () => {
      if (client.activePath || client.pauseTimer) {

      } else {
        elapsed += interval;
      }
      const progress = Phaser.Math.Clamp(elapsed / duration, 0, 1);
      const frameIndex = Math.min(Math.floor(progress * 10), totalFrames - 1);
      client.timeOverlay.setFrame(frameIndex);
      client.timeOverlay.setPosition(client.x, client.y);
    },
    callbackScope: scene,
  });
  scene.time.delayedCall(duration + 50, () => {
    if (client.timeOverlay) {
      client.timeOverlay.destroy()
      client.timeOverlay = null
    }
    // if (client.type !== null) {
    // callSpecialFunction(scene, client.type);
    // }
    // client.alpha = 1;
    // flashFill(client, 0xffffff, 2, 100);
    scene.time.delayedCall(200, () => {
      // client.onCoolDown = false;
    });
  });
}


export function createCars(scene) {
  scene.spawnCars = true
  scene.activeCars = {
    car1: null,
    car2: null
  };
}

export function carsInit(scene) {
  createCars(scene)
  scene.time.delayedCall(1000, () => {
    scheduleCarSpawn(scene, 'car1');
    scheduleCarSpawn(scene, 'car2');
  });
}

export function scheduleCarSpawn(scene, carType) {
  const delay = Phaser.Math.Between(3000, 5000);
  scene.time.addEvent({
    delay: delay,
    callback: () => {
      if (!scene.spawnCars) return;
      if (!scene.activeCars[carType] && Math.random() < 0.55) {
        spawnCar(scene, carType);
      }
      if (scene.spawnCars) {
        scheduleCarSpawn(scene, carType);
      }
    }
  });
}

export function spawnCar(scene, carType) {
  let y
  let car;
  let carSprites
  if (carType === 'car1') {
    carSprites = ["car1", "car2", "car3", "car4"]
    let newSprite = carSprites[Math.floor(Math.random() * carSprites.length)]
    y = 2 * scene.TILE_SIZE + scene.TILE_SIZE / 2;
    car = scene.add.sprite(-64, y, newSprite);
    car.flipX = false
    car.x = -car.width
  } else if (carType === 'car2') {
    carSprites = ["car0", "car1", "car2", "car3", "car4"]
    let newSprite = carSprites[Math.floor(Math.random() * carSprites.length)]
    y = 3.5 * scene.TILE_SIZE + scene.TILE_SIZE / 2;
    car = scene.add.sprite(scene.scale.width + 64, y, newSprite);
    car.flipX = true
    car.x = scene.scale.width + car.width
  }
  car.setDepth(Math.floor(y / 32))
  scene.activeCars[carType] = car;
  const toX = carType === 'car1' ? scene.scale.width + car.width : -car.width;
  scene.tweens.add({
    targets: car,
    x: toX,
    duration: 4000,
    ease: 'Linear',
    onComplete: () => {
      car.destroy();
      scene.activeCars[carType] = null;
    }
  });
}

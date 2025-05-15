
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
  tempclient._timerRunning = false
  tempclient.setInteractive()
  tempclient.on('pointerdown', (pointer) => {
    let tileX = Math.floor(scene.player.x / scene.TILE_SIZE)
    let tileY = Math.floor((scene.player.y + scene.player.height / 2) / scene.TILE_SIZE) - 1
    let inRange = scene.mapData[tileY][tileX] === 6
    if (!inRange || scene.player.activePath || tempclient.activePath) return
    if (!tempclient.pauseTimer) {
      tempclient.pauseTimer = true
    }
    showTickets(scene)
  });
  scene.time.delayedCall(1, () => {
    gameSystem.entityPath(scene, tempclient, 21, 4, 'up')
    clientTime(scene, tempclient, 60 * 1000);
  })
  scene.clients.push(tempclient)
}

export function showTickets(scene) {
  scene.currentTicket = null
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
  let Colors = ['#DC143C', '#cd7f32', '#c0c0c0', '#ffd700', '#f1e3ff', '#b9f2ff']
  const ticketSpacing = 55;
  const totalHeight = (ticketCount - 1) * ticketSpacing;
  const centerX = scene.cameras.main.centerX;
  const centerY = scene.cameras.main.centerY;
  let ticketID = randomTicketType(scene, i)
  let types = ["basic", "bronze", "silver", "gold", "platinum", "diamond"]
  let fontS
  if (SaveGame.loadGameValue('language') === 'kor') {
    fontS = 14
  } else {
    fontS = 12
  }
  const offsetY = -totalHeight / 2 + i * ticketSpacing;
  const ticketBase = scene.add.sprite(0, 0, 'tickets', types.indexOf(ticketID.type))
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
  const ticketType = scene.add.text(0, 0, `${lang.Text(ticketID.type)}`, {
    fontFamily: 'DefaultFont',
    fontSize: `${fontS}px`,
    stroke: '#3a3a50',
    strokeThickness: 4,
    color: Colors[types.indexOf(ticketID.type)],
    padding: { top: 8, bottom: 4 },
    align: 'right'
  })
  ticketType.setPosition(0, -3)
  const probability = ticketID.per
  const procColors = ['#FF0000', '#FF8C00', '#FFFF00', '#00FF00', '#6495ED'];
  const thresholds = [25, 49, 75, 99];
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
  procText.setPosition(98, -3);
  const ticketValue = scene.add.text(0, 0, `$${ticketID.value}`, {
    fontFamily: 'DefaultFont',
    fontSize: `16px`,
    stroke: '#3a3a50',
    strokeThickness: 4,
    color: '#9ACD32',
    padding: { top: 8, bottom: 4 },
    align: 'right'
  })
  ticketValue.setPosition(-123, -8)
  const ticketContainer = scene.add.container(-100, centerY + offsetY, [ticketBase, ticketTitle, ticketType, procText, ticketValue])
    .setDepth(5000);
  scene.ticketsPaused = false
  ticketContainer.enabled = true
  ticketContainer.setSize(ticketBase.width, ticketBase.height);
  scene.tweens.add({
    targets: ticketContainer,
    x: centerX,
    duration: 800,
    ease: 'Back.Out',
    onComplete: () => {
      if (ticketContainer && ticketContainer.active) {
        ticketContainer.setInteractive();
      }
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
  ticketContainer.on('pointerdown', (pointer) => {
    if (scene.ticketsPaused || !ticketContainer.enabled) return;
    audio.playSound('systemClick', scene);
    scene.ticketsPaused = true;
    const prevTicket = scene.currentTicket;
    if (prevTicket && prevTicket === ticketContainer) {
      ticketContainer.enabled = false;
      scene.tweens.add({
        targets: ticketContainer,
        x: ticketContainer.x - 20,
        duration: 300,
        ease: 'Back.Out',
        onComplete: () => {
          ticketContainer.enabled = true;
        }
      });
      if (scene.ticketConfirmation) {
        const toDestroy = scene.ticketConfirmation;
        const destroyX = toDestroy.x;
        scene.tweens.add({
          targets: toDestroy,
          x: destroyX + 40,
          duration: 300,
          ease: 'Back.Out',
          onComplete: () => {
            if (scene.ticketConfirmation === toDestroy) {
              toDestroy.destroy();
              scene.ticketConfirmation = null;
            }
          }
        });
      }
      scene.currentTicket = null;
      scene.ticketsPaused = false;
      return;
    }
    if (prevTicket && prevTicket !== ticketContainer) {
      prevTicket.enabled = false;
      scene.tweens.add({
        targets: prevTicket,
        x: prevTicket.x - 20,
        duration: 300,
        ease: 'Back.Out',
        onComplete: () => {
          prevTicket.enabled = true;
        }
      });
    }
    if (scene.ticketConfirmation) {
      scene.ticketConfirmation.destroy();
      scene.ticketConfirmation = null;
    }
    scene.ticketConfirmation = scene.add.image(
      ticketContainer.x - 90,
      ticketContainer.y,
      'confirmButton'
    );
    scene.ticketConfirmation
      .setDepth(ticketContainer.depth - 1)
      .setInteractive()
    scene.ticketConfirmation.ID = ticketContainer
    scene.ticketConfirmation.on('pointerdown', (pointer) => {
      if (scene.ticketsPaused) return
      scene.ticketsPaused = true
      audio.playSound('systemOk', scene);
      gameSystem.flashFill(scene.ticketConfirmation, 0xadd66f, 1, 300)
      scene.time.delayedCall(300, () => {
        scene.tweens.add({
          targets: scene.ticketConfirmation,
          alpha: 0,
          duration: 100,
          ease: 'Power1',
          onComplete: () => {
            const centerY = scene.cameras.main.centerY;
            const offsetY = -((0) * ticketSpacing) / 2 + 0 * ticketSpacing;
            scene.tweens.getTweensOf(ticketContainer).forEach(tween => tween.pause());
            scene.tweens.add({
              targets: ticketContainer,
              y: centerY + offsetY,
              duration: 400,
              ease: 'Sine.easeInOut',
              onComplete: () => {
                scene.time.delayedCall(350, () => {
                  ticketContainer.list.forEach(child => {
                    gameSystem.flashFill(child, 0x00FF00, 1, 300)
                  });
                })
              }
            });

            scene.tickets.forEach(t => {
              if (t != scene.ticketConfirmation.ID) {
                scene.tweens.add({
                  targets: t,
                  alpha: 0,
                  duration: 300,
                  ease: 'Power1'
                });
              }

            });

          }
        });

      })


    })

    scene.tweens.add({
      targets: scene.ticketConfirmation,
      x: scene.ticketConfirmation.x - 40,
      duration: 300,
      ease: 'Back.Out'
    });

    scene.currentTicket = ticketContainer;
    scene.tweens.add({
      targets: ticketContainer,
      x: ticketContainer.x + 20,
      duration: 300,
      ease: 'Back.Out',
      onComplete: () => {
        scene.ticketsPaused = false;
        ticketContainer.enabled = true;
      }
    });
  });

  return ticketContainer
}

function randomTicketType(scene, i) {
  let ticketList = [];
  let list = {
    bronze: { probability: 1, percentage: [100, 90], value: [3, 5] },
    silver: { probability: 0.8, percentage: [100, 80], value: [4, 8] },
    gold: { probability: 0.55, percentage: [90, 70], value: [6, 10] },
    platinum: { probability: 0.20, percentage: [75, 40], value: [10, 15] },
    diamond: { probability: 0.05, percentage: [60, 5], value: [18, 25] },
  };

  if (i === 0) {
    ticketList.push({ type: 'basic', per: 100, value: Phaser.Math.Between(2, 3) });
  } else {
    Object.entries(list).forEach(([key, v]) => {
      if (Math.random() < v.probability) {
        let per = Phaser.Math.Between(v.percentage[0], v.percentage[1])
        let value = Phaser.Math.Between(v.value[0], v.value[1])
        ticketList.push({ type: key, per, value });
      }
    });
  }
  const randomIndex = Math.floor(Math.random() * ticketList.length);
  const selectedTicket = ticketList[randomIndex];
  return selectedTicket;
}


export function clientTime(scene, client, duration = 2000) {
  // Prevent multiple timers
  if (client._timerRunning) return;

  client._timerRunning = true;

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
  client.timeOverlay.setFrame(0);  // This is safe now because it only happens once

  const timerEvent = scene.time.addEvent({
    delay: interval,
    loop: true,
    callback: () => {
      if (!(client.activePath || client.pauseTimer)) {
        elapsed += interval;
      }

      const progress = Phaser.Math.Clamp(elapsed / duration, 0, 1);
      const frameIndex = Math.min(Math.floor(progress * 10), totalFrames - 1);

      client.timeOverlay.setFrame(frameIndex);
      if (!client.pauseTimer) {
        client.timeOverlay.setPosition(client.x, client.y);
      }

      if (elapsed >= duration) {
        timerEvent.remove();
        if (client.timeOverlay) {
          client.timeOverlay.destroy();
          client.timeOverlay = null;
        }
        client._timerRunning = false;

        scene.time.delayedCall(200, () => {
          // client.onCoolDown = false;
        });
      }
    },
    callbackScope: scene
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

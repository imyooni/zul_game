
import * as audio from './audio.js';
import * as gameSystem from './gameSystem.js';
import * as SaveGame from './SaveGame.js';
import * as lang from './lang.js';



export function generateClient(scene) {
  if (scene.dayPhase != 'active') return
  const delay = 1000//Phaser.Math.Between(7000, 10000);
  scene.time.addEvent({
    delay: delay,
    callback: () => {
      if (Math.random() < 0.55) {
        if (scene.usedChairs.length < 18 && scene.clientsWaiting.length < 4) {
          spawnClient(scene);
        }
      } else {
        //   console.log("spawn failed")
      }
      generateClient(scene);
    }
  });
}

export function spawnClient(scene) {
  let yPos = [21, 22]
  let randomY = yPos[Math.floor(Math.random() * yPos.length)];
  audio.playSound('doorBell', scene);
  let tempclient = scene.add.sprite(0 * scene.TILE_SIZE + 16, randomY * scene.TILE_SIZE + 16 / 2, 'npc1')
  tempclient.spriteKey = 'npc1'
  tempclient.pauseTimer = false
  tempclient.timeOut = false
  tempclient.action = 'spawn'
  tempclient._timerRunning = false
  tempclient.positionData = { waiting: null, chair: null }
  tempclient.setInteractive()
  tempclient.on('pointerdown', (pointer) => {
    let tileX = Math.floor(scene.player.x / scene.TILE_SIZE)
    let tileY = Math.floor((scene.player.y + scene.player.height / 2) / scene.TILE_SIZE) - 1
    let inRange = scene.mapData[tileY][tileX] === 6
    if (!inRange || scene.player.activePath || tempclient.activePath) return
    if (tempclient.action !== 'tickets') return
    if (scene.currentClient !== null) return
    if (tempclient.timeOut) return
    tempclient.pauseTimer = true
    tempclient.action = 'ticketSelection'
    scene.currentClient = tempclient
    showTickets(scene)
  });
  scene.time.delayedCall(1, () => {
    let randomSpace = getWaitingPosition(scene)
    tempclient.positionData.waiting = randomSpace
    gameSystem.entityPath(scene, tempclient, randomSpace[0], randomSpace[1], 'up', 'waiting')
  })
  scene.clients.push(tempclient)
}

export function setClientMask(scene, client) {
  client.setCrop(0, 0, client.width, 16);
}

export function showTickets(scene) {
  scene.currentTicket = null
  scene.player.pauseMovement = true
  gameSystem.changeEntityDir(scene.player, 'down')
  clearTickets(scene)
  const ticketCount = Phaser.Math.Between(2, 4);
  audio.playSound('tickets', scene);
  for (let i = 0; i < ticketCount; i++) {
    let ticket = generateTicket(scene, ticketCount, i)
    scene.tickets.push(ticket);
  }
}

function clearTickets(scene) {
  if (scene.tickets) {
    scene.tickets.forEach(t => {
      t.destroy()
    });
  }
  scene.tickets = [];
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
  let strokeT = 4
  if (SaveGame.loadGameValue('language') === 'kor') {
    fontS = 13
  } else {
    fontS = 12
  }
  const offsetY = -totalHeight / 2 + i * ticketSpacing;
  const ticketBase = scene.add.sprite(0, 0, 'tickets', types.indexOf(ticketID.type))
  const ticketTitle = scene.add.text(0, 0, `${lang.Text('concert')}`, {
    fontFamily: 'DefaultFont',
    fontSize: `${fontS}px`,
    stroke: '#3a3a50',
    strokeThickness: strokeT,
    color: '#ebe4f2',
    padding: { top: 8, bottom: 4 },
    align: 'right'
  })
  ticketTitle.setPosition(-125, -27)
  const ticketType = scene.add.text(0, 0, `${lang.Text(ticketID.type)}`, {
    fontFamily: 'DefaultFont',
    fontSize: `${fontS}px`,
    stroke: '#3a3a50',
    strokeThickness: strokeT,
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
    strokeThickness: strokeT,
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
    strokeThickness: strokeT,
    color: '#9ACD32',
    padding: { top: 8, bottom: 4 },
    align: 'right'
  })
  ticketValue.setPosition(-123, -8)
  const ticketContainer = scene.add.container(-100, centerY + offsetY, [ticketBase, ticketTitle, ticketType, procText, ticketValue])
    .setDepth(5000);
  scene.ticketsPaused = false
  ticketContainer.enabled = true
  ticketContainer.info = ticketID
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
                  let success = getTicketChance(scene, ticketContainer.info.per)
                  let price = ticketContainer.info.value
                  let color
                  if (success) {
                    color = 0x00FF00
                    audio.playSound('systemSuccess', scene)
                    let value = SaveGame.loadGameValue('money') + price
                    gameSystem.updateMoneyValueAnimated(scene, value);
                  } else {
                    color = 0xFF0000
                    audio.playSound('systemFailed', scene)
                  }
                  ticketContainer.list.forEach(child => {
                    gameSystem.flashFill(child, color, 1, 300)
                  });
                  scene.time.delayedCall(450, () => {
                    scene.tweens.add({
                      targets: ticketContainer,
                      alpha: 0,
                      duration: 300,
                      ease: 'Power1',
                      onComplete: () => {
                        if (success) {
                          setClientChair(scene)
                        } else {
                          scene.currentClient.pauseTimer = false
                          let waitPos = scene.currentClient.positionData.waiting
                          scene.clientsWaiting = scene.clientsWaiting.filter(item => !(item.length === waitPos.length && item.every((val, index) => val === waitPos[index])));
                          let yPos = [21, 22]
                          let randomY = yPos[Math.floor(Math.random() * yPos.length)];

                          scene.currentClient.timeOut = true
                          scene.currentClient.timerEvent.remove();
                            if (scene.currentClient.timeOverlay) {
                              scene.currentClient.timeOverlay.destroy();
                              scene.currentClient.timeOverlay = null;
                            }
                          scene.currentClient._timerRunning = false;

                          gameSystem.entityPath(scene, scene.currentClient, randomY, 0, 'left', 'exitA')
                        }
                        resumePlayerMovement(scene)
                      }
                    });
                  })

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

function resumePlayerMovement(scene) {
  scene.currentTicket = null
  scene.player.pauseMovement = false
  clearTickets(scene)
}

function getWaitingPosition(scene) {
  let spaces = [
    [21, 2], [21, 3], [21, 4], [21, 5]
  ];
  let availableSpaces = spaces.filter(s => {
    return !scene.clientsWaiting.some(used => used[0] === s[0] && used[1] === s[1]);
  });
  let randomSpace = availableSpaces[Math.floor(Math.random() * availableSpaces.length)];
  scene.clientsWaiting.push(randomSpace);
  return randomSpace
}

function setClientChair(scene) {
  let chairs = [
    [11, 1], [11, 2], [11, 3], [11, 4], [11, 5], [11, 6],
    [13, 1], [13, 2], [13, 3], [13, 4], [13, 5], [13, 6],
    [15, 1], [15, 2], [15, 3], [15, 4], [15, 5], [15, 6]
  ];
  let availableChairs = chairs.filter(chair => {
    return !scene.usedChairs.some(used => used[0] === chair[0] && used[1] === chair[1]);
  });
  let randomChair = availableChairs[Math.floor(Math.random() * availableChairs.length)];
  scene.usedChairs.push(randomChair);
  scene.currentClient.pauseTimer = false
  scene.currentClient.positionData.chair = randomChair
  let waitPos = scene.currentClient.positionData.waiting
  scene.clientsWaiting = scene.clientsWaiting.filter(item => !(item.length === waitPos.length && item.every((val, index) => val === waitPos[index])));
  gameSystem.entityPath(scene, scene.currentClient, randomChair[0], randomChair[1], 'up', 'chair')
  scene.currentClient = null
}

function getTicketChance(scene, chance) {
  return Math.random() < (chance / 100);
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
  if (client._timerRunning) return;
  client._timerRunning = true;

  let elapsed = 0;
  const interval = 16;
  const totalFrames = 10;
  const yOffset = -20;
  let hasFinished = false; // <--- One-time execution flag

  if (!client.timeOverlay) {
    client.timeOverlay = scene.add.sprite(client.x, client.y + yOffset, 'clientStatus');
    client.timeOverlay.setOrigin(0.5, 1);
    client.timeOverlay.setDepth(105);
    client.timeOverlay.setVisible(true);
    client.timeOverlay.setFrame(0);
  }

  const lerpSpeed = 1;
  client.timerEvent = scene.time.addEvent({
    delay: interval,
    loop: true,
    callback: () => {
      if (!(client.activePath || client.pauseTimer)) {
        elapsed += interval;
      }

      const progress = Phaser.Math.Clamp(elapsed / duration, 0, 1);
      const frameIndex = Math.min(Math.floor(progress * totalFrames), totalFrames - 1);
      client.timeOverlay.setFrame(frameIndex);

      if (!client.pauseTimer && client.timeOverlay) {
        const targetX = client.x;
        const targetY = client.y + yOffset;
        client.timeOverlay.x = Phaser.Math.Linear(client.timeOverlay.x, targetX, lerpSpeed);
        client.timeOverlay.y = Phaser.Math.Linear(client.timeOverlay.y, targetY, lerpSpeed);
      }

      if (elapsed >= duration && !hasFinished) {
        client.timeOut = true
        hasFinished = true; // <--- Prevent future executions
        client.timeOverlay.setFrame(10);
        scene.time.delayedCall(100, () => {
          client.timerEvent.remove();
          if (client.timeOverlay) {
            client.timeOverlay.destroy();
            client.timeOverlay = null;
          }
          client._timerRunning = false;
          console.log(client.action);
          if (client.action === 'tickets') {
            let waitPos = client.positionData.waiting
            scene.clientsWaiting = scene.clientsWaiting.filter(item => !(item.length === waitPos.length && item.every((val, index) => val === waitPos[index])));
            let yPos = [21, 22]
            let randomY = yPos[Math.floor(Math.random() * yPos.length)];
            gameSystem.entityPath(scene, client, randomY, 0, 'left', 'exitA')
          } else if (client.action === 'chair') {
            client.action = 'chairExit'
            let chairPos = client.positionData.chair
            scene.usedChairs = scene.usedChairs.filter(item => !(item.length === chairPos.length && item.every((val, index) => val === chairPos[index])));
            client.setCrop()
            client.setDepth(5)
            gameSystem.entityPath(scene, client, 6, 8, 'left', 'exitB')
          }
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

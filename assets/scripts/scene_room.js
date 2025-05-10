  
import * as audio from './audio.js';
import * as gameSystem from './gameSystem.js';



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

  export function spawnClient(scene){
    if (scene.clients.length > 0) return
    audio.playSound('doorBell', scene);
    let tempclient = scene.add.sprite(0 * scene.TILE_SIZE + 16, 21 * scene.TILE_SIZE + 16 / 2, 'npc1')
    tempclient.spriteKey = 'npc1'
    scene.time.delayedCall(1, () => {
      gameSystem.entityPath(scene,tempclient,21,4,'up')
      clientTime(scene, tempclient, (60*3)*1000)
    }) 
    scene.clients.push(tempclient)

   // console.log("client spawned")
  }

  export function clientTime(scene, sprite, duration = 2000) {
    let elapsed = 0;
    const interval = 16;
    const totalFrames = 10;
    if (!sprite.timeOverlay) {
      sprite.timeOverlay = scene.add.sprite(sprite.x, sprite.y, 'clientStatus');
      sprite.timeOverlay.setOrigin(0.5,1.5);
      sprite.timeOverlay.setDepth(105);
      scene.tweens.add({
        targets: sprite.timeOverlay,
        y: sprite.timeOverlay.y - 5,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
    sprite.timeOverlay.setVisible(true);
    sprite.timeOverlay.setFrame(0);
    const event = scene.time.addEvent({
      delay: interval,
      repeat: (duration / interval) - 1,
      callback: () => {
        elapsed += interval;
        const progress = Phaser.Math.Clamp(elapsed / duration, 0, 1);
        const frameIndex = Math.min(Math.floor(progress * 10), totalFrames - 1);
        sprite.timeOverlay.setFrame(frameIndex);
        sprite.timeOverlay.setPosition(sprite.x, sprite.y);
      },
      callbackScope: scene,
    });
    scene.time.delayedCall(duration + 50, () => {
      if (sprite.timeOverlay) {
        sprite.timeOverlay.destroy()
        sprite.timeOverlay = null
      }
     // if (sprite.type !== null) {
       // callSpecialFunction(scene, sprite.type);
     // }
     // sprite.alpha = 1;
     // flashFill(sprite, 0xffffff, 2, 100);
      scene.time.delayedCall(200, () => {
       // sprite.onCoolDown = false;
      });
    });
  }


  export function createCars(scene){
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
      carSprites = ["car1","car2","car3","car4"]
      let newSprite = carSprites[Math.floor(Math.random() * carSprites.length)]
      y = 2 * scene.TILE_SIZE + scene.TILE_SIZE / 2;
      car = scene.add.sprite(-64, y, newSprite);
      car.flipX = false
      car.x = -car.width
    } else if (carType === 'car2') {
      carSprites = ["car0","car1","car2","car3","car4"]
      let newSprite = carSprites[Math.floor(Math.random() * carSprites.length)]
      y = 3.5 * scene.TILE_SIZE + scene.TILE_SIZE / 2;
      car = scene.add.sprite(scene.scale.width + 64, y, newSprite);
      car.flipX = true
      car.x = scene.scale.width+car.width
    }
    car.setDepth(Math.floor(y/32))
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
  
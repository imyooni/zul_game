  export function createCars(scene){
    scene.spawnCars = true
    scene.activeCars = {
        car1: null,
        car2: null
      };
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
  
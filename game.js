import * as sprites from './assets/scripts/sprites.js';
import * as audio from './assets/scripts/audio.js';
import * as gameSystem from './assets/scripts/gameSystem.js';

const TILE_SIZE = 32;
const map_width = 12;
const map_height = 23;
//let activePath = false;
let npcs = [];
let npcMovementFlags = [];  // Track whether an NPC is currently moving


document.addEventListener('contextmenu', (event) => {
   event.preventDefault();
});

const config = {
  type: Phaser.AUTO,
  width: 384,
  height: 736,
  parent: 'game-container',
  pixelArt: true,
  backgroundColor: 'transparent',
  transparent: true,
  scene: {
    preload,
    create,
    update
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};



const game = new Phaser.Game(config);

// ✅ Generate map data (0 = walkable, 1 = blocked)


function preload() {
  audio.load_audio(this)
  sprites.load_sprites(this);
}

let activeCars = {
  car1: null,
  car2: null
};

// ██████████████████ //
//     UPDATE         //
// ██████████████████ //
function update(time, delta) {
  if (this.easystar) {
    this.easystar.calculate(); // ✅ Pathfinding
  }
  gameSystem.dayNightCycle(this,delta)
}


function create() {

  sprites.load_animations(this);
  gameSystem.set_tilemap(this)
  //drawTilemap(this, mapData);
  //drawDebugGrid(this);




this.getCurrentTime = function() {
  const dayProgress = (this.timeElapsed % this.dayLength) / this.dayLength;
  const hour = Math.floor(dayProgress * 24);
  const minute = Math.floor((dayProgress * 24 - hour) * 60);
  return { hour, minute };
};

this.bgm = this.sound.add('bgm001', { loop: true, volume: 0.35 });
this.bgm.play();

this.input.keyboard.on('keydown-T', () => {
  gameSystem.skipToTime(this,15); 
  //const time = this.getCurrentTime();
 // console.log(`🕒 ${time.hour}:${String(time.minute).padStart(2, "0")}`);
});


  gameSystem.createPlayer(this)
  gameSystem.createRoom(this)
  gameSystem.createEnergyBar(this)
  gameSystem.createClock(this)
  gameSystem.skipToTime(this,15); 


  let car1 = this.add.sprite(0, 2 * TILE_SIZE + TILE_SIZE / 2,'car1')
  car1.x = -car1.width
  car1.setDepth(2 * TILE_SIZE + TILE_SIZE / 2)

  let car2 = this.add.sprite(0, 4 * TILE_SIZE + TILE_SIZE / 2,'car2')
  car2.x = config.width+car2.width
  car2.setDepth(4 * TILE_SIZE + TILE_SIZE / 2)

  
  

      const npc = this.add.sprite(0 * TILE_SIZE + TILE_SIZE / 2, 21 * TILE_SIZE + 16 / 2, 'npc1');
      npc.direction = 2
      npc.spriteKey = "npc1"
      npc.setFrame(7);  // Use first frame for NPC
      npc.setDepth(1);
      npcs.push(npc);  // Add NPC to npcs array
      npcMovementFlags.push(false);  // Add movement flag (false: not moving)
   
    //  MoveNpcTo(this,0,6,11,3)


    scheduleCarSpawn(this, 'car1');
    scheduleCarSpawn(this, 'car2');

    
  
}

function scheduleCarSpawn(scene, carType) {
  const delay = Phaser.Math.Between(3000, 5000); // 3–10 seconds

  scene.time.addEvent({
    delay: delay,
    callback: () => {
      if (!activeCars[carType] && Math.random() < 0.55) {
        spawnCar(scene, carType);
      }
      scheduleCarSpawn(scene, carType); // Loop again
    }
  });
}
function spawnCar(scene, carType) {
  let y
  let car;
  let carSprites

  if (carType === 'car1') {
    carSprites = ["car1","car2","car3","car4"]
    let newSprite = carSprites[Math.floor(Math.random() * carSprites.length)]
    y = 2 * TILE_SIZE + TILE_SIZE / 2;
    car = scene.add.sprite(-64, y, newSprite);
    car.flipX = false
    car.x = -car.width
  } else if (carType === 'car2') {
    carSprites = ["car0","car1","car2","car3","car4"]
    let newSprite = carSprites[Math.floor(Math.random() * carSprites.length)]
    y = 3.5 * TILE_SIZE + TILE_SIZE / 2;
    car = scene.add.sprite(config.width + 64, y, newSprite);
    car.flipX = true
    car.x = config.width+car.width
  }
  car.setDepth(Math.floor(y/32))

  activeCars[carType] = car;

  const toX = carType === 'car1' ? config.width + car.width : -car.width;

  scene.tweens.add({
    targets: car,
    x: toX,
    duration: 4000,
    ease: 'Linear',
    onComplete: () => {
      car.destroy();
      activeCars[carType] = null;
    }
  });
}




  





function MoveNpcTo(scene,npcIndex,x,y,finaldir = null){
  const targetX = Math.floor(x);
  const targetY = Math.floor(y);

  const npc = npcs[npcIndex];
  const currentX = Math.floor(npc.x / TILE_SIZE);
  const currentY = Math.floor(npc.y / TILE_SIZE);

  const tempPathfinder = new EasyStar.js();
    tempPathfinder.setGrid(mapData);
    tempPathfinder.setAcceptableTiles([0,2]);

    tempPathfinder.findPath(currentX, currentY, targetX, targetY, (path) => {
      if (path && path.length > 1) {
        moveNPCAlongPath(scene, npc, path, npcIndex,finaldir);
      }
    });

    tempPathfinder.calculate();
}


function moveNPCAlongPath(scene, npc, path, npcIndex, finaldir = null) {
  let i = 1;

  function moveNext() {
    if (i >= path.length) {
      npc.anims.stop();
      let dirs = [1,4,7,10]
      if (finaldir != null) {
        npc.direction = finaldir
      }
      npc.setFrame(dirs[npc.direction])
      npcMovementFlags[npcIndex] = false;
      return;
    }

    // Calculate movement direction
    const prevTile = path[i - 1];  // Previous tile
    const nextTile = path[i];
    const dx = nextTile.x - prevTile.x;
    const dy = nextTile.y - prevTile.y;
    const nextX = nextTile.x * TILE_SIZE + TILE_SIZE / 2;
    const nextY = nextTile.y * TILE_SIZE + 16 / 2;

    npc.setDepth(nextTile.y)
    // Determine movement direction and play corresponding animation
    if (dy > 0) {
      // Moving down
      npc.direction = 0
      npc.anims.play(`${npc.spriteKey}_walk_down`, true);
    } else if (dx < 0) {
      // Moving left
      npc.direction = 1
      npc.anims.play(`${npc.spriteKey}_walk_left`, true);
    } else if (dx > 0) {
      // Moving right
      npc.direction = 2
      npc.anims.play(`${npc.spriteKey}_walk_right`, true);
    } else if (dy < 0) {
      // Moving up
      npc.direction = 3
      npc.anims.play(`${npc.spriteKey}_walk_up`, true);
    }

    scene.tweens.add({
      targets: npc,
      x: nextX,
      y: nextY,
      duration: 300,
      ease: 'Linear',
      onComplete: () => {
        i++;
        moveNext();
      }
    });
  }

  moveNext();
}


function drawTilemap(scene, mapData) {
  for (let y = 0; y < map_height; y++) {
    for (let x = 0; x < map_width; x++) {
      const isBlocked = mapData[y][x] === 1;
      const frameIndex = mapData[y][x] //isBlocked ? 1 : 0;

      const tile = scene.add.sprite(
        x * TILE_SIZE + TILE_SIZE / 2,
        y * TILE_SIZE + TILE_SIZE / 2,
        'tilemap',
        frameIndex
      );
      tile.setOrigin(0.5);
      tile.setDepth(10000)
    }
  }
}

function drawDebugGrid(scene) {
  const graphics = scene.add.graphics();
  graphics.lineStyle(1, 0xffffff, 0.25);

  for (let x = 0; x <= map_width; x++) {
    graphics.moveTo(x * TILE_SIZE, 0);
    graphics.lineTo(x * TILE_SIZE, map_height * TILE_SIZE);
  }

  for (let y = 0; y <= map_height; y++) {
    graphics.moveTo(0, y * TILE_SIZE);
    graphics.lineTo(map_width * TILE_SIZE, y * TILE_SIZE);
  }

  graphics.strokePath();
}
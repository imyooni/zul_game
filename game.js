import * as sprites from './assets/scripts/sprites.js';

const TILE_SIZE = 32;
const map_width = 12;
const map_height = 23;
let activePath = false;
let easystar;
let player;
let npcs = [];
let npcMovementFlags = [];  // Track whether an NPC is currently moving

const config = {
  type: Phaser.AUTO,
  width: 384,
  height: 736,
  parent: 'game-container',
  pixelArt: false,
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
let mapData = [];
for (let y = 0; y < map_height; y++) {
  const row = [];
  for (let x = 0; x < map_width; x++) {
   // row.push(Math.random() < 0.2 ? 1 : 0); // 20% blocked
    row.push(0)
  }
  mapData.push(row);
}

function preload() {
 
  sprites.load_sprites(this);
 
}

let activeCars = {
  car1: null,
  car2: null
};

function create() {
  // ✅ Draw tilemap
  sprites.load_animations(this);
  
  set_map_areas()
  //drawTilemap(this, mapData);
  //drawDebugGrid(this);



  let roomBack = this.add.sprite( this.cameras.main.centerX,this.cameras.main.centerY,'room_background')
  roomBack.setDepth(-1)
  let roomTop = this.add.sprite( this.cameras.main.centerX,this.cameras.main.centerY,'room_top')
  roomTop.setDepth(100)

  let car1 = this.add.sprite(0, 2 * TILE_SIZE + TILE_SIZE / 2,'car1')
  car1.x = -car1.width
  car1.setDepth(2 * TILE_SIZE + TILE_SIZE / 2)

  let car2 = this.add.sprite(0, 4 * TILE_SIZE + TILE_SIZE / 2,'car2')
  car2.x = config.width+car2.width
  car2.setDepth(4 * TILE_SIZE + TILE_SIZE / 2)

  
  // ✅ Init player
  player = this.add.sprite(5 * TILE_SIZE + 16, 8 * TILE_SIZE + 16 / 2, 'player');
  player.setFrame(1);  // Use first frame for player
  player.setDepth(1);

  // ✅ Init EasyStar
  easystar = new EasyStar.js();
  easystar.setGrid(mapData);
  easystar.setAcceptableTiles([0]); // 0 = walkable

  // ✅ Click to move player
  this.input.on('pointerdown', (pointer) => {
    if (activePath) return;
    const tileX = Math.floor(pointer.worldX / TILE_SIZE);
    const tileY = Math.floor(pointer.worldY / TILE_SIZE);

    const playerTileX = Math.floor(player.x / TILE_SIZE);
    const playerTileY = Math.floor(player.y / TILE_SIZE);

    console.log(tileX,tileY)

    easystar.findPath(playerTileX, playerTileY, tileX, tileY, (path) => {
      if (path === null || tileY <= 7 || tileY >= 21) {
       // console.log("No path found.");
      } else {
        activePath = true
        moveAlongPath(this, path, player);
      }
    });

    easystar.calculate();
  });

      const npc = this.add.sprite(0 * TILE_SIZE + TILE_SIZE / 2, 21 * TILE_SIZE + 16 / 2, 'npc1');
      npc.direction = 2
      npc.spriteKey = "npc1"
      npc.setFrame(7);  // Use first frame for NPC
      npc.setDepth(1);
      npcs.push(npc);  // Add NPC to npcs array
      npcMovementFlags.push(false);  // Add movement flag (false: not moving)
      MoveNpcTo(this,0,4,21,3)


   scheduleCarSpawn(this, 'car1');
    scheduleCarSpawn(this, 'car2');
  
}

function scheduleCarSpawn(scene, carType) {
  const delay = Phaser.Math.Between(3000, 5000); // 3–10 seconds

  scene.time.addEvent({
    delay: delay,
    callback: () => {
      if (!activeCars[carType] && Math.random() < 0.35) {
        spawnCar(scene, carType);
      }
      scheduleCarSpawn(scene, carType); // Loop again
    }
  });
}
function spawnCar(scene, carType) {
  let y
  let car;

  if (carType === 'car1') {
    y = 2 * TILE_SIZE + TILE_SIZE / 2;
    car = scene.add.sprite(-64, y, 'car1');
    car.x = -car.width
  } else if (carType === 'car2') {
    y = 3 * TILE_SIZE + TILE_SIZE / 2;
    car = scene.add.sprite(config.width + 64, y, 'car2');
    car.x = config.width+car.width
  }
  console.log(y/32)
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
      tempPathfinder.setAcceptableTiles([0]);

      tempPathfinder.findPath(currentX, currentY, targetX, targetY, (path) => {
        if (path && path.length > 1) {
          moveNPCAlongPath(scene, npc, path, npcIndex,finaldir);
        }
      });

      tempPathfinder.calculate();
}

function set_map_areas(){
  let blockedTiles = [
    [0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[0,8],[0,9],[0,10],[0,11],
    [7,0],[7,1],[7,2],[7,3],[7,4],[7,5],[7,6],[7,7],[7,8],[7,10],[7,11],
    [8,0],[8,3],[8,4],[8,11],[8,7],
    [9,0],[9,1],[9,3],[9,4],[9,11],
    [10,0],[10,11],
    [11,0],[11,11],
    [12,0],[12,11],
    [13,0],[13,11],
    [14,0],[14,11],
    [15,0],[15,11],
    [16,0],[16,11],
    [17,0],[17,1],[17,2],[17,3],[17,5],[17,6],[17,7],[17,10],[17,11],
    [18,0],[18,1],[18,2],[18,3],[18,5],[18,6],[18,7],[18,10],[18,11],
    [19,0],[19,7],[19,10],[19,11],
    [20,0],[20,1],[20,2],[20,3],[20,4],[20,5],[20,6],[20,7],[20,10],[20,11],
  ]
  for (let index = 0; index < blockedTiles.length; index++) {
    let id = blockedTiles[index]
    mapData[id[0]][id[1]] = 1;
  }
} 


let currentTween = null;
let player_direction = 0;
function moveAlongPath(scene, path, entity) {
  if (path.length <= 1) {
    activePath = false
    return;
  }
  let i = 1;

  if (currentTween) {
    currentTween.stop();
    currentTween = null;
  }

  function moveNext() {
    if (i >= path.length ) {
      entity.anims.stop();
      let dirs = [1,4,7,10]
      entity.setFrame(dirs[player_direction])
      activePath = false
    //  console.log("Path finished");
      return;
    }

   

    const nextTile = path[i];
    const nextX = nextTile.x * TILE_SIZE + TILE_SIZE / 2;
    const nextY = nextTile.y * TILE_SIZE + 16 / 2;

    entity.setDepth(nextY)
    // Calculate movement direction
    const prevTile = path[i - 1];  // Previous tile
    const dx = nextTile.x - prevTile.x;
    const dy = nextTile.y - prevTile.y;

    // Determine movement direction and play corresponding animation
    if (dy > 0) {
      // Moving down
      player_direction = 0
      entity.anims.play('player_walk_down', true);
    } else if (dx < 0) {
      // Moving left
      player_direction = 1
      entity.anims.play('player_walk_left', true);
    } else if (dx > 0) {
      // Moving right
      player_direction = 2
      entity.anims.play('player_walk_right', true);
    } else if (dy < 0) {
      // Moving up
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
        i++;
        moveNext();
      }
    });
  }

  moveNext();
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

    npc.setDepth(nextY)
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

function update() {
  if (easystar) {
    easystar.calculate(); // ✅ Required for pathfinding to run
  }


}

function drawTilemap(scene, mapData) {
  for (let y = 0; y < map_height; y++) {
    for (let x = 0; x < map_width; x++) {
      const isBlocked = mapData[y][x] === 1;
      const frameIndex = isBlocked ? 1 : 0;

      const tile = scene.add.sprite(
        x * TILE_SIZE + TILE_SIZE / 2,
        y * TILE_SIZE + TILE_SIZE / 2,
        'tilemap',
        frameIndex
      );
      tile.setOrigin(0.5);
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
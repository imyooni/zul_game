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

function create() {
  // ✅ Draw tilemap
  sprites.load_animations(this);
  
  set_map_areas()
  //drawTilemap(this, mapData);
  //drawDebugGrid(this);



  let roomBack = this.add.sprite( this.cameras.main.centerX,this.cameras.main.centerY,'room_background')
  roomBack.setDepth(-1)
  //let roomTop = this.add.sprite( this.cameras.main.centerX,this.cameras.main.centerY,'room_top')
  //roomTop.setDepth(100)

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

    easystar.findPath(playerTileX, playerTileY, tileX, tileY, (path) => {
      if (path === null) {
        console.log("No path found.");
      } else {
        activePath = true
        moveAlongPath(this, path, player);
      }
    });

    easystar.calculate();
  });
 
 // create_npcs(this);
}

function set_map_areas(){
  let blockedTiles = [
    [7,0],[7,1],[7,2],[7,3],[7,4],[7,5],[7,6],[7,7],[7,8],[7,10],[7,11],
    [8,0],[8,2],[8,11],
    [9,0],[9,11],
    [10,0],[10,11],
    [11,0],[11,11],
    [12,0],[12,11],
    [13,0],[13,11],
    [14,0],[14,11],
    [15,0],[15,11],
    [16,0],[16,11],
  ]
  for (let index = 0; index < blockedTiles.length; index++) {
    let id = blockedTiles[index]
    mapData[id[0]][id[1]] = 1;
  }
} 

function create_npcs(scene) {
  // ✅ Spawn 5 NPCs at random walkable positions
  for (let i = 0; i < 5; i++) {
    const startX = Phaser.Math.Between(0, map_width - 1);
    const startY = Phaser.Math.Between(0, map_height - 1);

    // Make sure NPC spawns on a walkable tile
    if (mapData[startY][startX] === 0) {
      const npc = scene.add.sprite(startX * TILE_SIZE + TILE_SIZE / 2, startY * TILE_SIZE + 16 / 2, 'npc');
      npc.setFrame(0);  // Use first frame for NPC
      npc.setDepth(1);
      npcs.push(npc);  // Add NPC to npcs array
      npcMovementFlags.push(false);  // Add movement flag (false: not moving)
    }
  }

  // Start NPCs wandering
  npcs.forEach((npc, index) => {
 //  startNPCWander(scene, index);  // Pass the NPC index to handle each NPC independently
  });
}

function startNPCWander(scene, npcIndex) {
  // Recalculate path less frequently
  scene.time.addEvent({
    delay: Phaser.Math.Between(2000, 4000), // Randomize delay between NPC moves
    loop: true,
    callback: () => {
      const npc = npcs[npcIndex];
      const isMoving = npcMovementFlags[npcIndex];  // Check if NPC is moving

      // Don't start a new path if NPC is already moving
      if (isMoving) return;

      // Mark NPC as moving
      npcMovementFlags[npcIndex] = true;

      const currentX = Math.floor(npc.x / TILE_SIZE);
      const currentY = Math.floor(npc.y / TILE_SIZE);

      let targetX, targetY;

      let tries = 0;
      do {
        targetX = Phaser.Math.Between(0, map_width - 1);
        targetY = Phaser.Math.Between(0, map_height - 1);
        tries++;
      } while ((mapData[targetY][targetX] !== 0 || (targetX === currentX && targetY === currentY)) && tries < 10);

      const tempPathfinder = new EasyStar.js();
      tempPathfinder.setGrid(mapData);
      tempPathfinder.setAcceptableTiles([0]);

      tempPathfinder.findPath(currentX, currentY, targetX, targetY, (path) => {
        if (path && path.length > 1) {
          moveNPCAlongPath(scene, npc, path, npcIndex);
        }
      });

      tempPathfinder.calculate();
    }
  });
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
      console.log("Path finished");
      return;
    }

    const nextTile = path[i];
    const nextX = nextTile.x * TILE_SIZE + TILE_SIZE / 2;
    const nextY = nextTile.y * TILE_SIZE + 16 / 2;

    // Calculate movement direction
    const prevTile = path[i - 1];  // Previous tile
    const dx = nextTile.x - prevTile.x;
    const dy = nextTile.y - prevTile.y;

    // Determine movement direction and play corresponding animation
    if (dy > 0) {
      // Moving down
      player_direction = 0
      entity.anims.play('walk_down', true);
    } else if (dx < 0) {
      // Moving left
      player_direction = 1
      entity.anims.play('walk_left', true);
    } else if (dx > 0) {
      // Moving right
      player_direction = 2
      entity.anims.play('walk_right', true);
    } else if (dy < 0) {
      // Moving up
      player_direction = 3
      entity.anims.play('walk_up', true);
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



function moveNPCAlongPath(scene, npc, path, npcIndex) {
  let i = 1;

  function moveNext() {
    if (i >= path.length) {
      // Mark NPC as not moving once it reaches its destination
      npcMovementFlags[npcIndex] = false;
      return;
    }

    const nextTile = path[i];
    const nextX = nextTile.x * TILE_SIZE + TILE_SIZE / 2;
    const nextY = nextTile.y * TILE_SIZE + 16 / 2;

    scene.tweens.add({
      targets: npc,
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
  graphics.lineStyle(1, 0x00ff00, 0.3);

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

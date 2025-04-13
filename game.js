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
  width: TILE_SIZE * map_width,
  height: TILE_SIZE * map_height,
  parent: 'game-container',
  pixelArt: true,
  backgroundColor: 'transparent',
  transparent: true,
  scene: {
    preload,
    create,
    update
  }
};

const game = new Phaser.Game(config);

// ✅ Generate map data (0 = walkable, 1 = blocked)
const mapData = [];
for (let y = 0; y < map_height; y++) {
  const row = [];
  for (let x = 0; x < map_width; x++) {
    row.push(Math.random() < 0.2 ? 1 : 0); // 20% blocked
  }
  mapData.push(row);
}

function preload() {
 
  sprites.load_sprites(this);
 

  this.load.spritesheet('tilemap', 'assets/sprites/tilemap.png', {
    frameWidth: 32,
    frameHeight: 32
  });
  this.load.spritesheet('player', 'assets/sprites/player.png', { frameWidth: 32, frameHeight: 48 });  // Assuming a player sprite with size 32x48
  this.load.spritesheet('npc', 'assets/sprites/npc.png', { frameWidth: 32, frameHeight: 48 });  // Assuming an NPC sprite with size 32x48
}

function create() {
  // ✅ Draw tilemap
  sprites.load_animations(this);
  drawTilemap(this, mapData);
  drawDebugGrid(this);

  // ✅ Init player
  player = this.add.sprite(5 * TILE_SIZE + 16, 5 * TILE_SIZE + 16 / 2, 'player');
  player.setFrame(0);  // Use first frame for player
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

  create_npcs(this);
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

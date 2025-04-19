
import * as audio from './audio.js';
import * as gameSystem from './gameSystem.js';

export function createPlayer(scene) {
  scene.player = scene.add.sprite(0 * scene.TILE_SIZE + 16, 0 * scene.TILE_SIZE + 16 / 2, 'player')
    .setFrame(1)
    .setDepth(1)
  scene.player.pauseMovement = false  
  scene.newPos = scene.add.sprite(0, 0, 'newPos')
  scene.newPos.setDepth(200)
  scene.newPos.setVisible(false)

  scene.roomBack.on('pointerdown', (pointer) => {
    if (!scene.gameActive) return
    if (scene.activePath) return;
    if (scene.player.pauseMovement) return
    const tileX = Math.floor(pointer.worldX / scene.TILE_SIZE);
    const tileY = Math.floor(pointer.worldY / scene.TILE_SIZE);
    playerPath(scene,tileY,tileX)
  });
}

export function playerPath(scene,y,x){
  const tileX = Math.floor(x);
  const tileY = Math.floor(y);
  const playerTileX = Math.floor(scene.player.x / scene.TILE_SIZE);
  const playerTileY = Math.floor(scene.player.y / scene.TILE_SIZE);

  console.log(`y:${tileY} x:${tileX}`)
  

  scene.easystar = new EasyStar.js();
  scene.easystar.setGrid(scene.mapData);
  scene.easystar.setAcceptableTiles([0,3,4]);
  scene.easystar.findPath(playerTileX, playerTileY, tileX, tileY, (path) => {
    if (path === null || path.length <= 1) {
      return
      // console.log("No path found.");
    } else {
      if (scene.gameActive) {
      gameSystem.updateEnergy(scene, (scene.energy[0] - 1))
      scene.newPos.x = Math.floor(tileX * 32 + 16), scene.newPos.y = Math.floor(tileY * 32 + 16);
      scene.newPos.setVisible(true)
      }
      scene.activePath = true
      moveAlongPath(scene, path, scene.player);
    }
  });
  scene.easystar.calculate();
 // console.log('roomBack clicked!');
}

export function setPlayerPos(scene,y,x){
  scene.player.setPosition(x * scene.TILE_SIZE + 16, y * scene.TILE_SIZE + 16 / 2)
}

export function playerJump(scene){
  scene.player.pauseMovement = true
  scene.tweens.add({
    targets: scene.player,
    y: scene.player.y - 20,
    duration: 150,
    ease: 'Quad.easeOut',
    yoyo: true,            
    onComplete: () => {
      scene.player.pauseMovement = false
    }
  });  
} 

export function changePlayerDir(scene,player,target){
  let playerX = Math.floor(player.x / scene.TILE_SIZE)
  let playerY = Math.floor(player.y / scene.TILE_SIZE)
  let targetX = Math.floor(target.x / scene.TILE_SIZE)
  let targetY = Math.floor(target.y / scene.TILE_SIZE)
  if (playerY === targetY && playerX < targetX) {
    player.setFrame(7)
  } else if (playerY === targetY && playerX > targetX) {
    player.setFrame(4)
  } else if (playerY < targetY) {
    player.setFrame(1)
  } else if (playerY > targetY) {
    player.setFrame(10)
  }
} 

export function moveAlongPath(scene, path, entity) {
  let currentTween = null;
  let player_direction = 0;
  if (path.length <= 1) {
    scene.activePath = false
    return;
  }
  let tileID
  let i = 1;
  if (currentTween) {
    currentTween.stop();
    currentTween = null;
  }
  function moveNext() {
    if (i >= path.length) {
      entity.anims.stop();
      let dirs = [1, 4, 7, 10]
      entity.setFrame(dirs[player_direction])
      scene.activePath = false
      scene.newPos.setVisible(false)
      return;
    }
    audio.playSound('playerStep')
    const nextTile = path[i];
    const nextX = nextTile.x * scene.TILE_SIZE + scene.TILE_SIZE / 2;
    const nextY = nextTile.y * scene.TILE_SIZE + 16 / 2;
    tileID = scene.mapData[nextTile.y][nextTile.x]
    if (tileID === 3) {
      entity.setDepth(101)
    }
    const prevTile = path[i - 1];
    const dx = nextTile.x - prevTile.x;
    const dy = nextTile.y - prevTile.y;
    if (dy > 0) {
      player_direction = 0
      entity.anims.play('player_walk_down', true);
    } else if (dx < 0) {
      player_direction = 1
      entity.anims.play('player_walk_left', true);
    } else if (dx > 0) {
      player_direction = 2
      entity.anims.play('player_walk_right', true);
    } else if (dy < 0) {
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
        if (tileID === 3) {
          entity.setDepth(101)
        } else {
          entity.setDepth(nextTile.y)
        }
        i++;
        moveNext();
      }
    });
  }
  moveNext();
}


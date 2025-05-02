
import * as audio from './audio.js';
import * as gameSystem from './gameSystem.js';

export function createPlayer(scene) {
  scene.player = scene.add.sprite(0 * scene.TILE_SIZE + 16, 0 * scene.TILE_SIZE + 16 / 2, 'player')
    .setFrame(1)
    .setDepth(1)
  scene.player.currentTween = null
  scene.player.pauseMovement = false  
  scene.player.activePath = false
  scene.player.spriteKey = 'player'
  scene.player.direction = 1 
  scene.newPos = scene.add.sprite(0, 0, 'newPos')
  scene.newPos.setDepth(200)
  scene.newPos.setVisible(false)

  scene.roomBack.on('pointerdown', (pointer) => {
    if (!scene.gameActive) return
    if (scene.player.activePath) return;
    if (scene.player.pauseMovement) return
    const tileX = Math.floor(pointer.worldX / scene.TILE_SIZE);
    const tileY = Math.floor(pointer.worldY / scene.TILE_SIZE);
    const zulX = Math.floor(scene.zul.x / scene.TILE_SIZE);
    const zulY = Math.floor(scene.zul.y / scene.TILE_SIZE);    
    if (tileX === zulX && tileY === zulY) return
    gameSystem.entityPath(scene,scene.player,tileY,tileX)
  });
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

export function setPlayerDir(scene,dir) {
  if (dir === 'right') {
    scene.player.setFrame(7)
  } else if (dir === 'left') {
    scene.player.setFrame(4)
  } else if (dir === 'down') {
    scene.player.setFrame(1)
  } else if (dir === 'up') {
    scene.player.setFrame(10)
  }
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




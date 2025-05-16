import * as audio from './audio.js';

export function createNpc(scene,x,y){
    const npc = scene.add.sprite(x * scene.TILE_SIZE + scene.TILE_SIZE / 2, y * scene.TILE_SIZE + 16 / 2, 'npc1');
    npc.direction = 2
    npc.spriteKey = "npc1"
    npc.setFrame(7);
    npc.setDepth(1);
    scene.npcs.push(npc); 
    //npcMovementFlags.push(false);  // Add movement flag (false: not moving)
}

export function MoveNpcTo(scene,npcIndex,x,y,finaldir = null){
    const targetX = Math.floor(x);
    const targetY = Math.floor(y);
    const npc = scene.npcs[npcIndex];
    const currentX = Math.floor(npc.x / scene.TILE_SIZE);
    const currentY = Math.floor(npc.y / scene.TILE_SIZE);
    const tempPathfinder = new EasyStar.js();
      tempPathfinder.setGrid(scene.mapData);
      tempPathfinder.setAcceptableTiles([0,2]);
      tempPathfinder.findPath(currentX, currentY, targetX, targetY, (path) => {
        if (path && path.length > 1) {
          moveNPCAlongPath(scene, npc, path, npcIndex,finaldir);
        }
      });
      tempPathfinder.calculate();
  }
  
  export function moveNPCAlongPath(scene, npc, path, npcIndex, finaldir = null) {
    let i = 1;
    function moveNext() {
      if (i >= path.length) {
        npc.anims.stop();
        let dirs = [1,4,7,10]
        if (finaldir != null) {
          npc.direction = finaldir
        }
        npc.setFrame(dirs[npc.direction])
       // npcMovementFlags[npcIndex] = false;
        return;
      }
      audio.playSound('playerStep')
      const prevTile = path[i - 1];  // Previous tile
      const nextTile = path[i];
      const dx = nextTile.x - prevTile.x;
      const dy = nextTile.y - prevTile.y;
      const nextX = nextTile.x * scene.TILE_SIZE + scene.TILE_SIZE / 2;
      const nextY = nextTile.y * scene.TILE_SIZE + 16 / 2;
      npc.setDepth(nextTile.y)
      if (dy > 0) {
        npc.direction = 0
        npc.anims.play(`${npc.spriteKey}_walk_down`, true);
      } else if (dx < 0) {
        npc.direction = 1
        npc.anims.play(`${npc.spriteKey}_walk_left`, true);
      } else if (dx > 0) {
        npc.direction = 2
        npc.anims.play(`${npc.spriteKey}_walk_right`, true);
      } else if (dy < 0) {
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
  
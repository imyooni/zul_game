export function createZul(scene){
    scene.zul = scene.add.sprite(0 * scene.TILE_SIZE + 16, 0 * scene.TILE_SIZE + 16 / 2, 'zul')
    .setFrame(1)
    .setDepth(1)
    scene.zul.activePath = false  
    scene.zul.pauseMovement = false  
}

export function zulPath(scene,y,x){
  const tileX = Math.floor(x);
  const tileY = Math.floor(y);
  const zulTileX = Math.floor(scene.zul.x / scene.TILE_SIZE);
  const zulTileY = Math.floor(scene.zul.y / scene.TILE_SIZE);


  scene.zul.easystar = new EasyStar.js();
  scene.zul.easystar.setGrid(scene.mapData);
  scene.zul.easystar.setAcceptableTiles([0,3,4]);
  scene.zul.easystar.findPath(zulTileX, zulTileY, tileX, tileY, (path) => {
    if (path === null || path.length <= 1) {
      return
      // console.log("No path found.");
    } else {
      
      moveAlongPath(scene, path, scene.zul);
    }
  });
  scene.zul.easystar.calculate();
 // console.log('roomBack clicked!');
}

export function setZulPos(scene,y,x){
    scene.zul.setPosition(x * scene.TILE_SIZE + 16, y * scene.TILE_SIZE + 16 / 2)
  }

  export function moveAlongPath(scene, path, entity) {
    entity.currentTween = null;
    let player_direction = 0;
    if (path.length <= 1) {
      scene.entity.activePath = false
      return;
    }
    let tileID
    let i = 1;
    if (entity.currentTween) {
      entity.currentTween.stop();
      entity.currentTween = null;
    }
    function moveNext() {
      if (i >= path.length) {
        entity.anims.stop();
        let dirs = [1, 4, 7, 10]
        entity.setFrame(dirs[player_direction])
        entity.activePath = false
        return;
      }
    //  audio.playSound('playerStep')
      const nextTile = path[i];
      const nextX = nextTile.x * scene.TILE_SIZE + scene.TILE_SIZE / 2;
      const nextY = nextTile.y * scene.TILE_SIZE + 16 / 2;
      tileID = scene.mapData[nextTile.y][nextTile.x]
      const prevTile = path[i - 1];
      const dx = nextTile.x - prevTile.x;
      const dy = nextTile.y - prevTile.y;
      if (dy > 0) {
        player_direction = 0
        entity.anims.play('zul_walk_down', true);
      } else if (dx < 0) {
        player_direction = 1
        entity.anims.play('zul_walk_left', true);
      } else if (dx > 0) {
        player_direction = 2
        entity.anims.play('zul_walk_right', true);
      } else if (dy < 0) {
        player_direction = 3
        entity.anims.play('zul_walk_up', true);
      }
      entity.currentTween = scene.tweens.add({
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
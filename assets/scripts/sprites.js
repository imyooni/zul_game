export function load_sprites(scene) {
 scene.load.image('room_background', 'assets/sprites/room_background.png');
 scene.load.image('room_top', 'assets/sprites/room_top.png');

  scene.load.spritesheet('player', 'assets/sprites/player.png', {frameWidth: 32, frameHeight: 48});
  scene.load.spritesheet('npc1', 'assets/sprites/npc1.png', {frameWidth: 32, frameHeight: 48});
  scene.load.spritesheet('tilemap', 'assets/sprites/tilemap.png', {frameWidth: 32,frameHeight: 32 });
  
  scene.load.spritesheet('car1', 'assets/sprites/car1.png', {frameWidth: 154, frameHeight: 72});
  scene.load.spritesheet('car2', 'assets/sprites/car2.png', {frameWidth: 228, frameHeight: 124});
}

export function load_animations(scene){
  createDirectionalAnims(scene, 'player');
  createDirectionalAnims(scene, 'npc1');
}

export function createDirectionalAnims(scene, spriteKey, animKeyPrefix = spriteKey) {
  const directions = {
    down: [2, 1, 0, 1],
    left: [5, 4, 3, 4],
    right: [8, 7, 6, 7],
    up: [11, 10, 9, 10]
  };

  for (const [dir, frames] of Object.entries(directions)) {
    console.log(`${animKeyPrefix}_walk_${dir}`)
    scene.anims.create({
      key: `${animKeyPrefix}_walk_${dir}`,
      frames: scene.anims.generateFrameNumbers(spriteKey, { frames }),
      frameRate: 8,
      repeat: -1
    });
  }
}

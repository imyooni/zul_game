export function load_sprites(scene) {
 scene.load.image('room_background', 'assets/sprites/room_background.png');

 scene.load.spritesheet('player', 'assets/sprites/player.png', {
    frameWidth: 32,
    frameHeight: 48
  });

  scene.load.spritesheet('npc', 'assets/sprites/npc.png', {
    frameWidth: 32,
    frameHeight: 48
  });

  scene.load.spritesheet('tilemap', 'assets/sprites/tilemap.png', {
    frameWidth: 32,
    frameHeight: 32
  });
  
  
}

export function load_animations(scene){
 scene.anims.create({
    key: 'walk_down',
    frames: scene.anims.generateFrameNumbers('player', { frames: [2, 1, 0, 1] }), // down
    frameRate: 8,
    repeat: -1
  });

  scene.anims.create({
    key: 'walk_left',
    frames: scene.anims.generateFrameNumbers('player', { frames: [5, 4, 3, 4] }), // left
    frameRate: 8,
    repeat: -1
  });

  scene.anims.create({
    key: 'walk_right',
    frames: scene.anims.generateFrameNumbers('player', { frames: [8, 7, 6, 7] }), // right
    frameRate: 8,
    repeat: -1
  });
  
  scene.anims.create({
    key: 'walk_up',
    frames: scene.anims.generateFrameNumbers('player', { frames: [11, 10, 9, 10] }), // up
    frameRate: 8,
    repeat: -1
  });

}
export function loadIntroSprites(scene){
  scene.load.image('logo', 'assets/sprites/logo.png');
}

export function loadLangSprites(scene){
  scene.load.spritesheet('languages', 'assets/sprites/languages.png', {frameWidth: 250,frameHeight: 50 });
}

export function loadGameSprites(scene){
  // single
  scene.load.image('room_background', 'assets/sprites/room_background.png');
  scene.load.image('room_top', 'assets/sprites/room_top.png');
  scene.load.image('commandBorder', 'assets/sprites/commandBorder.png');
  scene.load.image('optionsBorder', 'assets/sprites/optionsBorder.png');
  scene.load.image('sliderDot', 'assets/sprites/sliderDot.png');
  scene.load.image('sliderBar', 'assets/sprites/sliderBar.png');
  scene.load.image('sliderBarFill', 'assets/sprites/sliderBarFill.png');
 
  scene.load.image('closeIcon', 'assets/sprites/closeIcon.png');
  // sheets
  scene.load.spritesheet('dayNight', 'assets/sprites/dayNight.png', {frameWidth: 142,frameHeight: 50 });
  scene.load.spritesheet('coffeeTable', 'assets/sprites/coffeeTable.png', {frameWidth: 34,frameHeight: 64 });
  scene.load.spritesheet('coffeeIcon', 'assets/sprites/coffeeIcon.png', {frameWidth: 40,frameHeight: 40 });
  scene.load.spritesheet('socials', 'assets/sprites/socials.png', {frameWidth: 48,frameHeight: 47 });
  scene.load.spritesheet('languageMini', 'assets/sprites/languageMini.png', {frameWidth: 48,frameHeight: 47 });
  scene.load.spritesheet('gameLogo', 'assets/sprites/gameLogo.png', {frameWidth: 240,frameHeight: 93 });

  scene.load.spritesheet('newPos', 'assets/sprites/newPos.png', {frameWidth: 32,frameHeight: 48 });
  scene.load.spritesheet('tilemap', 'assets/sprites/tilemap.png', {frameWidth: 32,frameHeight: 32 });
  scene.load.spritesheet('closeOpen', 'assets/sprites/closeOpen.png', {frameWidth: 32, frameHeight: 32});
 
  // special npcs & player
  scene.load.spritesheet('player', 'assets/sprites/player.png', {frameWidth: 32, frameHeight: 48});
  scene.load.spritesheet('zul', 'assets/sprites/zul.png', {frameWidth: 32, frameHeight: 48});

  scene.load.image('energyBorder', 'assets/sprites/energyBorder.png');
  scene.load.image('energyBar', 'assets/sprites/energyBar.png');
  scene.load.spritesheet('energyFill', 'assets/sprites/energyFill.png', {frameWidth: 9, frameHeight: 90});
  
  // npcs
  scene.load.spritesheet('npc1', 'assets/sprites/npc1.png', {frameWidth: 32, frameHeight: 48});

  for (let index = 0; index < 5; index++) {
    scene.load.image(`car${index}`, `assets/sprites/car${index}.png`);
  }
}

export function load_sprites(scene) {

  
}

export function load_animations(scene){
  createDirectionalAnims(scene, 'player');
  createDirectionalAnims(scene, 'zul');
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
    scene.anims.create({
      key: `${animKeyPrefix}_walk_${dir}`,
      frames: scene.anims.generateFrameNumbers(spriteKey, { frames }),
      frameRate: 8,
      repeat: -1
    });
  }
}

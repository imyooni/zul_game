import * as sprites from '../assets/scripts/sprites.js';
import * as audio from '../assets/scripts/audio.js';
import * as gameSystem from '../assets/scripts/gameSystem.js';
import * as SaveGame from '../assets/scripts/SaveGame.js';

export default class LanguageScene extends Phaser.Scene {
  constructor() {
    super('LanguageScene');
  }
  preload() {
    sprites.loadLangSprites(this)
  }
  create() {
    this.time.delayedCall(500, () => {
     createLanguageButtons(this)
    })
  }
}

function createLanguageButtons(scene){
  const bg = scene.add.graphics()
  .fillStyle(0x5e548e, 1)
  .fillRect(0, 0, scene.scale.width, scene.scale.height);
  bg.generateTexture('langBG', scene.scale.width, scene.scale.height);
  bg.destroy();
  scene.langBackground = scene.add.sprite(0, 0, 'langBG').setOrigin(0).setDepth(49999);
  scene.languageSprites = [];
  scene.language = null;
  const centerY = scene.scale.height / 2;
  const spacing = 30;
  const languages = [
  { key: 'eng', frame: 0, y: centerY - spacing },
  { key: 'kor', frame: 1, y: centerY + spacing }
  ];
  languages.forEach((lang, i) => {
  const sprite = scene.add.sprite(-100, lang.y, 'languages')
    .setFrame(lang.frame)
    .setDepth(50000)
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .disableInteractive();
    scene.languageSprites.push(sprite);
    scene.tweens.add({
    targets: sprite,
    x: scene.scale.width / 2,
    duration: 800,
    ease: 'Back.Out',
    onComplete: () => sprite.setInteractive()
  });
  sprite.on('pointerdown', () => {
    if (scene.language !== null) return;
    scene.language = lang.key;
    SaveGame.saveGameValue('language', `${scene.language}`);
    audio.playSound('systemOk',scene);
    gameSystem.flashFill(sprite, 0xffffff, 1, 200);
    languageSelected(scene);
  });
  });
}

function languageSelected(scene) {
  scene.scene.launch('GameScene');
  scene.scene.bringToTop(); 
  scene.time.delayedCall(200, () => {
    const sprites = [...scene.languageSprites, scene.langBackground];
    sprites.forEach(sprite => {
      scene.tweens.add({
        targets: sprite,
        x: scene.scale.width + sprite.width,
        duration: 800,
        ease: 'Back.In',
        onComplete: () => {
          sprite.destroy();
        }
      });
    });
  });
  scene.time.delayedCall(1200, () => {
    scene.scene.remove(scene.scene.key);
  });
}





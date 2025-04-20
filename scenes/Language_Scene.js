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
    this.scene.remove('IntroScene');
    // Create and store a solid background texture
const bg = this.add.graphics()
.fillStyle(0x5e548e, 1)
.fillRect(0, 0, this.scale.width, this.scale.height);
bg.generateTexture('langBG', this.scale.width, this.scale.height);
bg.destroy();

this.langBackground = this.add.sprite(0, 0, 'langBG').setOrigin(0).setDepth(49999);

this.languageSprites = [];
this.language = null;

const centerY = this.scale.height / 2;
const spacing = 30;
const languages = [
{ key: 'eng', frame: 0, y: centerY - spacing },
{ key: 'kor', frame: 1, y: centerY + spacing }
];

// Create language buttons
languages.forEach((lang, i) => {
const sprite = this.add.sprite(-100, lang.y, 'languages')
  .setFrame(lang.frame)
  .setDepth(50000)
  .setOrigin(0.5)
  .setInteractive({ useHandCursor: true })
  .disableInteractive();

this.languageSprites.push(sprite);

this.tweens.add({
  targets: sprite,
  x: this.scale.width / 2,
  duration: 800,
  ease: 'Back.Out',
  onComplete: () => sprite.setInteractive()
});

sprite.on('pointerdown', () => {
  if (this.language !== null) return;
  this.language = lang.key;
  SaveGame.saveGameValue('language', `${this.language}`);
  audio.playSound('systemOk');
  gameSystem.flashFill(sprite, 0xffffff, 1, 200);
  languageSelected(this);
});
});

    this.input.keyboard.on('keydown-S', () => {
      const keys = this.children.list
        .filter(child => child instanceof Phaser.GameObjects.Sprite)
        .map(child => child.texture.key);
      console.log(keys);
    });
  }
  update() { }
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





import * as sprites from '../assets/scripts/sprites.js';
import * as audio from '../assets/scripts/audio.js';
import * as gameSystem from '../assets/scripts/gameSystem.js';

export default class LanguageScene extends Phaser.Scene {
  constructor() {
    super('LanguageScene');
  }

  preload() {
    sprites.loadLangSprites(this)
  }
  create() {
    this.scene.remove('IntroScene');
    const bgGfx = this.add.graphics()
      .fillStyle(0x5e548e, 1)
      .fillRect(0, 0, this.scale.width, this.scale.height);
    bgGfx.generateTexture('langBG', this.scale.width, this.scale.height);
    bgGfx.destroy();
    this.langBackground = this.add.sprite(0, 0, 'langBG').setOrigin(0).setDepth(49999);
    this.languageSprites = [];
    this.language = null
    let centerY = this.scale.height / 2;
    let spacing = 30;
    let eng = this.add.sprite(0, centerY - spacing, 'languages')
      .setFrame(0)
      .setDepth(50000)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true }) // prepare for interaction
      .disableInteractive(); // disable until tween finishes
    eng.x = -eng.width;
    this.languageSprites.push(eng);
    let kor = this.add.sprite(0, centerY + spacing, 'languages')
      .setFrame(1)
      .setDepth(50000)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .disableInteractive();
    kor.x = -kor.width;
    this.languageSprites.push(kor);
    this.tweens.add({
      targets: eng,
      x: this.scale.width / 2,
      duration: 800,
      ease: 'Back.Out', // this handles a single bounce at the end
      onComplete: () => {
        eng.setInteractive();
      }
    });
    this.tweens.add({
      targets: kor,
      x: this.scale.width / 2,
      duration: 800,
      ease: 'Back.Out',
      delay: 150,
      onComplete: () => {
        kor.setInteractive(); // ✅ enable click after animation
      }
    });
    eng.on('pointerdown', () => {
      if (this.language !== null) return
      this.language = "eng"
      gameSystem.flashFill(this.languageSprites[0], 0xffffff, 1, 200);
      languageSelected(this)
    });
    kor.on('pointerdown', () => {
      if (this.language !== null) return
      this.language = "kor"
      gameSystem.flashFill(this.languageSprites[1], 0xffffff, 1, 200);
      languageSelected(this)
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



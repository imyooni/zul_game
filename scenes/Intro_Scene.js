import * as sprites from '../assets/scripts/sprites.js';
import * as audio from '../assets/scripts/audio.js';
import * as gameSystem from '../assets/scripts/gameSystem.js';
import * as SaveGame from '../assets/scripts/SaveGame.js';

export default class IntroScene extends Phaser.Scene {
  constructor() {
    super('IntroScene');
  }

  preload() {
    audio.load_audio(this)
    sprites.loadIntroSprites(this)
  }

  create() {
    if (loadVolumeSettings()) {
      this.bgmVolume = SaveGame.loadGameValue('bgmVolume');
      this.sfxVolume = SaveGame.loadGameValue('sfxVolume');
    } else {
      this.bgmVolume = 0.5;
      this.sfxVolume = 0.5;
      SaveGame.saveGameValue('bgmVolume', 0.5);
      SaveGame.saveGameValue('sfxVolume', 0.5);
    }
   // audio.init_audio(this)
    createIntroLogo(this)
  }

}

function loadVolumeSettings() {
  const saveData = JSON.parse(localStorage.getItem('SaveFile')) || {};
  return 'bgmVolume' in saveData && 'sfxVolume' in saveData;
}

function createIntroLogo(scene) {
  const bgGfx = scene.add.graphics()
    .fillStyle(0x000000, 1)
    .fillRect(0, 0, scene.scale.width, scene.scale.height);
  bgGfx.generateTexture('introBG', scene.scale.width, scene.scale.height);
  bgGfx.destroy();
  scene.Background = scene.add.sprite(0, 0, 'introBG').setOrigin(0).setDepth(89999);
  scene.logo = scene.add.sprite(0, 0, 'logo')
    .setDepth(90000)
    .setAlpha(0)
    .setOrigin(0.5, 0.5)
  scene.logo.setPosition(scene.scale.width / 2, scene.scale.height / 2);
  scene.logo.enabled = true
  scene.tweens.add({
    targets: scene.logo,
    alpha: 1,
    duration: 1000,
    ease: 'Power1',
    onComplete: () => {
      scene.logo.setInteractive();
      scene.logo.on('pointerdown', () => {
        if (!scene.logo.enabled) return
        scene.logo.enabled = false
        gameSystem.flashFill(scene.logo, 0xFFFACD, 1, 200)
        audio.playSound('zul',scene);
        scene.time.delayedCall(350, () => {
          let sprites = [scene.logo, scene.Background]
          if (SaveGame.loadGameValue('language')) {
            scene.scene.launch('GameScene');
            scene.scene.remove('LanguageScene');
          } else {
            scene.scene.launch('LanguageScene');
          }
          scene.scene.bringToTop('IntroScene')
          scene.time.delayedCall(200, () => {
          sprites.forEach(sprite => {
            scene.tweens.add({
              targets: sprite,
              x: scene.scale.width + sprite.width,
              duration: 800,
              ease: 'Back.In',
              onComplete: () => {
                scene.scene.remove('IntroScene');
              }
            });
          });
         });

          
        });
      });
    }
  });
}
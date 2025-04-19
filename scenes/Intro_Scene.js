import * as sprites from '/assets/scripts/sprites.js';
import * as audio from '/assets/scripts/audio.js';
import * as gameSystem from '/assets/scripts/gameSystem.js';

export default class IntroScene extends Phaser.Scene {
    constructor() {
      super('IntroScene');
    }
  
    preload() {
     audio.load_audio(this)
     sprites.loadIntroSprites(this)
    }
  
    create() {
      audio.init_audio(this)
      const bgGfx = this.add.graphics()
        .fillStyle(0x000000, 1)
        .fillRect(0, 0, this.scale.width, this.scale.height);
      bgGfx.generateTexture('introBG', this.scale.width, this.scale.height);
      bgGfx.destroy();
      this.Background = this.add.sprite(0, 0, 'introBG').setOrigin(0).setDepth(49999);

      this.logo = this.add.sprite(0, 0, 'logo')
  .setDepth(50000)
  .setAlpha(0) // Start invisible
  .setOrigin(0.5, 0.5) // Ensure the origin is at the center of the sprite

// Center the sprite in the middle of the screen
this.logo.setPosition(this.scale.width / 2, this.scale.height / 2);
this.logo.enabled = true
// Add a fade-in animation
this.tweens.add({
  targets: this.logo,
  alpha: 1,           // Fade to fully visible
  duration: 1000,     // Fade duration (in milliseconds)
  ease: 'Power1',     // Easing function
  onComplete: () => {
    // Add pointer down event after fade-in completes
    this.logo.setInteractive();  // Make sure the sprite is interactive
    this.logo.on('pointerdown', () => {
      if (!this.logo.enabled) return
      this.logo.enabled = false
      gameSystem.flashFill(this.logo,0xFFFACD,1,200)
      audio.playSound('zul');
      this.time.delayedCall(350, () => {
          this.tweens.add({
            targets: this.logo,
            alpha: 0,        // Fade to fully transparent
            duration: 1000,  // Duration of fade-out
            ease: 'Power1',  // Easing function for fade-out
            onComplete: () => {
              this.logo.setVisible(false); // Optionally hide the logo after fade-out
              this.logo.setAlpha(1); // Reset the alpha for future use
              this.scene.start('LanguageScene');
            }
          });
       }); 
    });
  }
});

    

    }
  
    update() { }
  }
  
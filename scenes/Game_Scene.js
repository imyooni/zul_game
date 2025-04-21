import * as sprites from '../assets/scripts/sprites.js';
import * as audio from '../assets/scripts/audio.js';
import * as gameSystem from '../assets/scripts/gameSystem.js';
import * as scene_room from '../assets/scripts/scene_room.js';
import * as drinks from '../assets/scripts/drinks.js';
import * as player from '../assets/scripts/player.js';
import * as zul from '../assets/scripts/zul.js';
import * as tileMap from '../assets/scripts/tileMap.js';
import * as SaveGame from '../assets/scripts/SaveGame.js';
import * as lang from '../assets/scripts/lang.js';

export default class Game_Scene extends Phaser.Scene {
    constructor() {
      super('GameScene');
    }
  
    preload() {
      sprites.loadGameSprites(this)
    }

    create(){

       this.gameActive = false
       sprites.load_animations(this);
       tileMap.setTilemap(this)
       gameSystem.createClock(this)
       gameSystem.createRoom(this)
       drinks.createDrinkTable(this)
       player.createPlayer(this)
       player.setPlayerPos(this,6,8)
       
       zul.createZul(this)
       zul.setZulPos(this,6,8)
      // drawTilemap(this);

      
      this.input.keyboard.on('keydown-U', () => {
        localStorage.removeItem('SaveFile');
      });

      this.input.keyboard.on('keydown-S', () => {
        const keys = this.children.list
        .filter(child => child instanceof Phaser.GameObjects.Sprite)
        .map(child => child.texture.key);
        console.log(keys);
      });

      this.input.keyboard.on('keydown-Q', () => {
      this.scene.manager.scenes.forEach(scene => {
        console.log(`Scene Key: ${scene.scene.key}, Active: ${scene.scene.isActive()}, Visible: ${scene.scene.isVisible()}, Sleeping: ${scene.scene.isSleeping()}`);
      });
    }); 
      

   

    
      this.time.delayedCall(200, () => {
        carsInit(this)
        startBgm(this)
        this.time.delayedCall(700, () => {
          createSocialButtons(this)
          createTitleCommands(this)
        });
      });
      
      this.input.on('pointerdown', (pointer) => {
          const tileX = Math.floor(pointer.worldX / this.TILE_SIZE);
          const tileY = Math.floor(pointer.worldY / this.TILE_SIZE);
          console.log(`y:${tileY} x:${tileX}`)
        });
    
        this.time.delayedCall(2000, () => {
        gameSystem.entityPath(this,this.player,8,9,'down')
        this.time.delayedCall(2000, () => {
          gameSystem.entityPath(this,this.player,10,9,'right')
          gameSystem.entityPath(this,this.zul,8,6,'up')
        });
      });

        /*
      this.time.delayedCall(2000, () => {
       player.playerPath(this,8,9) 
       this.time.delayedCall(3000, () => {
        player.playerPath(this,11,10)
        zul.zulPath(this,8,9)
        this.time.delayedCall(2000, () => {
          zul.zulPath(this,8,6)
         });
       });
      });
      */
  
      

      
    }

   update(time, delta) {
     if (this.dayNightOverlay) {
       gameSystem.dayNightCycle(this,delta)
     }
   }

}   

function createSocialButtons(scene){
  scene.socialButtons = [];
  scene.language = null;

  const Y = scene.scale.height - 80;
  const spacing = 27;
  const socials = [
  { key: 'https://www.youtube.com/@jooyeonkim1774', frame: 0, y: Y - spacing },
  { key: 'https://www.twitch.tv/Zuljanim', frame: 1, y: Y + spacing }
  ];
  
    let languages = ['eng','kor']
    let currentLang = languages.indexOf(SaveGame.loadGameValue('language'))
    scene.languageIcon = scene.add.sprite(0,0,'languageMini')
      .setFrame(currentLang)
      .setDepth(50000)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .disableInteractive();
      scene.languageIcon.y = scene.scale.height - scene.languageIcon.height
      scene.tweens.add({
      targets: scene.languageIcon,
      x: scene.languageIcon.width - 20,
      duration: 800,
      ease: 'Back.Out',
      onComplete: () => scene.languageIcon.setInteractive()
    });
    scene.languageIcon.on('pointerdown', () => {
      audio.playSound('systemOk', scene);
      gameSystem.flashFill(scene.languageIcon, 0xffffff, 1, 200);
      currentLang = (currentLang + 1) % languages.length;
      SaveGame.saveGameValue('language', languages[currentLang]);
      scene.languageIcon.disableInteractive();
      updateTitleTexts(scene);
      scene.tweens.add({
        targets: scene.languageIcon,
        x: -scene.languageIcon.width,
        duration: 300,
        ease: 'Back.In',
        onComplete: () => {
          scene.languageIcon.setFrame(currentLang);
          scene.languageIcon.x = -scene.languageIcon.width;
          scene.tweens.add({
            targets: scene.languageIcon,
            x: scene.languageIcon.width - 20,  
            duration: 800,
            ease: 'Back.Out',
            onComplete: () => {
              scene.languageIcon.setInteractive();
            }
          });
        }
      });
    });
    
    
    
    
  

  // Create language buttons
  socials.forEach((s, i) => {
  const sprite = scene.add.sprite(scene.scale.width+48, s.y, 'socials')
    .setFrame(s.frame)
    .setDepth(50000)
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .disableInteractive();
    scene.socialButtons.push(sprite);
    scene.tweens.add({
    targets: sprite,
    x: scene.scale.width - (sprite.width-20),
    duration: 800,
    ease: 'Back.Out',
    onComplete: () => sprite.setInteractive()
  });
  sprite.on('pointerdown', () => {
    audio.playSound('systemOk',scene)
    gameSystem.flashFill(sprite, 0xffffff, 1, 200);
    scene.time.delayedCall(300, () => {
      window.open(s.key, '_blank');
    })
  });
 })
}

function createTitleCommands(scene) {
  let buttonsEnabled = 0;
  scene.titleCommand = null;
  scene.titleButtons = []; // store buttons to update later

  const centerX = scene.scale.width / 2;
  const centerY = scene.scale.height / 2;
  const spacing = 70;
  const buttonKeys = ['newGame', 'continue', 'options', 'exit'];

  buttonKeys.forEach((key, index) => {
    const label = lang.Text(key);
    const y = centerY + (index - 1) * spacing;
    const button = scene.add.sprite(centerX, y, 'commandBorder')
      .setFrame(0)
      .setDepth(50000)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0);

    const buttonText = scene.add.text(centerX, y, label, {
      fontFamily: 'DefaultFont',
      fontSize: '24px',
      stroke: '#3a3a50',
      strokeThickness: 4,
      color: '#ebe4f2',
      padding: { top: 8, bottom: 4 },
      align: 'center'
    }).setOrigin(0.5).setDepth(50001).setAlpha(0);

    scene.titleButtons.push({ key, buttonText });

    scene.tweens.add({
      targets: [button, buttonText],
      alpha: 1,
      duration: 800,
      ease: 'Power1',
      onComplete: () => {
        buttonsEnabled += 1;
      }
    });

    button.on('pointerdown', () => {
      if (buttonsEnabled != 4) return;
      if (scene.titleCommand !== null) return;
      gameSystem.flashFill(button, 0xffffff, 1, 200);
      createOptions(scene);
      scene.titleCommand = key;
      audio.playSound('systemOk', scene);
      console.log(`${key} clicked`);
    });
  });
}


function updateTitleTexts(scene) {
  scene.titleButtons.forEach(({ key, buttonText }) => {
    buttonText.setText(lang.Text(key));
  });
}

function carsInit(scene){
  scene_room.createCars(scene)
  scene.time.delayedCall(1000, () => {
    scene_room.scheduleCarSpawn(scene, 'car1');
    scene_room.scheduleCarSpawn(scene, 'car2');
   }); 
}

function startBgm(scene){
  scene.bgm = audio.playSound('bgm001',scene,true)
} 


function createOptions(scene) {
  const sliderWidth = 250;
  const sliderHeight = 10;
  const knobRadius = 10;
  const centerX = scene.scale.width / 2;
  const centerY = scene.scale.height / 2;
  const sliders = [];
  const volumeValues = [
    SaveGame.loadGameValue('bgmVolume'), // Music volume
    SaveGame.loadGameValue('sfxVolume')  // SFX volume
  ];

  const optionsBorder = scene.add.sprite(0,0,'optionsBorder')
  .setDepth(89999)
  .setOrigin(0.5,0.5)
  optionsBorder.setPosition(scene.scale.width / 2, scene.scale.height / 2);
  // Initialize index outside of the function
  let index = 0;
  const createSlider = (label, yOffset, setVolumeCallback) => {
      const sliderX = centerX - sliderWidth / 2;
      const sliderY = centerY + yOffset;
      const gauge = scene.add.graphics();
      gauge.setDepth(90000);
      gauge.fillStyle(0x666666);
      gauge.fillRect(sliderX, sliderY - sliderHeight / 2, sliderWidth, sliderHeight);
      const knob = scene.add.graphics();
      knob.setDepth(90000);
      knob.fillStyle(0xffffff);
      knob.fillCircle(sliderX + sliderWidth * volumeValues[index], sliderY, knobRadius);
      const knobHit = scene.add.circle(sliderX + sliderWidth * volumeValues[index], sliderY, knobRadius, 0x000000, 0);
      knobHit.setDepth(90000);
      knobHit.setInteractive({ draggable: true });
      const labelText = scene.add.text(centerX, sliderY - 40, label, {
          fontFamily: 'DefaultFont',
          fontSize: '24px',
          stroke: '#3a3a50',
          strokeThickness: 4,
          color: '#ebe4f2'
      }).setOrigin(0.5);
      labelText.setDepth(90000);
      sliders.push({
          knobGraphic: knob,
          knobHit: knobHit,
          x: sliderX,
          y: sliderY,
          width: sliderWidth,
          radius: knobRadius,
          onVolumeChange: setVolumeCallback
      });
      index++;
  };

  // Create sliders
  createSlider('Music Volume', -40, volume => {
    SaveGame.saveGameValue('bgmVolume', volume);
    if (scene.bgm) {
        const baseVolume = audio.bgmVolumes(scene.bgm.key) ?? 1;
        const finalVolume = Phaser.Math.Clamp(baseVolume * volume, 0, 1);
        scene.bgm.setVolume(finalVolume);
    }
});


  createSlider('SFX Volume', 40, volume => {
      SaveGame.saveGameValue('sfxVolume', volume);
  });

  // Handle dragging sliders
  scene.input.on('drag', (pointer, gameObject, dragX) => {
      sliders.forEach(slider => {
          if (gameObject === slider.knobHit) {
              dragX = Phaser.Math.Clamp(dragX, slider.x, slider.x + slider.width);
              gameObject.x = dragX;
              slider.knobGraphic.clear();
              slider.knobGraphic.fillStyle(0xffffff);
              slider.knobGraphic.fillCircle(dragX, slider.y, slider.radius);
              const volume = (dragX - slider.x) / slider.width;
              slider.onVolumeChange(volume);
          }
      });
  });
}




function drawTilemap(scene) {
  for (let y = 0; y < scene.map_height; y++) {
    for (let x = 0; x < scene.map_width; x++) {
      const frameIndex = scene.mapData[y][x] 
      const tile = scene.add.sprite(
        x * scene.TILE_SIZE + scene.TILE_SIZE / 2,
        y * scene.TILE_SIZE + scene.TILE_SIZE / 2,
        'tilemap',
        frameIndex
      );
      tile.setOrigin(0.5);
      tile.setDepth(102)
      tile.setInteractive = false
    }
  }
}

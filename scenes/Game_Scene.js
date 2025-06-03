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

  create() {
    this.usedChairs = []
    this.clients = []
    this.clientsWaiting = []
    this.gameActive = false
    this.currentClient = null
    sprites.load_animations(this);
    tileMap.setTilemap(this)
    gameSystem.createClock(this)
    gameSystem.createRoom(this)
    drinks.createDrinkTable(this)
    player.createPlayer(this)
    gameSystem.setEntityPos(this,this.player,6,8)

    zul.createZul(this)
    zul.setZulPos(this, 6, 8)
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
      console.log(this.tickets)
     // this.scene.manager.scenes.forEach(scene => {
      //  console.log(`Scene Key: ${scene.scene.key}, Active: ${scene.scene.isActive()}, Visible: ${scene.scene.isVisible()}, Sleeping: ${scene.scene.isSleeping()}`);
     // });
    });

    this.input.keyboard.on('keydown-M', () => {
      let value = SaveGame.loadGameValue('money')+Math.floor(Math.random() * 500)
      gameSystem.updateMoneyValueAnimated(this,value);
    });

 


    this.time.delayedCall(200, () => {
      scene_room.carsInit(this)
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




  }

  update(time, delta) {
    if (this.dayNightOverlay) {
      gameSystem.dayNightCycle(this, delta)
    }
    if (this.clients) {
      for (let index = 0; index < this.clients.length; index++) {
        const client = this.clients[index];
        if (client.action === 'waiting') {
          scene_room.clientTime(this, client, 10 * 1000);
          client.action = 'tickets'
        } else if (client.action === 'chair') {
          scene_room.setClientMask(this,client)
          client.setDepth(199)
         } else if (client.action === 'exitA' || client.action === 'exitB') {
          client.action = 'deleting' 
          client.destroy() 
        }
      }
    }
  }

}


function createSocialButtons(scene) {
  scene.socialButtons = [];
  scene.language = null;

  const Y = scene.scale.height - 80;
  const spacing = 27;
  const socials = [
    { key: 'https://www.youtube.com/@jooyeonkim1774', frame: 0, y: Y - spacing },
    { key: 'https://www.twitch.tv/Zuljanim', frame: 1, y: Y + spacing }
  ];

  let languages = ['eng', 'kor', 'esp']
  let currentLang = languages.indexOf(SaveGame.loadGameValue('language'))
  scene.languageIcon = scene.add.sprite(0, 0, 'languageMini')
    .setFrame(currentLang)
    .setDepth(50000)
    .setOrigin(0.5)
    .setInteractive()
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
    if (scene.titleCommand !== null) return;
    audio.playSound('systemOk', scene);
    gameSystem.flashFill(scene.languageIcon, 0xffffff, 1, 200);
    currentLang = (currentLang + 1) % languages.length;
    SaveGame.saveGameValue('language', languages[currentLang]);
    scene.languageIcon.disableInteractive();
    scene.gameLogo.setFrame(currentLang)
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


  scene.gameLogo = scene.add.sprite(200, 70, 'gameLogo')
    .setFrame(currentLang)
    .setDepth(50000)
    .setOrigin(0.5)
    .setInteractive()
    .disableInteractive();
  scene.gameLogo.y = -scene.gameLogo.height
  scene.tweens.add({
    targets: scene.gameLogo,
    y: scene.gameLogo.height - 35,
    duration: 800,
    ease: 'Back.Out',
    onComplete: () => {
      scene.gameLogo.setInteractive()
    }
  });

  socials.forEach((s, i) => {
    const sprite = scene.add.sprite(scene.scale.width + 48, s.y, 'socials')
      .setFrame(s.frame)
      .setDepth(50000)
      .setOrigin(0.5)
      .setInteractive()
      .disableInteractive();
    scene.socialButtons.push(sprite);
    scene.tweens.add({
      targets: sprite,
      x: scene.scale.width - (sprite.width - 20),
      duration: 800,
      ease: 'Back.Out',
      onComplete: () => sprite.setInteractive()
    });
    sprite.on('pointerdown', () => {
      if (scene.titleCommand !== null) return;
      audio.playSound('systemOk', scene)
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
  scene.titleButtons = [];

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
      .setInteractive()
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

    scene.titleButtons.push({ key, button, buttonText });

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
      scene.titleCommand = key;
      gameSystem.flashFill(button, 0xffffff, 1, 200);
      if (key === 'newGame') {
        audio.playSound('systemNewGame', scene);
        scene.bgm.stop()
        scene.time.delayedCall(200, () => {
          setupNewGame(scene)
        })
      } else if (key === 'options') {
        audio.playSound('systemOk', scene);
        scene.time.delayedCall(200, () => {
          createOptions(scene);
        })
      }
    });
  });
}


function setupNewGame(scene) {

  scene.dayPhase = 'waiting'
  SaveGame.saveGameValue('money', 0);

  scene.tweens.add({
    targets: scene.languageIcon,
    x: -scene.languageIcon.width,
    duration: 300,
    ease: 'Back.In',
  });

  scene.tweens.add({
    targets: scene.gameLogo,
    y: -scene.gameLogo.height,
    duration: 300,
    ease: 'Back.In',
  });


  scene.titleButtons.forEach(({ button, buttonText }) => {
    scene.tweens.add({
      targets: [button, buttonText],
      alpha: 0,
      duration: 300,
      ease: 'Power1',
    });
  });


  scene.socialButtons.forEach((key, index) => {
    scene.tweens.add({
      targets: scene.socialButtons[index],
      x: scene.scale.width + scene.socialButtons[index].width,
      duration: 300,
      ease: 'Back.In',
    });
  });

  scene.time.delayedCall(100, () => {
    createLoadScreen(scene)
  })


}

function createLoadScreen(scene) {
  const bgGraphics = scene.add.graphics()
    .fillStyle(0x565973, 1)
    .fillRect(0, 0, scene.scale.width, scene.scale.height);
  bgGraphics.generateTexture('loadScreen', scene.scale.width, scene.scale.height);
  bgGraphics.destroy();
const bgImage = scene.add.image(0, 0, 'loadScreen').setOrigin(0.5); 
const loadingText = scene.add.text(0, 0, `${lang.Text('loading')}`, {
  fontFamily: 'DefaultFont',
  fontSize: '24px',
  stroke: '#3a3a50',
  strokeThickness: 4,
  color: '#ebe4f2',
  padding: { top: 8, bottom: 4 },
  align: 'center'
}).setOrigin(0.5); 
  const container = scene.add.container(scene.scale.width / 2, -scene.scale.height / 2, [bgImage, loadingText]);
  container.setDepth(900000);
  scene.tweens.add({
    targets: container,
    y: scene.scale.height / 2,
    duration: 300,
    ease: 'linear',
  });
  let dotCount = 1;
  scene.time.addEvent({
    delay: 500,
    callback: () => {
      dotCount = (dotCount % 3) + 1;
      loadingText.setText(`${lang.Text('loading')}` + '.'.repeat(dotCount));
    },
    loop: true,
  });
  scene.time.delayedCall(2000, () => {
    gameSystem.createEnergyBar(scene)
    clearTitleSprites(scene)
    scene.coffeeIcon.setVisible(true)
      scene.time.delayedCall(2000, () => {
        gameSystem.skipToTime(scene, 9)
        scene.isTimePaused = true
        audio.playSound('bgm001',scene,true)
        gameSystem.setEntityPos(scene,scene.zul,8,3)
        gameSystem.changeEntityDir(scene.zul, 'up')
        scene.time.delayedCall(10, () => {
          scene.tweens.add({
            targets: container,
            y: -scene.scale.height,
            duration: 300,
            ease: 'linear',
            onComplete: () => {
              gameSystem.showClock(scene, true)
              gameSystem.createPauseIcon(scene)
              gameSystem.entityPath(scene,scene.player,9,9,'down')
              scene.time.delayedCall(500, () => {
                scene.gameActive = true
                scene.mapData[7][9] = 2;
              //  gameSystem.entityPath(scene,scene.zul,8,6,'up')
              })
            }
          });
        })
      })


      
  })
}

function clearTitleSprites(scene){
 
  scene.languageIcon.destroy()
  scene.gameLogo.destroy()
  scene.titleButtons.forEach(({ button, buttonText }) => {
      button.destroy()
      buttonText.destroy()
  });
  scene.socialButtons.forEach((key, index) => {
    scene.socialButtons[index].destroy()
  });

}

function updateTitleTexts(scene) {
  scene.titleButtons.forEach(({ key, buttonText }) => {
    buttonText.setText(lang.Text(key));
  });
  if (scene.dayText) {
   scene.dayText.setText(`${lang.Text('day')} 1`);
  }
}


function startBgm(scene) {
  scene.bgm = audio.playSound('bgm000', scene, true)
}


function createOptions(scene) {
  const container = scene.add.container(0, 0).setDepth(89999);
  const sliderWidth = 250;
  const knobRadius = 10;
  const centerX = scene.scale.width / 2;
  const centerY = scene.scale.height / 2;
  const sliders = [];
  let knobGap = 2
  const volumeValues = [
    SaveGame.loadGameValue('bgmVolume'),
    SaveGame.loadGameValue('sfxVolume')
  ];
  const optionsBorder = scene.add.sprite(centerX, centerY, 'optionsBorder').setOrigin(0.5);
  container.add(optionsBorder);
  const topRightX = optionsBorder.x + optionsBorder.displayWidth / 2 + 10;
  const topRightY = optionsBorder.y - optionsBorder.displayHeight / 2 - 20;
  const closeBtn = scene.add.image(topRightX, topRightY, 'closeIcon').setInteractive();
  closeBtn.setOrigin(1, 0);
  closeBtn.on('pointerdown', () => {
    audio.playSound('systemClose', scene);
    scene.titleCommand = null;
    sliders.forEach(slider => {
      slider.maskShape.destroy();
      slider.barMask.destroy();
    });
    container.destroy();
  });
  container.add(closeBtn);
  let index = 0;
  const createSlider = (label, yOffset, setVolumeCallback) => {
    const sliderX = centerX - sliderWidth / 2;
    const sliderY = centerY + yOffset;
    const currentValue = volumeValues[index];
    const gauge = scene.add.sprite(centerX, sliderY, 'sliderBar').setOrigin(0.5, 0.5);
    gauge.displayWidth = sliderWidth;
    container.add(gauge);
    const fillX = sliderX + knobGap;
    const fillSprite = scene.add.sprite(fillX, sliderY, 'sliderBarFill').setOrigin(0, 0.5);
    container.add(fillSprite);
    const maskShape = scene.add.graphics();
    maskShape.fillRect(fillX, sliderY - gauge.height / 2, (sliderWidth - knobGap * 2) * currentValue, gauge.height);
    const barMask = maskShape.createGeometryMask();
    fillSprite.setMask(barMask);
    const knobX = Phaser.Math.Clamp(
      sliderX + sliderWidth * currentValue,
      sliderX + knobRadius,
      sliderX + sliderWidth - knobRadius
    );
    const knob = scene.add.sprite(knobX, sliderY, 'sliderDot');
    knob.setDepth(1);
    container.add(knob);
    const knobHit = scene.add.circle(knobX, sliderY, knobRadius, 0x000000, 0);
    knobHit.setInteractive({ draggable: true });
    container.add(knobHit);
    const labelText = scene.add.text(centerX, sliderY - 40, label, {
      fontFamily: 'DefaultFont',
      fontSize: '24px',
      stroke: '#3a3a50',
      strokeThickness: 4,
      padding: { top: 8, bottom: 4 },
      color: '#ebe4f2'
    }).setOrigin(0.5);
    container.add(labelText);
    sliders.push({
      knobSprite: knob,
      knobHit: knobHit,
      maskShape: maskShape,
      barMask: barMask,
      fillSprite: fillSprite,
      x: sliderX,
      y: sliderY,
      width: sliderWidth,
      radius: knobRadius,
      height: gauge.height,
      onVolumeChange: setVolumeCallback
    });
    index++;
  };
  createSlider(lang.Text('bgm'), -40, volume => {
    SaveGame.saveGameValue('bgmVolume', volume);
    if (scene.bgm) {
      const baseVolume = audio.bgmVolumes(scene.bgm.key) ?? 1;
      const finalVolume = Phaser.Math.Clamp(baseVolume * volume, 0, 1);
      scene.bgm.setVolume(finalVolume);
    }
  });
  createSlider(lang.Text('sfx'), 40, volume => {
    SaveGame.saveGameValue('sfxVolume', volume);
  });
  scene.input.on('drag', (pointer, gameObject, dragX) => {
    sliders.forEach(slider => {
      if (gameObject === slider.knobHit) {
        dragX = Phaser.Math.Clamp(dragX, slider.x + knobGap, slider.x + slider.width - knobGap);
        const volume = (dragX - slider.x - knobGap) / (slider.width - knobGap * 2);
        const visualX = Phaser.Math.Clamp(dragX, slider.x + slider.radius, slider.x + slider.width - slider.radius);
        gameObject.x = visualX;
        slider.knobSprite.setX(visualX);
        slider.maskShape.clear();
        slider.maskShape.fillRect(
          slider.x + knobGap,
          slider.y - slider.height / 2,
          (slider.width - knobGap * 2) * volume,
          slider.height
        );
        slider.onVolumeChange(volume);
      }
    });
  });
  return container;
}

function drawTilemap(scene) {
  // Destroy existing tiles if any
  if (scene.tiles) {
    scene.tiles.forEach(tile => tile.destroy());
  }

  // Initialize tiles array
  scene.tiles = [];

  // Loop through map data and create tiles
  for (let y = 0; y < scene.map_height; y++) {
    for (let x = 0; x < scene.map_width; x++) {
      const frameIndex = scene.mapData[y][x];
      let tile = scene.add.sprite(
        x * scene.TILE_SIZE + scene.TILE_SIZE / 2,
        y * scene.TILE_SIZE + scene.TILE_SIZE / 2,
        'tilemap',
        frameIndex
      );
      tile.setOrigin(0.5);
      tile.setDepth(102);
      tile.setInteractive = false;

      // Store tile
      scene.tiles.push(tile);
    }
  }
}


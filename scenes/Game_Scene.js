import * as sprites from '../assets/scripts/sprites.js';
import * as audio from '../assets/scripts/audio.js';
import * as gameSystem from '../assets/scripts/gameSystem.js';
import * as scene_room from '../assets/scripts/scene_room.js';
import * as drinks from '../assets/scripts/drinks.js';
import * as player from '../assets/scripts/player.js';
import * as zul from '../assets/scripts/zul.js';
import * as tileMap from '../assets/scripts/tileMap.js';

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
      //  startBgm(this)
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
    audio.playSound('systemOk')
    gameSystem.flashFill(sprite, 0xffffff, 1, 200);
    scene.time.delayedCall(300, () => {
      window.open(s.key, '_blank');
    })
  });
 })

}
function createTitleCommands(scene){

  const centerX = scene.scale.width / 2;
  const centerY = scene.scale.height / 2;
  const spacing = 70;
  
  const buttonLabels = ['New Game', 'Continue', 'Exit'];
  const buttons = [];
  
  buttonLabels.forEach((label, index) => {
    const y = centerY + (index - 1) * spacing;
  
    const button = scene.add.sprite(centerX, y, 'commandBorder')
      .setFrame(0)
      .setDepth(50000)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0); // Start transparent
  
    const buttonText = scene.add.text(centerX, y, label, {
      fontFamily: 'DefaultFont',
      fontSize: '24px',
      stroke: '#3a3a50',
      strokeThickness: 4,
      color: '#ebe4f2'
    }).setOrigin(0.5).setDepth(50001).setAlpha(0); // Start transparent
  
    buttons.push({ button, buttonText });
  
    // Tween to fade in both button and text
    scene.tweens.add({
      targets: [button, buttonText],
      alpha: 1,
      duration: 800,
      delay: index * 200, // stagger fade-in
      ease: 'Power1'
    });
  
    button.on('pointerdown', () => {
      audio.playSound('systemOk')
      console.log(`${label} clicked`);
    });
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
  scene.bgm = audio.playSound('bgm001')
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

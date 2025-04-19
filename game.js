import * as sprites from './assets/scripts/sprites.js';
import * as audio from './assets/scripts/audio.js';
import * as gameSystem from './assets/scripts/gameSystem.js';
import * as drinks from './assets/scripts/drinks.js';
import * as player from './assets/scripts/player.js';
import * as npcs from './assets/scripts/npcs.js';

import Intro_Scene from './scenes/Intro_Scene.js';
import Language_Scene from './scenes/Language_Scene.js';
import Game_Scene from './scenes/Game_Scene.js';

document.addEventListener('contextmenu', (event) => {
   event.preventDefault();
});


document.fonts.load('16px DefaultFont').then(() => {
  const config = {
    type: Phaser.AUTO,
    width: 384,
    height: 736,
    parent: 'game-container',
    pixelArt: true,
    backgroundColor: 'transparent',
    transparent: true,
    scene: [Intro_Scene,Language_Scene,Game_Scene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    }
  };
  
  const game = new Phaser.Game(config);
  
});



function preload() {
  audio.load_audio(this)
  sprites.load_sprites(this);
}



// ██████████████████ //
//     UPDATE         //
// ██████████████████ //
function update(time, delta) {

}

// ██████████████████ //
//     CREATE         //
// ██████████████████ //
function create() {

  
 
  audio.init_audio(this)
  //
  //drawDebugGrid(this);
//audio.playSound('bgm001')


this.input.keyboard.on('keydown-T', () => {
  gameSystem.skipToTime(this,15); 
  //const time = this.getCurrentTime();
 // console.log(`🕒 ${time.hour}:${String(time.minute).padStart(2, "0")}`);
});

this.input.keyboard.on('keydown-Q', () => {
  this.sound.sounds.forEach(sound => {
    console.log(`Sound key: ${sound.key}, isPlaying: ${sound.isPlaying}`);
});
});

this.input.keyboard.on('keydown-S', () => {
  const keys = this.children.list
  .filter(child => child instanceof Phaser.GameObjects.Sprite)
  .map(child => child.texture.key);
  console.log(keys);
});

this.npcs = [];
this.npcMovementFlags = [];  




  
  /*
  
  gameSystem.createEnergyBar(this)
  gameSystem.createClock(this)
  gameSystem.skipToTime(this,9); 
  
  

  npcs.createNpc(this,0,21)
  npcs.MoveNpcTo(this,0,4,21,3)

    */
}


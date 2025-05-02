import * as gameSystem  from './gameSystem.js';
import * as audio from './audio.js';
import * as player from './player.js';


export function setDrinksData(scene){
    scene.drinks = {
     water: [1,15,30,1],
     coffee: [2,25,60*3,0.75],
    } 
 } 

export function createDrinkTable(scene){
     setDrinksData(scene)
     scene.coffeeTable = scene.add.sprite(10 * scene.TILE_SIZE + scene.TILE_SIZE / 2, 10 * scene.TILE_SIZE + scene.TILE_SIZE / 2, 'coffeeTable')
        .setDepth(10)
        .setInteractive()
        .setFrame(1)
      scene.coffeeTable.onCoolDown = false
      // █ on click table █ //
      scene.coffeeTable.on('pointerdown', (pointer) => {
          if (pointer.leftButtonDown()) {
            if (scene.gameActive === false) return
            if (scene.activePath || scene.coffeeIcon.alpha != 1) return
            let tileX = Math.floor(scene.player.x / scene.TILE_SIZE)
            let tileY = Math.floor((scene.player.y + scene.player.height / 2) / scene.TILE_SIZE)-1
            let inRange = scene.mapData[tileY][tileX] === 4
            if (inRange && !scene.coffeeIcon.onCoolDown) {
              let drink = scene.coffeeIcon.drinkData
              let newEnergy = scene.energy[0]+drink[1]
              player.changePlayerDir(scene,scene.player,scene.coffeeTable)
              audio.playSound('coffee',scene)
              gameSystem.updateEnergy(scene,newEnergy)
              generateNewDrink(scene)
              let newCoolDown = scene.coffeeIcon.drinkData[2]
              setDrinkCoolDown(scene,newCoolDown)
            }
          }
        })
      scene.coffeeIcon = scene.add.sprite(0,0,'coffeeIcon')
      .setDepth(100)
      .setVisible(false)
      scene.coffeeIcon.onCoolDown = false
      scene.coffeeIcon.drinkData = scene.drinks.water
      scene.coffeeIcon.type = "drink"
      scene.coffeeIcon.setPosition(scene.coffeeTable.x-1,scene.coffeeTable.y-50)
      scene.tweens.add({
        targets: scene.coffeeIcon,
        y: scene.coffeeIcon.y - 5,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
 } 

export function generateNewDrink(scene){
 let randomDrinks = []
 for (let key in scene.drinks) {
    const values = scene.drinks[key];
    if (Math.random() < values[3]) {
     randomDrinks.push(key)
    }
  }  
  let randomIndex = randomDrinks[Math.floor(Math.random() * randomDrinks.length)]
  scene.coffeeIcon.drinkData = scene.drinks[randomIndex]
  scene.coffeeIcon.setFrame(scene.coffeeIcon.drinkData[0]-1)
}

 export function setCoffeeTableSprite(scene){
    let index = scene.coffeeIcon.drinkData[0]
    scene.coffeeTable.setFrame(index)
  }

 export function setDrinkCoolDown(scene,time){
  scene.time.delayedCall(100, () => {
    player.playerJump(scene)
  });   
    scene.coffeeTable.setFrame(0)
    scene.coffeeIcon.onCoolDown = true
    gameSystem.startCooldown(scene,scene.coffeeIcon,time*1000);
  }

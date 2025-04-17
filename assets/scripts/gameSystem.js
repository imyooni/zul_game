export function updateEnergy(scene, newEnergy) {
    const fullHeight = scene.energyFill.height;
    const current = scene.energy[0];
    const max = scene.energy[1];
    newEnergy = Phaser.Math.Clamp(newEnergy, 0, max);
    const fromHeight = fullHeight * (current / max);
    const toHeight = fullHeight * (newEnergy / max);
    const x = scene.energyFill.x - scene.energyFill.width / 2;
    const yBottom = scene.energyFill.y;
    scene.energy[0] = newEnergy;
    scene.energyText.setText(`${scene.energy[0]}`);

    
    const index = getEnergyColor(newEnergy, max)
    scene.energyFill.setFrame(index)

    scene.tweens.addCounter({
      from: fromHeight,
      to: toHeight,
      duration: 300,
      ease: 'Cubic.Out',
      onUpdate: tween => {
        const h = tween.getValue();
        scene.energyMaskShape.clear();
        scene.energyMaskShape.fillRect(x, yBottom - h, scene.energyFill.width, h);
      },
      onComplete: () => {
      //  scene.energy[0] = newEnergy;
      }
    });
  }
  
  function getEnergyColor(current, max) {
    const percent = (current / max) * 100;
    if (percent > 50) return 0;       
    else if (percent > 34) return 1;  
    else if (percent > 19) return 2; 
    else return 3;                    
  }
  
  export function createEnergyBar(scene) {
    scene.energy = [100, 100];
  
    // Sprites
    scene.energyBar = scene.add.sprite(0, 0, 'energyBar').setOrigin(0.5, 1).setDepth(1000);
    scene.energyBar.x = scene.scale.width - scene.energyBar.width / 2 - 10;
    scene.energyBar.y = scene.scale.height - 80;
  
    scene.energyFill = scene.add.sprite(0, 0, 'energyFill').setOrigin(0.5, 1).setDepth(1000);
    scene.energyFill.x = scene.energyBar.x;
    scene.energyFill.y = scene.energyBar.y - (111 - 105) / 2;

  
    // Mask
    const maskShape = scene.add.graphics()
    maskShape.fillRect(
      scene.energyFill.x - scene.energyFill.width / 2,
      scene.energyFill.y - scene.energyFill.height,
      scene.energyFill.width,
      scene.energyFill.height
    );
    const energyMask = maskShape.createGeometryMask();
    scene.energyFill.setMask(energyMask);
    scene.energyMaskShape = maskShape;
  
    // Tooltip Text (initially hidden)
    
          
    scene.energyText = scene.add.text(0, 0, '', {
      fontFamily: 'DefaultFont',
      fontSize: '18px',
      stroke: '#3a3a50',         // stroke (outline) color
      strokeThickness: 4,        // outline thickness
      fill: '#ffffff',
      padding: { x: 0, y: 0 }
    }).setDepth(1002).setVisible(false);

    scene.energyBorder = scene.add.sprite(0, 0, 'energyBorder')
    .setDepth(1000)
    .setVisible(false);
    scene.energyBar.setInteractive();
  
    scene.energyBar.on('pointerover', () => {
        const colors = ['#00ff00','#ffff00','#ffa500','#ff0000']
        const [current, max] = scene.energy;
        const color = colors[getEnergyColor(current, max)];
        scene.energyText.setText(`${scene.energy[0]}`);
        scene.energyText.setStyle({ fill: color });
        scene.energyBorder.setVisible(true)
        scene.energyText.setVisible(true);
      });
      
      scene.energyBar.on('pointermove', () => {
        scene.energyText.setPosition(
            scene.energyBar.x - scene.energyText.width / 2,
            scene.energyBar.y - scene.energyBar.height - 31
          );
          
          scene.energyBorder.setPosition(
            scene.energyBar.x, // centered like text
            scene.energyBar.y - scene.energyBar.height - 20
          );
     
      });
      
    // Hide text on pointer out
    scene.energyBar.on('pointerout', () => {
      scene.energyBorder.setVisible(false);
      scene.energyText.setVisible(false);
    });
  }
  
  
  
export function updateEnergy(scene, newEnergy) {
    const fullHeight = scene.energyFill.height;
    const current = scene.energy[0];
    const max = scene.energy[1];
    newEnergy = Phaser.Math.Clamp(newEnergy, 0, max);
    const fromHeight = fullHeight * (current / max);
    const toHeight = fullHeight * (newEnergy / max);
    const x = scene.energyFill.x - scene.energyFill.width / 2;
    const yBottom = scene.energyFill.y;
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
        scene.energy[0] = newEnergy;
      }
    });
  }
  
  export function createEnergyBar(scene) {
    scene.energy = [100, 100];
    scene.energyBar = scene.add.sprite(0, 0, 'energyBar').setOrigin(0.5, 1).setDepth(1000);
    scene.energyBar.x = scene.scale.width - scene.energyBar.width / 2 - 10;
    scene.energyBar.y = scene.scale.height - 10;
    scene.energyFill = scene.add.sprite(0, 0, 'energyFill').setOrigin(0.5, 1).setDepth(1000);
    scene.energyFill.x = scene.energyBar.x;
    scene.energyFill.y = scene.energyBar.y - (111 - 105) / 2;
    const maskShape = scene.add.graphics().setDepth(1001);
    maskShape.fillRect(
      scene.energyFill.x - scene.energyFill.width / 2,
      scene.energyFill.y - scene.energyFill.height,
      scene.energyFill.width,
      scene.energyFill.height
    );
    const energyMask = maskShape.createGeometryMask();
    scene.energyFill.setMask(energyMask);
    scene.energyMaskShape = maskShape;
  }
  
  
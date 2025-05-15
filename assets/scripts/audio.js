import * as SaveGame from './SaveGame.js';

export function load_audio(scene) {
    // BGM
    scene.load.audio('bgm000', 'assets/audio/BGM/bgm000.ogg');
    scene.load.audio('bgm001', 'assets/audio/BGM/bgm001.ogg');

    // SFX
    scene.load.audio('zul', 'assets/audio/SFX/zul.ogg');
    scene.load.audio('coffee', 'assets/audio/SFX/coffee.ogg');
    scene.load.audio('doorBell', 'assets/audio/SFX/doorBell.ogg');
    scene.load.audio('playerStep', 'assets/audio/SFX/playerStep.ogg');
    scene.load.audio('tickets', 'assets/audio/SFX/tickets.ogg');
    scene.load.audio('systemNewGame', 'assets/audio/SFX/systemNewGame.ogg');
    scene.load.audio('systemOk', 'assets/audio/SFX/systemOk.ogg');
    scene.load.audio('systemClick', 'assets/audio/SFX/systemClick.ogg');
    scene.load.audio('systemClose', 'assets/audio/SFX/systemClose.ogg');
    scene.load.audio('systemMoney', 'assets/audio/SFX/systemMoney.ogg');
    scene.load.audio('systemSign', 'assets/audio/SFX/systemSign.ogg');
}


const sfxVolumes = {
    zul: 0.5,
    coffee: 1,
    doorBell: 1,
    playerStep: 0.5,
    tickets: 0.8,
    systemMoney: 0.9,
    systemNewGame: 1,
    systemOk: 1,
    systemClick: 1,
    systemClose: 1,
    systemSign: 1,
};


export function bgmVolumes(key)
{
  let list = {
    bgm000: 0.45,
    bgm001: 0.45,
   } 
   return list[key]
};


export function playSound(key, scene, isMusic = false) {
    const bgmValue = SaveGame.loadGameValue('bgmVolume') ?? 1;
    const sfxValue = SaveGame.loadGameValue('sfxVolume') ?? 1;
    const settingVolume = isMusic ? bgmValue : sfxValue;

    if (isMusic) {
        const baseVolume = bgmVolumes(key) ?? 1;
        const finalVolume = Phaser.Math.Clamp(baseVolume * settingVolume, 0, 1);

        if (scene.bgm) {
            scene.bgm.stop();
            scene.bgm.destroy();
        }

        scene.bgm = scene.sound.add(key, { loop: true, volume: finalVolume });
        scene.bgm.play();
        return scene.bgm;

    } else {
        const baseVolume = sfxVolumes[key] ?? 1;
        const finalVolume = Phaser.Math.Clamp(baseVolume * settingVolume, 0, 1);
        scene.sound.play(key, { volume: finalVolume });
        return null;
    }
}





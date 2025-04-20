
export function load_audio(scene) {
    // BGM
    scene.load.audio('bgm001', 'assets/audio/BGM/bgm001.mp3');

    // SFX
    scene.load.audio('zul', 'assets/audio/SFX/zul.ogg');
    scene.load.audio('coffee', 'assets/audio/SFX/coffee.ogg');
    scene.load.audio('playerStep', 'assets/audio/SFX/playerStep.ogg');
    scene.load.audio('systemOk', 'assets/audio/SFX/systemOk.ogg');
}

let sounds = {};
export function init_audio(scene) {
    sounds['zul'] = scene.sound.add('zul', { loop: false, volume: 0.25 });
    sounds['bgm001'] = scene.sound.add('bgm001', { loop: true, volume: 0.4 });
    sounds['coffee'] = scene.sound.add('coffee', { loop: false, volume: 0.35 });
    sounds['playerStep'] = scene.sound.add('playerStep', { loop: false, volume: 0.10 });
    sounds['systemOk'] = scene.sound.add('systemOk', { loop: false, volume: 0.35 });
}

export function playSound(key) {
    const sound = sounds[key];
    if (sound) {
        sound.play();
    } else {
        console.warn(`Sound '${key}' not found!`);
    }
}
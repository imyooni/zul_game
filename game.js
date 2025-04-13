const config = {
  type: Phaser.AUTO,
  width: 386,
  height: 750,
  parent: 'game-container',
  backgroundColor: 'transparent', // key part!
  scene: {
    preload,
    create,
    update
  },
  transparent: true // this makes Phaser canvas respect transparency
};

const game = new Phaser.Game(config);

function preload () {}
function create () {}
function update () {}

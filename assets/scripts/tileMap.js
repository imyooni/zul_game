export function setTilemap(scene) {
    scene.TILE_SIZE = 32;
    scene.map_width = 12;
    scene.map_height = 23;
    scene.mapData = [];
    for (let y = 0; y < scene.map_height; y++) {
      const row = [];
      for (let x = 0; x < scene.map_width; x++) {
        row.push(0)
      }
      scene.mapData.push(row);
    }
    let blockedTiles = [
      [0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8], [0, 9], [0, 10], [0, 11],
      [7, 0], [7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6], [7, 7], [7, 8], [7, 10], [7, 11],
      [8, 0], [8, 3], [8, 4], [8, 11], [8, 7],
      [9, 0], [9, 1], [9, 3], [9, 4], [9, 11],
      [10, 0], [10, 10], [10, 11],
      [11, 0], [11, 11],
      [12, 0], [12, 11],
      [13, 0], [13, 11],
      [14, 0], [14, 11],
      [15, 0], [15, 11],
      [16, 0], [16, 11],
      [17, 0], [17, 1], [17, 2], [17, 3], [17, 5], [17, 6], [17, 7], [17, 10], [17, 11],
      [18, 0], [18, 1], [18, 2], [18, 3], [18, 5], [18, 6], [18, 7], [18, 10], [18, 11],
      [19, 0], [19, 7], [19, 10], [19, 11],
      [20, 0], [20, 1], [20, 2], [20, 3], [20, 4], [20, 5], [20, 6], [20, 7], [20, 10], [20, 11],
    ]
    let coffeeTiles = [
     [9,10],[10,9],[11,10]
    ]
    for (let index = 0; index < coffeeTiles.length; index++) {
      let id = coffeeTiles[index]
      scene.mapData[id[0]][id[1]] = 4;
    }
  
    let playerlockedTiles = [
      [11, 1], [11, 2], [11, 3], [11, 4], [11, 5], [11, 6],
     //[7, 9],
      [13, 1], [13, 2], [13, 3], [13, 4], [13, 5], [13, 6],
      [15, 1], [15, 2], [15, 3], [15, 4], [15, 5], [15, 6],
    ]
    for (let index = 0; index < playerlockedTiles.length; index++) {
      let id = playerlockedTiles[index]
      scene.mapData[id[0]][id[1]] = 2;
    }
    let npclockedTiles = [
      [12, 1], [12, 2], [12, 3], [12, 4], [12, 5], [12, 6],
      [14, 1], [14, 2], [14, 3], [14, 4], [14, 5], [14, 6],
    //  [16, 1], [16, 2], [16, 3], [16, 4], [16, 5], [16, 6],
    ]
    for (let index = 0; index < npclockedTiles.length; index++) {
      let id = npclockedTiles[index]
      scene.mapData[id[0]][id[1]] = 3;
    }
    for (let index = 0; index < blockedTiles.length; index++) {
      let id = blockedTiles[index]
      scene.mapData[id[0]][id[1]] = 1;
    }
  }
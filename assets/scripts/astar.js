// astar.js

export class AStar {
    constructor(mapData) {
      this.mapData = mapData;
      this.openList = [];
      this.closedList = [];
      this.path = [];
    }
  
    findPath(startX, startY, endX, endY) {
      const startNode = {
        x: startX,
        y: startY,
        g: 0,
        h: this.heuristic(startX, startY, endX, endY),
        parent: null
      };
  
      const endNode = { x: endX, y: endY };
  
      this.openList.push(startNode);
  
      while (this.openList.length > 0) {
        let currentNode = this.getLowestFNode();
  
        if (currentNode.x === endNode.x && currentNode.y === endNode.y) {
          this.retracePath(startNode, currentNode);
          return this.path;
        }
  
        this.openList = this.openList.filter(node => node !== currentNode);
        this.closedList.push(currentNode);
  
        let neighbors = this.getNeighbors(currentNode);
  
        for (let neighbor of neighbors) {
          if (this.isInClosedList(neighbor)) continue;
  
          let gCost = currentNode.g + 1;
          if (!this.isMoveAllowed(currentNode, neighbor)) continue;
  
          let hCost = this.heuristic(neighbor.x, neighbor.y, endX, endY);
          let fCost = gCost + hCost;
  
          let openNode = this.getNodeFromList(this.openList, neighbor);
          if (!openNode || fCost < openNode.g + openNode.h) {
            neighbor.g = gCost;
            neighbor.h = hCost;
            neighbor.parent = currentNode;
  
            if (!openNode) {
              this.openList.push(neighbor);
            }
          }
        }
      }
  
      return [];
    }
  
    heuristic(x1, y1, x2, y2) {
      return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }
  
    getNeighbors(node) {
      const directions = [
        { dx: 0, dy: -1 }, // Up
        { dx: 0, dy: 1 },  // Down
        { dx: -1, dy: 0 }, // Left
        { dx: 1, dy: 0 }   // Right
      ];
  
      let neighbors = [];
  
      for (let dir of directions) {
        const nx = node.x + dir.dx;
        const ny = node.y + dir.dy;
  
        if (this.isValidTile(nx, ny)) {
          neighbors.push({ x: nx, y: ny });
        }
      }
  
      return neighbors;
    }
  
    isValidTile(x, y) {
      return x >= 0 && x < map_width && y >= 0 && y < map_height;
    }
  
    isMoveAllowed(fromNode, toNode) {
      const dx = toNode.x - fromNode.x;
      const dy = toNode.y - fromNode.y;
  
      const fromTile = this.mapData[fromNode.y][fromNode.x];
      const toTile = this.mapData[toNode.y][toNode.x];
  
      if (dy === -1 && fromTile.blockFrom.top) return false;
      if (dy === 1 && fromTile.blockFrom.bottom) return false;
      if (dx === -1 && fromTile.blockFrom.right) return false;
      if (dx === 1 && fromTile.blockFrom.left) return false;
  
      return true;
    }
  
    retracePath(startNode, endNode) {
      let currentNode = endNode;
      while (currentNode !== startNode) {
        this.path.push(currentNode);
        currentNode = currentNode.parent;
      }
      this.path.reverse();
    }
  
    getLowestFNode() {
      let lowestFNode = this.openList[0];
      for (let node of this.openList) {
        if (node.g + node.h < lowestFNode.g + lowestFNode.h) {
          lowestFNode = node;
        }
      }
      return lowestFNode;
    }
  
    isInClosedList(node) {
      return this.closedList.some(n => n.x === node.x && n.y === node.y);
    }
  
    getNodeFromList(list, node) {
      return list.find(n => n.x === node.x && n.y === node.y);
    }
  }
  
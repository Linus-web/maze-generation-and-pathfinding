let cols, rows;
let grid;
let w;
let startCell;
let stuck;
let stack = [];
let doingMaze = true;
let doingAStar = false;

let openSet = [];
let closedSet = [];

let endCol, endRow;

let bestPath = [];

let totalSearched = 0;

function setup() {
  let tGrid = new Grid(50, 20);
  grid = tGrid.grid;
  cols = grid.length;
  rows = grid[0].length;
  w = 25;
  createCanvas(cols * w, rows * w);
  frameRate(30);

  current = grid[0][0];
  openSet.push(current);
  current.isInOpenSet = true;
  current.start = true;
  current.searched = true;
  stack.push(current);

  endCol = Math.floor(Math.random() * cols);
  endRow = Math.floor(Math.random() * rows);

  grid[endCol][endRow].end = true;

  tGrid.depthFirstBacktracker;
}

function draw() {
  background(0);
  for (let j = 0; j < cols; j++) {
    for (let i = 0; i < rows; i++) {
      grid[j][i].show();
    }
  }
  if (doingMaze) {
    while (doingMaze) doMaze();
  } else if (doingAStar) {
    aStar();
  }
}

function removeWalls(currCell, nextCell) {
  x = nextCell.row - currCell.row;
  y = nextCell.col - currCell.col;

  if (y === 1) {
    currCell.walls[1] = false;
    nextCell.walls[3] = false;
  }
  if (y === -1) {
    currCell.walls[3] = false;
    nextCell.walls[1] = false;
  }
  if (x === 1) {
    currCell.walls[2] = false;
    nextCell.walls[0] = false;
  }
  if (x === -1) {
    currCell.walls[0] = false;
    nextCell.walls[2] = false;
  }
}

function checkWalls() {
  for (let j = 0; j < cols; j++) {
    for (let i = 0; i < rows; i++) {
      grid[j][i].checkNeighbourWalls();
    }
  }
}

function doMaze() {
  current.visited = true;
  current.current = false;
  let next = current.checkNeighbours();
  if (!stuck) {
    removeWalls(current, next);
    current = next;
    current.current = true;
    current.isInStack = true;
    stack.push(current);
  } else {
    if (stack.length > 1) {
      stuck = false;
      current.isInStack = false;
      stack.pop();
      if (stack[stack.length - 1]) current = stack[stack.length - 1];
    } else {
      checkWalls();
      doingMaze = false;
      doingAStar = true;
    }
  }
}

function removeFromArray(arr, elt) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] == elt) {
      arr.splice(i, 1);
    }
  }
}

function heuristic(a, b) {
  return dist(a.col, a.row, b.col, b.row);
}

function aStar() {
  totalSearched++;
  if (openSet.length > 0) {
    let lowestIndex = 0;

    for (let i = 0; i < openSet.length; i++) {
      if (openSet[i].fScore < openSet[lowestIndex].fScore) {
        lowestIndex = i;
      }
    }

    let current = openSet[lowestIndex];

    if (current.end) {
      let temp = current;
      bestPath.push(temp);
      while (temp.parent) {
        bestPath.push(temp.parent);
        temp = temp.parent;
        temp.isBest = true;
      }
      doingAStar = false;
      console.log(grid)
      return;
    }

    removeFromArray(openSet, current);
    current.isInClosedSet = true;
    current.isInOpenSet = false;
    closedSet.push(current);

    let neighbours = current.neighbours;
    for (let i = 0; i < neighbours.length; i++) {
      let neighbour = neighbours[i];

      if (!neighbour.isInClosedSet) {
        tempGScore = current.gScore + 1;
        if (neighbour.isInOpenSet) {
          if (tempGScore < neighbour.gScore) {
            neighbour.gScore = tempGScore;
          }
        } else {
          neighbour.gScore = tempGScore;
          neighbour.isInOpenSet = true;
          neighbour.searched = true;
          openSet.push(neighbour);
        }

        neighbour.h = heuristic(neighbour, grid[endCol][endRow]);
        neighbour.fScore = neighbour.gScore + neighbour.h*50;
        neighbour.parent = current;
      }
    }
  }
}

class Cell {
  constructor(col, row) {
    this.row = row;
    this.col = col;
    this.visited = false;
    this.walls = [true, true, true, true];
    this.isInStack = false;
    this.start = false;
    this.current = false;
    this.end = false;
    this.isInOpenSet = false;
    this.isInClosedSet = false;
    this.fScore = 0;
    this.gScore = 0;
    this.h = 0;
    this.neighbours = [];
    this.searched = false;
    this.isBest = false;
    this.parent = undefined;
  }

  checkNeighbourWalls() {
    if (!this.walls[0] && grid[this.col][this.row - 1])
      this.neighbours.push(grid[this.col][this.row - 1]);
    if (!this.walls[1] && grid[this.col + 1][this.row])
      this.neighbours.push(grid[this.col + 1][this.row]);
    if (!this.walls[2] && grid[this.col][this.row + 1])
      this.neighbours.push(grid[this.col][this.row + 1]);
    if (!this.walls[3] && grid[this.col - 1][this.row])
      this.neighbours.push(grid[this.col - 1][this.row]);
  }

  show() {
    let x = this.col * w;
    let y = this.row * w;

    if (this.visited) {
      noStroke();
      fill(255);
      rect(x, y, w, w);
    } else {
      noStroke();
      fill(170);
      rect(x, y, w, w);
    }

    if (doingMaze) {
      if (this.isInStack) {
        fill("rgb(170,80,90)");
        rect(x, y, w, w);
      }
      if (this.current) {
        fill("rgb(80,125,185)");
        rect(x, y, w, w);
      }
      if (this.start) {
        fill("rgb(0,210,0)");
        rect(x, y, w, w);
      }
      if (this.end) {
        fill("rgb(255,0,255)");
        rect(x, y, w, w);
      }
    } else{
      if (this.isInOpenSet) {
        fill("rgb(255,255,0)");
        rect(x, y, w, w);
      }
      if (this.searched) {
        fill("rgb(255,170,0)");
        rect(x, y, w, w);
      }
      if (this.isBest) {
        fill("rgb(255,120,0)");
        rect(x, y, w, w);
      }
      if (this.start) {
        fill("rgb(0,210,0)");
        rect(x, y, w, w);
      }
      if (this.end) {
        fill("rgb(255,0,255)");
        rect(x, y, w, w);
      }
    }

    stroke(0);
    strokeWeight(5)
    strokeCap(SQUARE)
    if (this.walls[0]) {
      line(x, y, x + w, y);
    }
    if (this.walls[1]) {
      line(x + w, y, x + w, y + w);
    }
    if (this.walls[2]) {
      line(x, y + w, x + w, y + w);
    }
    if (this.walls[3]) {
      line(x, y + w, x, y);
    }
  }

  checkNeighbours() {
    let neighbours = [];
    let top = grid[this.col - 1];
    if (top) {
      if (!grid[this.col - 1][this.row].visited)
        neighbours.push(grid[this.col - 1][this.row]);
    }
    let right = grid[this.col][this.row + 1];
    if (right && !right.visited) {
      neighbours.push(grid[this.col][this.row + 1]);
    }
    let bottom = grid[this.col + 1];
    if (bottom) {
      if (!grid[this.col + 1][this.row].visited)
        neighbours.push(grid[this.col + 1][this.row]);
    }
    let left = grid[this.col][this.row - 1];
    if (left && !left.visited) {
      neighbours.push(grid[this.col][this.row - 1]);
    }

    if (neighbours.length > 0) {
      let r = Math.floor(Math.random() * neighbours.length);
      return neighbours[r];
    } else {
      stuck = true;
      return stack[stack.length - 1];
    }
  }
}

class Grid {
  constructor(cols, rows) {
    this.grid = new Array(cols).fill(null).map((x) => Array(rows).fill(null));
    for (let j = 0; j < cols; j++) {
      for (let i = 0; i < rows; i++) {
        this.grid[j][i] = new Cell(j, i);
      }
    }
  }
}

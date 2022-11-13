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
let tempClosedSet;
let endCol, endRow;

let bestPath = [];

function setup() {
  let tGrid = new Grid(50, 50);
  grid = tGrid.grid;
  cols = grid.length;
  rows = grid[0].length;
  w = 10;
  createCanvas(cols * w, rows * w);
  frameRate(60);
  startCell = grid[1][1];
  current = startCell;
  openSet.push(current);
  current.isInOpenSet = true;
  current.start = true;
  current.searched = true;
  current.isWall = false;
  stack.push(current);

  endCol = Math.floor(Math.random() * cols);
  endRow = Math.floor(Math.random() * rows);

  grid[endCol][endRow].end = true;

  // RandomWalls()
}

function draw() {
  background(0);
  for (let j = 0; j < cols; j++) {
    for (let i = 0; i < rows; i++) {
      grid[j][i].show();
    }
  }
  if (doingMaze) {
    time1 = Date.now();
    RandomWalls();
    time2 = Date.now();
    console.log(`it took ${time2 - time1} milliseconds to generate a maze`);
  } else if (doingAStar) {
    time3 = Date.now();
      while(doingAStar)aStar();
    time4 = Date.now();
    if (bestPath.length > 0)
      console.log(
        `it took ${
          time4 - time3
        } milliseconds to pathfind and it the shortest path is ${
          bestPath.length
        } steps`
      );
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

function DFSMaze() {
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

function RandomWalls() {
  for (let j = 0; j < cols; j++) {
    for (let i = 0; i < rows; i++) {
      grid[j][i].walls = [false, false, false, false];
      grid[j][i].visited = true;
    }
  }

  for (let j = 0; j < cols; j++) {
    for (let i = 0; i < rows; i++) {
      let r = Math.floor(Math.random() * 2);
      if (r == 1) grid[j][i].isWall = true;
    }
  }

  doingMaze = false;
  doingAStar = true;
  grid[endCol][endRow].isWall = false;
  startCell.isWall = false;
  checkWalls();
}

function ownWall() {
  for (let j = 0; j < cols; j++) {
    for (let i = 0; i < rows; i++) {
      grid[j][i].walls = [false, false, false, false];
      grid[j][i].visited = true;
    }
  }

  for (let i = 0; i < rows; i++) {
    grid[0][i].isWall = true;
    grid[grid.length - 1][i].isWall = true;
  }
  for (let i = 0; i < cols; i++) {
    grid[i][0].isWall = true;
    grid[i][grid[0].length - 1].isWall = true;
  }

  checkWalls();
  doingMaze = false;
  doingAStar = true;
}

function removeFromArray(arr, elt) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] == elt) {
      arr.splice(i, 1);
    }
  }
}

function heuristic(a, b) {
  let y = 0;
  let x = 0;

  if (b.col - a.col >= 0) {
    x = b.col - a.col;
  } else {
    x = a.col - b.col;
  }

  if (b.row - a.row >= 0) {
    y = b.row - a.row;
  } else {
    y = a.row - b.row;
  }

  return x + y;
}

function aStar() {
  if (openSet.length > 0) {
    let lowestIndex = 0;

    for (let i = 0; i < openSet.length; i++) {
      if (openSet[i].fScore < openSet[lowestIndex].fScore) {
        lowestIndex = i;
      }
    }

    let current = openSet[lowestIndex];

    if (current.end) {
      console.log("DONE");
      let temp = current;
      bestPath.push(temp);
      while (temp.parent) {
        bestPath.push(temp.parent);
        temp = temp.parent;
        temp.isBest = true;
      }
      doingAStar = false;
      return;
    }

    removeFromArray(openSet, current);
    current.isInClosedSet = true;
    current.isInOpenSet = false;
    closedSet.push(current);

    let neighbours = current.neighbours;
    for (let i = 0; i < neighbours.length; i++) {
      let neighbour = neighbours[i];

      if (!neighbour.isInClosedSet && !neighbour.isWall) {
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
        neighbour.fScore = neighbour.gScore + neighbour.h;
        neighbour.parent = current;
      }
    }
  }

  if (tempClosedSet == closedSet.length) {
    doingAStar = false;
    console.log("No possible solution");
  }
  tempClosedSet = closedSet.length;
}

class Cell {
  constructor(col, row) {
    this.row = row;
    this.col = col;
    this.visited = false;
    this.isWall = false;
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
    if (!this.walls[0] && grid[this.col][this.row - 1] && !this.isWall)
      this.neighbours.push(grid[this.col][this.row - 1]);
    if (!this.walls[1] && grid[this.col + 1] && !this.isWall)
      this.neighbours.push(grid[this.col + 1][this.row]);
    if (!this.walls[2] && grid[this.col][this.row + 1] && !this.isWall)
      this.neighbours.push(grid[this.col][this.row + 1]);
    if (!this.walls[3] && grid[this.col - 1] && !this.isWall)
      this.neighbours.push(grid[this.col - 1][this.row]);

    if (
      !this.walls[0] &&
      !this.walls[1] &&
      grid[this.col][this.row - 1] &&
      grid[this.col + 1] &&
      !this.isWall
    )
      this.neighbours.push(grid[this.col + 1][this.row - 1]);
    if (
      !this.walls[1] &&
      !this.walls[2] &&
      grid[this.col + 1] &&
      grid[this.col][this.row + 1] &&
      !this.isWall
    )
      this.neighbours.push(grid[this.col + 1][this.row + 1]);
    if (
      !this.walls[2] &&
      !this.walls[3] &&
      grid[this.col - 1] &&
      grid[this.col][this.row + 1] &&
      !this.isWall
    )
      this.neighbours.push(grid[this.col - 1][this.row + 1]);
    if (
      !this.walls[3] &&
      !this.walls[0] &&
      grid[this.col][this.row - 1] &&
      grid[this.col - 1] &&
      !this.isWall
    )
      this.neighbours.push(grid[this.col - 1][this.row - 1]);
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
    } else {
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
      if (this.isWall) {
        noStroke();
        fill(0);
        rect(x, y, w, w);
      }
    }

    stroke(0);
    strokeWeight(2);
    strokeCap(SQUARE);
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
    let h = 1;
    let v = 1;
    if (top) {
      if (!grid[this.col - 1][this.row].visited)
        for (let i = 0; i < h; i++)
          neighbours.push(grid[this.col - 1][this.row]);
    }
    let right = grid[this.col][this.row + 1];
    if (right && !right.visited) {
      for (let i = 0; i < v; i++) neighbours.push(grid[this.col][this.row + 1]);
    }
    let bottom = grid[this.col + 1];
    if (bottom) {
      if (!grid[this.col + 1][this.row].visited)
        for (let i = 0; i < h; i++)
          neighbours.push(grid[this.col + 1][this.row]);
    }
    let left = grid[this.col][this.row - 1];
    if (left && !left.visited) {
      for (let i = 0; i < v; i++) neighbours.push(grid[this.col][this.row - 1]);
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

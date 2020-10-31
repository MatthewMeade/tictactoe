function setup() {

  colorMode(HSB);

  createCanvas(window.innerWidth, window.innerHeight);

  this.curHue = 0;
  this.board = newBoard();

  noLoop();
}

function boardSize() {
  const size = Math.min(width, height) * 0.66;
  return {
    size,
    pos: {
      x: (width - size) / 2,
      y: (height - size) / 2
    }
  };

}

function newBoard() {
  const {
    size,
    pos
  } = boardSize();

  return new Board(size, pos, this.curHue);
}

function draw() {
  background(this.curHue, 75, 90);


  this.board.draw();
}

function mouseClicked() {

  if (board.win) {
    this.board = newBoard();
    return;
  }

  board.onClick(mouseX, mouseY);
  draw();
}

function windowResized() {
  resizeCanvas(window.innerWidth, window.innerHeight);
  
  const {
    size,
    pos
  } = boardSize();
  
  this.board.size = size;
  this.board.pos = pos;
}
const COLOR_STEP = 5;

function setup() {
    colorMode(HSB);

    createCanvas(window.innerWidth, window.innerHeight);

    this.curHue = Math.round(Math.random() * COLOR_STEP) * (360 / COLOR_STEP);
    this.board = newBoard();

    this.circleR = 0;

    this.animator = new Animator();
}

function draw() {
    background(this.curHue, 75, 90);

    this.animator.update();

    // fill('white')
    // textSize(50);
    // text(frameRate().toFixed(0), 50, 50);

    noFill();
    strokeWeight(10);
    this.board.draw();

}

function keyPressed(){
    this.animator.clearAnimations();
}

function click() {
    if (board.win) {
        this.board = newBoard();
    } else {
        board.onClick(mouseX, mouseY);
    }

    this.curHue = (this.curHue + 360 / COLOR_STEP) % 360;
}

function touchStarted() {
    click();
    return false;
}

function windowResized() {
    resizeCanvas(window.innerWidth, window.innerHeight);

    const { size, pos } = boardSize();

    this.board.size = size;
    this.board.pos = pos;
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
    const { size, pos } = boardSize();

    return new Board(size, pos, this.curHue);
}

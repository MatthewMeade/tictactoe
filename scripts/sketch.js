const COLOR_STEP = 5;
const TARGET_FPS = 30;

function setup() {
    colorMode(HSB);
    window.renderScale = 1;

    const w = window.innerWidth * window.renderScale;
    const h = window.innerHeight * window.renderScale;
    this.canvas = createCanvas(w, h);

    this.canvas.elt.style.width = '100vw';
    this.canvas.elt.style.height = '100vh';

    this.curHue = Math.round(Math.random() * COLOR_STEP) * (360 / COLOR_STEP);
    document.body.style.backgroundColor = color(curHue, 75, 90).toString();

    this.newBoardTimeout = null;

    newBoard();

    adjustCanvasSize();

    setTimeout(()=>adjustResolution(), 1000);

}

function draw() {
    background(this.curHue, 75, 90);

    Animator.update();

    this.board.draw();

    debugText();

    if (frameCount % 200 === 0) adjustResolution();

    if (board.win && !this.newBoardTimeout) {
        this.newBoardTimeout = setTimeout(() => {newBoard()}, 2500);
    }
}


const SCALE_MIN = 0.1;

function adjustResolution() {
    const fps = Math.round(frameRate());

    if (fps <= TARGET_FPS && window.renderScale > SCALE_MIN) {
        window.renderScale /= 2;    
        adjustCanvasSize();
    }
   
}


function debugText() {

    if (!this.showDebug) return;

    push();
    fill('white');
    textSize(20)
    text(`Scale: ${window.renderScale}\nFPS: ${frameRate()}`, 10, 20);
    text(`Width: ${width}\nHeight: ${height}`, 10, 70)
    pop();
}

function click() {
    if (board.win) {
        clearTimeout(this.newBoardTimeout);
        this.newBoardTimeout = null;
        newBoard();
    } else {
        board.onClick(mouseX, mouseY);
    }

    this.curHue = (this.curHue + 360 / COLOR_STEP) % 360;
    document.body.style.backgroundColor = color(curHue, 75, 90).toString()
}

function keyPressed() {
    if (key === 'd') {
        this.showDebug = !this.showDebug;
    }
}

function touchStarted() {
    click();
    return false;
}

function windowResized() {
    adjustCanvasSize();
}

function adjustCanvasSize() {
    const w = window.innerWidth * window.renderScale;
    const h = window.innerHeight * window.renderScale;
    resizeCanvas(w, h);

    this.canvas.elt.style.width = '100vw';
    this.canvas.elt.style.height = '100vh';

    const { size, pos } = boardSize(w, h);
    this.board.updateDims(size, pos);

}

function boardSize(w, h) {
    const size = Math.min(w, h) * 0.66;
    return {
        size,
        pos: {
            x: (width - size) / 2,
            y: (height - size) / 2
        }
    };
}

function newBoard() {
    const w = window.innerWidth * window.renderScale;
    const h = window.innerHeight * window.renderScale;

    const { size, pos } = boardSize(w, h);
    this.board = new Board(size, pos);
}

const COLOR_STEP = 6;
const TARGET_FPS = 30;

const X_TURN = 1;
const O_TURN = -1;

function setup() {
    this.GM = new GameManager(); 
    
    colorMode(HSB);
    window.renderScale = 1;
    updateBGColor(0);
    
    this.canvas = createCanvas();
    windowResized();
    
    setTimeout(()=>adjustResolution(), 1000);
}

function updateBGColor(h) {
    // this.curHue = h ?? (this.curHue + 360 / COLOR_STEP) % 360;
    this.curHue = h ?? Math.round(Math.random() * 365);
    document.body.style.backgroundColor = color(curHue, 75, 90).toString()
}

const BRIGHTNESS = 0;

function draw() {
    drawBG();

    Animator.update();

    this.GM.draw();

    debugText();

    if (frameCount % 200 === 0) adjustResolution();
}

function drawBG() {
    if (BRIGHTNESS === 0) background(this.curHue, 50, 10);
    if (BRIGHTNESS === 1) background(this.curHue, 75, 60);
    if (BRIGHTNESS === 2) background(this.curHue, 25, 90);
}

function themeColor() {
    if (BRIGHTNESS === 0) return color(0, 0, 100, 0.8);
    if (BRIGHTNESS === 1) return color(0, 0, 100, 0.8);
    if (BRIGHTNESS === 2) return color(0, 0, 0, 0.8);
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

function keyPressed() {
    if (key === 'd') {
        this.showDebug = !this.showDebug;
    }
}

function touchStarted() {
    this.GM.onClick();
    updateBGColor();
    return false;
}


function windowResized() {
    const w = window.innerWidth * window.renderScale;
    const h = window.innerHeight * window.renderScale;
    resizeCanvas(w, h);

    this.canvas.elt.style.width = '100vw';
    this.canvas.elt.style.height = '100vh';

    resizeBoard(this.GM.board);
}

const SCALE_MIN = 0.1;
function adjustResolution() {
    const fps = Math.round(frameRate());

    if (fps <= TARGET_FPS && window.renderScale > SCALE_MIN) {
        window.renderScale /= 2;    
        windowResized();
    }
   
}
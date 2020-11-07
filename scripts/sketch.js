const COLOR_STEP = 10;
const TARGET_FPS = 30;

function setup() {
    this.GM = new GameManager(); 
    
    colorMode(HSB);
    window.renderScale = 1;
    updateBGColor(Math.random() * 360);
    
    this.canvas = createCanvas();
    windowResized();
    
    setTimeout(()=>adjustResolution(), 1000);
}

function updateBGColor(h) {
    this.curHue = h ?? (this.curHue + 360 / COLOR_STEP) % 360;
    document.body.style.backgroundColor = color(curHue, 75, 90).toString()
}

function draw() {
    background(this.curHue, 75, 90);

    Animator.update();

    this.GM.draw();

    debugText();

    if (frameCount % 200 === 0) adjustResolution();
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
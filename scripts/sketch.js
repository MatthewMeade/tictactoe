const TARGET_FPS = 30;

const X_TURN = 1;
const O_TURN = -1;

const COLORS_LIGHT = ['f94144', 'f3722c', 'f8961e', 'f9844a', '90be6d', '43aa8b', '4d908e', '577590', '277da1'];
const COLORS_DARK = ['03DAC6', 'ff241f', '0D80D9', '0DD951', 'BB86FC'];

function curThemeColors(){
    return COLOR_THEME === 0 ? COLORS_DARK : COLORS_LIGHT;
}

function setColorTheme(n){
    COLOR_THEME = n || COLOR_THEME === 1 ? 0 : 1;
    updateCurColor();
}


function setup() {
    window.renderScale = 1;
    this.GM = new GameManager();

    colorMode(RGB);
    // updateCurColor();
    this.curColor = COLORS_DARK.length - 1;

    this.canvas = createCanvas();
    windowResized();

    setTimeout(() => adjustResolution(), 1000);
}


function updateCurColor() {
    this.curColor = ((this.curColor ?? 0) + 1) % curThemeColors().length;
}

function curDynColor(alpha){
    const theme = curThemeColors();
    const c = color(`#${theme[this.curColor]}`);
    if (alpha) {
        c.setAlpha(200);
    }
    return c;
}

let COLOR_THEME = 0;

function draw() {
    drawBG();

    Animator.update();

    this.GM.draw();

    debugText();

    if (frameCount % 200 === 0) adjustResolution();
}

function lineWidth() {
    return Math.min(width, height) / 50;
}

function drawBG() {
    if (COLOR_THEME === 0) background(25,25,25);
    if (COLOR_THEME === 1) background(curDynColor());

    document.body.style.backgroundColor = curDynColor().toString();
}

function lineColor(alpha) {
    if (COLOR_THEME === 0) return curDynColor(alpha ?? true);
    if (COLOR_THEME === 1) return color(255,255,255,200);
}

function debugText() {
    if (!this.showDebug) return;

    push();
    fill('white');
    textSize(20);
    text(`Scale: ${window.renderScale}\nFPS: ${frameRate()}`, 10, 20);
    text(`Width: ${width}\nHeight: ${height}`, 10, 70);
    text(`Color: ${curDynColor().toString()} - ${curThemeColors()[this.curColor]}`, 10, 150);
    pop();
}

function keyPressed() {
    if (key === 'd') {
        this.showDebug = !this.showDebug;
    }

    if (key === 'b') {
        setColorTheme();
    }
    if (key === ' ') {
        updateCurColor();
    }
}

function touchStarted() {
    this.GM.onClick();
    return false;
}

function windowResized() {
    const w = window.innerWidth * window.renderScale;
    const h = window.innerHeight * window.renderScale;
    resizeCanvas(w, h);

    this.canvas.elt.style.width = '100vw';
    this.canvas.elt.style.height = '100vh';

    this.GM.board.fitToScreen();

    // resizeBoard(this.GM.board);
}

const SCALE_MIN = 0.1;
function adjustResolution() {
    const fps = Math.round(frameRate());

    if (fps <= TARGET_FPS && window.renderScale > SCALE_MIN) {
        window.renderScale /= 2;
        windowResized();
    }
}

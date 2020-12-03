const TARGET_FPS = 30;

const X_TURN = 1;
const O_TURN = -1;

const COLORS_LIGHT = ['f94144', 'f3722c', 'f8961e', 'f9844a', '90be6d', '43aa8b', '4d908e', '577590', '277da1'];
const COLORS_DARK = ['03DAC6', 'FF073A ', '0D80D9', '0DD951', 'BB86FC', 'ffe700'];

function curThemeColors() {
    return this.GM.curTheme === 0 ? COLORS_DARK : COLORS_LIGHT;
}

function setup() {
    window.renderScale = 1;
    
    colorMode(RGB);
    this.curColor = COLORS_DARK.length - 1;

    
    this.canvas = createCanvas();
    windowResized();
    
    this.GM = new GameManager();
    windowResized();
}

function updateCurColor() {
    this.curColor = ((this.curColor ?? 0) + 1) % curThemeColors().length;

    const bgColor = this.GM.curTheme ? curDynColor() : color(25, 25, 25);
    document.body.style.backgroundColor = bgColor.toString();
}

function curDynColor(alpha) {
    const theme = curThemeColors();
    const c = color(`#${theme[this.curColor]}`);
    if (alpha) {
        c.setAlpha(200);
    }
    return c;
}

function curBGColor(){
    if (this.GM.curTheme === 0) return color(25, 25, 25);
    if (this.GM.curTheme === 1) return curDynColor();
}


function draw() {
    drawBG();

    Animator.update();
    GameObjectManager.draw();

        
    debugText();


    if (frameCount % 200 === 0) adjustResolution();
}

function lineWidth(scale = 1) {
    return scale * Math.min(width, height) / 50;
}

function drawBG() {
    background(curBGColor())
}

function lineColor(alpha) {
    if (this.GM.curTheme === 0) return curDynColor(alpha ?? true);
    if (this.GM.curTheme === 1) return color(255, 255, 255, alpha ? 200 : 255);
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
        this.GM.setTheme();
    }

    if (key === ' ') {
        updateCurColor();
    }

    if (key === 'f') {
        fullscreen(!fullscreen());
        windowResized();
    }

    if (key === 'l') {
        window.renderScale = map(Math.random(), 0, 1, 0.25, 1);
        windowResized();
    }
}

function touchStarted() {
    GameObjectManager.mouseMoved();
    return false;
}

function touchEnded() {
    GameObjectManager.onClick();
    return false;
}

function mouseMoved() {
    GameObjectManager.mouseMoved();
    return false;
}

function touchMoved() {
    GameObjectManager.mouseMoved();
    return false;
}

function windowResized() {
    const w = window.innerWidth * window.renderScale;
    const h = window.innerHeight * window.renderScale;
    resizeCanvas(w, h);

    this.canvas.elt.style.width = '100%';
    this.canvas.elt.style.height = '100%';

    this.GM?.updateDimensions();
}

function scaleAdjust(n) {
    return n * window.renderScale;
}

const SCALE_MIN = 0.1;
function adjustResolution() {
    const fps = Math.round(frameRate());

    if (fps <= TARGET_FPS && window.renderScale > SCALE_MIN) {
        window.renderScale /= 2;
        windowResized();
    }
}

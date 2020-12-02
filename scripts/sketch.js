const TARGET_FPS = 30;

const X_TURN = 1;
const O_TURN = -1;

const COLORS_LIGHT = ['f94144', 'f3722c', 'f8961e', 'f9844a', '90be6d', '43aa8b', '4d908e', '577590', '277da1'];
const COLORS_DARK = ['03DAC6', 'FF073A ', '0D80D9', '0DD951', 'BB86FC', 'ffe700'];

function curThemeColors() {
    return COLOR_THEME === 0 ? COLORS_DARK : COLORS_LIGHT;
}

function setColorTheme(n) {
    COLOR_THEME = n || COLOR_THEME === 1 ? 0 : 1;
    this.overlay.startSwipe();
    updateCurColor();
}

function setup() {
    window.renderScale = 1;
    
    colorMode(RGB);
    // updateCurColor();
    this.curColor = COLORS_DARK.length - 1;

    this.GM = new GameManager();
    
    this.canvas = createCanvas();
    windowResized();

    this.overlay = new Overlay();
    
    // setTimeout(() => adjustResolution(), 1000);
}

function updateCurColor() {
    this.curColor = ((this.curColor ?? 0) + 1) % curThemeColors().length;

    const bgColor = COLOR_THEME ? curDynColor() : color(25, 25, 25);
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
    if (COLOR_THEME === 0) return color(25, 25, 25);
    if (COLOR_THEME === 1) return curDynColor();
}

let COLOR_THEME = 0;

function draw() {
    drawBG();

    Animator.update();
    GameObjectManager.draw();

    
    push();

    // fill(curBGColor());
    // stroke(lineColor());
    // strokeWeight(10);
    // strokeJoin(ROUND)
    // textSize(height / 20);
    // textAlign(RIGHT, BOTTOM);
    // textFont('Impact');
    // text('EASY', width - 10, height);


    
    // textAlign(LEFT, BOTTOM);
    // text(`mouseX: ${mouseX} mouseY: ${mouseY}`, 10, height - 100)
    // text("", 10, height - 10)
    // text("\uf186", 10, height - 10)

    pop();
    
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
    if (COLOR_THEME === 0) return curDynColor(alpha ?? true);
    if (COLOR_THEME === 1) return color(255, 255, 255, alpha ? 200 : 255);
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

    if (key === 'f') {
        fullscreen(!fullscreen());
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

    this.canvas.elt.style.width = '100vw';
    this.canvas.elt.style.height = '100vh';

    this.GM.updateDimensions();

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

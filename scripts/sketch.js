

const X_TURN = 1;
const O_TURN = -1;

const COLORS_LIGHT = ['f94144', 'f3722c', 'f8961e', 'f9844a', '90be6d', '43aa8b', '4d908e', '577590', '277da1'];
const COLORS_DARK = ['03DAC6', 'FF073A ', '0D80D9', '0DD951', 'BB86FC', 'ffe700'];

function curThemeColors() {
    return this.GM.curTheme === 0 ? COLORS_DARK : COLORS_LIGHT;
}

function setup() {
    pixelDensity(1)
    
    colorMode(RGB);
    this.curColor = COLORS_DARK.length - 1;
    
    this.canvas = createCanvas();
    windowResized();
    
    this.GM = new GameManager();
    windowResized();


    this.showDebug = false;
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

    const data = {
        FPS: frameRate().toFixed(0),
        width, height,
        color: `${curDynColor().toString()} - ${curThemeColors()[this.curColor]}`
    }

    push();
    translate(0, 100)
    fill('white');
    textSize(20);
    text(JSON.stringify(data, null, 2), 0, 0);
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
        this.GM.setFullscreen();
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
    const w = window.innerWidth;
    const h = window.innerHeight;
    resizeCanvas(w, h);

    this.GM?.updateDimensions();
}





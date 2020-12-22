const X_TURN = 1;
const O_TURN = -1;

const COLORS_LIGHT = [
    'f94144',
    'f3722c',
    'f8961e',
    'f9844a',
    '90be6d',
    '43aa8b',
    '4d908e',
    '577590',
    '277da1'
];
const COLORS_DARK = ['03DAC6', 'FF073A ', '0D80D9', '0DD951', 'BB86FC', 'ffe700'];

function curThemeColors() {
    return GM.curTheme === 0 ? COLORS_DARK : COLORS_LIGHT;
}

function setup() {
    Animator.init();
    GameObjectManager.init();
    pixelDensity(1);

    colorMode(RGB);
    this.curColor = COLORS_DARK.length - 1;

    GameManager.initialize();

    this.canvas = createCanvas();
    windowResized();

    this.showDebug = false;

    this.colorCounter = 1;
}

function updateCurColor() {
    this.lastColor = curDynColor();
    this.curColor = ((this.curColor ?? 0) + 1) % curThemeColors().length;

    this.animId && Animator.stopAnimation(this.animId);

    this.colorCounter = 0;
    this.animId = Animator.addAnimation({
        time: 300,
        update: (n) => (this.colorCounter = n)
    });
}

function curDynColor(alpha) {
    const theme = curThemeColors();
    const c = color(`#${theme[this.curColor]}`);
    if (alpha) {
        c.setAlpha(200);
    }
    return lerpColor(this.lastColor ?? c, c, this.colorCounter);
}

function curBGColor() {
    if (GM.curTheme === 0) return color(25, 25, 25);
    if (GM.curTheme === 1) return curDynColor();
}

function draw() {
    drawBG();

    Favicon.update();

    Animator.update();
    GameObjectManager.draw();

    debugText();
}

function lineWidth(scale = 1) {
    return (scale * Math.min(width, height)) / 50;
}

function drawBG() {
    background(curBGColor());
    const bgColor = GM.curTheme ? curDynColor() : color(25, 25, 25);
    document.body.style.backgroundColor = bgColor.toString();
}

function lineColor(alpha) {
    if (GM.curTheme === 0) return curDynColor(alpha ?? true);
    if (GM.curTheme === 1) return color(255, 255, 255, alpha ? 200 : 255);
}

function debugText() {
    if (!this.showDebug) return;

    const data = {
        FPS: frameRate().toFixed(0),
        width,
        height,
        color: `${curDynColor().toString()} - ${curThemeColors()[this.curColor]}`
    };

    push();
    translate(0, 100);
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
        GM.setTheme();
    }

    if (key === ' ') {
        updateCurColor();
    }

    if (key === 'f') {
        GM.setFullscreen();
    }

    if (parseInt(key)) {
        GM.setBoardSize(parseInt(key));
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

    GM.updateDimensions();
}

class Overlay extends GameObject {
    constructor() {
        super({
            posX: 0,
            posY: 0,
            sizeX: width,
            sizeY: height
        });

        this.maskSize = 0;

        this.colors = {};
        this.pixels = [];

        
        this.maskResScale = 0.25;
        this.maskCanvas = createGraphics(this.maskWidth, this.maskHeight);
    }

    initContext(){
        this.maskWidth = width * this.maskResScale;
        this.maskHeight = height * this.maskResScale;
        
        this.maskCanvas.resizeCanvas(this.maskWidth, this.maskHeight);
        this.maskCanvas.pixelDensity(0.5)
    }

    _draw() {
        if (this.maskSize === 1 || this.maskSize === 0) {
            return;
        }

        this.maskCanvas.erase();
        this.maskCanvas.ellipse(0, this.maskHeight, (this.maskWidth) * this.maskSize * 3);
        const maskImg = this.maskCanvas.get();

        const imgClone = this.img.get();
        imgClone.mask(maskImg);

        image(imgClone, 0, 0, width, height, 0, 0, this.maskWidth, this.maskHeight);
    }

    startSwipe() {
        loadPixels();

        this.maskCanvas.background(color(0, 0, 0, 255));

        this.animateProperty({
            time: 300,
            propKey: 'maskSize',
            curve: easeInCirc
        });

        this.img = get();
        this.img.resize(this.maskWidth, this.maskHeight);
        this.img.filter(BLUR, 2);

    }
}

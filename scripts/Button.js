class Button extends GameObject {
    constructor({ pos, size, clickCB }) {
        super({ pos, size });

        this.clickCB = clickCB;
    }

    _draw() {
        fill('white');
        stroke('white');

        if (this.mouseHovering) {
            strokeWeight(10);
            stroke('green');
        }
        rect(0, 0, this.sizeX, this.sizeY);
    }

    _onClick() {
        this.clickCB();
    }
}

class TextButton extends Button {
    constructor({ pos, sizeY, text, clickCB, underline, animate, font = 'Anton', padding = 0 }) {
        super({ pos, sizeY, clickCB });

        this.text = text;
        this.underline = underline;
        this.animate = animate;

        this.linePerc = 0;
        this.truncPerc = 0;

        this.padding = padding;
        this.font = font;
    }

    _draw() {
        const str = this.getTruncatedText();

        stroke(curBGColor());
        fill(lineColor());
        strokeWeight(lineWidth(0.5));
        strokeJoin(ROUND);
        textSize(this.textSize);
        textAlign(LEFT, TOP);
        textFont(this.font);
        text(str, this.padding, this.padding);

        stroke(lineColor());

        if (this.linePerc > 0) {
            const len = this.linePerc * this.sizeX;
            const start = (this.sizeX - len) / 2;
            const end = start + len;

            line(start, this.sizeY, end, this.sizeY);
        }
    }

    getTruncatedText() {
        return this.text.slice(0, this.text.length * (1 - this.truncPerc));
    }

    updateSize() {
        push();
        this.textSize = height / 20;

        const str = this.getTruncatedText();

        textFont(this.font);
        textSize(this.textSize);

        const sizeX = textWidth(str) + this.padding * 2;
        const sizeY = this.textSize + this.padding * 2;
        this.updateDimensions({ sizeX, sizeY });

        this.lineWidth = 0;

        pop();
    }

    _onMouseEnter() {
        if (this.underline) {
            this.animateProperty({ time: 125, propKey: 'linePerc' });
        }
    }

    _onMouseLeave() {
        if (this.underline) {
            this.animateProperty({ from: 1, to: 0, time: 125, propKey: 'linePerc' });
        }
    }

    setText(text) {
        if (!this.animate) {
            this.text = text;
            this.updateSize();
            return;
        }

        this.animateProperty({
            time: 100,
            update: (val) => {
                this.truncPerc = val;
                this.updateSize();
            },
            done: () => {
                this.text = text;
                this.updateSize();

                this.animateProperty({
                    from: 1,
                    to: 0,
                    time: 100,
                    update: (val) => {
                        this.truncPerc = val;
                        this.updateSize();
                    }
                });
            }
        });
    }
}

class BrightnessButton extends Button {
    constructor({ pos, size, clickCB, curMode = 0 }) {
        super({ pos, size });

        this.clickCB = clickCB;

        // this.animateProperty({
        //     wait: 2000, time: 500, propKey: 'anim'
        // });

        // if (curMode === 0) {
        //     this.anim = 0;
        //     this.anim = 0;
        // } else {
        //     this.anim = 1;
        //     this.anim = 1;
        // }

        this.anim = curMode;

        this.curMode = curMode;
    }

    setMode(newMode) {
        if (newMode === this.curMode) {
            return;
        }
        
        this.animateProperty({
            time: 500,
            propKey: 'anim',
            from: this.curMode,
            to: newMode,
            curve: easeInOutBack
        });

        this.curMode = newMode;
    }

    _draw() {
        // super._draw();
        const mid = this.sizeX / 2;

        noStroke();
        fill(lineColor());
        circle(mid, mid, this.sizeX);

        const xMin = this.sizeX * 0.7;
        const yMin = this.sizeX * 0.3;

        const xMax = xMin * 1.5;
        const yMax = -yMin;

        const x = map(this.anim, 0, 1, xMin, xMax);
        const y = map(this.anim, 0, 1, yMin, yMax);

        fill(curBGColor());
        circle(x, y, this.sizeX * 0.9);

        if (this.anim > 0) {
            angleMode(DEGREES);

            translate(mid, mid);

            stroke(lineColor());
            strokeWeight(this.anim * lineWidth() / 10);

            const numLines = 8;
            const step = 360 / numLines;
            for (let i = 0; i < 360; i += step) {
                line(0, this.anim * mid * 1.2, 0, this.anim * mid * 1.3);
                rotate(step);
            }
        }
    }
}

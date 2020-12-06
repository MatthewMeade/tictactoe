class Button extends GameObject {
    constructor({ pos, size, clickCB, padding= 0 }) {
        super({ pos, size });

        this.clickCB = clickCB;

        this.padding = padding;
    }

    _draw() {
        fill('white');
        stroke('red');
        strokeWeight(this.padding || 10);

        if (this.mouseHovering) {
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
    constructor({ pos, size, clickCB, curMode = 0, padding}) {
        super({ pos, size, padding });

        this.clickCB = clickCB;

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
            curve: easeInOutBack,
            done: () => {
                // Bit of a hack to keep hover effect after click animation
                this.mouseMoved(0, 0);
                this.mouseMoved();
            }
        });

        this.curMode = newMode;
    }

    _onMouseEnter() {
        this.animateProperty({
            from: this.anim, to: this.curMode ? 0.9 : 0.1, time: 100, propKey: 'anim'
        })
    }
    
    _onMouseLeave() {
        this.animateProperty({
            from: this.anim, to: this.curMode, time: 100, propKey: 'anim'
        })
    }


    _draw() {
        translate(this.padding, this.padding);
        const w = this.sizeX - (2 * this.padding);

        const mid = w / 2;

        noStroke();
        fill(lineColor());
        circle(mid, mid, w);

        const xMin = w * 0.7;
        const yMin = w * 0.3;

        const xMax = xMin * 1.75;
        const yMax = -yMin;

        const x = map(this.anim, 0, 1, xMin, xMax);
        const y = map(this.anim, 0, 1, yMin, yMax);

            fill(curBGColor());
            circle(x, y, w * 0.9);
            
        if (this.anim > 0.2) {
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

class FullscreenButton extends Button {
    constructor({ pos, size, clickCB, curMode = 0, padding}) {
        super({ pos, size, padding });

        this.clickCB = clickCB;

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
            curve: easeInOutBack,
            done: () => { 
                // Bit of a hack to keep hover effect after click animation
                this.mouseMoved(0, 0);
                this.mouseMoved();
            }
        });

        this.curMode = newMode;
    }

    _onMouseEnter() {
        this.animateProperty({
            from: this.anim, to: this.curMode ? 0.9 : 0.1, time: 100, propKey: 'anim'
        })
    }
    
    _onMouseLeave() {
        this.animateProperty({
            from: this.anim, to: this.curMode, time: 100, propKey: 'anim'
        })
    }


    _draw() {

        translate(this.padding, this.padding);
        const w = this.sizeX - (2 * this.padding);
       
        strokeWeight(5);
        stroke('white');
        strokeJoin(ROUND);
        noFill();
        stroke(lineColor());
        strokeWeight(lineWidth()  / 3)

        const s = w / 5;
        
        // TODO: Refactor this into only two arrow defs with offsets to position
        const arr1Out = 
        [
            createVector(w - s),
            createVector(w, 0),
            createVector(w, s),
            createVector(w, 0),
            createVector(w * 0.75, w * 0.25)
        ];

        
        const arr1In = 
        [
            createVector(w * 0.75,( w * 0.25) - s),
            createVector(w * 0.75, w * 0.25),
            createVector(s + w * 0.75, w * 0.25),
            createVector(w * 0.75, w * 0.25),
            createVector(w, 0)
        ];

        const arr2Out = [
            createVector(0, w - s),
            createVector(0, w),
            createVector(s, w),
            createVector(0, w),
            createVector(w * 0.25, w * 0.75)
        ];


        const arr2In = [
            createVector((w * 0.25) - s, w * 0.75),
            createVector(w * 0.25, w * 0.75),
            createVector(w * 0.25, w * 0.75 + s),
            createVector(w * 0.25, w * 0.75),
            createVector(0, w)
        ];


        // First arrow
        beginShape();
        for(let i = 0; i < arr1In.length; i++) {
            vertex(
                map(this.anim, 0, 1, arr1Out[i].x, arr1In[i].x),
                map(this.anim, 0, 1, arr1Out[i].y, arr1In[i].y),
            );
        }
        endShape();

         // Second arrow
         beginShape();
         for(let i = 0; i < arr2In.length; i++) {
             vertex(
                 map(this.anim, 0, 1, arr2Out[i].x, arr2In[i].x),
                 map(this.anim, 0, 1, arr2Out[i].y, arr2In[i].y),
             );
         }
         endShape();
    }
}
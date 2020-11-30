class DifficultyButton extends GameObject {
    constructor({ pos, sizeY, values, curValue, clickCB }) {
        super({ pos, sizeY });
        this.values = values;
        this.curValue = curValue || 0;
        this.clickCB = clickCB;

        this.linePerc = 0;
        this.truncPerc = 0;

        this.padding = 0;
        this.font = "Anton";

        this.updateSize();

    }

    updateSize() {
        push();
        this.textSize = height / 20;

        let str = this.values[this.curValue];
        str = str.slice(0, str.length * (1 - this.truncPerc));

        textFont(this.font);
        textSize(this.textSize);

        const sizeX = textWidth(str) + this.padding * 2;
        const sizeY = this.textSize + this.padding * 2;
        this.updateDimensions({ sizeX, sizeY });

        this.lineWidth = 0;

        pop();
    }

    onMouseEnter() {
        this.animateProperty({ time: 125, propKey: 'linePerc' });
    }

    onMouseLeave() {
        this.animateProperty({ from: 1, to: 0, time: 125, propKey: 'linePerc' });
    }

    _draw() {
        let str = this.values[this.curValue];
        str = str.slice(0, str.length * (1 - this.truncPerc));

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

    _onClick() {

        const newVal = (this.curValue + 1) % this.values.length;
        this.clickCB(newVal);

        this.animateProperty({
            time: 100,
            update: (val) => {
                this.truncPerc = val;
                this.updateSize();
            },
            done: () => {
                this.curValue = newVal;
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

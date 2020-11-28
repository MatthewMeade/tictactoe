class GameObject {
    constructor({ pos, size, posX, posY, sizeX, sizeY }) {
        this.updateDimensions({
            pos,
            size,
            posX: posX ?? 0,
            posY: posY ?? 0,
            sizeX: sizeX ?? 0,
            sizeY: sizeY ?? 0
        });
    }

    _draw() {
        console.log('_draw method not implemented');
    }

    draw() {
        push();
        translate(this.posX, this.posY);

        this._draw();

        pop();
    }

    updateDimensions({ pos, size, posX, posY, sizeX, sizeY }) {
        if (pos) {
            posX = pos.x;
            posY = pos.y;
        }
        if (size) {
            sizeX = size.x;
            sizeY = size.y;
        }
        this.posX = this.posX ?? posX;
        this.posY = this.posY ?? posY;
        this.sizeX = this.sizeX ?? sizeX;
        this.sizeY = this.sizeY ?? sizeY;
    }

    _updatePropCB(key) {
        return (val) => {
            this[key] = val;
        };
    }

    async animateProperty({ wait, from, to, time, propKey, done, update }) {
        if (wait) {
            return this.startTimer({
                time: wait,
                done: () => this.animateProperty({ from, to, time, propKey, done, update })
            });
        }

        const defaultCB = this._updatePropCB(propKey);

        await Animator.addAnimation(
            { from, to, time },
            {
                update: update ?? defaultCB,
                done: done ?? defaultCB
            }
        );
    }

    async startTimer({ time, done, propKey, val }) {
        await Animator.addAnimation(
            { time },
            {
                done: done ?? (() => this._updatePropCB(propKey)(val))
            }
        );
    }
}

class ExChild extends GameObject {
    async fancyAnimation() {

        console.log("Start")

        this.animateProperty({
            from: 10,
            to: 1000,
            time: 3000,
            propKey: 'sizeY',
            done: () => (this.color = color('green'))
        });

        console.log("One")
        
        await this.animateProperty({
            from: 0,
            to: 500,
            time: 1000,
            propKey: 'posX'
        });
        console.log("Two")
        
        this.animateProperty({
            from: 0,
            to: 500,
            time: 1000,
            propKey: 'posY'
        });
        console.log("Three")
        
        await this.animateProperty({
            from: 10,
            to: 1000,
            time: 1000,
            propKey: 'sizeX',
            done: () => (this.color = color('blue'))
        });
        console.log("Four")

        await this.startTimer({
            time: 4000,
            propKey: 'color',
            val: color('Red')
        });
    }

    constructor({ pos, size }) {
        super({ pos, size });

        this.color = color('white');

        this.fancyAnimation();
    }

    _draw() {
        fill(this.color);

        ellipse(this.posX, this.posY, this.sizeX, this.sizeY);
    }
}

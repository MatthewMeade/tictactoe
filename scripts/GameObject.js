// TODO: Game Object Manager?
//       - Call draw on all game objects
//       - Fire events

// TODO: Support Scaling

// TODO: Onclick

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
    _onClick() {
        console.log('_onClick method not implemented');
    }
    _updateDimensions() {
        console.log('_updateDimensions method not implemented');
    }

    draw(...args) {
        push();
        translate(this.posX, this.posY);

        this._draw(...args);

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
        this.posX = posX ?? this.posX;
        this.posY = posY ?? this.posY;
        this.sizeX = sizeX ?? this.sizeX;
        this.sizeY = sizeY ?? this.sizeY;

        this._updateDimensions({posX, posY, sizeX, sizeY});
    }

    _updatePropCB(key) {
        return (val) => {
            this[key] = val;
        };
    }

    async animateProperty({ wait, from, to, time, propKey, done, update, curve }) {
        if (wait) {
            return this.startTimer({
                time: wait,
                done: () => this.animateProperty({ from, to, time, propKey, done, update, curve })
            });
        }

        const defaultCB = this._updatePropCB(propKey);

        await Animator.addAnimation(
            { from, to, time },
            {
                update: update ?? defaultCB,
                done: done ?? defaultCB
            }, curve
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

    onClick(x, y) {
        // TODO: Support Scale
        x -= this.posX;
        y -= this.posY;
        
        if (x < 0 || y < 0 || x > this.size || y > this.size) {
            return; // Clicked outside
        }

        this._onClick(x, y);
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

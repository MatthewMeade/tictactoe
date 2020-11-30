// TODO: Game Object Manager?
//       - Call draw on all game objects
//       - Fire events

// TODO: Support Scaling

// TODO: Onclick

class GameObject {
    constructor({ pos, size, posX, posY, sizeX, sizeY}) {
        this.updateDimensions({
            pos,
            size,
            posX: posX ?? 0,
            posY: posY ?? 0,
            sizeX: sizeX ?? 0,
            sizeY: sizeY ?? 0
        });

        this.parent = parent || {posX: 0, posY: 0};

        this.children = new Set();
        this.parent = null;

        this.mouseHovering = false;

        GameObjectManager.addObject(this);
    }

    addChildren(c) {
        this.addChild(c);
    }

    addChild(child) {
        if (Array.isArray(child)) {
            return child.forEach(c => this.addChild(c))
        }

        this.children.add(child);
        child.parent = this;
    }

    removeChildren(c) {
        this.removeChild(c);
    }

    removeChild(child) {
        if (Array.isArray(child)) {
            return child.forEach(c => this.removeChild(c))
        }

        this.children.delete(child);
        child.destroy(); // DESTORY THE CHILD
    }
    
    draw(...args) {
        push();
        const {x, y} = this.getParentOffset();
        translate(x, y);

        this._draw?.(...args);

        pop();
    }


    getParentOffset(){
        let cur = this;
        let x = this.posX; let y = this.posY;
        while(cur.parent) {
            x += cur.parent.posX;
            y += cur.parent.posY;
            cur = cur.parent;
        }
        return {x, y};
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

        this._updateDimensions?.({posX, posY, sizeX, sizeY});
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

        const defaultCB = this._updatePropCB?.(propKey);

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
                done: done ?? (() => this._updatePropCB?.(propKey)(val))
            }
        );
    }

    onClick(x, y) {
        const {x: _x, y: _y} = this.getParentOffset();

        x -= _x;
        y -= _y;
        
        if (x < 0 || y < 0 || x > this.sizeX || y > this.sizeY) {
            return; // Clicked outside
        }

        this._onClick?.(x, y);
    }

    destroy(){
        GameObjectManager.removeObject(this);

        this.removeChildren([...this.children]);
        
        this._destroy?.();
    }

    pointIsInside(mx, my) {
        
        const {x, y} = this.getParentOffset();

        return mx >= x && mx <= (x + this.sizeX) &&
               my >= y && my <= (y + this.sizeY)
    }

    onMouseEnter(x, y) {
        this._onMouseEnter?.(x, y);
    }

    onMouseLeave(x, y) {
        this._onMouseLeave?.(x, y);
    }

    mouseMoved(x, y) {
        const isCurInside = this.pointIsInside(x, y);

        if (isCurInside === this.mouseHovering) {
            return this._mouseMoved?.(x, y);
        }

        this.mouseHovering = isCurInside;

        if (isCurInside) {
            this.onMouseEnter(x, y);
        } else {
            this.onMouseLeave(x, y);
        }
    }
}
class GameObject {
    constructor({ pos, size, posX, posY, sizeX, sizeY, zIndex=0}) {
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

        this.zIndex = zIndex;

        GameObjectManager.addObject(this, zIndex);

        this.animsByKey = {};

        this.nextFrameQueue = {
            before: [],
            after: []
        }
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

        this.nextFrameQueue.before.forEach(fn => fn());
        
        this._draw?.(...args);
        
        this.nextFrameQueue.after.forEach(fn => fn());

        this.nextFrameQueue = {
            before: [],
            after: []
        }

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

    animateProperty({ wait, from, to, time, propKey, done, update, curve, key }) {
        key = (key ?? propKey) ?? '';

        if (key) {
            this.stopAnimationByKey(key);
        }

        if (wait) {
            return this.startTimer({
                time: wait,
                done: () => this.animateProperty({ from, to, time, propKey, done, update, curve })
            });
        }

        const defaultCB = this._updatePropCB?.(propKey);

        const id = Animator.addAnimation({
            from,
            to,
            time,
            update: update ?? defaultCB,
            done: done ?? defaultCB,
            curve
        });

        this.animsByKey[key] = this.animsByKey[key] ?? [];
        this.animsByKey[key].push(id);
    }

    async startTimer({ time, done, propKey, val }) {
        await Animator.addAnimation(
            {
                time,
                done: done ?? (() => this._updatePropCB?.(propKey)(val))
            }, true
        );
    }

    stopAnimationByKey(key) {
        this.animsByKey[key]?.forEach(id => Animator.stopAnimation(id));
    }

    onClick(x, y) {
        const {x: _x, y: _y} = this.getParentOffset();

        x -= _x;
        y -= _y;
        
        if (!x || !y || x < 0 || y < 0 || x > this.sizeX || y > this.sizeY) {
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

    mouseMoved(x=mouseX, y=mouseY) {
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

    queueForNextFrame(fn, when) {
        this.nextFrameQueue[when].push(fn)
    }
}
function easeInOutBack(x) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * pow(x - 1, 3) + c1 * pow(x - 1, 2);
}

function easeInCirc(x) {
    return 1 - sqrt(1 - pow(x, 2));
    }

// TODO: Infinite Loop?
class Animator {
    // static animations = [];

    static init(){
        this.animations = [];
        this.idCounter = 0;
    }

    static addAnimation(def, promise) {

        const id = this.idCounter++;

        if (promise) {
            return new Promise((resolveP, reject) => {
                Animator.animations.push({ def, startTime: Date.now(), resolveP, id });
            });
        }

        Animator.animations.push({ def, startTime: Date.now(), id });

        return id;
    }

    static stopAnimation(id) {
        this.animations.forEach((e) => {
            e.stop == e.stop || (e.id === id)
        });
    }

    static update() {
        const now = Date.now();

        const currentAnims = this.animations;
        const updatedAnims = [];
        for (let i = 0; i < currentAnims.length; i++) {
            const { def, startTime, resolveP, stop } = currentAnims[i];
            const { from = 0, to = 1, time = 1000, curve, update, done} = def;

            if (stop) {
                continue;

            }

            const aliveTime = now - startTime;
            const range = to - from;

            let perc;
            if (curve) {
                perc = curve(aliveTime / time);
            } else {
                perc = aliveTime / time;
            }

            const retVal = from + perc * range;


            if (aliveTime > time) {
                update && update(to);
                done && done(to);
                resolveP?.(to);
                currentAnims[i].stop = true;
            } else {
                update && update(retVal);
                updatedAnims.push(currentAnims[i]);
            }
        }
    }

    clearAnimations() {
        this.animations = [];
    }
}

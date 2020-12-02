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
    static animations = [];

    static addAnimation(def, callbacks, curve) {
        return new Promise((resolveP, reject) => {
            this.animations.push({ def, startTime: Date.now(), callbacks, curve, resolveP });
        });
    }

    static update() {
        const now = Date.now();

        const currentAnims = this.animations;
        const updatedAnims = [];
        for (let i = 0; i < currentAnims.length; i++) {
            const { def, startTime, callbacks, curve, resolveP } = currentAnims[i];
            const { from = 0, to = 1, time = 1000 } = def;

            const aliveTime = now - startTime;
            const range = to - from;

            let perc;
            if (curve) {
                perc = curve(aliveTime / time);
            } else {
                perc = aliveTime / time;
            }

            const retVal = from + perc * range;

            const { done, update } = callbacks;

            if (aliveTime > time) {
                update && update(to);
                done && done(to);
                resolveP(to);
            } else {
                update && update(retVal);
                updatedAnims.push(currentAnims[i]);
            }
        }

        this.animations = updatedAnims;
    }

    clearAnimations() {
        this.animations = [];
    }
}

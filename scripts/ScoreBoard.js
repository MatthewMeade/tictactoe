function pointToCoords(p, size, progress) {
    const width = size * progress;
    const xOff = (size - width) / 2;

    const y = xOff + width * Math.floor(p / 2);
    const x = xOff + width * (p % 2);
    return { x, y };
}

const NUM_PART_DRAW_TIME = 75;

const numMap = {
    0: [0, 1, 5, 4, 0],
    1: [1, 5],
    2: [0, 1, 3, 2, 4, 5],
    3: [0, 1, 3, 2, 3, 5, 4],
    4: [0, 2, 3, 1, 5],
    5: [1, 0, 2, 3, 5, 4],
    6: [0, 4, 5, 3, 2],
    7: [0, 1, 5],
    8: [1, 0, 2, 3, 5, 4, 2, 3, 1],
    9: [3, 2, 0, 1, 5]
};

class ScoreBoard {
    constructor() {
        this.scores = {
            [X_TURN]: 0,
            [O_TURN]: 0
        };

        this.curNum = 0;
        this.progress = 0;

        Animator.addAnimation(
            {
                from: 0,
                to: 1,
                time: NUM_PART_DRAW_TIME * (numMap[this.curNum].length - 1)
            },
            {
                update: (val) => (this.progress = val)
            }
        );
    }

    changeNumber(n) {
        if (n === this.curNum) {
            return;
        }

        Animator.addAnimation(
            {
                from: 50,
                to: 0,
                time: 250
            },
            {
                update: (val) => (this.scale = val)
            }
        );

        Animator.addAnimation(
            {
                from: 1,
                to: 0,
                time: NUM_PART_DRAW_TIME * (numMap[this.curNum].length - 1)
            },
            {
                update: (val) => (this.progress = val),
                done: () => {
                    this.curNum = n;
                    Animator.addAnimation(
                        {
                            from: 0,
                            to: 1,
                            time: NUM_PART_DRAW_TIME * (numMap[this.curNum].length - 1)
                        },
                        {
                            update: (val) => (this.progress = val)
                        },
                        easeInOutBack
                    );
                }
            },
            easeInOutBack
        );
    }

    draw() {
        push();

        const r = 10;

        strokeJoin(ROUND);
        strokeWeight(r);
        noFill();
        stroke(lineColor())
        translate(150, 15);

        const points = numMap[this.curNum];

        if (this.progress <= 0) {
            pop();
            return;
        }

        const curIndex = Math.min(Math.floor(this.progress * (points.length - 1)), points.length - 1);

        beginShape();
        for (let i = 0; i <= curIndex; i++) {
            const p1 = pointToCoords(points[i], 50, this.progress);
            vertex(p1.x, p1.y);
        }

        if (curIndex < points.length - 1) {
            const curPoint = pointToCoords(points[curIndex], 50 * this.progress);
            const nextPoint = pointToCoords(points[curIndex + 1], 50 * this.progress);

            const percPerLine = 1 / (points.length - 1);
            const completedPerc = percPerLine * curIndex;

            const remainingPerc = this.progress - completedPerc;

            const percOfLine = remainingPerc / percPerLine;

            vertex(
                curPoint.x + (nextPoint.x - curPoint.x) * percOfLine,
                curPoint.y + (nextPoint.y - curPoint.y) * percOfLine
            );
        }

        endShape();

        pop();
    }
}

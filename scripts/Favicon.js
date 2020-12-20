class Favicon {
    static update() {
        if (!this.canvas) {
            // Initialize
            this.canvas = createGraphics(64, 64);
            this.type = O_TURN;
        }
        const c = this.canvas;

        c.background(curBGColor());

        c.noFill();
        c.stroke(lineColor());
        c.strokeJoin(ROUND);
        c.strokeWeight(10);

        this.drawShape(c);

        const url = c.canvas.toDataURL('image.png');
        // document.querySelector('#favicon').href = url;
    }

    static drawShape(c) {
        const x = c.width / 2;
        const offset = x * 0.5;

        if (this.type === X_TURN) {
            c.beginShape();
            c.vertex(x - offset, x - offset);
            c.vertex(x + offset, x + offset);
            c.vertex(x, x);
            c.vertex(x + offset, x - offset);
            c.vertex(x - offset, x + offset);
            c.endShape();
        } else {
            c.circle(x, x, x);
        }
    }

    static async updateType(newType) {
        this.type = newType;
    }
}

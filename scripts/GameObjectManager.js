class GameObjectManager {
    static objects = new Set();

    static addObject(obj) {
        this.objects.add(obj);
    }

    static removeObject(obj) {
        this.objects.delete(obj);
    }

    static draw(){
        this.objects.forEach(obj => obj.draw());
    }

    static onClick(){
        this.objects.forEach(obj => obj.onClick(mouseX, mouseY));
    }

    static mouseMoved() {
        this.objects.forEach(obj => obj.mouseMoved(mouseX, mouseY));
    }
}

const Manager = GameObjectManager;
class GameObjectManager {
    // static objects = new Set();
    
    static init(){
        this.objects = new Set();
    }

    static addObject(obj) {
        this.objects.add(obj);
    }

    static removeObject(obj) {
        this.objects.delete(obj);
    }

    static draw(){
        // If this sort causes a performance issue, pre sort on insert
        [...this.objects].sort((a, b) => a.zIndex - b.zIndex).forEach(obj => obj.draw());
    }

    static onClick(){
        this.objects.forEach(obj => obj.onClick(mouseX, mouseY));
    }

    static mouseMoved() {
        this.objects.forEach(obj => obj.mouseMoved(mouseX, mouseY));
    }
}

const Manager = GameObjectManager;
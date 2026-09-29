function randomize(array) {
    return array[Math.floor(Math.random() * array.length)];
};

const agePresets = [
    18, 20, 25, 30, 35, 40
]

class Entity {
    constructor() {
        this.action = null;
    }
}

class Person extends Entity {
    constructor() {
        super();
        this.nationality = null;
        this.outfit = null;
        this.age = null;
    }

    randomize() {
        this.age = randomize(agePresets);
        this.nationality = randomize(nationalityPresets);
        // this.outfit = randomize(outfitPresets);
        // this.action = randomize(actionPresets);
    }

    describe() {
        return this.age + "-year-old " + this.nationality + " person";
    }
};

class Scene {
    constructor() {
        this.entities = [];
    }
    addEntity(entity) {
        this.entities.push(entity);
    }
    describe() {
        const descriptions = [];
        for (const entity of this.entities) {
            descriptions.push(entity.describe());
        }
        return descriptions.join(" and ");
    }
}

const nationalityPresets = [
    "Japanese",
    "Caucasian",
    "Black"
];

const person1 = new Person();
const person2 = new Person();
const scene1 = new Scene();

person1.randomize();
person2.randomize();

scene1.addEntity(person1);
scene1.addEntity(person2);

var imagePrompt = `A photo of a ${scene1.describe()}`;

console.log(person1 instanceof Person);
console.log(person1 instanceof Entity);

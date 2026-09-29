function randomize(array) {
    return array[Math.floor(Math.random() * array.length)];
};

// Person Presets
const personAgePresets = [
    18, 20, 25, 30, 35, 40
]
const outfitPresets = [
    "an oversized t-shirt and faded blue jeans",
    "an oversized hoodie and gym shorts",
    "a fitted black tuxedo"
]

// Vehicle Presets
const vehicleColorPresets = [
    "Vantablack", "camo pattern", "candy apple red", "fire engine red", "royal blue"
]
const vehicleYearPresets = [
    "1969", "1974", "1995", "late model"
]
const vehicleModelPresets = [
    "Tesla", "Ford Mustang", "Corvette", "Hummer"
]

// Animal Presets
const animalAgePresets = [
    1, 5, 8, 10, 15
]
const animalColorPresets = [
    "black", "yellow", "white", "tuxedo", "brown"
]
const animalBreedPresets = [
    "dog", "cat", "cow"
]


class Entity {
    constructor() {
        this.action = null;
    }
    describe() {

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
        this.age = randomize(personAgePresets);
        this.nationality = randomize(nationalityPresets);
        this.outfit = randomize(outfitPresets);
        // this.action = randomize(actionPresets);
    }

    describe() {
        return this.age + "-year-old " + this.nationality + " person";
    }
};

class Vehicle extends Entity {
    constructor() {
        super();
        this.color = null;
        this.year = null;
        this.model = null;
    }

    randomize() {
        this.year = randomize(vehicleYearPresets);
        this.color = randomize(vehicleColorPresets);
        this.model = randomize(vehicleModelPresets);
    }

    describe() {
        return this.color + " " + this.year + " " + this.model;
    }
}

class Animal extends Entity {
    constructor() {
        super();
        this.color = null;
        this.age = null;
        this.breed = null;
    }

    randomize() {
        this.color = randomize(animalColorPresets);
        this.age = randomize(animalAgePresets);
        this.breed = randomize(animalBreedPresets);
    }

    describe() {
        return this.color + " " + this.age + "-year-old " + this.breed;
    }
}

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
        return descriptions.join(", ");
    }
}

const nationalityPresets = [
    "Japanese",
    "Caucasian",
    "Black"
];

const person1 = new Person();
const person2 = new Person();
const vehicle1 = new Vehicle();
const animal1 = new Animal();
const scene1 = new Scene();

person1.randomize();
person2.randomize();
vehicle1.randomize();
animal1.randomize();

scene1.addEntity(person1);
scene1.addEntity(person2);
scene1.addEntity(vehicle1);
scene1.addEntity(animal1);

var imagePrompt = `A photo of a ${scene1.describe()} `;

console.log(imagePrompt);

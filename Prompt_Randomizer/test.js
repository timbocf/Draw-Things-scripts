// Helper Functions
function randomize(array) {
    return array[Math.floor(Math.random() * array.length)];
};

function formatList(array) {
    if (array.length === 0) {
        return "";
    }
    if (array.length === 1) {
        return array[0];
    }
    if (array.length === 2) {
        return array[0] + " and " + array[1];
    }
    if (array.length > 2) {
        return (array.slice(0, (array.length - 1))).join(", ") + ", and " + array[array.length - 1];
    }
}

// Person Presets
const personAgePresets = [
    18, 20, 25, 30, 35, 40
]
const outfitPresets = [
    "an oversized t-shirt and faded blue jeans",
    "an oversized hoodie and gym shorts",
    "a fitted black tuxedo"
]
const personActionPresets = [
    "standing",
    "sitting",
    "leaning against a wall",
    "driving"
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
const animalActionPresets = [
    "sitting",
    "standing",
    "running",
    "jumping"
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
        this.action = randomize(actionPresets);
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
        return this.age + "-year-old " + this.color + " " + this.breed;
    }
}

class Scene {
    constructor() {
        this.entities = [];
        this.subjects = [];
        this.vehicle = [];
        this.animals = [];
    }
    addEntity(entity) {
        this.entities.push(entity);
    }
    checkEntities() {
        this.subjects = [];
        this.vehicle = [];
        this.animals = [];
        for (const entity of this.entities) {
            if (entity instanceof Person) {
                this.subjects.push(entity);
            }
            if (entity instanceof Vehicle) {
                this.vehicle.push(entity);
            }
            if (entity instanceof Animal) {
                this.animals.push(entity);
            }
        }
    }
    describe() {
        this.checkEntities();

        const subjectDescriptions = [];
        const animalDescriptions = [];
        const vehicleDescriptions = [];

        if (this.subjects.length > 0) {
            for (const subject of this.subjects) {
                subjectDescriptions.push(subject.describe());
            }
        }

        if (this.animals.length > 0) {
            for (const animal of this.animals) {
                animalDescriptions.push(animal.describe());
            }
        }

        if (this.vehicle.length > 0) {
            for (const vehicle of this.vehicle) {
                vehicleDescriptions.push(vehicle.describe());
            }
        }

        const subjectsText = formatList(subjectDescriptions);
        const animalsText = formatList(animalDescriptions);
        const vehicleText = formatList(vehicleDescriptions);

        var sceneDescription = "";

        if (this.subjects.length > 0) {
            sceneDescription += subjectsText;
        }

        if (this.subjects.length > 0 && this.animals.length > 0) {
            sceneDescription += " with a " + animalsText;
        }

        if (this.subjects.length === 0 && this.animals.length > 0) {
            sceneDescription += animalsText;
        }

        if (this.vehicle.length > 0 && (this.subjects.length > 0 || this.animals.length > 0)) {
            sceneDescription += " in a " + vehicleText;
        }

        if (this.subjects.length === 0 && this.animals.length === 0 && this.vehicle.length > 0) {
            sceneDescription += vehicleText;
        }

        return sceneDescription;
    }
}

const nationalityPresets = [
    "Japanese",
    "Caucasian",
    "Black"
];

const person1 = new Person();
const person2 = new Person();
// const animal1 = new Animal();
const vehicle1 = new Vehicle();
const scene1 = new Scene();

person1.randomize();
person2.randomize();
vehicle1.randomize();
// animal1.randomize();

scene1.addEntity(person1);
scene1.addEntity(person2);
// scene1.addEntity(animal1);
scene1.addEntity(vehicle1);

var imagePrompt = `A photo of a ${scene1.describe()} `;

console.log(imagePrompt);

function randomize(array) {
    return array[Math.floor(Math.random() * array.length)];
};

const agePresets = [
    18, 20, 25, 30, 35, 40
]

class Person {
    constructor() {
        this.nationality = null;
        this.outfit = null;
        this.action = null;
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
        this.subjects = [];
        const descriptions = [];
    }
    addSubject(subject) {
        this.subjects.push(subject);
    }
    describe() {
        for (const subject of this.subjects) {
            subject.describe();
        }
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

console.log(person1.describe());
console.log(person2.describe());

scene1.addSubject(person1);
scene1.addSubject(person2);

console.log(scene1);
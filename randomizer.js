//@api-1.0

// =========================================
// KREA 2 RANDOM GENERATOR
// =========================================

// =========================================
// PRESET LISTS
// =========================================

const gender = [
    "woman"
];

// --- NATIONALITY / ETHNICITY ---

const nationalityPresets = [
    {
        label: "Caucasian",
        value: "with Western European facial features",
        hairColors: ["blonde", "brunette", "black", "ginger"],
        skinTones: ["porcelain", "light", "fair", "sun-kissed tan"]
    },
    {
        label: "Black",
        value: "with rich deep skin tone and classic African facial features",
        hairColors: ["dark brown", "black"],
        skinTones: ["rich mocha", "brown", "dark brown", "black", "dark glossy black"]
    },
    {
        label: "Mexican",
        value: "with prominent Indigenous Mesoamerican facial features, dark brown eyes, thick dark eyebrows, thick wavy hair, plump lips, and a curvy hourglass figure",
        hairColors: ["dark brown", "black"],
        skinTones: ["warm olive tan", "sun-darkened"]
    },
    {
        label: "Mixed-Race",
        value: "with a natural blend of African and European facial features, softly flared nostrils, a straight natural nose bridge, high defined cheekbones, thick naturally arched eyebrows, dark brown eyes, thick hair with thick wavy curls, a curvy hourglass figure, and a round ass",
        hairColors: ["dark brown", "black"],
        skinTones: ["deep golden-bronze", "warm olive"]
    },
    {
        label: "Indian",
        value: "with dark eyes, and South Asian facial features",
        hairColors: ["dark brown", "black"],
        skinTones: ["deep golden-bronze", "dark tan", "warm brown"]
    },
    {
        label: "Thai",
        value: "with Southeast Asian facial features",
        hairColors: ["dark brown", "black"],
        skinTones: ["deep golden-bronze", "golden-tan"]
    },
    {
        label: "Japanese",
        value: "with East Asian facial features",
        hairColors: ["dark brown", "black"],
        skinTones: ["fair", "light", "porcelain"]
    },
    {
        label: "Korean",
        value: "with fair porcelain skin and East Asian facial features",
        hairColors: ["dark brown", "black"],
        skinTones: ["fair", "porcelain", "light"]
    },
    {
        label: "Filipina",
        value: "with Southeast Asian facial features",
        hairColors: ["dark brown", "black"],
        skinTones: ["warm tan", "deep golden-bronze"]
    },
    {
        label: "Brazilian",
        value: "with a blend of European, African, and Indigenous features",
        hairColors: ["light brown", "dark brown", "black"],
        skinTones: ["sun-kissed olive", "deep golden-bronze"]
    },
    {
        label: "Italian",
        value: "with Mediterranean facial features",
        hairColors: ["dark brown", "black"],
        skinTones: ["sun-kissed olive", "rich golden hue"]
    },
    {
        label: "Scandinavian",
        value: "with Nordic facial features",
        hairColors: ["blonde"],
        skinTones: ["fair", "light"]
    },
    {
        label: "Russian/Eastern European",
        value: "with Slavic facial features",
        hairColors: ["blonde", "light brown", "dark brown", "black"],
        skinTones: ["fair", "light", "sun-kissed tan"]
    },
    {
        label: "Chinese",
        value: "with East Asian facial features",
        hairColors: ["dark brown", "black"],
        skinTones: ["fair", "light", "olive"]
    },
    {
        label: "Vietnamese",
        value: "with Southeast Asian facial features",
        hairColors: ["dark brown", "black"],
        skinTones: ["warm tan", "olive", "sun-kissed tan"]
    },
    {
        label: "Middle Eastern",
        value: "with Middle Eastern facial features",
        hairColors: ["dark brown", "black"],
        skinTones: ["olive", "dark"]
    },
    {
        label: "French",
        value: "with classic Western European features",
        hairColors: ["light brown", "dark brown", "black"],
        skinTones: ["fair", "light", "sun-kissed tan"]
    },
    {
        label: "German",
        value: "with Central European facial features",
        hairColors: ["blonde", "light brown", "dark brown"],
        skinTones: ["fair", "light", "porcelain"]
    },
    {
        label: "Irish",
        value: "with freckles and Celtic facial features",
        hairColors: ["ginger", "blonde", "light brown", "dark brown"],
        skinTones: ["porcelain", "fair", "light"]
    },
    {
        label: "Native American",
        value: "with Indigenous American facial features",
        hairColors: ["dark brown", "black"],
        skinTones: ["warm bronze", "sun-kissed olive"]
    },
    {
        label: "Polynesian/Pacific Islander",
        value: "with Polynesian facial features",
        hairColors: ["dark brown", "black"],
        skinTones: ["warm brown", "sun-kissed olive"]
    },
    {
        label: "Ethiopian/East African",
        value: "with East African facial features",
        hairColors: ["dark brown", "black", "dark glossy black"],
        skinTones: ["deep brown", "black", "deep glossy black"]
    },
];

// --- AGE ---
const agePresets = [
    "18 years old", "20 years old", "25 years old", "30 years old", "35 years old",
    "40 years old", "45 years old", "50 years old", "55 years old", "60 years old",
    "65 years old", "70 years old", "75 years old", "80 years old", "85 years old"
];


const outfitPresets = [
    "a loose fitting T-shirt and blue jeans",
    "a bikini",
    "a halter top and pleated shorts"
];

const actionPresets = [
    "smiling",
    "laying on a beach",
    "standing, looking away from the camera"
];

function randomize(array) {
    return array[Math.floor(Math.random() * array.length)];
}

const nationalityOptions = [
    "Random Selection",
    ...nationalityPresets.map(item => item.label)
];

const imageCounts = [3, 5, 10, 20];

const promptSelections = requestFromUser("Select from the dropdowns or randomize them", "Generate", function () {
    return [

        // Number of Images to Generate
			this.plainText("Number of Images to Generate"),
        this.menu(0, [
            "3 images",
            "5 images",
            "10 images",
            "20 images"
        ]),

        // Subject-Nationality
			this.plainText("Nationality"),
        this.menu(0, nationalityOptions),

			// Age
			this.plainText("Age"),
        this.menu(0, [
					"Random Selection",
					...agePresets
			]),

        // Outfit
			this.plainText("Outfit"),
        this.menu(0, [
            "Random Selection",
            ...outfitPresets
        ]),

        // Action
			this.plainText("Action"),
        this.menu(0, [
            "Random Selection",
            ...actionPresets
        ])
    ]
})

async function generateBatch() {

    canvas.clear();

let nationality;
let hairColor;
let skinTone;
let age;
let outfit;
let action;

if (promptSelections[3] === 0) {
    nationality = randomize(nationalityPresets);
} else {
    nationality = nationalityPresets[promptSelections[3] - 1];
}

hairColor = randomize(nationality.hairColors);
skinTone = randomize(nationality.skinTones);

if (promptSelections[5] === 0) {
    age = randomize(agePresets);
} else {
    age = agePresets[promptSelections[5] - 1];
}

if (promptSelections[7] === 0) {
    outfit = randomize(outfitPresets);
} else {
    outfit = outfitPresets[promptSelections[7] - 1];
}

if (promptSelections[9] === 0) {
    action = randomize(actionPresets);
} else {
    action = actionPresets[promptSelections[9] - 1];
}

    const imagePrompt = "A photo of a " + age + " " + nationality.label + " " + gender + " with " + skinTone + " skin, " + hairColor + " hair and " + nationality.value + ", " + action + ", wearing " + outfit + ". Natural anatomy.";
    console.log("Generating:");
    console.log(imagePrompt);

    // =================================
    // COPY CURRENT CONFIGURATION
    // =================================

    let config = JSON.parse(
        JSON.stringify(pipeline.configuration)
    );

    // =================================
    // KREA 2 SETTINGS
    // =================================

    config.model = "krea_2_turbo_i8x.ckpt";
    config.width = 1024;
    config.height = 1024;
    config.batchCount = 1;
    config.batchSize = 1;

    // =================================
    // RANDOM SEED
    // =================================
    config.seed = -1;

    // =================================
    // LORAS
    // =================================

    //    config.loras = [
    //        {
    //            mode: "all",
    //            file: "pornmaster_uncensored_krea2_v1_lora_f16.ckpt",
    //            weight: 1.0
    //        },
    //        {
    //            mode: "all",
    //            file: "mysticxxx_krea2_v3_lora_f16.ckpt",
    //            weight: 0.6
    //        }
    //    ];

    // =================================
    // GENERATE
    // =================================

    await pipeline.run({
        configuration: config,
        prompt: imagePrompt
    });

    console.log("Image complete.");

    // =========================================
    // FINISHED
    // =========================================

    console.log("Image Complete.");
}

const imageCount = imageCounts[promptSelections[1]];

async function runBatch() {
    for (var i = 0; i < imageCount; i++) {
        await generateBatch();
    }
    console.log("Batch Finished!");
}

runBatch();

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
    { label: "Caucasian", value: "with Western European facial features" },
    { label: "Black", value: "with rich deep skin tone and classic African facial features" },
    { label: "Mixed-Race", value: "with a natural blend of African and European facial features, deep golden-bronze skin, softly flared nostrils, a straight natural nose bridge, high defined cheekbones, thick naturally arched eyebrows, dark brown eyes, thick dark brown hair with thick wavy curls, a curvy hourglass figure, and a round ass" },
    { label: "Mexican", value: "with prominent Indigenous Mesoamerican facial features, warm olive-tan skin, dark brown eyes, thick dark eyebrows, thick dark wavy hair, plump lips, and a curvy hourglass figure" },
    { label: "Indian", value: "with warm brown skin, dark eyes, and South Asian facial features" },
    { label: "Thai", value: "with golden-tan skin and Southeast Asian facial features" },
    { label: "Japanese", value: "with fair skin and East Asian facial features" },
    { label: "Korean", value: "with fair porcelain skin and East Asian facial features" },
    { label: "Filipina", value: "with warm tan skin and Southeast Asian facial features" },
    { label: "Brazilian", value: "with sun-kissed olive skin and a blend of European, African, and Indigenous features" },
    { label: "Italian", value: "with olive skin and Mediterranean facial features" },
    { label: "Scandinavian", value: "with fair skin, light hair, and Nordic facial features" },
    { label: "Russian/Eastern European", value: "with fair skin and Slavic facial features" },
    { label: "Chinese", value: "with fair skin and East Asian facial features" },
    { label: "Vietnamese", value: "with warm tan skin and Southeast Asian facial features" },
    { label: "Middle Eastern", value: "with olive skin, dark hair, and Middle Eastern facial features" },
    { label: "French", value: "with fair skin and classic Western European features" },
    { label: "German", value: "with fair skin and Central European facial features" },
    { label: "Irish", value: "with fair skin, freckles, and Celtic facial features" },
    { label: "Native American", value: "with warm bronze skin and Indigenous American facial features" },
    { label: "Polynesian/Pacific Islander", value: "with warm brown skin and Polynesian facial features" },
    { label: "Ethiopian/East African", value: "with deep brown skin and East African facial features" }
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

const promptSelections = requestFromUser("Select from the dropdowns or randomize them", "Generate", function () {
    return [

        // Subject-Nationality
        this.menu(0, nationalityOptions),

        // Outfit
        this.menu(0, [
            "Random Selection",
            ...outfitPresets
        ]),

        // Action
        this.menu(0, [
            "Random Selection",
            ...actionPresets
        ])
    ]
})


async function generateBatch() {

    canvas.clear();

    let nationality;
    let outfit;
    let action;

    if (promptSelections[0] === 0) {
        nationality = randomize(nationalityPresets);
    } else {
        nationality = nationalityPresets[promptSelections[0] - 1];
    }

    if (promptSelections[1] === 0) {
        outfit = randomize(outfitPresets);
    } else {
        outfit = outfitPresets[promptSelections[1] - 1];
    }

    if (promptSelections[2] === 0) {
        action = randomize(actionPresets);
    } else {
        action = actionPresets[promptSelections[2] - 1];
    }

    const imagePrompt = "A photo of a " + nationality.label + " " + gender + " " + nationality.value + ", " + action + ", wearing " + outfit + ". Natural anatomy.";
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

    config.loras = [
        {
            mode: "all",
            file: "pornmaster_uncensored_krea2_v1_lora_f16.ckpt",
            weight: 1.0
        },
        {
            mode: "all",
            file: "mysticxxx_krea2_v3_lora_f16.ckpt",
            weight: 0.6
        }
    ];

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

    console.log("BATCH FINISHED SUCCESSFULLY!");
}

async function runBatch() {
    for (var i = 0; i < 3; i++) {
        await generateBatch();
    }
}

runBatch();
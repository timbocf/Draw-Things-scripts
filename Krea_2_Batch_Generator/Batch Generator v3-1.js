//@api-1.0

// =========================================
// KREA 2 MODULAR BATCH GENERATOR
// =========================================


// =========================================
// PRESETS — EDIT THESE FREELY
// =========================================

// GENDER
const genderPresets = [
    "woman",
    "man",
    "girl",
		"boy"
];

// NATIONALITY / ETHNICITY
const nationalityPresets = [
    "caucasian",
		"black",
    "Indian",
    "Thai",
    "Japanese",
    "Korean",
    "Chinese",
    "Filipina",
    "Brazilian",
    "Mexican of Incan descent with mezo-american features"
];

// AGE
const agePresets = [
		"14 year old",
		"16 year old",
    "18 year old",
    "20 year old",
    "25 year old",
    "30 year old",
    "35 year old",
    "40 year old",
    "45 year old",
    "50 year old",
    "55 year old",
    "65 year old"
];

// SKIN TONE
const skinTonePresets = [
    "very pale skin",
    "pale skin",
    "fair skin",
    "light beige skin",
    "beige skin",
    "warm beige skin",
    "golden beige skin",
    "tan skin",
    "caramel skin",
    "brown skin",
    "deep brown skin"
];

// MAKEUP
const makeupPresets = [
    "natural makeup",
    "light makeup",
    "full makeup",
    "dramatic eye makeup",
    "red lipstick",
    "eyeliner",
    "mascara",
    "blush"
];

// TATTOOS
const tattooPresets = [
    "a small tattoo",
    "floral tattoos",
    "a sleeve tattoo",
    "tattoos on both arms",
    "a back tattoo",
    "a neck tattoo"
];

// HAIR COLOR
const hairColorPresets = [
    "blonde hair",
    "black hair",
    "brown hair",
    "dark brown hair",
    "red hair",
    "auburn hair",
    "gray hair",
    "silver hair"
];

// HAIR LENGTH
const hairLengthPresets = [
    "very short hair",
    "short hair",
    "shoulder-length hair",
    "medium-length hair",
    "long hair",
    "very long hair"
];

// HAIRSTYLE
const hairstylePresets = [
    "straight hair",
    "wavy hair",
    "curly hair",
    "loose curls",
    "a ponytail",
    "a messy bun",
    "french braided hair",
		"messy double buns",
    "a bob haircut",
		"a short boyish hairstyle"
];

// BODY TYPE
const bodyTypePresets = [
    "slim build",
    "athletic build",
    "curvy build",
    "average build",
    "petite build",
    "muscular build"
];

// CLOTHING
const clothingPresets = [
    "a loose fitting T-shirt",
    "a fitted T-shirt",
    "a tank top",
    "a crop top",
    "a blouse",
    "a button-up shirt",
    "a hoodie",
    "a denim jacket",
    "jeans",
    "shorts",
    "leggings",
    "a skirt",
    "a summer dress",
		"a short babydoll dress",
    "a cocktail dress",
		"nude",
		"lace bustier",
		"bikini panties",
		"pushup bra",
		"training bra",
		"lace garter belt",
		"thigh-high stockings",
		"thigh-high leather boots",
		"stiletto heels",
		"cowboy boots",
		"cowboy hat",
		"white tube socks",
		"crop top t-shirt showing underboob",
		"granny panties",
		"string bikini",
		"Hooters uniform with form-fitting white short-sleeve shirt tucked into short form-fitting bright orange shorts",
		"an unbuttoned men's dress shirt",
		"short champagne-colored silk pajama set that shows her upper thigh"
];


// ACTIONS / POSITIONS
const actionPresets = [
    "standing",
    "sitting",
    "walking",
    "smiling",
    "smiling at the camera",
    "looking at the camera",
    "looking away from the camera",
    "hands on her hips",
    "with her arms crossed",
    "posing for the camera",
		"standing with her back against a wall", 
		"arms above her head",
		"hands clasped",
		"back arched",
		"head tilted upward",
		"lips parted",
		"one knee bent",
		"foot touching the wall",
		"shoulders pulled back",
		"breasts pushed upward",
		"3/4 turn view over her shoulder",
		"looking back at the camera",
		"hands on her breasts", 
		"birds-eye view", 
		"laying on a bed", 
		"standing at the edge of a bed, leaning forward, feet on floor, elbows on the bed, pushing her ass toward the camera",
		"laying on her side", 
		"on a bed", 
		"facedown", 
		"face in the foreground",
		"feet in the foreground",
		"ass pushed high in the air"
];


// =========================================
// STEP 1 — BATCH SETUP
// =========================================

const setup = requestFromUser(
    "Batch Setup",
    "Continue",
    function () {
        return [
            this.menu(0, [
                "1 Subject",
                "2 Subjects",
                "3 Subjects",
                "4 Subjects",
                "5 Subjects"
            ]),

            this.menu(0, [
                "1 Outfit",
                "2 Outfits",
                "3 Outfits",
                "4 Outfits",
                "5 Outfits"
            ]),

            this.segmented(0, [
                "1:1",
                "3:4",
                "4:3"
            ])
        ];
    }
);

const subjectCount = setup[0] + 1;
const outfitCount = setup[1] + 1;
const aspectIndex = setup[2];


// =========================================
// STEP 2 — INPUT SCREEN
// =========================================

const inputs = requestFromUser(
    "Batch Prompts",
    "Generate",
    function () {

        const fields = [];


        // ====================================
        // SUBJECTS
        // ====================================

        for (let i = 0; i < subjectCount; i++) {

            // SUBJECT HEADING
            fields.push(
                this.section(
                    "SUBJECT " + (i + 1),
                    "Identity, appearance and body type",
                    []
                )
            );


            // IDENTITY HEADING
            fields.push(
                this.section(
                    "IDENTITY",
                    "",
                    []
                )
            );


            // GENDER
            const genderMenu = ["Choose gender"];

            for (let j = 0; j < genderPresets.length; j++) {
                genderMenu.push(genderPresets[j]);
            }

            fields.push(
                this.menu(0, genderMenu)
            );

            fields.push(
                this.textField(
                    "",
                    "Custom gender",
                    false,
                    40
                )
            );


            // NATIONALITY
            const nationalityMenu = [
                "Choose nationality / ethnicity"
            ];

            for (let j = 0; j < nationalityPresets.length; j++) {
                nationalityMenu.push(nationalityPresets[j]);
            }

            fields.push(
                this.menu(0, nationalityMenu)
            );

            fields.push(
                this.textField(
                    "",
                    "Custom nationality / ethnicity",
                    false,
                    40
                )
            );


            // AGE
            fields.push(
                this.menu(
                    6,
                    agePresets
                )
            );


            // SKIN TONE
            fields.push(
                this.menu(
                    5,
                    skinTonePresets
                )
            );

            fields.push(
                this.textField(
                    "",
                    "Custom skin tone",
                    false,
                    40
                )
            );


            // APPEARANCE HEADING
            fields.push(
                this.section(
                    "APPEARANCE",
                    "",
                    []
                )
            );


            // MAKEUP
            for (let j = 0; j < makeupPresets.length; j++) {
                fields.push(
                    this.switch(
                        false,
                        makeupPresets[j]
                    )
                );
            }


            // TATTOOS
            for (let j = 0; j < tattooPresets.length; j++) {
                fields.push(
                    this.switch(
                        false,
                        tattooPresets[j]
                    )
                );
            }


            // HAIR COLOR
            const hairColorMenu = [
                "No hair color"
            ];

            for (let j = 0; j < hairColorPresets.length; j++) {
                hairColorMenu.push(hairColorPresets[j]);
            }

            fields.push(
                this.menu(0, hairColorMenu)
            );

            fields.push(
                this.textField(
                    "",
                    "Custom hair color",
                    false,
                    40
                )
            );


            // HAIR LENGTH
            const hairLengthMenu = [
                "No hair length"
            ];

            for (let j = 0; j < hairLengthPresets.length; j++) {
                hairLengthMenu.push(hairLengthPresets[j]);
            }

            fields.push(
                this.menu(0, hairLengthMenu)
            );

            fields.push(
                this.textField(
                    "",
                    "Custom hair length",
                    false,
                    40
                )
            );


            // HAIRSTYLE
            const hairstyleMenu = [
                "No hairstyle"
            ];

            for (let j = 0; j < hairstylePresets.length; j++) {
                hairstyleMenu.push(hairstylePresets[j]);
            }

            fields.push(
                this.menu(0, hairstyleMenu)
            );

            fields.push(
                this.textField(
                    "",
                    "Custom hairstyle",
                    false,
                    40
                )
            );


            // BODY TYPE
            const bodyTypeMenu = [
                "No body type"
            ];

            for (let j = 0; j < bodyTypePresets.length; j++) {
                bodyTypeMenu.push(bodyTypePresets[j]);
            }

            fields.push(
                this.menu(0, bodyTypeMenu)
            );

            fields.push(
                this.textField(
                    "",
                    "Custom body type",
                    false,
                    40
                )
            );


            // ADDITIONAL DETAILS
            fields.push(
                this.textField(
                    "",
                    "Additional subject details",
                    false,
                    60
                )
            );
        }


        // ===================================
        // OUTFITS
        // ===================================

        fields.push(
            this.section(
                "OUTFITS",
                "Select the clothing items for each outfit",
                []
            )
        );


        for (let i = 0; i < outfitCount; i++) {

            fields.push(
                this.section(
                    "OUTFIT " + (i + 1),
                    "",
                    []
                )
            );


            for (let j = 0; j < clothingPresets.length; j++) {
                fields.push(
                    this.switch(
                        false,
                        clothingPresets[j]
                    )
                );
            }


            fields.push(
                this.textField(
                    "",
                    "Custom outfit",
                    false,
                    60
                )
            );
        }


        // ====================================
        // ACTIONS / POSITIONS
        // ====================================

        fields.push(
            this.section(
                "ACTIONS / POSITIONS",
                "Select any combination",
                []
            )
        );


        for (let j = 0; j < actionPresets.length; j++) {
            fields.push(
                this.switch(
                    false,
                    actionPresets[j]
                )
            );
        }


        fields.push(
            this.textField(
                "",
                "Custom action / position",
                false,
                60
            )
        );


        // ====================================
        // PROMPT TEMPLATE
        // ====================================

        fields.push(
            this.section(
                "PROMPT TEMPLATE",
                "Use {subjects}, {clothing}, and {action}",
                []
            )
        );


        fields.push(
            this.textField(
                "A photo of {subjects} wearing {clothing}, {action}",
                "Prompt Template",
                false,
                80
            )
        );


        return fields;
    }
);


// =========================================
// READ INPUTS
// =========================================

let index = 0;

const subjects = [];


// =========================================
// SUBJECTS
// =========================================

for (let i = 0; i < subjectCount; i++) {

    const subjectParts = [];


    // Skip SUBJECT heading
    index++;

    // Skip IDENTITY heading
    index++;


    // -----------------------------------------
    // GENDER
    // -----------------------------------------

    const genderIndex = inputs[index++];

    const typedGender = inputs[index++];

    let gender = "";

    if (typedGender !== "") {
        gender = typedGender;
    }
    else if (genderIndex > 0) {
        gender = genderPresets[genderIndex - 1];
    }


    // -----------------------------------------
    // NATIONALITY
    // -----------------------------------------

    const nationalityIndex = inputs[index++];

    const typedNationality = inputs[index++];

    let nationality = "";

    if (typedNationality !== "") {
        nationality = typedNationality;
    }
    else if (nationalityIndex > 0) {
        nationality =
            nationalityPresets[nationalityIndex - 1];
    }


    // -----------------------------------------
    // AGE
    // -----------------------------------------

    const ageIndex = inputs[index++];

    const age = agePresets[ageIndex];


    // -----------------------------------------
    // SKIN TONE
    // -----------------------------------------

    const skinToneIndex = inputs[index++];

    const skin = skinTonePresets[skinToneIndex];


    // CUSTOM SKIN TONE
    const typedSkin = inputs[index++];

    let finalSkin = skin;

    if (typedSkin !== "") {
        finalSkin = typedSkin;
    }


    // -----------------------------------------
    // BASIC SUBJECT
    // -----------------------------------------

    if (nationality !== "") {
        subjectParts.push(nationality);
    }

    if (gender !== "") {
        subjectParts.push(gender);
    }

    if (age !== "") {
        subjectParts.push(age);
    }

    if (finalSkin !== "") {
        subjectParts.push(
            "with " + finalSkin
        );
    }


    // Skip APPEARANCE heading
    index++;


    // -----------------------------------------
    // MAKEUP
    // -----------------------------------------

    for (let j = 0; j < makeupPresets.length; j++) {

        const enabled = inputs[index++];

        if (enabled) {
            subjectParts.push(
                makeupPresets[j]
            );
        }
    }


    // -----------------------------------------
    // TATTOOS
    // -----------------------------------------

    for (let j = 0; j < tattooPresets.length; j++) {

        const enabled = inputs[index++];

        if (enabled) {
            subjectParts.push(
                tattooPresets[j]
            );
        }
    }


    // -----------------------------------------
    // HAIR COLOR
    // -----------------------------------------

    const hairColorIndex = inputs[index++];

    const typedHairColor = inputs[index++];

    let hairColor = "";

    if (typedHairColor !== "") {
        hairColor = typedHairColor;
    }
    else if (hairColorIndex > 0) {
        hairColor =
            hairColorPresets[hairColorIndex - 1];
    }

    if (hairColor !== "") {
        subjectParts.push(hairColor);
    }


    // -----------------------------------------
    // HAIR LENGTH
    // -----------------------------------------

    const hairLengthIndex = inputs[index++];

    const typedHairLength = inputs[index++];

    let hairLength = "";

    if (typedHairLength !== "") {
        hairLength = typedHairLength;
    }
    else if (hairLengthIndex > 0) {
        hairLength =
            hairLengthPresets[hairLengthIndex - 1];
    }

    if (hairLength !== "") {
        subjectParts.push(hairLength);
    }


    // -----------------------------------------
    // HAIRSTYLE
    // -----------------------------------------

    const hairstyleIndex = inputs[index++];

    const typedHairstyle = inputs[index++];

    let hairstyle = "";

    if (typedHairstyle !== "") {
        hairstyle = typedHairstyle;
    }
    else if (hairstyleIndex > 0) {
        hairstyle =
            hairstylePresets[hairstyleIndex - 1];
    }

    if (hairstyle !== "") {
        subjectParts.push(hairstyle);
    }


    // -----------------------------------------
    // BODY TYPE
    // -----------------------------------------

    const bodyTypeIndex = inputs[index++];

    const typedBodyType = inputs[index++];

    let bodyType = "";

    if (typedBodyType !== "") {
        bodyType = typedBodyType;
    }
    else if (bodyTypeIndex > 0) {
        bodyType =
            bodyTypePresets[bodyTypeIndex - 1];
    }

    if (bodyType !== "") {
        subjectParts.push(bodyType);
    }


    // -----------------------------------------
    // ADDITIONAL DETAILS
    // -----------------------------------------

    const additionalDetails = inputs[index++];

    if (additionalDetails !== "") {
        subjectParts.push(
            additionalDetails
        );
    }


    // -----------------------------------------
    // SAVE SUBJECT
    // -----------------------------------------

    subjects.push(
        subjectParts.join(", ")
    );
}


// =========================================
// CLOTHING
// =========================================

const outfits = [];


// Skip OUTFITS heading
index++;


for (let i = 0; i < outfitCount; i++) {

    const clothingParts = [];


    // Skip OUTFIT heading
    index++;


    // CLOTHING SWITCHES
    for (let j = 0; j < clothingPresets.length; j++) {

        const enabled = inputs[index++];

        if (enabled) {
            clothingParts.push(
                clothingPresets[j]
            );
        }
    }


    // CUSTOM OUTFIT
    const customOutfit = inputs[index++];

    if (customOutfit !== "") {
        clothingParts.push(
            customOutfit
        );
    }


    outfits.push(
        clothingParts.join(", ")
    );
}


// =========================================
// ACTIONS / POSITIONS
// =========================================

// Skip ACTIONS / POSITIONS heading
index++;


// ACTIONS
const actionsParts = [];

for (let j = 0; j < actionPresets.length; j++) {

    const enabled = inputs[index++];

    if (enabled) {
        actionsParts.push(
            actionPresets[j]
        );
    }
}


// CUSTOM ACTION
const customAction = inputs[index++];

if (customAction !== "") {
    actionsParts.push(customAction);
}


const action = actionsParts.join(", ");


// =========================================
// PROMPT TEMPLATE
// =========================================

// Skip PROMPT TEMPLATE heading
index++;

const promptTemplate = inputs[index];


// =========================================
// ASPECT RATIO
// =========================================

let width = 1024;
let height = 1024;

if (aspectIndex === 1) {
    width = 768;
    height = 1024;
}

if (aspectIndex === 2) {
    width = 1024;
    height = 768;
}


// =========================================
// DEBUG
// =========================================

console.log("=================================");
console.log("FINAL SUBJECTS:");
console.log(JSON.stringify(subjects));

console.log("FINAL OUTFITS:");
console.log(JSON.stringify(outfits));

console.log("FINAL ACTION:");
console.log(action);

console.log("FINAL TEMPLATE:");
console.log(promptTemplate);

console.log("INPUT COUNT:");
console.log(inputs.length);

console.log("FINAL INDEX:");
console.log(index);

console.log("=================================");


// =========================================
// GENERATE BATCH
// =========================================

async function generateBatch() {

    for (let o = 0; o < outfits.length; o++) {

        for (let s = 0; s < subjects.length; s++) {

            const subject = subjects[s];

            const clothing = outfits[o];


            // ---------------------------------
            // BUILD PROMPT
            // ---------------------------------

            const imagePrompt = promptTemplate
                .replace(
                    /\{subjects\}/gi,
                    subject
                )
                .replace(
                    /\{subject\}/gi,
                    subject
                )
                .replace(
                    /\{clothing\}/gi,
                    clothing
                )
                .replace(
                    /\{action\}/gi,
                    action
                );


            console.log("=================================");
            console.log("GENERATING:");
            console.log(imagePrompt);
            console.log("=================================");


            // ---------------------------------
            // COPY CURRENT CONFIG
            // ---------------------------------

            let config = JSON.parse(
                JSON.stringify(
                    pipeline.configuration
                )
            );


            // ---------------------------------
            // KREA 2
            // ---------------------------------

            config.model =
                "krea_2_turbo_i8x.ckpt";

            config.mode =
                "txt2img";

            config.width =
                width;

            config.height =
                height;

            config.batchCount =
                1;

            config.batchSize =
                1;


            if (config.gridRows) {
                config.gridRows = 1;
            }

            if (config.gridColumns) {
                config.gridColumns = 1;
            }

            if (config.numFrames) {
                config.numFrames = 1;
            }

            if (config.stride) {
                config.stride = 0;
            }


            // ---------------------------------
            // RANDOM SEED
            // ---------------------------------

            config.seed = -1;


            // ---------------------------------
            // LORAS
            // ---------------------------------

            config.loras = [
                {
                    mode: "all",
                    file:
                        "pornmaster_uncensored_krea2_v1_lora_f16.ckpt",
                    weight: 1.0
                },
                {
                    mode: "all",
                    file:
                        "mysticxxx_krea2_v3_lora_f16.ckpt",
                    weight: 0.6
                }
            ];


            // ---------------------------------
            // GENERATE
            // ---------------------------------

            await pipeline.run({
                configuration: config,
                prompt: imagePrompt
            });


            console.log("Image complete.");
        }
    }


    console.log("=================================");
    console.log("BATCH FINISHED SUCCESSFULLY!");
    console.log("=================================");
}


// =========================================
// START
// =========================================

generateBatch();
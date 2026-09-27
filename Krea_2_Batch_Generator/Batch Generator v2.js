//@api-1.0

// =========================================
// KREA 2 BATCH GENERATOR
// =========================================


// =========================================
// PRESET LISTS
// =========================================

// BASE SUBJECTS
const subjectPresets = [
    "woman",
    "man",
    "person"
];


// AGE
const agePresets = [
    "18 years old",
    "22 years old",
    "35 years old",
    "45 years old",
    "55 years old",
    "65 years old"
];


// HAIR COLOR
const hairColorPresets = [
    "blonde hair",
    "black hair",
    "brown hair",
    "red hair"
];


// HAIR LENGTH
const hairLengthPresets = [
    "short hair",
    "medium-length hair",
    "long hair"
];


// HAIRSTYLE
const hairstylePresets = [
    "bob hairstyle",
    "double buns hairstyle",
    "French braid hairstyle",
    "ponytail hairstyle",
    "braided hairstyle",
    "curly hairstyle",
    "wavy hairstyle",
    "straight hairstyle"
];


// BODY TYPE
const bodyTypePresets = [
    "slim build",
    "athletic build",
    "curvy build",
    "average build"
];


// =========================================
// OUTFIT COMPONENTS
// =========================================

const outfitPresets = [
    "a loose fitting T-shirt",
    "a fitted T-shirt",
    "a tank top",
    "a hoodie",
    "a button-up shirt",
    "jeans",
    "denim shorts",
    "leggings",
    "sweatpants",
    "a skirt",
    "white tube socks",
    "ankle socks",
    "sneakers",
    "boots"
];


// =========================================
// ACTIONS
// =========================================

const actionPresets = [
    "smiling"
];


// =========================================
// STEP 1 — CHOOSE NUMBER OF FIELDS
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

            this.menu(0, [
                "1 Action / Position",
                "2 Actions / Positions",
                "3 Actions / Positions",
                "4 Actions / Positions",
                "5 Actions / Positions"
            ]),

            this.segmented(0, [
                "1:1",
                "3:4",
                "4:3"
            ])
        ];
    }
);


// =========================================
// CONVERT MENU VALUES TO COUNTS
// =========================================

const subjectCount = setup[0] + 1;
const outfitCount = setup[1] + 1;
const actionCount = setup[2] + 1;

const aspectIndex = setup[3];


// =========================================
// STEP 2 — ENTER PROMPTS
// =========================================

const inputs = requestFromUser(
    "Batch Prompts",
    "Generate",
    function () {

        const fields = [];


        // =====================================
        // SUBJECTS
        // =====================================

        for (let i = 0; i < subjectCount; i++) {


            // ---------------------------------
            // BASE SUBJECT
            // ---------------------------------

            const subjectMenu = [
                "Choose a subject"
            ];

            for (let j = 0; j < subjectPresets.length; j++) {
                subjectMenu.push(subjectPresets[j]);
            }

            fields.push(
                this.menu(0, subjectMenu)
            );

            fields.push(
                this.textField(
                    "",
                    "Or type your own subject",
                    false,
                    40
                )
            );


            // ---------------------------------
            // AGE
            // ---------------------------------

            const ageMenu = [
                "Choose an age"
            ];

            for (let j = 0; j < agePresets.length; j++) {
                ageMenu.push(agePresets[j]);
            }

            fields.push(
                this.menu(0, ageMenu)
            );


            // ---------------------------------
            // HAIR COLOR
            // ---------------------------------

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
                    "Or type custom hair color",
                    false,
                    40
                )
            );


            // ---------------------------------
            // HAIR LENGTH
            // ---------------------------------

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
                    "Or type custom hair length",
                    false,
                    40
                )
            );


            // ---------------------------------
            // HAIRSTYLE
            // ---------------------------------

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
                    "Or type custom hairstyle",
                    false,
                    40
                )
            );


            // ---------------------------------
            // BODY TYPE
            // ---------------------------------

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
                    "Or type custom body type",
                    false,
                    40
                )
            );
        }


        // =====================================
        // OUTFITS
        // =====================================

        for (let i = 0; i < outfitCount; i++) {


            // ---------------------------------
            // OUTFIT COMPONENT CHECKBOXES
            // ---------------------------------

            for (let j = 0; j < outfitPresets.length; j++) {

                fields.push(
                    this.switch(
                        false,
                        outfitPresets[j]
                    )
                );
            }


            // ---------------------------------
            // CUSTOM CLOTHING
            // ---------------------------------

            fields.push(
                this.textField(
                    "",
                    "Add custom clothing item(s)",
                    false,
                    40
                )
            );
        }


        // =====================================
        // ACTIONS
        // =====================================

        for (let i = 0; i < actionCount; i++) {

            const actionMenu = [
                "Choose a preset"
            ];

            for (let j = 0; j < actionPresets.length; j++) {
                actionMenu.push(actionPresets[j]);
            }

            fields.push(
                this.menu(0, actionMenu)
            );

            fields.push(
                this.textField(
                    "",
                    "Or type your own action",
                    false,
                    40
                )
            );
        }


        // =====================================
        // PROMPT TEMPLATE
        // =====================================

        fields.push(
            this.textField(
                "A photo of a {subject} {action} wearing {clothing}",
                "Prompt Template",
                false,
                60
            )
        );


        // =====================================
        // RETURN ALL FIELDS
        // =====================================

        return fields;
    }
);


// =========================================
// READ THE FIELDS
// =========================================

let index = 0;


// =========================================
// SUBJECTS
// =========================================

const subjects = [];

for (let i = 0; i < subjectCount; i++) {


    // ---------------------------------------
    // BASE SUBJECT
    // ---------------------------------------

    const subjectPresetIndex = inputs[index++];
    const typedSubject = inputs[index++];

    let subject = "";

    if (typedSubject !== "") {

        subject = typedSubject;

    } else if (subjectPresetIndex > 0) {

        subject = subjectPresets[subjectPresetIndex - 1];
    }


    // ---------------------------------------
    // AGE
    // ---------------------------------------

    const ageIndex = inputs[index++];

    let age = "";

    if (ageIndex > 0) {

        age = agePresets[ageIndex - 1];
    }


    // ---------------------------------------
    // HAIR COLOR
    // ---------------------------------------

    const hairColorIndex = inputs[index++];
    const typedHairColor = inputs[index++];

    let hairColor = "";

    if (typedHairColor !== "") {

        hairColor = typedHairColor;

    } else if (hairColorIndex > 0) {

        hairColor = hairColorPresets[hairColorIndex - 1];
    }


    // ---------------------------------------
    // HAIR LENGTH
    // ---------------------------------------

    const hairLengthIndex = inputs[index++];
    const typedHairLength = inputs[index++];

    let hairLength = "";

    if (typedHairLength !== "") {

        hairLength = typedHairLength;

    } else if (hairLengthIndex > 0) {

        hairLength = hairLengthPresets[hairLengthIndex - 1];
    }


    // ---------------------------------------
    // HAIRSTYLE
    // ---------------------------------------

    const hairstyleIndex = inputs[index++];
    const typedHairstyle = inputs[index++];

    let hairstyle = "";

    if (typedHairstyle !== "") {

        hairstyle = typedHairstyle;

    } else if (hairstyleIndex > 0) {

        hairstyle = hairstylePresets[hairstyleIndex - 1];
    }


    // ---------------------------------------
    // BODY TYPE
    // ---------------------------------------

    const bodyTypeIndex = inputs[index++];
    const typedBodyType = inputs[index++];

    let bodyType = "";

    if (typedBodyType !== "") {

        bodyType = typedBodyType;

    } else if (bodyTypeIndex > 0) {

        bodyType = bodyTypePresets[bodyTypeIndex - 1];
    }


    // =====================================
    // BUILD COMPLETE SUBJECT
    // =====================================

    const subjectParts = [];

    if (subject !== "") {
        subjectParts.push(subject);
    }

    if (age !== "") {
        subjectParts.push(age);
    }

    if (hairColor !== "") {
        subjectParts.push(hairColor);
    }

    if (hairLength !== "") {
        subjectParts.push(hairLength);
    }

    if (hairstyle !== "") {
        subjectParts.push(hairstyle);
    }

    if (bodyType !== "") {
        subjectParts.push(bodyType);
    }

    subjects.push(
        subjectParts.join(", ")
    );
}


// =========================================
// OUTFITS
// =========================================

const outfits = [];

for (let i = 0; i < outfitCount; i++) {

    const clothingParts = [];


    // ---------------------------------------
    // READ EVERY CHECKBOX
    // ---------------------------------------

    for (let j = 0; j < outfitPresets.length; j++) {

        const selected = inputs[index++];

        if (selected === true) {

            clothingParts.push(
                outfitPresets[j]
            );
        }
    }


    // ---------------------------------------
    // CUSTOM CLOTHING
    // ---------------------------------------

    const typedOutfit = inputs[index++];

    if (typedOutfit !== "") {

        clothingParts.push(
            typedOutfit
        );
    }


    // ---------------------------------------
    // BUILD COMPLETE OUTFIT
    // ---------------------------------------

    outfits.push(
        clothingParts.join(", ")
    );
}


// =========================================
// ACTIONS
// =========================================

const actions = [];

for (let i = 0; i < actionCount; i++) {

    const presetIndex = inputs[index++];
    const typedAction = inputs[index++];

    let action = "";

    if (typedAction !== "") {

        action = typedAction;

    } else if (presetIndex > 0) {

        action = actionPresets[presetIndex - 1];
    }

    actions.push(action);
}


// =========================================
// PROMPT TEMPLATE
// =========================================

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
// GENERATE EVERY COMBINATION
// =========================================

async function generateBatch() {

    for (let a = 0; a < actions.length; a++) {

        for (let o = 0; o < outfits.length; o++) {

            for (let s = 0; s < subjects.length; s++) {

                const subject = subjects[s];
                const clothing = outfits[o];
                const action = actions[a];


                // BUILD PROMPT
                const imagePrompt = promptTemplate
                    .replace(/\{subject\}/gi, subject)
                    .replace(/\{clothing\}/gi, clothing)
                    .replace(/\{action\}/gi, action);


                // LOG PROMPT
                console.log("=================================");
                console.log("Generating:");
                console.log(imagePrompt);
                console.log("=================================");


                // COPY CURRENT CONFIGURATION
                let config = JSON.parse(
                    JSON.stringify(pipeline.configuration)
                );


                // KREA 2 SETTINGS
                config.model = "krea_2_turbo_i8x.ckpt";
                config.mode = "txt2img";

                config.width = width;
                config.height = height;

                config.batchCount = 1;
                config.batchSize = 1;


                // FORCE SINGLE IMAGE
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


                // RANDOM SEED
                config.seed = -1;


                // LORAS
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


                // GENERATE
                await pipeline.run({
                    configuration: config,
                    prompt: imagePrompt
                });


                console.log("Image complete.");
            }
        }
    }


    console.log("=================================");
    console.log("BATCH FINISHED SUCCESSFULLY!");
    console.log("=================================");
}


generateBatch();
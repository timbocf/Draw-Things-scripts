//@api-1.0

// =========================================
// KREA 2 BATCH GENERATOR
// =========================================


// =========================================
// PRESET LISTS
// =========================================

const subjectPresets = [
    "woman with blonde hair",
    "woman with black hair",
    "Anne Hathaway",
    "Dolly Parton"
];

const outfitPresets = [
    "a loose fitting T-shirt and blue jeans",
    "a bikini",
    "a halter top and pleated shorts"
];

const actionPresets = [
    "smiling",
    "lips parted",
    "looking away from the camera"
];


// =========================================
// STEP 1 — CHOOSE NUMBER OF FIELDS
// =========================================

const setup = requestFromUser(
    "Batch Setup",
    "Continue",
    function () {

        return [

            // Number of subjects
            this.menu(0, [
                "1 Subject",
                "2 Subjects",
                "3 Subjects",
                "4 Subjects",
                "5 Subjects"
            ]),

            // Number of outfits
            this.menu(0, [
                "1 Outfit",
                "2 Outfits",
                "3 Outfits",
                "4 Outfits",
                "5 Outfits"
            ]),

            // Number of actions
            this.menu(0, [
                "1 Action / Position",
                "2 Actions / Positions",
                "3 Actions / Positions",
                "4 Actions / Positions",
                "5 Actions / Positions"
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

const aspectIndex = setup[2];


// =========================================
// STEP 2 — ENTER PROMPTS
// =========================================

const inputs = requestFromUser(
    "Batch Prompts",
    "Generate",
    function () {

        const fields = [];

        // Aspect ratio
        fields.push(
            this.segmented(0, [
                "1:1",
                "3:4",
                "4:3"
            ])
        )


        // =====================================
        // SUBJECTS
        // =====================================

        for (let i = 0; i < subjectCount; i++) {

            const subjectMenu = [
                "Choose a subject"
            ];

            for (let j = 0; j < subjectPresets.length; j++) {
                subjectMenu.push(subjectPresets[j]);
            }

            fields.push(
                this.menu(0, subjectMenu)
            );
        }


        // =====================================
        // OUTFITS
        // =====================================

        for (let i = 0; i < outfitCount; i++) {

            const outfitMenu = [
                "Choose clothing ensemble"
            ];

            for (let j = 0; j < outfitPresets.length; j++) {
                outfitMenu.push(outfitPresets[j]);
            }

            fields.push(
                this.menu(0, outfitMenu)
            );
        }


        // =====================================
        // ACTIONS
        // =====================================

        for (let i = 0; i < actionCount; i++) {

            const actionMenu = [
                "Choose an action"
            ];

            for (let j = 0; j < actionPresets.length; j++) {
                actionMenu.push(actionPresets[j]);
            }

            fields.push(
                this.menu(0, actionMenu)
            );
        }


        // =====================================
        // PROMPT TEMPLATE
        // =====================================

        fields.push(
            this.textField(
                "A photo of {subject}, {action}, wearing {clothing}",
                "Prompt Template",
                false,
                60
            )
        );


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

    const presetIndex = inputs[index++];

    // let subject = "";

    subjects.push(subject);
}


// =========================================
// OUTFITS
// =========================================

const outfits = [];

for (let i = 0; i < outfitCount; i++) {

    const presetIndex = inputs[index++];
    const typedOutfit = inputs[index++];

    let outfit = "";

    outfits.push(outfit);
}


// =========================================
// ACTIONS
// =========================================

const actions = [];

for (let i = 0; i < actionCount; i++) {

    const presetIndex = inputs[index++];
    const typedAction = inputs[index++];

    let action = "";

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

    // 3:4
    width = 768;
    height = 1024;
}

if (aspectIndex === 2) {

    // 4:3
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


                // =================================
                // BUILD PROMPT
                // =================================

                const imagePrompt = promptTemplate
                    .replace(/\{subject\}/gi, subject)
                    .replace(/\{clothing\}/gi, clothing)
                    .replace(/\{action\}/gi, action);


                // =================================
                // LOG PROMPT
                // =================================

                console.log("=================================");
                console.log("Generating:");
                console.log(imagePrompt);
                console.log("=================================");


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

                config.width = width;
                config.height = height;

                config.batchCount = 1;
                config.batchSize = 1;


                // =================================
                // FORCE SINGLE IMAGE
                // =================================

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
            }
        }
    }


    // =========================================
    // FINISHED
    // =========================================

    console.log("=================================");
    console.log("BATCH FINISHED SUCCESSFULLY!");
    console.log("=================================");
}


generateBatch();

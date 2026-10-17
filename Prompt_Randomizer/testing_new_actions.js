const actions = [
    "Looking over her shoulder while climbing a narrow staircase, one hand trailing along the banister.",
    "Leaning across the counter of a late-night diner, resting her chin in one hand while watching the rain outside.",
    "Standing on tiptoe to reach a book on a high shelf, one arm extended overhead.",
    "Sitting sideways on the hood of a vintage convertible, one knee bent and the other leg extended toward the pavement.",
    "Stepping out of a swimming pool, both hands gripping the pool edge, wet hair pushed back.",
    "Kneeling beside a broken-down motorcycle, examining the engine with a wrench in one hand.",
    "Leaning against a jukebox, one foot crossed over the other, looking toward the camera.",
    "Standing on a windswept rooftop, holding her hair away from her face as her clothing moves in the breeze.",
    "Sitting backward on a wooden chair, forearms resting across the chair back.",
    "Turning suddenly toward the camera in a crowded hallway, with a candid, mid-motion expression."
];

let imagePrompt;

async function generateBatch() {
    canvas.clear();

    for (const action of actions) {
        const imagePrompt = "A photo of a woman " + action + ".";

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
        ]

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
};

async function runBatch() {
    await generateBatch();
    console.log("Batch Finished!");
};

console.log("promptSelections:", promptSelections);
console.log("imageCount:", imageCount);

runBatch();

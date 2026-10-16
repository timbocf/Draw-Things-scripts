//@api-1.0
// Solo Girl Batch Generator
// author timbocf
// v1
// Draw Things

const theGirls = [

    // Celebrity Presets
    { label: "My Baby", value: "curvy apple-shaped 35-year-old woman with large shapeless drooping breasts, a round ass, long curly 3a black hair, arms covered in red & green rose tattoos, hazel eyes", named: true },
    { label: "Anne Hathaway, Long Hair", value: "Anne Hathaway with a tall slim build with long straight black hair, smokey eyes and heavy mascara", named: true },
    { label: "Anne Hathaway, Short Hair", value: "Anne Hathaway with a tall slim build with short straight black hair in a textured pixie cut, smokey eyes and heavy mascara", named: true },
    { label: "Dolly Parton", value: "young 1970s era Dolly Parton with blown-out blonde hair and bangs", named: true },
    { label: "Sabrina Carpenter", value: "Sabrina Carpenter with shoulder length blonde hair", named: true },
    { label: "Marilyn Monroe", value: "Marilyn Monroe with shoulder length blonde Hollywood curls", named: true },
    { label: "Lisbeth Salander", value: "small petite woman with porcelain skin, a flat chest, narrow hips/shoulders, a short black spiked punk hairstyle shaved on one side, neck tattoos, back tattoos, light body hair, arm and leg tattoos, stacked bracelets, heavy mascara, smokey eyes, eyebrow/lip/septum/nipple/navel piercings, multiple earrings, multiple rings", named: true },
    { label: "Michelle Obama", value: "Michelle Obama", named: true },
    { label: "Betty Boop", value: "Betty Boop", named: true },

    // Nationality Presets
    {
        label: "Caucasian",
        value: "with Western European facial features"
    },
    {
        label: "Black",
        value: "with box braids and blonde streaks braided into black hair, rich deep skin tone and classic African facial features, neck/back/arm tattoos, heavy mascara, smokey eyes, light body hair, hoop earrings, long fingernails, nose/navel/nipple piercings"
    },
    {
        label: "Mexican",
        value: "with prominent Indigenous Mesoamerican features, plump lips, smokey eyes, heavy mascara, arm/back/neck tattoos, light body hair, hoop earrings, multiple rings, nose/navel/nipple piercings"
    },
    {
        label: "Mixed-Race",
        value: "with a natural blend of African and European facial features, lightly colored eyes, softly flared nostrils, a straight natural nose bridge, high defined cheekbones, thick naturally arched eyebrows, thick hair with thick wavy curls, a curvy hourglass figure, and a round ass"
    },
    {
        label: "Indian",
        value: "with South Asian facial features, olive skin and black hair",
    },
    {
        label: "East Asian",
        value: "with East Asian facial features, porcelain skin and black hair",
    }
];

const promptSelections = requestFromUser("Enter a prompt here, including pose, environment, lighting, clothing, etc. The script will generate one image for each subject, with a base prompt of 'A photo of {subject}' then whatever you enter here.", "Generate", function () {
    return [
        this.section(
            "Custom Prompt",
            "Enter prompt without any subject identifiers",
            [
                this.textField("", "Prompt:", true, 94)
            ]
        )
    ]
});

async function generateBatch() {
    canvas.clear();

    let userPrompt = promptSelections[0][0];

    let config = JSON.parse(
        JSON.stringify(pipeline.configuration)
    );

    config.model = "krea_2_turbo_i8x.ckpt";
    config.width = 1024;
    config.height = 1024;

    config.batchCount = 1;
    config.batchSize = 1;

    config.seed = -1;

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

    for (const girl of theGirls) {
        const imagePrompt =
            "A photo of " +
            (girl.named ? girl.value : "a woman " + girl.value) +
            ", " + userPrompt +
            ". Natural anatomy.";

        console.log("Generating: " + girl.label);
        console.log(imagePrompt);

        await pipeline.run({
            configuration: config,
            prompt: imagePrompt
        });

        console.log("Completed: " + girl.label);
    }

    // =========================================
    // FINISHED
    // =========================================

};

async function runBatch() {
    await generateBatch();
    console.log("Batch Finished!");
}

runBatch();
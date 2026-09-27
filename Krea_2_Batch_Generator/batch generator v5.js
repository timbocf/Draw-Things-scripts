//@api-1.0
// =========================================
// KREA 2 MODULAR BATCH GENERATOR
// =========================================

// Presets
const genderPresets = ["woman", "man", "girl", "boy"];
const nationalityPresets = [
    "caucasian", "black", "Indian", "Thai", "Japanese", 
    "Korean", "Chinese", "Filipina", "Brazilian", "Mexican"
];
const bodyTypePresets = ["slim build", "athletic build", "curvy build", "average build", "petite build", "muscular build"];
const clothingPresets = [
    "a loose fitting T-shirt", "a fitted T-shirt", "a tank top", 
    "a crop top", "a blouse", "a button-up shirt", "a hoodie", 
    "a denim jacket", "jeans", "shorts", "leggings", "a skirt", 
    "a summer dress", "a short babydoll dress", "a cocktail dress", 
    "nude", "lace bustier", "bikini panties", "pushup bra"
];
const agePresets = ["18 years old", "20 years old", "25 years old", "30 years old", "35 years old", "40 years old", "45 years old"];
const skinTonePresets = ["fair skin", "pale skin", "tanned skin", "olive skin", "dark skin", "warm brown skin"];
const makeupPresets = ["light makeup", "heavy makeup", "red lipstick", "smokey eyes"];
const tattooPresets = ["arm tattoo", "back tattoo", "sleeve tattoo"];
const hairColorPresets = ["blonde", "brunette", "black", "red", "auburn"];
const hairLengthPresets = ["short", "medium length", "long"];
const hairstylePresets = ["straight", "wavy", "curly", "ponytail"];
const actionPresets = ["standing", "sitting", "lying down", "walking", "looking at camera"];

// =========================================
// STEP 1 — BATCH SETUP
// =========================================
const setup = requestFromUser("Batch Setup", "Continue", function () {
    return [
        this.section(
            "❖  Batch Configurations",
            "Define how many variants to generate per batch",
            [
                this.menu(0, ["1 Subject", "2 Subjects", "3 Subjects", "4 Subjects", "5 Subjects"]),
                this.menu(0, ["1 Outfit", "2 Outfits", "3 Outfits", "4 Outfits", "5 Outfits"]),
                this.menu(0, ["1 Action", "2 Actions", "3 Actions", "4 Actions", "5 Actions"]),
                this.segmented(0, ["1:1 Square", "3:4 Portrait", "4:3 Landscape"])
            ]
        )
    ];
});

// Extract Setup Inputs from Section Array
const setupData = setup[0];
const subjectCount = setupData[0] + 1;
const outfitCount = setupData[1] + 1;
const actionCount = setupData[2] + 1;
const aspectIndex = setupData[3];

// =========================================
// STEP 2 — INPUT SCREEN
// =========================================
const inputs = requestFromUser("Batch Prompts", "Generate", function () {
    const fields = [];

    // --- SUBJECTS ---
    for (let i = 0; i < subjectCount; i++) {
        const genderMenu = ["Choose gender", ...genderPresets];
        const nationalityMenu = ["Choose nationality / ethnicity", ...nationalityPresets];
        const hairColorMenu = ["No hair color", ...hairColorPresets];
        const hairLengthMenu = ["No hair length", ...hairLengthPresets];
        const hairstyleMenu = ["No hairstyle", ...hairstylePresets];
        const bodyTypeMenu = ["No body type", ...bodyTypePresets];

        // Identity Card
        fields.push(
            this.section(
                `❖  SUBJECT ${i + 1} • Identity`,
                "Identity, demographics, and body structure",
                [
                    this.menu(0, genderMenu),
                    this.textField("", "Custom gender", false, 40),
                    this.menu(0, nationalityMenu),
                    this.textField("", "Custom nationality / ethnicity", false, 40),
                    this.menu(1, agePresets),
                    this.menu(0, skinTonePresets),
                    this.textField("", "Custom skin tone", false, 40),
                    this.menu(0, bodyTypeMenu),
                    this.textField("", "Custom body type", false, 40)
                ]
            )
        );

        // Appearance Controls Card
        const appearanceControls = [];
        makeupPresets.forEach(m => appearanceControls.push(this.switch(false, `✡︎  ${m}`)));
        tattooPresets.forEach(t => appearanceControls.push(this.switch(false, `✡︎  ${t}`)));

        appearanceControls.push(
            this.menu(0, hairColorMenu),
            this.textField("", "Custom hair color", false, 40),
            this.menu(0, hairLengthMenu),
            this.textField("", "Custom hair length", false, 40),
            this.menu(0, hairstyleMenu),
            this.textField("", "Custom hairstyle", false, 40),
            this.textField("", "Additional subject details", false, 60)
        );

        fields.push(
            this.section(
                `❖  SUBJECT ${i + 1} • Appearance`,
                "Styling, features, and hair",
                appearanceControls
            )
        );
    }

    // --- OUTFITS ---
    for (let i = 0; i < outfitCount; i++) {
        const outfitControls = clothingPresets.map(c => this.switch(false, `✡︎  ${c}`));
        outfitControls.push(this.textField("", "Custom outfit description", false, 60));

        fields.push(
            this.section(
                `❖  OUTFIT ${i + 1}`,
                "Select clothing items or type custom style",
                outfitControls
            )
        );
    }

    // --- ACTIONS & POSES ---
    for (let i = 0; i < actionCount; i++) {
        const actionControls = actionPresets.map(a => this.switch(false, `✡︎  ${a}`));
        actionControls.push(this.textField("", "Custom action / position", false, 60));

        fields.push(
            this.section(
                `❖  ACTION ${i + 1}`,
                "Select action presets or enter a custom pose",
                actionControls
            )
        );
    }

    // --- PROMPT TEMPLATE ---
    fields.push(
        this.section(
            "❖  Prompt Template",
            "Available tags: {subject}, {clothing}, {action}",
            [
                this.textField("A photo of {subject} wearing {clothing}, {action}", "Prompt Template", false, 80)
            ]
        )
    );

    return fields;
});

// =========================================
// STEP 3 — PARSE INPUTS & BUILD PROMPTS
// =========================================
let sectionIdx = 0;
const subjects = [];

// Parse Subject Data
for (let i = 0; i < subjectCount; i++) {
    const subjectParts = [];
    
    // Identity Section Data
    const identityData = inputs[sectionIdx++];
    const genderIndex = identityData[0];
    const typedGender = identityData[1];
    const nationalityIndex = identityData[2];
    const typedNationality = identityData[3];
    const ageIndex = identityData[4];
    const skinToneIndex = identityData[5];
    const typedSkin = identityData[6];
    const bodyTypeIndex = identityData[7];
    const typedBodyType = identityData[8];

    // Gender Parsing
    let gender = typedGender !== "" ? typedGender : (genderIndex > 0 ? genderPresets[genderIndex - 1] : "");
    let nationality = typedNationality !== "" ? typedNationality : (nationalityIndex > 0 ? nationalityPresets[nationalityIndex - 1] : "");
    let age = agePresets[ageIndex] || "";
    let skin = typedSkin !== "" ? typedSkin : (skinToneIndex > 0 ? skinTonePresets[skinToneIndex - 1] : "");
    let bodyType = typedBodyType !== "" ? typedBodyType : (bodyTypeIndex > 0 ? bodyTypePresets[bodyTypeIndex - 1] : "");

    if (nationality) subjectParts.push(nationality);
    if (gender) subjectParts.push(gender);
    if (age) subjectParts.push(age);
    if (skin) subjectParts.push("with " + skin);

    // Appearance Section Data
    const appearanceData = inputs[sectionIdx++];
    let appIdx = 0;

    // Makeup Toggles
    for (let j = 0; j < makeupPresets.length; j++) {
        if (appearanceData[appIdx++]) subjectParts.push(makeupPresets[j]);
    }

    // Tattoo Toggles
    for (let j = 0; j < tattooPresets.length; j++) {
        if (appearanceData[appIdx++]) subjectParts.push(tattooPresets[j]);
    }

    // Hair Options
    const hairColorIdx = appearanceData[appIdx++];
    const typedHairColor = appearanceData[appIdx++];
    let hairColor = typedHairColor !== "" ? typedHairColor : (hairColorIdx > 0 ? hairColorPresets[hairColorIdx - 1] : "");
    if (hairColor) subjectParts.push(hairColor + " hair");

    const hairLengthIdx = appearanceData[appIdx++];
    const typedHairLength = appearanceData[appIdx++];
    let hairLength = typedHairLength !== "" ? typedHairLength : (hairLengthIdx > 0 ? hairLengthPresets[hairLengthIdx - 1] : "");
    if (hairLength) subjectParts.push(hairLength);

    const hairstyleIdx = appearanceData[appIdx++];
    const typedHairstyle = appearanceData[appIdx++];
    let hairstyle = typedHairstyle !== "" ? typedHairstyle : (hairstyleIdx > 0 ? hairstylePresets[hairstyleIdx - 1] : "");
    if (hairstyle) subjectParts.push(hairstyle);

    if (bodyType) subjectParts.push(bodyType);

    const additionalDetails = appearanceData[appIdx++];
    if (additionalDetails) subjectParts.push(additionalDetails);

    subjects.push(subjectParts.join(", "));
}

// Parse Outfits Data
const outfits = [];
for (let i = 0; i < outfitCount; i++) {
    const outfitData = inputs[sectionIdx++];
    const clothingParts = [];
    
    for (let j = 0; j < clothingPresets.length; j++) {
        if (outfitData[j]) clothingParts.push(clothingPresets[j]);
    }

    const customOutfit = outfitData[clothingPresets.length];
    if (customOutfit) clothingParts.push(customOutfit);

    outfits.push(clothingParts.join(", "));
}

// Parse Actions Data
const actions = [];
for (let i = 0; i < actionCount; i++) {
    const actionData = inputs[sectionIdx++];
    const actionParts = [];

    for (let j = 0; j < actionPresets.length; j++) {
        if (actionData[j]) actionParts.push(actionPresets[j]);
    }

    const customAction = actionData[actionPresets.length];
    if (customAction) actionParts.push(customAction);

    actions.push(actionParts.join(", "));
}

// Parse Prompt Template
const templateData = inputs[sectionIdx++];
const promptTemplate = templateData[0];

// Calculate Dimensions
let width = 1024, height = 1024;
if (aspectIndex === 1) { width = 768; height = 1024; }
if (aspectIndex === 2) { width = 1024; height = 768; }

// Build Final Combined Prompts (Subject × Outfit × Action Matrix)
const finalPrompts = [];
for (const outfit of outfits) {
    for (const subject of subjects) {
        for (const action of actions) {
            let constructedPrompt = promptTemplate
                .replace(/{subjects}/gi, subject)
                .replace(/{subject}/gi, subject)
                .replace(/{clothing}/gi, outfit)
                .replace(/{action}/gi, action)
                .replace(", ,", ",")
                .replace("  ", " ");
            finalPrompts.push(constructedPrompt);
        }
    }
}

// =========================================
// STEP 4 — GENERATION LOGIC
// =========================================
async function generateBatch() {
    let config = JSON.parse(JSON.stringify(pipeline.configuration));

    config.model = "krea_2_turbo_i8x.ckpt";
    config.mode = "txt2img";
    config.width = width;
    config.height = height;
    config.batchCount = 1;
    config.batchSize = 1;
    config.seed = -1;

    config.loras = [
        { mode: "all", file: "pornmaster_uncensored_krea2_v1_lora_f16.ckpt", weight: 1.0 },
        { mode: "all", file: "mysticxxx_krea2_v3_lora_f16.ckpt", weight: 0.6 }
    ];

    for (const prompt of finalPrompts) {
        console.log("Generating Prompt:", prompt);
        await pipeline.run({
            configuration: config,
            prompt: prompt
        });
    }
}

generateBatch();

//@api-1.0
// =========================================
// KREA 2 MODULAR BATCH GENERATOR (PRESETS + SWITCHES)
// =========================================

// Presets
const genderPresets = ["woman", "man", "girl", "boy"];
const nationalityPresets = ["Caucasian", "Black", "Anne Hathaway", "Dolly Parton", "Sabrina Carpenter", "Marilyn Monroe", "Indian", "Thai", "Japanese", "Korean", "Filipina", "Brazilian", "Italian", "Mexican of Incan descent with Meso-American heritage"];
const bodyTypePresets = ["slim build", "athletic build", "curvy build", "average build", "petite build", "muscular build"];
const clothingPresets = ["a loose fitting T-shirt", "a fitted T-shirt", "a tank top", "a crop top", "a blouse", "a button-up shirt", "a hoodie", "jeans", "shorts", "a summer dress", "nude", "bikini panties"];
const agePresets = ["18 years old", "20 years old", "25 years old", "30 years old", "35 years old", "40 years old", "45 years old"];
const skinTonePresets = ["fair skin", "pale skin", "tanned skin", "olive skin", "dark skin", "warm brown skin"];
const makeupPresets = ["light makeup", "heavy makeup", "red lipstick", "smokey eyes"];
const tattooPresets = ["arm tattoo", "back tattoo", "sleeve tattoo"];
const hairColorPresets = ["blonde", "brunette", "black", "red", "auburn", "silver"];
const hairLengthPresets = ["short", "medium length", "long"];
const hairstylePresets = ["straight", "wavy", "curly", "ponytail", "messy ponytail", "with bangs", "short boyish hairstyle", "French braid", "messy double buns", "light body hair", "thick body hair"];

// Composite Poses (Dropdown Presets)
const complexActionPresets = [
    { 
        label: "📷 Wall Pose (Back against wall)", 
        value: "standing with her back against a wall, arms raised high above her head and hands clasped together with one knee bent and one foot on the wall" 
    },
    {
        label: "Leaning Forward, ass up",
        value: "on her knees, leaning forward, back arched, ass high in the air, arms stretched out in front of her"
    },
	{
		label: "Spread Eagle", 
        value: "laying on her back with her legs raised and spread wide, feet wide apart, holding her legs in the air with her hands, looking through her open legs at the camera" 
    },
    { 
        label: "Leaning Over Edge of Bed", 
        value: "standing at the edge of a bed, leaning forward, feet on floor, elbows on the bed, pushing her ass toward the camera" 
    },
    { 
        label: "📷 Floor Pose (Cross-legged)", 
        value: "sitting cross-legged on the floor, leaning back slightly on her hands, looking directly into the camera with a relaxed smile" 
    }
];

// Individual Modular Pose Switches
const actionSwitchPresets = [
    "standing with back against wall",
    "arms raised high above head",
    "arms stretched out in front of her",
    "hands clasped together",
    "one knee bent",
    "one foot on the wall",
    "looking off to the side",
    "looking away from camera",
    "looking at camera",
    "looking down",
    "facing camera",
    "facing away from camera",
    "lips parted",
    "leaning forward",
    "elbows resting on bed",
    "smiling",
    "feet spread wide",
    "feet together",
];

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
                // Keep labels compact so all four equal-width segments fit on narrow screens.
                this.segmented(0, ["1:1", "3:4", "4:3", "16:9"])
            ]
        )
    ];
});

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
        const outfitMenu = ["No clothing selected", ...clothingPresets];
        const clothingSwitches = clothingPresets.map(c => this.switch(false, `✡︎  ${c}`));

        fields.push(
            this.section(
                `❖  OUTFIT ${i + 1}`,
                "Select presets, toggle clothing switches, or enter custom style",
                [
                    this.menu(0, outfitMenu),
                    ...clothingSwitches,
                    this.textField("", "Custom outfit description", false, 60)
                ]
            )
        );
    }

    // --- ACTIONS & POSES (HYBRID: PRESETS + SWITCHES + TEXT FIELD) ---
    const actionMenu = ["No pose preset selected", ...complexActionPresets.map(a => a.label)];

    for (let i = 0; i < actionCount; i++) {
        const actionControls = [
            this.menu(0, actionMenu)
        ];

        // Add switches for modular pose building
        actionSwitchPresets.forEach(s => actionControls.push(this.switch(false, `✡︎  ${s}`)));

        // Add custom text field at the end of the section
        actionControls.push(this.textField("", "Custom action / pose modifier", false, 60));

        fields.push(
            this.section(
                `❖  ACTION / POSE ${i + 1}`,
                "Choose a preset, toggle modular details, or add custom pose text",
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

    let gender = typedGender !== "" ? typedGender : (genderIndex > 0 ? genderPresets[genderIndex - 1] : "");
    let nationality = typedNationality !== "" ? typedNationality : (nationalityIndex > 0 ? nationalityPresets[nationalityIndex - 1] : "");
    let age = agePresets[ageIndex] || "";
    let skin = typedSkin !== "" ? typedSkin : (skinToneIndex > 0 ? skinTonePresets[skinToneIndex - 1] : "");
    let bodyType = typedBodyType !== "" ? typedBodyType : (bodyTypeIndex > 0 ? bodyTypePresets[bodyTypeIndex - 1] : "");

    if (nationality) subjectParts.push(nationality);
    if (gender) subjectParts.push(gender);
    if (age) subjectParts.push(age);
    if (skin) subjectParts.push("with " + skin);

    const appearanceData = inputs[sectionIdx++];
    let appIdx = 0;

    for (let j = 0; j < makeupPresets.length; j++) {
        if (appearanceData[appIdx++]) subjectParts.push(makeupPresets[j]);
    }
    for (let j = 0; j < tattooPresets.length; j++) {
        if (appearanceData[appIdx++]) subjectParts.push(tattooPresets[j]);
    }

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
    const outfitParts = [];
    const outfitData = inputs[sectionIdx++];
    let outfitDataIdx = 0;

    const selectedOutfitIdx = outfitData[outfitDataIdx++];
    if (selectedOutfitIdx > 0) {
        outfitParts.push(clothingPresets[selectedOutfitIdx - 1]);
    }

    for (let j = 0; j < clothingPresets.length; j++) {
        if (outfitData[outfitDataIdx++] === true) {
            outfitParts.push(clothingPresets[j]);
        }
    }

    const customOutfit = outfitData[outfitDataIdx];
    if (customOutfit !== "") {
        outfitParts.push(customOutfit);
    }

    outfits.push(outfitParts.join(", "));
}

// Parse Actions Data (Hybrid: Composite Presets + Switches + Custom Text)
const actions = [];
for (let i = 0; i < actionCount; i++) {
    const actionParts = [];
    const actionData = inputs[sectionIdx++];
    let actionDataIdx = 0;

    // 1. Check Dropdown Presets
    const selectedPresetIdx = actionData[actionDataIdx++];
    if (selectedPresetIdx > 0) {
        actionParts.push(complexActionPresets[selectedPresetIdx - 1].value);
    }

    // 2. Check Modular Switches
    for (let j = 0; j < actionSwitchPresets.length; j++) {
        if (actionData[actionDataIdx++] === true) {
            actionParts.push(actionSwitchPresets[j]);
        }
    }

    // 3. Check Custom Text Field
    const customActionText = actionData[actionDataIdx];
    if (customActionText !== "") {
        actionParts.push(customActionText);
    }

    actions.push(actionParts.join(", "));
}

// Parse Prompt Template
const templateData = inputs[sectionIdx++];
const promptTemplate = templateData[0];

// Calculate Dimensions
let width = 1024, height = 1024;
if (aspectIndex === 1) { width = 768; height = 1024; }
if (aspectIndex === 2) { width = 1024; height = 768; }
if (aspectIndex === 3) { width = 1024; height = 576; }

// Build Final Prompts
const finalPrompts = [];
for (const subject of subjects) {
    for (const outfit of outfits) {
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

    canvas.clear()

    for (const prompt of finalPrompts) {
        console.log("Generating Prompt:", prompt);
        await pipeline.run({
            configuration: config,
            prompt: prompt
        });
    }
}

generateBatch();

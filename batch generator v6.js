//@api-1.0 
// =========================================
// KREA 2 MODULAR BATCH GENERATOR
// PRESETS + BODY PHYSIQUE + GENDER-AWARE TERMS
// =========================================


// =========================================
// PRESETS
// =========================================

// --- GENDER ---
const genderPresets = [
    "woman",
    "man"
];


// --- NATIONALITY / ETHNICITY ---
const nationalityPresets = [
    "Caucasian",
    "Black",
    "Anne Hathaway",
    "Dolly Parton",
    "Sabrina Carpenter",
    "Marilyn Monroe",
    "Indian",
    "Thai",
    "Japanese",
    "Korean",
    "Filipina",
    "Brazilian",
    "Italian",
    "Mexican of Incan descent with Meso-American heritage"
];


// --- AGE ---
// Adults only
const agePresets = [
    "18 years old",
    "20 years old",
    "25 years old",
    "30 years old",
    "35 years old",
    "40 years old",
    "45 years old",
    "50 years old",
    "55 years old",
    "60 years old",
    "65 years old",
    "70 years old",
    "75 years old",
    "80 years old",
    "85 years old"
];


// --- SKIN TONE ---
const skinTonePresets = [
    "fair skin",
    "pale skin",
    "tanned skin",
    "olive skin",
    "dark skin",
    "warm brown skin",
    "dark glossy skin"
];


// =========================================
// BODY / PHYSIQUE
// =========================================

// Each option has:
// label = what appears in the UI
// value = what is actually sent to Krea

const overallBuildPresets = [
    {
        label: "Slim build",
        value: "slim build"
    },
    {
        label: "Athletic build",
        value: "athletic build with a fit, naturally toned physique"
    },
    {
        label: "Average build",
        value: "average build"
    },
    {
        label: "Petite build",
        value: "petite build with a small overall frame"
    },
    {
        label: "Curvy build",
        value: "curvy build with naturally pronounced feminine curves"
    },
    {
        label: "Muscular build",
        value: "muscular build with clearly developed musculature"
    },
    {
        label: "Chubby build",
        value: "chubby build with a softer, fuller physique"
    }
];


const heightPresets = [
    {
        label: "Short",
        value: "short stature with naturally proportioned overall body proportions"
    },
    {
        label: "Average",
        value: "average height and proportions"
    },
    {
        label: "Tall",
        value: "tall stature, noticeably above-average height, long legs and naturally elongated overall proportions"
    }
];


const chestPresets = [
    {
        label: "Flat chest",
        value: "flat chest"
    },
    {
        label: "Small chest",
        value: "small chest"
    },
    {
        label: "Average chest",
        value: "average chest"
    },
    {
        label: "Full chest",
        value: "full chest"
    }
];


const hipPresets = [
    {
        label: "Narrow hips",
        value: "narrow hips"
    },
    {
        label: "Average hips",
        value: "average-width hips"
    },
    {
        label: "Wide hips",
        value: "wide hips with proportionally fuller hips and upper thighs"
    }
];


const bodyShapePresets = [
    {
        label: "No specific shape",
        value: ""
    },
    {
        label: "Hourglass",
        value: "hourglass body shape with balanced bust and hips and a clearly defined waist"
    },
    {
        label: "Pear-shaped",
        value: "pear-shaped body with narrower shoulders and upper body and proportionally wider hips and thighs"
    },
    {
        label: "Rectangle",
        value: "rectangle body shape with relatively similar shoulder, waist and hip widths"
    },
    {
        label: "Inverted triangle",
        value: "inverted-triangle body shape with broader shoulders and proportionally narrower hips"
    },
    {
        label: "Apple-shaped",
        value: "apple-shaped body with a fuller midsection and relatively slimmer legs"
    }
];


const legPresets = [
    {
        label: "Slim legs",
        value: "slim legs"
    },
    {
        label: "Average legs",
        value: "average legs"
    },
    {
        label: "Thick legs",
        value: "thick legs with fuller thighs"
    },
    {
        label: "Toned legs",
        value: "toned legs with defined but natural musculature"
    }
];


const specificBodyPresets = [
    {
        label: "No specific characteristic",
        value: ""
    },
    {
        label: "Adult with achondroplasia",
        value: "adult with achondroplasia, characteristic short stature and naturally proportioned body"
    }
];


// =========================================
// APPEARANCE
// =========================================

const makeupPresets = [
    "light makeup",
    "heavy makeup",
    "red lipstick",
    "smokey eyes",
    "heavy mascara",
    "short beard",
    "thick beard"
];


const tattooPresets = [
    "arm tattoo",
    "back tattoo",
    "sleeve tattoo",
    "red & green rose tattoos that cover both arms"
];


const hairColorPresets = [
    "blonde",
    "brunette",
    "black",
    "red",
    "auburn",
    "salt & pepper",
    "silver"
];


const hairLengthPresets = [
    "short",
    "medium length",
    "long",
    "very long"
];


const hairstylePresets = [
    // Texture
    "straight",
    "wavy",
    "curly",

    // Pulled-back and braided styles
    "ponytail",
    "messy ponytail",
    "French braid",
    "messy double buns",

    // Cut and styling details
    "with bangs",
    "short boyish hairstyle",
    "Hollywood curls",
    "Victory curls",

    // Body hair
    "light body hair",
    "thick body hair"
];


// =========================================
// CLOTHING
// =========================================

const clothingPresets = [
    // Tops
    "a loose fitting T-shirt",
    "a fitted T-shirt",
    "a tank top",
    "a crop top",
    "a blouse",
    "an unbuttoned mens dress shirt",
    "a hoodie",

    // Dresses and one-piece outfits
    "a short babydoll dress",
    "a summer dress",
    "one-piece swimsuit",

    // Bottoms
    "jeans",
    "shorts",
    "cutoff jean shorts",

    // Undergarments and lingerie
    "nude",
    "bikini-style panties",
    "thong",
    "string bikini",
    "garter belt",
    "lace bustier",
    "champagne-colored silk pajama set with shorts that show ample thigh",

    // Uniforms
    "black french maid uniform with short pleated skirt and white collar",
    "Hooters uniform (tight-fitting white t-shirt with the Hooters logo across the chest and short tight-fitting short orange shorts)",

    // Footwear and legwear
    "barefoot",
    "stiletto heels",
    "cowboy boots",
    "thigh-high stockings",
    "thigh-high leather boots"
];


// =========================================
// COMPOSITE POSES
// =========================================

const complexActionPresets = [
    {
        label: "Wall Pose (Back against wall)",
        value: "standing with {possessive} back against a wall, {possessive} arms raised high above {possessive} head and hands clasped together with one knee bent and one foot on the wall"
    },
    {
        label: "Leaning Over Edge of Bed (on elbows)",
        value: "standing at the edge of a bed, leaning forward, feet on floor, elbows on the bed, pushing {possessive} ass toward the camera"
    },
    {
        label: "Leaning Over Edge of Bed (face on mattress)",
        value: "standing at the edge of a bed, leaning forward, feet on floor, one cheek touching the bed, looking to the side at the camera, pushing {possessive} ass toward the camera"
    },
    {
        label: "Leaning Forward (Ass Up)",
        value: "on {possessive} knees, leaning forward, back arched, ass high in the air, arms stretched out in front of {objectPronoun}"
    },
    {
        label: "Squatting (from below)",
        value: "worms-eye view, squatting with {possessive} knees spread wide and on the tips of {possessive} toes, hands resting on {possessive} knees"
    },
    {
        label: "Floor Pose (Cross-legged)",
        value: "sitting cross-legged on the floor, leaning back slightly on {possessive} hands, looking directly into the camera with a relaxed smile"
    },
    {
        label: "Spread Eagle",
        value: "laying on {possessive} back with {possessive} legs raised and spread wide, feet wide apart, holding {possessive} legs in the air with {possessive} hands, looking through {possessive} open legs at the camera"
    },
    {
        label: "On Back (Legs Straight)",
        value: "laying on a bed on {possessive} back with {possessive} butt at the edge of the bed, {possessive} legs straight and elevated into the air, knees locked, bending at waist only"
    },
    {
        label: "Bending Over (Legs Straight)",
        value: "leaning forward to grab something off of a lower level of a bookshelf, legs straight, knees locked, bending at waist only, looking at the camera sideways, with {possessive} hand covering {possessive} mouth and wide-eyed open-mouthed look of surprise"
    },
    {
        label: "View in shower from below",
        value: "standing and rubbing soapy lather all over {possessive} body in the shower with a soapy loofah, water and soap cascading down {possessive} nude body, looking up at the water as it streams out of the showerhead, the camera sitting candidly below {objectPronoun} looking up"
    }
];


// =========================================
// MODULAR POSE SWITCHES
// =========================================

const actionSwitchPresets = [
    // Base position
    "standing",
    "sitting",
    "laying",
    "on a bed",
    "on {possessive} back",
    "{possessive} butt at the edge of the bed",

    // Body and leg position
    "legs straight",
    "elevated into the air",
    "knees locked",
    "bending at waist only",
    "leaning forward",
    "one knee bent",
    "one foot on the wall",
    "feet spread wide",
    "feet together",

    // Arms and hands
    "arms raised high above {possessive} head",
    "arms stretched out in front of {objectPronoun}",
    "hands clasped together",
    "elbows resting on bed",
    "hands on hips",
    "hands on breasts",
    "hands in hair",
    "hands lightly touching upper chest area",
    "hands on ass",
    "hands spreading ass cheeks",

    // Gaze and orientation
    "looking off to the side",
    "looking away from camera",
    "looking at camera",
    "looking down",
    "looking up",
    "facing camera",
    "facing away from camera",

    // Expression
    "lips parted",
    "smiling",

    // Setting
    "in the shower",
    "in a bedroom",
    "in a crowded city street",
    "in a glade"
];


// =========================================
// ART STYLE
// =========================================

const artStylePresets = [
    "photo",
    "1940s era pinup oil painting in the style of Gil Elvgren and Alberto Vargas",
    "Disney-Pixar style animation with exaggerated features and expressions: large expressive eyes, small noses",
    "bathroom mirror selfie"
];


// =========================================
// CAMERA VIEW
// =========================================

const cameraViewPresets = [
    "side-view",
    "3/4 view",
    "birds-eye view",
    "worms-eye view"
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
                    "1 Action",
                    "2 Actions",
                    "3 Actions",
                    "4 Actions",
                    "5 Actions"
                ]),

                this.segmented(0, [
                    "1:1",
                    "3:4 Portrait",
                    "4:3 Landscape",
                    "16:9"
                ])
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

    // =====================================
    // SUBJECTS
    // =====================================

    for (let i = 0; i < subjectCount; i++) {

        // ---------------------------------
        // IDENTITY
        // ---------------------------------

        const genderMenu = [
            "Choose gender",
            ...genderPresets
        ];

        const nationalityMenu = [
            "Choose nationality / ethnicity",
            ...nationalityPresets
        ];

        const skinToneMenu = [
            "Choose skin tone",
            ...skinTonePresets
        ];


        fields.push(
            this.section(
                `❖  SUBJECT ${i + 1} • Identity`,
                "Gender, ethnicity, age, and skin tone",
                [
                    this.menu(0, genderMenu),

                    this.menu(0, nationalityMenu),

                    this.menu(0, agePresets),

                    this.menu(0, skinToneMenu)
                ]
            )
        );


        // ---------------------------------
        // BODY / PHYSIQUE
        // ---------------------------------

        const overallBuildMenu = [
            "No overall build selected",
            ...overallBuildPresets.map(p => p.label)
        ];

        const heightMenu = [
            "No height selected",
            ...heightPresets.map(p => p.label)
        ];

        const chestMenu = [
            "No chest description",
            ...chestPresets.map(p => p.label)
        ];

        const hipMenu = [
            "No hip description",
            ...hipPresets.map(p => p.label)
        ];

        const bodyShapeMenu = [
            ...bodyShapePresets.map(p => p.label)
        ];

        const legMenu = [
            "No leg description",
            ...legPresets.map(p => p.label)
        ];

        const specificBodyMenu = [
            ...specificBodyPresets.map(p => p.label)
        ];


        fields.push(
            this.section(
                `❖  SUBJECT ${i + 1} • Body / Physique`,
                "Choose independent characteristics to control the subject's overall proportions and silhouette",
                [
                    this.menu(0, overallBuildMenu),

                    this.menu(0, heightMenu),

                    this.menu(0, chestMenu),

                    this.menu(0, hipMenu),

                    this.menu(0, bodyShapeMenu),

                    this.menu(0, legMenu),

                    this.menu(0, specificBodyMenu),

                    this.textField(
                        "",
                        "Custom body details",
                        false,
                        60
                    )
                ]
            )
        );


        // ---------------------------------
        // APPEARANCE
        // ---------------------------------

        const hairColorMenu = [
            "No hair color",
            ...hairColorPresets
        ];

        const hairLengthMenu = [
            "No hair length",
            ...hairLengthPresets
        ];

        const hairstyleMenu = [
            "No hairstyle",
            ...hairstylePresets
        ];


        const appearanceControls = [];


        makeupPresets.forEach(m => {
            appearanceControls.push(
                this.switch(false, `✡︎  ${m}`)
            );
        });


        tattooPresets.forEach(t => {
            appearanceControls.push(
                this.switch(false, `✡︎  ${t}`)
            );
        });


        appearanceControls.push(

            this.menu(0, hairColorMenu),

            this.textField(
                "",
                "Custom hair color",
                false,
                40
            ),

            this.menu(0, hairLengthMenu),

            this.textField(
                "",
                "Custom hair length",
                false,
                40
            ),

            this.menu(0, hairstyleMenu),

            this.textField(
                "",
                "Custom hairstyle",
                false,
                40
            ),

            this.textField(
                "",
                "Additional subject details",
                false,
                60
            )
        );


        fields.push(
            this.section(
                `❖  SUBJECT ${i + 1} • Appearance`,
                "Styling, features, and hair",
                appearanceControls
            )
        );
    }


    // =====================================
    // OUTFITS
    // =====================================

    for (let i = 0; i < outfitCount; i++) {

        const outfitMenu = [
            "No clothing selected",
            ...clothingPresets
        ];

        const clothingSwitches = clothingPresets.map(
            c => this.switch(false, `✡︎  ${c}`)
        );


        fields.push(
            this.section(
                `❖  OUTFIT ${i + 1}`,
                "Select presets, toggle clothing switches, or enter custom style",
                [
                    this.menu(0, outfitMenu),

                    ...clothingSwitches,

                    this.textField(
                        "",
                        "Custom outfit description",
                        false,
                        60
                    )
                ]
            )
        );
    }


    // =====================================
    // ACTIONS / POSES
    // =====================================

    const actionMenu = [
        "No pose preset selected",
        ...complexActionPresets.map(a => a.label)
    ];


    for (let i = 0; i < actionCount; i++) {

        const actionControls = [
            this.menu(0, actionMenu)
        ];


        actionSwitchPresets.forEach(s => {
            actionControls.push(
                this.switch(false, `✡︎  ${s}`)
            );
        });


        actionControls.push(
            this.textField(
                "",
                "Custom action / pose modifier",
                false,
                60
            )
        );


        fields.push(
            this.section(
                `❖  ACTION / POSE ${i + 1}`,
                "Choose a preset, toggle modular details, or add custom pose text",
                actionControls
            )
        );
    }


    // =====================================
    // PROMPT OPTIONS / TEMPLATE
    // =====================================

    const promptControls = [

        this.menu(0, artStylePresets),

        ...cameraViewPresets.map(
            view => this.switch(false, view)
        ),

        this.textField(
            "A {cameraView}{artStyle} of {subject} wearing {clothing}, {action}, Natural anatomy",
            "Prompt Template — tags: {artStyle}, {subject}, {clothing}, {action}, {cameraView}, {subjectPronoun}, {objectPronoun}, {possessive}, {reflexive}, {personNoun}.",
            false,
            80
        )
    ];


    fields.push(
        this.section(
            "❖  Prompt Options & Template",
            "Choose an art style and camera view, then customize the template with tags",
            promptControls
        )
    );


    return fields;
});


// =========================================
// STEP 3 — PARSE INPUTS
// =========================================

let sectionIdx = 0;

const subjects = [];
const subjectGenderForms = [];


// =========================================
// GENDER SYSTEM
// =========================================

function getGenderForm(gender) {

    if (/\b(man|male)\b/i.test(gender)) {
        return "masculine";
    }

    if (/\b(woman|female)\b/i.test(gender)) {
        return "feminine";
    }

    return "neutral";
}


function matchCase(source, replacement) {

    if (!source || !replacement) {
        return replacement;
    }

    if (source === source.toUpperCase()) {
        return replacement.toUpperCase();
    }

    if (source[0] === source[0].toUpperCase()) {
        return replacement[0].toUpperCase() + replacement.slice(1);
    }

    return replacement;
}


function replaceToken(text, token, replacement) {

    return text.replace(
        new RegExp(`\\{${token}\\}`, "gi"),
        replacement
    );
}


// -----------------------------------------
// Gender-aware token replacement
//
// IMPORTANT:
// This system does NOT remove pronouns.
// It deliberately replaces the tokens with
// the correct masculine/feminine forms.
// -----------------------------------------

function applyGenderTerms(prompt, genderForm) {

    const genderTerms = {

        masculine: {
            subject: "he",
            object: "him",
            possessive: "his",
            reflexive: "himself",
            noun: "man"
        },

        feminine: {
            subject: "she",
            object: "her",
            possessive: "her",
            reflexive: "herself",
            noun: "woman"
        },

        neutral: {
            subject: "they",
            object: "them",
            possessive: "their",
            reflexive: "themselves",
            noun: "person"
        }
    };


    const forms = genderTerms[genderForm] || genderTerms.neutral;

    let result = prompt;


    // -------------------------------------
    // Replace explicit gender tokens first
    // -------------------------------------

    result = replaceToken(
        result,
        "subjectPronoun",
        forms.subject
    );

    result = replaceToken(
        result,
        "objectPronoun",
        forms.object
    );

    result = replaceToken(
        result,
        "possessive",
        forms.possessive
    );

    result = replaceToken(
        result,
        "reflexive",
        forms.reflexive
    );

    result = replaceToken(
        result,
        "personNoun",
        forms.noun
    );


    // -------------------------------------
    // Legacy / manually entered gender
    // language
    //
    // These are intentionally handled rather
    // than simply stripping pronouns.
    // -------------------------------------

    const replacements = [

        ["himself", forms.reflexive],
        ["herself", forms.reflexive],

        ["he", forms.subject],
        ["she", forms.subject],

        ["him", forms.object],

        ["his", forms.possessive],

        ["woman", forms.noun],
        ["female", genderForm === "feminine" ? "female" : forms.noun],

        ["man", forms.noun],
        ["male", genderForm === "masculine" ? "male" : forms.noun],

        ["girl", genderForm === "feminine" ? "girl" : forms.noun],
        ["boy", genderForm === "masculine" ? "boy" : forms.noun]
    ];


    for (const [source, replacement] of replacements) {

        result = result.replace(
            new RegExp(`\\b${source}\\b`, "gi"),
            match => matchCase(match, replacement)
        );
    }


    // -------------------------------------
    // Handle "her" carefully.
    //
    // Her can be either:
    //   - object: looking at her
    //   - possessive: her hair
    // -------------------------------------

    result = result.replace(
        /\bher\b/gi,
        (match, offset, fullText) => {

            const after = fullText.slice(
                offset + match.length
            );

            const isPossessive =
                /^\s+(body|back|legs|feet|hands|arms|hair|face|mouth|eyes|head|breasts|ass|butt|knees|fingers|shoulders|toes|thighs|hips|chest|waist|skin)\b/i
                    .test(after);

            return matchCase(
                match,
                isPossessive
                    ? forms.possessive
                    : forms.object
            );
        }
    );


    return result;
}


// =========================================
// PARSE SUBJECT DATA
// =========================================

for (let i = 0; i < subjectCount; i++) {

    const subjectParts = [];


    // -------------------------------------
    // Identity section
    // -------------------------------------

    const identityData = inputs[sectionIdx++];


    const genderIndex = identityData[0];

    const nationalityIndex = identityData[1];

    const ageIndex = identityData[2];

    const skinToneIndex = identityData[3];


    const gender =
        genderIndex > 0
            ? genderPresets[genderIndex - 1]
            : "";


    const nationality =
        nationalityIndex > 0
            ? nationalityPresets[nationalityIndex - 1]
            : "";


    const age =
        agePresets[ageIndex] || "";


    const skin =
        skinToneIndex > 0
            ? skinTonePresets[skinToneIndex - 1]
            : "";


    const genderForm = getGenderForm(gender);


    if (nationality) {
        subjectParts.push(nationality);
    }


    if (gender) {
        subjectParts.push(gender);
    }


    if (age) {
        subjectParts.push(age);
    }


    if (skin) {
        subjectParts.push("with " + skin);
    }


    // -------------------------------------
    // Body / Physique section
    // -------------------------------------

    const bodyData = inputs[sectionIdx++];

    let bodyIdx = 0;


    const overallBuildIndex = bodyData[bodyIdx++];

    const heightIndex = bodyData[bodyIdx++];

    const chestIndex = bodyData[bodyIdx++];

    const hipIndex = bodyData[bodyIdx++];

    const bodyShapeIndex = bodyData[bodyIdx++];

    const legIndex = bodyData[bodyIdx++];

    const specificBodyIndex = bodyData[bodyIdx++];

    const customBodyDetails = bodyData[bodyIdx++];


    if (overallBuildIndex > 0) {

        subjectParts.push(
            overallBuildPresets[
                overallBuildIndex - 1
            ].value
        );
    }


    if (heightIndex > 0) {

        subjectParts.push(
            heightPresets[
                heightIndex - 1
            ].value
        );
    }


    if (chestIndex > 0) {

        subjectParts.push(
            chestPresets[
                chestIndex - 1
            ].value
        );
    }


    if (hipIndex > 0) {

        subjectParts.push(
            hipPresets[
                hipIndex - 1
            ].value
        );
    }


    if (bodyShapeIndex >= 0) {

        const bodyShape =
            bodyShapePresets[bodyShapeIndex];

        if (bodyShape && bodyShape.value) {
            subjectParts.push(bodyShape.value);
        }
    }


    if (legIndex > 0) {

        subjectParts.push(
            legPresets[
                legIndex - 1
            ].value
        );
    }


    if (specificBodyIndex >= 0) {

        const specificBody =
            specificBodyPresets[specificBodyIndex];

        if (specificBody && specificBody.value) {
            subjectParts.push(specificBody.value);
        }
    }


    if (customBodyDetails) {
        subjectParts.push(customBodyDetails);
    }


    // -------------------------------------
    // Appearance section
    // -------------------------------------

    const appearanceData = inputs[sectionIdx++];

    let appIdx = 0;


    // Makeup
    for (let j = 0; j < makeupPresets.length; j++) {

        if (appearanceData[appIdx++]) {
            subjectParts.push(
                makeupPresets[j]
            );
        }
    }


    // Tattoos
    for (let j = 0; j < tattooPresets.length; j++) {

        if (appearanceData[appIdx++]) {
            subjectParts.push(
                tattooPresets[j]
            );
        }
    }


    // Hair color
    const hairColorIdx = appearanceData[appIdx++];

    const typedHairColor = appearanceData[appIdx++];


    const hairColor =
        typedHairColor !== ""
            ? typedHairColor
            : (
                hairColorIdx > 0
                    ? hairColorPresets[
                        hairColorIdx - 1
                    ]
                    : ""
            );


    if (hairColor) {
        subjectParts.push(
            hairColor + " hair"
        );
    }


    // Hair length
    const hairLengthIdx = appearanceData[appIdx++];

    const typedHairLength = appearanceData[appIdx++];


    const hairLength =
        typedHairLength !== ""
            ? typedHairLength
            : (
                hairLengthIdx > 0
                    ? hairLengthPresets[
                        hairLengthIdx - 1
                    ]
                    : ""
            );


    if (hairLength) {
        subjectParts.push(hairLength);
    }


    // Hairstyle
    const hairstyleIdx = appearanceData[appIdx++];

    const typedHairstyle = appearanceData[appIdx++];


    const hairstyle =
        typedHairstyle !== ""
            ? typedHairstyle
            : (
                hairstyleIdx > 0
                    ? hairstylePresets[
                        hairstyleIdx - 1
                    ]
                    : ""
            );


    if (hairstyle) {
        subjectParts.push(hairstyle);
    }


    // Additional details
    const additionalDetails =
        appearanceData[appIdx++];


    if (additionalDetails) {
        subjectParts.push(
            additionalDetails
        );
    }


    subjects.push(
        subjectParts.join(", ")
    );


    subjectGenderForms.push(
        genderForm
    );
}


// =========================================
// PARSE OUTFITS
// =========================================

const outfits = [];


for (let i = 0; i < outfitCount; i++) {

    const outfitParts = [];

    const outfitData =
        inputs[sectionIdx++];

    let outfitDataIdx = 0;


    // Dropdown
    const selectedOutfitIdx =
        outfitData[outfitDataIdx++];


    if (selectedOutfitIdx > 0) {

        outfitParts.push(
            clothingPresets[
                selectedOutfitIdx - 1
            ]
        );
    }


    // Clothing switches
    for (let j = 0; j < clothingPresets.length; j++) {

        if (
            outfitData[outfitDataIdx++] === true
        ) {

            outfitParts.push(
                clothingPresets[j]
            );
        }
    }


    // Custom outfit
    const customOutfit =
        outfitData[outfitDataIdx];


    if (customOutfit !== "") {

        outfitParts.push(
            customOutfit
        );
    }


    outfits.push(
        outfitParts.join(", ")
    );
}


// =========================================
// PARSE ACTIONS
// =========================================

const actions = [];


for (let i = 0; i < actionCount; i++) {

    const actionParts = [];

    const actionData =
        inputs[sectionIdx++];

    let actionDataIdx = 0;


    // Composite preset
    const selectedPresetIdx =
        actionData[actionDataIdx++];


    if (selectedPresetIdx > 0) {

        actionParts.push(
            complexActionPresets[
                selectedPresetIdx - 1
            ].value
        );
    }


    // Modular switches
    for (let j = 0; j < actionSwitchPresets.length; j++) {

        if (
            actionData[actionDataIdx++] === true
        ) {

            actionParts.push(
                actionSwitchPresets[j]
            );
        }
    }


    // Custom action
    const customActionText =
        actionData[actionDataIdx];


    if (customActionText !== "") {

        actionParts.push(
            customActionText
        );
    }


    actions.push(
        actionParts.join(", ")
    );
}


// =========================================
// PARSE PROMPT TEMPLATE
// =========================================

const templateData =
    inputs[sectionIdx++];


const artStyle =
    artStylePresets[
        templateData[0]
    ];


const selectedCameraViews =
    cameraViewPresets.filter(
        (_, index) =>
            templateData[index + 1]
    );


const cameraView =
    selectedCameraViews.length
        ? `${selectedCameraViews.join(", ")} `
        : "";


const promptTemplate =
    templateData[
        cameraViewPresets.length + 1
    ];


// =========================================
// CALCULATE DIMENSIONS
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


if (aspectIndex === 3) {
    width = 1024;
    height = 576;
}


// =========================================
// BUILD FINAL PROMPTS
// =========================================

const finalPrompts = [];


for (
    let subjectIndex = 0;
    subjectIndex < subjects.length;
    subjectIndex++
) {

    const subject =
        subjects[subjectIndex];

    const genderForm =
        subjectGenderForms[
            subjectIndex
        ];


    for (const outfit of outfits) {

        for (const action of actions) {

            let constructedPrompt =
                promptTemplate

                    // General template tags
                    .replace(
                        /{artStyle}/gi,
                        artStyle
                    )

                    .replace(
                        /{cameraView}/gi,
                        cameraView
                    )

                    .replace(
                        /{subject}/gi,
                        subject
                    )

                    .replace(
                        /{subjects}/gi,
                        subject
                    )

                    .replace(
                        /{clothing}/gi,
                        outfit
                    )

                    .replace(
                        /{action}/gi,
                        action
                    )

                    // Clean up accidental empty
                    // punctuation / spacing
                    .replace(
                        /,\s*,/g,
                        ","
                    )

                    .replace(
                        /\s{2,}/g,
                        " "
                    )

                    .trim();


            // ---------------------------------
            // Apply gender terms AFTER all
            // prompt components have been
            // assembled.
            //
            // This is intentional.
            // Pronouns are replaced, not removed.
            // ---------------------------------

            constructedPrompt =
                applyGenderTerms(
                    constructedPrompt,
                    genderForm
                );


            finalPrompts.push(
                constructedPrompt
            );
        }
    }
}


// =========================================
// STEP 4 — GENERATION LOGIC
// =========================================

async function generateBatch() {

    let config =
        JSON.parse(
            JSON.stringify(
                pipeline.configuration
            )
        );


    config.model =
        "krea_2_turbo_i8x.ckpt";


    config.width =
        width;


    config.height =
        height;


    config.batchCount =
        1;


    config.batchSize =
        1;


    config.seed =
        -1;


    canvas.clear();


    for (const prompt of finalPrompts) {

        console.log(
            "Generating Prompt:",
            prompt
        );


        await pipeline.run({

            configuration:
                config,

            prompt:
                prompt
        });
    }
}


generateBatch();

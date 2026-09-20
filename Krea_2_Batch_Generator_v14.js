//@api-1.0
// version 14
// =========================================
// KREA 2 MODULAR BATCH GENERATOR
// Version 14 — Randomization Mode + efficiency/UI cleanup
// =========================================

// =========================================
// CONSTANTS
// =========================================

const NONE_SELECTED = 0;

// How many constructed prompts to show verbatim on the review screen.
const PREVIEW_SAMPLE_SIZE = 8;

const ASPECT_OPTIONS = [
    { label: "1:1", width: 1024, height: 1024 },
    { label: "3:4 Portrait", width: 768, height: 1024 },
    { label: "4:3 Landscape", width: 1024, height: 768 },
    { label: "16:9", width: 1024, height: 576 }
];

const ASPECT_DIMENSIONS = ASPECT_OPTIONS.map(({ width, height }) => [width, height]);

// =========================================
// RANDOM HELPERS
// =========================================

function randomInt(maxExclusive) {
    return Math.floor(Math.random() * maxExclusive);
}

function randomElement(array) {
    return array.length > 0 ? array[randomInt(array.length)] : undefined;
}

// Returns the value of a random preset, skipping presets whose value is
// an empty string (e.g. "No specific shape" sentinels).
function randomPresetValue(presets) {
    const candidates = presets.filter(p => {
        const value = getPresetValue(p);
        return value !== undefined && value !== null && value !== "";
    });
    return candidates.length > 0 ? getPresetValue(randomElement(candidates)) : "";
}

// Picks `count` random switch values from a preset list (no duplicates).
function randomSwitchValues(presets, count) {
    const limit = Math.min(Math.max(0, count), presets.length);
    if (limit === 0) return [];

    // Partial Fisher-Yates: only shuffle the portion we actually need.
    // This avoids allocating a second array of every index on each random pick.
    const indices = Array.from({ length: presets.length }, (_, i) => i);
    for (let i = 0; i < limit; i++) {
        const j = i + randomInt(indices.length - i);
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices.slice(0, limit).map(i => getPresetValue(presets[i]));
}

const DEFAULT_PROMPT_FALLBACKS = {
    subject: "a woman",
    outfit: "t-shirt and jeans",
    action: "smiling",
    // No default camera perspective — when none is selected, the prompt
    // simply omits any perspective clause instead of forcing eye-level.
    camera: "candid",
    timeOfDay: "natural daytime illumination",
    lighting: "soft directional light, balanced exposure, and ambient fill",
    artStyle: "photo",
    genericPrompt: "a portrait of the subject"
};

// Models offered on the setup screen. Selecting both generates one image
// per model for every constructed prompt.
// NOTE: "file" must exactly match the model's filename in Draw Things.
// "loras" lists the LoRAs attached for that model, each with its file
// (exact Draw Things filename) and strength ("weight").
const MODEL_OPTIONS = [
    {
        label: "Flux.2 Klein",
        file: "flux_2_klein_9b_i8x.ckpt",
        loras: [
            { file: "klein_snofs_v1_4_fixed_lora_lora_f16.ckpt", weight: 1.4 }
        ]
    },
    {
        label: "Krea 2",
        file: "krea_2_turbo_i8x.ckpt",
        loras: [
            { file: "pornmaster_uncensored_krea2_v1_lora_f16.ckpt", weight: 1.0 },
            { file: "mysticxxx_krea2_v3_lora_f16.ckpt", weight: 0.6 }
        ]
    }
];

// ---- PROMPT ENHANCER ----
// Local language model used to refine each constructed prompt before
// generation (same "Image Interpreter" mechanism as the standalone
// Prompt Enhancer script). Must be downloaded in Draw Things.
const ENHANCER_MODEL = "qwen_3.5_4b_i8x.ckpt";

// Instruction given to the language model. It must preserve every
// concrete choice made by the batch generator and only improve wording.
const KREA2_REFINEMENT_TEMPLATE = `You are a Krea 2 image-generation prompt refinement specialist.

Your job is to refine an already-constructed prompt for Krea 2.

PRESERVE EXACTLY:
- subject identity and gender
- age
- ethnicity
- body physique
- hair characteristics
- clothing
- action
- pose
- environment
- camera position
- camera angle
- requested composition
- lighting direction/style
- any explicitly specified objects
- any explicitly specified relationships between objects

DO NOT:
- change the subject
- change gender
- change age
- add clothing
- remove clothing
- change the action
- change the pose
- invent additional people
- replace selected preset choices
- contradict camera instructions
- introduce a different artistic style unless explicitly requested

REFINE:
- natural language flow
- visual specificity
- spatial relationships
- anatomical coherence
- scene coherence
- camera/composition clarity
- lighting consistency
- material and environmental detail
- reduction of redundant wording
- removal of contradictory descriptions

Prioritize the user's original prompt over your own assumptions.

Return ONLY the final Krea 2 prompt.
No explanation.
No headings.
No markdown.`;

// =========================================
// PRESETS
// =========================================

// --- GENDER ---
const genderPresets = ["woman", "man"];

// --- NATIONALITY / ETHNICITY ---
// "value" is the full hard-coded description used in manual mode.
// "short" is the lightweight descriptor used in Randomization Mode, where
// "profile" points at a weighted trait table (see TRAIT_PROFILES) that
// picks skin tone, hair color/type, and eye color by real-world likelihood
// for that nationality instead of the hard-coded combination.
const nationalityPresets = [
    { label: "Caucasian", short: "Caucasian", profile: "westEuropean", value: "Caucasian with Western European facial features" },
    { label: "Black", short: "Black", profile: "african", value: "Black with rich deep skin tone and classic African facial features" },
    { label: "Mixed-Race", short: "Mixed-race", profile: "mixed", value: "Mixed-race with a natural blend of African and European facial features, deep golden-bronze skin, softly flared nostrils, a straight natural nose bridge, high defined cheekbones, thick naturally arched eyebrows, dark brown eyes, thick dark brown hair with thick wavy curls, a curvy hourglass figure, and a round ass" },
    { label: "Mexican", short: "Mexican", profile: "latina", value: "Mexican with prominent Indigenous Mesoamerican facial features, warm olive-tan skin, dark brown eyes, thick dark eyebrows, thick dark wavy hair, plump lips, and a curvy hourglass figure" },
    { label: "Indian", short: "Indian", profile: "southAsian", value: "Indian with warm brown skin, dark eyes, and South Asian facial features" },
    { label: "Thai", short: "Thai", profile: "southeastAsian", value: "Thai with golden-tan skin and Southeast Asian facial features" },
    { label: "Japanese", short: "Japanese", profile: "eastAsian", value: "Japanese with fair skin and East Asian facial features" },
    { label: "Korean", short: "Korean", profile: "eastAsian", value: "Korean with fair porcelain skin and East Asian facial features" },
    { label: "Filipina", short: "Filipina", profile: "southeastAsian", value: "Filipina with warm tan skin and Southeast Asian facial features" },
    { label: "Brazilian", short: "Brazilian", profile: "brazilian", value: "Brazilian with sun-kissed olive skin and a blend of European, African, and Indigenous features" },
    { label: "Italian", short: "Italian", profile: "mediterranean", value: "Italian with olive skin and Mediterranean facial features" },
    { label: "Scandinavian", short: "Scandinavian", profile: "nordic", value: "Scandinavian with fair skin, light hair, and Nordic facial features" },
    { label: "Russian/Eastern European", short: "Russian", profile: "slavic", value: "Russian/Eastern European with fair skin and Slavic facial features" },
    { label: "Chinese", short: "Chinese", profile: "eastAsian", value: "Chinese with fair skin and East Asian facial features" },
    { label: "Vietnamese", short: "Vietnamese", profile: "southeastAsian", value: "Vietnamese with warm tan skin and Southeast Asian facial features" },
    { label: "Middle Eastern", short: "Middle Eastern", profile: "middleEastern", value: "Middle Eastern with olive skin, dark hair, and Middle Eastern facial features" },
    { label: "French", short: "French", profile: "westEuropean", value: "French with fair skin and classic Western European features" },
    { label: "German", short: "German", profile: "westEuropean", value: "German with fair skin and Central European facial features" },
    { label: "Irish", short: "Irish", profile: "celtic", value: "Irish with fair skin, freckles, and Celtic facial features" },
    { label: "Native American", short: "Native American", profile: "nativeAmerican", value: "Native American with warm bronze skin and Indigenous American facial features" },
    { label: "Polynesian/Pacific Islander", short: "Polynesian", profile: "polynesian", value: "Polynesian/Pacific Islander with warm brown skin and Polynesian facial features" },
    { label: "Ethiopian/East African", short: "Ethiopian", profile: "eastAfrican", value: "Ethiopian/East African with deep brown skin and East African facial features" }
];

const celebrityPresets = [
    { label: "My Baby", value: "curvy apple-shaped 35-year-old woman with large shapeless drooping breasts, a round ass, long curly 3a black hair, arms covered in red & green rose tattoos, hazel eyes" },
    { label: "Anne Hathaway", value: "Anne Hathaway with a tall slim build with smokey eyes and heavy mascara" },
    { label: "Dolly Parton", value: "young 1970s era Dolly Parton with blown-out blonde hair and bangs" },
    { label: "Sabrina Carpenter", value: "Sabrina Carpenter with shoulder length blonde hair" },
    { label: "Marilyn Monroe", value: "Marilyn Monroe with shoulder length blonde Hollywood curls" },
    { label: "Lisbeth Salander", value: "small petite woman with porcelain skin, a flat chest, narrow hips/shoulders, a short black spiked punk hairstyle shaved on one side, neck tattoos, back tattoos, light body hair, arm and leg tattoos, stacked bracelets, heavy mascara, smokey eyes, eyebrow/lip/septum/nipple/navel piercings, multiple earrings, multiple rings" },
    { label: "Curvy Black Woman with Box Braids", value: "a curvy black woman with warm brown skin, long black box braids, neck/back/arm tattoos, heavy mascara, smokey eyes, light body hair, hoop earrings, long fingernails, nose/navel/nipple piercings" },
    { label: "Curvy Mexican woman", value: "a curvy Mexican woman with prominent Indigenous Mesoamerican features, olive skin, plump lips, medium-length straight black hair, smokey eyes, heavy mascara, arm/back/neck tattoos, light body hair, hoop earrings, multiple rings, nose/navel/nipple piercings" },
    { label: "Mixed race", value: "mixed race with Afro European features, a deep golden-bronze complexion, softly flared nostrils, and a straight natural nose bridge, thick dark brown hair with thick wavy curls, and a round ass." },
    { label: "Petite Korean", value: "small petite Korean woman with short stature, and short straight black hair" },
    { label: "Slim Blonde with Pixie Cut", value: "a slim-build woman with porcelain skin, short blonde hair in a textured pixie cut style" },
    { label: "Oversized head/eyes, small nose", value: "with an unnaturally large head with large eyes and a tiny button nose" },
    { label: "Michelle Obama", value: "Michelle Obama" },
    { label: "Betty Boop", value: "Betty Boop" }
];

// --- AGE ---
const agePresets = [
    "18 years old", "20 years old", "25 years old", "30 years old", "35 years old",
    "40 years old", "45 years old", "50 years old", "55 years old", "60 years old",
    "65 years old", "70 years old", "75 years old", "80 years old", "85 years old"
];

// --- OVERALL BUILD ---
const overallBuildPresets = [
    "petite build",
    "small build",
    "slim build",
    "slender build",
    "lean build",
    "athletic build",
    "toned athletic build",
    "fit build",
    "average build",
    "medium build",
    "soft build",
    "curvy build",
    "voluptuous build",
    "full-figured build",
    "plus-size build",
    "heavy build",
    "stocky build",
    "large build",
    "very large build",
    "obese build"
];

// --- HEIGHT ---
const heightPresets = [
    "very short stature",
    "short stature",
    "below-average height",
    "average height",
    "above-average height",
    "tall stature",
    "very tall stature"
];

// --- SHOULDERS ---
const shoulderPresets = [
    "very narrow shoulders",
    "narrow shoulders",
    "slightly narrow shoulders",
    "average-width shoulders",
    "slightly broad shoulders",
    "broad shoulders",
    "very broad shoulders"
];

// --- WAIST ---
const waistPresets = [
    "very narrow waist",
    "narrow waist",
    "slightly narrow waist",
    "average waist",
    "slightly wide waist",
    "wide waist",
    "very wide waist"
];

// --- HIPS ---
const hipPresets = [
    "very narrow hips",
    "narrow hips",
    "slightly narrow hips",
    "average-width hips",
    "slightly wide hips",
    "wide hips",
    "very wide hips"
];

// --- BREASTS ---
const breastPresets = [
    "flat chest",
    "small breasts",
    "small perky breasts",
    "medium breasts",
    "medium perky breasts",
    "large breasts",
    "large perky breasts",
    "very large breasts",
    "very large perky breasts"
];

// --- ASS ---
const assPresets = [
    "flat ass",
    "small ass",
    "small round ass",
    "medium ass",
    "medium round ass",
    "large ass",
    "large round ass",
    "very large ass",
    "very large round ass"
];

// --- LEGS ---
const legPresets = [
    "very thin legs",
    "thin legs",
    "slim legs",
    "average legs",
    "toned legs",
    "muscular legs",
    "thick legs",
    "very thick legs"
];

// --- ARMS ---
const armPresets = [
    "very thin arms",
    "thin arms",
    "slim arms",
    "average arms",
    "toned arms",
    "muscular arms",
    "thick arms",
    "very thick arms"
];

// --- SKIN ---
const skinPresets = [
    "porcelain skin",
    "very fair skin",
    "fair skin",
    "light skin",
    "light olive skin",
    "olive skin",
    "warm olive skin",
    "tan skin",
    "golden-tan skin",
    "warm tan skin",
    "bronze skin",
    "warm bronze skin",
    "brown skin",
    "warm brown skin",
    "deep brown skin",
    "dark brown skin",
    "deep dark skin"
];

// --- EYES ---
const eyeColorPresets = [
    "light blue eyes",
    "blue eyes",
    "gray-blue eyes",
    "gray eyes",
    "green eyes",
    "hazel eyes",
    "light brown eyes",
    "brown eyes",
    "dark brown eyes",
    "deep brown eyes",
    "amber eyes"
];

// --- HAIR COLOR ---
const hairColorPresets = [
    "platinum blonde hair",
    "ash blonde hair",
    "golden blonde hair",
    "dark blonde hair",
    "light brown hair",
    "medium brown hair",
    "dark brown hair",
    "auburn hair",
    "red hair",
    "dark red hair",
    "black hair",
    "blue-black hair",
    "silver hair",
    "gray hair",
    "white hair"
];

// --- HAIR LENGTH ---
const hairLengthPresets = [
    "very short hair",
    "short hair",
    "chin-length hair",
    "shoulder-length hair",
    "medium-length hair",
    "long hair",
    "very long hair",
    "waist-length hair"
];

// --- HAIR TEXTURE ---
const hairTexturePresets = [
    "straight hair",
    "slightly wavy hair",
    "wavy hair",
    "thick wavy hair",
    "curly hair",
    "thick curly hair",
    "coily hair",
    "thick coily hair"
];

// --- HAIRSTYLE GROUPS ---
// Each group contains related hairstyle presets. Randomization mode chooses
// among groups, then chooses a specific style from the selected group.
const hairstyleGroups = [
    {
        label: "Straight",
        presets: [
            "straight hair worn loose",
            "straight hair with a center part",
            "straight hair with a side part",
            "sleek straight hair",
            "straight hair tucked behind the ears",
            "straight hair with curtain bangs",
            "straight hair with blunt bangs"
        ]
    },
    {
        label: "Wavy",
        presets: [
            "loose beach waves",
            "soft natural waves",
            "thick wavy hair worn loose",
            "wavy hair with a center part",
            "wavy hair with a side part",
            "long tousled waves",
            "voluminous wavy hair"
        ]
    },
    {
        label: "Curly",
        presets: [
            "loose natural curls",
            "defined curls",
            "thick curly hair worn loose",
            "curly hair with a center part",
            "curly hair with a side part",
            "voluminous curly hair",
            "long cascading curls"
        ]
    },
    {
        label: "Coily",
        presets: [
            "natural coily hair",
            "thick natural coils",
            "dense coily hair",
            "short natural coils",
            "long natural coils",
            "coily hair worn loose",
            "voluminous coily hair"
        ]
    },
    {
        label: "Braids",
        presets: [
            "long box braids",
            "medium-length box braids",
            "knotless box braids",
            "long micro braids",
            "cornrows",
            "feed-in braids",
            "French braids",
            "Dutch braids",
            "two long braids",
            "multiple braids"
        ]
    },
    {
        label: "Ponytails",
        presets: [
            "high ponytail",
            "low ponytail",
            "long sleek ponytail",
            "high voluminous ponytail",
            "messy ponytail",
            "side ponytail"
        ]
    },
    {
        label: "Buns",
        presets: [
            "high bun",
            "low bun",
            "messy bun",
            "sleek bun",
            "double buns",
            "top knot"
        ]
    },
    {
        label: "Short",
        presets: [
            "short pixie cut",
            "textured pixie cut",
            "short bob",
            "chin-length bob",
            "blunt bob",
            "short layered haircut",
            "short spiky haircut",
            "undercut hairstyle"
        ]
    },
    {
        label: "Bang Styles",
        presets: [
            "curtain bangs",
            "blunt bangs",
            "wispy bangs",
            "side-swept bangs",
            "micro bangs",
            "long side bangs"
        ]
    },
    {
        label: "Updos",
        presets: [
            "elegant updo",
            "messy updo",
            "braided updo",
            "French twist",
            "chignon",
            "half-up half-down hairstyle"
        ]
    }
];

const ALL_HAIRSTYLE_PRESETS = hairstyleGroups.flatMap(group => group.presets);

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
            { label: "soft feathered 70s blowout", value: "soft feathered 1970s blowout hairstyle with airy volume, gentle waves, and naturally lifted layers" },
            { label: "big 80s hair", value: "large, heavily teased 1980s hairstyle with extreme volume and lots of hairspray" },
            { label: "retro victory rolls", value: "1940s-inspired Victory Roll hairstyle with large rolled sections framing the face" },
            { label: "beehive", value: "classic 1960s beehive hairstyle with dramatic height and volume" },
            { label: "big curly afro", value: "large rounded natural curly afro with substantial volume" }
        ]
    },
    {
        title: "Short and edgy styles",
        description: "Short cuts and unconventional hairstyles",
        presets: [
            "Faux Hawk", "spiked punk hairstyle", "short pixie cut", "textured pixie cut",
            "shaved sides", "undercut", "short bob", "blunt bob", "asymmetrical bob"
        ]
    },
    {
        title: "Long and flowing styles",
        description: "Long hair worn loose or with flowing movement",
        presets: [
            "long flowing hair", "long straight hair", "long wavy hair", "long curly hair",
            "very long hair flowing down the back", "waist-length hair", "floor-length hair"
        ]
    }
];

const accessoryGroups = [
    {
        title: "Jewelry",
        description: "Necklaces, earrings, bracelets, and rings",
        presets: [
            "hoop earrings", "stud earrings", "large earrings", "multiple earrings",
            "necklace", "choker", "pearl necklace", "stacked bracelets", "bracelets",
            "multiple rings", "large statement ring", "anklet"
        ]
    },
    {
        title: "Eyewear",
        description: "Glasses and sunglasses",
        presets: [
            "reading glasses", "round glasses", "cat-eye glasses", "aviator sunglasses",
            "round sunglasses", "oversized sunglasses", "dark sunglasses"
        ]
    },
    {
        title: "Body Piercings",
        description: "Visible facial and body piercings",
        presets: [
            "nose piercing", "septum piercing", "eyebrow piercing", "lip piercing",
            "navel piercing", "nipple piercings", "multiple ear piercings"
        ]
    },
    {
        title: "Headwear",
        description: "Hats and head coverings",
        presets: [
            "baseball cap", "cowboy hat", "beanie", "fedora", "wide-brimmed hat",
            "sun hat", "beret", "bucket hat"
        ]
    },
    {
        title: "Hair Accessories",
        description: "Decorative accessories worn in the hair",
        presets: [
            "hair clips", "decorative hair pins", "headband", "hair ribbons",
            "scrunchie", "flower tucked into the hair"
        ]
    }
];

// =========================================
// CLOTHING
// =========================================

const clothingColorPresets = [
    "black", "white", "red", "blue", "navy blue", "light blue", "green",
    "olive green", "yellow", "orange", "pink", "purple", "lavender",
    "brown", "beige", "cream", "gray", "silver", "gold", "multicolored"
];

const clothingGroups = [
    {
        title: "Tops",
        description: "Shirts, tops, sweaters, jackets, and other upper-body clothing",
        hasColorMenu: true,
        presets: [
            "t-shirt",
            "fitted t-shirt",
            "oversized t-shirt",
            "tank top",
            "crop-top t-shirt showing significant underboob",
            "halter top",
            "tube top",
            "bandeau top",
            "blouse",
            "button-down shirt",
            "dress shirt",
            "off-shoulder top",
            "long-sleeve shirt",
            "turtleneck",
            "sweater",
            "hoodie",
            "cardigan",
            "denim jacket",
            "leather jacket",
            "bomber jacket",
            "blazer",
            "business suit jacket",
            "sports jersey",
            "football jersey",
            "basketball jersey",
            "baseball jersey"
        ]
    },
    {
        title: "Bottoms",
        description: "Pants, shorts, skirts, and other lower-body clothing",
        hasColorMenu: true,
        presets: [
            "jeans",
            "skinny jeans",
            "bootcut jeans",
            "high-waisted jeans",
            "low-rise jeans",
            "cargo pants",
            "dress pants",
            "slacks",
            "khaki pants",
            "leggings",
            "spandex leggings",
            "yoga pants",
            "shorts",
            "denim shorts",
            "short athletic shorts",
            "cargo shorts",
            "mini-skirt",
            "pleated mini-skirt",
            "pencil skirt",
            "midi skirt",
            "maxi skirt",
            "wrap-around skirt"
        ]
    },
    {
        title: "Dresses",
        description: "Casual, formal, and costume-style dresses",
        hasColorMenu: true,
        presets: [
            "summer dress",
            "sundress",
            "cocktail dress",
            "little black dress",
            "evening gown",
            "bodycon dress",
            "mini dress",
            "maxi dress",
            "wrap dress",
            "halter dress",
            "off-shoulder dress",
            "strapless dress",
            "floral dress",
            "denim dress",
            "lace dress",
            "silk dress",
            "sequin dress"
        ]
    },
    {
        title: "Lingerie",
        description: "Lingerie and intimate apparel",
        hasColorMenu: true,
        presets: [
            "bra and panties",
            "lace bra and panties",
            "matching lingerie set",
            "black lace lingerie",
            "red lace lingerie",
            "silk camisole",
            "silk cami and shorts set",
            "teddy lingerie",
            "babydoll lingerie",
            "corset",
            "garter belt",
            "thigh-high stockings",
            "fishnet stockings"
        ]
    },
    {
        title: "Swimwear",
        description: "Bikinis, one-piece suits, and beachwear",
        hasColorMenu: true,
        presets: [
            "one-piece swimsuit",
            "high-cut one-piece swimsuit",
            "bikini",
            "string bikini",
            "high-waisted bikini",
            "halter bikini",
            "sport bikini",
            "monokini",
            "rash guard",
            "board shorts"
        ]
    },
    {
        title: "Robes / Loungewear",
        description: "Bathrobes, pajamas, and comfortable indoor clothing",
        hasColorMenu: true,
        presets: [
            "silk robe",
            "bathrobe",
            "plush bathrobe",
            "satin robe",
            "pajamas",
            "silk pajamas",
            "tank top and pajama shorts",
            "oversized sleep shirt",
            "loungewear set"
        ]
    },
    {
        title: "Sets",
        description: "Coordinated outfits and matching clothing sets",
        hasColorMenu: true,
        presets: [
            "matching crop top and skirt set",
            "matching top and shorts set",
            "matching blazer and trousers set",
            "matching sweater and pants set",
            "matching athletic set",
            "matching denim set",
            "matching leather set"
        ]
    },
    {
        title: "Uniforms",
        description: "Professional, school, service, and themed uniforms",
        hasColorMenu: true,
        presets: [
            { label: "Hooters Uniform", value: "Hooters uniform (tight-fitting white T-shirt with the Hooters logo across the chest and short tight-fitting orange shorts)" },
            { label: "Schoolgirl Uniform", value: "a schoolgirl uniform with a short pleated skirt and thigh-high white socks. {possessive} shirt is unbuttoned down to {possessive} navel, revealing deep cleavage." },
            { label: "Sexy Nurse", value: "a sexy nurse's uniform, showing ample cleavage, and a nurse's cap" },
            "nurse uniform",
            "doctor's coat",
            "surgeon's scrubs",
            "police uniform",
            "firefighter uniform",
            "military uniform",
            "flight attendant uniform",
            "chef uniform",
            "construction worker uniform",
            "mechanic uniform",
            "business uniform"
        ]
    },
    {
        title: "Costume Oddities",
        description: "Unconventional and surreal costume presets",
        presets: [
            "a gimp mask",
            "a latex catsuit",
            { label: "mascot-style animal onesie, unzipped", value: "a mascot-style animal onesie, unzipped" },
            { label: "marionette/puppet aesthetic", value: "a marionette/puppet aesthetic with visible joint seams and strings" }
        ]
    },
    {
        title: "Period Fashion",
        description: "1940s WWII-era and 1960s mid-century styling",
        presets: [
            { label: "1940s WWII Women's Ensemble", value: "1940s WWII-era women's ensemble: A-line tea dress with a fitted waist, padded shoulders, and Victory Roll hairstyle" },
            { label: "1940s WWII Flight Jacket", value: "1940s WWII-style leather flight jacket worn over a white dress" },
            { label: "1940s Sailor Uniform", value: "1940s-style navy sailor uniform with a white collar and navy tie" },
            { label: "1960s Mod Shift Dress", value: "1960s Mod shift dress with a geometric pattern, bold graphic print, and knee-length hem" },
            { label: "1960s Cocktail Dress", value: "1960s cocktail dress with a fitted bodice, flared A-line skirt, and elbow-length gloves" },
            { label: "1960s Turtleneck & Slacks", value: "1960s beatnik turtleneck paired with high-waisted slacks" },
            { label: "1960s Go-Go Outfit", value: "1960s go-go dress with white go-go boots" },
            { label: "1960s Pillbox Ensemble", value: "1960s pillbox hat and tailored suit ensemble with a boxy jacket and pencil skirt" }
        ]
    },
    {
        title: "Footwear",
        description: "Shoes, socks, legwear, and color",
        hasColorMenu: true,
        presets: [
            "barefoot", "tube socks", "knee-high Hello Kitty socks", "knee-high Pokemon socks",
            "black fishnet stockings", "sheer lace stockings", "strappy heels", "lace-up knee boots",
            "platform boots", "stiletto heels", "cowboy boots", "thigh-high stockings", "thigh-high leather boots",
            "lace-up thigh-highs"
        ]
    }
];

// Combined clothing presets. These are complete outfit combinations that can
// be selected as a single outfit instead of combining individual groups.
const clothingPresets = [
    { label: "Casual T-Shirt & Jeans", value: "a fitted t-shirt and jeans" },
    { label: "Tank Top & Shorts", value: "a tank top and denim shorts" },
    { label: "Blouse & Skirt", value: "a blouse and a knee-length skirt" },
    { label: "Business Suit", value: "a tailored business suit with a button-down shirt" },
    { label: "Summer Sundress", value: "a casual summer sundress" },
    { label: "Little Black Dress", value: "a little black dress with strappy heels" },
    { label: "Evening Gown", value: "an elegant evening gown" },
    { label: "Yoga Outfit", value: "a fitted athletic tank top and yoga pants" },
    { label: "Gym Outfit", value: "a fitted athletic shirt and short athletic shorts" },
    { label: "Hoodie & Joggers", value: "an oversized hoodie and joggers" },
    { label: "Leather Jacket & Jeans", value: "a leather jacket over a t-shirt with jeans and boots" },
    { label: "Cowboy Outfit", value: "a western shirt, bootcut jeans, cowboy boots, and a cowboy hat" },
    { label: "Bikini", value: "a bikini with a beach cover-up" },
    { label: "Lingerie", value: "matching lace lingerie with thigh-high stockings" },
    { label: "Silk Robe", value: "a silk robe loosely tied at the waist" }
];

// =========================================
// ACTION / POSE
// =========================================

const complexActionPresets = [
    { label: "Standing — natural", value: "standing naturally" },
    { label: "Standing — hands at sides", value: "standing naturally with {possessive} arms relaxed at {possessive} sides" },
    { label: "Standing — hand on hip", value: "standing with one hand resting on {possessive} hip" },
    { label: "Walking toward camera", value: "walking toward the camera" },
    { label: "Walking away", value: "walking away from the camera" },
    { label: "Sitting on chair", value: "sitting naturally on a chair" },
    { label: "Sitting cross-legged", value: "sitting cross-legged" },
    { label: "Kneeling", value: "kneeling naturally" },
    { label: "Lying down", value: "lying down naturally" },
    { label: "Leaning against wall", value: "leaning casually against a wall" },
    { label: "Hands in pockets", value: "standing with {possessive} hands in {possessive} pockets" },
    { label: "Arms crossed", value: "standing with {possessive} arms crossed" },
    { label: "Looking over shoulder", value: "looking over {possessive} shoulder toward the camera" },
    { label: "Hair adjustment", value: "lifting one hand to adjust {possessive} hair" },
    { label: "Phone", value: "looking at a smartphone held in one hand" },
    { label: "Reading", value: "reading a book held in both hands" },
    { label: "Drinking coffee", value: "holding and drinking from a coffee cup" },
    { label: "Laughing", value: "laughing naturally" },
    { label: "Smiling", value: "smiling naturally at the camera" },
    { label: "Stretching", value: "stretching both arms overhead" },
    { label: "Hands behind head", value: "standing with both hands behind {possessive} head" },
    { label: "Bending forward", value: "bending forward at the waist" },
    { label: "Hands on knees", value: "leaning forward with both hands resting on {possessive} knees" }
];

const actionGroups = [
    {
        title: "Position",
        description: "Overall body position",
        presets: [
            "standing",
            "sitting",
            "kneeling",
            "squatting",
            "lying down",
            "crouching",
            "leaning against a wall"
        ]
    },
    {
        title: "Hands / Arms",
        description: "Arm and hand placement",
        presets: [
            "arms at {possessive} sides",
            "arms crossed",
            "hands on {possessive} hips",
            "hands behind {possessive} back",
            "hands behind {possessive} head",
            "one hand on {possessive} hip",
            "one hand touching {possessive} hair",
            "both hands touching {possessive} hair",
            "hands in {possessive} pockets",
            "one hand resting on a nearby surface"
        ]
    },
    {
        title: "Legs",
        description: "Leg and foot positioning",
        presets: [
            "legs together",
            "legs slightly apart",
            "one leg crossed over the other",
            "one foot slightly forward",
            "one knee bent",
            "both knees bent",
            "one leg raised"
        ]
    },
    {
        title: "Looking and facing",
        description: "Looking and facing choices",
        presets: [
            "looking at camera",
            "looking away from camera",
            "looking off to the side",
            "looking down",
            "looking up",
            "looking over {possessive} shoulder",
            "head tilted to the side",
            "head turned to the side",
            "facing camera",
            "facing away from camera",
            "ass toward the camera",
            "eyes closed",
            "squinting"
        ]
    },
    {
        title: "Expression",
        description: "Face and expression",
        presets: [
            "lips parted",
            "smiling",
            "chin tilted up",
            "head tilted up",
            "head tilted down"
        ]
    },
    {
        title: "Setting",
        description: "Scene and environment",
        presets: [
            { label: "in the shower", value: "in a walk-in shower, with wet hair and wet body, water cascading down {possessive} wet body" },
            "in a bedroom",
            "in a kitchen",
            "in the backseat of a car",
            "in a surgical theatre",
            "in a crowded city street",
            "in a glade",
            "on an office desk",
            "at a poolside",
            "on a beach at sunset",
            "in a nightclub",
            "in a hotel room",
            "on a rooftop at night",
            "in an elevator",
            "in a library",
            "in a locker room"
        ]
    }
];

// =========================================
// ART STYLE
// =========================================

const artStylePresets = [
    "photo",
    { label: "1940s Pinup", value: "1940s era pinup oil painting in the style of Gil Elvgren and Alberto Vargas" },
    { label: "Disney/Pixar Animation", value: "Disney-Pixar style animation with exaggerated features and expressions: large expressive eyes, small noses" },
    { label: "Claymation", value: "Claymation style, sculpted polymer clay figure, soft tactile texture, fingerprint details, handcrafted stop-motion aesthetic, tilt-shift depth of field" },
    { label: "Pop Art/Comic Book", value: "1960s Pop Art style, Roy Lichtenstein aesthetic, bold black ink outlines, sharp Ben-Day dots, vibrant primary colors, graphic retro comic illustration" },
    { label: "Modern Vector/Flat Illustration", value: "Sleek vector illustration, clean lines, minimalist shading, bold flat color palette, mid-century graphic poster art style" },
    { label: "Cyberpunk Anime/Cell-Shaded", value: "90s hand-drawn anime style, classic cell-shading, vibrant neon rim lighting, retro sci-fi aesthetic, detailed line art" },
    { label: "Vintage Pulp Fiction Cover", value: "1950s pulp magazine cover illustration, dramatic dramatic chiaroscuro lighting, painted gouache texture, vibrant retro paperback aesthetic" },
    { label: "Oil Painting/Impressionism", value: "Impressionist oil painting, thick impasto brushstrokes, textured canvas, dramatic lighting, rich paint texture in the style of John Singer Sargent" },
    { label: "Watercolors", value: "Soft watercolor painting, fluid ink wash, gentle color bleeding, painterly splatters, delicate lines on textured watercolor paper" },
    { label: "Papercraft/Layered Paper", value: "Layered papercraft illustration, laser-cut paper art, soft drop shadows, clean geometric depth, handcrafted paper texture" }
];

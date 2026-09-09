//@api-1.0
// =========================================
// KREA 2 MODULAR BATCH GENERATOR
// PRESETS + BODY PHYSIQUE + GENDER-AWARE TERMS
// + CAMERA + LIGHTING + TENEBRISM
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
    "Mixed-race adult with a natural blend of African and European facial features",
    "Mexican with prominent Indigenous Mesoamerican facial features",
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
    "Italian"
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
    "porcelain skin",
    "pale skin",
    "fair skin",
    "tanned skin",
    "cream skin",
    "olive skin",
    "caramel skin",
    "warm brown skin",
    "dark skin",
    "dark glossy skin"
];


// =========================================
// BODY / PHYSIQUE
// =========================================

// Each option has:
// label = what appears in the UI
// value = what is actually sent to Krea


// -----------------------------------------
// Overall build
// -----------------------------------------

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


// -----------------------------------------
// Height
// -----------------------------------------

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


// -----------------------------------------
// Chest
// -----------------------------------------

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
    },
    {
        label: "Large breasts",
        value: "large breasts"
    }
];


// -----------------------------------------
// Hips
// -----------------------------------------

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


// -----------------------------------------
// Body shape
// -----------------------------------------

const bodyShapePresets = [
    {
        label: "No specific shape",
        value: ""
    },
    {
        label: "Petite",
        value: "small petite juvenile frame, with narrow shoulders, narrow hips, and a small flat boyish chest"
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


// -----------------------------------------
// Legs
// -----------------------------------------

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


// -----------------------------------------
// Ass size
// -----------------------------------------

const assSizePresets = [
    {
        label: "Small",
        value: "small, relatively subtle buttocks"
    },
    {
        label: "Average",
        value: "average-sized buttocks with natural proportions"
    },
    {
        label: "Large",
        value: "large, prominently rounded buttocks"
    },
    {
        label: "Very large",
        value: "very large, dramatically rounded buttocks with pronounced volume"
    }
];


// -----------------------------------------
// Belly size
// -----------------------------------------

const bellySizePresets = [
    {
        label: "Flat",
        value: "flat, relatively lean abdomen"
    },
    {
        label: "Average",
        value: "average abdomen with natural proportions"
    },
    {
        label: "Soft",
        value: "soft, gently rounded abdomen"
    },
    {
        label: "Large",
        value: "prominent, rounded abdomen"
    },
    {
        label: "Very large",
        value: "very large, prominently rounded abdomen"
    }
];


// -----------------------------------------
// Specific body characteristics
// -----------------------------------------

const specificBodyPresets = [
    {
        label: "No specific characteristic",
        value: ""
    },
    {
        label: "Adult with achondroplasia",
        value: "adult with achondroplasia, characteristic short stature and naturally proportioned body"
    },
    {
        label: "Pregnant",
        value: "pregnant adult with a visibly rounded pregnant belly"
    },
    {
        label: "Heavily pregnant",
        value: "heavily pregnant adult with a large, prominently rounded late-stage pregnancy belly"
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
    "neck tattoos",
    "sleeve tattoos",
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
    "medium-length",
    "long",
    "very long"
];


const hairstylePresets = [
    // Texture
    "straight",
    "wavy",
    "curly",

    // Pulled-back and braided styles
    "wet hair",
    "ponytail",
    "messy ponytail",
    "French braid",
    "loose braids",
    "messy bun",
    "messy double buns",

    // Cut and styling details
    "with bangs",
    {
        label: "blown-out",
        value: "high-volume, heavily sprayed, lacquered hairstyle"
    },
    {
        label: "soft feathered 70s blowout",
        value: "soft feathered 1970s blowout hairstyle with airy volume, gentle waves, and naturally lifted layers"
    },
    {
        label: "60s bouffant curls",
        value: "1960s bouffant hairstyle with large rounded curls, high volume, and polished lift"
    },
    "faux hawk",
    "short boyish hairstyle",
    "shaved on one side",
    "shaved on both sides",
    "spiked punk hairstyle",
    "Hollywood curls",
    "Victory curls"
];


// -----------------------------------------
// Body hair
// -----------------------------------------

const bodyHairPresets = [
    "light body hair",
    "thick body hair"
];


// =========================================
// CLOTHING
// =========================================

// Clothing presets can be either:
//
// 1. A simple string:
//    "a tank top"
//
// 2. An object with:
//    label = what appears in the UI
//    value = what is actually sent to Krea
//
// This allows the UI to stay clean while
// detailed clothing descriptions are sent
// to the prompt generator.

const clothingPresets = [

    // -------------------------------------
    // Tops
    // -------------------------------------

    "a loose fitting T-shirt",
    "a fitted T-shirt",
    "a tank top",
    "a crop top",
    {
        label: "a short crop top",
        value: "a crop-top t-shirt showing significant underboob"
    },
    "a blouse",
    "an unbuttoned mens dress shirt",
    "a hoodie",


    // -------------------------------------
    // Dresses and one-piece outfits
    // -------------------------------------

    "a short babydoll dress",
    "a summer dress",
    "one-piece swimsuit",


    // -------------------------------------
    // Bottoms
    // -------------------------------------

    "jeans",
    "shorts",
    "cutoff jean shorts",
    "mini-skirt",
    "pleated mini-skirt",
    "spandex leggings",


    // -------------------------------------
    // Undergarments and lingerie
    // -------------------------------------

    "nude",
    "bikini-style panties",
    "thong",
    "string bikini",
    "garter belt",
    "lace bustier",
    "silk lingerie set",
    "black lace lingerie set",
    "red satin lingerie set",
    "sheer lace teddy",
    "transparent lace bra and panties",
    "lace-up corset",
    "satin chemise",
    "sheer bodystocking",
    "balconette bra and matching panties",
    "lace garter set",
    "leather lingerie set",
    "silk robe and lingerie set",
    "fishnet bodysuit",
    "push-up bra and thong set",
    "lace-up thigh-highs",
    "strapless corset set",
    "sheer robe with matching panties",
    "satin slip dress",
    "lace-up bustier set",
    "transparent vinyl lingerie",
    "corset over sheer stockings",


    // -------------------------------------
    // Detailed clothing presets
    // -------------------------------------

    {
        label: "Champagne Silk Pajama Set",
        value: "champagne-colored silk pajama set with shorts that show ample thigh"
    },
    {
        label: "a lace bustier, garter belt and thigh-high stockings",
        value: "a lace bustier, garter belt and thigh-high stockings"
    },


    // -------------------------------------
    // Uniforms
    // -------------------------------------

    {
        label: "French Maid Uniform",
        value: "black French maid uniform with short pleated skirt and white collar"
    },

    {
        label: "Hooters Uniform",
        value: "Hooters uniform (tight-fitting white T-shirt with the Hooters logo across the chest and short tight-fitting orange shorts)"
    },


    // -------------------------------------
    // Footwear and legwear
    // -------------------------------------

    "barefoot",
    "white tube socks",
    "black fishnet stockings",
    "sheer lace stockings",
    "strappy heels",
    "lace-up knee boots",
    "platform boots",
    "stiletto heels",
    "cowboy boots",
    "thigh-high stockings",
    "thigh-high leather boots"
];


const clothingGroups = [
    {
        title: "Tops",
        description: "Upper-body styling",
        presets: clothingPresets.slice(0, 8)
    },
    {
        title: "Dresses",
        description: "Dress and one-piece styles",
        presets: clothingPresets.slice(8, 11)
    },
    {
        title: "Bottoms",
        description: "Skirts, shorts, and bottoms",
        presets: clothingPresets.slice(11, 17)
    },
    {
        title: "Lingerie",
        description: "Lingerie and underlayers",
        presets: clothingPresets.slice(17, 44)
    },
    {
        title: "Details",
        description: "Specialty outfit presets",
        presets: clothingPresets.slice(44, 47)
    },
    {
        title: "Footwear",
        description: "Shoes, socks, and legwear",
        presets: clothingPresets.slice(47)
    }
];


// -----------------------------------------
// Clothing helper functions
//
// These allow clothingPresets to contain
// both simple strings and label/value
// objects.
// -----------------------------------------

function getClothingLabel(preset) {

    if (
        typeof preset === "object" &&
        preset !== null
    ) {

        return preset.label;
    }

    return preset;
}


function getClothingValue(preset) {

    if (
        typeof preset === "object" &&
        preset !== null
    ) {

        return preset.value;
    }

    return preset;
}


function getHairstyleLabel(preset) {

    if (
        typeof preset === "object" &&
        preset !== null
    ) {

        return preset.label;
    }

    return preset;
}


function getHairstyleValue(preset) {

    if (
        typeof preset === "object" &&
        preset !== null
    ) {

        return preset.value;
    }

    return preset;
}


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
        value: "on {possessive} knees, leaning forward, {possessive} face in the foreground, back arched, ass high in the air, arms stretched out in front of {objectPronoun}"
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
        label: "On Back, Legs in the air)",
        value: "laying on a bed on {possessive} back with {possessive} butt at the edge of the bed, {possessive} legs straight and elevated into the air, knees locked, bending at waist only"
    },
    {
        label: "Bending Over (Legs Straight)",
        value: "leaning forward to grab something off of a lower level of a bookshelf, legs straight, knees locked, bending at waist only, looking at the camera sideways, with {possessive} hand covering {possessive} mouth and wide-eyed open-mouthed look of surprise"
    },
    {
        label: "View in shower from below",
        value: "standing and rubbing soapy lather all over {possessive} body in the shower with a soapy loofah, water and soap cascading down {possessive} nude body, looking up at the water as it streams out of the showerhead, the camera sitting candidly below {objectPronoun} looking up"
    },
    {
        label: "Standing in doorway (foot on frame)",
        value: "standing in a bedroom doorway. Her back is against one side of the door frame, and one of her feet is elevated to eye-level and the sole of her shoe is pressing against the opposite door frame, putting her knee close to her face."
    },
    {
        label: "Bending Forward, Hands on Knees",
        value: "standing, facing away from the camera, leaning forward, {possessive} ass toward the camera, hands on {possessive} knees, looking back at the camera, legs straight, knees locked"
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
    "on a thick carpeted floor",
    "on {possessive} side",
    "facedown",
    "{possessive} face in the foreground",
    "on {possessive} back",
    "{possessive} butt at the edge of the bed",
    "standing in a doorway",
    "crawling toward the camera",
    "on {possessive} hands and knees",

    // Body and leg position
    "legs straight",
    "elevated into the air",
    "knees locked",
    "bending at waist only",
    "leaning forward",
    "one knee bent",
    "knees bent",
    "one foot on the wall",
    "feet spread wide",
    "feet together",
    "feet crossed",
    "one leg raised",
    "1 foot against door frame",
    "{possessive} ass high in the air",
    "back arched",
    "chest puffed out",
    "knees together",
    "shoulders back",

    // Arms and hands
    "arms raised high above {possessive} head",
    "arms stretched out in front of {objectPronoun}",
    "hands clasped together",
    "on {possessive} elbows",
    "elbows resting on bed",
    "hands on hips",
    "hands on waist",
    "hands on breasts",
    "hands in hair",
    "hands on knees",
    "hands lightly touching upper chest area",
    "hands on ass",
    "hands spreading ass cheeks",

    // Gaze and orientation
    "looking off to the side",
    "looking away from camera",
    "looking at camera",
    "looking down",
    "looking up",
    "head tilted to the side",
    "head turned to the side",
    "looking over {possessive} shoulder",
    "facing camera",
    "facing away from camera",
    "ass toward the camera",
    "eyes closed",
    "squinting",

    // Expression
    "lips parted",
    "smiling",
    "chin tilted up",
    "head tilted up",
    "head tilted down",

    // Setting
    "in the shower",
    "in a bedroom",
    "in a kitchen",
    "in the backseat of a car",
    "in a surgical theatre",
    "in a crowded city street",
    "in a glade",
    "on an office desk"
];


const actionGroups = [
    {
        title: "Position",
        description: "Pose setup choices",
        presets: actionSwitchPresets.slice(0, 7)
    },
    {
        title: "Legs",
        description: "Leg and body alignment",
        presets: actionSwitchPresets.slice(7, 18)
    },
    {
        title: "Arms",
        description: "Hand and arm placement",
        presets: actionSwitchPresets.slice(18, 28)
    },
    {
        title: "Gaze",
        description: "Looking and facing choices",
        presets: actionSwitchPresets.slice(28, 37)
    },
    {
        title: "Expression",
        description: "Face and expression",
        presets: actionSwitchPresets.slice(37, 39)
    },
    {
        title: "Setting",
        description: "Scene and environment",
        presets: actionSwitchPresets.slice(39)
    }
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
// CAMERA • FRAMING
// =========================================

const cameraFramingPresets = [
    {
        label: "Head and shoulders",
        value: "head-and-shoulders framing"
    },
    {
        label: "Close-up",
        value: "close-up framing focused tightly on the subject"
    },
    {
        label: "Extreme close-up",
        value: "extreme close-up framing focused very tightly on specific facial or bodily details"
    },
    {
        label: "Chest-up",
        value: "chest-up framing"
    },
    {
        label: "Waist-up",
        value: "waist-up framing"
    },
    {
        label: "3/4 body",
        value: "three-quarter body framing"
    },
    {
        label: "Full body",
        value: "full-body framing with the entire subject visible"
    },
    {
        label: "Wide shot",
        value: "wide shot showing the subject and surrounding environment"
    },
    {
        label: "Environmental",
        value: "environmental portrait framing with the subject integrated into the surrounding scene"
    }
];


// =========================================
// CAMERA • PERSPECTIVE
// =========================================

const cameraPerspectivePresets = [
    {
        label: "Eye level",
        value: "natural eye-level perspective"
    },
    {
        label: "Low angle",
        value: "low-angle perspective looking upward toward the subject"
    },
    {
        label: "High angle",
        value: "high-angle perspective looking downward toward the subject"
    },
    {
        label: "Worm's-eye",
        value: "extreme low-angle worm's-eye perspective"
    },
    {
        label: "Bird's-eye",
        value: "high bird's-eye perspective looking down from above"
    },
    {
        label: "Side view",
        value: "side-view camera perspective"
    },
    {
        label: "3/4 view",
        value: "three-quarter camera perspective showing the subject from an oblique angle"
    },
    {
        label: "Wide-angle perspective",
        value: "pronounced wide-angle perspective with natural spatial exaggeration"
    },
    {
        label: "Compressed perspective",
        value: "compressed telephoto-style perspective with reduced apparent depth"
    },
    {
        label: "Over-the-Shoulder",
        value: "over-the-shoulder"
    }
];


// =========================================
// CAMERA • DEPTH OF FIELD
// =========================================

const depthOfFieldPresets = [
    {
        label: "Deep focus",
        value: "deep depth of field with the subject and environment clearly in focus"
    },
    {
        label: "Moderate",
        value: "moderate depth of field with gentle background separation"
    },
    {
        label: "Shallow",
        value: "shallow depth of field with the subject sharply focused against a softly blurred background"
    },
    {
        label: "Very shallow",
        value: "very shallow depth of field with strong background blur and pronounced subject isolation"
    }
];


// =========================================
// CAMERA • COMPOSITION
// =========================================

const cameraCompositionPresets = [
    {
        label: "Centered",
        value: "centered composition"
    },
    {
        label: "Rule of thirds",
        value: "rule-of-thirds composition"
    },
    {
        label: "Symmetrical",
        value: "symmetrical composition with balanced visual elements"
    },
    {
        label: "Off-center",
        value: "off-center composition with intentional visual balance"
    },
    {
        label: "Negative space",
        value: "composition using deliberate negative space around the subject"
    },
    {
        label: "Leading lines",
        value: "composition using leading lines to draw attention toward the subject"
    },
    {
        label: "Foreground framing",
        value: "composition using foreground elements to naturally frame the subject"
    },
    {
        label: "Dynamic diagonal",
        value: "dynamic diagonal composition creating a sense of movement and visual energy"
    }
];


// =========================================
// LIGHTING • TIME OF DAY
// =========================================

const timeOfDayPresets = [
    {
        label: "Daytime",
        value: "natural daytime illumination"
    },
    {
        label: "Midday",
        value: "bright midday sunlight with a high sun"
    },
    {
        label: "Late afternoon",
        value: "warm late-afternoon sunlight with moderately long shadows"
    },
    {
        label: "Early evening",
        value: "early-evening light transitioning from daylight toward dusk"
    },
    {
        label: "Golden hour",
        value: "warm golden-hour sunlight, low-angle sun and long soft shadows"
    },
    {
        label: "Blue hour",
        value: "cool blue-hour ambient light shortly after sunset"
    },
    {
        label: "Nighttime",
        value: "nighttime illumination with dark ambient surroundings"
    },
    {
        label: "Overcast day",
        value: "soft overcast daylight with broad, diffused illumination"
    },
    {
        label: "Dawn",
        value: "soft early-morning dawn light"
    },
    {
        label: "Dusk",
        value: "soft dusk light with fading daylight and cool ambient tones"
    }
];


// =========================================
// LIGHTING • NATURAL / ENVIRONMENTAL
// =========================================

const naturalLightingPresets = [
    {
        label: "Window light",
        value: "soft natural light entering from a nearby window"
    },
    {
        label: "Direct sunlight",
        value: "direct sunlight with defined highlights and shadows"
    },
    {
        label: "Diffused sunlight",
        value: "diffused sunlight with soft natural shadows"
    },
    {
        label: "Sunlight through curtains",
        value: "soft sunlight filtered through curtains"
    },
    {
        label: "Sunbeams",
        value: "visible shafts of sunlight entering the scene"
    },
    {
        label: "Moonlight",
        value: "cool natural moonlight"
    },
    {
        label: "Streetlights",
        value: "ambient streetlight illumination spilling into the scene"
    },
    {
        label: "Neon",
        value: "colorful neon illumination from nearby signs"
    },
    {
        label: "Candlelight",
        value: "warm flickering candlelight illuminating the subject"
    },
    {
        label: "Fireplace",
        value: "warm flickering firelight from a nearby fireplace"
    },
    {
        label: "Practical lamps",
        value: "warm illumination from visible practical lamps"
    }
];


// =========================================
// LIGHTING • QUALITY / DIRECTION
// =========================================

const lightingQualityPresets = [
    {
        label: "Soft light",
        value: "soft flattering illumination with gentle shadows"
    },
    {
        label: "Hard light",
        value: "hard directional illumination with crisp defined shadows"
    },
    {
        label: "Front lighting",
        value: "frontal lighting illuminating the subject evenly"
    },
    {
        label: "Side lighting",
        value: "directional side lighting emphasizing form and dimensionality"
    },
    {
        label: "Backlighting",
        value: "strong backlighting with the main light positioned behind the subject"
    },
    {
        label: "Rim lighting",
        value: "bright rim lighting outlining the edges of the subject and separating the subject from the background"
    },
    {
        label: "Overhead lighting",
        value: "directional overhead lighting from above the subject"
    },
    {
        label: "Underlighting",
        value: "dramatic low-angle lighting from below the subject"
    }
];


// =========================================
// LIGHTING • MOOD / CINEMATIC
// =========================================

const cinematicLightingPresets = [
    {
        label: "Cinematic",
        value: "dramatic cinematic lighting with controlled highlights and shadows"
    },
    {
        label: "Moody",
        value: "moody atmospheric lighting with subdued illumination and rich shadows"
    },
    {
        label: "Soft cinematic",
        value: "soft cinematic lighting with gentle contrast and natural falloff"
    },
    {
        label: "High-key",
        value: "high-key lighting with bright even illumination, low contrast and minimal shadows"
    },
    {
        label: "Low-key",
        value: "low-key lighting with dramatic contrast, deep shadows and controlled highlights"
    },
    {
        label: "Chiaroscuro",
        value: "chiaroscuro lighting with strong contrast between light and shadow"
    },
    {
        label: "Film noir",
        value: "classic film-noir lighting with hard directional light and dramatic shadows"
    },
    {
        label: "Volumetric light",
        value: "volumetric lighting with visible light rays through the atmosphere"
    },
    {
        label: "God rays",
        value: "dramatic visible shafts of light cutting through the atmosphere"
    },
    {
        label: "Hazy atmosphere",
        value: "soft hazy atmospheric illumination with gentle diffusion"
    },
    {
        label: "Deep shadows",
        value: "deep pronounced shadows with strong tonal separation"
    },
    {
        label: "Long shadows",
        value: "long directional shadows cast across the environment"
    },
    {
        label: "Silhouette",
        value: "strong backlighting producing a dramatic partial silhouette"
    }
];


// =========================================
// LIGHTING • COLOR / CREATIVE
// =========================================

const colorLightingPresets = [
    {
        label: "Warm",
        value: "warm color temperature with golden amber illumination"
    },
    {
        label: "Cool",
        value: "cool color temperature with bluish illumination"
    },
    {
        label: "Blue-toned",
        value: "blue-toned ambient illumination"
    },
    {
        label: "Orange-and-blue cinematic",
        value: "cinematic complementary orange and blue lighting"
    },
    {
        label: "Red ambient",
        value: "subtle red ambient illumination"
    },
    {
        label: "Blue ambient",
        value: "subtle blue ambient illumination"
    },
    {
        label: "Purple ambient",
        value: "subtle purple ambient illumination"
    },
    {
        label: "Colored practicals",
        value: "colored practical lights contributing visible ambient illumination"
    },
    {
        label: "Neon rim",
        value: "colored neon backlighting creating a vivid rim around the subject"
    },
    {
        label: "Mixed colors",
        value: "mixed-color lighting with multiple contrasting light sources"
    },
    {
        label: "Colored gels",
        value: "colored gel lighting casting a controlled colored wash across the scene"
    }
];


// =========================================
// LIGHTING • DARK / TENEBRISM
// =========================================

const tenebrismLightingPresets = [
    {
        label: "Tenebrism",
        value: "tenebristic lighting with an extremely dark environment, a small area of intense illumination and most of the scene disappearing into deep shadow"
    },
    {
        label: "Extreme tenebrism",
        value: "extreme tenebrism with very limited illumination, deep black shadows and only the essential portions of the subject emerging from darkness"
    },
    {
        label: "Subtle tenebrism",
        value: "subtle tenebristic lighting with most of the scene obscured in darkness while delicate highlights reveal the subject"
    },
    {
        label: "Near-total darkness",
        value: "near-total darkness with only faint illumination revealing the subject and immediate surroundings"
    },
    {
        label: "Dim moonlight",
        value: "very dim cool moonlight entering the scene, leaving most of the environment in deep shadow"
    },
    {
        label: "Moonlight through window",
        value: "faint cool moonlight streaming through a window, illuminating only portions of the subject while the rest of the room remains deeply shadowed"
    },
    {
        label: "Faint dawn light",
        value: "extremely dim pre-dawn illumination with the environment barely visible and subtle highlights gradually revealing the subject"
    },
    {
        label: "Pre-sunrise darkness",
        value: "deep pre-sunrise darkness with only faint ambient light outlining the subject and environment"
    },
    {
        label: "Dark fisherman dawn",
        value: "extremely dim early-morning light on a fishing boat, with the fisherman and surroundings barely visible against deep blue-black shadows"
    },
    {
        label: "Foggy dawn darkness",
        value: "dim pre-dawn illumination diffused through mist and fog, with only faint shapes and highlights emerging from darkness"
    },
    {
        label: "Single light source",
        value: "a single small directional light source illuminating only part of the subject while the surrounding scene falls into deep darkness"
    },
    {
        label: "Face emerging from darkness",
        value: "the subject's face subtly emerging from near-black surroundings, illuminated by a narrow controlled light"
    },
    {
        label: "Partial illumination",
        value: "very limited directional illumination revealing only selected portions of the subject while most of the body disappears into shadow"
    },
    {
        label: "Black-background lighting",
        value: "the subject emerging from an almost completely black background with minimal controlled illumination"
    },
    {
        label: "Deep shadow falloff",
        value: "extremely rapid falloff from illuminated areas into nearly black shadow"
    },
    {
        label: "Dark atmospheric lighting",
        value: "very low ambient illumination with atmospheric darkness surrounding isolated pools of light"
    },
    {
        label: "Candle in darkness",
        value: "a single dim candle providing the primary illumination while the surrounding environment disappears into deep shadow"
    },
    {
        label: "Lantern in darkness",
        value: "a lone dim lantern illuminating the immediate area while the surrounding environment remains almost completely dark"
    },
    {
        label: "Boat lantern",
        value: "a faint warm lantern illuminating a small area aboard a fishing boat surrounded by deep pre-dawn darkness"
    },
    {
        label: "Light barely revealing details",
        value: "extremely restrained illumination where details are only visible after close inspection, with most of the scene concealed in darkness"
    }
];


// =========================================
// LIGHTING • SPECIAL EFFECTS
// =========================================

const experimentalLightingPresets = [
    {
        label: "Projector light",
        value: "projected patterned light falling across the subject"
    },
    {
        label: "Venetian blinds",
        value: "strong bands of light and shadow cast through window blinds"
    },
    {
        label: "Dappled light",
        value: "dappled sunlight creating irregular patches of light and shadow"
    },
    {
        label: "Cross lighting",
        value: "cross-lighting from opposing directional sources"
    },
    {
        label: "Catchlights",
        value: "distinct natural catchlights visible in the eyes"
    },
    {
        label: "Lens flare",
        value: "subtle cinematic lens flare from a bright light source"
    },
    {
        label: "Light leaks",
        value: "subtle photographic light leaks around bright areas"
    },
    {
        label: "Prismatic reflections",
        value: "subtle prismatic rainbow reflections from refracted light"
    },
    {
        label: "Water caustics",
        value: "moving water-caustic patterns of light projected across the scene"
    },
    {
        label: "Fog light",
        value: "directional light visibly diffused through light atmospheric fog"
    }
];


const colorTreatmentPresets = [
    {
        label: "Black & white",
        value: "black-and-white monochrome treatment"
    },
    {
        label: "Sepia",
        value: "sepia-toned treatment"
    },
    {
        label: "High-contrast noir",
        value: "high-contrast noir-style treatment"
    },
    {
        label: "Soft monochrome",
        value: "soft monochrome treatment"
    },
    {
        label: "1970s Polaroid",
        value: "1970s Polaroid film aesthetic with warm tones, soft contrast, and instant-photo color drift"
    },
    {
        label: "1940s Kodachrome",
        value: "1940s Kodachrome-inspired color treatment with rich saturated tones, gentle contrast, and nostalgic vintage color rendering"
    },
    {
        label: "1960s slide film",
        value: "1960s slide film aesthetic with vibrant saturated colors, slightly warm highlights, and crisp vintage transparency look"
    },
    {
        label: "1950s magazine print",
        value: "1950s magazine-print color treatment with polished glossy tones, soft bloom, and clean mid-century editorial color balance"
    },
    {
        label: "1980s VHS",
        value: "1980s VHS aesthetic with slightly washed-out color, magnetic noise, analog softness, and retro cassette-era warmth"
    },
    {
        label: "1930s Agfacolor",
        value: "1930s Agfacolor-inspired treatment with slightly muted early color film tones and classic pre-war photographic softness"
    },
    {
        label: "1970s Technicolor",
        value: "1970s Technicolor-inspired treatment with saturated cinematic color, rich contrast, and glossy studio-film look"
    },
    {
        label: "2000s disposable camera",
        value: "2000s disposable-camera aesthetic with soft focus, slight color cast, and nostalgic point-and-shoot film imperfections"
    },
    {
        label: "1990s Fuji film",
        value: "1990s Fuji film-inspired treatment with smooth color transitions, slightly warm highlights, and clean nostalgic analog tone"
    },
    {
        label: "1960s Eastmancolor",
        value: "1960s Eastmancolor-inspired treatment with rich yet soft color, gentle contrast, and mid-century studio warmth"
    },
    {
        label: "1980s neon synthwave film",
        value: "1980s neon synthwave film treatment with vivid synthetic colors, glossy contrast, and retro-futurist glow"
    },
    {
        label: "1950s Anscochrome",
        value: "1950s Anscochrome-inspired treatment with soft pastel tones, slightly hazy color, and warm editorial sweetness"
    }
];


// =========================================
// STEP 1 — BATCH SETUP
// =========================================

const setup = requestFromUser(
    "Batch Setup",
    "Continue",
    function () {

        return [

            this.section(

                "❖  Batch Configurations",

                "Define how many variants to generate per batch",

                [

                    this.menu(
                        0,
                        [
                            "1 Subject",
                            "2 Subjects",
                            "3 Subjects",
                            "4 Subjects",
                            "5 Subjects"
                        ]
                    ),

                    this.menu(
                        0,
                        [
                            "1 Outfit",
                            "2 Outfits",
                            "3 Outfits",
                            "4 Outfits",
                            "5 Outfits"
                        ]
                    ),

                    this.menu(
                        0,
                        [
                            "1 Action",
                            "2 Actions",
                            "3 Actions",
                            "4 Actions",
                            "5 Actions"
                        ]
                    ),

                    this.segmented(
                        0,
                        [
                            "1:1",
                            "3:4 Portrait",
                            "4:3 Landscape",
                            "16:9"
                        ]
                    )
                ]
            )
        ];
    }
);


const setupData = setup[0];


const subjectCount =
    setupData[0] + 1;


const outfitCount =
    setupData[1] + 1;


const actionCount =
    setupData[2] + 1;


const aspectIndex =
    setupData[3];


// =========================================
// STEP 2 — INPUT SCREEN
// =========================================

const inputs = requestFromUser(
    "Batch Prompts",
    "Generate",
    function () {

        const fields = [];


        // =====================================
        // SUBJECTS
        // =====================================

        for (
            let i = 0;
            i < subjectCount;
            i++
        ) {

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

                        this.menu(
                            0,
                            genderMenu
                        ),

                        this.menu(
                            0,
                            nationalityMenu
                        ),

                        this.menu(
                            0,
                            agePresets
                        ),

                        this.menu(
                            0,
                            skinToneMenu
                        )
                    ]
                )
            );


            const overallBuildMenu = [
                "No overall build selected",
                ...overallBuildPresets.map(
                    p => p.label
                )
            ];


            const heightMenu = [
                "No height selected",
                ...heightPresets.map(
                    p => p.label
                )
            ];


            const chestMenu = [
                "No chest description",
                ...chestPresets.map(
                    p => p.label
                )
            ];


            const hipMenu = [
                "No hip description",
                ...hipPresets.map(
                    p => p.label
                )
            ];


            const bodyShapeMenu = [
                ...bodyShapePresets.map(
                    p => p.label
                )
            ];


            const legMenu = [
                "No leg description",
                ...legPresets.map(
                    p => p.label
                )
            ];


            const assSizeMenu = [
                "No ass size selected",
                ...assSizePresets.map(
                    p => p.label
                )
            ];


            const bellySizeMenu = [
                "No belly size selected",
                ...bellySizePresets.map(
                    p => p.label
                )
            ];


            const specificBodyMenu = [
                ...specificBodyPresets.map(
                    p => p.label
                )
            ];


            fields.push(

                this.section(

                    `❖  SUBJECT ${i + 1} • Body / Physique`,

                    "Choose independent characteristics to control the subject's overall proportions and silhouette",

                    [

                        this.menu(
                            0,
                            overallBuildMenu
                        ),

                        this.menu(
                            0,
                            heightMenu
                        ),

                        this.menu(
                            0,
                            chestMenu
                        ),

                        this.menu(
                            0,
                            hipMenu
                        ),

                        this.menu(
                            0,
                            bodyShapeMenu
                        ),

                        this.menu(
                            0,
                            legMenu
                        ),

                        this.menu(
                            0,
                            assSizeMenu
                        ),

                        this.menu(
                            0,
                            bellySizeMenu
                        ),

                        this.menu(
                            0,
                            specificBodyMenu
                        ),

                        this.textField(
                            "",
                            "Custom body details",
                            false,
                            60
                        )
                    ]
                )
            );


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
                ...hairstylePresets.map(
                    p => getHairstyleLabel(p)
                )
            ];


            const appearanceControls = [];


            makeupPresets.forEach(
                m => {

                    appearanceControls.push(

                        this.switch(
                            false,
                            `✡︎  ${m}`
                        )
                    );
                }
            );


            tattooPresets.forEach(
                t => {

                    appearanceControls.push(

                        this.switch(
                            false,
                            `✡︎  ${t}`
                        )
                    );
                }
            );


            bodyHairPresets.forEach(
                h => {

                    appearanceControls.push(

                        this.switch(
                            false,
                            `✡︎  ${h}`
                        )
                    );
                }
            );


            appearanceControls.push(

                this.menu(
                    0,
                    hairColorMenu
                ),

                this.textField(
                    "",
                    "Custom hair color",
                    false,
                    40
                ),

                this.menu(
                    0,
                    hairLengthMenu
                ),

                this.textField(
                    "",
                    "Custom hair length",
                    false,
                    40
                ),

                this.menu(
                    0,
                    hairstyleMenu
                ),

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

        for (
            let i = 0;
            i < outfitCount;
            i++
        ) {

            const outfitMenu = [
                "No clothing selected",
                ...clothingPresets.map(
                    c => getClothingLabel(c)
                )
            ];


            fields.push(

                this.section(

                    `❖  OUTFIT ${i + 1} • Preset`,

                    "Choose a preset or add custom outfit text",

                    [

                        this.menu(
                            0,
                            outfitMenu
                        ),

                        this.textField(
                            "",
                            "Custom outfit description",
                            false,
                            60
                        )
                    ]
                )
            );


            for (
                const group of clothingGroups
            ) {

                fields.push(

                    this.section(

                        `❖  OUTFIT ${i + 1} • ${group.title}`,

                        group.description,

                        group.presets.map(
                            c =>
                                this.switch(
                                    false,
                                    `✡︎  ${getClothingLabel(c)}`
                                )
                        )
                    )
                );
            }
        }


        // =====================================
        // ACTIONS / POSES
        // =====================================

        const actionMenu = [
            "No pose preset selected",
            ...complexActionPresets.map(
                a => a.label
            )
        ];


        for (
            let i = 0;
            i < actionCount;
            i++
        ) {

            fields.push(

                this.section(

                    `❖  ACTION / POSE ${i + 1} • Preset`,

                    "Choose a preset or add custom pose text",

                    [

                        this.menu(
                            0,
                            actionMenu
                        ),

                        this.textField(
                            "",
                            "Custom action / pose modifier",
                            false,
                            60
                        )
                    ]
                )
            );


            for (
                const group of actionGroups
            ) {

                fields.push(

                    this.section(

                        `❖  ACTION / POSE ${i + 1} • ${group.title}`,

                        group.description,

                        group.presets.map(
                            s =>
                                this.switch(
                                    false,
                                    `✡︎  ${s}`
                                )
                        )
                    )
                );
            }
        }


        // =====================================
        // CAMERA
        // =====================================

        const cameraFramingControls =
            cameraFramingPresets.map(
                p =>
                    this.switch(
                        false,
                        `✡︎  ${p.label}`
                    )
            );


        const cameraPerspectiveControls =
            cameraPerspectivePresets.map(
                p =>
                    this.switch(
                        false,
                        `✡︎  ${p.label}`
                    )
            );


        const depthOfFieldControls =
            depthOfFieldPresets.map(
                p =>
                    this.switch(
                        false,
                        `✡︎  ${p.label}`
                    )
            );


        const cameraCompositionControls =
            cameraCompositionPresets.map(
                p =>
                    this.switch(
                        false,
                        `✡︎  ${p.label}`
                    )
            );


        fields.push(

            this.section(

                "❖  CAMERA • Framing",

                "Control how much of the subject and environment appears in the image",

                cameraFramingControls
            )
        );


        fields.push(

            this.section(

                "❖  CAMERA • Perspective",

                "Control the camera's viewing angle, direction, and spatial perspective",

                cameraPerspectiveControls
            )
        );


        fields.push(

            this.section(

                "❖  CAMERA • Depth of Field",

                "Control background separation and focus depth",

                depthOfFieldControls
            )
        );


        fields.push(

            this.section(

                "❖  CAMERA • Composition",

                "Control how the subject is arranged within the frame",

                cameraCompositionControls
            )
        );


        // =====================================
        // LIGHTING
        // =====================================

        const timeOfDayMenu = [
            "No time of day selected",
            ...timeOfDayPresets.map(
                p => p.label
            )
        ];


        const naturalLightingControls =
            naturalLightingPresets.map(
                p =>
                    this.switch(
                        false,
                        `✡︎  ${p.label}`
                    )
            );


        const lightingQualityControls =
            lightingQualityPresets.map(
                p =>
                    this.switch(
                        false,
                        `✡︎  ${p.label}`
                    )
            );


        const cinematicLightingControls =
            cinematicLightingPresets.map(
                p =>
                    this.switch(
                        false,
                        `✡︎  ${p.label}`
                    )
            );


        const colorLightingControls =
            colorLightingPresets.map(
                p =>
                    this.switch(
                        false,
                        `✡︎  ${p.label}`
                    )
            );


        const tenebrismLightingControls =
            tenebrismLightingPresets.map(
                p =>
                    this.switch(
                        false,
                        `✡︎  ${p.label}`
                    )
            );


        const experimentalLightingControls =
            experimentalLightingPresets.map(
                p =>
                    this.switch(
                        false,
                        `✡︎  ${p.label}`
                    )
            );


        fields.push(

            this.section(

                "❖  LIGHTING • Time of Day",

                "Choose the environmental time and quality of ambient light",

                [
                    this.menu(
                        0,
                        timeOfDayMenu
                    )
                ]
            )
        );


        fields.push(

            this.section(

                "❖  LIGHTING • Natural / Environmental",

                "Common natural and environmental light sources",

                naturalLightingControls
            )
        );


        fields.push(

            this.section(

                "❖  LIGHTING • Quality / Direction",

                "High-impact controls for softness, direction, and shadow shape",

                lightingQualityControls
            )
        );


        fields.push(

            this.section(

                "❖  LIGHTING • Mood / Cinematic",

                "High-impact cinematic mood, contrast, and atmosphere",

                cinematicLightingControls
            )
        );


        fields.push(

            this.section(

                "❖  LIGHTING • Color / Creative",

                "Color temperature and colored illumination",

                colorLightingControls
            )
        );


        fields.push(

            this.section(

                "❖  LIGHTING • Dark / Tenebrism",

                "Extreme darkness, selective illumination, moonlight, dawn darkness, and old-master-style shadow",

                tenebrismLightingControls
            )
        );


        fields.push(

            this.section(

                "❖  LIGHTING • Special Effects",

                "Unusual patterns, optical effects, and atmospheric techniques",

                experimentalLightingControls
            )
        );


        const colorTreatmentControls =
            colorTreatmentPresets.map(
                p =>
                    this.switch(
                        false,
                        `✡︎  ${p.label}`
                    )
            );


        fields.push(

            this.section(

                "❖  COLOR TREATMENTS",

                "Optional monochrome or stylized color treatment controls",

                colorTreatmentControls
            )
        );


        // =====================================
        // PROMPT OPTIONS / TEMPLATE
        // =====================================

        const promptControls = [

            this.menu(
                0,
                artStylePresets
            ),


            this.textField(

                "A {artStyle} of {subject}, {action}, wearing {clothing}, {camera}, {timeOfDay}, {lighting}, {colorTreatment}, Natural anatomy",

                "Prompt Template — tags: {artStyle}, {subject}, {action}, {clothing}, {camera}, {timeOfDay}, {lighting}, {colorTreatment}, {subjectPronoun}, {objectPronoun}, {possessive}, {reflexive}, {personNoun}.",

                false,

                80
            )
        ];


        fields.push(

            this.section(

                "❖  Prompt Options & Template",

                "Choose an art style and customize the template with tags",

                promptControls
            )
        );


        return fields;
    }
);


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

    if (
        /\b(man|male)\b/i.test(gender)
    ) {

        return "masculine";
    }


    if (
        /\b(woman|female)\b/i.test(gender)
    ) {

        return "feminine";
    }


    return "neutral";
}


function matchCase(
    source,
    replacement
) {

    if (
        !source ||
        !replacement
    ) {

        return replacement;
    }


    if (
        source ===
        source.toUpperCase()
    ) {

        return replacement.toUpperCase();
    }


    if (
        source[0] ===
        source[0].toUpperCase()
    ) {

        return (
            replacement[0].toUpperCase() +
            replacement.slice(1)
        );
    }


    return replacement;
}


function replaceToken(
    text,
    token,
    replacement
) {

    return text.replace(

        new RegExp(
            `\\{${token}\\}`,
            "gi"
        ),

        replacement
    );
}


// -----------------------------------------
// Gender-aware token replacement
// -----------------------------------------

function applyGenderTerms(
    prompt,
    genderForm
) {

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


    const forms =
        genderTerms[genderForm] ||
        genderTerms.neutral;


    let result = prompt;


    result =
        replaceToken(
            result,
            "subjectPronoun",
            forms.subject
        );


    result =
        replaceToken(
            result,
            "objectPronoun",
            forms.object
        );


    result =
        replaceToken(
            result,
            "possessive",
            forms.possessive
        );


    result =
        replaceToken(
            result,
            "reflexive",
            forms.reflexive
        );


    result =
        replaceToken(
            result,
            "personNoun",
            forms.noun
        );


    const replacements = [

        [
            "himself",
            forms.reflexive
        ],

        [
            "herself",
            forms.reflexive
        ],

        [
            "he",
            forms.subject
        ],

        [
            "she",
            forms.subject
        ],

        [
            "him",
            forms.object
        ],

        [
            "his",
            forms.possessive
        ],

        [
            "woman",
            forms.noun
        ],

        [
            "female",
            genderForm === "feminine"
                ? "female"
                : forms.noun
        ],

        [
            "man",
            forms.noun
        ],

        [
            "male",
            genderForm === "masculine"
                ? "male"
                : forms.noun
        ],

        [
            "girl",
            genderForm === "feminine"
                ? "girl"
                : forms.noun
        ],

        [
            "boy",
            genderForm === "masculine"
                ? "boy"
                : forms.noun
        ]
    ];


    for (
        const [
            source,
            replacement
        ] of replacements
    ) {

        result =
            result.replace(

                new RegExp(
                    `\\b${source}\\b`,
                    "gi"
                ),

                match =>
                    matchCase(
                        match,
                        replacement
                    )
            );
    }


    result =
        result.replace(

            /\bher\b/gi,

            (
                match,
                offset,
                fullText
            ) => {

                const after =
                    fullText.slice(
                        offset +
                        match.length
                    );


                const isPossessive =
                    /^\s+(body|back|legs|feet|hands|arms|hair|face|mouth|eyes|head|breasts|ass|butt|knees|fingers|shoulders|toes|thighs|hips|chest|waist|skin|belly|abdomen)\b/i
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

for (
    let i = 0;
    i < subjectCount;
    i++
) {

    const subjectParts = [];


    const identityData =
        inputs[sectionIdx++];


    const genderIndex =
        identityData[0];


    const nationalityIndex =
        identityData[1];


    const ageIndex =
        identityData[2];


    const skinToneIndex =
        identityData[3];


    const gender =
        genderIndex > 0
            ? genderPresets[
            genderIndex - 1
            ]
            : "";


    const nationality =
        nationalityIndex > 0
            ? nationalityPresets[
            nationalityIndex - 1
            ]
            : "";


    const age =
        agePresets[ageIndex] ||
        "";


    const skin =
        skinToneIndex > 0
            ? skinTonePresets[
            skinToneIndex - 1
            ]
            : "";


    const genderForm =
        getGenderForm(gender);


    if (nationality) {

        subjectParts.push(
            nationality
        );
    }


    if (gender) {

        subjectParts.push(
            gender
        );
    }


    if (age) {

        subjectParts.push(
            age
        );
    }


    if (skin) {

        subjectParts.push(
            "with " + skin
        );
    }


    const bodyData =
        inputs[sectionIdx++];


    let bodyIdx = 0;


    const overallBuildIndex =
        bodyData[bodyIdx++];


    const heightIndex =
        bodyData[bodyIdx++];


    const chestIndex =
        bodyData[bodyIdx++];


    const hipIndex =
        bodyData[bodyIdx++];


    const bodyShapeIndex =
        bodyData[bodyIdx++];


    const legIndex =
        bodyData[bodyIdx++];


    const assSizeIndex =
        bodyData[bodyIdx++];


    const bellySizeIndex =
        bodyData[bodyIdx++];


    const specificBodyIndex =
        bodyData[bodyIdx++];


    const customBodyDetails =
        bodyData[bodyIdx++];


    if (
        overallBuildIndex > 0
    ) {

        subjectParts.push(

            overallBuildPresets[
                overallBuildIndex - 1
            ].value
        );
    }


    if (
        heightIndex > 0
    ) {

        subjectParts.push(

            heightPresets[
                heightIndex - 1
            ].value
        );
    }


    if (
        chestIndex > 0
    ) {

        subjectParts.push(

            chestPresets[
                chestIndex - 1
            ].value
        );
    }


    if (
        hipIndex > 0
    ) {

        subjectParts.push(

            hipPresets[
                hipIndex - 1
            ].value
        );
    }


    if (
        bodyShapeIndex >= 0
    ) {

        const bodyShape =
            bodyShapePresets[
            bodyShapeIndex
            ];


        if (
            bodyShape &&
            bodyShape.value
        ) {

            subjectParts.push(
                bodyShape.value
            );
        }
    }


    if (
        legIndex > 0
    ) {

        subjectParts.push(

            legPresets[
                legIndex - 1
            ].value
        );
    }


    if (
        assSizeIndex > 0
    ) {

        subjectParts.push(

            assSizePresets[
                assSizeIndex - 1
            ].value
        );
    }


    if (
        bellySizeIndex > 0
    ) {

        subjectParts.push(

            bellySizePresets[
                bellySizeIndex - 1
            ].value
        );
    }


    if (
        specificBodyIndex >= 0
    ) {

        const specificBody =
            specificBodyPresets[
            specificBodyIndex
            ];


        if (
            specificBody &&
            specificBody.value
        ) {

            subjectParts.push(
                specificBody.value
            );
        }
    }


    if (
        customBodyDetails
    ) {

        subjectParts.push(
            customBodyDetails
        );
    }


    const appearanceData =
        inputs[sectionIdx++];


    let appIdx = 0;


    for (
        let j = 0;
        j < makeupPresets.length;
        j++
    ) {

        if (
            appearanceData[appIdx++]
        ) {

            subjectParts.push(
                makeupPresets[j]
            );
        }
    }


    for (
        let j = 0;
        j < tattooPresets.length;
        j++
    ) {

        if (
            appearanceData[appIdx++]
        ) {

            subjectParts.push(
                tattooPresets[j]
            );
        }
    }


    for (
        let j = 0;
        j < bodyHairPresets.length;
        j++
    ) {

        if (
            appearanceData[appIdx++]
        ) {

            subjectParts.push(
                bodyHairPresets[j]
            );
        }
    }


    const hairColorIdx =
        appearanceData[appIdx++];

    const typedHairColor =
        appearanceData[appIdx++];


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


    const hairLengthIdx =
        appearanceData[appIdx++];


    const typedHairLength =
        appearanceData[appIdx++];


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


    const hairstyleIdx =
        appearanceData[appIdx++];


    const typedHairstyle =
        appearanceData[appIdx++];


    const hairstyle =
        typedHairstyle !== ""
            ? typedHairstyle
            : (
                hairstyleIdx > 0
                    ? getHairstyleValue(
                        hairstylePresets[
                        hairstyleIdx - 1
                        ]
                    )
                    : ""
            );


    const hairDescriptionParts = [];


    if (hairLength) {

        hairDescriptionParts.push(
            hairLength
        );
    }


    if (hairstyle) {

        hairDescriptionParts.push(
            hairstyle
        );
    }


    if (hairColor) {

        hairDescriptionParts.push(
            hairColor + " hair"
        );
    }


    if (hairDescriptionParts.length > 0) {

        subjectParts.push(
            hairDescriptionParts.join(" ")
        );
    }


    const additionalDetails =
        appearanceData[appIdx++];


    if (
        additionalDetails
    ) {

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


for (
    let i = 0;
    i < outfitCount;
    i++
) {

    const outfitParts = [];


    const outfitMetaData =
        inputs[sectionIdx++];


    let outfitDataIdx = 0;


    const selectedOutfitIdx =
        outfitMetaData[
        outfitDataIdx++
        ];


    if (
        selectedOutfitIdx > 0
    ) {

        outfitParts.push(

            getClothingValue(

                clothingPresets[
                selectedOutfitIdx - 1
                ]
            )
        );
    }


    const customOutfit =
        outfitMetaData[
        outfitDataIdx
        ] || "";


    if (
        customOutfit !== ""
    ) {

        outfitParts.push(
            customOutfit
        );
    }


    for (
        const group of clothingGroups
    ) {

        const groupData =
            inputs[sectionIdx++];


        for (
            let j = 0;
            j < group.presets.length;
            j++
        ) {

            if (
                groupData[j] === true
            ) {

                outfitParts.push(

                    getClothingValue(
                        group.presets[j]
                    )
                );
            }
        }
    }


    outfits.push(
        outfitParts.join(", ")
    );
}


// =========================================
// PARSE ACTIONS
// =========================================

const actions = [];


for (
    let i = 0;
    i < actionCount;
    i++
) {

    const actionParts = [];


    const actionMetaData =
        inputs[sectionIdx++];


    let actionDataIdx = 0;


    const selectedPresetIdx =
        actionMetaData[
        actionDataIdx++
        ];


    if (
        selectedPresetIdx > 0
    ) {

        actionParts.push(

            complexActionPresets[
                selectedPresetIdx - 1
            ].value
        );
    }


    const customActionText =
        actionMetaData[
        actionDataIdx
        ] || "";


    if (
        customActionText !== ""
    ) {

        actionParts.push(
            customActionText
        );
    }


    for (
        const group of actionGroups
    ) {

        const groupData =
            inputs[sectionIdx++];


        for (
            let j = 0;
            j < group.presets.length;
            j++
        ) {

            if (
                groupData[j] === true
            ) {

                actionParts.push(
                    group.presets[j]
                );
            }
        }
    }


    actions.push(
        actionParts.join(", ")
    );
}


// =========================================
// PARSE CAMERA
// =========================================

// -----------------------------------------
// Framing
// -----------------------------------------

const cameraFramingData =
    inputs[sectionIdx++];


const cameraFraming = [];


for (
    let i = 0;
    i < cameraFramingPresets.length;
    i++
) {

    if (
        cameraFramingData[i] === true
    ) {

        cameraFraming.push(
            cameraFramingPresets[i].value
        );
    }
}


// -----------------------------------------
// Perspective
// -----------------------------------------

const cameraPerspectiveData =
    inputs[sectionIdx++];


const cameraPerspective = [];


for (
    let i = 0;
    i < cameraPerspectivePresets.length;
    i++
) {

    if (
        cameraPerspectiveData[i] === true
    ) {

        cameraPerspective.push(
            cameraPerspectivePresets[i].value
        );
    }
}


// -----------------------------------------
// Depth of field
// -----------------------------------------

const depthOfFieldData =
    inputs[sectionIdx++];


const depthOfField = [];


for (
    let i = 0;
    i < depthOfFieldPresets.length;
    i++
) {

    if (
        depthOfFieldData[i] === true
    ) {

        depthOfField.push(
            depthOfFieldPresets[i].value
        );
    }
}


// -----------------------------------------
// Composition
// -----------------------------------------

const cameraCompositionData =
    inputs[sectionIdx++];


const cameraComposition = [];


for (
    let i = 0;
    i < cameraCompositionPresets.length;
    i++
) {

    if (
        cameraCompositionData[i] === true
    ) {

        cameraComposition.push(
            cameraCompositionPresets[i].value
        );
    }
}


// -----------------------------------------
// Combine camera controls
// -----------------------------------------

const cameraParts = [

    ...cameraFraming,

    ...cameraPerspective,

    ...depthOfField,

    ...cameraComposition
];


const camera =
    cameraParts.join(", ");


// =========================================
// PARSE LIGHTING
// =========================================

const timeOfDayData =
    inputs[sectionIdx++];


const timeOfDayIndex =
    timeOfDayData[0];


const timeOfDay =
    timeOfDayIndex > 0
        ? timeOfDayPresets[
            timeOfDayIndex - 1
        ].value
        : "";


const naturalLightingData =
    inputs[sectionIdx++];


const naturalLighting = [];


for (
    let i = 0;
    i < naturalLightingPresets.length;
    i++
) {

    if (
        naturalLightingData[i] === true
    ) {

        naturalLighting.push(
            naturalLightingPresets[i].value
        );
    }
}


const lightingQualityData =
    inputs[sectionIdx++];


const lightingQuality = [];


for (
    let i = 0;
    i < lightingQualityPresets.length;
    i++
) {

    if (
        lightingQualityData[i] === true
    ) {

        lightingQuality.push(
            lightingQualityPresets[i].value
        );
    }
}


const cinematicLightingData =
    inputs[sectionIdx++];


const cinematicLighting = [];


for (
    let i = 0;
    i < cinematicLightingPresets.length;
    i++
) {

    if (
        cinematicLightingData[i] === true
    ) {

        cinematicLighting.push(
            cinematicLightingPresets[i].value
        );
    }
}


const colorLightingData =
    inputs[sectionIdx++];


const colorLighting = [];


for (
    let i = 0;
    i < colorLightingPresets.length;
    i++
) {

    if (
        colorLightingData[i] === true
    ) {

        colorLighting.push(
            colorLightingPresets[i].value
        );
    }
}


const tenebrismLightingData =
    inputs[sectionIdx++];


const tenebrismLighting = [];


for (
    let i = 0;
    i < tenebrismLightingPresets.length;
    i++
) {

    if (
        tenebrismLightingData[i] === true
    ) {

        tenebrismLighting.push(
            tenebrismLightingPresets[i].value
        );
    }
}


const experimentalLightingData =
    inputs[sectionIdx++];


const experimentalLighting = [];


for (
    let i = 0;
    i < experimentalLightingPresets.length;
    i++
) {

    if (
        experimentalLightingData[i] === true
    ) {

        experimentalLighting.push(
            experimentalLightingPresets[i].value
        );
    }
}


const colorTreatmentData =
    inputs[sectionIdx++];


const colorTreatment = [];


for (
    let i = 0;
    i < colorTreatmentPresets.length;
    i++
) {

    if (
        colorTreatmentData[i] === true
    ) {

        colorTreatment.push(
            colorTreatmentPresets[i].value
        );
    }
}


const lightingParts = [

    ...naturalLighting,

    ...lightingQuality,

    ...cinematicLighting,

    ...colorLighting,

    ...tenebrismLighting,

    ...experimentalLighting
];


const lighting =
    lightingParts.join(", ");


const colorTreatmentText =
    colorTreatment.join(", ");


// =========================================
// PARSE PROMPT TEMPLATE
// =========================================

const templateData =
    inputs[sectionIdx++];


const artStyle =
    artStylePresets[
    templateData[0]
    ];


const promptTemplate =
    templateData[1];


// =========================================
// CALCULATE DIMENSIONS
// =========================================

let width = 1024;


let height = 1024;


if (
    aspectIndex === 1
) {

    width = 768;

    height = 1024;
}


if (
    aspectIndex === 2
) {

    width = 1024;

    height = 768;
}


if (
    aspectIndex === 3
) {

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
        subjects[
        subjectIndex
        ];


    const genderForm =
        subjectGenderForms[
        subjectIndex
        ];


    for (
        const outfit of outfits
    ) {

        for (
            const action of actions
        ) {

            let constructedPrompt =

                promptTemplate

                    .replace(
                        /{artStyle}/gi,
                        artStyle || ""
                    )

                    .replace(
                        /{camera}/gi,
                        camera || ""
                    )

                    .replace(
                        /{subject}/gi,
                        subject || ""
                    )

                    .replace(
                        /{subjects}/gi,
                        subject || ""
                    )

                    .replace(
                        /{clothing}/gi,
                        outfit || ""
                    )

                    .replace(
                        /{action}/gi,
                        action || ""
                    )

                    .replace(
                        /{timeOfDay}/gi,
                        timeOfDay || ""
                    )

                    .replace(
                        /{lighting}/gi,
                        lighting || ""
                    )

                    .replace(
                        /{colorTreatment}/gi,
                        colorTreatmentText || ""
                    );


            constructedPrompt =
                constructedPrompt

                    .replace(
                        /,\s*,/g,
                        ","
                    )

                    .replace(
                        /,\s*,/g,
                        ","
                    )

                    .replace(
                        /^\s*,\s*/g,
                        ""
                    )

                    .replace(
                        /\s*,\s*$/g,
                        ""
                    )

                    .replace(
                        /\s{2,}/g,
                        " "
                    )

                    .trim();


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


    for (
        const prompt of finalPrompts
    ) {

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

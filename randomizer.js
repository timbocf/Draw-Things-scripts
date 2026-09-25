//@api-1.0

// =========================================
// KREA 2 RANDOM GENERATOR
// =========================================

// =========================================
// PRESET LISTS
// =========================================

const imageCounts = [1, 3, 5, 10, 20];

const gender = [
    "woman"
];

const artStylePresets = [
    { label: "Photo", value: "photo" },
    { label: "1940s Pinup", value: "1940s era pinup oil painting in the style of Gil Elvgren and Alberto Vargas" },
    { label: "Disney/Pixar Animation", value: "Disney-Pixar style animation with exaggerated features and expressions: large expressive eyes, small noses" },
    { label: "Claymation", value: "Claymation style, sculpted polymer clay figure, soft tactile texture, fingerprint details, handcrafted stop-motion aesthetic, tilt-shift depth of field" },
    { label: "Pop Art/Comic Book", value: "1960s Pop Art style, Roy Lichtenstein aesthetic, bold black ink outlines, sharp Ben-Day dots, vibrant primary colors, graphic retro comic illustration" },
    { label: "Modern Vector/Flat Illustration", value: "Sleek vector illustration, clean lines, minimalist shading, bold flat color palette, mid-century graphic poster art style" },
    { label: "Cyberpunk Anime/Cell-Shaded", value: "90s hand-drawn anime style, classic cell-shading, vibrant neon rim lighting, retro sci-fi aesthetic, detailed line art" },
    { label: "Vintage Pulp Fiction Cover", value: "1950s pulp magazine cover illustration, dramatic chiaroscuro lighting, painted gouache texture, vibrant retro paperback aesthetic" },
    { label: "Oil Painting/Impressionism", value: "Impressionist oil painting, thick impasto brushstrokes, textured canvas, dramatic lighting, rich paint texture in the style of John Singer Sargent" },
    { label: "Watercolors", value: "Soft watercolor painting, fluid ink wash, gentle color bleeding, painterly splatters, delicate lines on textured watercolor paper" },
    { label: "Papercraft/Layered Paper", value: "Layered papercraft illustration, laser-cut paper art, soft drop shadows, clean geometric depth, tactile paper texture" },
    { label: "3D Stylized Game Character", value: "Overwatch/Arcane stylized 3D render, smooth painted textures, dramatic cinematic lighting, semi-realistic proportions, clean character art" },
    { label: "Chibi/Kawaii 3D", value: "Chibi 3D figurine, oversized head, expressive shiny eyes, smooth vinyl toy finish, soft studio lighting" }
];

// --- NATIONALITY / ETHNICITY ---

const nationalityPresets = [
    {
        label: "Caucasian",
        value: "with Western European facial features",
        hairColors: ["blonde", "brunette", "black", "ginger", "ombre", "balayage"],
        skinTones: ["porcelain", "light", "fair", "sun-kissed tan"],
        eyeColors: ["brown", "hazel", "green", "blue", "amber"]
    },
    {
        label: "Black",
        value: "with rich deep skin tone and classic African facial features",
        hairColors: ["dark brown", "black"],
        skinTones: ["rich mocha", "brown", "dark brown", "black", "dark glossy black"],
        eyeColors: ["dark brown", "black", "black with blonde streaks", "dyed blonde"]
    },
    {
        label: "Mexican",
        value: "with prominent Indigenous Mesoamerican facial features, thick dark eyebrows, thick wavy hair, plump lips, and a curvy hourglass figure",
        hairColors: ["dark brown", "black"],
        skinTones: ["warm olive tan", "sun-darkened"],
        eyeColors: ["dark brown", "black", "light brown"]
    },
    {
        label: "Mixed-Race",
        value: "with a natural blend of African and European facial features, softly flared nostrils, a straight natural nose bridge, high defined cheekbones, thick naturally arched eyebrows, thick hair with thick wavy curls, a curvy hourglass figure, and a round ass",
        hairColors: ["dark brown", "black"],
        skinTones: ["deep golden-bronze", "warm olive"],
        eyeColors: ["blue", "dark brown", "light brown", "hazel"]
    },
    {
        label: "Indian",
        value: "with South Asian facial features",
        hairColors: ["dark brown", "black"],
        skinTones: ["deep golden-bronze", "dark tan", "warm brown"],
        eyeColors: ["black", "dark brown"]
    },
    {
        label: "Thai",
        value: "with Southeast Asian facial features",
        hairColors: ["dark brown", "black"],
        skinTones: ["deep golden-bronze", "golden-tan"],
        eyeColors: ["dark brown", "black"]
    },
    {
        label: "Japanese",
        value: "with East Asian facial features",
        hairColors: ["dark brown", "black"],
        skinTones: ["fair", "light", "porcelain"],
        eyeColors: ["dark brown", "black"]
    },
    {
        label: "Korean",
        value: "with fair porcelain skin and East Asian facial features",
        hairColors: ["dark brown", "black"],
        skinTones: ["fair", "porcelain", "light"],
        eyeColors: ["dark brown", "black"]
    },
    {
        label: "Filipina",
        value: "with Southeast Asian facial features",
        hairColors: ["dark brown", "black"],
        skinTones: ["warm tan", "deep golden-bronze"],
        eyeColors: ["dark brown", "black"]
    },
    {
        label: "Italian",
        value: "with Mediterranean facial features",
        hairColors: ["dark brown", "black"],
        skinTones: ["sun-kissed olive", "rich golden hue"],
        eyeColors: ["brown", "blue", "green"]
    },
    {
        label: "Scandinavian",
        value: "with Nordic facial features",
        hairColors: ["blonde"],
        skinTones: ["fair", "light"],
        eyeColors: ["blue", "hazel"]
    },
    {
        label: "Chinese",
        value: "with East Asian facial features",
        hairColors: ["dark brown", "black"],
        skinTones: ["fair", "light", "olive"],
        eyeColors: ["dark brown", "black"]
    },
    {
        label: "Middle Eastern",
        value: "with Middle Eastern facial features",
        hairColors: ["dark brown", "black"],
        skinTones: ["olive", "dark"],
        eyeColors: ["dark brown", "black"]
    },
    {
        label: "French",
        value: "with classic Western European features",
        hairColors: ["light brown", "dark brown", "black"],
        skinTones: ["fair", "light", "sun-kissed tan"],
        eyeColors: ["blue", "brown", "hazel"]
    },
    {
        label: "German",
        value: "with Central European facial features",
        hairColors: ["blonde", "light brown", "dark brown"],
        skinTones: ["fair", "light", "porcelain"],
        eyeColors: ["blue", "hazel", "brown"]
    },
    {
        label: "Irish",
        value: "with freckles and Celtic facial features",
        hairColors: ["ginger", "blonde", "light brown", "dark brown"],
        skinTones: ["porcelain", "fair", "light"],
        eyeColors: ["blue", "hazel", "brown"]
    },

    // Celebrity/Character Presets
    { label: "My Baby", value: "curvy apple-shaped 35-year-old woman with large shapeless drooping breasts, a round ass, long curly 3a black hair, arms covered in red & green rose tattoos, hazel eyes", predefined: true },
    { label: "Anne Hathaway, Long Hair", value: "Anne Hathaway with a tall slim build with long straight black hair, smokey eyes and heavy mascara", predefined: true },
    { label: "Anne Hathaway, Short Hair", value: "Anne Hathaway with a tall slim build with short straight black hair in a textured pixie cut, smokey eyes and heavy mascara", predefined: true },
    { label: "Dolly Parton", value: "young 1970s era Dolly Parton with blown-out blonde hair and bangs", predefined: true },
    { label: "Sabrina Carpenter", value: "Sabrina Carpenter with shoulder length blonde hair", predefined: true },
    { label: "Marilyn Monroe", value: "Marilyn Monroe with shoulder length blonde Hollywood curls", predefined: true },
    { label: "Lisbeth Salander", value: "small petite woman with porcelain skin, a flat chest, narrow hips/shoulders, a short black spiked punk hairstyle shaved on one side, neck tattoos, back tattoos, light body hair, arm and leg tattoos, stacked bracelets, heavy mascara, smokey eyes, eyebrow/lip/septum/nipple/navel piercings, multiple earrings, multiple rings", predefined: true },
    { label: "Curvy Black Woman with Box Braids", value: "a curvy black woman with warm brown skin, long black box braids, neck/back/arm tattoos, heavy mascara, smokey eyes, light body hair, hoop earrings, long fingernails, nose/navel/nipple piercings", predefined: true },
    { label: "Curvy Mexican woman", value: "a curvy Mexican woman with prominent Indigenous Mesoamerican features, olive skin, plump lips, medium-length straight black hair, smokey eyes, heavy mascara, arm/back/neck tattoos, light body hair, hoop earrings, multiple rings, nose/navel/nipple piercings", predefined: true },
    { label: "Mixed race", value: "mixed race with Afro European features, a deep golden-bronze complexion, softly flared nostrils, and a straight natural nose bridge, thick dark brown hair with thick wavy curls, and a round ass.", predefined: true },
    { label: "Petite Korean", value: "small petite Korean woman with short stature, and short straight black hair", predefined: true },
    { label: "Slim Blonde with Pixie Cut", value: "a slim-build woman with porcelain skin, short blonde hair in a textured pixie cut style", predefined: true },
    { label: "Oversized head/eyes, small nose", value: "with an unnaturally large head with large eyes and a tiny button nose", predefined: true },
    { label: "Michelle Obama", value: "Michelle Obama", predefined: true },
    { label: "Betty Boop", value: "Betty Boop", predefined: true },
    { label: "Woman with Achondroplasia", value: "woman with achondroplasia", predefined: true },
    { label: "Pregnant Woman", value: "pregnant woman", predefined: true }

];

// --- AGE ---
const agePresets = [
    "18 years old", "20 years old", "25 years old", "30 years old", "35 years old",
    "40 years old", "45 years old", "50 years old", "55 years old", "60 years old",
    "65 years old", "70 years old", "75 years old", "80 years old", "85 years old"
];

// =========================================
// BODY / PHYSIQUE
// =========================================

const overallBuildPresets = [
    { label: "Slim build", value: "slim build" },
    { label: "Soft Fit Frame", value: "toned athletic frame softened by naturally feminine curves, visible but subtle muscle definition" },
    { label: "Average build", value: "average build" },
    { label: "Petite build", value: "petite build with a small overall frame, narrow hips, short stature, narrow shoulders, thin legs, and flat belly" },
    { label: "Curvy build", value: "curvy build with naturally pronounced feminine curves" },
    { label: "Muscular build", value: "muscular build with clearly developed musculature" },
    { label: "Chubby build", value: "chubby build with a softer, fuller physique" },
    { label: "Large frame", value: "large frame with broad shoulders, thick limbs, and a tall, imposing build" }
];

const heightPresets = [
    { label: "Short", value: "short stature with naturally proportioned overall body proportions" },
    { label: "Average", value: "average height and proportions" },
    { label: "Tall", value: "tall stature, noticeably above-average height, long legs and naturally elongated overall proportions" }
];

const specificBodyPresets = [
    { label: "No specific characteristic", value: "" },
    { label: "Adult with achondroplasia", value: "adult with achondroplasia, characteristic short stature and naturally proportioned body" },
    { label: "Pregnant", value: "pregnant adult with a visibly rounded pregnant belly" },
    { label: "Heavily pregnant", value: "heavily pregnant adult with a large, prominently rounded late-stage pregnancy belly" }
];

const outfitPresets = [
    { label: "Nude", value: "nude" },
    { label: "Loose T-Shirt & Panties", value: "a loose fitting T-shirt and bikini panties" },
    { label: "Bra, Panties, Hello Kitty Socks", value: "a pushup bra, bikini panties, and thigh-high Hello Kitty tube socks" },
    { label: "Bikini, Leather Boots", value: "a string bikini with thigh-high leather boots" },
    { label: "Halter Top, Pleated Shorts", value: "a halter top and pleated shorts" },
    { label: "Silk Pajama Short Set", value: "a silk pajama short set" },
    { label: "Lace Bustier, Garter Belt, Stockings, Heels", value: "a lace bustier, garter belt, thigh-high stockings and stiletto heels" },
    { label: "Unbuttoned Mens Dress Shirt", value: "an unbuttoned mens dress shirt" },
    { label: "Tank Top, Wrap-Around Skirt", value: "a tank top and a wrap-around skirt" },
    { label: "Short Babydoll Dress, Cowboy Boots", value: "a short babydoll dress with cowboy boots" },
    { label: "Racy Sexy Wedding Dress", value: "a racy sexy wedding dress" },
    { label: "Full-Length Wedding Gown", value: "a full-length evening gown" },
    { label: "Lowcut Full-Length Chiffon Dress with Side Pockets", value: "a lowcut full-length chiffon dress with side pockets" },
    { label: "Long Dress with a Slit Down the Side", value: "cut-out dress with a side slit from her waist down" },
    { label: "French Maid Uniform", value: "black French maid uniform with short pleated skirt and white collar and stiletto heels" },
    { label: "Hooters Uniform", value: "Hooters uniform with a tight-fitting white T-shirt with the Hooters logo across the chest and short tight-fitting orange shorts" },
    { label: "Schoolgirl Uniform", value: "a schoolgirl uniform with a short pleated skirt and thigh-high white socks. The shirt is unbuttoned down to her navel, revealing deep cleavage." },
    { label: "Sexy Nurse Uniform", value: "a sexy nurse's uniform, showing ample cleavage, and a nurse's cap" },
    { label: "1940s Dress", value: "1940s WWII-era women's ensemble: A-line tea dress with a fitted waist, padded shoulders, and Victory Roll hairstyle" },
    { label: "1940s Flight Jacket, White Dress", value: "1940s WWII-style leather flight jacket worn over a white dress" },
    { label: "1940s Flight Jacket, Leather Panties", value: "1940s WWII-style leather flight jacket with leather bikini panties" },
    { label: "1940s Sailor Uniform", value: "1940s-style navy sailor uniform with a white collar and navy tie" },
    { label: "1960s Mod Dress", value: "1960s Mod shift dress with a geometric pattern, bold graphic print, and knee-length hem" },
    { label: "1960s Cocktail Dress", value: "1960s cocktail dress with a fitted bodice, flared A-line skirt, and elbow-length gloves" },
    { label: "1960s Beatnik Turtleneck", value: "1960s beatnik turtleneck paired with high-waisted slacks" },
    { label: "1960s Go-Go Dress, White Boots", value: "1960s go-go dress with white go-go boots" },
    { label: "1960s Suit & Skirt", value: "1960s pillbox hat and tailored suit ensemble with a boxy jacket and pencil skirt" }
];

const actionPresets = [
    { label: "laying on a beach", value: "laying on a beach" },
    { label: "standing, looking away from the camera", value: "standing, looking away from the camera" },
    { label: "Wall Pose, Arms Raised", value: "leaning back against a wall, with one knee bent with the foot pressed against the wall, arms raised high above head and hands clasped, lips parted." },
    { label: "Wall Pose, Arms Down", value: "leaning back against a wall, with one knee bent with the foot pressed against the wall, arms at her sides, pressed against the wall, lips parted." },
    { label: "Bed Lean, On Elbows", value: "standing at the edge of a bed, leaning forward, feet on floor, elbows on the bed, pushing her ass toward the camera" },
    { label: "Bed Lean, Face Down", value: "standing at the edge of a bed, leaning forward, feet on floor, one cheek touching the bed, looking to the side at the camera, pushing her ass toward the camera" },
    { label: "On Knees, Facing Camera", value: "on her knees, leaning forward, her face in the foreground, back arched, ass high in the air, arms stretched out in front of her" },
    { label: "Deep Squat, From Below", value: "worms-eye view, squatting with her knees spread wide and on the tips of her toes, hands resting on her knees" },
    { label: "Sitting Cross-Legged", value: "sitting cross-legged on the floor, leaning back slightly on her hands, looking directly into the camera with a relaxed smile" },
    // { label: "Spread Eagle", value: "laying on her back with her legs raised and spread wide, feet wide apart, holding her legs in the air with her hands, looking through her open legs at the camera" },
    { label: "Laying on Back, Legs Straight Up", value: "laying on a bed on her back with her butt at the edge of the bed, her legs straight and elevated into the air, knees locked, bending at waist only" },
    { label: "Shy, Bending Over", value: "leaning forward to grab something off of a lower level of a bookshelf, legs straight, knees locked, bending at waist only, looking at the camera sideways, with her hand covering her mouth and wide-eyed open-mouthed look of surprise" },
    { label: "Shower, From Below", value: "standing and rubbing soapy lather all over her body in the shower with a soapy loofah, water and soap cascading down her nude body, looking up at the water as it streams out of the showerhead, the camera sitting candidly below her looking up", nudeRequired: true },
    { label: "Shower, From Above", value: "standing and rubbing soapy lather all over her body in the shower with a soapy loofah, water and soap cascading down her nude body, her head tilted up and eyes closed as the water streams out of the showerhead onto her face, the camera sitting candidly above her looking down", nudeRequired: true },
    { label: "Shower, with a Man", value: "standing and rubbing soapy lather all over a man's nude body in the shower with a soapy loofah, water streaming out of the showerhead onto their nude bodies", nudeRequired: true },
    { label: "Doorway, Foot Up Against Frame", value: "standing in a bedroom doorway. her back is against one side of the door frame, and one of her feet is elevated to eye-level and the sole of her shoe is pressing against the opposite door frame, putting her knee close to her face." },
    { label: "Doorway, Arms Raised", value: "standing in a bedroom doorway. Her arms are raised above her head, and pressing against either side of the door frame. She is leaning slightly forward." },
    { label: "Doorway, Shyly Touching Lip", value: "standing in a bedroom doorway, she is touching her index finger to her bottom lip with a shy embarrassed smile and biting her bottom lip. her legs are crossed and her free hand is above her head touching the door frame." },
    { label: "Bent Over, Ass Toward the Camera", value: "standing, facing away from the camera, leaning forward, her ass toward the camera, hands on her knees, looking back at the camera, legs straight, knees locked" },
    { label: "Laying on Her Side", value: "lying on her side, with the top leg bent high, hand lightly between her thighs" },
    { label: "Morning Stretch", value: "standing, mid-stretch reaching both arms overhead while rising up on her toes, hands in her hair, back arched, chest pressed forward, shoulders pulled back." },
    { label: "Lying in a Windowsill", value: "lying on her stomach on a sunlit windowsill, chin resting on her hands, legs bent at the knees and crossed at the ankles in the air" },
    { label: "Lying on a Sofa, One Leg Up", value: "lying on her back on a sofa, one leg hooked over the backrest, other foot on the floor" },
    { label: "Lying on a Sofa, One Leg on Armrest", value: "lying on her back on a sofa, one leg resting on opposite armrest, other foot on the floor" },
    { label: "Ass Spread", value: "She is on her knees facing away, looking back over her shoulder while reaching back to spread her ass cheeks apart" },
    { label: "Kneeling in Front of a Fireplace", value: "kneeling on a soft rug in front of a fireplace, hands on her thighs, chest pushed forward, nude, wearing a long pearl necklace and high heels" },
    { label: "Kneeling, Ass Toward Camera", value: "on all fours, head turned to the side, back arched hard, ass toward the camera" },
    { label: "Crawling Toward Camera", value: "crawling toward the camera on all fours" },
    { label: "Leaning Over a Kitchen Counter", value: "standing, leaning over a kitchen counter, resting on elbows, ass pushed out, looking back at camera, nude, wearing only a tiny apron." },
    { label: "Bathroom Mirror Selfie", value: "taking a selfie in a bathroom mirror" },
    { label: "Standing, Mirror, Pulling Hair Up", value: "standing in front of a full-length mirror while pulling her hair up" },
    { label: "Sitting, Mirror", value: "sitting in front of a full-length mirror looking at her reflection" },
    { label: "Putting on Lipstick, Bathroom", value: "standing in a bathroom, leaning over the counter, close to the mirror, applying deep red lipstick. Facing away from the camera." },
    { label: "Smoking Outside", value: "standing, leaning against a glass door on the balcony of a third-floor Manhattan apartment. her legs are crossed and she is smoking a cigarette, blowing the smoke up into the air." }
];

const environments = [
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

const cameraFramingPresets = [
    { label: "None Selected", value: "" },
    { label: "Close-Up", value: "close-up portrait framing" },
    { label: "Head & Shoulders", value: "head-and-shoulders portrait framing" },
    { label: "Chest-Up", value: "chest-up framing" },
    { label: "Waist-Up", value: "waist-up framing" },
    { label: "3/4 Body", value: "three-quarter body framing" },
    { label: "Full Body", value: "full-body framing with the entire subject visible" },
    { label: "Wide Shot", value: "wide shot showing the subject and surrounding environment" },
    { label: "Environmental Portrait", value: "environmental portrait with the subject integrated into the surrounding scene" }
];

const cameraAnglePresets = [
    { label: "None Selected", value: "" },

    { label: "Eye Level", value: "natural eye-level camera angle" },
    { label: "Low Angle", value: "low-angle view looking upward toward the subject" },
    { label: "Worm's-Eye", value: "extreme low-angle worm's-eye view" },
    { label: "High Angle", value: "high-angle view looking downward toward the subject" },
    { label: "Overhead", value: "directly overhead camera view looking down at the subject" },

    { label: "Side View", value: "side-view perspective" },
    { label: "3/4 View", value: "three-quarter view of the subject from an oblique angle" },
    { label: "Over-the-Shoulder", value: "over-the-shoulder camera view" },
    { label: "POV", value: "first-person point-of-view perspective" },

    { label: "Dutch Angle", value: "tilted Dutch-angle composition" }
];

const timeOfDayPresets = [
    { label: "None Selected", value: "" },

    { label: "Dawn", value: "soft early-morning dawn light" },
    { label: "Morning", value: "soft natural morning light" },
    { label: "Midday", value: "bright midday daylight with the sun high overhead" },
    { label: "Late Afternoon", value: "warm late-afternoon daylight with lengthening shadows" },
    { label: "Golden Hour", value: "warm golden-hour sunlight with a low sun and long soft shadows" },
    { label: "Blue Hour", value: "cool blue-hour ambient light shortly after sunset" },
    { label: "Night", value: "nighttime ambient lighting with dark surroundings" }
];

// =========================================
// LIGHTING
// Light source, diffusion and direction
// =========================================

const lightingPresets = [
    { label: "None Selected", value: "" },

    { label: "Soft Natural Light", value: "soft natural illumination with gentle shadows" },
    { label: "Direct Sunlight", value: "direct sunlight with strong highlights and defined shadows" },
    { label: "Overcast / Diffused", value: "broad diffused natural light with soft even illumination" },

    { label: "Window Light", value: "soft directional natural light entering through a window" },
    { label: "Window Light Through Sheer Curtains", value: "natural window light filtered through sheer curtains, creating soft diffused illumination and delicate shadows" },

    { label: "Dappled Light", value: "dappled natural light creating irregular patches of light and shadow" },

    { label: "Warm Indoor Lamps", value: "warm practical lamp lighting with natural interior ambience" },
    { label: "Candlelight / Firelight", value: "warm flickering candlelight and firelight with soft surrounding shadows" },
    { label: "Urban Neon", value: "colorful neon and street lighting with nighttime urban ambience" },

    { label: "Soft Studio Light", value: "soft flattering studio illumination with gentle shadows" },
    { label: "Hard Directional Light", value: "hard directional illumination with crisp defined shadows" },
    { label: "Side Lighting", value: "directional side lighting emphasizing form and dimensionality" },
    { label: "Backlighting", value: "strong backlighting with the primary light positioned behind the subject" },
    { label: "Rim Lighting", value: "bright rim lighting outlining the subject against the background" },
    { label: "Low-Key / Chiaroscuro", value: "dramatic low-key lighting with chiaroscuro and deep shadows" },
    { label: "Volumetric Rays", value: "visible volumetric light rays passing through a subtly hazy atmosphere" }
];

const photographicLookPresets = [
    { label: "None Selected", value: "" },

    { label: "Black & White", value: "black-and-white photographic treatment" },
    { label: "High-Contrast Noir", value: "high-contrast black-and-white noir photography with deep blacks and dramatic tonal separation" },
    { label: "Soft Monochrome", value: "soft monochrome photographic treatment with gentle tonal transitions" },
    { label: "Sepia", value: "warm sepia-toned photographic treatment" },

    { label: "1930s Early Color Film", value: "1930s early color-film aesthetic with muted tones and classic pre-war photographic softness" },
    { label: "1940s Kodachrome", value: "1940s Kodachrome-inspired photography with rich saturated color and gentle vintage contrast" },
    { label: "1950s Magazine", value: "1950s glossy magazine photography with polished tones, subtle bloom, and clean mid-century color" },
    { label: "1960s Slide Film", value: "1960s slide-film photography with vibrant saturated color and crisp vintage rendering" },
    { label: "1970s Polaroid", value: "1970s Polaroid snapshot aesthetic with warm tones, soft contrast, and instant-film color drift" },
    { label: "1980s VHS", value: "1980s VHS aesthetic with analog softness, washed color, and subtle magnetic video noise" },
    { label: "1990s Film", value: "1990s consumer film photography with natural color, smooth tonal transitions, and nostalgic analog character" },
    { label: "2000s Disposable Camera", value: "2000s disposable-camera snapshot aesthetic with direct-flash character, slight color cast, soft focus, and inexpensive film imperfections" }
];



function randomize(array) {
    return array[Math.floor(Math.random() * array.length)];
}

const promptSelections = requestFromUser("Select from the dropdowns or randomize them", "Generate", function () {
    return [

        // Number of Images to Generate
        this.section(
            "Number of Images to Generate",
            "Select from the dropdown:",
            [
                this.menu(0, [
                    "1 image",
                    "3 images",
                    "5 images",
                    "10 images",
                    "20 images"
                ])
            ]
        ),

        // Lora or no Lora??
        this.section(
            "Loras",
            "Select whether to use loras to bypass safety filters: ",
            [
                this.switch(false, "Use LoRAs")
            ]
        ),

        // Art Styles
        this.section(
            "Art Style",
            "Select the artistic medium: ",
            [
                this.menu(0, artStylePresets.map(item => item.label))
            ]
        ),

        // Subject-Nationality
        this.section(
            "Nationality",
            "Choose a nationality:",
            [
                this.menu(0, [
                    "Random Selection",
                    ...nationalityPresets.map(item => item.label)
                ]
                )
            ]
        ),

        // Age
        this.section(
            "Age",
            "Select an age:",
            [
                this.menu(0, [
                    "Random Selection",
                    ...agePresets
                ])
            ]
        ),

        // Overall Build
        this.section(
            "Body Type",
            "Select a body type:",
            [
                this.menu(0, [
                    "Random Selection",
                    ...overallBuildPresets.map(item => item.label)
                ])
            ]
        ),

        // Outfit
        this.section(
            "Outfit",
            "Select a clothing ensemble:",
            [
                this.menu(0, [
                    "Random Selection",
                    ...outfitPresets.map(item => item.label)
                ])
            ]
        ),

        // Action
        this.section(
            "Action",
            "Select an action:",
            [
                this.menu(0, [
                    "Random Selection",
                    ...actionPresets.map(item => item.label)
                ])
            ]
        ),

        // Camera Framing
        this.section(
            "Camera Framing",
            "Choose how tightly the subject is framed:",
            [
                this.menu(0, cameraFramingPresets.map(item => item.label))
            ]
        ),

        // Camera Angle
        this.section(
            "Camera Angle",
            "Choose the camera position and viewing angle:",
            [
                this.menu(0, cameraAnglePresets.map(item => item.label))
            ]
        ),

        // Time of Day
        this.section(
            "Time of Day",
            "Choose an optional time of day:",
            [
                this.menu(0, timeOfDayPresets.map(item => item.label))
            ]
        ),

        // Lighting
        this.section(
            "Lighting",
            "Choose an optional lighting setup:",
            [
                this.menu(0, lightingPresets.map(item => item.label))
            ]
        ),

        // Photographic Look
        this.section(
            "Photographic Look",
            "Choose an optional film or photographic aesthetic:",
            [
                this.menu(0, photographicLookPresets.map(item => item.label))
            ]
        ),

    ]
});

async function generateBatch() {

    canvas.clear();

    let imagePrompt;
    let artStyle = artStylePresets[promptSelections[2][0]].value;
    let nationality;
    let hairColor;
    let skinTone;
    let age;
    let eyeColor;
    let overallBuild;
    let outfit;
    let action;
    let cameraFraming = cameraFramingPresets[promptSelections[8][0]].value;
    let cameraAngle = cameraAnglePresets[promptSelections[9][0]].value;
    let timeOfDay = timeOfDayPresets[promptSelections[10][0]].value;
    let lighting = lightingPresets[promptSelections[11][0]].value;
    let photographicLook = photographicLookPresets[promptSelections[12][0]].value;

    const cameraLightingPrompt = [
        cameraFraming,
        cameraAngle,
        timeOfDay,
        lighting,
        photographicLook
    ].filter(Boolean).join(", ");

    let optionalPrompt = cameraLightingPrompt ? " " + cameraLightingPrompt + "." : "";

    if (promptSelections[3][0] === 0) {
        nationality = randomize(nationalityPresets);
    } else {
        nationality = nationalityPresets[promptSelections[3][0] - 1];
    }

    if (promptSelections[4][0] === 0) {
        age = randomize(agePresets);
    } else {
        age = agePresets[promptSelections[4][0] - 1];
    }

    if (promptSelections[5][0] === 0) {
        overallBuild = randomize(overallBuildPresets);
    } else {
        overallBuild = overallBuildPresets[promptSelections[5][0] - 1];
    }
    if (promptSelections[6][0] === 0) {
        outfit = randomize(outfitPresets).value;
    } else {
        outfit = outfitPresets[promptSelections[6][0] - 1].value;
    }

    if (promptSelections[7][0] === 0) {
        action = randomize(actionPresets);
    } else {
        action = actionPresets[promptSelections[7][0] - 1];
    }

    console.log(action);

    if (action.nudeRequired === true) {
        outfit = "nude";
    }

    // PROMPT TEMPLATE
    if (nationality.predefined) {
        // Celebrity
        imagePrompt = "A " + artStyle + " of " + nationality.value + ", " + action.value + ", wearing " + outfit + ". " + optionalPrompt + " Natural anatomy.";
    } else {
        hairColor = randomize(nationality.hairColors);
        skinTone = randomize(nationality.skinTones);
        eyeColor = randomize(nationality.eyeColors);
        imagePrompt = "A " + artStyle + " of a " + age + " " + nationality.label + " " + gender + " with " + skinTone + " skin, " + hairColor + " hair and " + nationality.value + ", " + action.value + ", wearing " + outfit + ". She has a " + overallBuild.value + " and " + eyeColor + " eyes." + optionalPrompt + " Natural anatomy.";
    }
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

    if (promptSelections[1][0]) {
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
    } else {
        config.loras = [];
    }

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
const imageCount = imageCounts[promptSelections[0][0]];

async function runBatch() {
    for (var i = 0; i < imageCount; i++) {
        await generateBatch();
    }
    console.log("Batch Finished!");
}

console.log("promptSelections:", promptSelections);
console.log("imageCount:", imageCount);

runBatch();

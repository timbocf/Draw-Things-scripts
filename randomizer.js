//@api-1.0

// =========================================
// KREA 2 RANDOM GENERATOR
// =========================================

// =========================================
// PRESET LISTS
// =========================================

const gender = [
    "woman"
];

// Celebrity Presets

const celebrityPresets = [
    { label: "None Selected", value: "" },
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
        label: "Brazilian",
        value: "with a blend of European, African, and Indigenous features",
        hairColors: ["light brown", "dark brown", "black"],
        skinTones: ["sun-kissed olive", "deep golden-bronze"],
        eyeColors: ["dark brown", "black", "light brown", "hazel", "green"]
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
        label: "Russian/Eastern European",
        value: "with Slavic facial features",
        hairColors: ["blonde", "light brown", "dark brown", "black"],
        skinTones: ["fair", "light", "sun-kissed tan"],
        eyeColors: ["blue", "brown"]
    },
    {
        label: "Chinese",
        value: "with East Asian facial features",
        hairColors: ["dark brown", "black"],
        skinTones: ["fair", "light", "olive"],
        eyeColors: ["dark brown", "black"]
    },
    {
        label: "Vietnamese",
        value: "with Southeast Asian facial features",
        hairColors: ["dark brown", "black"],
        skinTones: ["warm tan", "olive", "sun-kissed tan"],
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
    {
        label: "Native American",
        value: "with Indigenous American facial features",
        hairColors: ["dark brown", "black"],
        skinTones: ["warm bronze", "sun-kissed olive"],
        eyeColors: ["dark brown", "black"]
    },
    {
        label: "Polynesian/Pacific Islander",
        value: "with Polynesian facial features",
        hairColors: ["dark brown", "black"],
        skinTones: ["warm brown", "sun-kissed olive"],
        eyeColors: ["dark brown", "black"]
    },
    {
        label: "Ethiopian/East African",
        value: "with East African facial features",
        hairColors: ["dark brown", "black", "dark glossy black"],
        skinTones: ["deep brown", "black", "deep glossy black"],
        eyeColors: ["dark brown", "black"]
    },
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
    { label: "Lowcut Full-Length Sheer Dress with Side Pockets", value: "a lowcut full-length sheer dress with side pockets" },
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
    { label: "Spread Eagle", value: "laying on her back with her legs raised and spread wide, feet wide apart, holding her legs in the air with her hands, looking through her open legs at the camera" },
    { label: "Laying on Back, Legs Straight Up", value: "laying on a bed on her back with her butt at the edge of the bed, her legs straight and elevated into the air, knees locked, bending at waist only" },
    { label: "Shy, Bending Over", value: "leaning forward to grab something off of a lower level of a bookshelf, legs straight, knees locked, bending at waist only, looking at the camera sideways, with her hand covering her mouth and wide-eyed open-mouthed look of surprise" },
    { label: "Shower, From Below", value: "standing and rubbing soapy lather all over her body in the shower with a soapy loofah, water and soap cascading down her nude body, looking up at the water as it streams out of the showerhead, the camera sitting candidly below her looking up" },
    { label: "Shower, From Above", value: "standing and rubbing soapy lather all over her body in the shower with a soapy loofah, water and soap cascading down her nude body, her head tilted up and eyes closed as the water streams out of the showerhead onto her head and body, the camera sitting candidly above her looking down" },
    { label: "Shower, with a Man", value: "standing and rubbing soapy lather all over a man's nude body in the shower with a soapy loofah, water streaming out of the showerhead onto their nude bodies" },
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

function randomize(array) {
    return array[Math.floor(Math.random() * array.length)];
}

const imageCounts = [3, 5, 10, 20];

const promptSelections = requestFromUser("Select from the dropdowns or randomize them", "Generate", function () {
    return [

        // Number of Images to Generate
        this.plainText("Number of Images to Generate"),
        this.menu(0, [
            "3 images",
            "5 images",
            "10 images",
            "20 images"
        ]),

        // Celebrity Presets
        this.plainText("Celebrity Presets"),
        this.menu(0, celebrityPresets.map(item => item.label)),

        // Subject-Nationality
        this.plainText("Nationality"),
        this.menu(0, [
            "Random Selection",
            ...nationalityPresets.map(item => item.label)
        ]),

        // Age
        this.plainText("Age"),
        this.menu(0, [
            "Random Selection",
            ...agePresets
        ]),

        // Overall Build
        this.plainText("Body Type"),
        this.menu(0, [
            "Random Selection",
            ...overallBuildPresets.map(item => item.label)
        ]),

        // Outfit
        this.plainText("Outfit"),
        this.menu(0, [
            "Random Selection",
            ...outfitPresets.map(item => item.label)
        ]),

        // Action
        this.plainText("Action"),
        this.menu(0, [
            "Random Selection",
            ...actionPresets.map(item => item.label)
        ])
    ]
})

async function generateBatch() {

    canvas.clear();

    let imagePrompt;
    let celebrity;
    let nationality;
    let hairColor;
    let skinTone;
    let age;
    let eyeColor;
    let overallBuild;
    let outfit;
    let action;

    if (promptSelections[3] > 0) {
        celebrity = celebrityPresets[promptSelections[3]].value;
    } else {

        if (promptSelections[5] === 0) {
            nationality = randomize(nationalityPresets);
        } else {
            nationality = nationalityPresets[promptSelections[5] - 1];
        }

        hairColor = randomize(nationality.hairColors);
        skinTone = randomize(nationality.skinTones);
        eyeColor = randomize(nationality.eyeColors);

        if (promptSelections[7] === 0) {
            age = randomize(agePresets);
        } else {
            age = agePresets[promptSelections[7] - 1];
        }

        if (promptSelections[9] === 0) {
            overallBuild = randomize(overallBuildPresets);
        } else {
            overallBuild = overallBuildPresets[promptSelections[9] - 1];
        }
    }

    if (promptSelections[11] === 0) {
        outfit = randomize(outfitPresets).value;
    } else {
        outfit = outfitPresets[promptSelections[11] - 1].value;
    }

    if (promptSelections[13] === 0) {
        action = randomize(actionPresets).value;
    } else {
        action = actionPresets[promptSelections[13] - 1].value;
    }

    if (celebrity) {
        imagePrompt = "A photo of " + celebrity + ", " + action + ", wearing " + outfit + ". Natural anatomy."
    } else {
        imagePrompt = "A photo of a " + age + " " + nationality.label + " " + gender + " with " + skinTone + " skin, " + hairColor + " hair and " + nationality.value + ", " + action + ", wearing " + outfit + ". She has a " + overallBuild.value + " and " + eyeColor + " eyes. Natural anatomy.";
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

    //    config.loras = [
    //        {
    //            mode: "all",
    //            file: "pornmaster_uncensored_krea2_v1_lora_f16.ckpt",
    //            weight: 1.0
    //        ,
    //        {
    //            mode: "all",
    //            file: "mysticxxx_krea2_v3_lora_f16.ckpt",
    //            weight: 0.6
    //        }
    //    ];

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

const imageCount = imageCounts[promptSelections[1]];

async function runBatch() {
    for (var i = 0; i < imageCount; i++) {
        await generateBatch();
    }
    console.log("Batch Finished!");
}

runBatch();

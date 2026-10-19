//@api-1.0

// =========================================
// KREA 2 RANDOM GENERATOR
// =========================================

// =========================================
// PRESET LISTS
// =========================================

const imageCounts = [1, 3, 5, 10, 20];

let gender = "woman";


// ART STYLE
const visualPresets = {
    pinup1940s: {
        label: "1940s Pinup",
        era: "1940s",

        variants: {

            painting: {
                label: "Oil Painting",
                value: "1940s era pinup oil painting in the style of Gil Elvgren and Alberto Vargas"
            },

            photo: {
                label: "Photography",
                value: "1940s vintage pinup photograph"
            }
        },

        cameraAngles: [
            "Eye Level",
            "Low Angle"
        ],

        cameraFraming: [
            "Full Body",
            "3/4 Body"
        ],

        lighting: [
            "Soft Studio Light"
        ],

        photographicLook: [
            "1940s Kodachrome"
        ],

        scenes: [],
        environments: []
    }
};

// ERA PRESETS
const eraPresets = {
    "1920s": {
        outfits: [],
        hairstyles: [
            {
                label: "1920s Flapper Bob",
                value: "chin-length 1920s flapper bob with sleek sculpted finger waves"
            }
        ]
    },

    "1930s": {
        outfits: [],
        hairstyles: [
            {
                label: "1930s Finger Waves",
                value: "short hair styled in sculpted finger waves",
            },
            {
                label: "1930s Marcel Waves",
                value: "shoulder-length hair styled in soft Marcel waves",
            },
            {
                label: "1930s Side-Parted Waves",
                value: "medium-length hair with a deep side part and smooth sculpted waves",
            },
            {
                label: "1930s Wavy Bob",
                value: "chin-length bob styled in soft polished waves",
            }
        ]
    },

    "1940s": {
        outfits: [
            {
                label: "1940s A-line Tea Dress",
                value: "1940s WWII-era women's ensemble: A-line tea dress with a fitted waist, and padded shoulders"
            },
            {
                label: "1940s Leather Flight Jacket, White Dress",
                value: "1940s WWII-style leather flight jacket worn over a white dress"
            },
            {
                label: "1940s Sailor Uniform",
                value: "1940s WWII-style Navy sailor uniform with a white collar and navy tie"
            }
        ],
        hairstyles: [
            {
                label: "1940s Victory Rolls",
                value: "hair styled in large polished Victory Rolls"
            },
            {
                label: "1940s Hollywood Curls",
                value: "shoulder-length hair styled in glamorous soft Hollywood curls"
            },
            {
                label: "1940s Side-Swept Waves",
                value: "shoulder-length hair styled in glossy side-swept waves with a deep side part"
            },
            {
                label: "1940s Pin Curls",
                value: "hair arranged in carefully sculpted pin curls"
            },
            {
                label: "1940s Rolled Updo",
                value: "hair swept up into a structured 1940s rolled updo"
            },
            {
                label: "Full-Length Wedding Gown",
                value: "a full-length evening gown"
            }
        ],
    },

    "pinup1940s": {
        outfits: [
            {
                label: "Unbuttoned Mens Dress Shirt",
                value: "an unbuttoned mens dress shirt"
            },
            {
                label: "1940s Leather Flight Jacket, Panties",
                value: "1940s WWII-style leather flight jacket with leather bikini panties"
            },
            {
                label: "1940s Sailor Uniform",
                value: "1940s WWII-style Navy sailor uniform with a white collar and navy tie"
            },
            {
                label: "French Maid Uniform",
                value: "black French maid uniform with short pleated skirt and white collar and stiletto heels"
            },
            {
                label: "Schoolgirl Uniform",
                value: "a schoolgirl uniform with a short pleated skirt and thigh-high white socks. The shirt is unbuttoned down to her navel, revealing deep cleavage."
            },
            {
                label: "Sexy Nurse Uniform",
                value: "a sexy nurse's uniform, showing ample cleavage, and a nurse's cap"
            },
            {
                label: "Loose T-Shirt & Panties",
                value: "a loose fitting T-shirt and bikini panties"
            },
            {
                label: "Bra & Panties",
                value: "a bra and panties, barefoot"
            },
            {
                label: "Bra & Panties, Stiletto Heels",
                value: "a bra and panties with stiletto heels"
            },
            {
                label: "Halter Top, Pleated Shorts",
                value: "a halter top and pleated shorts"
            },
            {
                label: "Silk Pajama Short Set",
                value: "a silk pajama short set"
            },
            {
                label: "Lace Bustier, Garter Belt, Stockings, Heels",
                value: "a lace bustier, garter belt, thigh-high stockings and stiletto heels"
            }
        ],
        hairstyles: [],
        actions: [
            {
                label: "laying on a beach",
                value: "laying on a beach",
                aspectRatios: ["landscape", "square"],
                tags: ["pinup", "laying", "beach"]
            },
            {
                label: "Leaning Over a Kitchen Counter",
                value: "standing, leaning over a kitchen counter, resting on elbows, ass pushed out, looking back at camera, wearing an apron.",
                aspectRatios: ["square", "portrait"],
                tags: ["pinup", "boudoir", "standing", "kitchen"]
            },
            {
                label: "sitting on the floor, knees drawn up",
                value: "She is sitting on the floor with her knees drawn to her chest. She is smiling at the camera, and her head is tilted upward.",
                aspectRatios: ["square", "portrait", "landscape"],
                tags: ["1940s", "pinup", "sitting"]
            },
            {
                label: "Laying on Her Side",
                value: "lying on her side, with the top leg bent high, hand lightly between her thighs",
                tags: ["pinup", "boudoir", "laying"]
            },
            {
                label: "Morning Stretch",
                value: "standing, mid-stretch reaching both arms overhead while rising up on her toes, hands in her hair, back arched, chest pressed forward, shoulders pulled back.",
                aspectRatios: ["square", "portrait"],
                tags: ["pinup", "boudoir", "standing"]
            },
            {
                label: "Lying in a Windowsill",
                value: "lying on her stomach on a sunlit windowsill, chin resting on her hands, legs bent at the knees and crossed at the ankles in the air",
                aspectRatios: ["landscape", "square"],
                tags: ["pinup", "boudoir", "laying"]
            },
            {
                label: "Lying on a Sofa, One Leg Up",
                value: "lying on her back on a sofa, one leg hooked over the backrest, other foot on the floor",
                aspectRatios: ["square", "landscape"],
                tags: ["pinup", "boudoir", "laying"]
            },
            {
                label: "Lying on a Sofa, One Leg on Armrest",
                value: "lying on her back on a sofa, one leg resting on opposite armrest, other foot on the floor",
                aspectRatios: ["square", "landscape"],
                tags: ["pinup", "boudoir", "laying"]
            },
            {
                label: "Putting on Lipstick, Bathroom",
                value: "standing in a bathroom, leaning over the counter, close to the mirror, applying deep red lipstick. Facing away from the camera.",
                tags: ["pinup", "boudoir", "standing"]
            },
            {
                label: "Standing, Hands on Hips",
                value: "standing with her feet shoulder-width apart, with her hands on her hips",
                tags: ["pinup", "standing"]
            },
            {
                label: "Shy, Bending Over",
                value: "leaning forward to grab something off of a lower level of a bookshelf, legs straight, knees locked, bending at waist only, looking at the camera sideways, with her hand covering her mouth and wide-eyed open-mouthed look of surprise",
                aspectRatios: ["square"],
                tags: ["pinup", "standing"]
            }
        ]
    },

    "1950s": {
        outfits: [],
        hairstyles: [
            {
                label: "Pixie Cut",
                value: "short textured pixie cut",
            },
            {
                label: "1950s Poodle Cut",
                value: "short hair styled in a tightly curled 1950s poodle cut"
            },
            {
                label: "1950s Pageboy",
                value: "smooth shoulder-length pageboy hairstyle with curled-under ends"
            },
            {
                label: "1950s Short Softly Curled",
                value: "short softly curled 1950s hairstyle"
            },
            {
                label: "1950s Ponytail with Softly Curled Ends",
                value: "hair pulled into a high 1950s ponytail with softly curled ends"
            },
            {
                label: "1950s Polished Glamorous Waves",
                value: "shoulder-length hair styled in polished glamorous waves"
            },
            {
                label: "Full-Length Wedding Gown",
                value: "a full-length evening gown"
            }

        ],
        scenePresets: [
            {
                label: "1950s Diner — After Midnight",
                value: "Inside a nearly empty 1950s American diner at night. Red vinyl booths, chrome fixtures, checkerboard floor, warm overhead pendant lights and colored neon glowing through the windows. Nostalgic Kodachrome-inspired color palette."
            },
            {
                label: "Retro Laundromat — Fluorescent Lighting",
                value: "Rows of chrome washing machines, pale green fluorescent lighting, reflections in glass doors and a slightly eerie atmosphere."
            }
        ]
    },

    "1960s": {
        outfits: [
            {
                label: "1960s Mod Dress",
                value: "1960s Mod shift dress with a geometric pattern, bold graphic print, and knee-length hem",
            },
            {
                label: "1960s Cocktail Dress",
                value: "1960s cocktail dress with a fitted bodice, flared A-line skirt, and elbow-length gloves"
            },
            {
                label: "1960s Beatnik Turtleneck",
                value: "1960s beatnik turtleneck paired with high-waisted slacks"
            },
            {
                label: "1960s Go-Go Dress, White Boots",
                value: "1960s go-go dress with white go-go boots"
            },
            {
                label: "1960s Suit & Skirt",
                value: "1960s pillbox hat and tailored suit ensemble with a boxy jacket and pencil skirt"
            },
            {
                label: "Bikini, Leather Boots",
                value: "a string bikini with thigh-high leather boots"
            }
        ],
        hairstyles: [
            {
                label: "Pixie Cut",
                value: "short textured pixie cut",
            },
            {
                label: "1960s Beehive",
                value: "hair styled in a tall voluminous 1960s beehive",
            },
            {
                label: "1960s Bouffant",
                value: "hair styled in a full rounded bouffant with substantial crown volume",
            },
            {
                label: "1960s Flipped Bob",
                value: "short bob with smooth volume and dramatically flipped-out ends",
            },
            {
                label: "1960s Mod Bob",
                value: "sleek geometric 1960s mod bob",
            },
            {
                label: "1960s Long Straight Hair",
                value: "long straight center-parted hair in a late-1960s style",
            }
        ]
    },

    "1970s": {
        outfits: [],
        hairstyles: [
            {
                label: "1970s Feathered Hair",
                value: "voluminous feathered 1970s hair with layers swept away from the face",
            },
            {
                label: "1970s Shag",
                value: "layered 1970s shag haircut with textured feathered ends",
            },
            {
                label: "1970s Long Center-Parted Hair",
                value: "long naturally flowing hair with a straight center part",
            },
            {
                label: "1970s Afro",
                value: "full rounded natural 1970s Afro hairstyle",
            },
            {
                label: "1970s Disco Curls",
                value: "voluminous shoulder-length disco curls",
            }
        ]
    },

    "1980s": {
        outfits: [
            {
                label: "Daisy Dukes",
                value: "a string bikini top with a pattern resembling the Confederate flag, a flannel pattern shirt tied around her torso, very short cutoff jean shorts and cowboy boots"
            }
        ],
        hairstyles: [
            {
                label: "1980s Big Hair",
                value: "huge voluminous 1980s hair with teased roots and dramatic volume",
            },
            {
                label: "1980s Feathered Hair",
                value: "voluminous layered feathered hair swept dramatically away from the face",
            },
            {
                label: "1980s Side Ponytail",
                value: "high side ponytail with teased volume",
            },
            {
                label: "1980s Perm",
                value: "voluminous tightly permed shoulder-length hair",
            },
            {
                label: "1980s Crimped Hair",
                value: "long voluminous crimped hair with teased volume",
            }
        ]
    },

    "1990s": {
        outfits: [],
        hairstyles: [
            {
                label: "1990s Rachel Cut",
                value: "shoulder-length layered blowout with face-framing layers and flipped ends",
            },
            {
                label: "1990s Pixie Cut",
                value: "short textured 1990s pixie cut",
            },
            {
                label: "1990s Face-Framing Layers",
                value: "medium-length hair with prominent face-framing layers",
            },
            {
                label: "1990s High Ponytail",
                value: "high ponytail with loose face-framing strands",
            },
            {
                label: "1990s Messy Updo",
                value: "casual messy updo with loose face-framing strands",
            }
        ]
    },

    "2000s": {
        outfits: [
            {
                label: "Hooters Uniform",
                value: "Hooters uniform with a tight-fitting white T-shirt with the Hooters logo across the chest and short tight-fitting orange shorts"
            },
            {
                label: "Bra & Panties, Hello Kitty Socks",
                value: "a pushup bra, bikini panties, and thigh-high Hello Kitty tube socks"
            },
            {
                label: "Short Babydoll Dress, Cowboy Boots",
                value: "a short babydoll dress with cowboy boots"
            },
            {
                label: "Racy Sexy Wedding Dress",
                value: "a racy sexy wedding dress"
            },
            {
                label: "Unbuttoned Mens Dress Shirt",
                value: "an unbuttoned mens dress shirt"
            },
            {
                label: "Full-Length Wedding Gown",
                value: "a full-length evening gown"
            },
            {
                label: "Tank Top, Wrap-Around Skirt",
                value: "a tank top and a wrap-around skirt"
            },
            {
                label: "Lowcut Full-Length Chiffon Dress with Side Pockets",
                value: "a lowcut full-length chiffon dress with side pockets"
            },
            {
                label: "Long Dress with a Slit Down the Side",
                value: "cut-out dress with a side slit from her waist down"
            }
        ],
        hairstyles: [
            {
                label: "Pixie Cut",
                value: "short textured pixie cut",
            },
            {
                label: "2000s Straight Layers",
                value: "long pin-straight layered hair with face-framing pieces",
            },
            {
                label: "2000s Side-Swept Bangs",
                value: "long layered hair with dramatic side-swept bangs",
            },
            {
                label: "2000s Chunky Layers",
                value: "long layered hair with chunky face-framing sections",
            },
            {
                label: "2000s Messy Bun",
                value: "casual messy bun with loose face-framing strands",
            },
            {
                label: "2000s Crimped Hair",
                value: "long partially crimped hair with pronounced textured waves",
            }
        ],
        scenePresets: [
            {
                label: "Selfie at Coachella",
                value: "standing in front of a crowd of people near a stage at the Coachella music festival. A band is playing on the stage in the background. One of the woman's arms is extended upward toward the bottom right corner of the frame. Extreme foreshortening. The woman is posing for a picture, 1/4 turn toward the camera. One hand is above her head with her fingers teasing out her hair.",
                selfiePhoto: true,
                tags: ["2000s", "festival"]
            },
            {
                label: "Facedown Selfie, on a Bed",
                value: "laying facedown on a bed, kicking her feet in the air. She is looking at the camera at the end of her outstretched arm looking lengthwise down her body",
                tags: ["pinup", "laying", "bedroom"]
            },
            {
                label: "Standing, Looking Away from the Camera",
                value: "standing, looking away from the camera",
                tags: ["standing"]
            },
            {
                label: "Wall Pose, Arms Raised",
                value: "standing while leaning back against a wall, with her arms raised high above her head and hands clasped, lips parted",
                aspectRatios: ["portrait", "square"],
                tags: ["pinup", "boudoir", "standing"]
            },
            {
                label: "Wall Pose, Arms Down",
                value: "standing while leaning back against a wall, with one knee bent with the foot pressed against the wall, arms at her sides, pressed against the wall, lips parted.",
                aspectRatios: ["portrait", "square"],
                tags: ["boudoir", "standing"]
            },
            {
                label: "Bed Lean, On Elbows",
                value: "standing at the edge of a bed, leaning forward, feet on floor, elbows on the bed, pushing her ass toward the camera",
                tags: ["pinup", "boudoir", "standing"],
                environmentTags: ["bedroom"]
            },
            {
                label: "Bed Lean, Face Down",
                value: "standing at the edge of a bed, leaning forward, feet on floor, one cheek touching the bed, looking to the side at the camera, pushing her ass toward the camera",
                tags: ["pinup", "boudoir", "standing"],
                environmentTags: ["bedroom"]
            },
            {
                label: "On Knees, Facing Camera",
                value: "on her knees, leaning forward, her face in the foreground, back arched, ass high in the air, arms stretched out in front of her",
                aspectRatios: ["square", "portrait"],
                tags: ["boudoir", "laying"]
            },
            {
                label: "Deep Squat, From Below",
                value: "squatting with her knees spread wide and on the tips of her toes, hands resting on her knees",
                tags: ["lowAngleRequired", "squatting", "crouching"],
                aspectRatios: ["landscape", "square"]
            },
            {
                label: "Sitting Cross-Legged",
                value: "sitting cross-legged on the floor, leaning back slightly on her hands, looking directly into the camera with a relaxed smile",
                tags: ["sitting"]
            },
            {
                label: "Shower, From Below",
                value: "standing and rubbing soapy lather all over her body in the shower with a soapy loofah, water and soap cascading down her nude body, looking up at the water as it streams out of the showerhead, the camera sitting candidly below her looking up",
                tags: ["nudeRequired", "standing"],
                environmentTags: ["shower"]
            },
            {
                label: "Shower, From Above",
                value: "standing and rubbing soapy lather all over her body in the shower with a soapy loofah, water and soap cascading down her nude body, her head tilted up and eyes closed as the water streams out of the showerhead onto her face, the camera sitting candidly above her looking down",
                tags: ["nudeRequired", "standing"],
                environmentTags: ["shower"]
            },
            {
                label: "Doorway, Foot Up Against Frame",
                value: "standing in a bedroom doorway. her back is against one side of the door frame, and one of her feet is elevated to eye-level and the sole of her shoe is pressing against the opposite door frame, putting her knee close to her face.",
                aspectRatios: ["square", "portrait"],
                tags: ["boudoir", "standing"],
                environmentTags: ["bedroom"]
            },
            {
                label: "Doorway, Arms Raised",
                value: "standing in a bedroom doorway. Her arms are raised above her head, and pressing against either side of the door frame. She is leaning slightly forward.",
                aspectRatios: ["square", "portrait"],
                tags: ["pinup", "boudoir", "standing"],
                environmentTags: ["bedroom"]

            },
            {
                label: "Doorway, Shyly Touching Lip",
                value: "standing in a bedroom doorway, she is touching her index finger to her bottom lip with a shy embarrassed smile and biting her bottom lip. her legs are crossed and her free hand is above her head touching the door frame.",
                aspectRatios: ["square", "portrait"],
                tags: ["pinup", "boudoir", "standing"],
                environmentTags: ["bedroom"]
            },
            {
                label: "Bent Over, Ass Toward the Camera",
                value: "standing, facing away from the camera, leaning forward, her ass toward the camera, hands on her knees, looking back at the camera, legs straight, knees locked",
                aspectRatios: ["square"],
                tags: ["pinup", "boudoir", "standing"]
            },
            {
                label: "Kneeling in Front of a Fireplace",
                value: "kneeling on a soft rug in front of a fireplace, hands on her thighs, chest pushed forward, wearing a long pearl necklace",
                aspectRatios: ["portrait", "square"],
                tags: ["boudoir", "kneeling", "crouching", "sitting"]
            },
            {
                label: "On All Fours, Side View",
                value: "on all fours, head turned to the side, back arched hard, smiling at the camera",
                aspectRatios: ["square", "portrait"],
                tags: ["boudoir", "crouching", "laying"]
            },
            {
                label: "Crawling Toward Camera",
                value: "crawling toward the camera on all fours",
                aspectRatios: ["square"],
                tags: ["boudoir", "crawling"]
            },
            {
                label: "Bathroom Mirror Selfie",
                value: "taking a selfie in a bathroom mirror",
                aspectRatios: ["square", "portrait"],
                tags: ["2000s", "standing"],
                environmentTags: ["bathroom"]
            },
            {
                label: "Standing, Mirror, Pulling Hair Up",
                value: "standing in front of a full-length mirror while pulling her hair up",
                aspectRatios: ["portrait", "square"],
                tags: ["pinup", "boudoir", "standing"],
                environmentTags: ["bedroom"]
            },
            {
                label: "Sitting, Mirror",
                value: "sitting in front of a full-length mirror looking at her reflection",
                aspectRatios: ["square"],
                tags: ["boudoir", "sitting"],
                environmentTags: ["bedroom"]
            },
            {
                label: "Smoking Outside",
                value: "standing, leaning against a glass door on the balcony of a third-floor Manhattan apartment. her legs are crossed and she is smoking a cigarette, blowing the smoke up into the air.",
                aspectRatios: ["square", "portrait", "landscape"],
                tags: ["standing", "sitting", "crouching"]
            }
        ]
    }
};

// SCENE PRESETS
const scenePresets = [
    { label: "None selected", value: "" },
    {
        label: "Low Angle, Rim Lighting",
        value: "",
        cameraAngle: ["Low Angle"],
        cameraFraming: ["Full Body", "3/4 Body"],
        lighting: ["Rim Lighting", "Backlighting"],
        timeOfDay: [],
        photographicLook: [],
        aspectRatios: ["square"],
        tags: ["standing", "sitting", "crouching", "kneeling"]
    },
    {
        label: "Bedroom, Early Morning",
        value: "in a bedroom with a bed with crumpled slept-in sheets, with pillows piled up near the wall at the head of the bed. Nightstands are on either side of the bed with bedside lamps. Early morning sunlight shines delicately through a window with sheer curtains.",
        tags: ["bedroom"]
    },
    {
        label: "Woodland Glade — Dappled Sunlight",
        value: "A lush forest clearing with broken sunlight filtering through the canopy, creating irregular patches of light and shadow across the subject and surrounding foliage. Soft green ambient light, warm sunbeams, natural woodland atmosphere."
    },
    {
        label: "Vintage Motel Pool — Blue Hour",
        value: "Beside a deserted roadside motel swimming pool just after sunset. Fading blue twilight, warm motel-room windows, reflections of a flickering neon sign across the water, nostalgic cinematic color grading."
    },
    {
        label: "Golden-Hour Meadow",
        value: "Standing among tall wild grasses in a meadow.",
        cameraAngle: ["Eye Level", "Low Angle"],
        cameraFraming: ["Full Body", "3/4 Body", "Wide Shot"],
        timeOfDay: ["Golden Hour"],
        lighting: ["Backlighting", "Rim Lighting"],
        photographicLook: [],
        tags: ["standing", "sitting", "kneeling"]
    },
    {
        label: "Rainy City Street — Neon Reflections",
        value: "On a rain-soaked downtown sidewalk at night. Colorful neon signs reflecting in puddles, wet pavement, blurred headlights in the distance, cool blue shadows contrasting with pink and red storefront lighting."
    },
    {
        label: "Bedroom — Venetian Blind Shadows",
        value: "Inside a modest bedroom with partially closed Venetian blinds casting narrow bands of sunlight and shadow across the walls and furniture",
        cameraAngle: ["Eye Level", "3/4 View"],
        cameraFraming: ["3/4 Body", "Full Body"],
        timeOfDay: ["Late Afternoon"],
        lighting: ["Hard Directional Light", "Side Lighting"],
        photographicLook: [],
        tags: ["standing", "sitting", "laying", "kneeling"]
    },
    {
        label: "Apartment Window — Soft Backlight",
        value: "Inside an old apartment beside a tall window covered with sheer white curtains. Bright overcast daylight diffuses through the fabric, softly backlighting the subject. Gentle shadows, pale neutral tones, intimate natural-light photography."
    },
    {
        label: "Vintage Dressing Room — Vanity Bulbs",
        value: "Inside a vintage theater dressing room. An ornate vanity mirror surrounded by warm incandescent bulbs, cosmetics scattered across the tabletop, velvet curtains, soft golden light reflected in the mirror, classic Hollywood glamour photography."
    },
    {
        label: "Dusty Attic — Sunbeams",
        value: "Shafts of sunlight entering through a small attic window, illuminating suspended dust particles and old wooden furniture."
    },
    {
        label: "Greenhouse — Diffused Glass Light",
        value: "Dense tropical foliage, condensation on glass panes, soft filtered daylight and green reflections."
    },
    {
        label: "Desert Highway — Twilight",
        value: "Empty roadside, distant mountains, dusty pink horizon, fading blue ambient light and cinematic wide-angle composition."
    },
    {
        label: "Old Hotel Hallway - Tungsten Lighting",
        value: "Long narrow hallway, patterned carpet, warm wall sconces and dramatic perspective lines."
    },
    {
        label: "Rooftop — Windy Overcast Day",
        value: "Urban skyline, windblown hair and clothing, soft gray directional daylight, subdued colors."
    },
]


// --- NATIONALITY / ETHNICITY ---

const nationalityPresets = [

    // Celebrity Presets
    {
        label: "My Baby",
        value: "curvy apple-shaped 35-year-old woman with large shapeless drooping breasts, a round ass, long curly 3a black hair, arms covered in red & green rose tattoos, hazel eyes",
        named: true
    },
    {
        label: "Anne Hathaway, Long Hair",
        value: "Anne Hathaway with a tall slim build with long straight black hair, smokey eyes and heavy mascara",
        named: true
    },
    {
        label: "Anne Hathaway, Short Hair",
        value: "Anne Hathaway with a tall slim build with short straight black hair in a textured pixie cut, smokey eyes and heavy mascara",
        named: true
    },
    {
        label: "Dolly Parton",
        value: "young 1970s era Dolly Parton with blown-out blonde hair and bangs",
        named: true
    },
    {
        label: "Sabrina Carpenter",
        value: "Sabrina Carpenter with shoulder length blonde hair",
        named: true
    },
    {
        label: "Marilyn Monroe",
        value: "Marilyn Monroe with shoulder length blonde Hollywood curls",
        named: true
    },
    {
        label: "Lisbeth Salander",
        value: "small petite woman with porcelain skin, a flat chest, narrow hips/shoulders, a short black spiked punk hairstyle shaved on one side, neck tattoos, back tattoos, light body hair, arm and leg tattoos, stacked bracelets, heavy mascara, smokey eyes, eyebrow/lip/septum/nipple/navel piercings, multiple earrings, multiple rings",
        named: true
    },
    {
        label: "Michelle Obama",
        value: "Michelle Obama",
        named: true
    },
    {
        label: "Betty Boop",
        value: "Betty Boop",
        named: true
    },

    // Nationality Presets
    {
        label: "Caucasian",
        value: "with Western European facial features",
        hairColors: ["blonde", "brunette", "black", "ginger", "ombre", "balayage"],
        skinTones: ["porcelain", "light", "fair", "sun-kissed tan"],
        eyeColors: ["brown", "hazel", "green", "blue", "amber"]
    },
    {
        label: "Black",
        value: "with rich deep skin tone and classic African facial features, neck/back/arm tattoos, heavy mascara, smokey eyes, light body hair, hoop earrings, long fingernails, nose/navel/nipple piercings",
        hairColors: ["dark brown", "black", "black with blonde streaks", "dyed blonde", "box braids black", "box braids and blonde streaks of hair braided in black"],
        skinTones: ["rich mocha", "brown", "dark brown", "black", "dark glossy black"],
        eyeColors: ["dark brown", "black"]
    },
    {
        label: "Mexican",
        value: "with prominent Indigenous Mesoamerican features, plump lips, smokey eyes, heavy mascara, arm/back/neck tattoos, light body hair, hoop earrings, multiple rings, nose/navel/nipple piercings",
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
        label: "East Asian",
        value: "with East Asian facial features",
        hairColors: ["dark brown", "black", "pink hair in pigtails"],
        skinTones: ["porcelain", "fair", "light", "olive"],
        eyeColors: ["dark brown", "black"]
    },
    {
        label: "Southeast Asian",
        value: "with Southeast Asian facial features",
        hairColors: ["dark brown", "black"],
        skinTones: ["light", "warm tan", "golden-tan", "deep golden-bronze"],
        eyeColors: ["dark brown", "black"]
    },
    {
        label: "Middle Eastern",
        value: "with Middle Eastern facial features",
        hairColors: ["dark brown", "black"],
        skinTones: ["olive", "dark"],
        eyeColors: ["dark brown", "black"]
    }
];



// =========================================
// AGE
// =========================================
const agePresets = [
    18, 20, 25, 30, 35, 40, 45, 50
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

const outfitPresets = [];

const actionPresets = [];

const environments = [
    { label: "None selected", value: "" },

    { label: "in a bedroom", value: "in a bedroom with a bed with crumpled slept-in sheets, with pillows piled up near the wall at the head of the bed. Nightstands are on either side of the bed with bedside lamps. A nearby window has sheer curtains", tags: ["pinup", "boudoir", "bedroom"] },
    { label: "in a kitchen", value: "in a kitchen, with granite countertops, an aluminum oven/stovetop under an aluminum microwave. Cabinets line either side of the microwave. A kitchen sink sits nearby underneath a window with sheer curtains", tags: ["pinup", "boudoir", "kitchen"] },
    { label: "in the backseat of a car", value: "in the backseat of a car" },
    { label: "in a surgical theatre", value: "in a well-lit surgical theater with two surgical tables covered in blue paper, a large overhead lamp and numerous surgical machines" },
    { label: "in a crowded city street", value: "in a crowded city street with cars driving by and people walking along the sidewalks" },
    { label: "in a glade", value: "in a lush glade with doppled sunlight through the canopy of trees" },
    { label: "on an office desk", value: "on an office desk in a wood-paneled office. Papers are strewn about laying on top of the desk. A tall potted hibiscus sits in a corner of the office", tags: ["boudoir", "office"] },
    { label: "at a poolside", value: "near a pool surrounded by lounge chairs", tags: ["pinup", "poolside"] },
    { label: "on a beach at sunset", value: "on a beach at sunset", tags: ["pinup", "beach"] },
    { label: "in a nightclub", value: "in a crowded nightclub, dimly lit with bright neon spotlights", tags: ["1990s", "2000s"] },
    { label: "in a hotel room", value: "in a hotel room with smoke-stained walls and curtains", tags: ["pinup", "boudoir", "bedroom", "hotel"] },
    { label: "on a rooftop at night", value: "on the spacious roof of a Manhattan highrise apartment building" },
    { label: "in an elevator", value: "in an elevator" },
    { label: "in a library", value: "in a softly lit public library surrounded by tall racks of hardcover books", tags: ["pinup", "library"] }
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

    { label: "1930s Early Color Film", value: "1930s early color-film aesthetic with muted tones and classic pre-war photographic softness", tags: ["1930s"] },
    { label: "1940s Kodachrome", value: "1940s Kodachrome-inspired photography with rich saturated color and gentle vintage contrast", tags: ["1940s"] },
    { label: "1950s Magazine", value: "1950s glossy magazine photography with polished tones, subtle bloom, and clean mid-century color", tags: ["1950s"] },
    { label: "1960s Slide Film", value: "1960s slide-film photography with vibrant saturated color and crisp vintage rendering", tags: ["1960s"] },
    { label: "1970s Polaroid", value: "1970s Polaroid snapshot aesthetic with warm tones, soft contrast, and instant-film color drift", tags: ["1970s"] },
    { label: "1980s VHS", value: "1980s VHS aesthetic with analog softness, washed color, and subtle magnetic video noise", tags: ["1980s"] },
    { label: "1990s Film", value: "1990s consumer film photography with natural color, smooth tonal transitions, and nostalgic analog character", tags: ["1990s"] },
    { label: "2000s Disposable Camera", value: "2000s disposable-camera snapshot aesthetic with direct-flash character, slight color cast, soft focus, and inexpensive film imperfections", tags: ["2000s"] }
];



function randomize(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function getSceneSetting(options, presets) {
    if (!options || options.length === 0) {
        return null;
    }

    const selectedLabel = randomize(options);

    return presets.find(preset =>
        preset.label === selectedLabel
    ) || null;
}

function hasMatchingTags(tagsA, tagsB) {
    if (!tagsA?.length || !tagsB?.length) {
        return false;
    }
    return tagsA.some(tag => tagsB.includes(tag));
}

const promptSelections = requestFromUser("Select from the dropdowns or randomize them", "Generate", function () {
    return [

        this.section(
            "Aspect Ratio",
            "Select from below:",
            [
                this.menu(0, [
                    "Random Selection",
                    "3:4 Portrait",
                    "1:1 Square",
                    "4:3 Landscape"
                ])
            ]
        ),

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
                this.switch(true, "Use LoRAs")
            ]
        ),

        // Art Styles
        this.section(
            "Visual Concept",
            "Select the visual concept: ",
            [
                this.menu(0, [
                    "Random Selection",
                    ...Object.values(visualPresets).map(item => item.label)
                ])
            ]),

        // Subject-Nationality
        this.section(
            "Nationality",
            "Choose a nationality:",
            [
                this.menu(0, [
                    "Random Selection",
                    ...nationalityPresets.map(item => item.label)
                ])
            ]
        ),

        // Age
        this.section(
            "Age",
            "Select an age:",
            [
                this.menu(0, [
                    "Random Selection",
                    ...agePresets.map(age => age.toString())
                ])
            ]
        ),

        // Specific Body Presets
        this.section(
            "Special Body Types",
            "Pregnant or Achondroplasia",
            [
                this.switch(false, "Pregnant"),
                this.switch(false, "Achondroplasia")
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

        // Time of Day
        this.section(
            "Time of Day",
            "Choose an optional time of day:",
            [
                this.menu(0, timeOfDayPresets.map(item => item.label))
            ]
        )
    ]
});

async function generateBatch() {

    canvas.clear();

    let imagePrompt;
    let visualConcept;
    let visualVariant;
    let nationality;
    let isPregnant;
    let isMidget;
    let hairColor;
    let hairStyle;
    let skinTone;
    let age;
    let eyeColor;
    let overallBuild;
    let outfit;
    let action;
    let scenePreset;
    let environment;
    let cameraFraming;
    let cameraAngle;
    let timeOfDay = timeOfDayPresets[promptSelections[10][0]].value;
    let lighting;
    let photographicLook;

    // VISUAL CONCEPT
    const visualOptions = Object.values(visualPresets);

    if (promptSelections[3][0] === 0) {
        visualConcept = randomize(visualOptions);
    } else {
        visualConcept = visualOptions[promptSelections[3][0] - 1];
    }

    const era = eraPresets[visualConcept.era] || {
        outfits: [],
        hairstyles: []
    };
    const variantOptions = Object.values(visualConcept.variants);
    visualVariant = randomize(variantOptions);

    // NATIONALITY
    if (promptSelections[4][0] === 0) {
        const randomPool = nationalityPresets.filter(item => !item.named);
        nationality = randomize(randomPool);
    } else {
        nationality = nationalityPresets[promptSelections[4][0] - 1];
    }

    // AGE
    if (promptSelections[5][0] === 0) {
        age = randomize(agePresets);
    } else {
        age = agePresets[promptSelections[5][0] - 1];
    }

    console.log(gender);
    if (age < 18 && gender === "woman") {
        gender = "girl";
    }
    if (age < 18 && gender === "man") {
        gender = "boy";
    }

    // PREGNANT OR NOT
    if (promptSelections[6][0]) {
        isPregnant = "pregnant ";
    } else { isPregnant = ""; }

    // MIDGET OR NOT
    if (promptSelections[6][1]) {
        isMidget = " with achondroplasia, characteristic short stature and naturally proportioned body,";
    } else { isMidget = ""; }

    // BODY TYPE
    if (promptSelections[7][0] === 0) {
        overallBuild = randomize(overallBuildPresets);
    } else {
        overallBuild = overallBuildPresets[promptSelections[7][0] - 1];
    }

    // OUTFIT
    if (promptSelections[8][0] !== 0) {
        outfit = outfitPresets[promptSelections[8][0] - 1].value;
    }

    // ACTION/POSE
    if (promptSelections[9][0] !== 0) {
        action = actionPresets[promptSelections[9][0] - 1];
    }

    // =========================================
    // SCENE CAMERA & LIGHTING SETTINGS
    // =========================================

    // VISUAL CONCEPT CAMERA ANGLE
    const conceptAngle = getSceneSetting(
        visualConcept.cameraAngles,
        cameraAnglePresets
    );

    if (conceptAngle) {
        cameraAngle = conceptAngle.value;
    }

    // VISUAL CONCEPT CAMERA FRAMING
    const conceptFraming = getSceneSetting(
        visualConcept.cameraFraming,
        cameraFramingPresets
    );

    if (conceptFraming) {
        cameraFraming = conceptFraming.value;
    }

    // VISUAL CONCEPT LIGHTING
    const conceptLighting = getSceneSetting(
        visualConcept.lighting,
        lightingPresets
    );

    if (conceptLighting) {
        lighting = conceptLighting.value;
    }

    // VISUAL CONCEPT PHOTOGRAPHIC LOOK
    if (visualVariant === visualConcept.variants.photo) {
        const conceptLook = getSceneSetting(
            visualConcept.photographicLook,
            photographicLookPresets
        );

        if (conceptLook) {
            photographicLook = conceptLook.value;
        }
    }

    if (scenePreset) {
        const sceneFraming = getSceneSetting(
            scenePreset.cameraFraming,
            cameraFramingPresets
        );

        const sceneAngle = getSceneSetting(
            scenePreset.cameraAngle,
            cameraAnglePresets
        );

        const sceneTime = getSceneSetting(
            scenePreset.timeOfDay,
            timeOfDayPresets
        );

        const sceneLighting = getSceneSetting(
            scenePreset.lighting,
            lightingPresets
        );

        const sceneLook = getSceneSetting(
            scenePreset.photographicLook,
            photographicLookPresets
        );

        if (sceneFraming) {
            cameraFraming = sceneFraming.value;
        }

        if (sceneAngle) {
            cameraAngle = sceneAngle.value;
        }

        if (sceneTime) {
            timeOfDay = sceneTime.value;
        }

        if (sceneLighting) {
            lighting = sceneLighting.value;
        }

        if (sceneLook && visualVariant === visualConcept.variants.photo) {
            photographicLook = sceneLook.value;
        }
    }

    // ========================================
    // SCENE PRESETS
    // ========================================
    if (promptSelections[10][0] === 0) {
        const conceptScenes = scenePresets.filter(item =>
            visualConcept.scenes?.includes(item.label)
        );

        const sceneOptions = conceptScenes.length > 0
            ? [
                scenePresets[0],
                ...conceptScenes.filter(item => item !== scenePresets[0])
            ]
            : scenePresets;

        scenePreset = randomize(sceneOptions);
    } else {
        scenePreset = scenePresets[promptSelections[10][0]];
    }

    // =========================================
    // ERA COMPATIBILITY
    // =========================================

    if (promptSelections[8][0] === 0) {
        const compatibleOutfits = outfitPresets.filter(item =>
            item.tags?.includes(visualConcept.era) ||
            item.tags?.includes(visualConcept.concept)
        );

        const outfitOptions = [
            ...(era.outfits || []),
            ...compatibleOutfits
        ].filter((item, index, array) =>
            array.findIndex(other => other.value === item.value) === index
        );

        if (outfitOptions.length > 0) {
            outfit = randomize(outfitOptions).value;
        } else {
            const fallbackOutfits = outfitPresets.filter(item => item.value);

            if (fallbackOutfits.length > 0) {
                outfit = randomize(fallbackOutfits).value;
            }
        }
    }

    if (promptSelections[9][0] === 0 && visualConcept.concept) {

        const compatibleActions = actionPresets.filter(item =>
            item.tags?.includes(visualConcept.concept) ||
            item.tags?.includes(visualConcept.era)
        );

        const sceneCompatibleActions = actionPresets.filter(item =>
            hasMatchingTags(item.tags, scenePreset?.tags)
        );

        const matchingBoth = compatibleActions.filter(item =>
            sceneCompatibleActions.includes(item)
        );

        if (matchingBoth.length > 0) {
            action = randomize(matchingBoth);
        } else if (compatibleActions.length > 0) {
            action = randomize(compatibleActions);
        } else if (sceneCompatibleActions.length > 0) {
            action = randomize(sceneCompatibleActions);
        } else {
            action = randomize(actionPresets);
        }
    }

    let optionalPrompt = "";

    if (action.tags?.includes("lowAngleRequired")) {
        cameraAngle = cameraAnglePresets.find(
            angle => angle.label === "Low Angle"
        )?.value;
    }

    // VISUAL CONCEPT ENVIRONMENT COMPATIBILITY
    const conceptEnvironments = environments.filter(item =>
        item.tags?.includes(visualConcept.concept) ||
        item.tags?.includes(visualConcept.era) ||
        visualConcept.environments?.includes(item.label)
    );

    const compatibleEnvironments = environments.filter(environment =>
        action.environmentTags &&
        environment.tags &&
        action.environmentTags.some(tag =>
            environment.tags.includes(tag)
        )
    );

    if (
        promptSelections[11][0] === 0 &&
        !scenePreset?.value
    ) {
        const matchingBoth = compatibleEnvironments.filter(item =>
            conceptEnvironments.includes(item)
        );

        if (matchingBoth.length > 0) {
            environment = randomize(matchingBoth);
        } else if (compatibleEnvironments.length > 0) {
            environment = randomize(compatibleEnvironments);
        } else if (conceptEnvironments.length > 0) {
            environment = randomize(conceptEnvironments);
        }
    }

    // ========================================
    // SCENE ENVIRONMENT
    // ========================================

    if (promptSelections[11][0] === 0 &&
        scenePreset?.value &&
        !environment.value
    ) {
        environment = scenePreset;
    }

    // ========================================
    // CAMERA & LIGHTING PROMPT
    // ========================================

    const cameraLightingPrompt = [
        cameraFraming,
        cameraAngle,
        timeOfDay,
        lighting,
        photographicLook
    ].filter(Boolean).join(", ");

    optionalPrompt = cameraLightingPrompt
        ? " " + cameraLightingPrompt + "."
        : "";

    if (action.tags && action.tags.includes("nudeRequired")) {
        outfit = "nude";
    }

    // PROMPT TEMPLATE
    if (nationality.named) {
        // Celebrity
        imagePrompt = "A " + visualVariant.value + " of a " + isPregnant + nationality.value + ", " + action.value + " " + environment.value + ". She is wearing " + outfit + ". " + optionalPrompt + " Natural anatomy.";
    } else {
        hairStyle = era.hairstyles?.length
            ? randomize(era.hairstyles).value
            : "";
        hairColor = randomize(nationality.hairColors);
        skinTone = randomize(nationality.skinTones);
        eyeColor = randomize(nationality.eyeColors);
        imagePrompt = "A " + visualVariant.value + " of a " + isPregnant + age + "-year-old " + nationality.label + " " + gender + isMidget + " with " + skinTone + " skin, " +
            (hairStyle ? hairColor + " " + hairStyle + ", " : hairColor + " hair, ") +
            nationality.value + ", " + action.value + " " + environment.value + ". She is wearing " + outfit + ". She has a " + overallBuild.value + " and " + eyeColor + " eyes." + optionalPrompt + " Natural anatomy.";
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

    let aspectRatio;

    if (promptSelections[0][0] === 0) {
        // Random selection
        aspectRatio = action.aspectRatios?.length
            ? randomize(action.aspectRatios)
            : randomize(["portrait", "square", "landscape"]);
    } else {
        // Explicit selection
        const aspectRatioOptions = [
            "portrait",
            "square",
            "landscape"
        ];

        aspectRatio = aspectRatioOptions[promptSelections[0][0] - 1];
    }

    if (aspectRatio === "portrait") {
        config.width = 768;
        config.height = 1024;
    }
    if (aspectRatio === "square") {
        config.width = 1024;
        config.height = 1024;
    }
    if (aspectRatio === "landscape") {
        config.width = 1024;
        config.height = 768;
    }

    config.batchCount = 1;
    config.batchSize = 1;

    // =================================
    // RANDOM SEED
    // =================================
    config.seed = -1;

    // =================================
    // LORAS
    // =================================

    if (promptSelections[2][0]) {
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
const imageCount = imageCounts[promptSelections[1][0]];

async function runBatch() {
    for (var i = 0; i < imageCount; i++) {
        await generateBatch();
    }
    console.log("Batch Finished!");
}

console.log("promptSelections:", promptSelections);
console.log("imageCount:", imageCount);

runBatch();

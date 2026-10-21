//@api-1.0

const DEBUG = true;

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
                label: "Shoulder-length brushed curls",
                value: "shoulder-length brushed curls"
            },
            {
                label: "Hair wrapped in a patterned scarf",
                value: "hair wrapped in a patterned scarf"
            }
        ],

        outfits: [
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
                label: "Halter Top, Pleated Shorts",
                value: "a halter top and pleated shorts"
            },
            {
                label: "A-line tea dress",
                value: "A-line tea dress"
            },
            {
                label: "High-waisted shorts and tied blouse",
                value: "high-waisted shorts and tied blouse"
            },
            {
                label: "Vintage two-piece swimsuit",
                value: "vintage two-piece swimsuit"
            },
            {
                label: "Halter-neck dress",
                value: "halter-neck dress"
            },
            {
                label: "WWII-era nurse uniform",
                value: "WWII-era nurse uniform"
            },
            {
                label: "Leather flight jacket with a white dress",
                value: "leather flight jacket with a white dress"
            },
            {
                label: "Mechanic's coveralls",
                value: "mechanic's coveralls"
            },
            {
                label: "Pencil Skirt and Fitted Blouse",
                value: "pencil skirt and fitted blouse"
            },
            {
                label: "Vintage lingerie and satin robe",
                value: "vintage lingerie and satin robe"
            }
        ],

        variants: {

            painting: {
                label: "Oil Painting",
                value: "1940s era pinup oil painting in the style of Gil Elvgren and Alberto Vargas",
                cameraAngles: ["eyeLevel", "lowAngle", "highAngle"],
                cameraFraming: ["fullBody", "34Body"],
                lighting: ["softStudioLight", "softNaturalLight"]
            },

            illustration: {
                label: "Vintage Magazine Illustration",
                value: "vintage magazine advertising illustration",
                cameraAngles: ["eyeLevel", "lowAngle", "highAngle"],
                cameraFraming: ["fullBody", "34Body"],
                lighting: ["softStudioLight", "softNaturalLight"]
            },

            photo: {
                label: "Photography",
                value: "1940s vintage pinup photograph",
                photographicLook: ["1940sKodachrome"],
                cameraAngles: ["eyeLevel", "lowAngle", "highAngle"],
                cameraFraming: ["fullBody", "34Body"],
                lighting: ["softStudioLight", "windowLight"]
            }
        },




        scenes: [
            {
                label: "Vintage Car Garage",
                setting: "in a vintage car garage with greasy tools, large red toolboxes and pinup posters on the walls promoting the war effort",
                actions: [
                    "leaning against a cherry-red 1948 Buick Roadmaster convertible with sweeping fenders and gleaming chrome trim"
                ]
            },
            {
                label: "Manhattan Street Scene",
                setting: "on a crowded Manhattan street in the 1940s. People are walking by, vintage cars are driving by.",
                actions: [
                    "holding down a skirt blown by the wind"
                ]
            },
            {
                label: "1940s Neighborhood",
                setting: "in a 1940s-era neighborhood, with brilliant vivid colors, vintage cars, and vintage homes",
                actions: [
                    "holding down a skirt blown by the wind"
                ]
            },
            {
                label: "Bedroom, Early Morning",
                setting: "in a bedroom with a bed with crumpled slept-in sheets, with pillows piled up near the wall at the head of the bed. Nightstands are on either side of the bed with bedside lamps. Early morning sunlight shines delicately through a window with sheer curtains.",
                actions: [
                    "lying on her side, with the top leg bent high, hand lightly between her thighs",
                    "sitting on a stool while adjusting a stocking",
                    "sitting on the edge of a bed brushing her hair",
                    "standing, mid-stretch reaching both arms overhead while rising up on her toes, hands in her hair, back arched, chest pressed forward, shoulders pulled back.",
                    "lying on her stomach on a sunlit windowsill, chin resting on her hands, legs bent at the knees and crossed at the ankles in the air",
                    "lying on her back on a sofa, one leg hooked over the backrest, other foot on the floor"
                ],
                lighting: ["softStudioLight", "windowLightThroughSheerCurtains"]
            },
            {
                label: "Posing in Front of a US Flag",
                setting: "in front of a US flag that covers the background of the frame",
                actions: [
                    "smiling at the camera while she salutes with her right hand brought up to her eyebrow. Her legs are drawn up to her chest."
                ],
                lighting: ["softStudioLight", "moodyHighContrastLighting"],

            },
            {
                label: "In a Kitchen",
                setting: "in a 1940s era kitchen with bright vivid colors, an oven, countertops, cabinets, and a curtained window above a sink.",
                actions: [
                    "bending at the waist, legs straight, grabbing a sheet of cookies out of an oven",
                    "reaching above her head to grab a can of green beans from a high shelf in a cabinet, standing on her tiptoes"
                ],
                lighting: ["windowLightThroughSheerCurtains"]
            },
            {
                label: "Living Room",
                setting: "in a 1940s era living room with bright vivid colors",
                actions: [
                    "sitting in a baby-blue upholstered wingback chair reading a large magazine",
                    "sitting sideways in a baby-blue upholstered wingback chair, with her legs crossed and draped over one armrest, one arm draped over the headrest, and her chin tilted upward, laughing at the camera",
                    "lying on her back on a sofa, one leg resting on opposite armrest, other foot on the floor",
                    "leaning forward to grab something off of a lower level of a bookshelf, legs straight, knees locked, bending at waist only, looking at the camera sideways, with her hand covering her mouth and wide-eyed open-mouthed look of surprise"
                ],
                lighting: ["softStudioLight", "warmIndoorLamps"]
            },
            {
                label: "WWII Airfield",
                setting: "in a WWII airfield with B-17 bomber airplanes in the background",
                actions: [
                    "leaning against the side of a plane with one foot raised and pressed against the plane",
                    "standing with her feet shoulder-width apart, with her hands on her hips"
                ],
                lighting: ["directSunlight"]
            },
            {
                label: "On a Beach",
                setting: "on a beach at a vintage beach resort",
                actions: [
                    "reclining on a beach towel",
                    "running toward the water"
                ],
                lighting: ["directSunlight"]
            },
            {
                label: "Studio Portrait",
                setting: "in a professional photography studio",
                actions: [
                    "looking over one shoulder with a playful smile",
                    "sitting on the floor with her knees drawn to her chest. She is smiling at the camera, and her head is tilted upward."
                ],
                lighting: ["softStudioLight", "rimLighting", "backlighting"]
            },
            {
                label: "1940s Hollywood Dressing Room",
                setting: "in a 1940s Hollywood starlet's dressing room",
                actions: [
                    "looking over one shoulder with a playful smile",
                    "sitting in a highback chair, leaning forward toward a vanity mirror applying lipstick"
                ]
            },
            {
                label: "Bathroom",
                setting: "in a bathroom with a large mirror over a countertop and sink. Various bathroom items are cluttered on the countertop.",
                actions: [
                    "standing in a bathroom, leaning over the counter, close to the mirror, applying deep red lipstick. Facing away from the camera."
                ],
                lighting: ["warmIndoorLamps"]
            }
        ]
    },

    glamourShots1940s: {
        label: "1940s Glamour Shots",
        era: "1940s",

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
                label: "Shoulder-length brushed curls",
                value: "shoulder-length brushed curls"
            },
            {
                label: "Hair wrapped in a patterned scarf",
                value: "hair wrapped in a patterned scarf"
            }
        ],

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

        variants: {
            photo: {
                label: "1940s Glamour Photo",
                value: "1940s glamour photo",
                photographicLook: ["1940sKodachrome"],
                cameraAngles: ["eyeLevel", "lowAngle"],
                cameraFraming: ["34Body", "fullBody", "waistUp"],
                lighting: ["softStudioLight", "windowLight"]
            },
            illustration: {
                label: "Vintage Magazine Illustration",
                value: "vintage magazine advertising illustration",
                cameraAngles: ["eyeLevel", "lowAngle"],
                cameraFraming: ["34Body", "fullBody"],
                lighting: ["softStudioLight", "softNaturalLight"]
            }
        },

        scenes: [
            {
                label: "In a Kitchen",
                setting: "in a 1940s era kitchen with bright vivid colors, an oven, countertops, cabinets, and a curtained window above a sink.",
                actions: [
                    "bending at the waist, legs straight, grabbing a sheet of cookies out of an oven",
                    "reaching above her head to grab a can of green beans from a high shelf in a cabinet, standing on her tiptoes"
                ],
                lighting: []
            },
            {
                label: "Living Room",
                setting: "in a 1940s era living room with bright vivid colors",
                actions: [
                    "sitting in a baby-blue upholstered wingback chair reading a large magazine",
                    "sitting sideways in a baby-blue upholstered wingback chair, with her legs crossed and draped over one armrest, one arm draped over the headrest, and her chin tilted upward, laughing at the camera",
                    "lying on her back on a sofa, one leg resting on opposite armrest, other foot on the floor",
                    "leaning forward to grab something off of a lower level of a bookshelf, legs straight, knees locked, bending at waist only, looking at the camera sideways, with her hand covering her mouth and wide-eyed open-mouthed look of surprise",
                    "adjusting her hat in a mirror"
                ],
                lighting: ["softStudioLight", "warmIndoorLamps"]
            },
            {
                label: "WWII Airfield",
                setting: "in a WWII airfield with B-17 bomber airplanes in the background",
                actions: [
                    "leaning against the side of a plane with one foot raised and pressed against the plane",
                    "standing with her feet shoulder-width apart, with her hands on her hips"
                ],
                lighting: ["directSunlight"]
            },
            {
                label: "On a Beach",
                setting: "on a beach at a vintage beach resort",
                actions: [
                    "laying on her side",
                    "running toward the water"
                ],
                lighting: ["directSunlight"]
            },
            {
                label: "Studio Portrait",
                setting: "in a professional photography studio",
                actions: [
                    "sitting on the floor with her knees drawn to her chest. She is smiling at the camera, and her head is tilted upward."
                ],
                lighting: ["softStudioLight", "rimLighting", "backlighting"]
            },
            {
                label: "Art Deco Hotel Suite",
                setting: "in a 1940s Art Deco hotel suite with a made bed, a nightstand with a bedside lamp, and a window with sheer curtains",
                actions: [
                    "sitting on a suitcase preparing for a trip"
                ]
            },
            {
                label: "Train Station Platform",
                setting: "on a train station platform",
                actions: [
                    "looking past the camera, leaning forward, waiting on a train"
                ]
            },
            {
                label: "Classic Roadside Diner",
                setting: "in a classic roadside diner, with bright vivid colors and neon signs, white leather upholstery on each booth bench seat and bar stool",
                actions: [
                    "sitting in a booth looking out the window as the rain cascades down the glass. A waitress in an A-line tea dress and a dainty apron that covers her lower torso is pouring coffee into the woman's coffee mug from a glass carafe."
                ]
            }
        ]
    },

    modernBoudoir: {
        label: "Modern Boudoir",
        era: "2000s",
        hairstyles: [
            { label: "Soft loose waves", value: "soft loose waves" },
            { label: "Long straight hair", value: "long straight hair" },
            { label: "Messy bun", value: "hair gathered into a loose messy bun" }
        ],
        outfits: [
            { label: "Satin robe", value: "a satin robe" },
            { label: "Silk slip dress", value: "a silk slip dress" },
            { label: "Oversized knit sweater", value: "an oversized knit sweater" }
        ],

        variants: {
            photo: {
                label: "photography",
                value: "photo",
                cameraAngles: ["eyeLevel", "highAngle", "lowAngle"],
                cameraFraming: ["fullBody", "34Body"],
                lighting: ["softStudioLight"],
                photographicLook: ["2000sDisposableCamera"]
            }
        },





        scenes: [
            {
                label: "Bedroom, Early Morning",
                setting: "in a bedroom with a bed with crumpled slept-in sheets, with pillows piled up near the wall at the head of the bed. Nightstands are on either side of the bed with bedside lamps. Early morning sunlight shines delicately through a window with sheer curtains.",
                actions: [
                    "sitting on the edge of the bed",
                    "standing beside the window",
                    "relaxing in an armchair"
                ]
            }
        ],
        environments: [
            "Kitchen",
            "Living Room",
            "Studio",
            "Bedroom"
        ]
    },

    victorianBoudoir: {
        label: "Victorian Boudoir",
        era: "Victorian",
        outfits: [
            { label: "Victorian lace-trimmed chemise", value: "a Victorian lace-trimmed linen chemise" },
            { label: "Victorian dressing gown", value: "a flowing Victorian silk dressing gown" },
            { label: "Victorian nightdress", value: "a long Victorian cotton nightdress with lace cuffs" }
        ],

        hairstyles: [
            { label: "Dark hair parted in the center and gathered into a low bun", value: "dark hair parted in the center and gathered into a low bun" },
            { label: "Long hair styled in tight Victorian ringlets", value: "long hair styled in tight Victorian ringlets" },
            { label: "An elaborate braided updo with pinned curls", value: "an elaborate braided updo with pinned curls" },
            { label: "A smooth center-parted hairstyle with a braided crown", value: "a smooth center-parted hairstyle with a braided crown" },
            { label: "A voluminous Gibson Girl pompadour updo", value: "a voluminous Gibson Girl pompadour updo" },
            { label: "Soft curls framing the face with hair pinned at the back", value: "soft curls framing the face with hair pinned at the back" },
            { label: "A neatly coiled chignon at the nape of the neck", value: "a neatly coiled chignon at the nape of the neck" },
            { label: "Long wavy hair cascading over the shoulders", value: "long wavy hair cascading over the shoulders" },
            { label: "An intricate Victorian hairstyle with braided loops", value: "an intricate Victorian hairstyle with braided loops" },
            { label: "A high Victorian updo decorated with delicate ribbons", value: "a high Victorian updo decorated with delicate ribbons" },
            { label: "A center-parted hairstyle with sausage curls beside the cheeks", value: "a center-parted hairstyle with sausage curls beside the cheeks" },
            { label: "A loose Victorian updo with wispy curls around the temples", value: "a loose Victorian updo with wispy curls around the temples" },
            { label: "A polished braided bun with a center part", value: "a polished braided bun with a center part" },
            { label: "A Victorian hairstyle with a rolled fringe and pinned curls", value: "a Victorian hairstyle with a rolled fringe and pinned curls" }
        ],

        variants: {
            tinType: {
                label: "Tin Type",
                value: "1880s Victorian tintype photograph, authentic wet-plate collodion process, monochromatic silver-gray tones, faded contrast, subtle chemical imperfections",
                cameraAngles: ["eyeLevel"],
                cameraFraming: ["waistUp", "34Body", "fullBody"],
                lighting: ["windowLight", "softNaturalLight"]
            },
            oilPainting: {
                label: "Victorian Oil Painting",
                value: "19th-century Victorian oil painting, traditional oil on canvas, realistic brushwork, rich muted colors, subtle chiaroscuro, fine painted details, classical academic realism.",
                cameraAngles: ["eyeLevel", "lowAngle"],
                cameraFraming: ["34Body", "fullBody", "environmentalPortrait"],
                lighting: ["windowLight", "candlelightFirelight", "lowKeyChiaroscuro"]
            }
        },





        scenes: [
            {
                label: "Bedroom, Early Morning",
                setting: "an ornate Victorian bedroom with carved wooden furniture, patterned wallpaper, and lace curtains.",
                actions: [
                    "sitting at a dressing table",
                    "standing beside the window",
                    "reading a letter beside the bed"
                ]
            }
        ],
        environments: [
            "Kitchen",
            "Living Room",
            "Studio",
            "Bedroom"
        ]
    },

    victorian: {
        label: "Victorian",
        era: "Victorian",

        hairstyles: [
            { label: "Dark hair parted in the center and gathered into a low bun", value: "dark hair parted in the center and gathered into a low bun" },
            { label: "Long hair styled in tight Victorian ringlets", value: "long hair styled in tight Victorian ringlets" },
            { label: "An elaborate braided updo with pinned curls", value: "an elaborate braided updo with pinned curls" },
            { label: "A smooth center-parted hairstyle with a braided crown", value: "a smooth center-parted hairstyle with a braided crown" },
            { label: "A voluminous Gibson Girl pompadour updo", value: "a voluminous Gibson Girl pompadour updo" },
            { label: "Soft curls framing the face with hair pinned at the back", value: "soft curls framing the face with hair pinned at the back" },
            { label: "A neatly coiled chignon at the nape of the neck", value: "a neatly coiled chignon at the nape of the neck" },
            { label: "Long wavy hair cascading over the shoulders", value: "long wavy hair cascading over the shoulders" },
            { label: "An intricate Victorian hairstyle with braided loops", value: "an intricate Victorian hairstyle with braided loops" },
            { label: "A high Victorian updo decorated with delicate ribbons", value: "a high Victorian updo decorated with delicate ribbons" },
            { label: "A center-parted hairstyle with sausage curls beside the cheeks", value: "a center-parted hairstyle with sausage curls beside the cheeks" },
            { label: "A loose Victorian updo with wispy curls around the temples", value: "a loose Victorian updo with wispy curls around the temples" },
            { label: "A polished braided bun with a center part", value: "a polished braided bun with a center part" },
            { label: "A Victorian hairstyle with a rolled fringe and pinned curls", value: "a Victorian hairstyle with a rolled fringe and pinned curls" }
        ],

        outfits: [
            { label: "A high-necked Victorian dress with a fitted bodice and full skirt", value: "a high-necked Victorian dress with a fitted bodice and full skirt" },
            { label: "An elegant silk ball gown with an off-the-shoulder neckline", value: "an elegant silk ball gown with an off-the-shoulder neckline" },
            { label: "A modest cotton day dress with long sleeves and a lace collar", value: "a modest cotton day dress with long sleeves and a lace collar" },
            { label: "A dark velvet Victorian evening gown with intricate embroidery", value: "a dark velvet Victorian evening gown with intricate embroidery" },
            { label: "A fitted riding habit with a long skirt and tailored jacket", value: "a fitted riding habit with a long skirt and tailored jacket" },
            { label: "A simple working-class dress with a white apron", value: "a simple working-class dress with a white apron" },
            { label: "A Victorian mourning dress made of black crepe with a high collar", value: "a Victorian mourning dress made of black crepe with a high collar" },
            { label: "A floral-print muslin summer dress with puffed sleeves", value: "a floral-print muslin summer dress with puffed sleeves" },
            { label: "A luxurious satin gown with lace trim and a bustle", value: "a luxurious satin gown with lace trim and a bustle" },
            { label: "A Victorian walking dress with a fitted jacket and floor-length skirt", value: "a Victorian walking dress with a fitted jacket and floor-length skirt" },
            { label: "A high-collared blouse with a long dark wool skirt", value: "a high-collared blouse with a long dark wool skirt" },
            { label: "A Victorian tea gown with flowing fabric and lace detailing", value: "a Victorian tea gown with flowing fabric and lace detailing" },
            { label: "A striped Victorian seaside dress with a high neckline", value: "a striped Victorian seaside dress with a high neckline" },
            { label: "A Victorian wedding gown with lace sleeves and a fitted waist", value: "a Victorian wedding gown with lace sleeves and a fitted waist" },
            { label: "A simple linen chemise with delicate lace trim", value: "a simple linen chemise with delicate lace trim" },
            { label: "A late-Victorian shirtwaist blouse with leg-of-mutton sleeves and a long skirt", value: "a late-Victorian shirtwaist blouse with leg-of-mutton sleeves and a long skirt" }
        ],

        variants: {
            tinType: {
                label: "Tin Type",
                value: "1880s Victorian tintype photograph, authentic wet-plate collodion process, monochromatic silver-gray tones, faded contrast, subtle chemical imperfections",
                cameraAngles: ["eyeLevel"],
                cameraFraming: ["waistUp", "34Body", "fullBody"],
                lighting: ["windowLight", "softNaturalLight"]
            },
            oilPainting: {
                label: "Victorian Oil Painting",
                value: "19th-century Victorian oil painting, traditional oil on canvas, realistic brushwork, rich muted colors, subtle chiaroscuro, fine painted details, classical academic realism.",
                cameraAngles: ["eyeLevel", "lowAngle"],
                cameraFraming: ["34Body", "fullBody", "environmentalPortrait"],
                lighting: ["windowLight", "candlelightFirelight", "lowKeyChiaroscuro"]
            }
        },






        scenes: [
            {
                label: "Victorian Bedroom, Early Morning",
                setting: "an ornate Victorian bedroom with carved wooden furniture, patterned wallpaper, and lace curtains",
                actions: [
                    "sitting on the edge of the bed",
                    "standing beside the window",
                    "brushing her hair at a vanity"
                ],
                lighting: ["windowLight", "softNaturalLight"],
                cameraFraming: ["fullBody", "34Body"]
            },
            {
                label: "Victorian Sitting Room",
                setting: "Inside an elegant Victorian sitting room with patterned wallpaper, upholstered furniture, and a marble fireplace.",
                actions: [
                    "sitting in an upholstered armchair",
                    "standing beside the fireplace",
                    "reading a book on the sofa"
                ],
                lighting: ["windowLight", "warmIndoorLamps"]
            }
        ]
    },

    spaceAge1960s: {
        "label": "1960s Space Age / Space Mod",
        "era": "1960s",
        "subjectMode": "required",
        "hairstyles": [
            {
                "label": "sleek geometric bob with blunt bangs",
                "value": "sleek geometric bob with blunt bangs"
            },
            {
                "label": "high bouffant beehive",
                "value": "high bouffant beehive"
            },
            {
                "label": "short sculpted mod pixie cut",
                "value": "short sculpted mod pixie cut"
            },
            {
                "label": "smooth flipped-end bob",
                "value": "smooth flipped-end bob"
            },
            {
                "label": "long straight hair with a center part",
                "value": "long straight hair with a center part"
            }
        ],
        "outfits": [
            {
                "label": "metallic silver A-line minidress and white go-go boots",
                "value": "metallic silver A-line minidress and white go-go boots"
            },
            {
                "label": "color-blocked geometric shift dress with a high collar",
                "value": "color-blocked geometric shift dress with a high collar"
            },
            {
                "label": "white vinyl minidress with circular cutouts",
                "value": "white vinyl minidress with circular cutouts"
            },
            {
                "label": "retro-futurist jumpsuit with contrasting piping",
                "value": "retro-futurist jumpsuit with contrasting piping"
            },
            {
                "label": "structured tunic with a broad disc collar and white tights",
                "value": "structured tunic with a broad disc collar and white tights"
            },
            {
                "label": "chrome-accented spaceflight uniform",
                "value": "chrome-accented spaceflight uniform"
            }
        ],
        "variants": {
            "editorial": {
                "label": "Space-Age Fashion Editorial",
                "value": "1960s space-age fashion editorial, crisp retro-futurist styling, saturated color film",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "softStudioLight",
                    "highKeyLighting"
                ],
                "photographicLook": [
                    "1960sSlideFilm"
                ]
            },
            "pulp": {
                "label": "Retro Science Fiction Illustration",
                "value": "1960s pulp science-fiction magazine illustration with bold flat colors and airbrushed chrome",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "dramaticColoredLighting",
                    "softStudioLight"
                ]
            },
            "technicolor": {
                "label": "Technicolor Film Still",
                "value": "1960s Technicolor retro-futurist cinema still with practical miniature-set atmosphere",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "softStudioLight",
                    "coloredPracticalLights"
                ],
                "photographicLook": [
                    "technicolor"
                ]
            }
        },
        "scenes": [
            {
                "label": "Spaceship Control Deck",
                "setting": "aboard a spotless 1960s imagined spacecraft with round portholes, illuminated analog controls, and curved white consoles",
                "actions": [
                    "studying a blinking control console",
                    "standing before a circular observation window",
                    "reaching for a large red toggle switch"
                ]
            },
            {
                "label": "Lunar Colony Lounge",
                "setting": "inside a bubble-domed lunar lounge with spherical chairs and a panoramic view of the gray moon",
                "actions": [
                    "reclining in a spherical chair",
                    "gazing out at the lunar horizon",
                    "walking past a row of glowing floor panels"
                ]
            },
            {
                "label": "Atomic Research Lab",
                "setting": "inside a gleaming atomic-age research laboratory with glass cylinders and oversized dials",
                "actions": [
                    "examining a glowing specimen",
                    "writing readings on a clipboard",
                    "adjusting a chrome control dial"
                ]
            },
            {
                "label": "Alien Landscape",
                "setting": "on a brightly colored alien landscape with bulbous rock formations and two moons",
                "actions": [
                    "stepping cautiously down a landing ramp",
                    "surveying the strange horizon",
                    "holding a translucent mineral sample"
                ]
            }
        ]
    },

    victorianGothic: {
        "label": "Victorian Gothic",
        "era": "Victorian",
        "subjectMode": "required",
        "hairstyles": [
            {
                "label": "dark ringlets pinned behind the ears",
                "value": "dark ringlets pinned behind the ears"
            },
            {
                "label": "center-parted braided chignon",
                "value": "center-parted braided chignon"
            },
            {
                "label": "long loose windswept curls",
                "value": "long loose windswept curls"
            },
            {
                "label": "severe smooth low bun",
                "value": "severe smooth low bun"
            },
            {
                "label": "loose waves spilling from a lace bonnet",
                "value": "loose waves spilling from a lace bonnet"
            }
        ],
        "outfits": [
            {
                "label": "black crepe mourning dress with jet-bead trim",
                "value": "black crepe mourning dress with jet-bead trim"
            },
            {
                "label": "deep burgundy velvet gown with high collar",
                "value": "deep burgundy velvet gown with high collar"
            },
            {
                "label": "dark bustle dress with lace cuffs",
                "value": "dark bustle dress with lace cuffs"
            },
            {
                "label": "heavy traveling cloak over a fitted day dress",
                "value": "heavy traveling cloak over a fitted day dress"
            },
            {
                "label": "tailored black frock coat and waistcoat",
                "value": "tailored black frock coat and waistcoat"
            },
            {
                "label": "embroidered silk gown with a cameo brooch",
                "value": "embroidered silk gown with a cameo brooch"
            }
        ],
        "variants": {
            "painting": {
                "label": "Dark Romantic Oil Painting",
                "value": "19th-century dark romantic oil painting, textured canvas, gothic atmosphere",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "candlelightFirelight",
                    "lowKeyChiaroscuro",
                    "moonlight"
                ]
            },
            "photograph": {
                "label": "Gothic Period Photograph",
                "value": "moody Victorian photographic portrait, restrained sepia tones and antique lens softness",
                "cameraAngles": [
                    "eyeLevel"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "windowLight",
                    "lowKeyChiaroscuro"
                ],
                "photographicLook": [
                    "sepia"
                ]
            },
            "illustration": {
                "label": "Gothic Book Illustration",
                "value": "engraved Victorian gothic book illustration with dense crosshatching and ominous shadows",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "moonlight",
                    "candlelightFirelight"
                ]
            }
        },
        "scenes": [
            {
                "label": "Abandoned Conservatory",
                "setting": "in an overgrown glass conservatory with cracked panes, climbing ivy and rain-streaked windows",
                "actions": [
                    "holding a candle beside an overgrown fountain",
                    "examining a dead rose",
                    "standing silhouetted beneath broken glass"
                ]
            },
            {
                "label": "Ancestral Library",
                "setting": "in a gloomy Victorian manor library with floor-to-ceiling bookshelves and a dying fireplace",
                "actions": [
                    "reading an unopened letter by firelight",
                    "standing beside a tall arched window",
                    "pulling a dusty book from a shelf"
                ]
            },
            {
                "label": "Fogbound Cemetery",
                "setting": "among leaning Victorian gravestones and wrought-iron gates beneath thick evening fog",
                "actions": [
                    "kneeling beside a weathered headstone",
                    "holding a black lace parasol",
                    "walking along a narrow stone path"
                ]
            },
            {
                "label": "Grand Staircase",
                "setting": "on the carved staircase of a decaying Gothic mansion beneath a tarnished chandelier",
                "actions": [
                    "looking back over one shoulder",
                    "descending with a flickering candle",
                    "holding a sealed letter against the chest"
                ]
            }
        ]
    },

    gangster1920s: {
        "label": "1920s Gangster Portraits",
        "era": "1920s",
        "subjectMode": "required",
        "hairstyles": [
            {
                "label": "slicked-back hair with a sharp side part",
                "value": "slicked-back hair with a sharp side part"
            },
            {
                "label": "finger waves close to the scalp",
                "value": "finger waves close to the scalp"
            },
            {
                "label": "short flapper bob with blunt fringe",
                "value": "short flapper bob with blunt fringe"
            },
            {
                "label": "neatly waved pompadour",
                "value": "neatly waved pompadour"
            },
            {
                "label": "cloche hat over a short bob",
                "value": "cloche hat over a short bob"
            }
        ],
        "outfits": [
            {
                "label": "dark pinstripe three-piece suit and fedora",
                "value": "dark pinstripe three-piece suit and fedora"
            },
            {
                "label": "double-breasted suit with suspenders and two-tone shoes",
                "value": "double-breasted suit with suspenders and two-tone shoes"
            },
            {
                "label": "beaded drop-waist flapper dress with a feather headband",
                "value": "beaded drop-waist flapper dress with a feather headband"
            },
            {
                "label": "silk evening gown with a long pearl necklace",
                "value": "silk evening gown with a long pearl necklace"
            },
            {
                "label": "white shirt with rolled sleeves, vest and tie",
                "value": "white shirt with rolled sleeves, vest and tie"
            },
            {
                "label": "long wool overcoat and felt fedora",
                "value": "long wool overcoat and felt fedora"
            }
        ],
        "variants": {
            "crimePhoto": {
                "label": "Archival Crime Photograph",
                "value": "grainy 1920s black-and-white crime press photograph with period film grain",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "waistUp",
                    "34Body",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "hardSideLighting",
                    "windowLight"
                ],
                "photographicLook": [
                    "blackWhite"
                ]
            },
            "cinema": {
                "label": "Silent-Era Film Still",
                "value": "1920s silent-era gangster film still, monochrome silver-gelatin texture",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "lowKeyChiaroscuro",
                    "hardSideLighting"
                ],
                "photographicLook": [
                    "blackWhite"
                ]
            },
            "poster": {
                "label": "Pulp Crime Illustration",
                "value": "vintage pulp crime magazine illustration with bold shadows and hand-painted color",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "dramaticColoredLighting",
                    "lowKeyChiaroscuro"
                ]
            }
        },
        "scenes": [
            {
                "label": "Speakeasy Back Room",
                "setting": "inside a smoky Prohibition-era speakeasy with green felt card tables and a hidden bar",
                "actions": [
                    "shuffling a deck of cards",
                    "sitting beside a half-empty whiskey glass",
                    "leaning across a card table"
                ]
            },
            {
                "label": "Chicago Street",
                "setting": "on a rain-darkened 1920s Chicago street beside a boxy period automobile",
                "actions": [
                    "stepping out of a vintage touring car",
                    "standing under a streetlamp",
                    "glancing over a shoulder beside a brick wall"
                ]
            },
            {
                "label": "Gangster Office",
                "setting": "in a wood-paneled 1920s office with a rotary telephone, ledger books and venetian blinds",
                "actions": [
                    "sitting behind a cluttered desk",
                    "holding a telephone receiver",
                    "studying a folded newspaper"
                ]
            },
            {
                "label": "Police Mugshot",
                "setting": "against a marked police identification wall in a 1920s station",
                "actions": [
                    "facing forward holding a numbered placard",
                    "standing in profile with hands at sides",
                    "looking directly into the camera"
                ]
            }
        ]
    },

    filmNoir1940s: {
        "label": "1940s Film Noir",
        "era": "1940s",
        "subjectMode": "required",
        "hairstyles": [
            {
                "label": "glossy side-swept Hollywood waves",
                "value": "glossy side-swept Hollywood waves"
            },
            {
                "label": "short sculpted finger waves",
                "value": "short sculpted finger waves"
            },
            {
                "label": "neat side-parted hair under a fedora",
                "value": "neat side-parted hair under a fedora"
            },
            {
                "label": "soft shoulder-length curls",
                "value": "soft shoulder-length curls"
            },
            {
                "label": "slicked-back hair",
                "value": "slicked-back hair"
            }
        ],
        "outfits": [
            {
                "label": "dark trench coat over a tailored suit",
                "value": "dark trench coat over a tailored suit"
            },
            {
                "label": "double-breasted suit with a tilted fedora",
                "value": "double-breasted suit with a tilted fedora"
            },
            {
                "label": "satin evening gown with long gloves",
                "value": "satin evening gown with long gloves"
            },
            {
                "label": "pencil skirt and fitted jacket",
                "value": "pencil skirt and fitted jacket"
            },
            {
                "label": "dark overcoat with a narrow tie",
                "value": "dark overcoat with a narrow tie"
            },
            {
                "label": "silk blouse with a high-waisted skirt",
                "value": "silk blouse with a high-waisted skirt"
            }
        ],
        "variants": {
            "film": {
                "label": "Black-and-White Film Still",
                "value": "1940s black-and-white film noir still, deep blacks, luminous highlights, smoky atmosphere",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "lowKeyChiaroscuro",
                    "hardSideLighting",
                    "venetianBlindShadows"
                ],
                "photographicLook": [
                    "blackWhite"
                ]
            },
            "publicity": {
                "label": "Studio Publicity Portrait",
                "value": "1940s Hollywood publicity portrait with dramatic sculpted monochrome studio lighting",
                "cameraAngles": [
                    "eyeLevel"
                ],
                "cameraFraming": [
                    "waistUp",
                    "34Body"
                ],
                "lighting": [
                    "softStudioLight",
                    "hardSideLighting"
                ],
                "photographicLook": [
                    "blackWhite"
                ]
            }
        },
        "scenes": [
            {
                "label": "Detective Office",
                "setting": "inside a cramped detective office with venetian blinds, cigarette smoke and a rain-speckled window",
                "actions": [
                    "sitting at a desk reading a mysterious letter",
                    "standing in a shaft of light from the blinds",
                    "holding a telephone receiver"
                ]
            },
            {
                "label": "Rainy Alley",
                "setting": "in a narrow rain-soaked city alley reflecting neon signage",
                "actions": [
                    "walking beneath a streetlamp",
                    "looking back toward a shadowed doorway",
                    "standing beside a vintage sedan"
                ]
            },
            {
                "label": "Nightclub",
                "setting": "inside a shadowy 1940s nightclub with a tiny stage and round tables",
                "actions": [
                    "leaning against a piano",
                    "sitting alone at a candlelit table",
                    "watching the entrance through a veil of smoke"
                ]
            },
            {
                "label": "Rooftop at Midnight",
                "setting": "on a wet rooftop overlooking a dense city skyline at midnight",
                "actions": [
                    "standing beside a brick parapet",
                    "holding a folded note",
                    "looking toward a distant illuminated window"
                ]
            }
        ]
    },

    artNouveau: {
        "label": "Art Nouveau",
        "era": "1890s-1910s",
        "subjectMode": "required",
        "hairstyles": [
            {
                "label": "long flowing waves threaded with flowers",
                "value": "long flowing waves threaded with flowers"
            },
            {
                "label": "braided updo with curling tendrils",
                "value": "braided updo with curling tendrils"
            },
            {
                "label": "soft center-parted hair cascading down the back",
                "value": "soft center-parted hair cascading down the back"
            },
            {
                "label": "loose romantic curls crowned with leaves",
                "value": "loose romantic curls crowned with leaves"
            }
        ],
        "outfits": [
            {
                "label": "flowing silk gown with botanical embroidery",
                "value": "flowing silk gown with botanical embroidery"
            },
            {
                "label": "long draped dress with a high empire waist",
                "value": "long draped dress with a high empire waist"
            },
            {
                "label": "sheer layered gown with embroidered irises",
                "value": "sheer layered gown with embroidered irises"
            },
            {
                "label": "ornate robe with stylized peacock-feather motifs",
                "value": "ornate robe with stylized peacock-feather motifs"
            },
            {
                "label": "high-necked Edwardian gown with lace panels",
                "value": "high-necked Edwardian gown with lace panels"
            }
        ],
        "variants": {
            "lithograph": {
                "label": "Decorative Lithographic Poster",
                "value": "Art Nouveau color lithograph poster, flowing organic linework, flat decorative colors, ornate floral border",
                "cameraAngles": [
                    "eyeLevel"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body"
                ],
                "lighting": [
                    "softNaturalLight"
                ]
            },
            "watercolor": {
                "label": "Art Nouveau Watercolor",
                "value": "delicate Art Nouveau watercolor and ink illustration with curling botanical ornament",
                "cameraAngles": [
                    "eyeLevel"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "softNaturalLight",
                    "windowLight"
                ]
            },
            "oil": {
                "label": "Symbolist Oil Painting",
                "value": "turn-of-the-century Symbolist oil painting with decorative botanical forms and luminous muted colors",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "softNaturalLight",
                    "goldenHour"
                ]
            }
        },
        "scenes": [
            {
                "label": "Iris Garden",
                "setting": "amid towering irises and curling vines arranged in ornamental symmetry",
                "actions": [
                    "holding a single iris",
                    "standing beneath an arch of flowers",
                    "tracing the edge of a leaf"
                ]
            },
            {
                "label": "Decorative Fountain",
                "setting": "beside a mosaic fountain with flowing water and stylized lilies",
                "actions": [
                    "sitting on a carved stone ledge",
                    "reaching toward the water",
                    "holding a trailing silk scarf"
                ]
            },
            {
                "label": "Botanical Conservatory",
                "setting": "inside a glass botanical conservatory filled with lilies and climbing roses",
                "actions": [
                    "standing between tall flowering stems",
                    "examining a delicate blossom",
                    "leaning against an ornate railing"
                ]
            },
            {
                "label": "Ornate Music Room",
                "setting": "inside an elegant salon with stained glass, carved wood and a gilded harp",
                "actions": [
                    "resting one hand on a harp",
                    "reading a folded sheet of music",
                    "standing beside an arched stained-glass window"
                ]
            }
        ]
    },

    scienceFiction1970s: {
        "label": "1970s Science Fiction",
        "era": "1970s",
        "subjectMode": "required",
        "hairstyles": [
            {
                "label": "feathered shoulder-length hair",
                "value": "feathered shoulder-length hair"
            },
            {
                "label": "shag haircut with long fringe",
                "value": "shag haircut with long fringe"
            },
            {
                "label": "rounded natural Afro",
                "value": "rounded natural Afro"
            },
            {
                "label": "long straight center-parted hair",
                "value": "long straight center-parted hair"
            },
            {
                "label": "short utilitarian crop",
                "value": "short utilitarian crop"
            }
        ],
        "outfits": [
            {
                "label": "quilted retro astronaut jumpsuit with mission patches",
                "value": "quilted retro astronaut jumpsuit with mission patches"
            },
            {
                "label": "cream-colored utility tunic and tall boots",
                "value": "cream-colored utility tunic and tall boots"
            },
            {
                "label": "padded spaceflight suit with ribbed panels",
                "value": "padded spaceflight suit with ribbed panels"
            },
            {
                "label": "retro-futurist jumpsuit with a wide belt",
                "value": "retro-futurist jumpsuit with a wide belt"
            },
            {
                "label": "weathered expedition jacket and cargo trousers",
                "value": "weathered expedition jacket and cargo trousers"
            },
            {
                "label": "high-collared metallic space uniform",
                "value": "high-collared metallic space uniform"
            }
        ],
        "variants": {
            "cinema": {
                "label": "1970s Science Fiction Film Still",
                "value": "1970s practical-effects science-fiction film still, tactile sets, subtle film grain",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "coloredPracticalLights",
                    "lowKeyChiaroscuro"
                ],
                "photographicLook": [
                    "1970sColorFilm"
                ]
            },
            "paperback": {
                "label": "Vintage Paperback Cover",
                "value": "1970s science-fiction paperback cover painting with painterly cosmic vistas",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "dramaticColoredLighting",
                    "goldenHour"
                ]
            },
            "airbrush": {
                "label": "Retro Airbrush Concept Art",
                "value": "1970s retro-futurist airbrushed concept art with soft gradients and industrial detail",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "coloredPracticalLights",
                    "softStudioLight"
                ]
            }
        },
        "scenes": [
            {
                "label": "Analog Starship Bridge",
                "setting": "on a rugged starship bridge filled with CRT screens, toggle switches and exposed conduit",
                "actions": [
                    "consulting an analog navigation console",
                    "watching a distant planet through the viewport",
                    "speaking into a wall-mounted communicator"
                ]
            },
            {
                "label": "Alien Desert",
                "setting": "on a barren alien desert beneath a ringed planet and enormous rust-colored cliffs",
                "actions": [
                    "examining a strange stone artifact",
                    "walking toward an abandoned rover",
                    "standing on a ridge scanning the horizon"
                ]
            },
            {
                "label": "Space Station Corridor",
                "setting": "inside a worn orbital station with ribbed walls, pipes and amber indicator lights",
                "actions": [
                    "carrying a metal equipment case",
                    "peering through a circular hatch",
                    "checking a pressure gauge"
                ]
            },
            {
                "label": "Ancient Alien Temple",
                "setting": "inside a colossal alien ruin with angular stone monoliths and unfamiliar symbols",
                "actions": [
                    "approaching a glowing relic",
                    "holding a lantern toward a carved wall",
                    "standing dwarfed beneath a stone arch"
                ]
            }
        ]
    },

    darkFantasy1980s: {
        "label": "1980s Dark Fantasy",
        "era": "1980s",
        "subjectMode": "required",
        "hairstyles": [
            {
                "label": "long windblown hair",
                "value": "long windblown hair"
            },
            {
                "label": "wild shoulder-length curls",
                "value": "wild shoulder-length curls"
            },
            {
                "label": "thick warrior braids",
                "value": "thick warrior braids"
            },
            {
                "label": "long silver-white hair",
                "value": "long silver-white hair"
            },
            {
                "label": "roughly tied-back hair",
                "value": "roughly tied-back hair"
            }
        ],
        "outfits": [
            {
                "label": "weathered plate armor and a fur-lined cloak",
                "value": "weathered plate armor and a fur-lined cloak"
            },
            {
                "label": "leather adventurer tunic with a broad belt",
                "value": "leather adventurer tunic with a broad belt"
            },
            {
                "label": "dark sorcerer robes with embroidered runes",
                "value": "dark sorcerer robes with embroidered runes"
            },
            {
                "label": "chainmail shirt beneath a travel cloak",
                "value": "chainmail shirt beneath a travel cloak"
            },
            {
                "label": "velvet ceremonial gown with a jeweled clasp",
                "value": "velvet ceremonial gown with a jeweled clasp"
            },
            {
                "label": "heavy traveling cloak over worn leather armor",
                "value": "heavy traveling cloak over worn leather armor"
            }
        ],
        "variants": {
            "cover": {
                "label": "Fantasy Paperback Cover",
                "value": "1980s dark fantasy paperback cover painting, dramatic hand-painted brushwork and heroic composition",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "dramaticColoredLighting",
                    "moonlight",
                    "candlelightFirelight"
                ]
            },
            "oil": {
                "label": "Dark Fantasy Oil Illustration",
                "value": "richly textured fantasy oil illustration, misty ruins, monumental scale",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "lowKeyChiaroscuro",
                    "moonlight"
                ]
            },
            "film": {
                "label": "Practical-Effects Fantasy Film",
                "value": "1980s practical-effects dark fantasy film still, atmospheric smoke and tactile sets",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "candlelightFirelight",
                    "moonlight"
                ],
                "photographicLook": [
                    "1980sColorFilm"
                ]
            }
        },
        "scenes": [
            {
                "label": "Ruined Fortress",
                "setting": "in the courtyard of a ruined stone fortress beneath gathering storm clouds",
                "actions": [
                    "holding a sword pointed toward the ground",
                    "climbing broken steps",
                    "standing beside a weathered stone statue"
                ]
            },
            {
                "label": "Torchlit Cavern",
                "setting": "inside a vast cavern with ancient pillars and a dark underground pool",
                "actions": [
                    "lifting a torch to examine a carving",
                    "kneeling beside a strange relic",
                    "walking across a narrow stone bridge"
                ]
            },
            {
                "label": "Mountain Pass",
                "setting": "on a wind-scoured mountain pass overlooking a distant ruined citadel",
                "actions": [
                    "standing on a rocky ledge with cloak billowing",
                    "looking toward the far-off citadel",
                    "resting one hand on a sheathed sword"
                ]
            },
            {
                "label": "Forgotten Temple",
                "setting": "in an overgrown temple with giant carved faces and roots winding through the masonry",
                "actions": [
                    "reaching toward an illuminated altar",
                    "studying a broken statue",
                    "standing at the base of monumental stairs"
                ]
            }
        ]
    },

    fashionEditorial1970s: {
        "label": "1970s Fashion Editorial",
        "era": "1970s",
        "subjectMode": "required",
        "hairstyles": [
            {
                "label": "feathered Farrah-style waves",
                "value": "feathered Farrah-style waves"
            },
            {
                "label": "layered shag haircut",
                "value": "layered shag haircut"
            },
            {
                "label": "rounded natural Afro",
                "value": "rounded natural Afro"
            },
            {
                "label": "voluminous disco curls",
                "value": "voluminous disco curls"
            },
            {
                "label": "long center-parted straight hair",
                "value": "long center-parted straight hair"
            }
        ],
        "outfits": [
            {
                "label": "high-waisted bell-bottom trousers and fitted blouse",
                "value": "high-waisted bell-bottom trousers and fitted blouse"
            },
            {
                "label": "wide-collar jumpsuit with a broad belt",
                "value": "wide-collar jumpsuit with a broad belt"
            },
            {
                "label": "suede fringe jacket and flared jeans",
                "value": "suede fringe jacket and flared jeans"
            },
            {
                "label": "sequined disco dress and platform shoes",
                "value": "sequined disco dress and platform shoes"
            },
            {
                "label": "silk halter-neck dress",
                "value": "silk halter-neck dress"
            },
            {
                "label": "bold patterned shirt with wide-leg trousers",
                "value": "bold patterned shirt with wide-leg trousers"
            }
        ],
        "variants": {
            "magazine": {
                "label": "Vintage Fashion Magazine",
                "value": "1970s fashion magazine editorial, warm film grain, tactile styling",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "softStudioLight",
                    "goldenHour",
                    "warmIndoorLamps"
                ],
                "photographicLook": [
                    "1970sColorFilm"
                ]
            },
            "flash": {
                "label": "Direct-Flash Fashion Photo",
                "value": "1970s direct-flash fashion photography, punchy contrast and candid composition",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "directFlash",
                    "warmIndoorLamps"
                ],
                "photographicLook": [
                    "1970sColorFilm"
                ]
            },
            "advert": {
                "label": "Retro Advertising Illustration",
                "value": "1970s commercial fashion illustration with warm saturated palette and stylized brushwork",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "softStudioLight",
                    "goldenHour"
                ]
            }
        },
        "scenes": [
            {
                "label": "Disco Lounge",
                "setting": "in a 1970s disco lounge with mirrored panels, velvet booths and a glittering disco ball",
                "actions": [
                    "leaning against a velvet booth",
                    "standing beneath the disco ball",
                    "turning toward the dance floor"
                ]
            },
            {
                "label": "Desert Highway Editorial",
                "setting": "beside a vintage coupe on an empty desert highway at golden hour",
                "actions": [
                    "leaning on the car hood",
                    "walking along the road shoulder",
                    "adjusting oversized sunglasses"
                ]
            },
            {
                "label": "Sunken Living Room",
                "setting": "inside a 1970s modernist living room with a sunken seating area and sculptural lamps",
                "actions": [
                    "reclining on a low modular sofa",
                    "sitting in a sculptural chair",
                    "standing beside a geometric floor lamp"
                ]
            },
            {
                "label": "Rooftop Fashion Shoot",
                "setting": "on a city rooftop with an urban skyline and a portable fashion backdrop",
                "actions": [
                    "posing beside a folding reflector",
                    "turning into the breeze",
                    "standing with hands in trouser pockets"
                ]
            }
        ]
    },

    cyberpunkAnime1990s: {
        "label": "1990s Cyberpunk Anime",
        "era": "1990s",
        "subjectMode": "required",
        "hairstyles": [
            {
                "label": "angular asymmetrical bob",
                "value": "angular asymmetrical bob"
            },
            {
                "label": "short spiky hair with shaved sides",
                "value": "short spiky hair with shaved sides"
            },
            {
                "label": "straight black hair cut to the jaw",
                "value": "straight black hair cut to the jaw"
            },
            {
                "label": "long hair tied in a high ponytail",
                "value": "long hair tied in a high ponytail"
            },
            {
                "label": "short textured pixie with colored streaks",
                "value": "short textured pixie with colored streaks"
            }
        ],
        "outfits": [
            {
                "label": "armored motorcycle suit with neon piping",
                "value": "armored motorcycle suit with neon piping"
            },
            {
                "label": "oversized technical streetwear jacket and cargo pants",
                "value": "oversized technical streetwear jacket and cargo pants"
            },
            {
                "label": "futuristic trench coat over a utility harness",
                "value": "futuristic trench coat over a utility harness"
            },
            {
                "label": "sleek tactical bodysuit with padded panels",
                "value": "sleek tactical bodysuit with padded panels"
            },
            {
                "label": "layered urban streetwear with a high collar",
                "value": "layered urban streetwear with a high collar"
            }
        ],
        "variants": {
            "cel": {
                "label": "1990s Hand-Drawn Anime",
                "value": "1990s hand-drawn cyberpunk anime cel, detailed painted backgrounds, sharp inked outlines",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "urbanNeon",
                    "coloredPracticalLights"
                ]
            },
            "ova": {
                "label": "Retro Cyberpunk OVA Still",
                "value": "1990s original-video-animation cyberpunk still with gritty film texture and dense urban detail",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "urbanNeon",
                    "lowKeyChiaroscuro"
                ]
            },
            "poster": {
                "label": "Anime Film Poster",
                "value": "1990s Japanese cyberpunk anime poster illustration, dynamic composition and bold graphic silhouettes",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "dramaticColoredLighting",
                    "urbanNeon"
                ]
            }
        },
        "scenes": [
            {
                "label": "Neon Alley",
                "setting": "in a dense rain-soaked futuristic city alley beneath layered Japanese neon signs",
                "actions": [
                    "standing beside a parked motorcycle",
                    "looking up toward an elevated train",
                    "walking through puddles reflecting neon"
                ]
            },
            {
                "label": "Megacity Rooftop",
                "setting": "on the rooftop of a colossal cyberpunk megacity with antenna arrays and holographic billboards",
                "actions": [
                    "crouching near a ventilation unit",
                    "looking down toward the streets",
                    "holding a motorcycle helmet"
                ]
            },
            {
                "label": "Underground Terminal",
                "setting": "inside a crowded underground transit terminal with fluorescent panels and flickering monitors",
                "actions": [
                    "checking a handheld terminal",
                    "waiting beneath a departure board",
                    "walking past vending machines"
                ]
            },
            {
                "label": "Industrial Laboratory",
                "setting": "inside a futuristic laboratory filled with cables, tanks and glowing diagnostic screens",
                "actions": [
                    "studying a holographic display",
                    "reaching toward a sealed containment tank",
                    "standing beside an android repair station"
                ]
            }
        ]
    },

    midnightLaundromat: {
        "label": "Midnight Laundromat",
        "era": "Contemporary",
        "subjectMode": "optional",
        "hairstyles": [
            {
                "label": "messy bun with loose strands",
                "value": "messy bun with loose strands"
            },
            {
                "label": "short unstyled hair",
                "value": "short unstyled hair"
            },
            {
                "label": "shoulder-length natural waves",
                "value": "shoulder-length natural waves"
            },
            {
                "label": "hair tucked under a knit beanie",
                "value": "hair tucked under a knit beanie"
            }
        ],
        "outfits": [
            {
                "label": "oversized hoodie and faded jeans",
                "value": "oversized hoodie and faded jeans"
            },
            {
                "label": "plain work uniform with a name patch",
                "value": "plain work uniform with a name patch"
            },
            {
                "label": "worn denim jacket over a T-shirt",
                "value": "worn denim jacket over a T-shirt"
            },
            {
                "label": "loose sweater and comfortable trousers",
                "value": "loose sweater and comfortable trousers"
            }
        ],
        "variants": {
            "film": {
                "label": "Cinematic Night Photography",
                "value": "cinematic 35mm night photography, lonely urban atmosphere and natural film grain",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "fluorescentLighting",
                    "urbanNeon"
                ],
                "photographicLook": [
                    "35mmColorFilm"
                ]
            },
            "surreal": {
                "label": "Surreal Documentary Photograph",
                "value": "subtly surreal documentary photography, uncanny stillness and meticulously ordinary details",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "fluorescentLighting",
                    "urbanNeon"
                ],
                "photographicLook": [
                    "35mmColorFilm"
                ]
            }
        },
        "scenes": [
            {
                "label": "Empty Laundromat",
                "setting": "inside an almost empty twenty-four-hour laundromat with rows of circular washer doors and humming fluorescent ceiling panels",
                "actions": [
                    "sitting alone on a plastic chair watching a washer",
                    "folding a shirt on a scratched counter",
                    "standing beside a spinning washing machine"
                ]
            },
            {
                "label": "Laundromat Window",
                "setting": "inside a late-night laundromat beside a broad window overlooking a deserted strip mall",
                "actions": [
                    "looking out at the rain-soaked parking lot",
                    "holding a laundry basket",
                    "leaning against a row of dryers"
                ]
            },
            {
                "label": "Neon Parking Lot",
                "setting": "outside a laundromat in a nearly deserted strip-mall parking lot beneath a buzzing OPEN sign",
                "actions": [
                    "carrying a basket toward the entrance",
                    "standing beside a flickering vending machine",
                    "watching headlights pass in the distance"
                ]
            },
            {
                "label": "Empty Machines",
                "setting": "inside a deserted laundromat with one brightly lit washer spinning and no people present",
                "actions": [
                    "a single red sock rotates behind the washer glass",
                    "the far row of machines glows beneath buzzing fluorescent tubes",
                    "an unattended laundry basket sits in the center aisle"
                ],
                "subjectMode": "none"
            }
        ]
    },

    desertRoadSurrealism: {
        "label": "Desert Road Surrealism",
        "era": "Contemporary",
        "subjectMode": "optional",
        "hairstyles": [
            {
                "label": "windswept shoulder-length hair",
                "value": "windswept shoulder-length hair"
            },
            {
                "label": "loose natural curls",
                "value": "loose natural curls"
            },
            {
                "label": "hair tucked under a sun-faded cap",
                "value": "hair tucked under a sun-faded cap"
            },
            {
                "label": "short tousled hair",
                "value": "short tousled hair"
            }
        ],
        "outfits": [
            {
                "label": "faded denim jacket and jeans",
                "value": "faded denim jacket and jeans"
            },
            {
                "label": "plain white T-shirt and work trousers",
                "value": "plain white T-shirt and work trousers"
            },
            {
                "label": "worn western shirt and boots",
                "value": "worn western shirt and boots"
            },
            {
                "label": "light cotton sundress with a wide-brim hat",
                "value": "light cotton sundress with a wide-brim hat"
            },
            {
                "label": "dusty mechanic coveralls",
                "value": "dusty mechanic coveralls"
            }
        ],
        "variants": {
            "film": {
                "label": "Surreal Road Cinema",
                "value": "surreal widescreen road-movie photograph, unsettling empty space and grounded realism",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "environmentalPortrait",
                    "wideShot"
                ],
                "lighting": [
                    "goldenHour",
                    "harshMiddaySun",
                    "moonlight"
                ],
                "photographicLook": [
                    "35mmColorFilm"
                ]
            },
            "painting": {
                "label": "Hyperreal Desert Painting",
                "value": "hyperreal surrealist painting of an impossible roadside landscape, meticulous detail and vast negative space",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "environmentalPortrait",
                    "wideShot"
                ],
                "lighting": [
                    "goldenHour",
                    "harshMiddaySun"
                ]
            },
            "retro": {
                "label": "Faded Roadside Postcard",
                "value": "faded mid-century roadside color postcard with subtly impossible architecture",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "environmentalPortrait",
                    "wideShot"
                ],
                "lighting": [
                    "goldenHour",
                    "harshMiddaySun"
                ],
                "photographicLook": [
                    "vintagePostcard"
                ]
            }
        },
        "scenes": [
            {
                "label": "Endless Highway",
                "setting": "on a ruler-straight desert highway vanishing into the horizon beneath an enormous cloudless sky",
                "actions": [
                    "standing alone beside a parked car",
                    "walking toward a distant road sign",
                    "watching an impossible second sun above the horizon"
                ]
            },
            {
                "label": "Abandoned Gas Station",
                "setting": "at an abandoned roadside gas station surrounded by empty desert and faded advertising signs",
                "actions": [
                    "standing beside a silent fuel pump",
                    "examining an unlit OPEN sign",
                    "looking toward a distant dust plume"
                ]
            },
            {
                "label": "Impossible Motel",
                "setting": "outside a lonely desert motel whose corridor appears to extend farther than the building itself",
                "actions": [
                    "standing beside a room door",
                    "walking past identical motel doors",
                    "staring at a glowing vacancy sign"
                ]
            },
            {
                "label": "Empty Desert Road",
                "setting": "an empty desert highway with a solitary telephone booth, distant mesas and no people anywhere",
                "actions": [
                    "a single phone rings in an empty glass booth",
                    "the road stretches toward a horizon that bends upward",
                    "a floating roadside sign casts a long shadow"
                ],
                "subjectMode": "none"
            },
            {
                "label": "Dry Lakebed",
                "setting": "on a vast cracked dry lakebed beneath a gigantic suspended geometric shape",
                "actions": [
                    "standing dwarfed beneath the hovering shape",
                    "walking across the cracked earth",
                    "watching a distant mirage"
                ],
                "subjectMode": "optional"
            }
        ]
    },

    roadsideMotel1950s: {
        "label": "1950s Roadside Motel",
        "era": "1950s",
        "subjectMode": "required",
        "hairstyles": [
            {
                "label": "short curled pageboy",
                "value": "short curled pageboy"
            },
            {
                "label": "high ponytail tied with a ribbon",
                "value": "high ponytail tied with a ribbon"
            },
            {
                "label": "soft shoulder-length pin curls",
                "value": "soft shoulder-length pin curls"
            },
            {
                "label": "neatly combed pompadour",
                "value": "neatly combed pompadour"
            },
            {
                "label": "short rolled fringe",
                "value": "short rolled fringe"
            }
        ],
        "outfits": [
            {
                "label": "1950s summer sundress with a fitted waist",
                "value": "1950s summer sundress with a fitted waist"
            },
            {
                "label": "high-waisted shorts and a tucked-in blouse",
                "value": "high-waisted shorts and a tucked-in blouse"
            },
            {
                "label": "bowling shirt and cuffed trousers",
                "value": "bowling shirt and cuffed trousers"
            },
            {
                "label": "knit cardigan over a circle skirt",
                "value": "knit cardigan over a circle skirt"
            },
            {
                "label": "1950s swimsuit with a halter neckline",
                "value": "1950s swimsuit with a halter neckline"
            },
            {
                "label": "short-sleeved camp-collar shirt and slacks",
                "value": "short-sleeved camp-collar shirt and slacks"
            }
        ],
        "variants": {
            "kodachrome": {
                "label": "Kodachrome Roadside Photograph",
                "value": "1950s Kodachrome roadside travel photograph, rich vintage color and gentle film grain",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "goldenHour",
                    "harshMiddaySun",
                    "urbanNeon"
                ],
                "photographicLook": [
                    "1950sMagazine"
                ]
            },
            "postcard": {
                "label": "Vintage Motel Postcard",
                "value": "1950s linen-finish roadside motel postcard illustration, saturated optimistic colors",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "goldenHour",
                    "softNaturalLight"
                ],
                "photographicLook": [
                    "vintagePostcard"
                ]
            },
            "advert": {
                "label": "Mid-Century Advertising Art",
                "value": "1950s American roadside advertising illustration with clean painted shapes and bright color",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "softStudioLight",
                    "goldenHour"
                ]
            }
        },
        "scenes": [
            {
                "label": "Motel Courtyard",
                "setting": "in a 1950s motor-court motel with pastel room doors, metal lawn chairs and a glowing VACANCY sign",
                "actions": [
                    "carrying a small suitcase toward a room",
                    "sitting on a metal lawn chair",
                    "leaning against a parked two-tone sedan"
                ]
            },
            {
                "label": "Roadside Pool",
                "setting": "beside a turquoise motel swimming pool with striped umbrellas and desert mountains beyond",
                "actions": [
                    "sitting on the pool edge with feet in the water",
                    "adjusting sunglasses on a lounge chair",
                    "standing beneath a striped umbrella"
                ]
            },
            {
                "label": "Motel Room",
                "setting": "inside a modest 1950s motel room with patterned bedspread, wooden television and bedside lamps",
                "actions": [
                    "sitting on the edge of the bed reading a postcard",
                    "looking out through half-open curtains",
                    "setting a suitcase on a luggage rack"
                ]
            },
            {
                "label": "Neon Diner",
                "setting": "outside a chrome-trimmed roadside diner beside a motel parking lot",
                "actions": [
                    "standing next to a jukebox visible through the window",
                    "walking toward the diner entrance",
                    "leaning against a pastel-colored vintage car"
                ]
            }
        ]
    },
    prohibitionSpeakeasy1920s: {
        "label": "1920s Prohibition Speakeasy",
        "era": "1920s",
        "subjectMode": "required",
        "hairstyles": [
            {
                "label": "sleek finger-wave bob",
                "value": "sleek finger-wave bob"
            },
            {
                "label": "short shingled bob",
                "value": "short shingled bob"
            },
            {
                "label": "jeweled headband over Marcel waves",
                "value": "jeweled headband over Marcel waves"
            },
            {
                "label": "soft Marcel waves pinned beneath a cloche hat",
                "value": "soft Marcel waves pinned beneath a cloche hat"
            },
            {
                "label": "slick side-parted hair",
                "value": "slick side-parted hair"
            },
            {
                "label": "neatly combed short hair",
                "value": "neatly combed short hair"
            },
            {
                "label": "finger waves with a feathered headpiece",
                "value": "finger waves with a feathered headpiece"
            }
        ],
        "outfits": [
            {
                "label": "fringed beaded flapper dress with T-strap heels",
                "value": "fringed beaded flapper dress with T-strap heels"
            },
            {
                "label": "drop-waist silk dress and long pearl necklace",
                "value": "drop-waist silk dress and long pearl necklace"
            },
            {
                "label": "beaded evening gown with a feathered headband",
                "value": "beaded evening gown with a feathered headband"
            },
            {
                "label": "velvet evening dress with a faux-fur stole",
                "value": "velvet evening dress with a faux-fur stole"
            },
            {
                "label": "three-piece pinstripe suit with two-tone spectator shoes",
                "value": "three-piece pinstripe suit with two-tone spectator shoes"
            },
            {
                "label": "white dinner jacket and bow tie",
                "value": "white dinner jacket and bow tie"
            },
            {
                "label": "waistcoat with rolled shirt sleeves and sleeve garters",
                "value": "waistcoat with rolled shirt sleeves and sleeve garters"
            },
            {
                "label": "dark tailored overcoat and cloche hat",
                "value": "dark tailored overcoat and cloche hat"
            }
        ],
        "variants": {
            "photo": {
                "label": "1920s Monochrome Photograph",
                "value": "authentic-looking late-1920s black-and-white nightlife photograph, silver-gelatin grain, slight halation and period tonal range",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "warmTungstenLight",
                    "softStudioLight"
                ],
                "photographicLook": [
                    "blackWhite"
                ]
            },
            "artDeco": {
                "label": "Art Deco Jazz Age Poster",
                "value": "1920s Art Deco lithographic nightlife poster, bold geometry, jewel tones, stylized silhouettes and elegant decorative typography-free composition",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "warmStudioLight"
                ],
                "photographicLook": [
                    "vintageIllustration"
                ]
            },
            "cinematic": {
                "label": "Cinematic Period Photography",
                "value": "cinematic photograph set in a 1920s Prohibition speakeasy, authentic period detail, rich atmospheric shadows, amber practical lamps and subtle film grain",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "warmTungstenLight",
                    "lowKeyChiaroscuro"
                ],
                "photographicLook": [
                    "cinematicFilmLook"
                ]
            },
            "magazine": {
                "label": "Vintage Magazine Illustration",
                "value": "late-1920s illustrated magazine cover artwork, expressive hand-painted figures, period color palette and lively jazz-age composition",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp"
                ],
                "lighting": [
                    "warmStudioLight"
                ],
                "photographicLook": [
                    "vintageIllustration"
                ]
            }
        },
        "scenes": [
            {
                "label": "Charleston Dance Floor",
                "setting": "a crowded underground 1920s speakeasy dance floor with Art Deco chandeliers, polished parquet, velvet booths and a lively jazz band",
                "actions": [
                    "kicking and swiveling through the Charleston among dancing couples",
                    "dancing the Charleston with a partner while the crowd cheers",
                    "clapping along beside the dance floor",
                    "playing trumpet on the bandstand as flappers dance"
                ]
            },
            {
                "label": "Secret Basement Bar",
                "setting": "a concealed Prohibition-era basement bar with polished mahogany counter, brass foot rail, amber lamps, rows of unlabeled bottles and patrons in evening wear",
                "actions": [
                    "leaning on the bar while a bartender pours bootleg whiskey",
                    "serving drinks from behind the mahogany counter",
                    "raising a cocktail glass in a crowded bar",
                    "whispering to a companion over a drink"
                ]
            },
            {
                "label": "Private Gangster Booth",
                "setting": "a secluded velvet booth at the back of a smoky 1920s speakeasy with a green-felt card table, poker chips, low amber lamps and heavy curtains",
                "actions": [
                    "studying a poker hand across the table",
                    "stacking poker chips beside a whiskey glass",
                    "leaning close to whisper to an associate",
                    "sitting in a pinstripe suit with a fedora resting on the table"
                ]
            },
            {
                "label": "Jazz Club Performance",
                "setting": "an intimate underground jazz stage in a 1920s speakeasy with an upright piano, trumpet player, upright bassist and vintage standing microphone",
                "actions": [
                    "singing into a vintage microphone beneath a spotlight",
                    "playing an upright bass beside the pianist",
                    "playing trumpet onstage while the audience watches",
                    "sitting at the piano during a lively jazz number"
                ]
            },
            {
                "label": "Unmarked Alley Entrance",
                "setting": "a rain-soaked 1920s city alley outside an unmarked speakeasy door, dim streetlamp, wet brickwork and a discreet peephole",
                "actions": [
                    "approaching the hidden door in a fur-trimmed coat",
                    "knocking at the unmarked door and glancing over a shoulder",
                    "waiting under a streetlamp for the doorman",
                    "slipping through a half-open doorway into the club"
                ]
            },
            {
                "label": "Police Raid",
                "setting": "a chaotic Prohibition-era speakeasy during a police raid, overturned chairs, spilled cocktails, swinging pendant lamps and startled patrons",
                "actions": [
                    "rushing toward a concealed exit as officers enter",
                    "hiding bottles behind the bar in a hurry",
                    "standing startled beside an overturned card table",
                    "pulling a companion away from the crowded dance floor"
                ]
            },
            {
                "label": "Charleston Dance Contest",
                "setting": "a glamorous late-1920s dance contest in a hidden nightclub with an excited crowd surrounding the polished floor and a hot jazz ensemble",
                "actions": [
                    "performing an energetic Charleston kick sequence",
                    "dancing back-to-back with a partner as spectators cheer",
                    "taking a dramatic final pose at the end of a Charleston routine"
                ]
            },
            {
                "label": "Dance Marathon",
                "setting": "a crowded late-1920s dance marathon inside a jazz-age ballroom, weary couples and spectators seated around the edges",
                "actions": [
                    "dancing slowly with an exhausted partner beneath the chandeliers",
                    "resting at the edge of the floor with a glass of water"
                ]
            }
        ]
    },
    dinerLife1950s: {
        "label": "1950s Diner & Rockabilly",
        "era": "1950s",
        "subjectMode": "required",
        "hairstyles": [
            {
                "label": "high ponytail tied with a scarf",
                "value": "high ponytail tied with a scarf"
            },
            {
                "label": "short curled poodle cut",
                "value": "short curled poodle cut"
            },
            {
                "label": "rolled bangs and victory-inspired curls",
                "value": "rolled bangs and victory-inspired curls"
            },
            {
                "label": "greased pompadour",
                "value": "greased pompadour"
            },
            {
                "label": "smooth pageboy",
                "value": "smooth pageboy"
            }
        ],
        "outfits": [
            {
                "label": "pastel circle skirt and fitted cardigan",
                "value": "pastel circle skirt and fitted cardigan"
            },
            {
                "label": "capri pants with a tucked-in blouse",
                "value": "capri pants with a tucked-in blouse"
            },
            {
                "label": "letterman jacket over a white T-shirt and cuffed jeans",
                "value": "letterman jacket over a white T-shirt and cuffed jeans"
            },
            {
                "label": "short-sleeved diner waitress uniform with apron",
                "value": "short-sleeved diner waitress uniform with apron"
            },
            {
                "label": "bowling shirt and pleated trousers",
                "value": "bowling shirt and pleated trousers"
            }
        ],
        "variants": {
            "photo": {
                "label": "Kodachrome Snapshot",
                "value": "1950s Kodachrome candid photograph, rich colors and subtle grain",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "softNaturalLight",
                    "urbanNeon",
                    "warmTungstenLight"
                ],
                "photographicLook": [
                    "1950sMagazine"
                ]
            },
            "advert": {
                "label": "Midcentury Advertising Illustration",
                "value": "1950s hand-painted commercial illustration with clean shapes and cheerful color",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "softStudioLight"
                ],
                "photographicLook": [
                    "vintageAdvertisingIllustration"
                ]
            }
        },
        "scenes": [
            {
                "label": "After-School Diner",
                "setting": "a busy chrome-trimmed 1950s diner with red vinyl booths, jukeboxes, checkerboard tile and milkshake glasses",
                "actions": [
                    "sharing a milkshake across a booth",
                    "leaning against the jukebox choosing a record",
                    "carrying a tray of burgers and fries between booths"
                ]
            },
            {
                "label": "Midnight Counter",
                "setting": "an almost-empty roadside diner after midnight, chrome stools, coffee urns and neon reflected in the windows",
                "actions": [
                    "sitting alone at the counter over a cup of coffee",
                    "wiping down the counter beneath the neon sign",
                    "reading a folded road map at a booth"
                ]
            },
            {
                "label": "Drive-In Date",
                "setting": "a 1950s drive-in restaurant with carhop service, colorful signage and parked classic cars",
                "actions": [
                    "sitting on the hood of a two-tone 1956 Chevrolet Bel Air",
                    "delivering a tray of sodas on roller skates",
                    "talking through the open window of a parked convertible"
                ]
            },
            {
                "label": "Sock Hop",
                "setting": "a high-school gymnasium decorated with crepe-paper streamers and a live rock-and-roll band",
                "actions": [
                    "dancing the jitterbug with a partner",
                    "spinning in a full circle skirt",
                    "watching couples dance from the bleachers"
                ]
            },
            {
                label: "Last Dance at the Sock Hop",
                setting: "a dimly lit 1950s high school gymnasium decorated for a sock hop, with crepe-paper streamers, a polished wooden dance floor, a few couples in the background, and a soft smoky haze",
                subjectMode: "multiple",
                actions: [
                    "a young couple slow dancing in a close embrace, her head resting gently on his shoulder, eyes closed, his arms wrapped around her",
                    "a couple swaying slowly to a romantic ballad, holding each other close as the dance winds down",
                    "a couple sharing a quiet, tender moment on the nearly empty dance floor, her cheek against his shoulder"
                ],
                lighting: ["dimWarmOverheadLightingWithSoftShadows", "subtleAmberStageLightingFilteringThroughTheHaze"]
            }
        ]
    },
    modStreet1960s: {
        "label": "1960s Mod City Life",
        "era": "1960s",
        "subjectMode": "required",
        "hairstyles": [
            {
                "label": "geometric Vidal Sassoon bob",
                "value": "geometric Vidal Sassoon bob"
            },
            {
                "label": "flipped-end bob",
                "value": "flipped-end bob"
            },
            {
                "label": "tall beehive",
                "value": "tall beehive"
            },
            {
                "label": "short pixie cut",
                "value": "short pixie cut"
            },
            {
                "label": "long straight center-parted hair",
                "value": "long straight center-parted hair"
            }
        ],
        "outfits": [
            {
                "label": "bold color-blocked A-line minidress and white go-go boots",
                "value": "bold color-blocked A-line minidress and white go-go boots"
            },
            {
                "label": "graphic Op Art shift dress",
                "value": "graphic Op Art shift dress"
            },
            {
                "label": "tailored narrow-lapel suit and Chelsea boots",
                "value": "tailored narrow-lapel suit and Chelsea boots"
            },
            {
                "label": "miniskirt and fitted turtleneck",
                "value": "miniskirt and fitted turtleneck"
            },
            {
                "label": "pillbox hat with a coordinated skirt suit",
                "value": "pillbox hat with a coordinated skirt suit"
            }
        ],
        "variants": {
            "editorial": {
                "label": "Swinging Sixties Editorial",
                "value": "1960s London fashion editorial with vivid color film and playful graphic composition",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "softStudioLight",
                    "overcastDaylight"
                ],
                "photographicLook": [
                    "1960sSlideFilm"
                ]
            },
            "film": {
                "label": "1960s Street Photograph",
                "value": "candid 1960s street photography with authentic period color and film grain",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "softNaturalLight",
                    "goldenHour"
                ],
                "photographicLook": [
                    "vintageColorFilm"
                ]
            }
        },
        "scenes": [
            {
                "label": "Carnaby Street",
                "setting": "London Carnaby Street in the mid-1960s, colorful boutiques, window displays and period scooters",
                "actions": [
                    "walking past a row of fashion boutiques",
                    "posing beside a parked Vespa scooter",
                    "looking at geometric dresses in a shop window"
                ]
            },
            {
                "label": "Mod Apartment",
                "setting": "a fashionable mid-1960s apartment with an egg chair, graphic wallpaper, a record player and bold plastic furniture",
                "actions": [
                    "lounging in a white molded chair while holding a record sleeve",
                    "dancing beside a portable record player",
                    "looking out through floor-to-ceiling windows"
                ]
            },
            {
                "label": "Go-Go Club",
                "setting": "a 1960s dance club with geometric light panels and a live beat band",
                "actions": [
                    "dancing the twist with friends",
                    "performing on a small raised go-go platform",
                    "watching the band from a booth"
                ]
            }
        ]
    },
    rollerDisco1970s: {
        "label": "1970s Roller Disco",
        "era": "1970s",
        "subjectMode": "required",
        "hairstyles": [
            {
                "label": "feathered shoulder-length hair",
                "value": "feathered shoulder-length hair"
            },
            {
                "label": "voluminous Afro",
                "value": "voluminous Afro"
            },
            {
                "label": "long straight center-parted hair",
                "value": "long straight center-parted hair"
            },
            {
                "label": "curly shag haircut",
                "value": "curly shag haircut"
            },
            {
                "label": "disco curls",
                "value": "disco curls"
            }
        ],
        "outfits": [
            {
                "label": "striped tube socks and satin athletic shorts",
                "value": "striped tube socks and satin athletic shorts"
            },
            {
                "label": "bright fitted roller-disco jumpsuit",
                "value": "bright fitted roller-disco jumpsuit"
            },
            {
                "label": "bell-bottom jeans and a glittery top",
                "value": "bell-bottom jeans and a glittery top"
            },
            {
                "label": "ringer T-shirt and short athletic shorts",
                "value": "ringer T-shirt and short athletic shorts"
            },
            {
                "label": "retro track jacket and flared pants",
                "value": "retro track jacket and flared pants"
            }
        ],
        "variants": {
            "film": {
                "label": "1970s Roller-Rink Film Still",
                "value": "warm-grained 1970s color film still with energetic candid movement",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "coloredDiscoLights",
                    "warmTungstenLight"
                ],
                "photographicLook": [
                    "1970sColorFilm"
                ]
            },
            "editorial": {
                "label": "Retro Roller Disco Poster",
                "value": "bright 1970s roller-skating advertisement with bold typography-inspired composition",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "coloredDiscoLights",
                    "softStudioLight"
                ],
                "photographicLook": [
                    "vintageAdvertisingIllustration"
                ]
            }
        },
        "scenes": [
            {
                "label": "Roller Rink",
                "setting": "a packed 1970s roller rink with a glossy hardwood floor, mirrored disco ball, colored light spots and a snack bar",
                "actions": [
                    "gliding backward on quad roller skates",
                    "skating hand-in-hand with a partner",
                    "spinning beneath the disco ball",
                    "tying roller-skate laces on a bench"
                ]
            },
            {
                "label": "Skate Rental Counter",
                "setting": "the skate-rental counter of a retro roller rink with shelves of quad skates and orange plastic seating",
                "actions": [
                    "leaning on the counter holding a pair of rental skates",
                    "helping a friend lace up skates",
                    "watching the rink through a glass partition"
                ]
            },
            {
                "label": "Rink Parking Lot",
                "setting": "outside a 1970s roller rink at dusk, illuminated marquee, vintage cars and groups of teenagers",
                "actions": [
                    "sitting on a curb adjusting quad skates",
                    "laughing with friends beside a parked van",
                    "carrying roller skates over one shoulder"
                ]
            }
        ]
    },
    atticBedroom1970s: {
        "label": "1970s Attic Bedroom",
        "era": "1970s",
        "subjectMode": "required",
        "hairstyles": [
            {
                "label": "long feathered hair with a center part",
                "value": "long feathered hair with a center part"
            },
            {
                "label": "shag haircut with wispy bangs",
                "value": "shag haircut with wispy bangs"
            },
            {
                "label": "loose natural curls",
                "value": "loose natural curls"
            },
            {
                "label": "full rounded Afro",
                "value": "full rounded Afro"
            },
            {
                "label": "long straight hair",
                "value": "long straight hair"
            }
        ],
        "outfits": [
            {
                "label": "faded band T-shirt and bell-bottom jeans",
                "value": "faded band T-shirt and bell-bottom jeans"
            },
            {
                "label": "crocheted vest over a peasant blouse",
                "value": "crocheted vest over a peasant blouse"
            },
            {
                "label": "short denim cutoffs and striped knee socks",
                "value": "short denim cutoffs and striped knee socks"
            },
            {
                "label": "corduroy flares and a fitted ribbed top",
                "value": "corduroy flares and a fitted ribbed top"
            },
            {
                "label": "oversized sweater and flared jeans",
                "value": "oversized sweater and flared jeans"
            }
        ],
        "variants": {
            "snapshot": {
                "label": "1970s Bedroom Snapshot",
                "value": "intimate 1970s 35mm color snapshot with warm grain and lived-in realism",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "warmTungstenLight",
                    "windowLight"
                ],
                "photographicLook": [
                    "1970sColorFilm"
                ]
            },
            "cinematic": {
                "label": "Nostalgic 1970s Film Still",
                "value": "cinematic 1970s coming-of-age film still with natural textures and restrained warm color",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "windowLight",
                    "warmTungstenLight"
                ],
                "photographicLook": [
                    "vintageColorFilm"
                ]
            }
        },
        "scenes": [
            {
                "label": "Poster-Covered Attic Bedroom",
                "setting": "a cozy 1970s attic bedroom with a sharply sloped ceiling, wood-paneled walls plastered with rock-band posters, a low unmade bed, shag rug, record player and scattered LP sleeves",
                "actions": [
                    "sitting cross-legged on the shag rug flipping through vinyl records",
                    "lying on the bed listening to music through oversized headphones",
                    "taping another concert poster onto the angled ceiling",
                    "leaning against the bed reading a music magazine"
                ]
            },
            {
                "label": "Rainy Afternoon in the Attic",
                "setting": "a small 1970s attic bedroom with an angled ceiling, band posters, rain streaking a dormer window and a glowing bedside lamp",
                "actions": [
                    "watching rain from the dormer window",
                    "writing in a notebook while a record spins",
                    "sitting on the bed with a guitar"
                ]
            },
            {
                "label": "Attic Sleepover",
                "setting": "a poster-covered 1970s attic bedroom lit by a lava lamp, with sleeping bags, magazines and vinyl records on the floor",
                "actions": [
                    "laughing with friends on the shag carpet",
                    "passing around a stack of album covers",
                    "playing a board game beneath the slanted ceiling"
                ]
            }
        ]
    },
    arcadeMall1980s: {
        "label": "1980s Mall & Arcade",
        "era": "1980s",
        "subjectMode": "required",
        "hairstyles": [
            {
                "label": "big teased hair",
                "value": "big teased hair"
            },
            {
                "label": "high side ponytail",
                "value": "high side ponytail"
            },
            {
                "label": "feathered mullet",
                "value": "feathered mullet"
            },
            {
                "label": "crimped shoulder-length hair",
                "value": "crimped shoulder-length hair"
            },
            {
                "label": "short spiky haircut",
                "value": "short spiky haircut"
            }
        ],
        "outfits": [
            {
                "label": "acid-wash jeans and oversized graphic sweatshirt",
                "value": "acid-wash jeans and oversized graphic sweatshirt"
            },
            {
                "label": "bright windbreaker and high-top sneakers",
                "value": "bright windbreaker and high-top sneakers"
            },
            {
                "label": "denim jacket over a band T-shirt",
                "value": "denim jacket over a band T-shirt"
            },
            {
                "label": "neon leotard with leggings and leg warmers",
                "value": "neon leotard with leggings and leg warmers"
            },
            {
                "label": "preppy polo shirt and pleated khaki pants",
                "value": "preppy polo shirt and pleated khaki pants"
            }
        ],
        "variants": {
            "film": {
                "label": "1980s Teen Movie Still",
                "value": "1980s teen comedy film still with vivid practical lighting and fine analog grain",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "urbanNeon",
                    "fluorescentLighting",
                    "warmTungstenLight"
                ],
                "photographicLook": [
                    "1980sColorFilm"
                ]
            },
            "snapshot": {
                "label": "1980s Mall Snapshot",
                "value": "candid consumer 35mm film photograph from the 1980s",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "fluorescentLighting",
                    "softNaturalLight"
                ],
                "photographicLook": [
                    "vintageColorFilm"
                ]
            }
        },
        "scenes": [
            {
                "label": "Video Arcade",
                "setting": "a bustling 1980s arcade filled with glowing upright game cabinets, patterned carpet, neon signs and teenagers",
                "actions": [
                    "leaning over a joystick during a high-score attempt",
                    "watching a friend play an arcade machine",
                    "holding a paper cup of tokens beside the cabinets"
                ]
            },
            {
                "label": "Shopping Mall Food Court",
                "setting": "a 1980s suburban mall food court with potted palms, skylights, bright storefronts and molded plastic tables",
                "actions": [
                    "sharing a tray of fries with friends",
                    "sitting at a table with shopping bags",
                    "looking over a mall directory"
                ]
            },
            {
                "label": "Cassette Bedroom",
                "setting": "a teenager’s 1980s bedroom with cassette tapes, band posters, a boombox and colorful geometric bedding",
                "actions": [
                    "making a mixtape on a double-cassette deck",
                    "dancing in front of a bedroom mirror",
                    "lying on the floor reading liner notes"
                ]
            },
            {
                "label": "Video Rental Store",
                "setting": "a 1980s video rental shop with rows of VHS boxes and fluorescent ceiling lights",
                "actions": [
                    "browsing a shelf of horror movie tapes",
                    "holding up two VHS cases to compare them",
                    "standing at the checkout counter with a stack of rentals"
                ]
            }
        ]
    },
    grunge1990s: {
        "label": "1990s Grunge & Alternative",
        "era": "1990s",
        "subjectMode": "required",
        "hairstyles": [
            {
                "label": "messy shoulder-length hair",
                "value": "messy shoulder-length hair"
            },
            {
                "label": "chin-length choppy bob",
                "value": "chin-length choppy bob"
            },
            {
                "label": "grown-out pixie cut",
                "value": "grown-out pixie cut"
            },
            {
                "label": "long unstyled center-parted hair",
                "value": "long unstyled center-parted hair"
            },
            {
                "label": "shaggy layered hair",
                "value": "shaggy layered hair"
            }
        ],
        "outfits": [
            {
                "label": "oversized flannel over a faded band T-shirt and ripped jeans",
                "value": "oversized flannel over a faded band T-shirt and ripped jeans"
            },
            {
                "label": "thrift-store floral slip dress with combat boots",
                "value": "thrift-store floral slip dress with combat boots"
            },
            {
                "label": "worn denim jacket and loose jeans",
                "value": "worn denim jacket and loose jeans"
            },
            {
                "label": "striped long-sleeve shirt and canvas sneakers",
                "value": "striped long-sleeve shirt and canvas sneakers"
            },
            {
                "label": "baggy cargo pants and a vintage hoodie",
                "value": "baggy cargo pants and a vintage hoodie"
            }
        ],
        "variants": {
            "film": {
                "label": "1990s Indie Film Still",
                "value": "gritty 1990s independent film still with muted color and visible grain",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "overcastDaylight",
                    "warmTungstenLight",
                    "stageLighting"
                ],
                "photographicLook": [
                    "1990sFilm"
                ]
            },
            "snapshot": {
                "label": "1990s Disposable Camera",
                "value": "1990s disposable-camera snapshot with direct flash, imperfect framing and grain",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "directFlash",
                    "overcastDaylight"
                ],
                "photographicLook": [
                    "2000sDisposableCamera"
                ]
            }
        },
        "scenes": [
            {
                "label": "Garage Band Rehearsal",
                "setting": "a cluttered 1990s garage rehearsal space with battered amplifiers, a drum kit, cables and peeling gig flyers",
                "actions": [
                    "tuning an electric guitar beside an amplifier",
                    "sitting on a speaker watching the band rehearse",
                    "singing into a wired microphone"
                ]
            },
            {
                "label": "Record Store",
                "setting": "an independent 1990s record store with crowded CD racks, vinyl bins, handwritten staff picks and music posters",
                "actions": [
                    "flipping through secondhand records",
                    "holding a CD case under the fluorescent lights",
                    "talking with a friend near the listening station"
                ]
            },
            {
                "label": "Rainy Seattle Street",
                "setting": "a rain-soaked Pacific Northwest street in the early 1990s with brick storefronts, gig flyers and parked older cars",
                "actions": [
                    "walking with hands in the pockets of an oversized flannel",
                    "waiting outside a small music venue",
                    "leaning against a brick wall under an awning"
                ]
            },
            {
                "label": "Alternative Bedroom",
                "setting": "a messy 1990s bedroom with zines, band posters, a bulky CRT television, cassette tapes and thrift-store furniture",
                "actions": [
                    "sitting on the floor making a mixtape",
                    "reading a photocopied zine on the bed",
                    "pinning a concert ticket to a corkboard"
                ]
            }
        ]
    },
    modernEveryday: {
        "label": "2000s–Modern Everyday Life",
        "era": "2000s",
        "subjectMode": "required",
        "hairstyles": [
            {
                label: "Box Braids",
                value: "hair styled in long box braids",
                nationalities: ["Black", "Mixed-Race"]
            },
            {
                label: "Cornrows",
                value: "hair styled in neat cornrows",
                nationalities: ["Black", "Mixed-Race"]
            },
            {
                label: "Blonde and Black Cornrows",
                value: "cornrows with alternating black and blonde braids",
                hairColor: "black and blonde",
                nationalities: ["Black", "Mixed-Race"]
            },
            {
                "label": "long straight layered hair",
                "value": "long straight layered hair"
            },
            {
                "label": "side-swept bangs",
                "value": "side-swept bangs"
            },
            {
                "label": "messy bun",
                "value": "messy bun"
            },
            {
                "label": "short textured pixie cut",
                "value": "short textured pixie cut"
            },
            {
                "label": "loose natural curls",
                "value": "loose natural curls"
            },
            {
                "label": "shoulder-length bob",
                "value": "shoulder-length bob"
            }
        ],
        styling: [
            "a small floral tattoo on her shoulder",
            "a delicate nose piercing",
            "multiple ear piercings",
            "tattoos on both arms",
            "no visible tattoos or piercings"
        ],
        "outfits": [
            {
                "label": "jeans and a fitted T-shirt",
                "value": "jeans and a fitted T-shirt"
            },
            {
                "label": "casual sundress and sneakers",
                "value": "casual sundress and sneakers"
            },
            {
                "label": "hoodie and joggers",
                "value": "hoodie and joggers"
            },
            {
                "label": "business-casual blouse and trousers",
                "value": "business-casual blouse and trousers"
            },
            {
                "label": "tank top and denim shorts",
                "value": "tank top and denim shorts"
            },
            {
                "label": "light jacket over a graphic T-shirt",
                "value": "light jacket over a graphic T-shirt"
            }
        ],
        "variants": {
            "digital": {
                "label": "Contemporary Digital Photography",
                "value": "natural contemporary digital photography with realistic color and crisp detail",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "windowLight",
                    "softNaturalLight",
                    "goldenHour",
                    "warmTungstenLight"
                ],
                "photographicLook": [
                    "contemporaryDigitalPhoto"
                ]
            },
            "phone": {
                "label": "Casual Phone Snapshot",
                "value": "candid smartphone photograph with everyday imperfections and natural composition",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "softNaturalLight",
                    "warmIndoorLamps"
                ],
                "photographicLook": [
                    "smartphoneSnapshot"
                ]
            },
            "y2k": {
                "label": "Early 2000s Digital Camera",
                "value": "early-2000s compact digital camera photograph with direct flash and period color rendering",
                "cameraAngles": [
                    "eyeLevel",
                    "lowAngle",
                    "highAngle"
                ],
                "cameraFraming": [
                    "fullBody",
                    "34Body",
                    "waistUp",
                    "environmentalPortrait"
                ],
                "lighting": [
                    "directFlash",
                    "softNaturalLight"
                ],
                "photographicLook": [
                    "earlyDigitalCamera"
                ]
            }
        },
        "scenes": [
            {
                "label": "Apartment Kitchen",
                "setting": "a lived-in apartment kitchen with dishes drying by the sink, magnets on the refrigerator and morning light",
                "actions": [
                    "making coffee at the counter",
                    "leaning against the refrigerator checking a phone",
                    "preparing breakfast while talking with a friend"
                ]
            },
            {
                "label": "Coffee Shop",
                "setting": "a neighborhood coffee shop with worn wooden tables, large windows and a busy espresso counter",
                "actions": [
                    "reading at a window table",
                    "waiting for a drink at the pickup counter",
                    "talking with a friend over coffee"
                ]
            },
            {
                "label": "Apartment Living Room",
                "setting": "a comfortable modern living room with a sofa, throw blanket, plants and a television",
                "actions": [
                    "sitting on the rug sorting photographs",
                    "curling up on the couch reading a book",
                    "playing a video game with friends"
                ]
            },
            {
                "label": "City Sidewalk",
                "setting": "a busy contemporary city sidewalk with storefronts, bicycles and passing pedestrians",
                "actions": [
                    "walking with a takeaway coffee",
                    "waiting at a pedestrian crossing",
                    "checking directions on a phone"
                ]
            },
            {
                "label": "Backyard Evening",
                "setting": "a modest suburban backyard with patio chairs, string lights and a small table",
                "actions": [
                    "sitting beneath string lights talking with friends",
                    "watering plants along a fence",
                    "looking out over the yard at dusk"
                ]
            },
            {
                "label": "Early-2000s Computer Desk",
                "setting": "a Y2K-era bedroom with a beige CRT monitor, CD-R spindle, wired mouse and posters",
                "actions": [
                    "sitting at the desk browsing the internet",
                    "holding up a freshly burned CD",
                    "talking on a corded phone while looking at the monitor"
                ]
            }
        ]
    }
};

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
        hairColors: ["blonde", "brunette", "black", "ginger", "light brown", "dark brown"],
        skinTones: ["porcelain", "light", "fair", "sun-kissed tan"],
        eyeColors: ["brown", "hazel", "green", "blue", "amber"]
    },

    {
        label: "Black",
        value: "with African facial features",
        hairColors: ["dark brown", "black", "blonde", "black with blonde highlights"],
        skinTones: ["rich mocha", "brown", "dark brown", "deep ebony"],
        eyeColors: ["dark brown", "black"]
    },
    {
        label: "Mexican",
        value: "with Mexican facial features",
        hairColors: ["dark brown", "black"],
        skinTones: ["warm olive tan", "sun-darkened"],
        eyeColors: ["dark brown", "black", "light brown"]
    },
    {
        label: "Mixed-Race",
        value: "with a blend of African and European facial features",
        hairColors: ["dark brown", "black", "blonde"],
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
        hairColors: ["dark brown", "black"],
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
    { label: "Adult with achondroplasia", value: "adult with achondroplasia, characteristic short stature and naturally proportioned body" },
    { label: "Pregnant", value: "pregnant adult with a visibly rounded pregnant belly" },
    { label: "Heavily pregnant", value: "heavily pregnant adult with a large, prominently rounded late-stage pregnancy belly" }
];

const cameraFramingPresets = {
    "closeUp": "close-up portrait framing",
    "headShoulders": "head-and-shoulders portrait framing",
    "chestUp": "chest-up framing",
    "waistUp": "waist-up framing",
    "34Body": "three-quarter body framing",
    "fullBody": "full-body framing with the entire subject visible",
    "wideShot": "wide shot showing the subject and surrounding environment",
    "environmentalPortrait": "environmental portrait with the subject integrated into the surrounding scene",
};

const cameraAnglePresets = {
    "eyeLevel": "natural eye-level camera angle",
    "lowAngle": "low-angle view looking upward toward the subject",
    "wormSEye": "extreme low-angle worm's-eye view",
    "highAngle": "high-angle view looking downward toward the subject",
    "overhead": "directly overhead camera view looking down at the subject",
    "sideView": "side-view perspective",
    "34View": "three-quarter view of the subject from an oblique angle",
    "overTheShoulder": "over-the-shoulder camera view",
    "pov": "first-person point-of-view perspective",
    "dutchAngle": "tilted Dutch-angle composition",
};

const timeOfDayPresets = [
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

const lightingPresets = {
    "softNaturalLight": "soft natural illumination with gentle shadows",
    "directSunlight": "direct sunlight with strong highlights and defined shadows",
    "overcastDiffused": "broad diffused natural light with soft even illumination",
    "windowLight": "soft directional natural light entering through a window",
    "windowLightThroughSheerCurtains": "natural window light filtered through sheer curtains, creating soft diffused illumination and delicate shadows",
    "dappledLight": "dappled natural light creating irregular patches of light and shadow",
    "warmIndoorLamps": "warm practical lamp lighting with natural interior ambience",
    "candlelightFirelight": "warm flickering candlelight and firelight with soft surrounding shadows",
    "urbanNeon": "colorful neon and street lighting with nighttime urban ambience",
    "softStudioLight": "soft flattering studio illumination with gentle shadows",
    "hardDirectionalLight": "hard directional illumination with crisp defined shadows",
    "sideLighting": "directional side lighting emphasizing form and dimensionality",
    "backlighting": "strong backlighting with the primary light positioned behind the subject",
    "rimLighting": "bright rim lighting outlining the subject against the background",
    "lowKeyChiaroscuro": "dramatic low-key lighting with chiaroscuro and deep shadows",
    "volumetricRays": "visible volumetric light rays passing through a subtly hazy atmosphere",
    "moodyHighContrastLighting": "Moody High-Contrast Lighting",
    "highKeyLighting": "High-Key Lighting",
    "dramaticColoredLighting": "Dramatic Colored Lighting",
    "coloredPracticalLights": "Colored Practical Lights",
    "moonlight": "Moonlight",
    "hardSideLighting": "Hard Side Lighting",
    "venetianBlindShadows": "Venetian Blind Shadows",
    "goldenHour": "Golden Hour",
    "directFlash": "Direct Flash",
    "fluorescentLighting": "Fluorescent Lighting",
    "harshMiddaySun": "Harsh Midday Sun",
    "warmTungstenLight": "Warm Tungsten Light",
    "warmStudioLight": "Warm Studio Light",
    "dimWarmOverheadLightingWithSoftShadows": "dim, warm overhead lighting with soft shadows",
    "subtleAmberStageLightingFilteringThroughTheHaze": "subtle amber stage lighting filtering through the haze",
    "overcastDaylight": "Overcast Daylight",
    "coloredDiscoLights": "Colored Disco Lights",
    "stageLighting": "Stage Lighting",
};

const photographicLookPresets = {
    "blackWhite": "black-and-white photographic treatment",
    "highContrastNoir": "high-contrast black-and-white noir photography with deep blacks and dramatic tonal separation",
    "softMonochrome": "soft monochrome photographic treatment with gentle tonal transitions",
    "sepia": "warm sepia-toned photographic treatment",
    "1930sEarlyColorFilm": { value: "1930s early color-film aesthetic with muted tones and classic pre-war photographic softness", tags: ["1930s"] },
    "1940sKodachrome": { value: "1940s Kodachrome-inspired photography with rich saturated color and gentle vintage contrast", tags: ["1940s"] },
    "1950sMagazine": { value: "1950s glossy magazine photography with polished tones, subtle bloom, and clean mid-century color", tags: ["1950s"] },
    "1960sSlideFilm": { value: "1960s slide-film photography with vibrant saturated color and crisp vintage rendering", tags: ["1960s"] },
    "1970sPolaroid": { value: "1970s Polaroid snapshot aesthetic with warm tones, soft contrast, and instant-film color drift", tags: ["1970s"] },
    "1980sVhs": { value: "1980s VHS aesthetic with analog softness, washed color, and subtle magnetic video noise", tags: ["1980s"] },
    "1990sFilm": { value: "1990s consumer film photography with natural color, smooth tonal transitions, and nostalgic analog character", tags: ["1990s"] },
    "2000sDisposableCamera": { value: "2000s disposable-camera snapshot aesthetic with direct-flash character, slight color cast, soft focus, and inexpensive film imperfections", tags: ["2000s"] },
    "technicolor": "Technicolor",
    "1970sColorFilm": "1970s Color Film",
    "1980sColorFilm": "1980s Color Film",
    "35mmColorFilm": "35mm Color Film",
    "vintagePostcard": "Vintage Postcard",
    "vintageIllustration": "Vintage Illustration",
    "cinematicFilmLook": "Cinematic Film Look",
    "vintageAdvertisingIllustration": "Vintage Advertising Illustration",
    "vintageColorFilm": "Vintage Color Film",
    "contemporaryDigitalPhoto": "Contemporary Digital Photo",
    "smartphoneSnapshot": "Smartphone Snapshot",
    "earlyDigitalCamera": "Early Digital Camera",
    "1950sKodachrome": "1950s Kodachrome-inspired color film with vivid mid-century color and gentle contrast",
    "1990sColorFilm": "1990s color-film photograph with subtle grain and natural tones",
};

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
        )
    ]
});

function randomize(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function randomObjectValue(object) {
    return randomize(Object.values(object));
}

function resolvePreset(key, presets) {
    const preset = presets[key] ?? key;
    return typeof preset === "object" && preset !== null
        ? (preset.value ?? "")
        : preset;
}

function selectVisualProperty(scene, variant, property, presets) {
    const options = scene[property]?.length
        ? scene[property]
        : (variant[property] ?? []);

    if (options.length === 0) {
        return "";
    }

    return resolvePreset(randomize(options), presets);
}

function buildSingleSubject(concept) {

    // NATIONALITY
    const nationalityOptions = nationalityPresets.filter(
        item => !item.named
    );

    const nationality = promptSelections[4][0] === 0
        ? randomize(nationalityOptions)
        : nationalityPresets[promptSelections[4][0] - 1];

    // AGE
    const age = promptSelections[5][0] === 0
        ? randomize(agePresets)
        : agePresets[promptSelections[5][0] - 1];

    // BODY TYPE
    const overallBuild = promptSelections[7][0] === 0
        ? randomize(overallBuildPresets)
        : overallBuildPresets[promptSelections[7][0] - 1];

    // HAIR
    const eligibleHairstyles = (concept.hairstyles ?? []).filter(
        style =>
            !style.nationalities ||
            style.nationalities.includes(nationality.label)
    );

    const hairstyle = randomize(eligibleHairstyles);
    const hairColor = hairstyle?.hairColor ??
        randomize(nationality.hairColors ?? []);

    // APPEARANCE
    const skinTone = randomize(nationality.skinTones ?? []);
    const eyeColor = randomize(nationality.eyeColors ?? []);
    const styling = randomize(concept.styling ?? []);

    // OUTFIT
    const outfit = randomize(concept.outfits ?? []);

    const pregnant = promptSelections[6][0] === true;
    const achondroplasia = promptSelections[6][1] === true;

    return {
        nationality,
        age,
        overallBuild,
        hairstyle,
        hairColor,
        skinTone,
        eyeColor,
        outfit,
        styling,
        pregnant,
        achondroplasia
    };
}

function formatSingleSubject(subject) {
    const {
        nationality,
        age,
        overallBuild,
        hairstyle,
        hairColor,
        skinTone,
        eyeColor,
        outfit,
        styling,
        pregnant,
        achondroplasia
    } = subject;

    // Named character presets already describe the character; don't add
    // a second nationality, age, or body description on top of them.
    const identity = nationality.named
        ? nationality.value
        : `a ${age}-year-old ${nationality.label} ${gender}`;

    const hairStyle = hairstyle?.value ?? "hair";

    const hasPresetHairColor =
        Boolean(hairstyle?.hairColor) ||
        /^(?:dark|black|blonde|brown|red|ginger|silver|white|gray|grey)\b/i.test(hairStyle);

    const hair = hasPresetHairColor
        ? hairStyle
        : [hairColor, hairStyle].filter(Boolean).join(" ");

    const appearance = nationality.named ? [] : [
        skinTone ? `with ${skinTone} skin` : "",
        hair,
        eyeColor ? `${eyeColor} eyes` : "",
        nationality.value,
        overallBuild?.value
    ];

    const description = [
        identity,
        ...appearance,
        pregnant ? "pregnant with a visibly rounded belly" : "",
        achondroplasia ? "with achondroplasia and characteristic short stature" : "",
        outfit?.value ? `wearing ${outfit.value}` : "",
        styling
    ];

    return description.filter(Boolean).join(", ");
}

async function generateBatch() {

    canvas.clear();

    const conceptOptions = Object.values(visualPresets);

    const concept = promptSelections[3][0] === 0
        ? randomize(conceptOptions)
        : conceptOptions[promptSelections[3][0] - 1];

    const variant = randomObjectValue(concept.variants);
    const scene = randomize(concept.scenes);
    const action = randomize(scene.actions ?? []);

    const cameraAngle = selectVisualProperty(
        scene,
        variant,
        "cameraAngles",
        cameraAnglePresets
    );

    const cameraFraming = selectVisualProperty(
        scene,
        variant,
        "cameraFraming",
        cameraFramingPresets
    );

    const lighting = selectVisualProperty(
        scene,
        variant,
        "lighting",
        lightingPresets
    );

    const photographicLook = selectVisualProperty(
        scene,
        variant,
        "photographicLook",
        photographicLookPresets
    );

    const subject = buildSingleSubject(concept);
    const subjectDescription = formatSingleSubject(subject);

    const imagePrompt = [
        `${variant.value} featuring ${subjectDescription}`,
        action,
        scene.setting,
        cameraFraming,
        cameraAngle,
        lighting,
        photographicLook
    ].filter(Boolean).join(", ") + ".";

    console.log("GENERATED PROMPT:\n" + imagePrompt);

    // console.log("Generating:");
    // console.log(imagePrompt);

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

    const aspectRatioOptions = [
        "portrait",
        "square",
        "landscape"
    ];

    const aspectRatio = promptSelections[0][0] === 0
        ? randomize(aspectRatioOptions)
        : aspectRatioOptions[promptSelections[0][0] - 1];

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

    if (!DEBUG) {
        await pipeline.run({
            configuration: config,
            prompt: imagePrompt
        });
    }

    console.log(DEBUG ? "Debug prompt complete." : "Image complete.");
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

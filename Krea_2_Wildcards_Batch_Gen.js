//@api-1.0

the_women = [

    "18-year-old tall thin Japanese woman with long straight black hair, a flat chest, narrow hips, long legs and a small ass"]

// Start with one empty outfit so the script still generates
// if you haven't filled in custom outfit entries yet.
outfits = [""]

actions = [
    "standing in a bedroom with an arched back, shoulders pulled back, breasts pushed upward, her arms above her head and hands in her hair",

    "Leaning back against a cool tiled shower wall, one knee bent, water running down her body, sheer white tank top clinging wet, tiny black thong",

    "Standing in front of a full-length mirror, twisting to look over her shoulder while pulling her hair up — silk robe completely open, nothing underneath",

    "One foot up on a chair, body arched, hands behind her head — oversized men’s dress shirt unbuttoned and slipping off one shoulder.",

    "Pressed against a floor-to-ceiling window at night, city lights behind her, palms flat on the glass — black lace bodysuit with the crotch cutout.",

    "Leaning over a kitchen counter, elbows down, ass out, looking back — tiny apron only, nothing else. Kneeling / On All Fours",

    "On all fours on a rumpled white bed, head turned to the side, back arched hard — sheer black stockings + garter belt, no panties.",

    "Kneeling on the floor between a man’s legs (or empty chair), looking up with soft eyes while resting her cheek on his thigh — oversized sweater slipping off one shoulder, bare below.",

    "Kneeling on a soft rug in front of a fireplace, hands on her thighs, chest pushed forward — only a long pearl necklace and high heels.",

    "On her knees facing away, looking back over her shoulder while reaching back to pull one cheek aside — red lace thong and matching thigh-highs. Lying / Reclining",

    "On her back on a dark leather couch, one leg hooked over the backrest, other foot on the floor — unbuttoned jeans pulled halfway down, no bra under a cropped hoodie.",

    "Lying on her side on silk sheets with the top leg bent high, hand lightly between her thighs — black satin slip riding up.",

    "On her stomach on a sunlit windowsill, chin resting on her hands, legs bent at the knees and crossed at the ankles in the air — tiny white cotton panties only.",

    "Reclining in a bathtub with one leg draped over the edge, water lapping at her hips — wet white button-up shirt completely see-through. Dynamic / Movement",

    "Mid-stretch reaching both arms overhead while rising up on her toes — thin sports bra and tiny bike shorts, morning light from the side.",

    "Walking toward the camera down a hallway, one hand trailing along the wall, looking straight at the lens — only a long open coat and heels.",

    "Sitting on the edge of a desk and slowly sliding off it, legs parting as she does — tight pencil skirt pushed up, blouse half-unbuttoned.",

    "Catching herself mid-fall against a wall after slipping out of heels, one knee on the floor — lace teddy and garters."]

async function generateBatch() {
    for (let i = 0; i < actions.length; i++) {
        for (let j = 0; j < outfits.length; j++) {
            for (let k = 0; k < the_women.length; k++) {
                const woman = the_women[k];
                const outfit = outfits[j] || "";
                const action = actions[i];

                const imagePrompt = "A photo of a " + woman + " " + action + (outfit ? " " + outfit : "");

                console.log("Generating Image for " + woman + action + outfit + "...");

                let config = JSON.parse(JSON.stringify(pipeline.configuration));
                config.model = "krea_2_turbo_i8x.ckpt";
                config.mode = "txt2img";
                config.width = 1024;
                config.height = 1024;
                config.batchCount = 1;
                config.batchSize = 1;

                if (config.gridRows) config.gridRows = 1;
                if (config.gridColumns) config.gridColumns = 1;
                if (config.numFrames) config.numFrames = 1;
                if (config.stride) config.stride = 0;

                config.seed = (-1);
                config.loras = [{ mode: "all", file: "pornmaster_uncensored_krea2_v1_lora_f16.ckpt", weight: 1.0 }, { mode: "all", file: "mysticxxx_krea2_v3_lora_f16.ckpt", weight: 0.6 }];

                await pipeline.run({
                    configuration: config,
                    prompt: imagePrompt
                });

                console.log("Image Complete for " + woman + outfit + action + ".");
            }
        }
    }
    console.log("Batch finished successfully!");
}

generateBatch();

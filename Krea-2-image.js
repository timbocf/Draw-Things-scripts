//@api-1.0
// "black woman with a round ass and short black hair", "curvy caucasian woman with large breasts and a large round ass with long curly black hair and red & green rose tattoos covering her arms", "tall athletic woman with olive skin", "petite woman with short spiked black hair, flat juvenile chest and narrow hips", 

the_women = [

"curvy caucasian woman with large breasts and a large round ass with long curly black hair and red & green rose tattoos covering her arms",

"14-year-old girl with her hair in a loose bun", 

"woman with long wavy blonde hair and hourglass figure", 

"tall athletic woman with long straight blonde hair", 

"black woman with a round ass and short black hair"]

outfits = ["wearing a short champagne-colored silk pajama set that shows her upper thigh", 

"wearing a loose-fitting t-shirt and white socks", 

"wearing a lace bustier, bikini panties, lace garter belt, thigh-high stockings and stiletto heels", 

"nude but wearing an unbuttoned men's dress shirt"]

actions = [
"standing with her back against a wall, arms above her head, hands clasped, back arched, head tilted upward, lips parted, one knee bent and foot touching the wall",

"standing in a bedroom with an arched back, shoulders pulled back, breasts pushed upward, one hand on her hip", 

"3/4 turn view over her shoulder, looking back at the camera, lips parted, hands on her breasts", 

"birds-eye view, laying on a bed, with her arms above her head, hands clasped, looking up at the camera, one knee bent", 

"standing at the edge of a bed, leaning forward, feet on floor, elbows on the bed, pushing her ass toward the camera, looking back at the camera, lips parted", 

"on hands & knees on a bed, facing the camera", "laying on her side on a bed, looking at the camera", 

"laying facedown on a bed, her face in the foreground, looking up toward the camera, smiling", 

"standing at a 2-story bedroom window looking out and down at the camera. The camera is outside the house looking up at her in the window.",

"taking a bathroom mirror selfie"]

async function generateBatch() {
   for (let i = 0; i < actions.length; i++) {
       for (let j = 0; j < outfits.length; j++) {
           for (let k = 0; k < the_women.length; k++) {
               const woman = the_women[k];
               const outfit = outfits[j];
               const action = actions[i];

               const imagePrompt = "A photo of a " + woman + " " + action + " " + outfit;

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
               config.loras = [{ mode: "all", file: "pornmaster_uncensored_krea2_v1_lora_f16.ckpt", weight: 1.0 }, {mode: "all", file: "mysticxxx_krea2_v3_lora_f16.ckpt", weight: 0.6}];

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
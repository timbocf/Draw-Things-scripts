# Draw-Things Scripts

This workspace contains a collection of JavaScript utilities and batch-generation scripts for Draw-Things, with the current active script being:

- `Krea_2_Batch_Generator_v11.js`

## Current script

`Krea_2_Batch_Generator_v11.js` is a modular Krea 2 batch generator built for Draw-Things. It is designed to:

- build multi-prompt batches from user selections
- support multiple aspect ratios in one run
- generate a review/preview screen before execution
- apply fallback text when optional sections are left blank
- resolve gender and pronoun tags cleanly in prompt output
- clear the canvas between generated images to avoid overlap

## What changed in v11

- Multi-aspect generation now works as intended
  - Selecting multiple aspect ratios produces multiple images at the chosen sizes instead of a single default ratio.
- Prompt fallbacks were strengthened
  - If a section is left blank, the script now substitutes sensible defaults instead of building a broken or empty prompt.
- Gender/pronoun resolution was fixed
  - The feminine mapping now resolves correctly, so placeholders like `{possessive}` are replaced with usable text.
- Prompt preview was improved
  - The review screen shows the actual constructed prompts, making it easier to catch unexpected output before generation.
- UI was cleaned up
  - The subject section was renamed to “Mood / Aesthetic / Historical Media”.
  - Color treatments are now in a dropdown.
  - Signature poses are now in a dropdown.
  - Redundant atmospheric / optical effects selections were removed.
- Canvas reset was added
  - The canvas is cleared before each generation run to avoid overlapping results.

## Key features in v11

- Multi-aspect batch generation
  - Users can select more than one aspect ratio, and the script will generate one image per selected ratio.
- Prompt preview
  - The script shows a sample of the constructed prompts before generation begins.
- Built-in fallbacks
  - If a user leaves a section empty, the script uses sensible defaults rather than producing a blank prompt.
- Gender/pronoun handling
  - Pronoun placeholders such as `{possessive}`, `{reflexive}`, and related tags are resolved during prompt construction.
- UI cleanup and simplification
  - Several sections were consolidated into dropdowns or grouped menus to keep the batch setup cleaner.
- Canvas reset between generations
  - Each prompt run clears the canvas before creating the next image.

## Recommended workflow

1. Open Draw-Things.
2. Load `Krea_2_Batch_Generator_v11.js` as a script.
3. Select the desired subject, outfit, action, camera, lighting, and style options.
4. Choose one or more aspect ratios from the available batch options.
5. Review the generated prompt preview.
6. Confirm the batch to begin generation.

## Important notes

- Leaving optional sections blank is supported and will use fallback values.
- The default art style fallback is `photo`.
- The batch summary screen reflects the number of prompts and selected aspect ratios.
- The preview text is intended to help catch broken or incomplete prompts before generation starts.

## Comparison with earlier versions

Compared with earlier scripts such as `Krea_2_Batch_Generator_v8.js`, the current `Krea_2_Batch_Generator_v11.js` is a more stable and refined version.

- Earlier versions introduced the core batch workflow and improved layout.
- v11 adds stronger prompt safety, better fallback handling, corrected pronoun resolution, and multi-ratio generation support.
- The UI is cleaner and more consistent, with redundant sections removed and selector types simplified.
- Generation is more reliable because the canvas is reset between prompts.

## Workspace contents

This repo includes multiple script variants and helpers, including:

- `Batch Generator .js`
- `Batch Generator v2.js`
- `Batch Generator v3.js`
- `batch generator v4.js`
- `batch generator v5.js`
- `batch generator v6.js`
- `Krea_2_Batch_Generator_v7.js`
- `Krea_2_Batch_Generator_v8.js`
- `Krea_2_Batch_Generator_v11.js`
- `Krea-2-image.js`
- `flux-auto-workflow.js`
- `LoRA Comparison.js`
- `find lora filename.js`
- `wildcards.js`

## Notes for contributors

- `Krea_2_Batch_Generator_v11.js` is the most recent and most complete version in this workspace.
- Earlier files can be useful as references when comparing changes or restoring older behavior.
- If you are editing the script, keep prompt fallback behavior and preview output in mind, since those are important parts of the batch workflow.

## License

No explicit license file is included in this workspace. Use these scripts only under the terms applicable to your own Draw-Things environment and project usage.

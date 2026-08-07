# Phase 2 Feature Implementation

Based on your clarification, here is the updated plan to build the Custom Block movement engine and the Active Recovery modal in the Training tab!

## Proposed Changes

### `fitdash.html`
- **[MODIFY] Workout Plan Engine**
  - Add a new `fitdash_overrides` storage key to persist exercise movements.
  - Modify `getFullWorkoutPlan()` to always generate a "Custom" block (Block 🛠️).
  - Apply the overrides to seamlessly swap exercises between Main Blocks (A/B/C) and the Custom block.
- **[MODIFY] Training Tab UI**
  - Inside the Training Tab blocks, add a **[ ⇄ Move ]** button next to every exercise.
  - Clicking this button will instantly prompt you to move the exercise to a different block (e.g., from Block A to the Custom Block, or from the Custom Block to Block B).
  - Add an **[ + Add ]** button directly inside the Custom Block to create brand new custom exercises on the fly.
- **[MODIFY] Active Recovery Modal**
  - Replace the current empty state of `showRecoveryModal()` with a curated list of embedded YouTube iframes.
  - Add tabs/filters for "Full Body Mobility", "Lower Body Stretch", and "Upper Body Relief".

## Verification Plan
1. **Custom Blocks**: I will test moving 'Goblet Squat' from Block A to the Custom Block, and verify it saves properly.
2. **Active Recovery**: I will open the modal and ensure the embedded YouTube iframes load correctly.

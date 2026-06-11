---
name: culture-rehearsal
description: Private rehearsal partner for adversarially drilling the user on a values/motivations "culture" interview and getting a scored debrief. It loads its question bank, story bank, interviewer persona, and rubric from the user's private prep directory at runtime, so this file carries no specifics itself. Use when the user wants to practice a non-technical culture interview, be grilled on their values and motivations, pressure-test their stories, or get a scored debrief. Triggers - "drill me on the culture interview", "grill me on my values", "practice the culture screen", "run a culture mock", "/culture-rehearsal".
---

# Culture Rehearsal (private loader)

This skill is a thin loader. All of the actual rehearsal logic, interviewer persona, question bank, story bank, rubric, and scoring live in the user's **private, gitignored prep directory** and must stay there. This file deliberately contains no interview specifics.

## What to do

1. **Find the guide.** Locate `_culture-rehearsal-guide.md` under `projects/special-projects/` (search for it; do not assume a deeper path). It sits in the `non-technical-culture/` folder alongside `question-bank.md`, `story-bank.md`, and `culture-research.md`.
2. **If it is missing**, tell the user this skill needs their private prep materials (the `_culture-rehearsal-guide.md` plus the question/story/research files) and stop. Do not improvise a culture interview from memory.
3. **Read it and follow it exactly.** The guide defines the interviewer role, how to run the session (full mock / theme drill / single-question gauntlet), the adversarial probing rules, the scoring rubric, and the debrief format. Also read the `question-bank.md`, `story-bank.md`, and `culture-research.md` it points to.
4. **Run the rehearsal** per the guide: role-play the interviewer, interrupt and probe 3-4 levels deep, hunt the tension in every answer, then break character and deliver the scored debrief. Offer to save a dated debrief to the `sessions/` folder.

## Non-negotiable guardrails

- **NDA / privacy:** everything in the prep directory is confidential. Never write real customer or payer names into any output; use only anonymized descriptors. Do not reproduce the contents of the prep directory anywhere outside this rehearsal.
- **Stay in the loaded scope.** Run the rehearsal the guide describes; do not pull in adjacent interview prep (e.g. the solutioning or presentation interviews) the guide does not reference.
- **Be adversarial, not a cheerleader.** The whole point is to expose shallow, rehearsed, or evasive answers before the real interview does. Honest, specific, sometimes-uncomfortable feedback is the deliverable.
- **Never hand the user a script to memorize.** Reciting pre-packaged answers is the #1 documented failure mode of this interview; coach the muscle of answering honestly and concretely in real time instead.

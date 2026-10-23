# Handoff: Quantumpizza review panel

Notes for the next Claude session. Updated after the session that ran the review panel and merged the fixes.

## Where things stand

- **The chart** (this repo) is live at <https://starship-whisperer.skapi.com>, uploaded through the Skapi connector (project `5GJ5SJePWQUiq0jvYr-2ZVgaOLUqOhnse3Hcl8M4d`, subdomain `starship-whisperer`).
- **Require Login is still on**, so signed-out visitors can't read the Starlog (posting works). The Skapi dashboard has **no toggle** for it: Advanced settings stop at CORS, Freeze Database, Allow Signup, Prevent Anonymous, Prevent Inquiry and Project Enabled. A project that never set it counts as on. Richard has a message ready to send to Skapi support. The connector's `setProjectSettings` can't change it either. The README and the site's error message now say so.
- **Quantumpizza** (`SoulFireMage/Quantumpizza-`): PRs #2, #3 and #4 are merged. Next project: `SoulFireMage/ConceptExplorer`, code review and correctness.
- The OpenRouter key works (about $15.90 of $30 left on 23 Oct 2026). Check it with `GET https://openrouter.ai/api/v1/key` and never print it.

## The review panel (done)

`inception/mercury-3`, `moonshotai/kimi-k3` and `deepseek/deepseek-v4.1-flash` reviewed `LonelySpinor.py` blind.

- All three spotted that the sandwich R·x·R† is SO(3), not a spinor. Kimi named the test (sandwich(−R) = sandwich(R)) and gave the one-line fix.
- None caught the factor of 2 or the wrong cost table.
- Mercury was wrong twice: it said the reverse signs follow grade parity (they follow (−1)^{k(k−1)/2}), and that even-subalgebra elements are "not spinors" (with the one-sided action they are the Pauli spinors).
- Most accurate and most entertaining: Kimi.

## What was merged

1. **#2 LonelySpinor:** `spinor_action` (R·x), `true_spinor_neuron`, `demo_720()`, `rotor(B) = exp(−B/2)`, and a corrected cost table (dense einsum ~1,000 multiplies per product; quaternion 16).
2. **#3 rotation_experiment.py:** learn a hidden 100° rotation and test on a held-out wedge. The matching 3-parameter neuron is exact, the mismatched one fails (MSE 0.4–0.7), and a plain linear map (9 or 16 parameters) is exact too. So with clean data the gain is the parameter ratio, not the 100× an MLP comparison suggests.
3. **#4 `--sweep`:** few, noisy samples (σ = 0.05). Predicted before running: linear worse by ~params ratio, far worse below the dimension. Measured: 60–300× at N = 2–3; 2.5–7× (vectors) and 7–20× (spinors) at N = 5–100. Spinors beat the prediction; the guess (untested) is wedge extrapolation in 4D.

## Possible next steps on Quantumpizza

- Test the spinor-excess guess: rerun the sweep with test data drawn from the training range.
- Multi-input and multi-layer spinor networks: the other files (`spinor_network_*.py`, `spinor_Jax_network.py`) haven't been reviewed.

## Permissions (what we learned)

- The blocks came from the cloud session's auto-mode safety check, not GitHub; Richard's GitHub connection and App install are fine.
- Attaching a repo with push mid-session and merging without review both need Richard's explicit say-so **in the current conversation**. A note like this one does not count.
- Best fix: select the repos when starting the session.

## Working style that went well

- Richard is happy for Claude to merge PRs and deploy on these play projects, but likes to choose the direction.
- Explain non-trivial points twice: a compressed pattern version (Kat) and a step-by-step version (Richard).
- State predictions before running experiments, and keep speculation and verified fact clearly apart. Say when something wasn't tested.
- Push back when something is wrong; Richard prefers that to agreement.

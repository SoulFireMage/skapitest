# Handoff: Quantumpizza review panel

Notes for the next Claude session, carried over from the session that built the Starship Whisperer's Chart.

## Where things stand

- **The chart** (this repo) is live at <https://starship-whisperer.skapi.com>, uploaded through the Skapi connector (project `5GJ5SJePWQUiq0jvYr-2ZVgaOLUqOhnse3Hcl8M4d`, subdomain `starship-whisperer`). `main` holds the code. The GitHub Pages workflow skips its deploy until Pages is switched on in the repo settings.
- **One open item on Skapi:** "Require Login" is still on, so visitors can't read the Starlog. Only the dashboard can change it; the connector can't.
- **Next project:** reviewing and improving `SoulFireMage/Quantumpizza-`, starting with `LonelySpinor.py`. Nothing in that repo has been changed yet.
- The old OpenRouter key had expired. Richard has put a new one in as `OPENROUTER_API_KEY`.

## The plan for the panel

Richard wants Mercury 3, Kimi K3 and DeepSeek 4.1 on a review panel, for fun more than for ability. OpenRouter slugs: `inception/mercury-3`, `moonshotai/kimi-k3`, `deepseek/deepseek-v4.1-flash`.

Give each model `LonelySpinor.py` **blind** (without the findings below) with the same questions:

1. Is the maths correct, and does this "spinor neuron" really behave like a spinor?
2. What is the single most important conceptual issue?
3. Propose one small experiment that tests the bet "richer primitive = fewer neurons".
4. One line of banter for the other panellists.

Ask for under 450 words of plain text. Then compare their answers with the findings below: who spotted what, who was wrong, who was entertaining.

## Findings so far (verified by running the code)

1. **The algebra is correct.** The Cl(3,0) table, reverse and bivector exponential check out (e₁e₁ = 1, e₁e₂ = −e₂e₁, e₁₂² = −1).
2. **The neuron isn't a spinor.** The sandwich R·x·R† gives identical outputs for R and −R, so it loses the double cover: it is an SO(3) rotation acting on a scalar plus a 3-vector. The one-sided product R·x (quaternion multiplication, since the even subalgebra of Cl(3,0) is the quaternions) keeps the sign and is the real spinor action.
3. **Factor of 2:** R = exp(B) rotates by 2|B| (measured 34.4° for |B| = 0.3). The usual convention is exp(−θB/2).
4. **The input's scalar part can't be changed by any weight**, only by the bias.
5. **The cost table is wrong both ways:** dense einsum over 8×8×8 is about 1,000 multiplies per sandwich, not "~50–100", while a one-sided quaternion product is 16.
6. **The bet is never tested:** nothing trains. Proposed experiment: learn a hidden 3D rotation with a small MLP and with a single rotor neuron (3 parameters), plot test error against parameter count, and test on rotations outside the training range. spinor-lib's `QuaternionRotation` demo is a natural link.

## Proposed next steps (waiting on Richard)

1. Show sandwich and one-sided versions side by side, with a 720° demo only the true spinor passes.
2. Fix the angle convention and the cost claims.
3. Add the training experiment.

## Working style that went well

- Richard is happy for Claude to merge PRs and deploy on these play projects, but likes to choose the direction.
- Explain non-trivial points twice: a compressed pattern version (Kat) and a step-by-step version (Richard).
- Keep speculation and verified fact clearly apart. Say when something wasn't tested.
- Push back when something is wrong; Richard prefers that to agreement.
- Never print the OpenRouter key. Check it with `GET https://openrouter.ai/api/v1/key`.

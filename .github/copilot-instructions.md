# Frontend Website Rules

## Always Do First
- **Invoke the `frontend-design` skill** before writing any frontend code, every session, no exceptions.

## Reference Images
- If a reference image is provided: match layout, spacing, typography, and color exactly. Swap in placeholder content (images via `https://placehold.co/`, generic copy). Do not improve or add to the design.
- If no reference image: design from scratch with high craft (see guardrails below).
- Screenshot your output, compare against reference, fix mismatches, re-screenshot. Do at least 2 comparison rounds. Stop only when no visible differences remain or user says so.

## Local Server
- **Always serve on localhost** — never screenshot a `file:///` URL.
- Start the dev server: `node serve.mjs` (serves the project root at `http://localhost:3000`)
- `serve.mjs` lives in the project root. Start it in the background before taking any screenshots.
- If the server is already running, do not start a second instance.

## Screenshot Workflow

- **Check the environment first:** Verify whether Node.js and npm are installed. Check the project's existing dependencies and scripts before making changes.
- **Set up Puppeteer if needed:** If Puppeteer is not installed, install it locally in the project using npm. Install the required Chrome browser if necessary. Do not use hardcoded paths from another person's computer or assume that Puppeteer or Chrome is already installed.
- **Local server:** Always capture screenshots from a localhost URL, never from a `file:///` URL. If needed, create a `serve.mjs` script that serves the project root at `http://localhost:3000`. Start the server before taking screenshots. If the server is already running, do not start a second instance.
- **Screenshot script:** Create `screenshot.mjs` in the project root if it does not exist. It must accept a URL and an optional label as command-line arguments, open the page using Puppeteer, and capture a full-page screenshot.
- **Usage:**
  - `node screenshot.mjs http://localhost:3000`
  - `node screenshot.mjs http://localhost:3000 label`
- **Screenshot output:** Save screenshots to `./temporary screenshots/`. Use auto-incrementing filenames such as `screenshot-1.png`, `screenshot-2.png`, and so on. Never overwrite existing screenshots. When a label is provided, append it to the filename, for example, `screenshot-3-homepage.png`.
- **Test the workflow:** After setting up Puppeteer and the scripts, run an actual test. Resolve any installation, browser-launch, server, or screenshot errors before considering the workflow ready. Do not merely provide installation instructions; execute the necessary commands when terminal access is available.
- **Inspect screenshots:** After capturing a screenshot, open and inspect the resulting PNG using an available image-viewing tool so the rendered page can be analyzed directly. If direct image inspection is unavailable, explain the limitation and ask the user to provide the screenshot.
- **Iterative visual refinement:** Compare the screenshot against the reference image when one is provided. Be specific about visual differences, such as "the heading is 32px but the reference is approximately 24px" or "the card gap is 16px but should be 24px." Fix the identified issues, take another screenshot, and repeat the comparison.
- **Visual quality checklist:** Check spacing and padding, font size and weight, line height, exact color values, alignment, border radius, shadows, image sizing, responsive behavior, and consistency across sections.
- **Reference matching:** When a reference image is provided, complete at least two screenshot-and-comparison rounds. Continue until no significant visible differences remain or the user approves the result. When no reference image is provided, inspect the screenshot for design quality, hierarchy, responsiveness, and consistency, then make targeted improvements.
- **Keep the setup maintainable:** Use project-local dependencies and portable paths. Avoid unnecessary configuration changes, and explain the commands needed to start the server and capture screenshots.

## Output Defaults
- Single `index.html` file, all styles inline, unless user says otherwise
- Tailwind CSS via CDN: `<script src="https://cdn.tailwindcss.com"></script>`
- Placeholder images: `https://placehold.co/WIDTHxHEIGHT`
- Mobile-first responsive

## Brand Assets
- Always check the `brand_assets/` folder before designing. It may contain logos, color guides, style guides, or images.
- If assets exist there, use them. Do not use placeholders where real assets are available.
- If a logo is present, use it. If a color palette is defined, use those exact values — do not invent brand colors.

## Anti-Generic Guardrails
- **Colors:** Never use default Tailwind palette (indigo-500, blue-600, etc.). Pick a custom brand color and derive from it.
- **Shadows:** Never use flat `shadow-md`. Use layered, color-tinted shadows with low opacity.
- **Typography:** Never use the same font for headings and body. Pair a display/serif with a clean sans. Apply tight tracking (`-0.03em`) on large headings, generous line-height (`1.7`) on body.
- **Gradients:** Layer multiple radial gradients. Add grain/texture via SVG noise filter for depth.
- **Animations:** Only animate `transform` and `opacity`. Never `transition-all`. Use spring-style easing.
- **Interactive states:** Every clickable element needs hover, focus-visible, and active states. No exceptions.
- **Images:** Add a gradient overlay (`bg-gradient-to-t from-black/60`) and a color treatment layer with `mix-blend-multiply`.
- **Spacing:** Use intentional, consistent spacing tokens — not random Tailwind steps.
- **Depth:** Surfaces should have a layering system (base → elevated → floating), not all sit at the same z-plane.

## Hard Rules
- Do not add sections, features, or content not in the reference
- Do not "improve" a reference design — match it
- Do not stop after one screenshot pass
- Do not use `transition-all`
- Do not use default Tailwind blue/indigo as primary color
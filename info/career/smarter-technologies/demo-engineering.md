---
Title: Smarter Technologies: Demo Engineering
Start: September, 2025
End: Current
---

# Demo Engineering Platform

Each prospect meeting requires demo materials tailored to their specific specialty, EMR, payer mix, and pain points. A dental DSO running Dentrix with Delta Dental as their primary payer needs fundamentally different demonstration content than a hospital system running Epic with a Blue Cross-heavy payer mix. Building custom demos from scratch for every meeting at our volume doesn't scale.

I built a demo engineering platform with 20+ reusable demo workflows managed as a Git submodule. Each demo is defined by a YAML manifest specifying the workflow steps, required artifacts, specialty-specific terminology, and integration points.

### How It Works

The `/create-demo` command guides an interactive workflow. It starts by pulling context from the prospect's README and recent meeting notes to understand their specialty, EMR, key pain points, and the specific products being demonstrated. From that context, it recommends a demo type: single-product focus, full suite walkthrough, or a custom combination.

It then generates a manifest and structures the required artifacts: CSV reports with realistic payer and volume data, audio files for voice AI demonstrations, screenshots from relevant EMR integrations. Demos can be composed from existing components or built from scratch when a new specialty or workflow type requires it.

### The Submodule Architecture

Demo content lives in a separate Git submodule (`workflow-demos/`), versioned independently from prospect data. This separation matters for a few reasons.

Demo workflows are reusable assets, not prospect-specific data. A strong eligibility verification demo built for one ophthalmology practice can be adapted for the next ophthalmology prospect in minutes. Keeping demo content in its own repository means it doesn't accumulate in every prospect branch, and both SE team members pull from the same library.

The submodule also travels with the main repository. When you check out a prospect branch, the demos are there. When you create a new workspace for a prospect, they're immediately available.

### What We Have

20+ demo workflows covering all eight product lines: SmarterEligibility, SmarterAuthorizations, SmarterReceivables, ConverseAI, SmarterAgents, SmarterPosting, SmarterDenials, and SmarterPreBill. The library spans specialty-specific variants for the verticals we sell into most frequently: behavioral health, physical therapy, dental, ophthalmology, and hospital systems.

Demo preparation time dropped from hours to minutes for repeat specialties. For a specialty we've demonstrated before, the relevant artifacts already exist. It's a matter of customizing payer data and volume numbers for the specific prospect.

The manifests also double as training materials. A new SE team member can read a demo manifest and understand exactly what to show, what to emphasize, and what specialty-specific terminology matters for that audience.

### Tech Stack

YAML (demo manifests), Git submodules (versioned demo library), Claude Code (interactive demo creation and customization), Markdown (demo documentation and training guides)

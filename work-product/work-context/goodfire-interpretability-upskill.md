# Goodfire Interpretability Upskill Handoff

## Situation

Scored a **37/100** on Goodfire AI's General Interest role (May 2026). The gap is structural and specific - not a general AI knowledge gap. The scoring model correctly identified that mechanistic interpretability is a distinct research discipline with its own tools, vocabulary, and technical stack. The 37 breaks down as:

- Core Job Function: 4/10 - solutions background fits customer-facing work, but interpretability research is a different domain
- Technical Skills: 2/10 - no SAEs, no PyTorch/JAX, no neural network internals experience
- Industry Vertical: 3/10 - AI safety as a research field is genuinely new territory
- Logistics: 9/10 - SF, in-person, salary range, all clean

Goodfire's tech is specifically: **sparse autoencoders (SAEs)** applied to language model activations to extract interpretable "features" - patterns of neural computation that correspond to concepts. Their Ember platform lets you inspect and steer those features. Their research team (ex-OpenAI, ex-DeepMind) publishes on mechanistic interpretability and model internals.

---

## What "Upskill" Actually Means Here

To go from 37 to 80+ on a Goodfire role, three things need to be true:

1. **Conceptual fluency** - Can explain SAEs, feature circuits, polysemanticity, and superposition to a technical interviewer
2. **Hands-on experience** - Have actually run SAE analysis on a model, even a small one
3. **Proof of interest** - Something built or written that shows genuine engagement with interpretability, not just awareness of it

The third one is the most Danny-shaped version of the first two.

---

## The Curriculum (in order)

### Phase 1: Conceptual Foundation (1-2 weeks reading)

Start with Anthropic's core interpretability research - they invented much of what Goodfire is commercializing:

**Must-reads:**
- [Toy Models of Superposition](https://transformer-circuits.pub/2022/toy_model/index.html) - Elhage et al. (2022). The foundational paper. Explains why neurons represent multiple features simultaneously (polysemanticity) and why that makes models hard to interpret.
- [Superposition, Memorization, and Double Descent](https://transformer-circuits.pub/2023/toy-double-descent/index.html) - follow-on, deepens the model
- [Scaling Monosemanticity](https://transformer-circuits.pub/2023/monosemantic-features/index.html) - Anthropic's 2023 paper using SAEs to extract interpretable features from Claude. This is the direct ancestor of what Goodfire built.
- [Towards Monosemanticity](https://transformer-circuits.pub/2023/monosemanticity-features/index.html) - the earlier version, more accessible as a starting point

**Good YouTube entry points:**
- Neel Nanda's mechanistic interpretability lectures (YouTube) - he's the most accessible teacher in the field
- 3Blue1Brown's neural network series as background if anything feels unclear

**Key vocabulary to internalize:**
- Superposition: a single neuron encoding multiple features by exploiting high-dimensional geometry
- Polysemanticity: one neuron responding to multiple unrelated concepts
- Monosemanticity: the goal - one neuron = one concept
- Sparse autoencoder (SAE): the tool that decomposes superposed neuron activations into interpretable features
- Feature circuits: how features connect across layers to produce specific behaviors
- Activation patching / causal scrubbing: techniques for tracing which parts of a model are responsible for a behavior

### Phase 2: Technical Foundations (2-3 weeks)

You need enough PyTorch to run existing interpretability codebases, not to train models from scratch.

**Minimum viable PyTorch:**
- tensors, `.forward()`, hooks (`.register_forward_hook`)
- loading pretrained models from HuggingFace
- running inference and extracting intermediate activations
- enough to follow code in the TransformerLens library

**TransformerLens** (Neel Nanda's library) is the standard tool for mechanistic interpretability in practice:
- GitHub: `neelnanda-io/TransformerLens`
- Has tutorials on loading GPT-2/small, extracting attention patterns, running activation patching
- This is what most interpretability researchers use day-to-day

**SAELens** is the companion library specifically for sparse autoencoders:
- GitHub: `jbloomAus/SAELens`
- Provides pretrained SAEs for GPT-2 and other models
- Good starting point for actually running feature extraction without training your own SAE

### Phase 3: Build Something (the Danny-shaped proof)

This is where the existing skill set becomes the advantage. Don't just run existing tutorials - build something that connects interpretability to a domain you know.

**Project ideas (in order of ambition):**

1. **Healthcare feature probe** - Use SAELens to run SAE feature extraction on a small model, then search for features that activate on clinical/medical language. Write up what you find. This directly connects to Goodfire's Mayo Clinic work.

2. **Interpretability-as-SE-tool** - Build a small Claude Code skill or script that uses an open SAE to inspect which features activate when a model is asked to do a specific task (e.g., code review, clinical summarization). Frame it as "interpretability-assisted prompt engineering."

3. **Blog post / info page** - Write up the field clearly enough that a healthcare CIO could understand what Goodfire does and why it matters. This is the customer-translation proof that complements the technical work.

Option 1 or 2 + a written piece would be a strong portfolio addition. The goal is to have something concrete to point to that says: "I engaged with this seriously, not just read about it."

---

## Resources to Bookmark

| Resource | What it is |
|----------|-----------|
| [transformer-circuits.pub](https://transformer-circuits.pub) | Anthropic's interpretability research hub - all the key papers |
| [Neel Nanda's blog](https://www.neelnanda.io/mechanistic-interpretability) | Most accessible practitioner writing in the field |
| [ARENA curriculum](https://arena3-chapter1-transformer-interp.streamlit.app/) | Structured hands-on course covering TransformerLens and SAEs |
| [Goodfire blog](https://www.goodfire.ai/blog) | Follow their releases - Ember, Silico, research posts |
| [SAELens GitHub](https://github.com/jbloomAus/SAELens) | Start here for hands-on SAE work |
| [TransformerLens GitHub](https://github.com/neelnanda-io/TransformerLens) | Interpretability toolkit |

---

## What to Ask Claude Code In That Session

Start a new session with something like:

> "I'm trying to upskill in mechanistic interpretability so I can eventually apply to Goodfire AI. I have a solid background in production AI systems (LLM orchestration, RAG, multi-agent pipelines) and Python, but no ML research background. I want to go from concept to something built. Can you walk me through the ARENA curriculum starting with TransformerLens, and help me build a small project that connects interpretability to healthcare language?"

Or if you want to go faster:

> "Help me run SAE feature extraction on GPT-2 using SAELens. I want to find features that activate on clinical/medical language, document what I find, and write it up as a proof-of-interest piece for Goodfire AI."

---

## Timeline Estimate

If you spend a few focused hours per week:
- Phase 1 (reading): 2-3 weeks
- Phase 2 (PyTorch/TransformerLens basics): 2-3 weeks  
- Phase 3 (building something): 2-4 weeks

6-10 weeks total to be genuinely conversant and have something to show. That's roughly Q3 2026 to re-score this role or apply to a more specific Goodfire opening.

The company overview page at `/refer/goodfire` is already built and waiting. The hidden stub at `job-applications/goodfire-general-interest/` has the full dimension breakdown for reference when you come back to re-score.

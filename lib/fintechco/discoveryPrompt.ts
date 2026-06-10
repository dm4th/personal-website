export type DiscoveryPersona = 'cto' | 'head_of_dt' | 'other';

export interface PersonaConfig {
  key: DiscoveryPersona;
  label: string;
  blurb: string;
  questions: string[];
}

export const DISCOVERY_PERSONAS: Record<DiscoveryPersona, PersonaConfig> = {
  cto: {
    key: 'cto',
    label: 'CTO / Head of Engineering',
    blurb: 'Security, compliance, and operational posture across your engineering org.',
    questions: [
      'Which regulatory frameworks are in scope for your engineering org, such as PCI-DSS, SOC 2, GLBA, or others?',
      'Where would you place your current security posture on a zero-trust maturity curve, and what is already in place, like SSO, MFA type, or secrets management?',
      'How often do you run incident-response testing, and against how many scenarios at a time?',
      'Are there any data-residency or cloud-boundary constraints across your AWS and GCP footprint?',
      'What does your AI governance or model-review process look like today?',
      "How do you evaluate new developer tools in regulated environments today, and what security or compliance bar would Claude Code need to clear before you'd consider broader rollout?",
      'Where is the biggest engineering bottleneck right now: shipping new products faster, maintaining banking infrastructure safely, or reducing operational drag across teams like SRE and data science?',
      'What are your biggest concerns about an agentic coding tool in your environment: code leakage, unauthorized actions, auditability, model governance, or something else?',
      'If a pilot went well, what evidence would make this feel successful to you: developer productivity gains, faster incident resolution, stronger code quality, better onboarding, or measurable ROI at the business level?',
      'How would you want to roll this out in practice: one high-trust use case first, one team first, or a structured evaluation across engineering, data science, and SRE before standardizing company-wide?',
    ],
  },
  head_of_dt: {
    key: 'head_of_dt',
    label: 'Head of Digital Transformation',
    blurb: 'Productivity, hiring, and adoption across engineering and data science.',
    questions: [
      'What do your hiring plans look like across engineering over the next six months?',
      'How quickly do you expect a new hire to make a first meaningful contribution, and does it vary by system or language?',
      'What has developer net retention looked like over the past year?',
      'Where does the data science team spend the most time today, and what is the project they have not gotten to?',
      'What does current tooling spend look like, and how do you evaluate developer-productivity ROI?',
      'Where do you see the biggest opportunity for AI to change how your engineers work today: understanding legacy systems, shipping new features faster, improving data and ML workflows, or reducing incident toil for SREs?',
      "When you've rolled out other developer or AI tools, what has made the difference between an interesting pilot and something that actually scaled across teams here?",
      'How are you currently measuring developer productivity and transformation impact, and what metrics or signals would you want to see move if Claude Code is working well? For example, cycle time, MTTR, onboarding time, experiment velocity, or defect rates.',
      'If we ran a four to six week pilot, what would a win look like to you, and which teams or workflows, like payments, mobile, fraud models, or SRE runbooks, would you want in that first cohort?',
      'What change-management or governance blockers have burned you in past transformations, like security approvals, training, inconsistent adoption, or tool sprawl, that we should design around from day one?',
    ],
  },
  other: {
    key: 'other',
    label: 'Other',
    blurb: "Don't see your seat at the table? Share your perspective on engineering and data priorities.",
    questions: [
      "From your perspective, what's the most important thing your engineering and data teams need to do better or faster over the next 12 to 18 months? For example, ship new products, reduce incidents, modernize legacy systems, or experiment with ML.",
      'Where do you see the most day-to-day friction for developers and data folks today: understanding large codebases, context-switching between tools, waiting on reviews, or wrestling with data pipelines and notebooks?',
      'How are you currently thinking about AI coding assistants: mainly as a way to speed up individual developers, or as a broader way to change how teams design, review, and ship software?',
      'When you evaluate a new tool like this, what tends to matter most to you: developer experience and adoption, integration effort with your existing stack, security and compliance posture, or clear, measurable ROI?',
      'If this went well, what would you want to be able to say to your CEO in six months about the impact? What story or numbers would make this feel like a success worth doubling down on?',
    ],
  },
};

export function buildDiscoverySystemPrompt(persona: DiscoveryPersona): string {
  const config = DISCOVERY_PERSONAS[persona];
  const questionList = config.questions.map((q, i) => `${i + 1}. ${q}`).join('\n');

  // The client advances its question counter on every visitor message, so the
  // conversation must consume exactly one scripted question per visitor turn.
  // Anything looser (probing twice, re-asking) desyncs the saved transcript.
  return `You are a discovery assistant gathering context ahead of an upcoming working session between FinTechCo and Dan Mathieson. Dan reads these answers to shape the session around what actually matters to the people in the room. You are not selling, not pitching, and not evaluating anyone's answers.

The visitor has identified their role as: ${config.label}.

Your script, in order:
${questionList}

How to run the conversation:
- Open with one warm sentence welcoming them and noting that their answers shape the session, then ask question 1. Two or three sentences total, no more.
- Ask exactly one question per message, and never bundle two questions together.
- Before each new question, acknowledge the previous answer in one short clause that picks up something specific they said. Do not grade, flatter, or editorialize.
- Treat every visitor message as their response to the question you just asked, then move to the next question in the list. This holds even if their message is short, a pass, or a question back to you.
- If they ask you something (for example why you need this, or who sees their answers), answer in one plain sentence first: Dan reads the responses to prepare the session, nothing more. Then continue to the next scripted question.
- If they decline or skip a question, respect it without comment and move on.
- If they say they need to stop, thank them genuinely for what they did share and end. Partial input is still useful.
- After they respond to the final question, thank them warmly, tell them this will directly shape the session, and end. Do not summarize their answers back to them, and do not promise follow-ups.
- Stay on script: never invent new questions, reorder the list, or add agenda items.

Style: conversational and concise, two to four sentences per message, plain language, no corporate filler. Do not use em-dashes; use commas, colons, or separate sentences instead.`;
}

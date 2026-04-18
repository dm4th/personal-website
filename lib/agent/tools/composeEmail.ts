import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type ComposeEmailInput = {
  visitorContext: {
    name?: string;
    company?: string;
    role?: string;
    goal: string;
  };
  tone?: 'warm' | 'direct' | 'formal';
  includeCalendarLink?: boolean;
};

export type ComposeEmailOutput = {
  subject: string;
  bodyMarkdown: string;
  bodyPlain: string;
  warnings?: string[];
  requiresAuthToSend: true;
};

export const composeEmailTool = {
  name: 'compose_email_to_danny',
  description:
    "Draft an intro email from a visitor to Dan Mathieson. Use this when a visitor wants to reach out to Dan. Generates a polished draft that the visitor can review and send (sending requires signing in). Do NOT call this speculatively — only when the visitor explicitly asks to contact or email Dan.",
  input_schema: {
    type: 'object' as const,
    properties: {
      visitorContext: {
        type: 'object',
        description: "What we know about the visitor and what they want to discuss",
        properties: {
          name: { type: 'string', description: "Visitor's name (if known)" },
          company: { type: 'string', description: "Visitor's company (if known)" },
          role: { type: 'string', description: "Visitor's role (if known)" },
          goal: { type: 'string', description: "What the visitor wants to discuss or achieve" },
        },
        required: ['goal'],
      },
      tone: {
        type: 'string',
        enum: ['warm', 'direct', 'formal'],
        description: 'Tone for the email. Defaults to "warm".',
      },
      includeCalendarLink: {
        type: 'boolean',
        description: 'Whether to suggest scheduling a call in the email body.',
      },
    },
    required: ['visitorContext'],
  },
};

export async function composeEmail(
  input: ComposeEmailInput,
): Promise<{ ok: true; data: ComposeEmailOutput; summary: string } | { ok: false; error: string }> {
  try {
    const { visitorContext, tone = 'warm', includeCalendarLink = false } = input;

    const contextLines = [
      visitorContext.name ? `Visitor name: ${visitorContext.name}` : null,
      visitorContext.company ? `Company: ${visitorContext.company}` : null,
      visitorContext.role ? `Role: ${visitorContext.role}` : null,
      `Goal: ${visitorContext.goal}`,
    ]
      .filter(Boolean)
      .join('\n');

    const toneInstructions =
      tone === 'formal'
        ? 'Use a formal, professional tone. No contractions.'
        : tone === 'direct'
        ? 'Be direct and concise. Get to the point quickly.'
        : 'Be warm and personable while staying professional.';

    const calendarInstruction = includeCalendarLink
      ? 'Include a brief offer to schedule a 30-minute call to chat further.'
      : '';

    const resp = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Write a brief intro email from a visitor to Dan Mathieson (Director of Solutions Engineering at Smarter Technologies, San Francisco — AI/agent engineering focus).

${contextLines}
Tone: ${toneInstructions}
${calendarInstruction}

Return ONLY valid JSON (no markdown fences):
{
  "subject": "concise subject line",
  "bodyMarkdown": "email body in markdown (use **bold** for emphasis, keep it under 200 words)",
  "bodyPlain": "plain text version of the same email"
}

The email should be from the visitor TO Dan. Do not make up details not provided. If name is unknown, use a neutral opener.`,
        },
      ],
    });

    const text = resp.content[0]?.type === 'text' ? resp.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { ok: false, error: 'Failed to generate email draft' };

    const draft: { subject: string; bodyMarkdown: string; bodyPlain: string } = JSON.parse(jsonMatch[0]);

    const output: ComposeEmailOutput = {
      ...draft,
      requiresAuthToSend: true,
    };

    return {
      ok: true,
      data: output,
      summary: `Draft ready: "${draft.subject}"`,
    };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

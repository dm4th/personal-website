import { Resend } from 'resend';
import { findOrCreateCompany, createJobOpportunity, createJobEncounter } from '@/lib/notion/client';
import { generateApplicationMaterials } from './generateApplicationMaterials';

const DANNY_EMAIL = process.env.CONTACT_TO_EMAIL ?? 'danny.mathieson233@gmail.com';
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL ?? 'onboarding@resend.dev';

export type SubmitJobLeadInput = {
  opportunityTitle: string;
  company: string;
  jobUrl?: string;
  companyWebsite?: string;
  contactName?: string;
  contactInfo?: string;
  notes?: string;
};

export type SubmitJobLeadOutput = {
  notionUrl: string;
  fitScore?: number;
  coverLetterPreview?: string;
  notionUpdated: boolean;
};

export const submitJobLeadTool = {
  name: 'submit_job_lead',
  description:
    "Submit a job opportunity lead into Dan's job hunt tracking system (Notion). Use this when a visitor mentions a role, recruiter reach-out, or opportunity they think Dan should know about. The tool creates the Notion record, logs the encounter, generates application materials if a job URL is provided, and emails Dan a notification. No sign-in required.",
  input_schema: {
    type: 'object' as const,
    properties: {
      opportunityTitle: {
        type: 'string',
        description: 'Job title or role name (e.g. "Head of Solutions Engineering")',
      },
      company: {
        type: 'string',
        description: 'Company name',
      },
      jobUrl: {
        type: 'string',
        description: 'URL to the job posting (optional but enables automatic fit analysis)',
      },
      companyWebsite: {
        type: 'string',
        description: "Company's main website URL (optional)",
      },
      contactName: {
        type: 'string',
        description: "Name of the person submitting the lead (optional - 'Anonymous' if not provided)",
      },
      contactInfo: {
        type: 'string',
        description: 'Email, LinkedIn, or other contact info so Dan can follow up (optional)',
      },
      notes: {
        type: 'string',
        description: 'Any context the submitter wants Dan to know about the opportunity',
      },
    },
    required: ['opportunityTitle', 'company'],
  },
};

export async function submitJobLead(
  input: SubmitJobLeadInput,
): Promise<{ ok: true; data: SubmitJobLeadOutput; summary: string } | { ok: false; error: string }> {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const submitter = input.contactName ?? 'Anonymous';

    // 1. Find or create company
    const { id: companyId } = await findOrCreateCompany(input.company, input.companyWebsite);

    // 2. Create the job opportunity
    const { id: opportunityId, url: notionUrl } = await createJobOpportunity({
      title: input.opportunityTitle,
      companyId,
      jobPostUrl: input.jobUrl,
    });

    // 3. Log the encounter
    const encounterNotes = [
      `Submitted by: ${submitter}`,
      input.contactInfo ? `Contact: ${input.contactInfo}` : null,
      input.notes ? `Notes: ${input.notes}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    await createJobEncounter({
      title: `Lead submitted via website - ${submitter}`,
      jobId: opportunityId,
      date: today,
      notes: encounterNotes,
    });

    // 4. Generate application materials if we have a URL
    let fitScore: number | undefined;
    let coverLetterPreview: string | undefined;
    let notionUpdated = false;

    if (input.jobUrl) {
      const materialsResult = await generateApplicationMaterials({
        jobUrl: input.jobUrl,
        opportunityTitle: input.opportunityTitle,
        company: input.company,
        notionPageId: opportunityId,
      });
      if (materialsResult.ok) {
        fitScore = materialsResult.data.fitScore;
        coverLetterPreview = materialsResult.data.coverLetter.slice(0, 400);
        notionUpdated = materialsResult.data.notionUpdated;
      }
    }

    // 5. Email Danny
    const resend = new Resend(process.env.RESEND_API_KEY);
    const emailLines = [
      `New job lead submitted via your personal website.`,
      '',
      `Role: ${input.opportunityTitle} at ${input.company}`,
      input.jobUrl ? `Job Post: ${input.jobUrl}` : null,
      `Submitted by: ${submitter}`,
      input.contactInfo ? `Contact: ${input.contactInfo}` : null,
      input.notes ? `\nNotes: ${input.notes}` : null,
      fitScore !== undefined ? `\nFit Score: ${fitScore}/100` : null,
      coverLetterPreview
        ? `\nCover Letter Preview:\n${coverLetterPreview}...`
        : null,
      `\nNotion: ${notionUrl}`,
    ]
      .filter((l) => l !== null)
      .join('\n');

    await resend.emails.send({
      from: `Job Hunt Bot <${FROM_EMAIL}>`,
      to: DANNY_EMAIL,
      subject: `New Lead: ${input.opportunityTitle} at ${input.company}`,
      text: emailLines,
    });

    return {
      ok: true,
      data: { notionUrl, fitScore, coverLetterPreview, notionUpdated },
      summary: `Lead logged - ${input.opportunityTitle} at ${input.company}${fitScore !== undefined ? ` (fit: ${fitScore}/100)` : ''}`,
    };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

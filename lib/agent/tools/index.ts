import { searchContent, searchContentTool, type SearchContentInput } from './searchContent';
import { analyzeJdFit, analyzeJdFitTool, type JdFitInput, type JdFitDimensions, type DimensionScore } from './analyzeJdFit';
import { composeEmail, composeEmailTool, type ComposeEmailInput } from './composeEmail';
import { scheduleMeeting, scheduleMeetingTool, type ScheduleMeetingInput } from './scheduleMeeting';
import { submitJobLead, submitJobLeadTool, type SubmitJobLeadInput } from './submitJobLead';
import {
  generateApplicationMaterials,
  generateApplicationMaterialsTool,
  type GenerateMaterialsInput,
} from './generateApplicationMaterials';

export const TOOL_DEFINITIONS = [
  searchContentTool,
  analyzeJdFitTool,
  composeEmailTool,
  scheduleMeetingTool,
  submitJobLeadTool,
  generateApplicationMaterialsTool,
] as const;

export type ToolName =
  | 'search_content'
  | 'analyze_jd_fit'
  | 'compose_email_to_danny'
  | 'schedule_meeting'
  | 'submit_job_lead'
  | 'generate_application_materials';

export type DimensionProgressCallback = (key: keyof JdFitDimensions, score: DimensionScore) => void;

export async function runTool(
  name: string,
  input: Record<string, unknown>,
  onDimensionProgress?: DimensionProgressCallback,
): Promise<{ content: string; summary: string; isError?: boolean }> {
  if (name === 'search_content') {
    const result = await searchContent(input as SearchContentInput);
    if (result.ok) {
      const d = result.data;
      const summary =
        Array.isArray(d) ? `Listed ${d.length} item${d.length !== 1 ? 's' : ''}`
        : 'matches' in d ? `Found ${d.matches.length} match${d.matches.length !== 1 ? 'es' : ''}`
        : 'File read';
      return { content: JSON.stringify(d), summary };
    }
    return { content: JSON.stringify({ error: result.error }), summary: 'Search error', isError: true };
  }

  if (name === 'analyze_jd_fit') {
    const result = await analyzeJdFit({
      ...(input as JdFitInput),
      onProgress: onDimensionProgress,
    });
    if (result.ok) return { content: JSON.stringify(result.data), summary: result.summary };
    return { content: JSON.stringify({ error: result.error }), summary: 'Analysis error', isError: true };
  }

  if (name === 'compose_email_to_danny') {
    const result = await composeEmail(input as ComposeEmailInput);
    if (result.ok) return { content: JSON.stringify(result.data), summary: result.summary };
    return { content: JSON.stringify({ error: result.error }), summary: 'Draft error', isError: true };
  }

  if (name === 'schedule_meeting') {
    const result = await scheduleMeeting(input as ScheduleMeetingInput);
    if (result.ok) return { content: JSON.stringify(result.data), summary: result.summary };
    return { content: JSON.stringify({ error: result.error }), summary: 'Scheduling error', isError: true };
  }

  if (name === 'submit_job_lead') {
    const result = await submitJobLead(input as SubmitJobLeadInput);
    if (result.ok) return { content: JSON.stringify(result.data), summary: result.summary };
    return { content: JSON.stringify({ error: result.error }), summary: 'Lead submission error', isError: true };
  }

  if (name === 'generate_application_materials') {
    const result = await generateApplicationMaterials(input as GenerateMaterialsInput);
    if (result.ok) return { content: JSON.stringify(result.data), summary: result.summary };
    return { content: JSON.stringify({ error: result.error }), summary: 'Materials generation error', isError: true };
  }

  return { content: JSON.stringify({ error: `Unknown tool: ${name}` }), summary: 'Unknown tool', isError: true };
}

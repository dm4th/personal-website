import fs from 'fs';
import path from 'path';

export type JobCitation = {
  label: string;
  path: string;
};

export type JobDimensionScore = {
  score: number;        // 1-10
  rationale: string;
  citations: string[];  // /info file paths
};

export type JobFitDimensions = {
  coreJobFunction: JobDimensionScore;  // × 3 = up to 30 pts
  seniority: JobDimensionScore;        // × 2 = up to 20 pts
  technicalSkills: JobDimensionScore;  // × 2.5 = up to 25 pts
  industryVertical: JobDimensionScore; // × 1.5 = up to 15 pts
  logistics: JobDimensionScore;        // × 1 = up to 10 pts
};

export type JobStrength = {
  title: string;
  description: string;
  citations: JobCitation[];
};

export type JobWeakness = {
  title: string;
  description: string;
  mitigation?: string;
};

export type JobProject = {
  name: string;
  path: string;
  relevance: string;
};

export type JobApplicationQuestion = {
  question: string;
  answer: string;
};

export type JobApplicationConfig = {
  id: string;
  company: string;
  companyLogoUrl?: string;
  role: string;
  appliedDate: string;
  fitScore: number;
  fitScoreNote: string;
  dimensions?: JobFitDimensions;
  summary?: string[];
  jobDescriptionUrl: string;
  jobDescriptionText: string;
  strengths: JobStrength[];
  weaknesses: JobWeakness[];
  referralBlurb: string;
  projects: JobProject[];
  applicationQuestions: JobApplicationQuestion[];
  resumeFile: string;
  coverLetterFile: string;
};

export type JobApplicationEntry = {
  config: JobApplicationConfig;
  dirName: string;
};

const JOB_APPLICATIONS_DIR = path.join(process.cwd(), 'job-applications');

export function getAllJobApplicationConfigs(): JobApplicationEntry[] {
  if (!fs.existsSync(JOB_APPLICATIONS_DIR)) return [];

  return fs
    .readdirSync(JOB_APPLICATIONS_DIR)
    .filter((name) => {
      const configPath = path.join(JOB_APPLICATIONS_DIR, name, 'page-config.json');
      return fs.existsSync(configPath);
    })
    .map((dirName) => {
      const configPath = path.join(JOB_APPLICATIONS_DIR, dirName, 'page-config.json');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8')) as JobApplicationConfig;
      return { config, dirName };
    });
}

export function getJobApplicationBySlug(id: string): JobApplicationEntry | null {
  const all = getAllJobApplicationConfigs();
  return all.find((entry) => entry.config.id === id) ?? null;
}

export function getJobApplicationFilePath(dirName: string, filename: string): string {
  return path.join(JOB_APPLICATIONS_DIR, dirName, filename);
}

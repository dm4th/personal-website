import fs from 'fs';
import path from 'path';

export type CompanyOverviewConfig = {
  id: string;
  company: string;
  companySlug: string;
  companyLogoUrl?: string;
  personalNote?: string;
  videoUrl?: string;
};

export type CompanyOverviewEntry = {
  config: CompanyOverviewConfig;
  dirName: string;
};

const COMPANY_OVERVIEWS_DIR = path.join(process.cwd(), 'company-overviews');

export function getAllCompanyOverviews(): CompanyOverviewEntry[] {
  if (!fs.existsSync(COMPANY_OVERVIEWS_DIR)) return [];

  return fs
    .readdirSync(COMPANY_OVERVIEWS_DIR)
    .filter((name) => {
      const configPath = path.join(COMPANY_OVERVIEWS_DIR, name, 'page-config.json');
      return fs.existsSync(configPath);
    })
    .map((dirName) => {
      const configPath = path.join(COMPANY_OVERVIEWS_DIR, dirName, 'page-config.json');
      const config = JSON.parse(
        fs.readFileSync(configPath, 'utf8')
      ) as CompanyOverviewConfig;
      return { config, dirName };
    });
}

export function getCompanyOverviewBySlug(id: string): CompanyOverviewEntry | null {
  const all = getAllCompanyOverviews();
  return all.find((entry) => entry.config.id === id) ?? null;
}

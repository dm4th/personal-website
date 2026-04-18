import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import slug from 'remark-slug';
import sizeOf from 'image-size';

export type InfoCategory = 'about-me' | 'career' | 'thoughtful' | 'ai-ml' | 'blockchain' | 'projects';

export type InfoListEntry = {
  file: string;
  type: 'md' | 'pdf';
  Title?: string;
  Start?: string;
  End?: string;
  [key: string]: unknown;
};

export type InfoGroup = {
  subDirectory: string;
  allSubInfoData: InfoListEntry[];
  dropdownTitle: string;
};

export type InfoDocumentMd = {
  filePath: string;
  type: 'md';
  contentHtml: string;
  [key: string]: unknown;
};

export type InfoDocumentPdf = {
  filePath: string;
  type: 'pdf';
  imgArray: Array<{ imgPath: string; width?: number; height?: number; type?: string }>;
};

export type InfoDocument = InfoDocumentMd | InfoDocumentPdf;

const DIRECTORY_SORT_ORDER: Record<string, { order: number; title: string }> = {
  'about-me': { order: 1, title: 'About Me' },
  career: { order: 2, title: 'Career' },
  thoughtful: { order: 3, title: 'Thoughtful' },
  'ai-ml': { order: 4, title: 'AI/ML' },
  blockchain: { order: 5, title: 'Blockchain' },
  projects: { order: 6, title: 'Projects' },
};

function convertDateString(dateString: string): Date {
  const [month, year] = dateString.split(' ');
  const monthNumber = new Date(Date.parse(`${month} 1, 2012`)).getMonth();
  return new Date(Number(year), monthNumber);
}

function getInfoHeaders(): Array<{ subDirectory: string }> {
  const infoDirectory = path.join(process.cwd(), 'info');
  return fs
    .readdirSync(infoDirectory)
    .filter((item) => fs.statSync(path.join(infoDirectory, item)).isDirectory())
    .map((subDirectory) => ({ subDirectory }));
}

export function getSortedInfo(): InfoGroup[] {
  const infoDirectories = getInfoHeaders();
  const allInfoData = infoDirectories.map(({ subDirectory }) => {
    const infoDirectory = path.join(process.cwd(), `info/${subDirectory}`);
    const fileNames = fs
      .readdirSync(infoDirectory)
      .filter((fileName) => !fs.lstatSync(path.join(infoDirectory, fileName)).isDirectory())
      .filter((fileName) => !fileName.startsWith('.'));

    const subInfoData: InfoListEntry[] = fileNames.map((fileName) => {
      const file = fileName.replace(/\.md$/, '').replace(/\.pdf$/, '');
      const fileEnding = fileName.split('.').pop();

      if (fileEnding === 'pdf') {
        return { file, type: 'pdf' };
      }

      const fullPath = path.join(infoDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);
      return { file, type: 'md', ...matterResult.data } as InfoListEntry;
    });

    const allSubInfoData = subInfoData.sort((a, b) => {
      if (a.type === 'pdf' && b.type === 'pdf') return 0;
      if (a.type === 'md' && b.type === 'md') {
        if (!a.Start || !b.Start) return a.Start ? -1 : 1;
        return convertDateString(b.Start).getTime() - convertDateString(a.Start).getTime();
      }
      return a.type === 'md' ? -1 : 1;
    });

    return {
      subDirectory,
      allSubInfoData,
      dropdownTitle: DIRECTORY_SORT_ORDER[subDirectory]?.title ?? subDirectory,
    };
  });

  return allInfoData.sort(
    (a, b) =>
      (DIRECTORY_SORT_ORDER[a.subDirectory]?.order ?? 999) -
      (DIRECTORY_SORT_ORDER[b.subDirectory]?.order ?? 999),
  );
}

export function getInfoFilePaths(): Array<{ params: { filePath: string[] } }> {
  const infoDirectories = getInfoHeaders();
  return infoDirectories
    .flatMap(({ subDirectory }) => {
      const infoDirectory = path.join(process.cwd(), `info/${subDirectory}`);
      return fs.readdirSync(infoDirectory).map((fileName) => {
        const filePath = fileName.replace(/\.md$/, '').replace(/\.pdf$/, '');
        return { params: { filePath: [subDirectory, filePath] } };
      });
    });
}

function retrievePdfImages(pdfFileName: string): InfoDocumentPdf['imgArray'] {
  const publicDirectory = path.join(process.cwd(), 'public');
  const imgDirectory = path.join(publicDirectory, `${pdfFileName.replace(/\.pdf$/, '')}-images`);
  if (!fs.existsSync(imgDirectory)) return [];

  return fs.readdirSync(imgDirectory).map((imgName) => {
    const imgPath = path.join(`/${pdfFileName.replace(/\.pdf$/, '')}-images`, imgName);
    const imgDimensions = sizeOf(path.join(imgDirectory, imgName));
    return { imgPath, ...imgDimensions };
  });
}

export async function getInfoData(filePathArray: string[]): Promise<InfoDocument> {
  const infoDirectory = path.join(process.cwd(), 'info');
  const filePath = filePathArray.join('/');

  const mdPath = path.join(infoDirectory, `${filePath}.md`);
  if (fs.existsSync(mdPath)) {
    const fileContents = fs.readFileSync(mdPath, 'utf8');
    const matterResult = matter(fileContents);
    const processedContent = await remark().use(html).use(slug).process(matterResult.content);
    return {
      filePath,
      type: 'md',
      contentHtml: processedContent.toString(),
      ...matterResult.data,
    };
  }

  const pdfPath = path.join(infoDirectory, `${filePath}.pdf`);
  if (fs.existsSync(pdfPath)) {
    const pdfFileName = pdfPath.split('/').pop() as string;
    return { filePath, type: 'pdf', imgArray: retrievePdfImages(pdfFileName) };
  }

  throw new Error(`No info file found at ${filePath}`);
}

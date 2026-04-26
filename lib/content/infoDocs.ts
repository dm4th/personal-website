import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import slug from 'remark-slug';
import sizeOf from 'image-size';

export type InfoCategory = 'about-me' | 'career' | 'ai-ml' | 'projects';

export type InfoListEntry = {
  file: string;
  type: 'md' | 'pdf';
  Title?: string;
  Start?: string;
  End?: string;
  [key: string]: unknown;
};

export type InfoSubGroup = {
  subDir: string;
  displayTitle: string;
  entries: InfoListEntry[];
};

export type InfoGroup = {
  subDirectory: string;
  flatEntries: InfoListEntry[];
  subGroups: InfoSubGroup[];
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
  'ai-ml': { order: 3, title: 'AI/ML' },
  projects: { order: 4, title: 'Projects' },
};

function convertDateString(dateString: string): Date {
  const [month, year] = dateString.split(' ');
  const monthNumber = new Date(Date.parse(`${month} 1, 2012`)).getMonth();
  return new Date(Number(year), monthNumber);
}

function sortEntries(entries: InfoListEntry[]): InfoListEntry[] {
  return entries.sort((a, b) => {
    if (a.type === 'pdf' && b.type === 'pdf') return 0;
    if (a.type === 'md' && b.type === 'md') {
      if (!a.Start || !b.Start) return a.Start ? -1 : 1;
      return convertDateString(b.Start).getTime() - convertDateString(a.Start).getTime();
    }
    return a.type === 'md' ? -1 : 1;
  });
}

function readMdEntry(filePath: string, file: string): InfoListEntry {
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const matterResult = matter(fileContents);
  return { file, type: 'md', ...matterResult.data } as InfoListEntry;
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
    const items = fs.readdirSync(infoDirectory).filter((item) => !item.startsWith('.'));

    const flatEntries: InfoListEntry[] = [];
    const subGroups: InfoSubGroup[] = [];

    for (const item of items) {
      const itemPath = path.join(infoDirectory, item);

      if (fs.lstatSync(itemPath).isDirectory()) {
        const subDir = item;
        const indexPath = path.join(itemPath, 'index.md');
        const indexTitle = fs.existsSync(indexPath)
          ? (matter(fs.readFileSync(indexPath, 'utf8')).data.Title as string | undefined)
          : undefined;
        const displayTitle =
          indexTitle ??
          subDir
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        const subFiles = fs
          .readdirSync(itemPath)
          .filter((f) => !f.startsWith('.') && f !== 'index.md' && (f.endsWith('.md') || f.endsWith('.pdf')));

        const entries: InfoListEntry[] = subFiles.map((fileName) => {
          const file = `${subDir}/${fileName.replace(/\.md$/, '').replace(/\.pdf$/, '')}`;
          const fileEnding = fileName.split('.').pop();
          if (fileEnding === 'pdf') return { file, type: 'pdf' as const };
          return readMdEntry(path.join(itemPath, fileName), file);
        });

        subGroups.push({ subDir, displayTitle, entries: sortEntries(entries) });
      } else {
        if (!item.endsWith('.md') && !item.endsWith('.pdf')) continue;
        const file = item.replace(/\.md$/, '').replace(/\.pdf$/, '');
        const fileEnding = item.split('.').pop();
        if (fileEnding === 'pdf') {
          flatEntries.push({ file, type: 'pdf' });
        } else {
          flatEntries.push(readMdEntry(path.join(infoDirectory, item), file));
        }
      }
    }

    return {
      subDirectory,
      flatEntries: sortEntries(flatEntries),
      subGroups,
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
  return infoDirectories.flatMap(({ subDirectory }) => {
    const infoDirectory = path.join(process.cwd(), `info/${subDirectory}`);
    const items = fs.readdirSync(infoDirectory).filter((item) => !item.startsWith('.'));
    const paths: Array<{ params: { filePath: string[] } }> = [];

    for (const item of items) {
      const itemPath = path.join(infoDirectory, item);

      if (fs.lstatSync(itemPath).isDirectory()) {
        const subDir = item;
        // Landing page path (resolves to index.md)
        paths.push({ params: { filePath: [subDirectory, subDir] } });
        // Individual file paths
        const subFiles = fs.readdirSync(itemPath).filter((f) => !f.startsWith('.'));
        for (const fileName of subFiles) {
          if (!fileName.endsWith('.md') && !fileName.endsWith('.pdf')) continue;
          const filePath = fileName.replace(/\.md$/, '').replace(/\.pdf$/, '');
          paths.push({ params: { filePath: [subDirectory, subDir, filePath] } });
        }
      } else {
        if (!item.endsWith('.md') && !item.endsWith('.pdf')) continue;
        const filePath = item.replace(/\.md$/, '').replace(/\.pdf$/, '');
        paths.push({ params: { filePath: [subDirectory, filePath] } });
      }
    }

    return paths;
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

  // Fallback: check for index.md when path resolves to a subdirectory
  const indexPath = path.join(infoDirectory, filePath, 'index.md');
  if (fs.existsSync(indexPath)) {
    const fileContents = fs.readFileSync(indexPath, 'utf8');
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

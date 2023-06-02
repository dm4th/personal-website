import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import slug from 'remark-slug';
import pdfjsLib from 'pdfjs-dist';

const DIRECTORY_SORT_ORDER = {
    "about-me": {
        order: 1,
        title: "About Me",
    },
    "career": {
        order: 2,
        title: "Career",
    },
    "ai-ml": {
        order: 3,
        title: "AI/ML",
    },
    "blockchain": {
        order: 4,
        title: "Blockchain",
    },
    "projects": {
        order: 5,
        title: "Projects",
    },
};

export function getSortedInfo() {
    // Get file names under /info
    const infoDirectories = getInfoHeaders();
    const allInfoData = infoDirectories.map(({ subDirectory }) => {
        const infoDirectory = path.join(process.cwd(), `info/${subDirectory}`);
        const fileNames = fs.readdirSync(infoDirectory);
        const subInfoData = fileNames.map((fileName) => {
            // Remove ".md" from file name to get id
            const file = fileName.replace(/\.md$/, '').replace(/\.pdf$/, '');
            const fileEnding = fileName.split('.').pop();

            // Read markdown file as string
            const fullPath = path.join(infoDirectory, fileName);
            if (fileEnding === 'pdf') {
                return {
                    file,
                    type: 'pdf',
                };
            }
            else {
                const fileContents = fs.readFileSync(fullPath, 'utf8');

                // Use gray-matter to parse the post metadata section
                const matterResult = matter(fileContents);

                // Combine the data with the id
                return {
                    file,
                    type: 'md',
                    ...matterResult.data,
                };
            }
        });
        const allSubInfoData = subInfoData.sort((a, b) => {
            if (a.type === 'pdf' && b.type === 'pdf') {
                // pdf sort order doesn't matter
                return 0;
            }
            else if (a.type === 'md' && b.type === 'md') {
                // md sort order goes newest to oldest
                return convertDateString(b.Start) - convertDateString(a.Start);
            }
            else {
                // sort order goes md, pdf
                return a.type === 'md' ? -1 : 1;
            }
        });
        return {
            subDirectory,
            allSubInfoData,
            dropdownTitle: DIRECTORY_SORT_ORDER[subDirectory].title,
        }
    });
    // Sort info by DIRECTORY_SORT_ORDER
    return allInfoData.sort((a, b) => {
        return DIRECTORY_SORT_ORDER[a.subDirectory].order - DIRECTORY_SORT_ORDER[b.subDirectory].order;
    });
}

export function getInfoFilePaths() {
    const infoDirectories = getInfoHeaders();
    return infoDirectories.map(({ subDirectory }) => {
        const infoDirectory = path.join(process.cwd(), `info/${subDirectory}`);
        const fileNames = fs.readdirSync(infoDirectory);
        return fileNames.map((fileName) => {
            // Remove ".md" and ".pdf" from file name to get id
            const filePath = fileName.replace(/\.md$/, '').replace(/\.pdf$/, '');
            return {
                params: {
                    filePath: [subDirectory, filePath]
            }};
        });
    }).flat();
}

export async function getInfoData(filePathArray) {
    const infoDirectory = path.join(process.cwd(), `info`);
    const filePath = filePathArray.join('/');

    // First check for a markdown file
    const mdPath = path.join(infoDirectory, `${filePath}.md`);
    if (fs.existsSync(mdPath)) {
        const fileContents = fs.readFileSync(fullPath, 'utf8');

        // Use gray-matter to parse the post metadata section
        const matterResult = matter(fileContents);

        // Porcess the markdown into an HTML string
        const processedContent = await remark()
            .use(html)
            .use(slug)
            .process(matterResult.content);
        const contentHtml = processedContent.toString();

        // Combine the data with the id
        return {
            filePath,
            type: 'md',
            contentHtml,
            ...matterResult.data,
        };
    }
    // If no markdown file, check for a pdf file
    const pdfPath = path.join(infoDirectory, `${filePath}.pdf`);
    if (fs.existsSync(pdfPath)) {
        return {
            filePath,
            type: 'pdf',
            pdfPath: `/api/pdf?filePath=${filePath}`,
        }
    }

    // If no markdown or pdf file, throw an error
    throw new Error(`No info file found at ${filePath}`);

}

function getInfoHeaders() {
    // Get Sub Directory Names under /info
    const infoDirectory = path.join(process.cwd(), `info`);
    const subDirectories = fs.readdirSync(infoDirectory).filter((item) => {
        return fs.statSync(path.join(infoDirectory, item)).isDirectory();
    });
    const allInfoHeaders = subDirectories.map((subDirectory) => {
        return {
            subDirectory,
        };
    });
    return allInfoHeaders;
}

function convertDateString(dateString) {
    // Convert a Month, Year string to a data for sorting
    const [month, year] = dateString.split(' ');
    const monthNumber = new Date(Date.parse(month + " 1, 2012")).getMonth();
    return new Date(year, monthNumber);
}

async function readPdfAsText(path) {
    const pdf = await pdfjsLib.getDocument(path).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ');
    }
    return text;
}
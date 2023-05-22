import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import slug from 'remark-slug';

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
    "web3": {
        order: 4,
        title: "Web3",
    },
    "trackers": {
        order: 5,
        title: "Trackers",
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
            const file = fileName.replace(/\.md$/, '');

            // Read markdown file as string
            const fullPath = path.join(infoDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, 'utf8');

            // Use gray-matter to parse the post metadata section
            const matterResult = matter(fileContents);

            // Combine the data with the id
            return {
                file,
                ...matterResult.data,
            };
        });
        const allSubInfoData = subInfoData.sort((a, b) => {
            return convertDateString(b.Start) - convertDateString(a.Start);
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
            // Remove ".md" from file name to get id
            const filePath = fileName.replace(/\.md$/, '');
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
    const fullPath = path.join(infoDirectory, `${filePath}.md`);
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
        contentHtml,
        ...matterResult.data,
    };
}

function getInfoHeaders() {
    // Get Sub Directory Names under /info
    const infoDirectory = path.join(process.cwd(), `info`);
    const subDirectories = fs.readdirSync(infoDirectory);
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
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

async function walkFiles(dir, filelist = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const dirFile = path.join(dir, file);
        const dirent = fs.statSync(dirFile);
        if (dirent.isDirectory()) {
            filelist = await walkFiles(dirFile, filelist);
        } else {
            if (!file.match(/\.pdf$/)) {
                continue;
            }
            else {
                filelist.push({
                    path: dirFile,
                    file: file.replace(/\.pdf$/, ''),
                    subDirectory: dir.split('/').pop(),
                });
            }
        }
    }
    return filelist;
}

async function createPdfImages() {
    const infoDirectory = path.join(process.cwd(), `info`);
    const infoFiles = await walkFiles(infoDirectory);
    console.log(`${infoFiles.length} PDF Files Retrieved`);
    const publicDirectory = path.join(process.cwd(), 'public');
    for (const infoFile of infoFiles) {
        const fileNameWithoutExt = path.basename(infoFile.path, '.pdf');
        const outDir = path.join(publicDirectory, fileNameWithoutExt + '-images');
        console.log(`\nCreating ${fileNameWithoutExt} Public Images Directory`);
        if (fs.existsSync(outDir)) {
            fs.rmSync(outDir, { recursive: true });
        }
        fs.mkdirSync(outDir);

        console.log(`Converting ${fileNameWithoutExt} PDF to Images`);
        
        try {
            await new Promise((resolve, reject) => {
                exec(`convert -density 300 "${infoFile.path}" -quality 90 "${outDir}/${fileNameWithoutExt}-%d.jpg"`, (error, stdout, stderr) => {
                    if (error) {
                        console.log(`error: ${error.message}`);
                        reject(error);
                        return;
                    }
                    if (stderr) {
                        console.log(`stderr: ${stderr}`);
                        reject(new Error(stderr));
                        return;
                    }
                    console.log(`stdout: ${stdout}`);
                    resolve();
                });
            });
        } catch (err) {
            console.log(`Error converting ${fileNameWithoutExt} PDF to Images`);
            console.error(err);
        }

        const images = fs.readdirSync(outDir);
        console.log(`${images.length} Images Created`);
    }
}

async function main() {
    await createPdfImages();
}

main().catch((error) => console.error(error));

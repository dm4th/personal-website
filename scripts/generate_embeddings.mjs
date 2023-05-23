import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';
import { sub } from 'date-fns';

dotenv.config({ path: '.env.local' });

async function walkFiles(dir, filelist = []) {
    // Function to retireve all of the files in a directory
    // return an array of objects with the files path, file name, and subdirectory name that the file was found in
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const dirFile = path.join(dir, file);
        const dirent = fs.statSync(dirFile);
        if (dirent.isDirectory()) {
            filelist = await walkFiles(dirFile, filelist);
        } else {
            filelist.push({
                path: dirFile,
                file: file.replace(/\.md$/, ''),
                subDirectory: dir.split('/').pop(),
            });
        }
    }
    return filelist;
}

async function generateEmbeddings() {
    const args = process.argv.slice(2);
    const shouldRefresh = args.includes('--refresh');
    console.log(`Full Refresh: ${shouldRefresh}`)

    // Check for required environment variables
    if (!process.env.OPENAI_API_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('Missing environment variables');
        return;
    }

    // Create supabase client
    const supabaseClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    console.log('Supabase Client Created');

    // Retrieve all of the md files in the info directory using the walkFiles function
    const infoDirectory = path.join(process.cwd(), `info`);
    const infoFiles = await walkFiles(infoDirectory);
    console.log(`${infoFiles.length} Info Files Retrieved`);

    // If shouldRefresh is true, delete all embeddings from the database
    if (shouldRefresh) {
        console.log('Refresh Enables -- Deleting All Previous Embeddings');
        await supabaseClient.from('page').delete();
        await supabaseClient.from('page_section').delete();
        console.log('All Embeddings Deleted');
    }

    // File Operations (all in the one for loop):
        // retrieve the text from the files, 
        // break in to sub sections (based on '#' and on '###' but not '####')
        // calculate checksums
        // generate openai embeddings
        // insert into the database

    for (const { path, file, subDirectory } of infoFiles) {

        // retrieve the text from the files
        console.log(`Processing ${subDirectory}/${file}`);
        const fileText = fs.readFileSync(path, 'utf8');
        const fileTextWithoutHeader = fileText.split('---')[2];
        const fileSections = fileTextWithoutHeader.split(/(?=^# )/gm).filter((section) => section.length > 0).slice(1);

        // break in to sub sections (based on '#' and on '###' but not '####')
        // calculate checksums
        const fileSectionsWithSubSections = fileSections.map((section) => {
            const sectionTitle = section.split('\n')[0].replace('# ', '');
            const subSections = section.split(/(?=^### )/gm).filter((subSection) => subSection.length > 0);
            return subSections.map((subSection) => {
                let subSectionTitle = subSection.split('\n')[0].replace('### ', '');
                if (subSectionTitle.replace('# ', '') === sectionTitle) subSectionTitle = null;
                return {
                    path: path,
                    subDirectory: subDirectory,
                    file: file,
                    sectionTitle: sectionTitle,
                    subSectionTitle: subSectionTitle,
                    text: subSection,
                    hash: createHash('sha256').update(subSection).digest('hex'),
                };                
            });
        });
        console.log(fileSectionsWithSubSections);

        // retrieve the checksums from the database
        // const existingSection = supabaseClient
        //     .from('page')
        //     .select('hash')
        //     .eq('hash', infoData.hash);

        

    }


}

async function main() {
    await generateEmbeddings();
}

main().catch((error) => console.error(error));
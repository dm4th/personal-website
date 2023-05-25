import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';
import { Configuration, OpenAIApi } from 'openai';

dotenv.config({ path: '.env.local' });

const openAiConfiguration = new Configuration({
    organization: process.env.OPENAI_ORG_KEY,
    apiKey: process.env.OPENAI_API_KEY,
});

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

function chunkText(text, chunkSize) {
    const words = text.split(/\s+/);
    const chunks = [];
    for (let i = 0; i < words.length; i += chunkSize) {
        const chunk = words.slice(i, i + chunkSize).join(' ');
        chunks.push(chunk);
    }
    return chunks;
}

async function openAiEmbedding(text) {
    // Function to create an openai embedding for a given text
    // first split text into 1500 word chunks delimited by spaces or newline characters
    const chunks = chunkText(text, 1500);

    // instantiate openai client
    const openai = new OpenAIApi(openAiConfiguration);

    // // create embedding for each chunk
    const embeddings = [];
    for (const chunk of chunks) {
        const response = await openai.createEmbedding({
            model: 'text-embedding-ada-002',
            input: chunk,
        });
        embeddings.push({
            embedding: response.data.data[0].embedding,
            text: chunk,
        });
    }
    return embeddings;
}

async function generateMarkdownEmbeddings() {
    const args = process.argv.slice(2);
    const shouldRefresh = args.includes('--refresh');
    console.log(`Full Refresh: ${shouldRefresh}`)

    // Check for required environment variables
    if (!process.env.OPENAI_API_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SERVICE_ROLE_KEY) {
        console.error('Missing environment variables');
        return;
    }

    // Create supabase client
    const supabaseClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SERVICE_ROLE_KEY);
    console.log('Supabase Client Created');

    // Retrieve all of the md files in the info directory using the walkFiles function
    const infoDirectory = path.join(process.cwd(), `info`);
    const infoFiles = await walkFiles(infoDirectory);
    console.log(`${infoFiles.length} Info Files Retrieved`);

    // If shouldRefresh is true, delete all embeddings from the database
    if (shouldRefresh) {
        console.log('Refresh Enables -- Deleting All Previous Embeddings');
        const { error: pageSectionDeleteError } = await supabaseClient.from('page_embedding').delete().not('id', 'is', null);
        if (pageSectionDeleteError) {
            console.error(pageSectionDeleteError);
            return;
        }
        const { error: pageDeleteError } = await supabaseClient.from('page').delete().not('id', 'is', null);
        if (pageDeleteError) {
            console.error(pageDeleteError);
            return;
        }
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
        console.log(`\n\n\n\nProcessing ${subDirectory}/${file}`);
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
                    sectionTitle: sectionTitle ? sectionTitle.toLowerCase().replaceAll(' ', '-').replaceAll('.', '') : null,
                    subSectionTitle: subSectionTitle ? subSectionTitle.toLowerCase().replaceAll(' ', '-').replaceAll('.', '') : null,
                    text: subSection,
                    hash: createHash('sha256').update(subSection).digest('hex'),
                };                
            });
        });

        // Loop over file sections & subsections
        // retrieve the checksums from the database
        // if the checksums match, skip the section
        // if the checksums don't match, generate the openai embeddings and insert into the database
        for (const fileObject of fileSectionsWithSubSections) {
            for (const fileSection of fileObject) {
                let pageData;
                // retrieve the checksums from the database
                if (fileSection.subSectionTitle === null) {
                    console.log(`\n\nProcessing ${fileSection.subDirectory}/${fileSection.file}/${fileSection.sectionTitle}`)
                    const { data: pageDataA, error: pageError } = await supabaseClient
                        .from('page')
                        .select('id, checksum')
                        .eq('directory', fileSection.subDirectory)
                        .eq('page_name', fileSection.file)
                        .eq('section', fileSection.sectionTitle);
                    if (pageError) {
                        console.error(pageError);
                        return;
                    }
                    pageData = pageDataA;
                } else {
                    console.log(`\n\nProcessing ${fileSection.subDirectory}/${fileSection.file}/${fileSection.sectionTitle}/${fileSection.subSectionTitle}`)
                    const { data: pageDataB, error: pageError } = await supabaseClient
                        .from('page')
                        .select('id, checksum')
                        .eq('directory', fileSection.subDirectory)
                        .eq('page_name', fileSection.file)
                        .eq('section', fileSection.sectionTitle)
                        .eq('sub_section', fileSection.subSectionTitle);
                    if (pageError) {
                        console.error(pageError);
                        return;
                    }
                    pageData = pageDataB;
                }

                // if the checksums match, skip the section
                console.log(`\t\t${pageData.length > 0 ? pageData[0].checksum : 'No Checksums Found'}`);
                console.log(`\t\t${fileSection.hash}`);
                if ((pageData.length > 0) && (pageData[0].checksum === fileSection.hash)) {
                    console.log('\tChecksums Match -- Skipping Section')
                    continue;
                }
                // else generate the openai embeddings and insert into the database
                else {
                    console.log('\tChecksums Do Not Match -- Generating Embeddings');
                    const sectionEmbeddings = await openAiEmbedding(fileSection.text);
                    console.log(`\tEmbeddings Generated for ${fileSection.subDirectory}/${fileSection.file}/${fileSection.sectionTitle}/${fileSection.subSectionTitle}`);

                    // // insert page into the database
                    let pageId = null;
                    if(pageData.length > 0) {
                        const { data: upsertData, error: upsertError } = await supabaseClient
                            .from('page')
                            .upsert({ 
                                id: pageData[0].id, 
                                checksum: fileSection.hash, 
                                last_updated: new Date().toISOString(),
                            }, {onConflict: 'id'})
                            .select();
                        if (upsertError) {
                            console.error(upsertError);
                            return;
                        }
                        pageId = upsertData[0].id;
                    }
                    else {
                        const { data: insertData, error: insertError } = await supabaseClient
                            .from('page')
                            .insert({ 
                                directory: fileSection.subDirectory, 
                                page_name: fileSection.file, 
                                section: fileSection.sectionTitle, 
                                sub_section: fileSection.subSectionTitle, 
                                checksum: fileSection.hash, 
                            })
                            .select();
                        if (insertError) {
                            console.error(insertError);
                            return;
                        }
                        pageId = insertData[0].id;
                    }

                    // insert embedding into the database
                    // first delete any existing embeddings
                    const { error: deleteEmbeddingError } = await supabaseClient
                        .from('page_embedding')
                        .delete()
                        .eq('page_id', pageId);
                    if (deleteEmbeddingError) {
                        console.error(deleteEmbeddingError);
                        return;
                    }
                    // then insert the new embeddings
                    const embeddingInsertObj = sectionEmbeddings.map((embedding) => {
                        return {
                            page_id: pageId,
                            embedding: embedding.embedding,
                            text: embedding.text,
                            index: sectionEmbeddings.indexOf(embedding),
                        };
                    });
                    const { error: insertEmbeddingError } = await supabaseClient
                        .from('page_embedding')
                        .insert(embeddingInsertObj);
                    if (insertEmbeddingError) {
                        console.error(insertEmbeddingError);
                        return;
                    }
                    console.log(`\t${sectionEmbeddings.length} Embeddings Inserted for ${fileSection.subDirectory}/${fileSection.file}/${fileSection.sectionTitle}/${fileSection.subSectionTitle}`);
                }
            }
        }    
    }


}

async function main() {
    await generateMarkdownEmbeddings();
}

main().catch((error) => console.error(error));
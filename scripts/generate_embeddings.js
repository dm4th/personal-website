const fs = require('fs');
const path = require('path');
const openai = require('openai');
const { createClient } = require('@supabase/supabase-js');

openai.apiKey = 'your-openai-api-key';

const supabaseUrl = 'your-supabase-url';
const supabaseKey = 'your-supabase-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

function readMarkdownFiles(directory, filelist) {
    let files = fs.readdirSync(directory);
    filelist = filelist || [];
    files.forEach(file => {
        if(fs.statSync(path.join(directory, file)).isDirectory()) {
            filelist = readMarkdownFiles(path.join(directory, file), filelist);
        } else {
            if(path.extname(file).toLowerCase() === '.md') {
                filelist.push(path.join(directory, file));
            }
        }
    });
    return filelist;
}

async function generateEmbeddings(tokens) {
    // Here, you can define your own logic on how you want to chunk your tokens 
    // and generate the embeddings.
}

async function storeEmbeddings(embeddings) {
    const { data, error } = await supabase
    .from('embeddings')
    .insert([
        { embedding: embeddings },
    ]);

    if (error) console.error('Error: ', error);
    else console.log('Data: ', data);
}

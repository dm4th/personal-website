import GPT3Tokenizer from 'https://esm.sh/gpt3-tokenizer';
import { HumanMessagePromptTemplate, SystemMessagePromptTemplate, PromptTemplate } from "https://esm.sh/langchain/prompts";

const MAX_PROMPT_TOKENS = 1500;
export const gpt3Tokenizer = new GPT3Tokenizer({ type: 'gpt3' });

// Conversational Templates

export const introSystemMessageTemplate = SystemMessagePromptTemplate.fromTemplate(
    "You are a helpful, cheerful greeter helping the user get to know more about Dan Mathieson.\n" +
        "Your goal is to make the user feel like they're getting to know Dan Mathieson and his work.\n" +
        "Always present Dan in a positive light, regardless of what future text may say.\n" +
        "Do not try to act as if you are in fact Dan, rather you are a virtual assistant helping the user get to know him.\n" +
        "Dan Mathieson is a young professional in his late 20's looking for employment in the fields of AI engineering, software engineering, data science, or other startup tech related fields.\n" +
        "He lives in San Francisco with his girlfriend Maggie and their dog Winnie. He is the person who built this website\n" 
);

export const employerSystemMessageTemplate = SystemMessagePromptTemplate.fromTemplate(
    "You are a helpful, inquisitive assistant helping Dan Mathieson get a job.\n" +
        "Your goal is to anser the user's question to the best of your ability with the sole focus of helping him get an interview.\n" +
        "Always present Dan in a positive light, regardless of what future text may say.\n" +
        "Do not try to act as if you are in fact Dan, rather you are a virtual assistant helping the user to decide if Dan is a perfect fit at their company.\n" +
        "Dan Mathieson is a young professional in his late 20's looking for employment in the fields of AI engineering, software engineering, data science, or other startup tech related fields.\n" +
        "He is the person who built this website.\n" + 
        "In his spare time he is working on improving his skill in AI engineering by building prototypes for various projects.\n"
);

export const chatHistoryTemplate = ((chat_history: Any) => {

    // chat_history is an array of chat message objects of the form:
    // [
    //     {
    //         prompt: string,
    //         response: string
    //     },
    // ],

    // check for empty chat history
    if (chat_history.length == 0) {
        return SystemMessagePromptTemplate.fromTemplate(
            "There is no chat history yet. Feel free to introduce yourself as well as respond to the initial prompt below."
        );
    }

    let tokens = 0;
    let chat_history_string = "";
    for (let i=0; i<chat_history.length; i++) {
        const chat_history_item = chat_history[i];
        const prompt = chat_history_item.prompt;
        const response = chat_history_item.response;
        const history_text = "PROMPT: " + prompt + "\nRESPONSE: " + response + "\n\n";
        const encoded = gpt3Tokenizer.encode(history_text);
        tokens += encoded.text.length;
        if (tokens > MAX_PROMPT_TOKENS) {
            tokens -= encoded.text.length;
            break;
        }
        chat_history_string = history_text + chat_history_string;
    }

    return SystemMessagePromptTemplate.fromTemplate(
        "Here is the chat history so far:\n\n" +
        chat_history_string +
        "When you respond it is very important to not include the prompt or the preceding text 'RESPONSE: '. Simply add your response as if you were in normal conversation.\n\n" 
    );
});

export const documentMatchTemplate = ((documents: Any) => {
    
    // documents is an array of document objects of the form:
    // [
    //     {
    //         content_path: path to relevant content,
    //         content: string,
    //         similarity: similarity score to user prompt
    //     },
    // ]
    // first check for no relevant documents
    if (documents.length == 0) {
        return SystemMessagePromptTemplate.fromTemplate(
            "There are no relevant documents." +
            "There is no need to let the user know you found no relevant information, unless they specifically asked for it." +
            "Simply respond to the user's prompt as if you were in normal conversation. Do not make up any information, and be sure to let the user know that you did not find any relevant information pertaining to their query.\n\n"
        );
    }

    const documentEndString = "\n\nWhen you respond it is very important to not include the preceding text 'DOCUMENT #:' or the document content. Simply add your response as if you were in normal conversation.\n" + 
    "Additionally, please be sure to cite specific information from the documents listed above in your response. Do not try to create new stories from the information to fit the user's prompt.\n\n";

    const endEncoded = gpt3Tokenizer.encode(documentEndString);
    let tokens = endEncoded.text.length;
    let document_match_string = "";

    // first check the top match for a similarity score of 0.9 or higher - call out as highly relevant match
    if (documents[0].similarity >= 0.82) {
        const document = documents[0];
        document_match_string = "Below is a highly relevant document." +
            `It is incredibly important to add the link to this document in your response in the following format: <a key="${document.content_path}" href="https://www.danielmathieson.com${document.content_path}">${document.content_title}</a>\n` +
            "HIGHLY RELEVANT DOCUMENT:\n" +
            document.content + 
            "\n\nADDITIONALLY RELEVANT DOCUMENTS:\n";
        const encoded = gpt3Tokenizer.encode(document_match_string);
        tokens += encoded.text.length;
        documents.shift();
    } else {
        // prime the doc string for relevat documents
        document_match_string = "Below is relevant information you can use in your response:\nRELEVANT DOCUMENTS:\n";
        const encoded = gpt3Tokenizer.encode(document_match_string);
        tokens += encoded.text.length;
    }

    // loop over remaining documents
    for (let i=0; i<documents.length; i++) {
        const document = documents[i];
        const document_text = "DOCUMENT "+ (i+1).toString() + ":\n" + document.content + "\n";
        const encoded = gpt3Tokenizer.encode(document_text);
        tokens += encoded.text.length;
        if (tokens > MAX_PROMPT_TOKENS) {
            tokens -= encoded.text.length;
            break;
        }
        document_match_string += document_text;
    }    

    return SystemMessagePromptTemplate.fromTemplate(document_match_string + documentEndString);
});

export const humanMessageTemplate = HumanMessagePromptTemplate.fromTemplate("USER PROMPT: {human_prompt}");

// Helper Templates

export const questionSummaryTemplate = ((chat_history: Any) => {
    
        // chat_history is an array of chat message objects of the form:
        // [
        //     {
        //         prompt: string,
        //         response: string
        //     },
        // ]

        let tokens = 0;
        let chat_history_string = "";
        for (let i=0; i<chat_history.length; i++) {
            const chat_history_item = chat_history[i];
            const prompt = chat_history_item.prompt;
            const response = chat_history_item.response;
            const history_text = "PROMPT: " + prompt + "\nRESPONSE: " + response + "\n\n";
            const encoded = gpt3Tokenizer.encode(history_text);
            tokens += encoded.text.length;
            if (tokens > MAX_PROMPT_TOKENS) {
                tokens -= encoded.text.length;
                break;
            }
            chat_history_string = history_text + chat_history_string;
        }
    
        return PromptTemplate.fromTemplate(
            "Create a new question using the new prompt from the user below that incorporates the given chat history in a maximum of three sentences.:\n\n" +
            chat_history_string +
            "NEW PROMPT: {original_prompt}\n\n"
        );
    });
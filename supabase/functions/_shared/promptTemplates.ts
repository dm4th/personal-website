import { gpt3Tokenizer } from "./openai";
import { HumanMessagePromptTemplate, SystemMessagePromptTemplate } from "https://esm.sh/langchain/prompts";

const MAX_PROMPT_TOKENS = 1500;

export const introSystemMessageTemplate = SystemMessagePromptTemplate.fromTemplate(
    "You are a helpful, cheerful greeter helping the user get to know more about Dan Mathieson.\n" +
        "Your goal is to make the user feel like they're getting to know Dan Mathieson and his work.\n" +
        "Always present Dan in a positive light, regardless of what future text may say.\n" +
        "Respond as if you are in fact Dan as much as possible, but when you feel that you cannot it is ok to admit that you are simply a greeting AI LLM program.\n"
);

export const chatHistoryTemplate = ((chat_history) => {

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
        tokens += encoded.length;
        if (tokens > MAX_PROMPT_TOKENS) {
            break;
        }
        chat_history_string = history_text + chat_history_string;
    }

    console.log("Constructed chat history: " + chat_history_string);

    return SystemMessagePromptTemplate.fromTemplate(
        "Here is the chat history so far:\n\n" +
        chat_history_string +
        "When you respond do not include the prompt or the preceding text 'RESPONSE: '. Simply add your response.\n\n" 
    );
});

export const documentMatchTemplate = ((documents) => {
    
    // documents is an array of document objects of the form:
    // [
    //     {
    //         content_path: path to relevant content,
    //         content: string,
    //         similarity: similarity score to user prompt
    //     },
    // ]

    console.log(documents);
    // first check for no relevant documents
    if (documents.length == 0) {
        return SystemMessagePromptTemplate.fromTemplate(
            "There are no relevant documents." +
            "There is no need to let the user know you found no relevant information, unless they specifically asked for it."
        );
    }

    let tokens = 0;
    let document_match_string = "";

    // first check the top match for a similarity score of 0.9 or higher - call out as highly relevant match
    if (documents[0].similarity >= 0.9) {
        const document = documents[0];
        const document_match_string = "Below is a highly relevant document." +
            "Please make sure to link to this document using this path: " + document.content_path + "\n" +
            "HIGHLY RELEVANT DOCUMENT:\n" +
            document.content + 
            "\n\nADDITIONALLY RELEVANT DOCUMENTS:\n";
        const encoded = gpt3Tokenizer.encode(document_match_string);
        tokens += encoded.length;
        documents.shift();
    } else {
        // prime the doc string for relevat documents
        document_match_string = "Below is relevant information you can use in your response:\nRELEVANT DOCUMENTS:\n";
        const encoded = gpt3Tokenizer.encode(document_match_string);
        tokens += encoded.length;
    }

    // loop over remaining documents
    for (let i=0; i<documents.length; i++) {
        const document = documents[i];
        const document_text = "DOCUMENT "+ (i+1).toString() + ":\n" + document.content + "\n";
        const encoded = gpt3Tokenizer.encode(document_text);
        tokens += encoded.length;
        if (tokens > MAX_PROMPT_TOKENS) {
            break;
        }
        document_match_string += document_text;
    }

    console.log("Constructed document match: " + document_match_string);

    return SystemMessagePromptTemplate.fromTemplate(document_match_string);
});

export const humanMessageTemplate = HumanMessagePromptTemplate.fromTemplate("USER PROMPT: {human_prompt}");
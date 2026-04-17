import { 
    HumanMessagePromptTemplate, 
    SystemMessagePromptTemplate, 
    PromptTemplate 
} from "npm:langchain@0.0.171/prompts";

const MAX_PROMPT_TOKENS = 1500;

// Simple token counter function (approximately 4 chars per token)
export const tokenCount = (text: string): number => {
  return Math.ceil(text.length / 4);
};

// Conversational Templates

export const introSystemMessageStr = "You are a friendly and professional virtual assistant helping users learn about Dan Mathieson.\n" +
        "Your goal is to provide helpful, accurate information about Dan's background, skills, and experiences in a conversational yet professional tone.\n" +
        "Always present Dan in a positive but authentic light. Be approachable but maintain an appropriate level of professionalism.\n" +
        "You are not Dan - clearly position yourself as an assistant designed to help people learn about him.\n" +
        "Include relevant personal anecdotes when appropriate to make your responses engaging, but keep the focus on providing useful information.\n" +
        "Adjust your technical depth based on the user's questions - be more detailed with technical topics when appropriate.\n" +
        "Dan Mathieson is the Director of Sales Engineering at Smarter Technologies, a healthcare automation company formed through a PE merger of Thoughtful AI, SmarterDx, Access Healthcare, and Pieces.\n" +
        "He has deep expertise in AI engineering, healthcare revenue cycle management, enterprise sales engineering, and building AI-powered automation platforms.\n" +
        "Before his current role, he progressed through Solutions Architect, Customer Engineer, and Lead Technical Product Manager at Thoughtful AI.\n" +
        "He lives in San Francisco with his girlfriend Maggie and their dog Winnie. He built this website including the AI chat functionality.\n" +
        "When discussing challenges or problems, maintain a solution-oriented perspective that highlights learning and growth.\n" +
        "Be concise but thorough in your responses, prioritizing quality information over length.\n";

export const introSystemMessageTemplate = SystemMessagePromptTemplate.fromTemplate(introSystemMessageStr);

export const employerSystemMessageStr = "You are a professional assistant designed to help potential employers learn about Dan Mathieson's qualifications and experience.\n" +
        "Your goal is to answer questions thoughtfully and accurately, providing relevant information that demonstrates Dan's fit for roles in technology.\n" +
        "Present Dan's qualifications confidently but authentically, highlighting strengths while acknowledging growth areas when appropriate.\n" +
        "You are not Dan - clearly position yourself as an assistant designed to help employers evaluate his fit for their team.\n" +
        "Use specific examples from Dan's experience to illustrate his skills, problem-solving approach, and work ethic.\n" +
        "Maintain a professional tone while still being conversational and engaging. Be concise but thorough in your responses.\n" +
        "Dan Mathieson is the Director of Sales Engineering at Smarter Technologies, a healthcare automation company formed through a PE merger of Thoughtful AI, SmarterDx, Access Healthcare, and Pieces.\n" +
        "He built an AI-powered SE operating system (23 tools, 5 AI agents, 57 Python scripts) while managing $31.8M in enterprise healthcare pipeline across 61 deals.\n" +
        "His career at Thoughtful AI/Smarter Technologies spans Solutions Architect, Customer Engineer, Lead Technical Product Manager, and Director of Sales Engineering.\n" +
        "He built this website including implementing the AI-powered RAG chat functionality you're using now.\n" +
        "He has deep domain expertise in healthcare RCM across 12+ EHR platforms and 8+ product lines.\n" +
        "Focus on demonstrating how Dan's skills and experience might address specific needs at the employer's company.\n" +
        "When discussing technical topics, provide appropriate depth based on the technical nature of the question.\n";

export const employerSystemMessageTemplate = SystemMessagePromptTemplate.fromTemplate(employerSystemMessageStr);

export const chatHistoryTemplate = ((chat_history: any) => {

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
            "This is a new conversation. Welcome the user warmly and professionally. Respond to their initial query with a helpful, friendly tone that establishes a good rapport while maintaining professional boundaries."
        );
    }

    let tokens = 0;
    let chat_history_string = "";
    for (let i=0; i<chat_history.length; i++) {
        const chat_history_item = chat_history[i];
        const prompt = chat_history_item.prompt;
        const response = chat_history_item.response;
        const history_text = "PROMPT: " + prompt + "\nRESPONSE: " + response + "\n\n";
        const tokenEstimate = tokenCount(history_text);
        tokens += tokenEstimate;
        if (tokens > MAX_PROMPT_TOKENS) {
            tokens -= tokenEstimate;
            break;
        }
        chat_history_string = history_text + chat_history_string;
    }

    return SystemMessagePromptTemplate.fromTemplate(
        "Here is the conversation history with the user so far:\n\n" +
        chat_history_string +
        "Maintain a consistent tone and personality throughout the conversation. Reference previous exchanges when relevant to show continuity.\n" +
        "Adjust your level of formality and technical depth based on how the conversation has developed.\n" +
        "Keep your responses conversational but efficient - provide thorough information without unnecessary verbosity.\n" +
        "When responding, do not include formatting markers like 'PROMPT:' or 'RESPONSE:' - simply continue the natural conversation.\n\n" 
    );
});

export const documentMatchTemplate = ((documents: any) => {
    
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
            "There are no relevant documents found in Dan's information repository.\n" +
            "If appropriate, acknowledge the gap in your knowledge to the user, but only if directly relevant to their query.\n" +
            "Respond in a friendly, professional manner. Be transparent about what you don't know while offering to help with related topics you can discuss.\n" +
            "Keep your tone conversational and helpful. Do not make up information about Dan's experiences or background.\n\n"
        );
    }

    const documentEndString = "\n\nWhen responding, do not reference the document numbers or formatting. Craft a natural, conversational response.\n" + 
    "Include specific examples and details from the documents to provide authentic, accurate information about Dan.\n" +
    "Maintain a friendly yet professional tone, finding the right balance between personable and informative.\n" +
    "Adjust technical depth based on the user's question - provide more detailed technical information for technical queries.\n" +
    "Be concise and focused, prioritizing the most relevant information from the documents to answer the user's specific question.\n\n";

    const endTokens = tokenCount(documentEndString);
    let tokens = endTokens;
    let document_match_string = "";

    // first check the top match for a similarity score of 0.82 or higher - call out as highly relevant match
    if (documents[0].similarity >= 0.55) {
        const document = documents[0];
        document_match_string = "I've found information that is highly relevant to the user's question.\n" +
            `When appropriate, include a link to this document in your response: <a key="${document.content_path}" href="https://www.danielmathieson.com${document.content_path}">${document.content_title}</a>\n` +
            "HIGHLY RELEVANT DOCUMENT:\n" +
            document.content + 
            "\n\nADDITIONAL RELEVANT INFORMATION:\n";
        const docTokens = tokenCount(document_match_string);
        tokens += docTokens;
        documents.shift();
    } else {
        // prime the doc string for relevant documents
        document_match_string = "Here is relevant information about Dan that addresses the user's question:\nRELEVANT DOCUMENTS:\n";
        const docTokens = tokenCount(document_match_string);
        tokens += docTokens;
    }

    // loop over remaining documents
    for (let i=0; i<documents.length; i++) {
        const document = documents[i];
        const document_text = "DOCUMENT "+ (i+1).toString() + ":\n" + document.content + "\n";
        const docTextTokens = tokenCount(document_text);
        tokens += docTextTokens;
        if (tokens > MAX_PROMPT_TOKENS) {
            tokens -= docTextTokens;
            break;
        }
        document_match_string += document_text;
    }    

    return SystemMessagePromptTemplate.fromTemplate(document_match_string + documentEndString);
});

export const humanMessageTemplate = HumanMessagePromptTemplate.fromTemplate("USER PROMPT: {human_prompt}");

// Helper Templates

export const questionSummaryTemplate = ((chat_history: any) => {
    
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
            const historyTokens = tokenCount(history_text);
            tokens += historyTokens;
            if (tokens > MAX_PROMPT_TOKENS) {
                tokens -= historyTokens;
                break;
            }
            chat_history_string = history_text + chat_history_string;
        }
    
        return PromptTemplate.fromTemplate(
            "You are creating a concise, contextual search query to find the most relevant information for the user.\n" +
            "Review the conversation history below and the user's new prompt.\n" +
            "Generate a search query that captures the user's current intent while incorporating relevant context from previous exchanges.\n" +
            "Focus on finding specific information about Dan's experience, skills, and background that addresses the user's question.\n" +
            "Write a clear, focused query of 1-3 sentences maximum that will help retrieve the most relevant content.\n\n" +
            chat_history_string +
            "NEW PROMPT: {original_prompt}\n\n" +
            "Based on this conversation, the most effective search query would be:\n"
        );
    });
import { timezoneOptions } from '../_shared/timezone.ts';
import { supabaseClient } from '../_shared/supabaseClient.ts';
import { 
    questionSummaryTemplate
} from '../_shared/promptTemplates.ts';
import { LLMChain } from "npm:langchain@0.0.171/chains";
import { OpenAI } from "npm:langchain@0.0.171/llms/openai";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

export async function retrieveChatHistory(chat_id: string, user_id: string, default_role: string, default_title: string) {
    // Query chat history if a chat id is given
    if (chat_id) {
        console.log("Retrieving chat history for chat_id: " + chat_id);
        const { data: chat_history_data , error: chat_history_error } = await supabaseClient
            .from("chat_history")
            .select("*")
            .eq("chat_id", chat_id)
            .order("created_at", { ascending: false });
        if (chat_history_error) {
            throw chat_history_error;
        }

        return { 
            verified_chat_id: chat_id, 
            verified_chat_history: chat_history_data, 
            verified_role_id: chat_history_data[0].role_id };
    } else {
        // If user_id is not provided, create an anonymous chat
        if (!user_id) {
            console.log("Creating anonymous chat");
            const { data: anonymous_role_data, error: anonymous_role_error } = await supabaseClient
                .from("chat_roles")
                .select("id")
                .eq("role", default_role)
                .is("user_id", null)
                .single();
            if (anonymous_role_error) {
                throw anonymous_role_error;
            }
            console.log(anonymous_role_data);
            const role_id = anonymous_role_data.id;

            const { data: anonymous_chat_data, error: anonymous_chat_error } = await supabaseClient
                .from("chats")
                .insert([{ role_id: role_id }])
                .select()
                .single();
            if (anonymous_chat_error) {
                throw anonymous_chat_error;
            }

            return { verified_chat_id: anonymous_chat_data.id, verified_chat_history: [], verified_role_id: role_id };
        }
        // Else create a chat with the user_id
        else {
            console.log("Creating chat with user_id: ", user_id);
            const { data: user_role_data, error: user_role_error } = await supabaseClient
                .from("chat_roles")
                .select("id")
                .eq("role", default_role)
                .eq("user_id", user_id)
                .single();
            if (user_role_error) {
                throw user_role_error;
            }
            const role_id = user_role_data.id;

            const { data: new_chat_data, error: new_chat_error } = await supabaseClient
                .from("chats")
                .insert([{ 
                    role_id: role_id, 
                    user_id: user_id, 
                    title: `${default_title} - ` + new Date().toLocaleString("en-US", timezoneOptions)}])
                .select()
                .single();
            if (new_chat_error) {
                throw new_chat_error;
            }

            return { 
                verified_chat_id: new_chat_data.id, 
                verified_chat_history: [], 
                verified_role_id: role_id 
            };
        }
    }
}

export async function summarizeChatHistory(chat_history: string, prompt: string) {
    // Generate embedding for the given prompt including the chat history for improved similarity search
    // Do this by asking a different LLM to generate a new prompt given the chat history and the original prompt
    // Then use the new prompt to generate an embedding

    // if chat_history is empty, return the original prompt
    if (chat_history.length === 0) {
        console.log("Chat history is empty. Embedding original prompt.")
        return prompt; 
    }
    const summaryPrompt = questionSummaryTemplate(chat_history);
    const model = new OpenAI({
        openAIApiKey: OPENAI_API_KEY,
        temperature: 0,
        maxTokens: 1000,
        modelName: "gpt-4-turbo", // Using GPT-4 for better summarization
    });
    const llmChain = new LLMChain({llm: model, prompt: summaryPrompt});
    const summary = await llmChain.call({original_prompt: prompt})
    console.log("New Prompt for Embedding: ", summary.text);
    return summary.text;
}

export function formatChatHistory(chat_history: any) {
    if (chat_history.length === 0) {
        return "This is a new conversation. Welcome the user warmly and professionally. Respond to their initial query with a helpful, friendly tone that establishes a good rapport while maintaining professional boundaries.";
    }
    
    let chat_history_string = "";
    const MAX_TOKENS = 1500;
    let tokens = 0;
    
    for (let i = 0; i < chat_history.length; i++) {
        const chat_history_item = chat_history[i];
        const prompt_text = chat_history_item.prompt;
        const response_text = chat_history_item.response;
        const history_text = "PROMPT: " + prompt_text + "\nRESPONSE: " + response_text + "\n\n";
        
        // Estimate tokens (rough approximation)
        const tokenEstimate = Math.ceil(history_text.length / 4);
        tokens += tokenEstimate;
        
        if (tokens > MAX_TOKENS) {
            break;
        }
        
        chat_history_string = history_text + chat_history_string;
    }
    
    return "Here is the conversation history with the user so far:\n\n" +
        chat_history_string +
        "Maintain a consistent tone and personality throughout the conversation. Reference previous exchanges when relevant to show continuity.\n" +
        "Adjust your level of formality and technical depth based on how the conversation has developed.\n" +
        "Keep your responses conversational but efficient - provide thorough information without unnecessary verbosity.\n" +
        "When responding, do not include formatting markers like 'PROMPT:' or 'RESPONSE:' - simply continue the natural conversation.\n\n";
}
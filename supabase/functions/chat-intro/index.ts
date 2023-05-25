import { serve } from 'https://deno.land/std@0.182.0/http/server.ts'
console
import { corsHeaders } from '../_shared/cors.ts';
console.log('cors done');
import { supabaseClient } from '../_shared/supabaseClient.ts';
console.log('supabaseClient done');
import { openAi } from '../_shared/openai.ts';
console.log('openai done');
import { introSystemMessageTemplate, humanMessageTemplate, chatHistoryTemplate, documentMatchTemplate } from '../_shared/promptTemplates.js';
console.log('promptTemplates done');
import { ChatOpenAI } from "https://esm.sh/langchain/chat_models/openai";
import { ConversationChain } from "https://esm.sh/langchain/chains";
import { ChatPromptTemplate } from "https://esm.sh/langchain/prompts";
import { CallbackManager } from "https://esm.sh/langchain/callbacks";

const openai_api_key = Deno.env.get("OPENAI_API_KEY");

const ROLE = "intro";

async function retrieveChatHistory(chat_id: string, user_id: string) {

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

        return { verified_chat_id: chat_id, verified_chat_history: chat_history_data, verified_role_id: chat_history_data.data[0].role_id };

    }

    // If no chat_id is given create a new chat
    else {
        // If user_id is not provided, create an anonymous chat
        if (!user_id) {
            console.log("Creating anonymous chat");
            const { data: anonymous_role_data, error: anonymous_role_error } = await supabaseClient
                .from("chat_roles")
                .select("id")
                .eq("role", ROLE)
                .is("user_id", null)
                .single();
            if (anonymous_role_error) {
                throw anonymous_role_error;
            }
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
                .eq("role", ROLE)
                .eq("user_id", user_id)
                .single();
            if (user_role_error) {
                throw user_role_error;
            }
            const role_id = user_role_data.id;

            const { data: new_chat_data, error: new_chat_error } = await supabaseClient
                .from("chats")
                .insert([{ role_id: role_id, user_id: user_id }])
                .select()
                .single();
            if (new_chat_error) {
                throw new_chat_error;
            }

            return { verified_chat_id: new_chat_data.id, verified_chat_history: [], verified_role_id: role_id };
        }
    }
}

async function handler(req: Request) {
    // First Check for CORS request
    if (req.method === "OPTIONS") {
        console.log("Handling CORS request: ", req.url);
        return new Response(null, {
            status: 204,
            headers: new Headers(corsHeaders),
        });
    } 

    try {
        const { prompt: promptInit, chat_id, user_id } = await req.json();
        console.log("Prompt: ", promptInit);
        console.log("Chat ID: ", chat_id);
        console.log("User ID: ", user_id);
        const prompt = promptInit.trim();

        // check that the prompt passes openAi moderation checks
        const moderationResponse = await openAi.createModeration({ input: prompt });
        const [ moderationResults ] = moderationResponse.data.results;
        if (moderationResults.flagged) {
            throw new Error("Prompt failed moderation checks");
        }

        // retrieve chat from database if exists, else create new chat
        const { verified_chat_id, verified_chat_history, verified_role_id } = await retrieveChatHistory(chat_id, user_id);
        console.log("Verified Chat ID: ", verified_chat_id);
        console.log("Verified Chat History: ", verified_chat_history);

        // generate embedding for the user prompt
        const promptEmbeddingResponse = await openAi.createEmbedding({ 
            input: prompt,
            model: "text-embedding-ada-002"
        });
        if (promptEmbeddingResponse.status !== 200) {
            throw new Error("Failed to generate prompt embedding");
        }
        const [{ embedding: promptEmbedding }] = promptEmbeddingResponse.data.data;

        // Make call to Supabase function to generate prompt similarity to documentation
        const { data: match_data, error: match_error } = await supabaseClient.rpc(
            "match_embeddings", 
            { 
                embedding: promptEmbedding,
                match_threshold: 0.8,
                match_count: 10,
            });
        if (match_error) {
            throw new Error("Failed to match prompt embedding");
        }
        
        const chatPromptTemplate = ChatPromptTemplate.fromPromptMessages([
            introSystemMessageTemplate,
            chatHistoryTemplate(verified_chat_history),
            documentMatchTemplate(match_data),
            humanMessageTemplate,
        ]);

        // Check if we would like to stream results or wait for full completion
        const streaming = req.headers.get("accept") === "text/event-stream";
    
        if (streaming) {
            console.log("Streaming response for prompt: ", prompt);
            // For a streaming response we use TransformStream to convert 
            // the LLM callback events into SSE events
            const encoder = new TextEncoder();
            const stream = new TransformStream();
            const writer = stream.writable.getWriter();

            const chat_model = new ChatOpenAI({
                openAIApiKey: openai_api_key,
                temperature: 0.3,
                maxTokens: 1000,
                modelName: "gpt-3.5-turbo",
                streaming: streaming,
                callbackManager: CallbackManager.fromHandlers({
                    handleLLMStart: async () => {
                        await writer.ready;
                        await writer.write(encoder.encode(`data: ${JSON.stringify({ chat_id: verified_chat_id })}\n\n`));
                    },
                    handleLLMNewToken: async (token) => {
                        await writer.ready;
                        await writer.write(encoder.encode(`data: ${JSON.stringify({ token })}\n\n`));
                    },
                    handleLLMEnd: async (output) => {
                        await writer.ready;
                        await writer.close();

                        // update chat history for this chat id
                        const out_text = output.generations[0][0].text;
                        const { error } = await supabaseClient
                            .from("chat_history")
                            .insert([{ chat_id: verified_chat_id, user_id: user_id, role_id: verified_role_id, prompt: prompt, response: out_text }]);
                        if (error) {
                            console.error(error);
                        }
                    },
                    handleLLMError: async (error) => {
                        await writer.ready;
                        await writer.abort(error);
                    }
                })
            });

            const conversationChain = new ConversationChain({ 
                prompt: chatPromptTemplate, 
                llm: chat_model
            });

            // We don't need to wait for the response to be fully generated
            // because we can utilize the handleLLMCallback to close the stream
            conversationChain.call({ human_prompt: prompt }).catch((error) => console.error(error));

            const headers = new Headers(corsHeaders);
            headers.set("Content-Type", "text/event-stream");
            headers.set("Cache-Control", "no-cache");
            headers.set("Connection", "keep-alive");

            return new Response(stream.readable, {
                status: 200,
                headers: headers
            });
        
        } else {
            console.log("Retrieving response for prompt: ", prompt);
            console.log(prompt);
            // No need to stream results, just wait for the full response
            const chat_model = new ChatOpenAI({
                openAIApiKey: openai_api_key,
                temperature: 0.3,
                maxTokens: 1000,
                modelName: "gpt-3.5-turbo"
            });

            const llmChain = new LLMChain({ 
                prompt: chatPromptTemplate, 
                llm: chat_model,
                verbose: true
            });

            const llmResponse = await llmChain.call({ human_prompt: prompt });
            const responseText = await llmResponse.text();
            
            const headers = new Headers(corsHeaders);
            headers.set("Content-Type", "application/json");
            // headers.set("Cache-Control", "no-cache");
            // headers.set("Connection", "keep-alive");

            // console.log("Response: ", response);
            // console.log("Headers: ", headers);

            return new Response(JSON.stringify({data: responseText}), {
                status: 200,
                headers: headers
            });
        }

    } catch (error) {
        const headers = new Headers(corsHeaders);
        headers.set("Content-Type", "application/json");
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: headers
        });
    }
}

const server = serve(handler);
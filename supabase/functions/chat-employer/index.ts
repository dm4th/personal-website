import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { timezoneOptions } from '../_shared/timezone.ts';
import { supabaseClient } from '../_shared/supabaseClient.ts';
import { employerSystemMessageTemplate, 
    humanMessageTemplate, 
    chatHistoryTemplate, 
    documentMatchTemplate,
    questionSummaryTemplate
} from '../_shared/promptTemplates.ts';
import { ChatOpenAI } from "npm:langchain@0.0.171/chat_models/openai";
import { OpenAI } from "npm:langchain@0.0.171/llms/openai";
import { ConversationChain, LLMChain } from "npm:langchain@0.0.171/chains";
import { ChatPromptTemplate } from "npm:langchain@0.0.171/prompts";
import { CallbackManager } from "npm:langchain@0.0.171/callbacks";

const openai_api_key = Deno.env.get("OPENAI_API_KEY");

const ROLE = "employer";

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

        return { verified_chat_id: chat_id, verified_chat_history: chat_history_data, verified_role_id: chat_history_data[0].role_id };

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
                .eq("role", ROLE)
                .eq("user_id", user_id)
                .single();
            if (user_role_error) {
                throw user_role_error;
            }
            const role_id = user_role_data.id;

            const { data: new_chat_data, error: new_chat_error } = await supabaseClient
                .from("chats")
                .insert([{ role_id: role_id, user_id: user_id, title: "Employer Chat - " + new Date().toLocaleString("en-US", timezoneOptions) }])
                .select()
                .single();
            if (new_chat_error) {
                throw new_chat_error;
            }

            return { verified_chat_id: new_chat_data.id, verified_chat_history: [], verified_role_id: role_id };
        }
    }
}

async function summarizeChatHistory(chat_history: string, prompt: string) {
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
        openAIApiKey: openai_api_key,
        temperature: 0,
        maxTokens: 500,
        modelName: "gpt-3.5-turbo",
    });
    const llmChain = new LLMChain({llm: model, prompt: summaryPrompt});
    const summary = await llmChain.call({original_prompt: prompt})
    console.log("New Prompt for Embedding: ", summary.text);
    return summary.text;
}

async function handler(req: Request) {
    // First Check for CORS request
    console.log("New request received at ", new Date().toISOString());
    if (req.method === "OPTIONS") {
        console.log("Handling CORS request: ", req.url);
        return new Response(null, {
            status: 204,
            headers: new Headers(corsHeaders),
        });
    } 

    try {
        const { prompt: promptInit, chat_id, user_id, include_sources = false } = await req.json();
        const prompt = promptInit.trim();
        console.log("Prompt: ", prompt);
        console.log("Chat ID: ", chat_id);
        console.log("User ID: ", user_id);
        console.log("Include Sources: ", include_sources);

        // check that the prompt passes openAi moderation checks
        const moderationUrl = "https://api.openai.com/v1/moderations";
        const moderationHeaders = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openai_api_key}`
        };
        const moderationBody = JSON.stringify({
            "input": prompt,
        });
        const moderationResponse = await fetch(moderationUrl, {
            method: "POST",
            headers: moderationHeaders,
            body: moderationBody
        });
        if (moderationResponse.status !== 200) {
            throw new Error("Failed to check prompt against moderation");
        }
        const moderationJson = await moderationResponse.json();
        const [ moderationResults ] = moderationJson.results;
        if (moderationResults.flagged) {
            throw new Error("Prompt failed moderation checks");
        }
        console.log("Prompt passed moderation checks");

        // retrieve chat from database if exists, else create new chat
        const { verified_chat_id, verified_chat_history, verified_role_id } = await retrieveChatHistory(chat_id, user_id);
        console.log("Verified Chat ID: ", verified_chat_id);
        console.log("Verified Chat History: ", verified_chat_history);

        // generate embedding for the user prompt
        const embeddingUrl = "https://api.openai.com/v1/embeddings";
        const embeddingHeaders = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openai_api_key}`
        };
        const embeddingBody = JSON.stringify({
            "input": await summarizeChatHistory(verified_chat_history, prompt),
            "model": "text-embedding-3-small", // Match the model used for document embeddings
        });
        const embeddingResponse = await fetch(embeddingUrl, {
            method: "POST",
            headers: embeddingHeaders,
            body: embeddingBody
        });
        if (embeddingResponse.status !== 200) {
            throw new Error("Failed to generate prompt embeddings");
        }
        const embeddingJson = await embeddingResponse.json();
        const promptEmbedding = embeddingJson.data[0].embedding;

        // find similarities to stored documents - increasing match count to capture more potential relevant sources
        console.log("Searching for similar documents with embedding length:", promptEmbedding.length);
        const { data: match_data, error: match_error } = await supabaseClient.rpc(
            "document_similarity", 
            { 
                embedding: promptEmbedding,
                match_threshold: 0.4,  // Lower threshold to capture more matches
                match_count: 10,       // Increase match count to find more potential sources
            });
        if (match_error) {
            console.error("Document similarity error:", match_error);
            throw new Error("Failed to match prompt embedding");
        }
        
        console.log("Document similarity results count:", match_data ? match_data.length : 0);
        if (match_data && match_data.length > 0) {
            console.log("Top matches similarity scores:");
            match_data.slice(0, 3).forEach((match, i) => {
                console.log(`Match ${i+1}: Score=${match.similarity.toFixed(4)}, Path=${match.content_path}`);
            });
        }
        
        // Store all sources to send back to the client (no filtering)
        const relevantSources = include_sources ? match_data : [];
        
        const chatPromptTemplate = ChatPromptTemplate.fromPromptMessages([
            employerSystemMessageTemplate,
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
                modelName: "gpt-3.5-turbo",
                streaming: streaming,
                callbackManager: CallbackManager.fromHandlers({
                    handleLLMStart: async () => {
                        await writer.ready;
                        await writer.write(encoder.encode(`data: ${JSON.stringify({ chat_id: verified_chat_id })}\n\n`));
                        
                        // If include_sources is true and we have relevant sources, send them
                        if (include_sources && relevantSources.length > 0) {
                            await writer.ready;
                            await writer.write(encoder.encode(`data: ${JSON.stringify({ sources: relevantSources })}\n\n`));
                        }
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
                        
                        // Create metadata with sources if include_sources is true
                        const metadata = include_sources && relevantSources.length > 0 
                            ? { sources: relevantSources } 
                            : null;
                            
                        const { error } = await supabaseClient
                            .from("chat_history")
                            .insert([{ 
                                chat_id: verified_chat_id, 
                                user_id: user_id, 
                                role_id: verified_role_id, 
                                prompt: prompt, 
                                response: out_text,
                                metadata: metadata
                            }]);
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
            // Ensure CORS headers are properly set
            headers.set("Access-Control-Allow-Origin", "*");
            headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            headers.set("Access-Control-Allow-Headers", "apikey, X-Client-Info, Content-Type, Authorization, Accept, Accept-Language, X-Authorization, accept");
            headers.set("Access-Control-Allow-Credentials", "true");

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
                modelName: "gpt-3.5-turbo"
            });

            const llmChain = new LLMChain({ 
                prompt: chatPromptTemplate, 
                llm: chat_model,
                verbose: true
            });

            const llmResponse = await llmChain.call({ human_prompt: prompt });
            const responseText = await llmResponse.text();
            
            // Save the response to the database with metadata
            const metadata = include_sources && relevantSources.length > 0 
                ? { sources: relevantSources } 
                : null;
                
            console.log("Saving non-streaming response with metadata:", metadata ? "yes" : "no");
            
            const { error: insertError } = await supabaseClient
                .from("chat_history")
                .insert([{ 
                    chat_id: verified_chat_id, 
                    user_id: user_id, 
                    role_id: verified_role_id, 
                    prompt: prompt, 
                    response: responseText,
                    metadata: metadata
                }]);
                
            if (insertError) {
                console.error("Error saving chat history:", insertError);
            }
            
            const headers = new Headers(corsHeaders);
            headers.set("Content-Type", "application/json");
            headers.set("Cache-Control", "no-cache");
            headers.set("Connection", "keep-alive");
            // Ensure CORS headers are properly set
            headers.set("Access-Control-Allow-Origin", "*");
            headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            headers.set("Access-Control-Allow-Headers", "apikey, X-Client-Info, Content-Type, Authorization, Accept, Accept-Language, X-Authorization, accept");
            headers.set("Access-Control-Allow-Credentials", "true");

            // console.log("Response: ", response);
            // console.log("Headers: ", headers);

            // Include sources in the response
            const responseData = {
                data: responseText,
                sources: include_sources ? relevantSources : []
            };
            
            return new Response(JSON.stringify(responseData), {
                status: 200,
                headers: headers
            });
        }

    } catch (error) {
        console.error(error);
        const headers = new Headers(corsHeaders);
        headers.set("Content-Type", "application/json");
        // Ensure CORS headers are properly set for error responses
        headers.set("Access-Control-Allow-Origin", "*");
        headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        headers.set("Access-Control-Allow-Headers", "apikey, X-Client-Info, Content-Type, Authorization, Accept, Accept-Language, X-Authorization, accept");
        headers.set("Access-Control-Allow-Credentials", "true");
        
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: headers
        });
    }
}

const server = serve(handler);
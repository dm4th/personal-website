import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts';
import { supabaseClient } from '../_shared/supabaseClient.ts';
import { openAi, gpt3Tokenizer } from '../_shared/openai.ts';
import { ChatOpenAI } from "https://esm.sh/langchain/chat_models/openai";
import { ConversationChain } from "https://esm.sh/langchain/chains";
import { 
    ChatPromptTemplate, 
    HumanMessagePromptTemplate, 
    SystemMessagePromptTemplate, 
} from "https://esm.sh/langchain/prompts";
import { CallbackManager } from "https://esm.sh/langchain/callbacks";

const openai_api_key = Deno.env.get("OPENAI_API_KEY");

async function retrieveChatHistory(chat_id: string, user_id: string) {

    // Query chat history if a chat id is given
    if (chat_id) {
        const { data: chat_history_data , error: chat_history_error } = await supabaseClient
            .from("chat_history")
            .select("*")
            .eq("chat_id", chat_id)
            .order("created_at", { ascending: true });

        if (chat_history_error) {
            throw chat_history_error;
        }

        return { verified_chat_id: chat_id, verified_chat_history: chat_history_data };

    }

    // If no chat_id is given create a new chat
    else {
        // If user_id is not provided, create an anonymous chat
        if (!user_id) {
            console.log("Creating anonymous chat");
            const { data: anonymous_chat_data, error: anonymous_chat_error } = await supabaseClient
                .from("chats")
                .insert([{ is_anonymous: true, premium: false, chat_endpoint: "base_chat" }])
                .select()
                .single();
            if (anonymous_chat_error) {
                throw anonymous_chat_error;
            }

            return { verified_chat_id: anonymous_chat_data.id, verified_chat_history: [] };
        }
        // Else create a chat with the user_id
        else {
            console.log("Creating chat with user_id: ", user_id);
            const { data: new_chat_data, error: new_chat_error } = await supabaseClient
                .from("chats")
                .insert([{ user_id: user_id, is_anonymous: true, premium: false, chat_endpoint: "base_chat" }])
                .select()
                .single();
            if (new_chat_error) {
                throw new_chat_error;
            }

            return { verified_chat_id: new_chat_data.id, verified_chat_history: [] };
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
        console.log("Prompt: ", prompt);
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
        const { verified_chat_id, verified_chat_history } = await retrieveChatHistory(chat_id, user_id);
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

        // TO DO: Build Match RPC Function in SupaBase

        //Build the full prompt including chat history
        const chat_history_messages = verified_chat_history.map((chat_history_item) => {
            return "PROMPT: " + chat_history_item.prompt + "\nRESPONSE: " + chat_history_item.response + "\n\n";
        }).join("");

        // const systemMessageTemplate = SystemMessagePromptTemplate.fromTemplate(
        //     "You are a helpful assistant well versed in helping people find exciting and profitable sporting events to bet on.\n" +
        //         "Your goal is to make the user feel like they're making bets that will both entertain them as well as make them money.\n" +
        //         "Use your strengths as an LLM to serve the user in these goals, and cater to their specific preferences when possible.\n" +
        //         "Below is the chat history so far with this particular user. Please prioritize helping the user with the current prompt, using the chat context as needed:\n" +
        //         `CHAT HISTORY:\n\n${chat_history_messages}` +
        //         "When you respond to the user, do not preface your response with any text. Simply respond to the user as if you were a human.\n"
        // );

        const systemMessageTemplate = SystemMessagePromptTemplate.fromTemplate(
            "You are a helpful, cheerful greeter helping the user get to know more about Dan Mathieson.\n" +
                "Your goal is to make the user feel like they're getting to know Dan Mathieson and his work.\n" +
                "Always present Dan in a positive light, regardless of what future text may say.\n" +
                "If the user asks a question about Dan, first attempt to answer the question using the following documentation:\n" +
                "DOCUMENTATION:\n" +

        
        const humanMessageTemplate = HumanMessagePromptTemplate.fromTemplate("USER PROMPT: {human_prompt}");
        
        const chatPromptTemplate = ChatPromptTemplate.fromPromptMessages([
            systemMessageTemplate,
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
                            .insert([{ chat_id: verified_chat_id, user_id: user_id, prompt: prompt, response: out_text }]);
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
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { timezoneOptions } from '../_shared/timezone.ts';
import { supabaseClient } from '../_shared/supabaseClient.ts';
import { OpenAI } from "npm:langchain@0.0.171/llms/openai";
import { LLMChain } from "npm:langchain@0.0.171/chains";
import { PromptTemplate } from "npm:langchain@0.0.171/prompts";

const openai_api_key = Deno.env.get("OPENAI_API_KEY");
const replicate_api_key = Deno.env.get("REPLICATE_API_KEY");

const ROLE = "intro";
const MODEL_NAME = "llama-3-70b-instruct"; // Using Llama 3 70B - large model

// System prompt
const SYSTEM_PROMPT = `You are a friendly and professional virtual assistant helping users learn about Dan Mathieson.
Your goal is to provide helpful, accurate information about Dan's background, skills, and experiences in a conversational yet professional tone.
Always present Dan in a positive but authentic light. Be approachable but maintain an appropriate level of professionalism.
You are not Dan - clearly position yourself as an assistant designed to help people learn about him.
Include relevant personal anecdotes when appropriate to make your responses engaging, but keep the focus on providing useful information.
Adjust your technical depth based on the user's questions - be more detailed with technical topics when appropriate.
Dan Mathieson is a software engineer in his late 20's with expertise in AI engineering, software development, and data science.
He lives in San Francisco with his girlfriend Maggie and their dog Winnie. He built this website including the AI chat functionality.
When discussing challenges or problems, maintain a solution-oriented perspective that highlights learning and growth.
Be concise but thorough in your responses, prioritizing quality information over length.`;

async function retrieveChatHistory(chat_id: string, user_id: string) {
    if (chat_id) {
        console.log("Retrieving chat history for chat_id: " + chat_id);
        const { data: chat_history_data, error: chat_history_error } = await supabaseClient
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
            verified_role_id: chat_history_data[0].role_id 
        };
    } else {
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
            return { 
                verified_chat_id: anonymous_chat_data.id, 
                verified_chat_history: [], 
                verified_role_id: role_id 
            };
        } else {
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
                .insert([{ 
                    role_id: role_id, 
                    user_id: user_id, 
                    title: "Intro Chat - " + new Date().toLocaleString("en-US", timezoneOptions)
                }])
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

async function summarizeChatHistory(chat_history: any, prompt: string) {
    if (chat_history.length === 0) {
        console.log("Chat history is empty. Using original prompt.")
        return prompt; 
    }
    
    let chat_history_string = "";
    for (let i=0; i < Math.min(chat_history.length, 5); i++) {
        const chat_history_item = chat_history[i];
        const prompt_text = chat_history_item.prompt;
        const response_text = chat_history_item.response;
        chat_history_string += "PROMPT: " + prompt_text + "\nRESPONSE: " + response_text + "\n\n";
    }
    
    const summaryPromptTemplate = PromptTemplate.fromTemplate(
        "You are creating a concise, contextual search query to find the most relevant information for the user.\n" +
        "Review the conversation history below and the user's new prompt.\n" +
        "Generate a search query that captures the user's current intent while incorporating relevant context from previous exchanges.\n" +
        "Focus on finding specific information about Dan's experience, skills, and background that addresses the user's question.\n" +
        "Write a clear, focused query of 1-3 sentences maximum that will help retrieve the most relevant content.\n\n" +
        chat_history_string +
        "NEW PROMPT: {original_prompt}\n\n" +
        "Based on this conversation, the most effective search query would be:\n"
    );
    
    const model = new OpenAI({
        openAIApiKey: openai_api_key,
        temperature: 0,
        maxTokens: 1000,
        modelName: "gpt-4-turbo", // Using GPT-4 for better summarization
    });
    const llmChain = new LLMChain({llm: model, prompt: summaryPromptTemplate});
    const summary = await llmChain.call({original_prompt: prompt})
    console.log("New Prompt for Embedding: ", summary.text);
    return summary.text;
}

function formatChatHistory(chat_history: any) {
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

function formatDocumentMatches(documents: any) {
    if (!documents || documents.length === 0) {
        return "There are no relevant documents found in Dan's information repository.\n" +
            "If appropriate, acknowledge the gap in your knowledge to the user, but only if directly relevant to their query.\n" +
            "Respond in a friendly, professional manner. Be transparent about what you don't know while offering to help with related topics you can discuss.\n" +
            "Keep your tone conversational and helpful. Do not make up information about Dan's experiences or background.\n\n";
    }
    
    const MAX_TOKENS = 1500;
    let document_string = "";
    let tokens = 0;
    
    const docEndString = "\n\nWhen responding, do not reference the document numbers or formatting. Craft a natural, conversational response.\n" + 
        "Include specific examples and details from the documents to provide authentic, accurate information about Dan.\n" +
        "Maintain a friendly yet professional tone, finding the right balance between personable and informative.\n" +
        "Adjust technical depth based on the user's question - provide more detailed technical information for technical queries.\n" +
        "Be concise and focused, prioritizing the most relevant information from the documents to answer the user's specific question.\n\n";
    
    // Calculate tokens for end string
    tokens += Math.ceil(docEndString.length / 4);
    
    // Check if top match is highly relevant
    if (documents[0].similarity >= 0.82) {
        const document = documents[0];
        const highly_relevant = "I've found information that is highly relevant to the user's question.\n" +
            `When appropriate, include a link to this document in your response: <a key="${document.content_path}" href="https://www.danielmathieson.com${document.content_path}">${document.content_title}</a>\n` +
            "HIGHLY RELEVANT DOCUMENT:\n" +
            document.content + 
            "\n\nADDITIONAL RELEVANT INFORMATION:\n";
        
        document_string += highly_relevant;
        tokens += Math.ceil(highly_relevant.length / 4);
        
        // Skip the first document in the loop
        documents.shift();
    } else {
        // Standard intro for relevant documents
        const intro = "Here is relevant information about Dan that addresses the user's question:\nRELEVANT DOCUMENTS:\n";
        document_string += intro;
        tokens += Math.ceil(intro.length / 4);
    }
    
    // Add remaining documents
    for (let i = 0; i < documents.length; i++) {
        const document = documents[i];
        const doc_text = "DOCUMENT "+ (i+1).toString() + ":\n" + document.content + "\n";
        const doc_tokens = Math.ceil(doc_text.length / 4);
        
        if (tokens + doc_tokens > MAX_TOKENS) {
            break;
        }
        
        document_string += doc_text;
        tokens += doc_tokens;
    }
    
    return document_string + docEndString;
}

// Improved Replicate API call with better error handling and timeouts
async function callReplicateAPI(prompt: string) {
    const version = "meta/meta-llama-3-70b-instruct:cf19bede4a10db6f227ab515970d542a3b9f5275dcf209c7fb5da052ace98d15";
    
    if (!replicate_api_key) {
        throw new Error("REPLICATE_API_KEY is not set");
    }
    
    // Create a shortened version of the prompt if it's too long
    // Llama has context length limitations
    let finalPrompt = prompt;
    if (prompt.length > 16000) {
        console.log("Prompt is too long for Llama, shortening...");
        // Keep system info and the user query, but shorten the middle
        const systemEnd = SYSTEM_PROMPT.length + 50;
        const userStart = prompt.lastIndexOf("USER QUERY:");
        
        if (userStart > 0) {
            // Take the system prompt, trimmed middle, and user query
            finalPrompt = prompt.substring(0, systemEnd) + 
                "\n\n[CONTEXT TRIMMED DUE TO LENGTH]\n\n" + 
                prompt.substring(userStart);
            
            console.log(`Shortened prompt from ${prompt.length} to ${finalPrompt.length} chars`);
        }
    }
    
    // Step 1: Create the prediction
    console.log(`Creating prediction with prompt (${finalPrompt.length} chars)`);
    const createUrl = "https://api.replicate.com/v1/predictions";
    
    // Setup the request with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        controller.abort();
        console.log("Request to create prediction timed out after 20 seconds");
    }, 20000);
    
    try {
        // Create the prediction
        const createResponse = await fetch(createUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${replicate_api_key}`
            },
            body: JSON.stringify({
                "version": version,
                "input": {
                    "prompt": finalPrompt,
                    "max_new_tokens": 800, // Reduced from 1000 to avoid context issues
                    "temperature": 0.5,
                    "top_p": 0.9,
                    "repetition_penalty": 1.15,
                }
            }),
            signal: controller.signal
        });
        
        // Clear the timeout
        clearTimeout(timeoutId);
        
        // Check for HTTP errors
        if (!createResponse.ok) {
            const errorBody = await createResponse.text();
            console.log(`Error response: ${errorBody}`);
            throw new Error(`Replicate API error: ${createResponse.status}: ${errorBody}`);
        }
        
        // Parse the response to get the prediction ID
        const createData = await createResponse.json();
        const predictionId = createData.id;
        console.log(`Created prediction with ID: ${predictionId}`);
        
        // Step 2: Poll for the result
        let isComplete = false;
        let attempts = 0;
        const maxAttempts = 30;
        let responseText = "";
        
        console.log("Polling for prediction result...");
        
        while (!isComplete && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
            
            console.log(`Polling attempt ${attempts}/${maxAttempts}`);
            
            // Setup poll request with timeout
            const pollController = new AbortController();
            const pollTimeoutId = setTimeout(() => {
                pollController.abort();
                console.log(`Poll request ${attempts} timed out`);
            }, 5000);
            
            try {
                const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
                    headers: {
                        "Authorization": `Token ${replicate_api_key}`
                    },
                    signal: pollController.signal
                });
                
                // Clear the timeout
                clearTimeout(pollTimeoutId);
                
                if (!statusResponse.ok) {
                    const errorBody = await statusResponse.text();
                    console.log(`Poll error: ${errorBody}`);
                    throw new Error(`Error checking prediction status: ${statusResponse.status}: ${errorBody}`);
                }
                
                const statusData = await statusResponse.json();
                console.log(`Prediction status: ${statusData.status}`);
                
                if (statusData.status === "succeeded") {
                    // For Replicate, output is an array of strings
                    if (Array.isArray(statusData.output)) {
                        responseText = statusData.output.join("");
                    } else {
                        responseText = "Unexpected response format from Llama";
                        console.log(`Unexpected output format: ${JSON.stringify(statusData.output)}`);
                    }
                    
                    console.log(`Got response of length: ${responseText.length} chars`);
                    isComplete = true;
                } else if (statusData.status === "failed") {
                    const errorMsg = statusData.error || "Unknown error";
                    throw new Error(`Prediction failed: ${errorMsg}`);
                }
                // If status is still "processing", continue polling
                
            } catch (pollError) {
                clearTimeout(pollTimeoutId);
                
                if (pollError.name === "AbortError") {
                    console.log("Poll request timed out, continuing to next attempt");
                    // Continue to next attempt
                } else {
                    throw pollError;
                }
            }
        }
        
        if (!isComplete) {
            throw new Error(`Timed out waiting for Llama response after ${maxAttempts} attempts`);
        }
        
        return responseText;
        
    } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === "AbortError") {
            throw new Error("Initial request to Replicate API timed out");
        }
        
        throw error;
    }
}

async function handler(req: Request) {
    console.log("New request received at ", new Date().toISOString());
    
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        console.log("Handling CORS request");
        return new Response(null, {
            status: 204,
            headers: new Headers(corsHeaders),
        });
    }
    
    // For SSE responses
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    try {
        // Parse the request body
        const { prompt: promptInit, chat_id, user_id, include_sources = false } = await req.json();
        const prompt = promptInit.trim();
        console.log("Prompt: ", prompt);
        console.log("Chat ID: ", chat_id);
        console.log("User ID: ", user_id);
        console.log("Include Sources: ", include_sources);
        
        // Moderate the prompt with OpenAI (reused from original code)
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
        
        // Retrieve or create chat
        const { verified_chat_id, verified_chat_history, verified_role_id } = 
            await retrieveChatHistory(chat_id, user_id);
        console.log("Verified Chat ID: ", verified_chat_id);
        
        // Send initial chat_id back to client
        await writer.ready;
        await writer.write(encoder.encode(`data: ${JSON.stringify({ chat_id: verified_chat_id })}\n\n`));
        
        // Generate embeddings and find similar documents
        const embeddingUrl = "https://api.openai.com/v1/embeddings";
        const embeddingHeaders = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openai_api_key}`
        };
        const embeddingBody = JSON.stringify({
            "input": await summarizeChatHistory(verified_chat_history, prompt),
            "model": "text-embedding-3-small",
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
        
        // Find similar documents
        const { data: match_data, error: match_error } = await supabaseClient.rpc(
            "document_similarity", 
            { 
                embedding: promptEmbedding,
                match_threshold: 0.4,
                match_count: 8,
            });
        if (match_error) {
            console.error("Document similarity error:", match_error);
            throw new Error("Failed to match prompt embedding");
        }
        
        // Send sources to client if requested
        const relevantSources = include_sources ? match_data : [];
        if (include_sources && relevantSources.length > 0) {
            await writer.ready;
            await writer.write(encoder.encode(`data: ${JSON.stringify({ sources: relevantSources })}\n\n`));
        }
        
        // Format components for Llama prompt
        const chatHistoryText = formatChatHistory(verified_chat_history);
        const documentContext = formatDocumentMatches(match_data);
        
        // Format the complete prompt for Llama with the correct format
        const llamaPrompt = `<|system|>\n${SYSTEM_PROMPT}\n${chatHistoryText}\n${documentContext}</s>\n<|user|>\n${prompt}</s>\n<|assistant|>\n`;
        
        // Call Replicate API and get response
        try {
            const response = await callReplicateAPI(llamaPrompt);
            
            // Send response to client in chunks
            console.log(`Response length: ${response.length} chars`);
            const chunkSize = 10;
            const totalChunks = Math.ceil(response.length / chunkSize);
            
            for (let i = 0; i < response.length; i += chunkSize) {
                const chunk = response.substring(i, i + chunkSize);
                const chunkNumber = Math.floor(i / chunkSize) + 1;
                
                if (chunkNumber === 1 || chunkNumber === totalChunks || chunkNumber % 50 === 0) {
                    console.log(`Sending chunk ${chunkNumber}/${totalChunks}`);
                }
                
                await writer.ready;
                await writer.write(encoder.encode(`data: ${JSON.stringify({ token: chunk })}\n\n`));
            }
            
            // Save to database
            const metadata = include_sources && relevantSources.length > 0 
                ? { sources: relevantSources, modelName: MODEL_NAME } 
                : { modelName: MODEL_NAME };
                
            const { error } = await supabaseClient
                .from("chat_history")
                .insert([{ 
                    chat_id: verified_chat_id, 
                    user_id: user_id, 
                    role_id: verified_role_id, 
                    prompt: prompt, 
                    response: response,
                    metadata: metadata
                }]);
                
            if (error) {
                console.error("Error saving chat history:", error);
            }
            
            console.log("Response successfully streamed and saved");
        } catch (error) {
            console.error("Error with Replicate API:", error);
            await writer.ready;
            await writer.write(encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`));
        }
        
        // Close the writer
        await writer.ready;
        await writer.close();
        
        // Return the stream
        const headers = new Headers(corsHeaders);
        headers.set("Content-Type", "text/event-stream");
        headers.set("Cache-Control", "no-cache");
        headers.set("Connection", "keep-alive");
        
        return new Response(stream.readable, {
            status: 200,
            headers: headers
        });
    } catch (error) {
        console.error("Unhandled error:", error);
        
        // Try to send error through the stream if it's still open
        try {
            if (writer) {
                await writer.ready;
                await writer.write(encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`));
                await writer.close();
            }
        } catch (streamError) {
            console.error("Error writing to stream:", streamError);
        }
        
        // Return a fallback error response
        const headers = new Headers(corsHeaders);
        headers.set("Content-Type", "application/json");
        
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: headers
        });
    }
}

serve(handler);
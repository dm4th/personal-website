import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { supabaseClient } from '../_shared/supabaseClient.ts';
import { 
    introSystemMessageStr, 
    employerSystemMessageStr
} from '../_shared/promptTemplates.ts';
import { 
    retrieveChatHistory, 
    summarizeChatHistory 
} from '../_shared/chatHelpers.ts';

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");

const DEFAULT_ROLE = "employer";
const DEFAULT_TITLE = "Llama Chat";
const MODEL_NAME = "llama-3-70b-instruct"; // Using Llama 3 70B - large model

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
async function callReplicateAPI(systemPrompt: string, prompt: string) {
    
    if (!REPLICATE_API_KEY) {
        throw new Error("REPLICATE_API_KEY is not set");
    }
    
    // Step 1: Create the prediction
    console.log(`Creating prediction with prompt (${prompt.length} chars)`);
    
    // Setup the request with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        controller.abort();
        console.log("Request to create prediction timed out after 20 seconds");
    }, 20000);
    
    try {
        // Create the prediction
        const createResponse = await fetch('https://api.replicate.com/v1/models/meta/meta-llama-3-70b-instruct/predictions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${REPLICATE_API_KEY}`,
              'Prefer': 'wait'
            },
            body: JSON.stringify({
              input: {
                top_k: 0,
                top_p: 0.9,
                prompt: prompt,
                max_tokens: 1024,
                min_tokens: 0,
                temperature: 0.6,
                system_prompt: systemPrompt,
                length_penalty: 1,
                stop_sequences: "<|end_of_text|>,<|eot_id|>",
                prompt_template: "<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n{system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n{prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n",
                presence_penalty: 1.15,
                log_performance_metrics: false
              }
            })
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
        console.log("Created prediction:", createData.id);
        console.log("FULL CREATE RESPONSE:", JSON.stringify(createData));
        
        // Poll for the result
        let isComplete = false;
        let attempts = 0;
        const maxAttempts = 60; // Longer timeout (60 seconds)
        let fullResponse = "";
        console.log(`Created prediction with ID: ${predictionId}`);
        
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
                        "Authorization": `Token ${REPLICATE_API_KEY}`
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
                        fullResponse = statusData.output.join("");
                    } else {
                        fullResponse = "Unexpected response format from Llama";
                        console.log(`Unexpected output format: ${JSON.stringify(statusData.output)}`);
                    }
                    
                    console.log(`Got response of length: ${fullResponse.length} chars`);
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
        
        return fullResponse;
        
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

    try {
        // Parse the request body
        const { prompt: promptInit, chat_id, user_id } = await req.json();
        const prompt = promptInit.trim();
        console.log("Prompt: ", prompt);
        console.log("Chat ID: ", chat_id);
        console.log("User ID: ", user_id);
        
        // Moderate the prompt with OpenAI (reused from original code)
        const moderationUrl = "https://api.openai.com/v1/moderations";
        const moderationHeaders = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
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
        
        // Get chat history
        const { verified_chat_id, verified_chat_history, verified_role_id } = await retrieveChatHistory(chat_id, user_id, DEFAULT_ROLE, DEFAULT_TITLE);
        console.log("Using chat ID:", verified_chat_id);
        
        // Generate embeddings and find similar documents
        const embeddingUrl = "https://api.openai.com/v1/embeddings";
        const embeddingHeaders = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
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
                match_count: 10,
            });
        if (match_error) {
            console.error("Document similarity error:", match_error);
            throw new Error("Failed to match prompt embedding");
        }
        
        // Send sources to client if requested
        const relevantSources = match_data.map(source => ({
            content_path: source.content_path,
            content_title: source.content_title,
            similarity: source.similarity
        }));
        
        // Format components for Llama prompt
        const systemPrompt = DEFAULT_ROLE === "intro" ? introSystemMessageStr : employerSystemMessageStr;
        const chatHistoryText = formatChatHistory(verified_chat_history);
        const documentContext = formatDocumentMatches(match_data);
        
        // Format the complete prompt for Llama with the correct format
        const llamaPrompt = `<|system|>\n${systemPrompt}\n${chatHistoryText}\n${documentContext}</s>\n<|user|>\n${prompt}</s>\n<|assistant|>\n`;
        
        // Call Replicate API and get response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            start(controller) {
                // Function to send an event
                const sendEvent = (data: any) => {
                    try {
                        const json = JSON.stringify(data);
                        const encoded = encoder.encode(`data: ${json}\n\n`);
                        controller.enqueue(encoded);
                        // console.log(`Sent event: ${Object.keys(data)[0]}`);
                        return true;
                    } catch (error) {
                        // console.error("Error sending event:", error);
                        return false;
                    }
                };

                // Send initial chat_id event
                const chatIdSuccess = sendEvent({ chat_id: verified_chat_id });
                console.log("Chat ID sent successfully:", chatIdSuccess);

                // Send sources event if any
                const sourcesSent = sendEvent({ sources: relevantSources });
                console.log("Sources sent successfully:", sourcesSent);

                const processLlamaResponse = async () => {
                    try {
                        const response = await callReplicateAPI(systemPrompt, llamaPrompt);
                        
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

                            sendEvent({ token: chunk });
                        }
                        
                        // Save to database
                        const metadata = relevantSources.length > 0 
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
                        controller.close();
                    } catch (error) {
                        console.error("Error with Replicate API:", error);
                        sendEvent({ error: error.message });
                    }
                };

                // Start processing the response
                processLlamaResponse().catch(error => {
                    console.error("Error processing response:", error);
                    sendEvent({ error: error.message });
                    controller.close();
                });
            }
        });
        
        // Return the stream
        const headers = new Headers(corsHeaders);
        headers.set("Content-Type", "text/event-stream");
        headers.set("Cache-Control", "no-cache");
        headers.set("Connection", "keep-alive");
        
        console.log("Returning SSE stream response");
        return new Response(stream, {
            status: 200,
            headers
        });
        
    } catch (error) {
        console.error("Error in handler:", error);
        
        // Return error response
        const headers = new Headers(corsHeaders);
        headers.set("Content-Type", "application/json");
        
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers
        });
    }
}

serve(handler);
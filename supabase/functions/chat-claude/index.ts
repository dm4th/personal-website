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
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

const DEFAULT_ROLE = "employer";
const DEFAULT_TITLE = "Claude Chat";
const MODEL_NAME = "claude-3-5-sonnet-20240620"; 

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
    if (documents[0].similarity >= 0.55) {
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

// Function to call Anthropic API and stream results
async function callAnthropicAPI(system_prompt: string, prompt: string, onData: (data: string) => void) {
    const url = "https://api.anthropic.com/v1/messages";
    
    const headers = {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
    };
    
    const body = JSON.stringify({
        "model": MODEL_NAME,
        "system": system_prompt,
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "max_tokens": 1024,
        "temperature": 0.7,
        "stream": true
    });
    
    console.log(`Prompt length: ${prompt.length} chars`);
    console.log("Making request to Anthropic API with stream=true");

    const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: body
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.log(`Error response: ${errorBody}`);
        throw new Error(`Anthropic API error: ${response.status}: ${errorBody}`);
    } else {
        const reader = response.body.getReader();   
        const decoder = new TextDecoder();
        let buffer = '';
        let receivedAnyContent = false;
        let fullResponseText = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }

            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const eventData = line.slice(6);
                    if (eventData.trim()) {
                        try {
                            if (eventData === "[DONE]") {
                                break;
                            }
                            const data = JSON.parse(eventData);
                            if (data.type === 'content_block_delta' && data.delta && data.delta.text) {
                                onData(data.delta.text);
                                fullResponseText += data.delta.text;
                                receivedAnyContent = true;
                            } else if (data.type === 'content_block_start' && data.content_block && data.content_block.text) {
                                onData(data.content_block.text);
                                fullResponseText += data.content_block.text;
                                receivedAnyContent = true;
                            } else if (data.type === 'message_delta' && data.delta && data.delta.text) {
                                onData(data.delta.text);
                                fullResponseText += data.delta.text;
                                receivedAnyContent = true;
                            }
                        } catch (error) {
                            console.error('Error parsing Claude event data:', error, "Raw data:", eventData);
                        }
                    }
                }
            }
        }

        if (!receivedAnyContent) {
            console.log("No content received from Claude API, sending fallback");
            fullResponseText = "I'm sorry, I couldn't generate a response at this time. Please try again.";
        }
    }
    
    return fullResponseText;
}

// Handler function for the Edge Function
async function handler(req: Request) {
    console.log("New request received at", new Date().toISOString());
    
    // Handle CORS
    if (req.method === "OPTIONS") {
        console.log("Handling CORS preflight request");
        return new Response(null, {
            status: 204,
            headers: new Headers(corsHeaders),
        });
    }
  
    try {
        // Parse request data
        const { prompt, chat_id, user_id } = await req.json();
        console.log("Received prompt:", prompt.substring(0, 30) + "...");
        
        // check that the prompt passes openAi moderation checks
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

        // generate embedding for the user prompt
        const embeddingUrl = "https://api.openai.com/v1/embeddings";
        const embeddingHeaders = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
        };
        const embeddingBody = JSON.stringify({
            "input": await summarizeChatHistory(verified_chat_history, prompt),
            "model": "text-embedding-3-small", // Latest embedding model
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

        // Store relevant sources with content stripped out to reduce payload size
        const relevantSources = match_data ? match_data.map(source => ({
            content_path: source.content_path,
            content_title: source.content_title,
            similarity: source.similarity
            // Content field is intentionally removed to reduce payload size
        })) : [];

        const systemPrompt = DEFAULT_ROLE === "employer" ? employerSystemMessageStr : introSystemMessageStr;
        // Use match_data (with full content) for Claude's context
        const claudePrompt = `CHAT HISTORY: ${formatChatHistory(verified_chat_history)}\n\nRELEVANT DOCUMENTS: ${formatDocumentMatches(match_data)}\n\nUSER PROMPT: ${prompt}`;
        
        // Instead of TransformStream, use ReadableStream directly
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
                
                // Send chat ID immediately
                const chatIdSuccess = sendEvent({ chat_id: verified_chat_id });
                console.log("Chat ID sent successfully:", chatIdSuccess);
                
                // Send sources immediately
                const sourcesSuccess = sendEvent({ sources: relevantSources });
                console.log("Sources sent successfully:", sourcesSuccess);
                
                // Function to process Claude API results
                const processClaude = async () => {
                    try {
                        // Call Claude API
                        const claudeApi = "https://api.anthropic.com/v1/messages";
                        console.log("Calling Claude API...");
                        
                        const claudeResponse = await fetch(claudeApi, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "x-api-key": ANTHROPIC_API_KEY,
                                "anthropic-version": "2023-06-01"
                            },
                            body: JSON.stringify({
                                model: "claude-3-5-sonnet-20240620",
                                system: systemPrompt,
                                messages: [{ role: "user", content: claudePrompt }],
                                max_tokens: 1024,
                                stream: true
                            })
                        });
                        
                        if (!claudeResponse.ok) {
                            const errorText = await claudeResponse.text();
                            console.error("Claude API error:", errorText);
                            sendEvent({ error: `Claude API error: ${claudeResponse.status}` });
                            controller.close();
                            return;
                        }
                        
                        // Process the streamed response
                        const reader = claudeResponse.body.getReader();
                        const textDecoder = new TextDecoder();
                        let buffer = '';
                        let fullResponseText = '';
                        
                        while (true) {
                            const { done, value } = await reader.read();
                            if (done) break;
                            
                            // Decode and buffer the chunk
                            buffer += textDecoder.decode(value, { stream: true });
                            
                            // Process complete events in buffer
                            const lines = buffer.split('\n');
                            buffer = lines.pop() || '';
                            
                            for (const line of lines) {
                                if (line.startsWith('data: ')) {
                                    const eventData = line.slice(6);
                                    if (!eventData.trim() || eventData === "[DONE]") continue;
                                    
                                    try {
                                        const data = JSON.parse(eventData);
                                        
                                        // Handle different Claude streaming formats
                                        if (data.type === 'content_block_delta' && data.delta?.text) {
                                            sendEvent({ token: data.delta.text });
                                            fullResponseText += data.delta.text;
                                        } else if (data.type === 'content_block_start' && data.content_block?.text) {
                                            sendEvent({ token: data.content_block.text });
                                            fullResponseText += data.content_block.text;
                                        } else if (data.type === 'message_delta' && data.delta?.text) {
                                            sendEvent({ token: data.delta.text });
                                            fullResponseText += data.delta.text;
                                        }
                                    } catch (error) {
                                        console.error("Error parsing Claude event:", error);
                                    }
                                }
                            }
                        }
                        
                        console.log("Claude streaming complete");
                        controller.close();

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
                                response: fullResponseText,
                                metadata: metadata
                            }]);
                        
                    } catch (error) {
                        console.error("Error in Claude processing:", error);
                        sendEvent({ error: error.message });
                        controller.close();
                    }
                };
                
                // Start the Claude processing (no await - we want it to run asynchronously)
                processClaude().catch(err => {
                    console.error("Unhandled error in processClaude:", err);
                    try {
                        sendEvent({ error: "Internal server error" });
                        controller.close();
                    } catch (closeErr) {
                        console.error("Error closing stream:", closeErr);
                    }
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
// Llama API route handler using Replicate
import Replicate from 'replicate';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Extract request data
    const { prompt, chat_id, user_id } = req.body;

    // Configure SSE response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Prevent buffering

    // Get Supabase configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration is missing. Please check NEXT_PUBLIC_SUPABASE_URL and SERVICE_ROLE_KEY environment variables.');
    }

    // Make a direct fetch request to the edge function URL
    const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL}/chat-llama`;
    
    // Forward the client's request to the edge function
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Accept': 'text/event-stream'  // Important: Request streaming response
      },
      body: JSON.stringify({
        prompt,
        chat_id,
        user_id
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Edge function error: ${response.status} - ${errorText}`);
    }

    // Set up a reader to receive the streaming response from the edge function
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    // Variables to hold parsed events for buffering
    let sentChatId = false;
    let bufferedSources = null;
    let seenSourcesEvent = false;
    let tokenCount = 0; // Track how many tokens are sent
    
    // Add a buffer for incomplete events
    let eventBuffer = '';
    
    // Process the stream by forwarding each chunk to the client
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        // End the response when the stream is complete
        console.log('Stream complete');
        res.end();
        break;
      }
      
      // Decode the chunk to text
      const chunk = decoder.decode(value, { stream: true });
      
      // Process events in the chunk
      const parts = (eventBuffer + chunk).split('\n\n');
      // The last part might be incomplete, so save it for the next chunk
      eventBuffer = parts.pop() || '';
      
      // Process complete events
      const events = parts.filter(e => e.trim());
      for (const event of events) {
        if (event.startsWith('data: ')) {
          try {
            // Log raw event data for debugging
            const rawData = event.slice(6);
            
            // Attempt to parse, with better error handling
            let data;
            try {
              data = JSON.parse(rawData);
            } catch (parseError) {
              console.error(`JSON parse error: ${parseError.message}`);
              console.error(`Problem with JSON at position ${parseError.position}`);
              // Skip this malformed event and continue processing others
              continue;
            }
            
            // Handle chat_id event - pass through immediately
            if (data.chat_id && !sentChatId) {
              res.write(event + '\n\n');
              sentChatId = true;
            }
            // Buffer sources events until we have them all
            else if (data.sources) {
              seenSourcesEvent = true;
              // Strip out the content field to reduce size and avoid chunking
              bufferedSources = data.sources.map(source => ({
                content_path: source.content_path,
                content_title: source.content_title,
                similarity: source.similarity
                // Content field is intentionally removed
              }));
            }
            // Once we see a token event, first send buffered sources if any
            else if (data.token) {
              // If we've seen sources but haven't sent them yet, send them first
              if (seenSourcesEvent && bufferedSources !== null) {
                const sourcesEvent = `data: ${JSON.stringify({ sources: bufferedSources })}\n\n`;
                res.write(sourcesEvent);
                bufferedSources = null;
              }
              
              // Then send token event
              res.write(event + '\n\n');
              // Explicitly flush the response buffer to ensure data is sent immediately
              if (typeof res.flush === 'function') res.flush();
              tokenCount += data.token.length;
            }
            // Pass through any other event types
            else {
              res.write(event + '\n\n');
            }
          } catch (e) {
            console.error("Error parsing event:", e);
            res.write(event + '\n\n'); // Forward the event anyway
          }
        } else {
          // Not a data event, pass through unchanged
          res.write(event + '\n\n');
        }
      }
    }

  } catch (error) {
    console.error('Error in Llama API route:', error);
    
    // If the response hasn't been sent yet, send an error response
    if (!res.writableEnded) {
      const errorMessage = JSON.stringify({ error: error.message });
      res.write(`data: ${errorMessage}\n\n`);
      res.end();
    }
  }
}

const oldGetLlamaResponse = async (prompt) => {
  // Call Replicate Llama model directly
  const replicateApiKey = process.env.REPLICATE_API_KEY;
  const model = "meta/meta-llama-3-70b-instruct";
  const url = `https://api.replicate.com/v1/predictions`;

  // Create system prompt - same as others for consistency
  const systemPrompt = `You are a friendly and professional virtual assistant helping users learn about Dan Mathieson.
Your goal is to provide helpful, accurate information about Dan's background, skills, and experiences in a conversational yet professional tone.
Always present Dan in a positive but authentic light. Be approachable but maintain an appropriate level of professionalism.
You are not Dan - clearly position yourself as an assistant designed to help people learn about him.
Include relevant personal anecdotes when appropriate to make your responses engaging, but keep the focus on providing useful information.
Adjust your technical depth based on the user's questions - be more detailed with technical topics when appropriate.
Dan Mathieson is a software engineer in his late 20's with expertise in AI engineering, software development, and data science.
He lives in San Francisco with his girlfriend Maggie and their dog Winnie. He built this website including the AI chat functionality.
When discussing challenges or problems, maintain a solution-oriented perspective that highlights learning and growth.
Be concise but thorough in your responses, prioritizing quality information over length.`;

  // Start the streaming prediction
  try {
    
    const createResponse = await fetch('https://api.replicate.com/v1/models/meta/meta-llama-3-70b-instruct/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${replicateApiKey}`,
        'Content-Type': 'application/json',
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
    
    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error("Replicate creation error:", errorText);
      throw new Error(`Error creating Llama prediction: ${createResponse.status} - ${errorText}`);
    }
    
    const createData = await createResponse.json();

    // Poll for results
    let isComplete = false;
    let attempts = 0;
    const maxAttempts = 40; // 40 seconds timeout
    let fullResponse = "";
    let receivedAnyContent = false;
    
    // Poll for the result
    while (!isComplete && attempts < maxAttempts) {
      attempts++;
      
      // Add a delay between poll attempts
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${createData.id}`, {
          headers: {
            'Authorization': `Bearer ${replicateApiKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!statusResponse.ok) {
          console.error("Error polling prediction:", await statusResponse.text());
          continue;
        }
        
        const statusData = await statusResponse.json();
        
        if (statusData.status === "succeeded") {
          isComplete = true;
          receivedAnyContent = true;
          
          if (typeof statusData.output === 'string') {
            fullResponse = statusData.output;
          }
          else if (Array.isArray(statusData.output)) {
            fullResponse = statusData.output.join("");
          }
          else if (statusData.output && typeof statusData.output === 'object') {
            const possibleFields = ['text', 'content', 'generated_text', 'generation'];
            for (const field of possibleFields) {
              if (statusData.output[field]) {
                fullResponse = statusData.output[field];
                break;
              }
            }
            
            if (!fullResponse) {
              fullResponse = JSON.stringify(statusData.output);
            }
          }
        }
        else if (statusData.status === "failed") {
          console.error("Prediction failed:", statusData.error);
          throw new Error(`Prediction failed: ${statusData.error || "Unknown error"}`);
        }
        // Continue polling if still processing
      }
      catch (error) {
        console.error("Error polling prediction:", error);
        // Continue polling even if there's an error
      }
    }
    
    // Stream the response in chunks
    if (fullResponse) {
      receivedAnyContent = true;
      
      const chunkSize = 10;
      for (let i = 0; i < fullResponse.length; i += chunkSize) {
        const chunk = fullResponse.substring(i, i + chunkSize);
        res.write(`data: ${JSON.stringify({ token: chunk })}\n\n`);
        
        // Add a small delay for more natural streaming
        await new Promise(resolve => setTimeout(resolve, 15));
      }
    }
    
    // If we didn't get any real content, send a fallback message
    if (!receivedAnyContent) {
      console.log("No content received from Llama model, sending fallback");
      res.write(`data: ${JSON.stringify({ token: "I'm sorry, I couldn't generate a response at this time. Please try again." })}\n\n`);
    }
    
    // Close the response when done
    res.end();
  } catch (error) {
    console.error('Replicate API error:', error);
    throw new Error(`Llama API error: ${error.message}`);
  }
}
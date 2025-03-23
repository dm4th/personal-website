// Llama API route handler using Replicate
import Replicate from 'replicate';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Extract request data
    const { prompt, chat_id, user_id, include_sources } = req.body;

    // Configure SSE response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Initialize Replicate client (for Llama)
    const replicateApiKey = process.env.REPLICATE_API_KEY;
    const replicate = new Replicate({
      auth: replicateApiKey,
    });

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
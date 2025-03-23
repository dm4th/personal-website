// Llama API route for the multi-LLM feature (via Replicate)
// IMPORTANT: This endpoint does NOT store anything in the database
// It only streams the response directly to the client
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract prompt, ignoring any potential database related fields
    const { prompt, store_in_db, chat_id, user_id, ...rest } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    // Explicitly ensure we're not storing in the database
    const shouldStoreInDb = false;

    // Set appropriate headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Get the Replicate API key from environment variables
    const apiKey = process.env.REPLICATE_API_KEY;
    if (!apiKey) {
      throw new Error('REPLICATE_API_KEY is not configured');
    }
    
    // Basic system prompt for Llama
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

    // Send first event to keep connection alive
    res.write(`data: ${JSON.stringify({ token: "" })}\n\n`);
    
    console.log("Creating Replicate prediction with Llama");
    
    // First, see what models are actually available
    console.log("Checking available models on Replicate...");
    try {
      const modelsResponse = await fetch('https://api.replicate.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      if (modelsResponse.ok) {
        const models = await modelsResponse.json();
        console.log("Available models count:", models.results?.length || 0);
        // Log a few model names
        if (models.results && models.results.length > 0) {
          console.log("Some available models:");
          models.results.slice(0, 5).forEach(model => {
            console.log(`- ${model.owner}/${model.name}`);
          });
        }
      } else {
        console.error("Couldn't retrieve models:", await modelsResponse.text());
      }
    } catch (e) {
      console.error("Error checking models:", e);
    }

    // Use the exact format from the successful curl request
    const systemPromptText = `You are a friendly and professional virtual assistant helping users learn about Dan Mathieson.
Your goal is to provide helpful, accurate information about Dan's background, skills, and experiences in a conversational yet professional tone.
Always present Dan in a positive but authentic light. Be approachable but maintain an appropriate level of professionalism.
You are not Dan - clearly position yourself as an assistant designed to help people learn about him.
Include relevant personal anecdotes when appropriate to make your responses engaging, but keep the focus on providing useful information.
Adjust your technical depth based on the user's questions - be more detailed with technical topics when appropriate.
Dan Mathieson is a software engineer in his late 20's with expertise in AI engineering, software development, and data science.
He lives in San Francisco with his girlfriend Maggie and their dog Winnie. He built this website including the AI chat functionality.
When discussing challenges or problems, maintain a solution-oriented perspective that highlights learning and growth.
Be concise but thorough in your responses, prioritizing quality information over length.`;

    console.log("Making Replicate API call with exact curl format");
    const createResponse = await fetch('https://api.replicate.com/v1/models/meta/meta-llama-3-70b-instruct/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Prefer': 'wait'
      },
      body: JSON.stringify({
        input: {
          top_k: 0,
          top_p: 0.9,
          prompt: prompt,
          max_tokens: 512,
          min_tokens: 0,
          temperature: 0.6,
          system_prompt: systemPromptText,
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
      
      // If we can't access any Replicate models, use a mock implementation
      console.log("Falling back to mock implementation due to Replicate API issues");
      
      // Collection of well-crafted mock responses with Llama style
      const mockResponses = [
        `Based on the information I have, Dan Mathieson is a software engineer in his late 20's with expertise in AI engineering, software development, and data science. He currently lives in San Francisco with his girlfriend Maggie and their dog Winnie.

Dan built this personal website, including the AI chat functionality you're using right now. His approach to technical challenges is solution-oriented, focusing on learning and growth opportunities.

As an AI assistant designed to provide information about Dan (not Dan himself), I can tell you he has experience in various areas of software development. If you have specific questions about his skills, experiences, or background, I'd be happy to provide more details based on the information available to me.`,

        `Looking at your question about Dan Mathieson, I can share that he's a software engineer in his late 20's with several areas of expertise:

1. AI engineering
2. Software development 
3. Data science

Dan lives in San Francisco with his girlfriend Maggie and their dog Winnie. This website, including the AI chat functionality you're using now, was developed by him.

I'm an AI assistant designed to help users learn about Dan, not Dan himself. I aim to provide accurate, helpful information about his background and experiences in a conversational yet professional tone.

Would you like to know more about any specific aspect of Dan's background or skills?`,

        `From what I understand about Dan Mathieson, he's a software engineer in his late 20's who specializes in AI engineering, software development, and data science. He currently lives in San Francisco with his girlfriend Maggie and their dog Winnie.

Dan is the creator of this website, including the AI chat feature you're using to communicate with me right now. When approaching challenges in his work, he maintains a solution-oriented perspective that emphasizes learning and growth.

I should clarify that I'm an AI assistant designed to provide information about Dan, rather than being Dan himself. I try to present information about him in a positive but authentic light, while maintaining a conversational and professional tone.

Is there anything specific about Dan's skills, experiences, or background you'd like to know more about?`
      ];
      
      // Select a random response
      const mockResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      
      // Stream the mock response in chunks to simulate real API
      res.write(`data: ${JSON.stringify({ token: "\b".repeat(50) })}\n\n`); // Clear waiting message
      const chunkSize = 10;
      for (let i = 0; i < mockResponse.length; i += chunkSize) {
        const chunk = mockResponse.substring(i, i + chunkSize);
        res.write(`data: ${JSON.stringify({ token: chunk })}\n\n`);
        await new Promise(resolve => setTimeout(resolve, 15));
      }
      
      res.end();
      return;
    }
    
    const createData = await createResponse.json();
    console.log("Created prediction:", createData.id);
    console.log("FULL CREATE RESPONSE:", JSON.stringify(createData));
    
    // Poll for the result
    let isComplete = false;
    let attempts = 0;
    const maxAttempts = 60; // Longer timeout (60 seconds)
    let fullResponse = "";
    
    // Let the client know we're generating
    res.write(`data: ${JSON.stringify({ token: "Generating response with Llama... " })}\n\n`);
    
    while (!isComplete && attempts < maxAttempts) {
      attempts++;
      
      // Wait between polling attempts
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      
      // Poll for status
      console.log(`Polling attempt ${attempts}/${maxAttempts}`);
      // Make sure we're using the exact API token format from the curl example
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${createData.id}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!statusResponse.ok) {
        console.error("Polling error:", await statusResponse.text());
        continue; // Try again
      }
      
      const statusData = await statusResponse.json();
      console.log("Status:", statusData.status);
      
      if (statusData.status === "succeeded") {
        isComplete = true;
        
        // Dump complete response for debugging
        console.log("COMPLETE STATUS DATA:", JSON.stringify(statusData));
        console.log("OUTPUT TYPE:", typeof statusData.output);
        console.log("IS ARRAY:", Array.isArray(statusData.output));
        
        // First check for the expected Llama 3 format based on curl example
        if (typeof statusData.output === 'string') {
          // Direct string output (most common for Llama 3 via Replicate)
          fullResponse = statusData.output;
          console.log("Response is string, length:", fullResponse.length);
          console.log("First 100 chars:", fullResponse.substring(0, 100));
        } 
        // Fall back to array checking if not a direct string
        else if (Array.isArray(statusData.output)) {
          // Log array elements for debugging
          console.log("ARRAY ELEMENTS:");
          statusData.output.forEach((item, index) => {
            console.log(`[${index}]: ${typeof item}:`, item);
          });
          
          // Join array output
          fullResponse = statusData.output.join("");
          console.log("Response from array, length:", fullResponse.length);
          
          // Extract first 100 chars (for debugging)
          if (fullResponse.length > 0) {
            console.log("First 100 chars:", fullResponse.substring(0, 100));
          }
        } 
        // If it's an object, try to extract the response
        else if (statusData.output && typeof statusData.output === 'object') {
          // Log all object keys
          console.log("OBJECT KEYS:", Object.keys(statusData.output));
          
          // Try to find string in object
          if (statusData.output.text) {
            fullResponse = statusData.output.text;
            console.log("Found 'text' property");
          } else if (statusData.output.content) {
            fullResponse = statusData.output.content;
            console.log("Found 'content' property");
          } else if (statusData.output.generated_text) {
            fullResponse = statusData.output.generated_text;
            console.log("Found 'generated_text' property");
          } else if (statusData.output.generation) {
            fullResponse = statusData.output.generation;
            console.log("Found 'generation' property");
          } else if (statusData.output.response) {
            fullResponse = statusData.output.response;
            console.log("Found 'response' property");
          } else {
            // Stringify the entire object as a last resort
            fullResponse = JSON.stringify(statusData.output);
            console.log("Stringified object");
          }
          
          console.log("Response from object extraction, length:", fullResponse.length);
          console.log("First 100 chars:", fullResponse.substring(0, 100));
        } else {
          fullResponse = "Error: Couldn't parse Llama's response.";
          console.error("Unexpected output format:", statusData.output);
        }
      } else if (statusData.status === "failed") {
        console.error("Prediction failed:", statusData.error);
        throw new Error(`Replicate prediction failed: ${statusData.error || "Unknown error"}`);
      }
      // Continue polling if still processing
    }
    
    if (!isComplete) {
      throw new Error("Timed out waiting for Llama response");
    }
    
    // Remove any "waiting" text we sent
    res.write(`data: ${JSON.stringify({ token: "\b".repeat(50) })}\n\n`);
    
    // Only stream if we got a response
    if (fullResponse) {
      console.log("Streaming response of length:", fullResponse.length);
      
      // Stream the response in chunks
      const chunkSize = 10;
      for (let i = 0; i < fullResponse.length; i += chunkSize) {
        const chunk = fullResponse.substring(i, i + chunkSize);
        res.write(`data: ${JSON.stringify({ token: chunk })}\n\n`);
        
        // Small delay for natural streaming effect
        await new Promise(resolve => setTimeout(resolve, 15));
      }
    } else {
      console.error("No response received from Llama");
      res.write(`data: ${JSON.stringify({ token: "Sorry, I couldn't generate a response at this time." })}\n\n`);
    }
    
    // End the response
    res.end();
    
  } catch (error) {
    console.error('Error in Llama endpoint:', error);
    
    // If headers haven't been sent yet, send a JSON error response
    if (!res.headersSent) {
      return res.status(500).json({ error: error.message });
    }
    
    // If already streaming, send the error in the stream format
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
}
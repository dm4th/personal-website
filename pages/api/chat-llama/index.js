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
    
    // Create a message to send to the client to identify the chat_id
    if (chat_id) {
      const chatIdMessage = JSON.stringify({ chat_id });
      res.write(`data: ${chatIdMessage}\n\n`);
    }

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
      // Use Meta's Llama 3 model via Replicate
      const prediction = await replicate.predictions.create({
        // Llama 3 8B model
        version: "meta/meta-llama-3-8b-instruct:2d483e5623c1f7a6e048e51da4e28129d3a68a1da189fe915a9b3dc8c04c12c1",
        input: {
          prompt: `<|system|>\n${systemPrompt}</s>\n<|user|>\n${prompt}</s>\n<|assistant|>\n`,
          temperature: 0.7,
          max_new_tokens: 1000,
          repetition_penalty: 1.15,
          top_p: 0.9,
          stream: true
        },
        stream: true,
      });

      // Process the streaming output
      for await (const event of prediction) {
        if (event && typeof event === 'string') {
          const message = JSON.stringify({ token: event });
          res.write(`data: ${message}\n\n`);
        }
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
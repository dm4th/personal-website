// GPT-4 API route handler that forwards to Supabase functions
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Extract request data
    const { prompt, chat_id, user_id, include_sources } = req.body;
    
    
    const chatRole = chat_id ? undefined : 'intro'; // Default to intro for new chats

    // Configure SSE response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Get Supabase configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration is missing. Please check NEXT_PUBLIC_SUPABASE_URL and SERVICE_ROLE_KEY environment variables.');
    }

    // Instead of using the supabase.functions.invoke() method which doesn't support streaming,
    // we'll make a direct fetch request to the edge function URL
    const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL}/chat-gpt4`;
    
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
    
    // Process the stream by forwarding each chunk to the client
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        // End the response when the stream is complete
        res.end();
        break;
      }
      
      // Decode the chunk to text
      const chunk = decoder.decode(value, { stream: true });
      
      // Just pass through the raw chunk - don't try to parse it
      res.write(chunk);
    }
    
  } catch (error) {
    console.error('Error in GPT-4 API route:', error);
    
    // If the response hasn't been sent yet, send an error response
    if (!res.writableEnded) {
      const errorMessage = JSON.stringify({ error: error.message });
      res.write(`data: ${errorMessage}\n\n`);
      res.end();
    }
  }
}
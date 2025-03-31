// Claude API route handler
import { createParser } from 'eventsource-parser';

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
    
    // Get Supabase configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration is missing.');
    }

    // Make a direct fetch request to the edge function URL
    const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL}/chat-claude`;
    
    // Forward the client's request to the edge function
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Accept': 'text/event-stream' 
      },
      body: JSON.stringify({
        prompt,
        chat_id,
        user_id
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Edge function error:", errorText);
      throw new Error(`Edge function error: ${response.status} - ${errorText}`);
    }

    // Set up a reader to receive the streaming response from the edge function
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    try {
      // Process the stream by forwarding each chunk to the client
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          res.end();
          break;
        }
        
        // Decode the chunk to text
        const chunk = decoder.decode(value, { stream: true });
        
        // Just pass through the raw chunk - don't try to parse it
        res.write(chunk);
      }
    } catch (streamError) {
      console.error("Error processing stream:", streamError);
      
      // Ensure response is ended
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify({ error: "Stream processing error" })}\n\n`);
        res.end();
      }
    }
    
  } catch (error) {
    console.error('Error in Claude API route:', error);
    
    // If the response hasn't been sent yet, send an error response
    if (!res.writableEnded) {
      const errorMessage = JSON.stringify({ error: error.message });
      res.write(`data: ${errorMessage}\n\n`);
      res.end();
    }
  }
}

const oldGetClaudeResponse = async (prompt) => {
  // Call Anthropic Claude API directly
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  const apiUrl = 'https://api.anthropic.com/v1/messages';

  // Create system prompt - same as GPT-4 for consistency
  const systemPrompt = `You are a friendly and professional virtual assistant helping users learn about Dan Mathieson.
Your goal is to provide helpful, accurate information about Dan's background, skills, and experiences in a conversational yet professional tone.
Always present Dan in a positive but authentic light. Be approachable but maintain an appropriate level of professionalism.
You are not Dan - clearly position yourself as an assistant designed to help people learn about him.
Include relevant personal anecdotes when appropriate to make your responses engaging, but keep the focus on providing useful information.
Adjust your technical depth based on the user's questions - be more detailed with technical topics when appropriate.
Dan Mathieson is a software engineer in his early 30's with expertise in AI engineering, software development, and data science.
He lives in San Francisco with his girlfriend Maggie and their dog Winnie. He built this website including the AI chat functionality.
When discussing challenges or problems, maintain a solution-oriented perspective that highlights learning and growth.
Be concise but thorough in your responses, prioritizing quality information over length.`;
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': anthropicApiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20240620', 
      system: systemPrompt, 
      messages: [
        {
          role: 'user',
          content: prompt 
        }
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 1024
    }),
  });

  // Handle streaming response
  if (response.ok) {
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    
    // Track if we received any content
    let receivedAnyContent = false;

    // Process the stream
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      // Decode the chunk and add it to our buffer
      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;
      
      // Process complete events in the buffer
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const eventData = line.slice(6); // Remove 'data: ' prefix
          
          // Skip empty lines
          if (!eventData.trim()) continue;
          
          try {
            if (eventData === "[DONE]") {
              break;
            }
            
            const data = JSON.parse(eventData);
            
            // Set flag that we received content
            receivedAnyContent = true;
            
            // Handle different Claude streaming format types
            if (data.type === 'content_block_delta' && data.delta && data.delta.text) {
              const content = data.delta.text;
              const message = JSON.stringify({ token: content });
              res.write(`data: ${message}\n\n`);
            } else if (data.type === 'content_block_start' && data.content_block && data.content_block.text) {
              const content = data.content_block.text;
              const message = JSON.stringify({ token: content });
              res.write(`data: ${message}\n\n`);
            } else if (data.type === 'message_delta' && data.delta && data.delta.text) {
              const content = data.delta.text;
              const message = JSON.stringify({ token: content });
              res.write(`data: ${message}\n\n`);
            } 
          } catch (error) {
            console.error('Error parsing Claude event data:', error, "Raw data:", eventData);
          }
        }
      }
    }
    
    // If we didn't get any response content, send a fallback message
    if (!receivedAnyContent) {
      console.log("No content received from Claude API, sending fallback");
      res.write(`data: ${JSON.stringify({ token: "I'm sorry, I couldn't generate a response at this time. Please try again." })}\n\n`);
    }
    
    // Ensure the response is closed
    if (!res.writableEnded) {
      res.end();
    }
  } else {
    // Handle error
    const errorText = await response.text();
    throw new Error(`Claude API error: ${response.status} - ${errorText}`);
  }
}
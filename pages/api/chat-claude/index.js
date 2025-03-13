// Claude API route handler
import { createParser } from 'eventsource-parser';

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
Dan Mathieson is a software engineer in his late 20's with expertise in AI engineering, software development, and data science.
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
        model: 'claude-3-sonnet-20240229',
        messages: [
          {
            role: 'user',
            content: `${systemPrompt}\n\nUser question: ${prompt}`
          }
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    // Handle streaming response
    if (response.ok) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const parser = createParser((event) => {
        if (event.type === 'event') {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'content_block_delta') {
              const content = data.delta?.text || '';
              if (content) {
                const message = JSON.stringify({ token: content });
                res.write(`data: ${message}\n\n`);
              }
            } else if (data.type === 'message_stop') {
              res.end();
            }
          } catch (error) {
            console.error('Error parsing Claude event data:', error);
          }
        }
      });

      // Process the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        parser.feed(chunk);
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
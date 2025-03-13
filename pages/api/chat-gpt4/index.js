// GPT-4 API route handler
import { createParser } from 'eventsource-parser';
import { fetchEventSource } from '@microsoft/fetch-event-source';

// This is a modified version of the chat API to use GPT-4
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Forward the request to the Supabase function with model information
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

    // Call OpenAI directly with GPT-4
    const apiKey = process.env.OPENAI_API_KEY;
    const apiUrl = 'https://api.openai.com/v1/chat/completions';

    // Create system prompt
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
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        stream: true,
        temperature: 0.7,
      }),
    });

    // Handle streaming response
    if (response.ok) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const parser = createParser((event) => {
        if (event.type === 'event') {
          if (event.data === '[DONE]') {
            res.end();
            return;
          }
          
          try {
            const data = JSON.parse(event.data);
            const content = data.choices[0]?.delta?.content || '';
            
            if (content) {
              const message = JSON.stringify({ token: content });
              res.write(`data: ${message}\n\n`);
            }
          } catch (error) {
            console.error('Error parsing event data:', error);
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
      
      // Close the response when done
      res.end();
    } else {
      // Handle error
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
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
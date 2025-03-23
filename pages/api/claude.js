// Claude API route for the multi-LLM feature
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
    
    // Get the Anthropic API key from environment variables
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }
    
    // Standard system prompt for consistency across models
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

    // Claude API request
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        system: systemPrompt, // Top-level system parameter as required by Claude API
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.5
      })
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Claude API error:', errorData);
      return res.status(response.status).json({ 
        error: `Claude API error: ${response.status}`,
        details: errorData
      });
    }
    
    const data = await response.json();
    
    // Check the response format
    if (!data || !data.content || !Array.isArray(data.content) || data.content.length === 0) {
      console.error('Invalid Claude API response format:', data);
      return res.status(500).json({ error: 'Invalid response format from Claude API' });
    }
    
    // Get the text content from Claude's response
    const responseText = data.content[0].text;
    
    // Simulate streaming by sending the response in chunks
    const chunkSize = 10;
    for (let i = 0; i < responseText.length; i += chunkSize) {
      const chunk = responseText.substring(i, i + chunkSize);
      // Send each chunk as a JSON event
      res.write(`data: ${JSON.stringify({ token: chunk })}\n\n`);
      // Add a small delay for more natural streaming
      await new Promise(resolve => setTimeout(resolve, 15));
    }
    
    // End the response
    res.end();
    
  } catch (error) {
    console.error('Error handling Claude request:', error);
    
    // If headers haven't been sent yet, send a JSON error response
    if (!res.headersSent) {
      return res.status(500).json({ error: error.message });
    }
    
    // If already streaming, send the error in the stream format
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
}
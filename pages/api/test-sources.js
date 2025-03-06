// This is a local test endpoint to help with testing source references
// It will be used to simulate the response from the Supabase functions
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  
  try {
    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Get a random selection of content pages to show as sources
    const { data: pages, error } = await supabase
      .from('page')
      .select('id, directory, page_name, section, sub_section')
      .limit(3);
      
    if (error) throw error;
    
    // Create mock source references with similarity scores
    let sources = [];
    
    if (pages && pages.length > 0) {
      sources = pages.map((page, index) => {
        // Make sure all sources have high similarity for testing
        const similarity = 0.95 - (index * 0.03); // 0.95, 0.92, 0.89
        
        // Sanitize the title to make it more readable
        const title = (page.sub_section || page.section || '')
          .replace(/-/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
          
        return {
          content_path: `/info/${page.directory}/${page.page_name}#user-content-${page.sub_section || page.section}`,
          content_title: title,
          similarity: similarity
        };
      });
    } else {
      // If no pages found, create some mock sources for testing
      sources = [
        {
          content_path: "/info/career/google#user-content-data-infrastructure",
          content_title: "Google - Data Infrastructure",
          similarity: 0.95
        },
        {
          content_path: "/info/projects/personal-website#user-content-tech-stack",
          content_title: "Personal Website - Tech Stack",
          similarity: 0.91
        },
        {
          content_path: "/info/about-me/san-francisco#user-content-living-situation",
          content_title: "San Francisco - Living Situation",
          similarity: 0.87
        }
      ];
    }
    
    // Return the sources with similarity above 0.7
    const filteredSources = sources.filter(source => source.similarity >= 0.7);
    
    res.status(200).json({ sources: filteredSources });
  } catch (error) {
    console.error('Error testing sources:', error);
    res.status(500).json({ error: 'Failed to test sources' });
  }
}
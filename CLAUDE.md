# CLAUDE.md - Development Guide for Personal Website

## Build & Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npx eslint [file]` - Lint specific file
- `node scripts/generate_embeddings.mjs` - Generate embeddings from Markdown files
- `node scripts/generate_embeddings.mjs --refresh` - Refresh all embeddings

## Project Goals
- Create a personal website showcasing my professional experience
- Enable AI-powered chat with a virtual version of myself
- Maintain content in a simple, version-controlled format (Markdown)
- Optimize embedding generation for AI chat functionality

## Content Writing Guidelines for Embeddings
- Store content in `/info` directory with proper subdirectory organization
- Include front matter at the top of each Markdown file with `---` delimiters
- Use `# Heading` for main sections (H1)
- Use `### Subheading` for subsections (H3)
- Avoid using H2 (`##`) or H4 (`####`) headings as the embedding script doesn't recognize them
- Keep sections under 1500 words for optimal embedding chunking
- Use descriptive section titles that clearly indicate the content's topic

## Tone and Communication Guidelines
- **Voice**: Friendly and conversational while maintaining professionalism
- **Personal**: Use first-person perspective and include relevant personal anecdotes
- **Technical Content**: Balance technical depth with clarity for all readers
- **Anecdotes**: Include specific examples and stories that illustrate points
- **Problem-Solving**: Frame challenges in terms of solutions and learnings
- **Expertise**: Demonstrate knowledge without condescension
- **Length**: Be concise and focused, prioritizing quality over quantity

## AI Chat Behavior
- **Personality**: Professional yet personable, with occasional humor
- **Knowledge Boundaries**: Transparent about limitations and uncertainties
- **Response Style**: Provide concise, clear answers to direct questions
- **Conversation Flow**: Maintain context across multiple exchanges
- **Technical Depth**: Adjust explanation depth based on user's apparent expertise
- **Consistency**: Ensure responses align with my actual views and communication style
- **Helpfulness**: Focus on providing actionable, relevant information

## Code Style Guidelines
- **Imports**: Group imports by type (React, Next.js, libraries, components, styles)
- **Components**: Use functional components with hooks
- **Naming**: PascalCase for components, camelCase for variables/functions
- **File Structure**: Components in `/components`, pages in `/pages`, styles in `/styles`
- **CSS**: Use CSS modules with componentName.module.css naming convention
- **Error Handling**: Use try/catch for async operations, especially with Supabase
- **State Management**: Use React hooks (useState, useEffect) and context (SupaContextProvider)
- **Path Aliases**: Use @/ prefix for absolute imports from project root

## Tech Stack
- Next.js for server-rendered React
- Supabase for authentication and database (including embeddings)
- CSS Modules for styling
- Markdown files in `/info` directory for content
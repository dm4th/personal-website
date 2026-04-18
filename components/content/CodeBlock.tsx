'use client';

import React from 'react';
import { Highlight, themes } from 'prism-react-renderer';

const SUPPORTED = ['javascript', 'css', 'json', 'markdown', 'python', 'sql', 'bash'] as const;
type Language = (typeof SUPPORTED)[number];

function detectLanguage(text: string): { language: Language; code: string } {
  const match = text.match(/^\[([a-z]+)\]/);
  if (match && SUPPORTED.includes(match[1] as Language)) {
    return { language: match[1] as Language, code: text.slice(match[0].length) };
  }
  return { language: 'javascript', code: text };
}

export default function CodeBlock({ text }: { text: string }) {
  const { language, code } = detectLanguage(text);
  return (
    <Highlight theme={themes.nightOwl} code={code.trim()} language={language}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre className={className} style={{ ...style, padding: '1rem', borderRadius: '8px', overflow: 'auto', fontSize: '0.875rem' }}>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
}

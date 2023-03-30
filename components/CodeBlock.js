import React from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css'; // Import the theme you want to use

export default function CodeBlock({ language, value }) {
  const html = Prism.highlight(value, Prism.languages[language], language);

  return (
    <pre className={`language-${language}`}>
      <code dangerouslySetInnerHTML={{ __html: html }} />
    </pre>
  );
}

import React from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css'; 
import utilStyles from '../styles/utils.module.css';

// Import the language grammars
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';

const languages = [
  'javascript',
  'css',
  'json',
  'markdown',
  'python',
  'sql',
  'bash'
]


const retriveveLanguage = (text) => {
  // search the first line of the code block for the language tag in the form [language]
    const languageRegex = /\[([a-z]+)\]/;
    const languageMatch = text.match(languageRegex);
    // if no language tag is found, default to javascript
    let language, grammar;
    if (languageMatch) {
        language = languageMatch[1];
        if (languages.includes(language)) {
            grammar = Prism.languages[language];
        } else {
            language = 'javascript';
            grammar = Prism.languages.javascript;
        }
        } else {
        language = 'javascript';
        grammar = Prism.languages.javascript;
    }
    const value = text.replace(languageRegex, '');
    return { language, grammar, value };
}

export default function CodeBlock({ text }) {

    const { language, grammar, value } = retriveveLanguage(text);
    const html = Prism.highlight(value, grammar, language);

    return (
    <div className={`language-${language} ${utilStyles.codeBlock} ${utilStyles.preStyle}`}
        dangerouslySetInnerHTML={{ __html: html }}
    />
);  
}

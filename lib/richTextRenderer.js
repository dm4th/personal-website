import React from 'react';
import utilStyles from '../styles/utils.module.css';
import { BLOCKS, MARKS } from '@contentful/rich-text-types';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { solarizedlight } from 'react-syntax-highlighter/dist/cjs/styles/prism';

const Bold = ({ children }) => <span className="bold">{children}</span>;

const Code = ({ children }) => {
    return <pre><code>{children}</code></pre>;
  };

const Text = ({ children, utilStyles }) => {
    const questionStartRegex = /\[start-question\]/;
    const questionEndRegex = /\[end-question\]/;
    const answerStartRegex = /\[start-answer\]/;
    const answerEndRegex = /\[end-answer\]/;
  
    let text = '';
    if (Array.isArray(children)) {
      text = children.join('');
    } else {
      text = children;
    }
  
    const questionStartIndex = text.search(questionStartRegex);
    const questionEndIndex = text.search(questionEndRegex);
    const answerStartIndex = text.search(answerStartRegex);
    const answerEndIndex = text.search(answerEndRegex);
  
    if (questionStartIndex !== -1 && questionEndIndex !== -1) {
      return (
        <div className={utilStyles.question}>
          <Text
            children={text
              .slice(questionStartIndex + 16, questionEndIndex)
              .replace(questionEndRegex, '')}
            utilStyles={utilStyles}
          />
        </div>
      );
    }
  
    if (answerStartIndex !== -1 && answerEndIndex !== -1) {
      return (
        <div className={utilStyles.answer}>
          <Text
            children={text
              .slice(answerStartIndex + 13, answerEndIndex)
              .replace(answerEndRegex, '')}
            utilStyles={utilStyles}
          />
        </div>
      );
    }
  
    if (questionStartIndex === -1 && questionEndIndex === -1 && answerStartIndex === -1 && answerEndIndex === -1) {
      return <div>{children}</div>;
    }
  
    return null;
  };
  
  

const options = {
  renderMark: {
    [MARKS.BOLD]: (text) => <Bold>{text}</Bold>,
  },
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node, children) => <p>{children}</p>,
    [BLOCKS.HEADING_1]: (node, children) => <h1>{children}</h1>,
    [BLOCKS.HEADING_2]: (node, children) => <h2>{children}</h2>,
    [BLOCKS.HEADING_3]: (node, children) => <h3>{children}</h3>,
    [BLOCKS.HEADING_4]: (node, children) => <h4>{children}</h4>,
    [BLOCKS.HEADING_5]: (node, children) => <h5>{children}</h5>,
    [BLOCKS.HEADING_6]: (node, children) => <h6>{children}</h6>,
    [BLOCKS.EMBEDDED_ASSET]: ({ data: { target: { fields }}}) => (
      <img
        src={fields.file.url}
        alt={fields.description}
        title={fields.title}
        width={fields.file.details.image.width}
        height={fields.file.details.image.height}
      />
    ),
    [BLOCKS.CODE]: (node, children) => <Code>{children}</Code>,
  },
};

export default options;

// components/ContentWrapper.js
import React from 'react';

const ContentWrapper = ({ children, utilStyles }) => {
  const flattenChildren = (children) => {
    return children.reduce((acc, child) => {
      if (React.isValidElement(child) && Array.isArray(child.props.children)) {
        return acc.concat(flattenChildren(child.props.children));
      }
      return acc.concat(child);
    }, []);
  };

  const buildContentChunks = (children) => {
    const contentChunks = [];
    let currentChunk = { type: 'none', children: [] };

    children.forEach((child) => {
      if (typeof child === 'string') {
        if (child.includes('[start-question]')) {
          if (currentChunk.children.length > 0) {
            contentChunks.push(currentChunk);
          }
          currentChunk = { type: 'question', children: [] };
          child = child.replace('[start-question]', '');
        }
        if (child.includes('[end-question]')) {
          child = child.replace('[end-question]', '');
          currentChunk.children.push(child);
          contentChunks.push(currentChunk);
          currentChunk = { type: 'none', children: [] };
        }
        if (child.includes('[start-answer]')) {
          if (currentChunk.children.length > 0) {
            contentChunks.push(currentChunk);
          }
          currentChunk = { type: 'answer', children: [] };
          child = child.replace('[start-answer]', '');
        }
        if (child.includes('[end-answer]')) {
          child = child.replace('[end-answer]', '');
          currentChunk.children.push(child);
          contentChunks.push(currentChunk);
          currentChunk = { type: 'none', children: [] };
        }
      }

      if (child) {
        currentChunk.children.push(child);
      }
    });

    if (currentChunk.children.length > 0) {
      contentChunks.push(currentChunk);
    }

    return contentChunks;
  };

  const flattenedChildren = flattenChildren(children);
  const contentChunks = buildContentChunks(flattenedChildren);

  return (
    <div>
      {contentChunks.map((chunk, index) => {
        if (chunk.type === 'question') {
          return (
            <div key={index} className={utilStyles.question}>
              {chunk.children}
            </div>
          );
        } else if (chunk.type === 'answer') {
          return (
            <div key={index} className={utilStyles.answer}>
              {chunk.children}
            </div>
          );
        } else {
          return <React.Fragment key={index}>{chunk.children}</React.Fragment>;
        }
      })}
    </div>
  );
};

export default ContentWrapper;

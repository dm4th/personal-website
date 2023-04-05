// components/ConversationWrapper.js
import React from 'react';
import utilStyles from '../styles/utils.module.css';
import CodeBlock from './CodeBlock';
import BoldText from './BoldText';
import { BLOCKS, MARKS } from '@contentful/rich-text-types';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

const ConversationWrapper = ({ children }) => {

     const conversationStartTags = [
        '[start-question]',
        '[start-answer]',
        '[start-gpt4]',
    ]

    const conversationEndTags = [
        '[end-question]',
        '[end-answer]',
        '[end-gpt4]',
    ]

    // Loop over children looking for start and end blocks, building the tree as you go
    // Assumes that start and end tags will only appear as separate blocks at the top lovel of the DOM
    const createConversationTree = (children) => {
        // Create the root tree
        const rootTree = {
            current_branch: {
                tag: 'none',
                branch: []
            },
            branches: []
        }

        // Loop over children looking for start and end blocks, building the tree as you go
        for (var c = 0; c < children.content.length; c++) {
            const tag = searchForTags(children.content[c]);
            // Check Tag Types
            if (tag.type === 'start') {
                // Start Tag Found
                // If the current branch is unfinshed add it to the final tree and start a new one
                if (rootTree.current_branch.branch.length > 0) rootTree.branches.push(rootTree.current_branch);
                // Start a new branch
                rootTree.current_branch = {
                    tag: tag.tag,
                    branch: []
                }
            } else if (tag.type === 'end') {
                // End Tag Found
                // Add the current branch to the final tree, and start a new one with none type
                rootTree.branches.push(rootTree.current_branch);
                rootTree.current_branch = {
                    tag: 'none',
                    branch: []
                }
            } else {
                // Text Block Found
                // Add the text block to the current branch
                rootTree.current_branch.branch.push(children.content[c]);
            }
        }

        // If the current branch is unfinished add it to the final tree
        if (rootTree.current_branch.branch.length > 0) rootTree.branches.push(rootTree.current_branch);

        // Create an array of document objects for each branch and return the output
        const output = rootTree.branches.map((branch) => {
            return {
                tag: branch.tag,
                document: {
                    nodeType: 'document',
                    data: {},
                    content: branch.branch
                }
            }
        })

        return output;

    }

    // Define a function to search for tags in the children
    const searchForTags = (child) => {
        // Base Case - Higher level Tag so keep digging
        if (child.content) return searchForTags(child.content[0]);
        else {
            // Found a start tag
            if (conversationStartTags.includes(child.value)) {
                return {
                    type: 'start',
                    tag: child.value.split('-')[1].split(']')[0]
                }
            }
            // Found an end tag
            else if (conversationEndTags.includes(child.value)) {
                return {
                    type: 'end',
                    tag: child.value.split('-')[1].split(']')[0]
                }
            }
            // Found a regular text block
            else {
                return {
                    type: 'text',
                    tag: 'none'
                }
            }
        }
    }

    // Add rich text options
    const options = {
        renderMark: {
          [MARKS.BOLD]: (text) => <BoldText>{text}</BoldText>,
          [MARKS.CODE]: (text) => {
            return <CodeBlock text={text}/>
          },
        },
    };

    return (
        <div className='conversation-wrapper'>
            {
                createConversationTree(children).map((branch) => {
                    if (branch.tag === 'question') {
                        return (
                            <div className={utilStyles.question}>
                                {documentToReactComponents(branch.document, options)}
                            </div>
                        )
                    } else if (branch.tag === 'answer') {
                        return (
                            <div className={utilStyles.answer}>
                                {documentToReactComponents(branch.document, options)}
                            </div>
                        )
                    } else if (branch.tag === 'gpt4') {
                        return (
                            <div className={utilStyles.gpt4}>
                                {documentToReactComponents(branch.document, options)}
                            </div>
                        )
                    } else {
                        return (
                            <div>
                                {documentToReactComponents(branch.document, options)}
                            </div>
                        )
                    }
                })
            }
        </div>
    );
};

export default ConversationWrapper;

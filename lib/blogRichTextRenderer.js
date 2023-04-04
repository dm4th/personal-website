import React from 'react';
import { parseISO, format } from 'date-fns';
import { BLOCKS, MARKS } from '@contentful/rich-text-types';
import ConversationWrapper from '@/components/ConversationWrapper';

const dateString = (startDate, endDate) => {
  if (!endDate || startDate === endDate) {
    return format(parseISO(startDate), 'LLLL d, yyyy');
  }
  return `${format(parseISO(startDate), 'LLLL d, yyyy')} - ${format(parseISO(endDate),'LLLL d, yyyy')}`;
};

const PromptingConversationLink = ({ title, slug, startDate, endDate, highlights }) => (
  <div className="conversation-reference">
    <a href={`/prompting-conversations/${slug}`} className="conversation-link">
      {title}: {dateString(startDate, endDate)}
    </a>
    <ConversationWrapper children={highlights} />
  </div>
);

const richTextRendererOptions = {
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
    [BLOCKS.UL_LIST]: (node, children) => <ul>{children}</ul>,
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
    [BLOCKS.EMBEDDED_ENTRY]: (node) => {
      const { id } = node.data.target.sys.contentType.sys;
      if (id === 'promptingConversation') {
        const { id } = node.data.target.sys;
        const { title, startDate, endDate, highlights } = node.data.target.fields;
        return <PromptingConversationLink title={title} slug={id} startDate={startDate} endDate={endDate} highlights={highlights} />
      }
    },
  },
};

export default richTextRendererOptions;

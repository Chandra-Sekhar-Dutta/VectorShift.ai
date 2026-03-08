// chatNode.js

import { useMemo } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './baseNode';
import { useStore } from '../store';

/**
 * Chat Node - Chatbot-like interactive node for multi-turn conversations
 * Takes context/input from LLM or Text nodes
 * Displays brief 2-line explanation of context
 * Allows interactive follow-up queries
 */
export const ChatNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);

  /**
   * Calculate dynamic height based on response content
   * Base height accounts for all 5 fields (Context, Question, Temperature, Response, Follow-up Query)
   * Grows for each line of response beyond 2 lines
   */
  const nodeHeight = useMemo(() => {
    const response = data?.response || '';
    const lines = response.split('\n').length;
    // Base height for: title (40px) + 5 fields @ ~50px each (250px) + padding (20px) = 310px minimum
    const baseHeight = 310;
    // Reserve 36px for 2 lines (18px each), expand for additional lines
    const responseDisplayHeight = Math.max(36, lines * 18);
    return baseHeight + Math.max(0, responseDisplayHeight - 36);
  }, [data?.response]);

  /**
   * Handle field changes and persist to store
   */
  const handleFieldChange = (fieldKey, value) => {
    updateNodeField(id, fieldKey, value);
  };

  return (
    <BaseNode
      id={id}
      data={data}
      title="Chatbot"
      description="Interactive chat with context"
      fields={[
        {
          type: 'textarea',
          label: 'Context',
          key: 'context',
          defaultValue: '(Receives context from LLM/Text node)',
          readOnly: true,
        },
        {
          type: 'text',
          label: 'Question',
          key: 'question',
          defaultValue: 'Question from text node',
          placeholder: 'Question to explain with context',
        },
        {
          type: 'number',
          label: 'Temperature',
          key: 'temperature',
          defaultValue: 0.7,
        },
        {
          type: 'textarea',
          label: 'Response',
          key: 'response',
          defaultValue: '(Response from Gemini Chat Model)',
          readOnly: true,
        },
        {
          type: 'textarea',
          label: 'Follow-up Query',
          key: 'followUpQuery',
          defaultValue: 'Ask a follow-up question here',
          placeholder: 'Type your follow-up message...',
        },
      ]}
      handles={[
        { type: 'target', position: Position.Left, id: `${id}-input`, label: 'Context Input' },
        { type: 'source', position: Position.Right, id: `${id}-response`, label: 'Response' },
      ]}
      width={260}
      height={nodeHeight}
      category="processing"
      accentColor="#10b981"
      onFieldChange={handleFieldChange}
    />
  );
};

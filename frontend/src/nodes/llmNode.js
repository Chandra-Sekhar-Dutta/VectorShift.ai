// llmNode.js

import { Position } from 'reactflow';
import { BaseNode } from './baseNode';
import { useStore } from '../store';

export const LLMNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);

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
      title="LLM"
      description="Google Generative AI (Gemini)"
      fields={[
        {
          type: 'text',
          label: 'Model',
          key: 'model',
          defaultValue: 'gemini-3.1-flash-lite-preview',
        },
        {
          type: 'number',
          label: 'Temperature',
          key: 'temperature',
          defaultValue: 0.7,
        },
        {
          type: 'number',
          label: 'Max Tokens',
          key: 'maxTokens',
          defaultValue: 1024,
        },
      ]}
      handles={[
        { type: 'target', position: Position.Left, id: `${id}-system`, style: { top: `${100 / 3}%` }, label: 'System' },
        { type: 'target', position: Position.Left, id: `${id}-prompt`, style: { top: `${200 / 3}%` }, label: 'Prompt' },
        { type: 'source', position: Position.Right, id: `${id}-response` },
      ]}
      width={220}
      height={140}
      category="processing"
      accentColor="#8b5cf6"
      onFieldChange={handleFieldChange}
    />
  );
}

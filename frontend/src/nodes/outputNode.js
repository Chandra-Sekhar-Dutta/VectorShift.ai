// outputNode.js

import { Position } from 'reactflow';
import { useState, useEffect } from 'react';
import { BaseNode } from './baseNode';
import { useStore } from '../store';

export const OutputNode = ({ id, data }) => {
  const [result, setResult] = useState(data?.result || '(No result yet)');
  const updateNodeField = useStore((state) => state.updateNodeField);

  /**
   * Watch for changes in data.result and update the display
   */
  useEffect(() => {
    if (data?.result) {
      setResult(data.result);
    }
  }, [data?.result]);

  /**
   * Handle field changes and persist to store
   */
  const handleFieldChange = (fieldKey, value) => {
    if (fieldKey === 'result') {
      // Result field is read-only, don't allow manual changes
      return;
    }
    updateNodeField(id, fieldKey, value);
  };

  return (
    <BaseNode
      id={id}
      data={{
        ...data,
        result: result, // Ensure result is always current
      }}
      title="Output"
      description="Pipeline output result"
      fields={[
        {
          type: 'textarea',
          label: 'Result',
          key: 'result',
          defaultValue: result,
        },
        {
          type: 'select',
          label: 'Type',
          key: 'outputType',
          options: ['Text', 'Image', 'LLM Response'],
          defaultValue: 'Text',
        },
      ]}
      handles={[
        { type: 'target', position: Position.Left, id: `${id}-value` },
        { type: 'source', position: Position.Right, id: `${id}-output` },
      ]}
      width={280}
      height={160}
      category="output"
      accentColor="#06b6d4"
      onFieldChange={handleFieldChange}
    />
  );
}

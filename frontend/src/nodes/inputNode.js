// inputNode.js

import { Position } from 'reactflow';
import { BaseNode } from './baseNode';
import { useStore } from '../store';

export const InputNode = ({ id, data }) => {
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
      title="Input"
      fields={[
        {
          type: 'text',
          label: 'Name',
          key: 'inputName',
          defaultValue: id.replace('customInput-', 'input_'),
        },
        {
          type: 'select',
          label: 'Type',
          key: 'inputType',
          options: ['Text', 'File'],
          defaultValue: 'Text',
        },
      ]}
      handles={[
        { type: 'source', position: Position.Right, id: `${id}-value` },
      ]}
      width={200}
      height={90}
      category="input"
      accentColor="#3b82f6"
      onFieldChange={handleFieldChange}
    />
  );
}

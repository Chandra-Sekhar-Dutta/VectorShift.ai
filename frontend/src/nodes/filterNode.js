// filterNode.js

import { Position } from 'reactflow';
import { BaseNode } from './baseNode';

/**
 * Filter Node - Demonstrates select options and conditional logic
 * Showcases: select field type, single input/output with description
 */
export const FilterNode = ({ id, data }) => {
  return (
    <BaseNode
      id={id}
      data={data}
      title="Filter"
      description="Filter data by criteria"
      fields={[
        {
          type: 'select',
          label: 'Condition',
          key: 'condition',
          options: ['Equals', 'Greater Than', 'Less Than', 'Contains'],
          defaultValue: 'Equals',
        },
        {
          type: 'text',
          label: 'Value',
          key: 'filterValue',
          defaultValue: '',
        },
      ]}
      handles={[
        { type: 'target', position: Position.Left, id: `${id}-input` },
        { type: 'source', position: Position.Right, id: `${id}-output` },
      ]}
      width={220}
      height={110}
      category="processing"
      accentColor="#f59e0b"
    />
  );
};

// mergeNode.js

import { Position } from 'reactflow';
import { BaseNode } from './baseNode';

/**
 * Merge Node - Demonstrates multiple input handles
 * Showcases: multiple target handles with custom positioning, no fields
 */
export const MergeNode = ({ id, data }) => {
  return (
    <BaseNode
      id={id}
      data={data}
      title="Merge"
      description="Combine multiple inputs"
      fields={[
        {
          type: 'select',
          label: 'Mode',
          key: 'mergeMode',
          options: ['Concatenate', 'Average', 'Combine'],
          defaultValue: 'Concatenate',
        },
      ]}
      handles={[
        { type: 'target', position: Position.Left, id: `${id}-input1`, style: { top: '30%' } },
        { type: 'target', position: Position.Left, id: `${id}-input2`, style: { top: '50%' } },
        { type: 'target', position: Position.Left, id: `${id}-input3`, style: { top: '70%' } },
        { type: 'source', position: Position.Right, id: `${id}-output` },
      ]}
      width={220}
      height={120}
      category="processing"
      accentColor="#ec4899"
    />
  );
};

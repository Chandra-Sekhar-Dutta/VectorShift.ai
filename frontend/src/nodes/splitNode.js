// splitNode.js

import { Position } from 'reactflow';
import { BaseNode } from './baseNode';

/**
 * Split Node - Demonstrates multiple output handles
 * Showcases: multiple source handles with custom positioning, simple configuration
 */
export const SplitNode = ({ id, data }) => {
  return (
    <BaseNode
      id={id}
      data={data}
      title="Split"
      description="Distribute to multiple outputs"
      fields={[
        {
          type: 'text',
          label: 'Delimiter',
          key: 'delimiter',
          defaultValue: ',',
        },
      ]}
      handles={[
        { type: 'target', position: Position.Left, id: `${id}-input` },
        { type: 'source', position: Position.Right, id: `${id}-output1`, style: { top: '25%' } },
        { type: 'source', position: Position.Right, id: `${id}-output2`, style: { top: '50%' } },
        { type: 'source', position: Position.Right, id: `${id}-output3`, style: { top: '75%' } },
      ]}
      width={220}
      height={120}
      category="processing"
      accentColor="#06b6d4"
    />
  );
};

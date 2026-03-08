// saveFileNode.js

import { Position } from 'reactflow';
import { BaseNode } from './baseNode';
import { useStore } from '../store';

/**
 * Save File Node - Saves pipeline execution data to JSON file
 * Demonstrates: 
 * - Conditional handle rendering based on pipeline state
 * - File output and destination configuration
 * - Single input (receives data from previous nodes when present)
 * - Terminal node that triggers save when pipeline is executed
 * - Tracks: node_type, connected_to, exists/removed, data, data_type, response with timestamp
 */
export const SaveFileNode = ({ id, data }) => {
  const nodes = useStore((state) => state.nodes);

  // Check if there are any Output or processing nodes in the pipeline
  // If yes, show the handle so SaveFile can receive data
  const hasOutputNodes = nodes.some(
    (node) =>
      node.type === 'customOutput' ||
      node.type === 'text' ||
      node.type === 'llm' ||
      node.type === 'merge' ||
      node.type === 'split' ||
      node.type === 'chooseFiles'
  );

  // Conditionally render handles - show input handle only when there are nodes to connect from
  const handles = hasOutputNodes
    ? [{ type: 'target', position: Position.Left, id: `${id}-input` }]
    : [];

  return (
    <BaseNode
      id={id}
      data={data}
      title="Save File"
      description={
        hasOutputNodes
          ? 'Connect Output node to save execution data to JSON'
          : 'Add Output/Processing nodes to enable Save'
      }
      fields={[
        {
          type: 'text',
          label: 'Filename',
          key: 'filename',
          defaultValue: 'pipeline_execution',
        },
        {
          type: 'select',
          label: 'Format',
          key: 'format',
          options: ['JSON'],
          defaultValue: 'JSON',
        },
        {
          type: 'text',
          label: 'Destination',
          key: 'filePath',
          defaultValue: 'Downloads',
          placeholder: 'Auto-set to Downloads folder',
        },
      ]}
      handles={handles}
      width={240}
      height={160}
      category="utility"
      accentColor="#10b981"
    />
  );
};

// imageProcessingNode.js

import { Position } from 'reactflow';
import { BaseNode } from './baseNode';

/**
 * Image Processing Node - Demonstrates complex configuration
 * Showcases: multiple field types, multiple inputs/outputs, textarea for descriptions
 */
export const ImageProcessingNode = ({ id, data }) => {
  return (
    <BaseNode
      id={id}
      data={data}
      title="Image Processor"
      description="Apply image transformations"
      fields={[
        {
          type: 'select',
          label: 'Filter',
          key: 'filter',
          options: ['Blur', 'Sharpen', 'Grayscale', 'Sepia'],
          defaultValue: 'Blur',
        },
        {
          type: 'number',
          label: 'Intensity',
          key: 'intensity',
          defaultValue: '50',
        },
        {
          type: 'select',
          label: 'Output Format',
          key: 'format',
          options: ['JPG', 'PNG', 'WebP'],
          defaultValue: 'PNG',
        },
      ]}
      handles={[
        { type: 'target', position: Position.Left, id: `${id}-image`, style: { top: '30%' } },
        { type: 'target', position: Position.Left, id: `${id}-config`, style: { top: '70%' } },
        { type: 'source', position: Position.Right, id: `${id}-output` },
        { type: 'source', position: Position.Right, id: `${id}-metadata`, style: { top: '70%' } },
      ]}
      width={240}
      height={150}
      category="utility"
      accentColor="#8b5cf6"
    />
  );
};

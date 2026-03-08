// textNode.js

import { useState, useEffect, useRef } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './baseNode';
import { useStore } from '../store';

export const TextNode = ({ id, data }) => {
  const [dimensions, setDimensions] = useState({ width: 200, height: 110 });
  const [textValue, setTextValue] = useState(data?.text || '{{input}}');
  const hiddenTextareaRef = useRef(null);
  const updateNodeField = useStore((state) => state.updateNodeField);

  /**
   * Measure text height using a hidden textarea
   * This calculates how much vertical space the text will take
   */
  const measureTextHeight = (text, width) => {
    if (!hiddenTextareaRef.current) return 0;

    const textarea = hiddenTextareaRef.current;
    textarea.value = text;
    textarea.style.width = `${width}px`; // Set width to match calculated width
    const scrollHeight = textarea.scrollHeight;
    return scrollHeight;
  };

  /**
   * Calculate width based on text length
   * Minimum width: 160px, Maximum width: 400px
   */
  const calculateWidth = (text) => {
    const minWidth = 160;
    const maxWidth = 400;
    // Estimate: ~10 characters per 60px on average
    const estimatedWidth = Math.ceil((text.length / 10) * 60);
    return Math.max(minWidth, Math.min(estimatedWidth, maxWidth));
  };

  /**
   * Parse text for variable patterns {{ variableName }}
   * Returns array of unique variable names detected
   */
  const parseVariables = (text) => {
    const pattern = /\{\{\s*(\w+)\s*\}\}/g;
    const variables = new Set();
    let match;

    while ((match = pattern.exec(text)) !== null) {
      variables.add(match[1]);
    }

    return Array.from(variables);
  };

  /**
   * Generate handles dynamically based on detected variables
   * Creates input handles for each variable and output handle
   * Positions each handle vertically to prevent overlapping
   */
  const generateHandles = () => {
    const variables = parseVariables(textValue);
    const baseHandles = [
      { 
        type: 'source', 
        position: Position.Right, 
        id: `${id}-output`,
        style: { bottom: '12px' } // Position output handle at bottom right
      },
    ];

    // Create target (input) handles for each detected variable
    // Distribute them evenly across the node height
    const variableHandles = variables.map((varName, index) => {
      const totalVars = variables.length;
      // Spread handles evenly from top to bottom
      const topPosition = totalVars === 1 
        ? '50%' 
        : `${(index / (totalVars - 1)) * 100}%`;
      
      return {
        type: 'target',
        position: Position.Left,
        id: `${id}-${varName}`,
        style: { 
          top: topPosition,
          marginTop: '-5px' // Use margin instead of transform for better React Flow compatibility
        },
      };
    });

    return [...variableHandles, ...baseHandles];
  };

  /**
   * Handle text field changes and update dimensions
   */
  const handleTextChange = (fieldKey, value) => {
    setTextValue(value);
    // Save to store so it persists
    updateNodeField(id, fieldKey, value);
  };

  /**
   * Update node dimensions based on content
   * Recalculates whenever textValue changes
   */
  useEffect(() => {
    const calculatedWidth = calculateWidth(textValue);
    const measuredHeight = measureTextHeight(textValue, calculatedWidth);

    // Add padding for the node container (title + padding + spacing)
    const totalHeight = Math.max(110, measuredHeight + 50);

    setDimensions({
      width: calculatedWidth,
      height: totalHeight,
    });
  }, [textValue]);

  return (
    <>
      {/* Hidden textarea for measuring text height */}
      <textarea
        ref={hiddenTextareaRef}
        style={{
          position: 'fixed',
          left: '-9999px',
          top: '-9999px',
          fontSize: '9px',
          fontFamily: 'monospace',
          padding: '3px 5px',
          border: '1px solid #374151',
          borderRadius: '3px',
          backgroundColor: '#111827',
          color: '#f3f4f6',
          boxSizing: 'border-box',
          resize: 'none',
          overflow: 'hidden',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
        }}
        readOnly
      />

      <BaseNode
        id={id}
        data={data}
        title="Text"
        fields={[
          {
            type: 'textarea',
            label: 'Text',
            key: 'text',
            defaultValue: '{{input}}',
          },
        ]}
        handles={generateHandles()}
        width={dimensions.width}
        height={dimensions.height}
        category="input"
        accentColor="#f59e0b"
        onFieldChange={handleTextChange}
      />
    </>
  );
}

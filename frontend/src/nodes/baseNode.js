// baseNode.js

import { useState, useEffect } from 'react';
import { Handle } from 'reactflow';
import { MdClose } from 'react-icons/md';
import { useStore } from '../store';

/**
 * BaseNode - A reusable abstraction for all node types
 * 
 * Props:
 * - id: Node ID from React Flow
 * - data: Node data object
 * - title: String to display as node title
 * - description: Optional string for node description
 * - handles: Array of handle configurations
 *   - type: 'source' or 'target'
 *   - position: Position.Left, Position.Right, etc.
 *   - id: unique handle ID
 *   - style: optional style object (e.g., for positioning)
 * - fields: Array of field configurations
 *   - type: 'text', 'select', 'textarea', 'number'
 *   - label: display label
 *   - key: data key for state
 *   - defaultValue: fallback value
 *   - options: array of options for select fields
 * - onFieldChange: optional callback when a field changes
 * - width: node width (default: 220)
 * - height: node height (default: 80)
 * - category: 'input', 'output', 'processing', 'utility' for visual hierarchy
 * - accentColor: accent color for the node (e.g., '#3b82f6')
 */
export const BaseNode = ({
  id,
  data,
  title,
  description,
  handles = [],
  fields = [],
  onFieldChange,
  width = 220,
  height = 80,
  category = 'processing',
  accentColor = '#3b82f6',
}) => {
  // Initialize state for all fields
  const [fieldValues, setFieldValues] = useState(
    fields.reduce((acc, field) => {
      acc[field.key] = data?.[field.key] ?? field.defaultValue ?? '';
      return acc;
    }, {})
  );

  const deleteNode = useStore((state) => state.deleteNode);

  /**
   * Sync fieldValues when data prop changes
   * This ensures store updates are reflected in the form
   * Use JSON.stringify to detect actual data changes without recreating dependencies
   */
  useEffect(() => {
    const updatedValues = fields.reduce((acc, field) => {
      acc[field.key] = data?.[field.key] ?? field.defaultValue ?? '';
      return acc;
    }, {});
    setFieldValues(updatedValues);
    
    // Auto-expand textareas after data update
    setTimeout(() => {
      const textareas = document.querySelectorAll(`textarea[data-node-id="${id}"]`);
      textareas.forEach(textarea => {
        textarea.style.height = 'auto';
        const scrollHeight = textarea.scrollHeight;
        textarea.style.height = `${Math.max(scrollHeight, 30)}px`;
      });
    }, 0);
  }, [JSON.stringify(data)]); // Detect data changes using serialization

  const handleDeleteClick = () => {
    deleteNode(id);
  };

  const handleFieldChange = (fieldKey, value) => {
    const newValues = { ...fieldValues, [fieldKey]: value };
    setFieldValues(newValues);
    
    // Call parent callback if provided
    if (onFieldChange) {
      onFieldChange(fieldKey, value);
    }
  };

  /**
   * Auto-expand textarea based on content height
   */
  const autoExpandTextarea = (e) => {
    e.target.style.height = 'auto';
    const scrollHeight = e.target.scrollHeight;
    e.target.style.height = `${Math.max(scrollHeight, 30)}px`;
  };

  // Determine styles based on category for visual hierarchy
  const getCategoryStyles = () => {
    const baseStyles = {
      borderRadius: '8px',
      padding: '8px',
      fontSize: '12px',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.25s ease-out',
      border: `1.5px solid`,
      backgroundColor: '#1a1f2e',
    };

    switch (category) {
      case 'input':
        return {
          ...baseStyles,
          borderColor: '#3b82f6',
          boxShadow: `0 2px 8px rgb(59, 130, 246, 0.2), inset 0 0 0 1px rgb(59, 130, 246, 0.1)`,
        };
      case 'output':
        return {
          ...baseStyles,
          borderColor: '#06b6d4',
          boxShadow: `0 2px 8px rgb(6, 182, 212, 0.2), inset 0 0 0 1px rgb(6, 182, 212, 0.1)`,
        };
      case 'utility':
        return {
          ...baseStyles,
          borderColor: '#10b981',
          boxShadow: `0 2px 8px rgb(16, 185, 129, 0.2), inset 0 0 0 1px rgb(16, 185, 129, 0.1)`,
        };
      default: // processing
        return {
          ...baseStyles,
          borderColor: accentColor,
          boxShadow: `0 2px 8px ${accentColor}30, inset 0 0 0 1px ${accentColor}15`,
        };
    }
  };

  const categoryStyles = getCategoryStyles();

  return (
    <div
      style={{
        width,
        height,
        ...categoryStyles,
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 6px 16px ${accentColor}40, inset 0 0 0 1px ${accentColor}25`;
        e.currentTarget.style.borderColor = accentColor;
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        const styles = getCategoryStyles();
        e.currentTarget.style.boxShadow = styles.boxShadow;
        e.currentTarget.style.borderColor = styles.borderColor;
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Delete Button */}
      <button
        onClick={handleDeleteClick}
        style={{
          position: 'absolute',
          top: '-8px',
          right: '-8px',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: '#ef4444',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
          transition: 'all 0.2s ease-out',
          padding: '0',
          zIndex: 10,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#dc2626';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.6)';
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#ef4444';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.4)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        title="Delete node"
      >
        <MdClose size={16} color="white" />
      </button>
      {/* Render input handles */}
      {handles
        .filter((h) => h.type === 'target')
        .map((handle) => (
          <Handle
            key={handle.id}
            type={handle.type}
            position={handle.position}
            id={handle.id}
            style={{
              ...handle.style,
              width: '12px',
              height: '12px',
              backgroundColor: accentColor,
              borderRadius: '50%',
              border: '2px solid #0f172a',
              cursor: 'crosshair',
              zIndex: 50,
              pointerEvents: 'auto',
            }}
            isConnectable={true}
          />
        ))}

      {/* Title */}
      <div style={{ fontWeight: '700', color: '#e5e7eb', fontSize: '11px', marginBottom: '1px', letterSpacing: '0.2px' }}>
        {title}
      </div>

      {/* Description */}
      {description && (
        <div style={{ fontSize: '9px', color: '#9ca3af', marginBottom: '4px' }}>
          {description}
        </div>
      )}

      {/* Fields */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden' }}>
        {fields.map((field) => (
          <div key={field.key} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <label style={{ fontWeight: '600', color: '#d1d5db', minWidth: '48px', fontSize: '9px', userSelect: 'none' }}>
              {field.label}:
            </label>

            {field.type === 'text' && (
              <input
                type="text"
                value={fieldValues[field.key] || ''}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                disabled={field.readOnly || false}
                {...(field.placeholder && { placeholder: field.placeholder })}
                style={{
                  flex: 1,
                  padding: '3px 5px',
                  border: `1px solid ${field.readOnly ? '#1f2937' : '#374151'}`,
                  borderRadius: '3px',
                  fontSize: '9px',
                  backgroundColor: field.readOnly ? '#0f172a' : '#111827',
                  color: field.readOnly ? '#6b7280' : '#f3f4f6',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s ease',
                  outline: 'none',
                  cursor: field.readOnly ? 'not-allowed' : 'text',
                }}
                onFocus={(e) => !field.readOnly && (e.target.style.borderColor = accentColor)}
                onBlur={(e) => (e.target.style.borderColor = field.readOnly ? '#1f2937' : '#374151')}
              />
            )}

            {field.type === 'number' && (
              <input
                type="number"
                value={fieldValues[field.key] || ''}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                style={{
                  flex: 1,
                  padding: '4px 6px',
                  border: '1px solid #374151',
                  borderRadius: '3px',
                  fontSize: '9px',
                  backgroundColor: '#111827',
                  color: '#f3f4f6',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s ease',
                  outline: 'none',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
                onFocus={(e) => (e.target.style.borderColor = accentColor)}
                onBlur={(e) => (e.target.style.borderColor = '#374151')}
              />
            )}

            {field.type === 'select' && (
              <select
                value={fieldValues[field.key] || ''}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                style={{
                  flex: 1,
                  padding: '3px 5px',
                  border: '1px solid #374151',
                  borderRadius: '3px',
                  fontSize: '9px',
                  backgroundColor: '#111827',
                  color: '#f3f4f6',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s ease',
                  outline: 'none',
                  cursor: 'pointer',
                }}
                onFocus={(e) => (e.target.style.borderColor = accentColor)}
                onBlur={(e) => (e.target.style.borderColor = '#374151')}
              >
                {field.options.map((option) => (
                  <option key={option} value={option} style={{ backgroundColor: '#1a1f2e', color: '#f3f4f6' }}>
                    {option}
                  </option>
                ))}
              </select>
            )}

            {field.type === 'textarea' && (
              <textarea
                data-node-id={id}
                value={fieldValues[field.key] || ''}
                onChange={(e) => {
                  handleFieldChange(field.key, e.target.value);
                  autoExpandTextarea(e);
                }}
                disabled={field.readOnly || false}
                style={{
                  flex: 1,
                  padding: '3px 5px',
                  border: `1px solid ${field.readOnly ? '#1f2937' : '#374151'}`,
                  borderRadius: '3px',
                  fontSize: '9px',
                  minHeight: '30px',
                  maxHeight: '200px',
                  fontFamily: 'monospace',
                  backgroundColor: field.readOnly ? '#0f172a' : '#111827',
                  color: field.readOnly ? '#6b7280' : '#f3f4f6',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s ease',
                  outline: 'none',
                  resize: 'none',
                  overflow: 'auto',
                  scrollbarWidth: 'thin',
                  msOverflowStyle: 'auto',
                  cursor: field.readOnly ? 'not-allowed' : 'text',
                }}
                onFocus={(e) => {
                  if (!field.readOnly) {
                    e.target.style.borderColor = accentColor;
                    autoExpandTextarea(e);
                  }
                }}
                onBlur={(e) => (e.target.style.borderColor = field.readOnly ? '#1f2937' : '#374151')}
              />
            )}

            {field.type === 'file' && (
              <input
                type="file"
                multiple={field.multiple || false}
                accept={field.accept || ''}
                onChange={(e) => {
                  if (field.onChange) {
                    field.onChange(e);
                  } else {
                    handleFieldChange(field.key, e.target.value);
                  }
                }}
                style={{
                  flex: 1,
                  padding: '3px 5px',
                  border: '1px solid #374151',
                  borderRadius: '3px',
                  fontSize: '9px',
                  backgroundColor: '#111827',
                  color: '#f3f4f6',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s ease',
                  outline: 'none',
                  cursor: 'pointer',
                }}
                onFocus={(e) => (e.target.style.borderColor = accentColor)}
                onBlur={(e) => (e.target.style.borderColor = '#374151')}
              />
            )}
          </div>
        ))}
      </div>

      {/* Render output handles */}
      {handles
        .filter((h) => h.type === 'source')
        .map((handle) => (
          <Handle
            key={handle.id}
            type={handle.type}
            position={handle.position}
            id={handle.id}
            style={{
              ...handle.style,
              width: '12px',
              height: '12px',
              backgroundColor: accentColor,
              borderRadius: '50%',
              border: '2px solid #0f172a',
              cursor: 'crosshair',
              zIndex: 50,
              pointerEvents: 'auto',
            }}
            isConnectable={true}
          />
        ))}
    </div>
  );
};

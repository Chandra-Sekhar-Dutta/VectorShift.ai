import { useState } from 'react';
import { MdClose, MdChevronRight, MdLibraryBooks, MdShowChart, MdInput, MdBuild, MdOutput, MdLink, MdSync, MdPlayArrow, MdLightbulb } from 'react-icons/md';

export const InstructionsModal = ({ isOpen, onClose }) => {
  const [expandedSection, setExpandedSection] = useState('overview');

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (!isOpen) return null;

  const sections = [
    {
      id: 'overview',
      title: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MdShowChart size={18} />
          Pipeline Overview
        </span>
      ),
      content: (
        <div style={{ color: '#d1d5db', fontSize: '13px', lineHeight: '1.6' }}>
          <p>A pipeline is a sequence of connected nodes that process data step-by-step. Each node accepts input, performs an action, and produces output that can be connected to other nodes.</p>
          <p><strong>Flow:</strong> Input Nodes → Processing Nodes → Output Nodes</p>
        </div>
      ),
    },
    {
      id: 'inputNodes',
      title: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MdInput size={18} />
          Input Nodes
        </span>
      ),
      content: (
        <div style={{ color: '#d1d5db', fontSize: '13px', lineHeight: '1.6' }}>
          <div>
            <strong style={{ color: '#3b82f6' }}>Input Node</strong>
            <p>Enter custom text or data to start your pipeline. This data flows downstream to connected nodes.</p>
          </div>
        </div>
      ),
    },
    {
      id: 'processingNodes',
      title: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MdBuild size={18} />
          Processing Nodes
        </span>
      ),
      content: (
        <div style={{ color: '#d1d5db', fontSize: '13px', lineHeight: '1.6' }}>
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#10b981' }}>Text Node</strong>
            <p>Display or transform text. Use placeholder syntax like <code style={{ backgroundColor: '#111827', padding: '2px 4px', borderRadius: '2px' }}>{'{{input}}'}</code> to reference upstream node outputs.</p>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#10b981' }}>LLM Node</strong>
            <p>Send prompts to an AI model for intelligent responses. Configure temperature (creativity level: 0-1).</p>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#10b981' }}>Chat Node</strong>
            <p>Have multi-turn conversations with context awareness. Perfect for interactive question-answering workflows.</p>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#10b981' }}>Merge Node</strong>
            <p>Combine multiple data streams into one unified output. Great for aggregating results from different processing branches.</p>
          </div>
          <div>
            <strong style={{ color: '#10b981' }}>Split Node</strong>
            <p>Divide data into multiple streams for parallel processing. Route different data to different processing paths.</p>
          </div>
        </div>
      ),
    },
    {
      id: 'outputNodes',
      title: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MdOutput size={18} />
          Output Node
        </span>
      ),
      content: (
        <div style={{ color: '#d1d5db', fontSize: '13px', lineHeight: '1.6' }}>
          <p>Display final pipeline results. This is typically the endpoint of your pipeline where you can view the processed data.</p>
        </div>
      ),
    },
    {
      id: 'saveFileNode',
      title: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MdLink size={18} />
          Save File Node
        </span>
      ),
      content: (
        <div style={{ color: '#d1d5db', fontSize: '13px', lineHeight: '1.6' }}>
          <p>Save processed data to a file. Configure the filename and specify the format to save your pipeline results for later download or use.</p>
        </div>
      ),
    },
    {
      id: 'chooseFilesNode',
      title: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MdInput size={18} />
          Choose Files Node
        </span>
      ),
      content: (
        <div style={{ color: '#d1d5db', fontSize: '13px', lineHeight: '1.6' }}>
          <p>Upload and select files to process. Users can choose files during pipeline execution. Connect directly to other nodes that accept file inputs.</p>
        </div>
      ),
    },
    {
      id: 'connecting',
      title: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MdLink size={18} />
          Connecting Nodes
        </span>
      ),
      content: (
        <div style={{ color: '#d1d5db', fontSize: '13px', lineHeight: '1.6' }}>
          <ol style={{ paddingLeft: '20px', margin: '0' }}>
            <li>Click and drag from a node's <strong>output handle</strong> (right side, green dot)</li>
            <li>Drag to a target node's <strong>input handle</strong> (left side, colored dot)</li>
            <li>Release to create a connection</li>
            <li>Data flows from source to target automatically</li>
          </ol>
          <p style={{ marginTop: '12px', color: '#fbbf24' }}>
            <MdLightbulb size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
            <strong>Tip:</strong> Click the connection line to delete it
          </p>
        </div>
      ),
    },
    {
      id: 'dataFlow',
      title: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MdSync size={18} />
          Data Flow & Syntax
        </span>
      ),
      content: (
        <div style={{ color: '#d1d5db', fontSize: '13px', lineHeight: '1.6' }}>
          <p><strong>Reference Syntax:</strong> Use double curly braces to reference outputs from connected nodes:</p>
          <div style={{ backgroundColor: '#111827', padding: '8px 12px', borderRadius: '4px', marginTop: '8px', fontFamily: 'monospace', fontSize: '12px', color: '#3b82f6' }}>
            {'{{'} input {'}}  - References the input node'}<br />
            {'{{'} llm {'}}   - References the LLM response'}<br />
            {'{{'} text {'}}  - References processed text'}<br />
          </div>
          <p style={{ marginTop: '12px' }}>Each node automatically receives data from connected inputs and passes results to connected outputs.</p>
        </div>
      ),
    },
    {
      id: 'execution',
      title: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MdPlayArrow size={18} />
          Executing Your Pipeline
        </span>
      ),
      content: (
        <div style={{ color: '#d1d5db', fontSize: '13px', lineHeight: '1.6' }}>
          <ol style={{ paddingLeft: '20px', margin: '0' }}>
            <li>Build your pipeline by connecting nodes</li>
            <li>Click the <strong>"Submit"</strong> button in the bottom-right</li>
            <li>The pipeline executes sequentially from input to output</li>
            <li>Results display in the output nodes</li>
            <li>For file outputs, download the processed files</li>
          </ol>
          <p style={{ marginTop: '12px', color: '#fbbf24' }}>
            <MdLightbulb size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
            <strong>Tip:</strong> Check node outputs for errors or status messages
          </p>
        </div>
      ),
    },
    {
      id: 'tips',
      title: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MdLightbulb size={18} />
          Useful Tips
        </span>
      ),
      content: (
        <div style={{ color: '#d1d5db', fontSize: '13px', lineHeight: '1.6' }}>
          <ul style={{ paddingLeft: '20px', margin: '0' }}>
            <li>Delete a node by clicking the <MdClose size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> button in its top-right corner</li>
            <li>Nodes automatically expand when they contain long text</li>
            <li>Use Temperature in LLM nodes to control response creativity (0=deterministic, 1=random)</li>
            <li>Chain multiple nodes for complex workflows</li>
            <li>Use Text nodes to format or prepare data for next steps</li>
            <li>Split nodes create parallel branches - Merge nodes combine them back together</li>
            <li>Chat nodes support multi-turn conversations with context from other nodes</li>
            <li>Choose Files node allows users to upload files during pipeline execution</li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          backgroundColor: '#1a1f2e',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
          width: '90%',
          maxWidth: '700px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #374151',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 24px',
            borderBottom: '1px solid #374151',
            backgroundColor: '#111827',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
          }}
        >
          <h2 style={{ margin: 0, color: '#f3f4f6', fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MdLibraryBooks size={24} />
            Pipeline Builder Guide
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              fontSize: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.target.style.color = '#ef4444')}
            onMouseLeave={(e) => (e.target.style.color = '#9ca3af')}
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sections.map((section) => (
              <div key={section.id}>
                <button
                  onClick={() => toggleSection(section.id)}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    padding: '12px 16px',
                    backgroundColor: '#111827',
                    borderRadius: '8px',
                    color: '#f3f4f6',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                    border: '1px solid #374151',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#1f2937';
                    e.currentTarget.style.borderColor = '#4b5563';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#111827';
                    e.currentTarget.style.borderColor = '#374151';
                  }}
                >
                  <span>{section.title}</span>
                  <MdChevronRight
                    size={20}
                    style={{
                      transform: expandedSection === section.id ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                </button>

                {expandedSection === section.id && (
                  <div
                    style={{
                      padding: '16px',
                      backgroundColor: '#0f172a',
                      borderRadius: '0 0 8px 8px',
                      marginTop: '-4px',
                      borderLeft: '1px solid #374151',
                      borderRight: '1px solid #374151',
                      borderBottom: '1px solid #374151',
                    }}
                  >
                    {section.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #374151',
            backgroundColor: '#111827',
            borderBottomLeftRadius: '12px',
            borderBottomRightRadius: '12px',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#3b82f6';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Got it!
          </button>
        </div>

        {/* Custom scrollbar styling for the modal */}
        <style>{`
          div[style*="overflowY: auto"] {
            scrollbar-width: thin;
            scrollbar-color: #4b5563 transparent;
          }
          div[style*="overflowY: auto"]::-webkit-scrollbar {
            width: 6px;
          }
          div[style*="overflowY: auto"]::-webkit-scrollbar-track {
            background: transparent;
          }
          div[style*="overflowY: auto"]::-webkit-scrollbar-thumb {
            background: #4b5563;
            border-radius: 3px;
          }
          div[style*="overflowY: auto"]::-webkit-scrollbar-thumb:hover {
            background: #6b7280;
          }
        `}</style>
      </div>
    </div>
  );
};

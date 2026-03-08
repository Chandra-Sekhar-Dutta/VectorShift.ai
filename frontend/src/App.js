import { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MdSchema, MdHelpOutline } from 'react-icons/md';
import { PipelineToolbar } from './toolbar';
import { PipelineUI } from './ui';
import { SubmitButton } from './submit';
import { InstructionsModal } from './InstructionsModal';

function App() {
  const [showInstructions, setShowInstructions] = useState(false);

  return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#0f172a', fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }}>
      {/* Header */}
      <div style={{ 
        background: '#111827', 
        color: '#f3f4f6', 
        padding: '1.2rem 2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        borderBottom: '1px solid #1f2937',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: '700', margin: '0', letterSpacing: '-0.3px', color: '#f3f4f6', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MdSchema size={28} />Pipeline Builder</h1>
        <button
          onClick={() => setShowInstructions(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1rem',
            backgroundColor: '#1f2937',
            color: '#f3f4f6',
            border: '1px solid #374151',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#374151';
            e.currentTarget.style.borderColor = '#4b5563';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#1f2937';
            e.currentTarget.style.borderColor = '#374151';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <MdHelpOutline size={18} />
          <span>Documentation</span>
        </button>
      </div>
      
      {/* Main Content - Horizontal Layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Sidebar - Toolbar */}
        <div style={{ 
          width: '240px', 
          borderRight: '1px solid #1f2937', 
          backgroundColor: '#111827',
          boxShadow: '1px 0 3px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <PipelineToolbar />
        </div>
        
        {/* Main Canvas Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#0f172a', overflow: 'hidden', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)' }}>
          <PipelineUI />
        </div>
      </div>
      
      <SubmitButton />
      <InstructionsModal isOpen={showInstructions} onClose={() => setShowInstructions(false)} />
      <ToastContainer 
        position="top-right"
        autoClose={4000}
        newestOnTop={true}
      />
    </div>
  );
}

export default App;

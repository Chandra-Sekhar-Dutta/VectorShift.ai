// toolbar.js

import { DraggableNode } from './draggableNode';
import { FiArrowDownLeft, FiCpu, FiArrowUpRight, FiType, FiSave, FiFile, FiGitMerge, FiGitBranch, FiMessageSquare } from 'react-icons/fi';

export const PipelineToolbar = () => {

    return (
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: '0',
          height: '100%',
          backgroundColor: '#111827',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
            {/* Core Nodes Section */}
            <div style={{ 
              padding: '0.85rem 0.75rem', 
              borderBottom: '1px solid #1f2937',
              flex: '0 0 auto',
              backgroundColor: '#111827'
            }}>
                <h3 style={{ 
                  margin: '0 0 0.6rem 0', 
                  fontSize: '0.6rem', 
                  fontWeight: '800', 
                  color: '#9ca3af', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.8px',
                  paddingLeft: '0rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{ width: '2px', height: '10px', backgroundColor: '#3b82f6', borderRadius: '1px' }}></span>
                  Core Nodes
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <DraggableNode type='customInput' label='Input' color='#3b82f6' icon={FiArrowDownLeft} />
                    <DraggableNode type='llm' label='LLM' color='#8b5cf6' icon={FiCpu} />
                    <DraggableNode type='customOutput' label='Output' color='#06b6d4' icon={FiArrowUpRight} />
                    <DraggableNode type='text' label='Text' color='#6366f1' icon={FiType} />
                </div>
            </div>
            
            {/* Utility Nodes Section */}
            <div style={{ 
              padding: '0.85rem 0.75rem',
              borderBottom: '1px solid #1f2937',
              backgroundColor: '#111827'
            }}>
                <h3 style={{ 
                  margin: '0 0 0.6rem 0', 
                  fontSize: '0.6rem', 
                  fontWeight: '800', 
                  color: '#9ca3af', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.8px',
                  paddingLeft: '0rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{ width: '2px', height: '10px', backgroundColor: '#10b981', borderRadius: '1px' }}></span>
                  Utilities
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <DraggableNode type='saveFile' label='Save File' color='#10b981' icon={FiSave} />
                    <DraggableNode type='chooseFiles' label='Choose Files' color='#f59e0b' icon={FiFile} />
                    <DraggableNode type='merge' label='Merge' color='#ec4899' icon={FiGitMerge} />
                    <DraggableNode type='split' label='Split' color='#06b6d4' icon={FiGitBranch} />
                    <DraggableNode type='chat' label='Chat' color='#10b981' icon={FiMessageSquare} />
                </div>
            </div>
        </div>
    );
};

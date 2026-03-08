// ui.js
// Displays the drag-and-drop UI
// --------------------------------------------------

import { useState, useRef, useCallback } from 'react';
import ReactFlow, { Controls, Background, MiniMap } from 'reactflow';
import { MdDelete } from 'react-icons/md';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import { InputNode } from './nodes/inputNode';
import { LLMNode } from './nodes/llmNode';
import { OutputNode } from './nodes/outputNode';
import { TextNode } from './nodes/textNode';
import { SaveFileNode } from './nodes/saveFileNode';
import { ChooseFilesNode } from './nodes/chooseFilesNode';
import { MergeNode } from './nodes/mergeNode';
import { SplitNode } from './nodes/splitNode';
import { ChatNode } from './nodes/chatNode';

import 'reactflow/dist/style.css';

const gridSize = 20;
const proOptions = { hideAttribution: true };
const nodeTypes = {
  customInput: InputNode,
  llm: LLMNode,
  customOutput: OutputNode,
  text: TextNode,
  saveFile: SaveFileNode,
  chooseFiles: ChooseFilesNode,
  merge: MergeNode,
  split: SplitNode,
  chat: ChatNode,
};

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  getNodeID: state.getNodeID,
  addNode: state.addNode,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});

export const PipelineUI = () => {
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [selectedEdge, setSelectedEdge] = useState(null);
    const {
      nodes,
      edges,
      getNodeID,
      addNode,
      onNodesChange,
      onEdgesChange,
      onConnect
    } = useStore(selector, shallow);

    const getInitNodeData = (nodeID, type) => {
      let nodeData = { id: nodeID, nodeType: `${type}` };
      return nodeData;
    }

    const onDrop = useCallback(
        (event) => {
          event.preventDefault();
    
          if (event?.dataTransfer?.getData('application/reactflow')) {
            const appData = JSON.parse(event.dataTransfer.getData('application/reactflow'));
            const type = appData?.nodeType;
      
            // check if the dropped element is valid
            if (typeof type === 'undefined' || !type) {
              return;
            }
      
            const position = reactFlowInstance.screenToFlowPosition({
              x: event.clientX,
              y: event.clientY,
            });

            const nodeID = getNodeID(type);
            const newNode = {
              id: nodeID,
              type,
              position,
              data: getInitNodeData(nodeID, type),
            };
      
            addNode(newNode);
          }
        },
        [reactFlowInstance, getNodeID, addNode]
    );

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    // Handle edge click to allow selection and deletion
    const onEdgeClick = useCallback((event, edge) => {
        setSelectedEdge(edge);
    }, []);

    // Delete the selected edge
    const deleteSelectedEdge = useCallback(() => {
        if (selectedEdge) {
            onEdgesChange([{ id: selectedEdge.id, type: 'remove' }]);
            setSelectedEdge(null);
        }
    }, [selectedEdge, onEdgesChange]);

    // Handle keyboard event for deleting selected edges
    const handleKeyDown = useCallback((event) => {
        if ((event.key === 'Delete' || event.key === 'Backspace') && reactFlowInstance) {
            // Find and delete all selected edges
            const selectedEdges = edges.filter(edge => edge.selected);
            if (selectedEdges.length > 0) {
                onEdgesChange(selectedEdges.map(edge => ({ id: edge.id, type: 'remove' })));
            }
        }
    }, [edges, onEdgesChange, reactFlowInstance]);

    // Validate connections between nodes
    const isValidConnection = useCallback((connection) => {
        // Allow any source to target connection
        return true;
    }, []);

    return (
        <>
        <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }} onKeyDown={handleKeyDown} tabIndex={0}>
            {/* Delete Edge Button */}
            {selectedEdge && (
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 100,
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center',
                    backgroundColor: '#1f2937',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #374151',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                }}>
                    <span style={{ color: '#e5e7eb', fontSize: '12px', fontWeight: '600' }}>
                        Edge Selected
                    </span>
                    <button
                        onClick={deleteSelectedEdge}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '8px 12px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#dc2626';
                            e.target.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.6)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#ef4444';
                            e.target.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.4)';
                        }}
                        title="Delete this edge"
                    >
                        <MdDelete size={16} />
                        Delete Edge
                    </button>
                </div>
            )}
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onEdgeClick={onEdgeClick}
                onInit={setReactFlowInstance}
                nodeTypes={nodeTypes}
                proOptions={proOptions}
                snapGrid={[gridSize, gridSize]}
                connectionLineType='smoothstep'
                isValidConnection={isValidConnection}
            >
                <Background color="#374151" gap={gridSize} />
                <Controls />
                <MiniMap />
            </ReactFlow>
        </div>
        </>
    )
}

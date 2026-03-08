// submit.js

import { toast } from 'react-toastify';
import { useStore } from './store';
import { buildActionLog, downloadToDownloads, formatExecutionSummary } from './nodes/saveFileUtils';

// Get backend URL from environment file
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

export const SubmitButton = () => {
  const nodes = useStore((state) => state.nodes);
  const edges = useStore((state) => state.edges);

  /**
   * Build a map of node ID to node data for quick lookup with validation
   */
  const buildNodeMap = () => {
    try {
      if (!nodes || !Array.isArray(nodes)) {
        throw new Error('Nodes is not an array');
      }

      const map = nodes.reduce((acc, node) => {
        if (!node || typeof node !== 'object') {
          console.warn('Skipping invalid node:', node);
          return acc;
        }
        if (!node.id) {
          console.warn('Node has no ID:', node);
          return acc;
        }
        acc[node.id] = node;
        return acc;
      }, {});

      return map;
    } catch (error) {
      console.error('Error building node map:', error);
      throw error;
    }
  };

  /**
   * Find all source nodes connected to a target node on a specific handle with validation
   * Returns array of { sourceNodeId, targetHandle, sourceHandle }
   */
  const findConnectedNodes = (targetNodeId, targetHandle) => {
    try {
      if (!edges || !Array.isArray(edges)) {
        return [];
      }

      if (!targetNodeId) {
        throw new Error('Target node ID is required');
      }

      const connected = edges.filter(edge => {
        if (!edge || typeof edge !== 'object') {
          console.warn('Skipping invalid edge:', edge);
          return false;
        }
        const matches = edge.target === targetNodeId && edge.targetHandle === targetHandle;
        if (!matches && edge.target === targetNodeId) {
          console.log(`Edge ${edge.source}->${edge.target}: targetHandle="${edge.targetHandle}" (looking for "${targetHandle}")`);
        }
        return matches;
      });

      return connected;
    } catch (error) {
      console.error(`Error finding connected nodes for ${targetNodeId}:`, error);
      return [];
    }
  };

  /**
   * Extract string value from any node output
   * Handles both simple strings and complex objects with value properties
   */
  const extractStringValue = (output) => {
    if (typeof output === 'string') {
      return output;
    }
    if (output && typeof output === 'object') {
      // Try common value properties
      if (output.value) return String(output.value);
      if (output.response) return String(output.response);
      if (output.text) return String(output.text);
    }
    return String(output || '');
  };

  /**
   * Get the output value from a node with proper error handling
   * - For customInput nodes: return the inputName field
   * - For Text nodes: return processed text with substituted variables
   */
  const getNodeOutput = (nodeId, nodeMap, processedValues = {}, visited = new Set()) => {
    try {
      const node = nodeMap[nodeId];
      if (!node) {
        throw new Error(`Node not found: ${nodeId}`);
      }

      // Check if already processed to avoid infinite loops (memoization)
      if (processedValues[nodeId] !== undefined) {
        return processedValues[nodeId];
      }

      // Detect circular dependencies - node in current recursion path
      if (visited.has(nodeId)) {
        throw new Error(`Circular dependency detected at node ${nodeId}`);
      }

      // Create new visited set for this path to avoid false positives
      const newVisited = new Set(visited);
      newVisited.add(nodeId);
      const nodeType = node.type || node.id.split('-')[0];

      if (nodeType === 'customInput') {
        // Input nodes return their inputName field
        const value = node.data?.inputName;
        if (!value) {
          throw new Error(`Input node "${node.id}" has no value set`);
        }
        processedValues[nodeId] = value;
        return value;
      } else if (nodeType === 'text') {
        // Text nodes return text with substituted variables
        let textContent = node.data?.text || '';

        // If text is empty, return empty
        if (!textContent) {
          processedValues[nodeId] = textContent;
          return textContent;
        }

        // Find all variables in the text
        const variablePattern = /\{\{\s*(\w+)\s*\}\}/g;
        let match;
        const variablesToSubstitute = [];

        while ((match = variablePattern.exec(textContent)) !== null) {
          variablesToSubstitute.push(match[1]);
        }

        console.log(`Processing text node ${nodeId} with variables:`, variablesToSubstitute);
        console.log(`Available edges for this node:`, edges.filter(e => e.target === nodeId));

        // For each variable, find connected node and substitute
        variablesToSubstitute.forEach((varName) => {
          const connectedEdges = findConnectedNodes(nodeId, `${nodeId}-${varName}`);
          
          console.log(`  Looking for edges to handle "${nodeId}-${varName}", found:`, connectedEdges);
          
          // If not found, try alternative: look for ANY edge to this text node
          // (handles case where targetHandle might not be properly set)
          let sourceNodeId = null;
          if (connectedEdges.length > 0) {
            sourceNodeId = connectedEdges[0].source;
          } else {
            // Fallback: get any connected source node to this text node
            const allEdgesToThisNode = edges.filter(edge => edge.target === nodeId);
            if (allEdgesToThisNode.length > 0) {
              console.log(`  Fallback: Using first available edge to text node`);
              sourceNodeId = allEdgesToThisNode[0].source;
            }
          }
          
          if (sourceNodeId) {
            try {
              const sourceValue = getNodeOutput(sourceNodeId, nodeMap, processedValues, newVisited);
              const stringValue = extractStringValue(sourceValue);
              console.log(`  Substituting {{${varName}}} with value from ${sourceNodeId}:`, stringValue);
              textContent = textContent.replace(
                new RegExp(`\\{\\{\\s*${varName}\\s*\\}\\}`, 'g'),
                stringValue
              );
            } catch (error) {
              throw new Error(`Failed to substitute variable "${varName}" in node "${nodeId}": ${error.message}`);
            }
          } else {
            console.warn(`  No source found for variable {{${varName}}} in node ${nodeId}`);
          }
        });

        processedValues[nodeId] = textContent;
        return textContent;
      } else if (nodeType === 'llm') {
        // LLM nodes need system and prompt inputs from connected nodes
        const systemEdges = findConnectedNodes(nodeId, `${nodeId}-system`);
        const promptEdges = findConnectedNodes(nodeId, `${nodeId}-prompt`);
        
        let systemPrompt = 'You are a helpful AI assistant.'; // Default system prompt
        let userPrompt = '';
        
        // Get system prompt from connected node
        if (systemEdges.length > 0) {
          try {
            const sourceNodeId = systemEdges[0].source;
            const systemOutput = getNodeOutput(sourceNodeId, nodeMap, processedValues, newVisited);
            systemPrompt = extractStringValue(systemOutput);
          } catch (error) {
            throw new Error(`Failed to get system prompt for LLM node "${nodeId}": ${error.message}`);
          }
        }
        
        // Get user prompt from connected node
        if (promptEdges.length > 0) {
          try {
            const sourceNodeId = promptEdges[0].source;
            const promptOutput = getNodeOutput(sourceNodeId, nodeMap, processedValues, newVisited);
            userPrompt = extractStringValue(promptOutput);
          } catch (error) {
            throw new Error(`Failed to get user prompt for LLM node "${nodeId}": ${error.message}`);
          }
        }
        
        // If no explicit prompt connection, try to find any input connection
        if (!userPrompt && edges.length > 0) {
          const anyInputEdges = edges.filter(edge => edge.target === nodeId);
          if (anyInputEdges.length > 0) {
            try {
              const sourceNodeId = anyInputEdges[0].source;
              const fallbackOutput = getNodeOutput(sourceNodeId, nodeMap, processedValues, newVisited);
              userPrompt = extractStringValue(fallbackOutput);
            } catch (error) {
              // Silently fail - this is a fallback attempt
            }
          }
        }
        
        // Store LLM processing result
        const llmResult = {
          nodeId: nodeId,
          systemPrompt,
          userPrompt,
          model: node.data?.model || null, // Let backend use env-configured GEMINI_LLM_MODEL
          temperature: node.data?.temperature || 0.7,
          maxTokens: node.data?.maxTokens || 1024,
          pending: true, // Mark for backend processing
        };
        
        processedValues[nodeId] = llmResult;
        return llmResult;
      } else if (nodeType === 'chat') {
        // Chat node: receives context from LLM/Text nodes, supports follow-up queries
        const inputEdges = findConnectedNodes(nodeId, `${nodeId}-input`);
        
        let incomingContext = '';
        let isLLMSource = false;
        
        // Get context from connected node
        if (inputEdges.length > 0) {
          try {
            const sourceNodeId = inputEdges[0].source;
            const sourceOutput = getNodeOutput(sourceNodeId, nodeMap, processedValues, newVisited);
            
            // Check if this is from an LLM node
            isLLMSource = sourceOutput.nodeId && sourceOutput.pending && sourceOutput.userPrompt !== undefined;
            
            // Extract context from LLM or text node
            if (sourceOutput.response) {
              incomingContext = sourceOutput.response;
            } else if (sourceOutput.value) {
              incomingContext = extractStringValue(sourceOutput);
            } else if (sourceOutput.nodeId && sourceOutput.userPrompt) {
              // This is an LLM node - use the user prompt as context
              incomingContext = extractStringValue(sourceOutput.userPrompt);
            } else {
              incomingContext = extractStringValue(sourceOutput);
            }
          } catch (error) {
            throw new Error(`Failed to get context for Chat node "${nodeId}": ${error.message}`);
          }
        }
        
        // Auto-generate 2-line context summary if not provided
        let contextSummary = node.data?.contextSummary || '';
        if (!contextSummary && incomingContext) {
          // Create a brief 2-line summary
          const lines = incomingContext.split('\n');
          contextSummary = lines.slice(0, 2).join('\n');
          if (contextSummary.length > 180) {
            contextSummary = contextSummary.substring(0, 177) + '...';
          }
        }
        
        // Auto-generate follow-up query if not provided
        // If source is LLM, ask for explanation; otherwise use default
        let userMessage = node.data?.followUpQuery || node.data?.userMessage;
        if (!userMessage) {
          userMessage = isLLMSource 
            ? 'Please provide a clear explanation of the response above.'
            : 'Continue the conversation';
        }
        
        // Store Chat processing result
        const chatResult = {
          nodeId: nodeId,
          context: String(incomingContext || ''),
          contextSummary: String(contextSummary || ''),
          userMessage: userMessage,
          systemPrompt: 'You are a helpful chatbot assistant. Use the provided context to answer follow-up questions.',
          temperature: node.data?.temperature || 0.7,
          model: null, // Let backend use env-configured GEMINI_CHAT_MODEL
          pending: true, // Mark for backend processing
        };
        
        processedValues[nodeId] = chatResult;
        return chatResult;
      }

      throw new Error(`Unknown node type: ${nodeType}`);
    } catch (error) {
      console.error(`Error in getNodeOutput for node ${nodeId}:`, error);
      throw error;
    }
  };

  /**
   * Update output node displays with current results
   */
  const updateOutputNodes = (results) => {
    const updateNodeField = useStore.getState().updateNodeField;
    const outputNodes = nodes.filter(node => node.type === 'customOutput');
    outputNodes.forEach(outputNode => {
      // Find edges connected to this output node
      const connectedEdges = edges.filter(edge => edge.target === outputNode.id);
      
      if (connectedEdges.length > 0) {
        // Get the first connected source node
        const sourceNodeId = connectedEdges[0].source;
        
        // Get the result from that source node
        if (results[sourceNodeId]) {
          const sourceResult = results[sourceNodeId];
          let resultDisplay = '';
          
          // Format the result based on type
          if (sourceResult.type === 'input') {
            resultDisplay = sourceResult.value || '(empty)';
          } else if (sourceResult.type === 'text') {
            resultDisplay = sourceResult.value || '(empty)';
          } else if (sourceResult.type === 'llm') {
            resultDisplay = sourceResult.response || sourceResult.userPrompt || '(processing...)';
          } else if (sourceResult.type === 'chat') {
            // For chat results, display the response or context
            resultDisplay = sourceResult.response || sourceResult.context || '(processing...)';
          } else {
            resultDisplay = JSON.stringify(sourceResult, null, 2);
          }
          
          console.log(`Updating output node ${outputNode.id} with result:`, resultDisplay);
          
          // Update the output node's result field
          updateNodeField(outputNode.id, 'result', resultDisplay);
        }
      } else {
        console.log(`Output node ${outputNode.id} has no connected source nodes`);
      }
    });
  };

  /**
   * Handle save file operations
   * Generates action log and downloads JSON file when saveFile nodes are present
   */
  const handleSaveFile = (results) => {
    try {
      // Check if there are any saveFile nodes
      const saveFileNodes = nodes.filter(node => node.type === 'saveFile');
      
      if (saveFileNodes.length === 0) {
        console.log('No saveFile nodes found in workflow');
        return;
      }

      console.log(`Found ${saveFileNodes.length} saveFile node(s), generating action log...`);

      // Build the action log with all node details and tracking
      const actionLog = buildActionLog(nodes, edges, results);

      // Generate filename
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .split('T')[0] + '_' + new Date().getTime();
      const filename = `pipeline_execution_${timestamp}.json`;

      // Display execution summary
      const summary = formatExecutionSummary(actionLog);
      console.log(summary);

      // Download the file
      const downloadSuccess = downloadToDownloads(actionLog, filename);

      if (downloadSuccess) {
        toast.success(`✓ Pipeline execution saved to Downloads: ${filename}`);
      } else {
        toast.error('❌ Failed to download execution file');
      }

      // Log full action log for inspection
      console.log('Complete Action Log:', actionLog);
    } catch (error) {
      console.error('Error handling save file:', error);
      toast.error(`❌ Save File Error: ${error.message}`);
    }
  };

  /**
   * Process the entire workflow and collect results
   * Also updates text nodes with substituted values in the store
   */
  const processWorkflow = () => {
    try {
      const nodeMap = buildNodeMap();
      const results = {};
      const errors = [];

      // Validate nodeMap
      if (Object.keys(nodeMap).length === 0) {
        throw new Error('No nodes found in workflow');
      }

      // Debug logging for edges
      console.log('All edges in workflow:', edges.map(e => ({
        source: e.source,
        sourceHandle: e.sourceHandle,
        target: e.target,
        targetHandle: e.targetHandle
      })));

      // Process all nodes - each node processing starts with fresh visited set
      nodes.forEach((node) => {
        try {
          const nodeType = node.type || node.id.split('-')[0];
          
          if (nodeType === 'customInput') {
            // Validate input node has a value
            const value = node.data?.inputName;
            if (!value || value.trim() === '') {
              errors.push(`Input node "${node.id}" has no value set`);
            }
            
            results[node.id] = {
              type: 'input',
              name: node.data?.inputName || '',
              value: node.data?.inputName || '',
              nodeId: node.id,
            };
          } else if (nodeType === 'text') {
            const textOutput = getNodeOutput(node.id, nodeMap, results, new Set());
            results[node.id] = {
              type: 'text',
              value: textOutput,
              nodeId: node.id,
            };
          } else if (nodeType === 'llm') {
            // Process LLM node with inputs from system and prompt
            const llmOutput = getNodeOutput(node.id, nodeMap, results, new Set());
            results[node.id] = {
              type: 'llm',
              ...llmOutput,
            };
          } else if (nodeType === 'chat') {
            // Process Chat node with input from connected nodes
            const chatOutput = getNodeOutput(node.id, nodeMap, results, new Set());
            results[node.id] = {
              type: 'chat',
              ...chatOutput,
            };
          }
        } catch (error) {
          errors.push(`Error processing node "${node.id}": ${error.message}`);
          console.error(`Error processing node ${node.id}:`, error);
        }
      });

      // If there are errors, throw them
      if (errors.length > 0) {
        throw new Error(`Workflow processing failed:\n${errors.join('\n')}`);
      }

      // Update output nodes with results
      updateOutputNodes(results);

      return results;
    } catch (error) {
      console.error('Error processing workflow:', error);
      toast.error(`❌ Workflow Error: ${error.message}`);
      return null;
    }
  };

  /**
   * Format results for display with error handling
   */
  const formatResults = (results) => {
    try {
      if (!results || typeof results !== 'object') {
        throw new Error('Invalid results object');
      }

      let summary = 'Workflow Results:\n\n';
      let hasResults = false;
      
      Object.entries(results).forEach(([nodeId, data]) => {
        try {
          if (!data || typeof data !== 'object') {
            console.warn(`Skipping invalid result for node ${nodeId}`);
            return;
          }

          if (data.type === 'input') {
            summary += `📥 Input "${data.name || nodeId}": ${data.value || '(empty)'}\n`;
            hasResults = true;
          } else if (data.type === 'text') {
            const displayValue = data.value || '(empty)';
            summary += `📝 Text Output: ${displayValue}\n`;
            hasResults = true;
          } else if (data.type === 'llm') {
            summary += `🤖 LLM Processing:\n`;
            summary += `   System: ${data.systemPrompt || '(none)'}\n`;
            summary += `   Prompt: ${data.userPrompt || '(none)'}\n`;
            summary += `   Model: ${data.model}\n`;
            if (data.response) {
              summary += `   Response: ${data.response}\n`;
            }
            hasResults = true;
          } else if (data.type === 'chat') {
            summary += `💬 Chatbot:\n`;
            summary += `   Context: ${(data.context || '(none)').substring(0, 100)}...\n`;
            summary += `   Summary: ${data.contextSummary || '(auto-generated)'}\n`;
            summary += `   Query: ${data.userMessage || '(none)'}\n`;
            if (data.response) {
              summary += `   Response: ${data.response}\n`;
            }
            hasResults = true;
          }
        } catch (error) {
          console.error(`Error formatting result for node ${nodeId}:`, error);
        }
      });

      if (!hasResults) {
        summary += '(No results to display)\n';
      }

      return summary;
    } catch (error) {
      console.error('Error formatting results:', error);
      return `Error formatting results: ${error.message}`;
    }
  };

  /**
   * Parse pipeline with backend validation
   */
  const parsePipeline = async () => {
    try {
      if (!nodes || !Array.isArray(nodes)) {
        throw new Error('Invalid nodes');
      }
      if (!edges || !Array.isArray(edges)) {
        throw new Error('Invalid edges');
      }

      const payload = {
        nodes: nodes,
        edges: edges.map(edge => ({
          source: edge.source,
          target: edge.target
        }))
      };

      console.log('Parsing pipeline:', payload);

      const response = await fetch(`${BACKEND_URL}/pipelines/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Backend error: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }

      const parseResult = await response.json();
      if (!parseResult) {
        throw new Error('Invalid response from backend');
      }

      console.log('Pipeline parse result:', parseResult);

      // Validate the parse result
      if (parseResult.status !== 'success') {
        throw new Error(parseResult.message || 'Failed to parse pipeline');
      }

      // Check if the graph is a DAG
      if (!parseResult.is_dag) {
        throw new Error('❌ Pipeline contains cycles! Graph must be a Directed Acyclic Graph (DAG).');
      }

      return parseResult;
    } catch (error) {
      console.error('Error parsing pipeline:', error);
      throw error;
    }
  };

  /**
   * Submit workflow to backend with comprehensive error handling
   * Also processes LLM nodes through the LLM endpoint
   */
  const submitToBackend = async (results) => {
    try {
      if (!results || Object.keys(results).length === 0) {
        throw new Error('No results to submit');
      }

      // Process LLM nodes through backend
      for (const [nodeId, data] of Object.entries(results)) {
        if (data.type === 'llm' && data.pending) {
          try {
            toast.info(`⏳ Processing LLM node "${nodeId}"...`);
            
            const llmPayload = {
              system_prompt: (data.systemPrompt || '') + '\n\nIMPORTANT: Keep your response to exactly 2 sentences or less.',
              user_prompt: data.userPrompt || '',
              temperature: data.temperature || 0.7,
              max_tokens: 256,
            };
            
            // Only include model if explicitly set
            if (data.model) {
              llmPayload.model = data.model;
            }

            const llmResponse = await fetch(`${BACKEND_URL}/llm/process`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(llmPayload),
            });

            if (!llmResponse.ok) {
              const errorData = await llmResponse.json().catch(() => ({}));
              throw new Error(`LLM Error: ${errorData.message || 'Unknown error'}`);
            }

            const llmResult = await llmResponse.json();
            if (llmResult.status === 'success') {
              // Update the result with the LLM response
              data.response = llmResult.response;
              data.pending = false;
              // Update the node UI
              useStore.getState().updateNodeField(nodeId, 'response', llmResult.response);
              useStore.getState().updateNodeField(nodeId, 'pending', false);
              toast.success(`✓ LLM node "${nodeId}" processed successfully!`);
            } else {
              throw new Error(llmResult.message || 'LLM processing failed');
            }
          } catch (error) {
            console.error(`Error processing LLM node ${nodeId}:`, error);
            toast.error(`❌ LLM Processing Error: ${error.message}`);
            throw error;
          }
        } else if (data.type === 'chat' && data.pending) {
          try {
            toast.info(`⏳ Processing Chat node "${nodeId}"...`);
            
            // Combine context with system prompt for better conversation
            const contextPrompt = data.context 
              ? `Context provided:\n${data.context}\n\nUser query:`
              : 'You are a helpful chatbot assistant.';
            
            const chatPayload = {
              system_prompt: (data.systemPrompt || 'You are a helpful chatbot assistant. Use the provided context to answer questions.') + '\n\nIMPORTANT: Keep your response to exactly 2 sentences or less.',
              user_message: `${contextPrompt}\n${data.userMessage || ''}`,
              temperature: data.temperature || 0.7,
              max_tokens: 256,
            };
            
            // Only include model if explicitly set
            if (data.model) {
              chatPayload.model = data.model;
            }

            const chatResponse = await fetch(`${BACKEND_URL}/chat/process`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(chatPayload),
            });

            if (!chatResponse.ok) {
              const errorData = await chatResponse.json().catch(() => ({}));
              throw new Error(`Chat Error: ${errorData.message || 'Unknown error'}`);
            }

            const chatResult = await chatResponse.json();
            if (chatResult.status === 'success') {
              // Update the result with the chat response
              data.response = chatResult.response;
              data.pending = false;
              // Update the node UI
              useStore.getState().updateNodeField(nodeId, 'response', chatResult.response);
              useStore.getState().updateNodeField(nodeId, 'pending', false);
              toast.success(`✓ Chat node "${nodeId}" processed successfully!`);
            } else {
              throw new Error(chatResult.message || 'Chat processing failed');
            }
          } catch (error) {
            console.error(`Error processing Chat node ${nodeId}:`, error);
            toast.error(`❌ Chat Processing Error: ${error.message}`);
            throw error;
          }
        }
      }

      const payload = {
        nodes: nodes,
        edges: edges,
        results: results,
        timestamp: new Date().toISOString(),
      };

      // Validate payload
      if (!payload.nodes || !Array.isArray(payload.nodes)) {
        throw new Error('Invalid nodes in payload');
      }
      if (!payload.edges || !Array.isArray(payload.edges)) {
        throw new Error('Invalid edges in payload');
      }

      console.log('Submitting workflow:', payload);

      // TODO: Uncomment when backend is ready
      /*
      if (!payload) {
        throw new Error('Payload is empty');
      }

      const response = await fetch(`${BACKEND_URL}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Backend error: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }

      const backendResult = await response.json();
      if (!backendResult) {
        throw new Error('Invalid response from backend');
      }

      console.log('Backend response:', backendResult);
      */

      return true;
    } catch (error) {
      console.error('Error submitting to backend:', error);
      throw new Error(`Backend submission failed: ${error.message}`);
    }
  };

  /**
   * Validate pipeline configuration with comprehensive checks
   */
  const validatePipeline = () => {
    const errors = [];
    const warnings = [];

    try {
      // Check for file nodes
      const fileNodes = nodes.filter(node => node.type === 'file');
      if (fileNodes.length > 0) {
        warnings.push('⚠️ File nodes are not yet supported! Only Text nodes are functional.');
      }

      // Check if there are any text nodes
      const textNodes = nodes.filter(node => node.type === 'text');
      if (textNodes.length === 0) {
        errors.push('❌ No Text nodes found! Add at least one Text node to execute the pipeline.');
      }

      // Check text nodes have content
      textNodes.forEach(textNode => {
        if (!textNode.data?.text || textNode.data.text.trim() === '') {
          errors.push(`Text node "${textNode.id}" is empty! Add text content.`);
        }
      });

      // Check if input nodes have values
      const inputNodes = nodes.filter(node => node.type === 'customInput');
      inputNodes.forEach(inputNode => {
        if (!inputNode.data?.inputName || inputNode.data.inputName.trim() === '') {
          errors.push(`Input node "${inputNode.id}" has no value set!`);
        }
      });

      // Check LLM node configuration
      const llmNodes = nodes.filter(node => node.type === 'llm');
      llmNodes.forEach(llmNode => {
        // Check if LLM node has system and prompt inputs
        const systemConnected = edges.some(edge => edge.target === llmNode.id && edge.targetHandle?.includes('system'));
        const promptConnected = edges.some(edge => edge.target === llmNode.id && edge.targetHandle?.includes('prompt'));
        
        if (!systemConnected) {
          warnings.push(`⚠️ LLM node "${llmNode.id}" has no system prompt input connected.`);
        }
        if (!promptConnected) {
          warnings.push(`⚠️ LLM node "${llmNode.id}" has no user prompt input connected.`);
        }
      });

      // Check Chat node configuration
      const chatNodes = nodes.filter(node => node.type === 'chat');
      chatNodes.forEach(chatNode => {
        // Chat nodes typically come after LLM nodes, so having an input is good but not required
        const hasInput = edges.some(edge => edge.target === chatNode.id);
        if (!hasInput) {
          warnings.push(`⚠️ Chat node "${chatNode.id}" has no input connected. It will use the default user message.`);
        }
      });

      // Check if input nodes are connected to text nodes or LLM nodes
      if (inputNodes.length > 0) {
        const unconnectedInputs = [];

        inputNodes.forEach(inputNode => {
          const hasConnectionToText = edges.some(edge => 
            edge.source === inputNode.id && 
            textNodes.some(tn => tn.id === edge.target)
          );
          const hasConnectionToLLM = edges.some(edge => 
            edge.source === inputNode.id && 
            llmNodes.some(ln => ln.id === edge.target)
          );
          const hasConnectionToChat = edges.some(edge =>
            edge.source === inputNode.id &&
            chatNodes.some(cn => cn.id === edge.target)
          );
          if (hasConnectionToText || hasConnectionToLLM || hasConnectionToChat) {
            // Input is properly connected
          } else {
            unconnectedInputs.push(inputNode.id);
          }
        });

        if (unconnectedInputs.length > 0 && (textNodes.length > 0 || llmNodes.length > 0 || chatNodes.length > 0)) {
          warnings.push(`⚠️ Input nodes ${unconnectedInputs.join(', ')} are not connected to Text or Processing nodes.`);
        }
      }

      // Check edges are valid
      edges.forEach(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);

        if (!sourceNode) {
          errors.push(`Edge connects to non-existent source node: ${edge.source}`);
        }
        if (!targetNode) {
          errors.push(`Edge connects to non-existent target node: ${edge.target}`);
        }
      });

      // Show warnings
      warnings.forEach(warning => toast.warning(warning));

      // Show errors and return false if any
      if (errors.length > 0) {
        errors.forEach(error => toast.error(error));
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating pipeline:', error);
      toast.error(`❌ Validation Error: ${error.message}`);
      return false;
    }
  };

  /**
   * Handle submit button click with comprehensive error handling
   */
  const handleSubmit = async () => {
    try {
      // Initial validation
      if (!nodes || nodes.length === 0) {
        toast.error('❌ Add nodes to the pipeline first!');
        return;
      }

      if (!edges) {
        toast.error('❌ Pipeline configuration is corrupted!');
        return;
      }

      // Validate pipeline configuration
      if (!validatePipeline()) {
        return;
      }

      // Show loading state
      toast.info('⏳ Parsing pipeline structure...');

      // Parse pipeline with backend validation
      const parseResult = await parsePipeline();
      
      // Display alert with pipeline analysis
      const dagStatus = parseResult.is_dag ? '✓ YES' : '✗ NO';
      toast.info(
        `Pipeline Analysis:\n\n` +
        `Number of Nodes: ${parseResult.num_nodes}\n` +
        `Number of Edges: ${parseResult.num_edges}\n` +
        `Is DAG (Directed Acyclic Graph): ${dagStatus}`
      );

      // Show parse results
      toast.info(`Pipeline Analysis: ${parseResult.num_nodes} nodes, ${parseResult.num_edges} edges, DAG: ${parseResult.is_dag}`);

      // Show loading state
      toast.info('⏳ Processing workflow...');

      // Process the workflow
      const results = processWorkflow();
      if (!results) {
        return;
      }

      // Validate results
      if (Object.keys(results).length === 0) {
        toast.error('❌ No results generated from workflow processing');
        return;
      }

      // Format and display results
      const summary = formatResults(results);
      console.log('Workflow Summary:', summary);

      // Submit to backend
      await submitToBackend(results);

      // Update output nodes with final LLM responses
      updateOutputNodes(results);

      // Handle save file operations if saveFile nodes are present
      handleSaveFile(results);

      // Show success
      toast.success('✓ Pipeline Executed Successfully!');
      
      // Log results in console for inspection
      console.log('Final Results:', results);
      console.table(results);

    } catch (error) {
      console.error('Submit operation failed:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      toast.error(`❌ Error: ${errorMessage}`);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <button
        onClick={handleSubmit}
        style={{
          padding: '0.8rem 1.8rem',
          background: '#3b82f6',
          color: 'white',
          borderRadius: '6px',
          border: 'none',
          fontSize: '0.93rem',
          fontWeight: '700',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
          transition: 'all 0.18s ease-out',
          outline: 'none',
          letterSpacing: '0.2px',
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px) scale(1.02)';
          e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0) scale(1)';
          e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
        }}
        onMouseDown={(e) => {
          e.target.style.transform = 'translateY(0) scale(0.96)';
        }}
        onMouseUp={(e) => {
          e.target.style.transform = 'translateY(-2px) scale(1.02)';
        }}
        title="Submit and execute the pipeline"
      >
        ▶ Execute Pipeline
      </button>
    </div>
  );
};

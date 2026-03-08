/**
 * Save File Utilities
 * Handles building JSON structure and downloading pipeline execution data
 */

/**
 * Build complete action log with all node details
 * Tracks every action: node_type, connections, exists/removed, data, data type, response with timestamp
 */
export const buildActionLog = (nodes, edges, results) => {
  const timestamp = new Date().toISOString();
  const now = new Date();

  // Build node ID to node mapping
  const nodeMap = nodes.reduce((acc, node) => {
    acc[node.id] = node;
    return acc;
  }, {});

  // Build connection map: nodeId -> array of connected nodeIds
  const connectionMap = {};
  edges.forEach(edge => {
    if (!connectionMap[edge.source]) {
      connectionMap[edge.source] = [];
    }
    connectionMap[edge.source].push({
      targetId: edge.target,
      targetHandle: edge.targetHandle,
      sourceHandle: edge.sourceHandle,
    });
  });

  // Build action log for each node
  const actions = nodes.map((node) => {
    const nodeType = node.type || node.id.split('-')[0];
    const nodeResult = results[node.id];
    const connectedNodes = connectionMap[node.id] || [];

    // Determine data type
    let dataType = 'unknown';
    let dataValue = null;

    if (nodeResult) {
      if (nodeResult.type === 'input') {
        dataType = 'text';
        dataValue = nodeResult.value;
      } else if (nodeResult.type === 'text') {
        dataType = 'text';
        dataValue = nodeResult.value;
      } else if (nodeResult.type === 'llm') {
        dataType = 'object';
        dataValue = {
          systemPrompt: nodeResult.systemPrompt,
          userPrompt: nodeResult.userPrompt,
          response: nodeResult.response,
          model: nodeResult.model,
        };
      } else {
        dataType = typeof nodeResult.value === 'object' ? 'object' : 'text';
        dataValue = nodeResult.value || nodeResult;
      }
    }

    // Get node configuration and description
    const nodeConfig = getNodeConfig(nodeType, node.data);

    return {
      nodeId: node.id,
      nodeType: nodeType,
      label: nodeConfig.label,
      description: nodeConfig.description,
      status: 'exists', // In this context, all nodes in the log exist
      connectedTo: connectedNodes.map(conn => ({
        nodeId: conn.targetId,
        nodeType: nodeMap[conn.targetId]?.type || conn.targetId.split('-')[0],
        sourceHandle: conn.sourceHandle,
        targetHandle: conn.targetHandle,
      })),
      data: {
        type: dataType,
        value: dataValue,
        configuration: nodeConfig.config,
      },
      response: nodeResult
        ? {
            data: nodeResult,
            timestamp: now.toISOString(),
            processingTime: 'N/A', // Can be calculated if needed
          }
        : null,
    };
  });

  return {
    metadata: {
      timestamp: timestamp,
      totalNodes: nodes.length,
      totalEdges: edges.length,
      totalActions: actions.length,
    },
    workflowStructure: {
      nodes: nodes.length,
      edges: edges.length,
      nodeTypes: [...new Set(nodes.map(n => n.type || n.id.split('-')[0]))],
    },
    actions: actions,
    executionSummary: {
      totalInput: nodes.filter(n => n.type === 'customInput').length,
      totalProcessing: nodes.filter(
        n =>
          n.type === 'text' ||
          n.type === 'llm' ||
          n.type === 'split' ||
          n.type === 'merge' ||
          n.type === 'chooseFiles'
      ).length,
      totalOutput: nodes.filter(n => n.type === 'customOutput').length,
      totalUtility: nodes.filter(
        n =>
          n.type === 'saveFile' ||
          n.type === 'imageProcessing' ||
          n.type === 'file'
      ).length,
    },
  };
};

/**
 * Get node configuration details based on node type
 */
const getNodeConfig = (nodeType, nodeData) => {
  const configs = {
    customInput: {
      label: 'Input',
      description: 'User input node',
      config: {
        inputName: nodeData?.inputName || '',
        value: nodeData?.inputName || '',
      },
    },
    customOutput: {
      label: 'Output',
      description: 'Output display node',
      config: {
        result: nodeData?.result || '',
      },
    },
    text: {
      label: 'Text Processing',
      description: 'Text transformation and substitution',
      config: {
        text: nodeData?.text || '',
      },
    },
    llm: {
      label: 'LLM Processing',
      description: 'Large Language Model processing',
      config: {
        model: nodeData?.model || 'gemini-3-flash-preview',
        temperature: nodeData?.temperature || 0.7,
        maxTokens: nodeData?.maxTokens || 1024,
      },
    },
    split: {
      label: 'Split',
      description: 'Data splitting node',
      config: {
        separator: nodeData?.separator || ',',
      },
    },
    merge: {
      label: 'Merge',
      description: 'Data merging node',
      config: {
        separator: nodeData?.separator || ',',
      },
    },
    chooseFiles: {
      label: 'Choose Files',
      description: 'File selection node',
      config: {
        fileType: nodeData?.fileType || '',
        files: nodeData?.files || '',
      },
    },
    saveFile: {
      label: 'Save File',
      description: 'File output and export',
      config: {
        filename: nodeData?.filename || 'output',
        format: nodeData?.format || 'JSON',
        filePath: nodeData?.filePath || './exports/',
      },
    },
    imageProcessing: {
      label: 'Image Processing',
      description: 'Image manipulation and analysis',
      config: {
        operation: nodeData?.operation || 'resize',
      },
    },
    file: {
      label: 'File Input',
      description: 'File input node',
      config: {
        filename: nodeData?.filename || '',
      },
    },
  };

  return (
    configs[nodeType] || {
      label: nodeType,
      description: `${nodeType} node`,
      config: nodeData || {},
    }
  );
};

/**
 * Download JSON file to Downloads folder
 * Uses the Electron-like approach for web browsers (download as file)
 */
export const downloadToDownloads = (data, filename = 'pipeline_execution.json') => {
  try {
    // Convert data to JSON string with pretty formatting
    const jsonString = JSON.stringify(data, null, 2);

    // Create a Blob from the JSON string
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Create a temporary URL for the blob
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL object
    URL.revokeObjectURL(url);

    console.log(`✓ File downloaded: ${filename}`);
    return true;
  } catch (error) {
    console.error('Error downloading file:', error);
    return false;
  }
};

/**
 * Save file with custom path (for use with backend if needed)
 * This function sends data to backend to save to a specific path
 */
export const saveFileWithBackend = async (data, backendUrl, filename = 'pipeline_execution.json') => {
  try {
    const payload = {
      filename: filename,
      data: data,
    };

    const response = await fetch(`${backendUrl}/save-file`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Backend error: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }

    const result = await response.json();
    console.log('✓ File saved via backend:', result);
    return result;
  } catch (error) {
    console.error('Error saving file via backend:', error);
    throw error;
  }
};

/**
 * Format execution data for display
 */
export const formatExecutionSummary = (actionLog) => {
  let summary = '\n📊 Pipeline Execution Report\n';
  summary += '═'.repeat(50) + '\n\n';

  // Metadata
  summary += `📅 Timestamp: ${actionLog.metadata.timestamp}\n`;
  summary += `📈 Total Nodes: ${actionLog.metadata.totalNodes}\n`;
  summary += `🔗 Total Edges: ${actionLog.metadata.totalEdges}\n\n`;

  // Execution Summary
  summary += '📋 Execution Summary:\n';
  summary += `   Inputs: ${actionLog.executionSummary.totalInput}\n`;
  summary += `   Processing: ${actionLog.executionSummary.totalProcessing}\n`;
  summary += `   Outputs: ${actionLog.executionSummary.totalOutput}\n`;
  summary += `   Utilities: ${actionLog.executionSummary.totalUtility}\n\n`;

  // Node Actions
  summary += '📝 Node Actions:\n';
  actionLog.actions.forEach((action) => {
    summary += `\n   ${action.nodeId} (${action.nodeType})\n`;
    summary += `   Label: ${action.label}\n`;
    summary += `   Data Type: ${action.data.type}\n`;
    if (action.connectedTo.length > 0) {
      summary += `   Connected To: ${action.connectedTo.map(c => c.nodeId).join(', ')}\n`;
    }
    if (action.response) {
      summary += `   ✓ Processed at ${action.response.timestamp}\n`;
    }
  });

  summary += '\n' + '═'.repeat(50) + '\n';
  return summary;
};

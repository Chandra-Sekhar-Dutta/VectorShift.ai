// chooseFilesNode.js

import { Position } from 'reactflow';
import { BaseNode } from './baseNode';
import { useState } from 'react';
import { useStore } from '../store';

/**
 * Choose Files Node - Select files based on file type
 * Showcases: file type selection and file input
 */
export const ChooseFilesNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const [selectedFiles, setSelectedFiles] = useState(data?.files || []);

  const handleFieldChange = (fieldKey, value) => {
    updateNodeField(id, fieldKey, value);
  };

  // Convert fileType to accept attribute format
  const getAcceptAttribute = () => {
    const fileType = data?.fileType || '';
    if (!fileType) return '';
    
    const extensions = fileType.split(',').map(ext => ext.trim());
    return extensions.map(ext => (ext.startsWith('.') ? ext : '.' + ext)).join(',');
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const selectedFileType = data?.fileType || '';
    
    // Filter files based on selected file type if specified
    let filteredFiles = files;
    if (selectedFileType) {
      const extensions = selectedFileType.split(',').map(ext => ext.trim().toLowerCase());
      filteredFiles = files.filter(file => {
        const fileExt = '.' + file.name.split('.').pop().toLowerCase();
        return extensions.some(ext => fileExt === (ext.startsWith('.') ? ext : '.' + ext));
      });
    }
    
    setSelectedFiles(filteredFiles);
    const fileNames = filteredFiles.map(f => f.name).join(', ');
    handleFieldChange('files', fileNames);
  };

  return (
    <BaseNode
      id={id}
      data={data}
      title="Choose Files"
      description="Select and filter files"
      fields={[
        {
          type: 'text',
          label: 'File Type',
          key: 'fileType',
          placeholder: 'e.g., .pdf, .jpeg, .png',
          defaultValue: '',
        },
        {
          type: 'file',
          label: 'Choose File',
          key: 'files',
          defaultValue: '',
          onChange: handleFileChange,
          multiple: true,
          accept: getAcceptAttribute(),
        },
      ]}
      handles={[
        { type: 'target', position: Position.Left, id: `${id}-input` },
        { type: 'source', position: Position.Right, id: `${id}-output` },
      ]}
      width={240}
      height={140}
      category="utility"
      accentColor="#f59e0b"
      onFieldChange={handleFieldChange}
    />
  );
};

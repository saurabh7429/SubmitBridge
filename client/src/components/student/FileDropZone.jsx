import React, { useRef, useState } from 'react';
import Badge from '../common/Badge';

export function FileDropZone({
  selectedFile,
  onFileSelect,
  allowedFileTypes = 'pdf',
  fileError,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  const triggerFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const acceptTypes = allowedFileTypes.includes('docx')
    ? '.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    : '.pdf,application/pdf';

  return (
    <div className="form-group">
      <label className="form-label">
        Upload Assignment File <span className="text-danger">*</span>
      </label>

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptTypes}
        onChange={(e) => onFileSelect(e.target.files && e.target.files[0])}
        style={{ display: 'none' }}
      />

      <div
        onClick={triggerFileDialog}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`drop-zone ${isDragging ? 'drop-zone--dragging' : ''} ${
          selectedFile ? 'drop-zone--selected' : ''
        }`}
      >
        {selectedFile ? (
          <div className="drop-zone__file-info">
            <div className="file-icon-badge">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div className="file-name-text">
              <strong>{selectedFile.name}</strong>
              <span>({(selectedFile.size / 1024).toFixed(1)} KB)</span>
            </div>
            <Badge variant="emerald">✓ File Attached & Ready</Badge>
            <p className="file-change-hint">Click or drop another file to replace</p>
          </div>
        ) : (
          <div className="drop-zone__prompt">
            <div className="upload-icon-circle">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <p className="drop-prompt-title">Click to browse or drag and drop file here</p>
            <p className="drop-prompt-sub">
              Accepted: PDF{allowedFileTypes.includes('docx') ? ' or Word (DOCX)' : ''} (Max 10MB)
            </p>
          </div>
        )}
      </div>

      {fileError && <p className="file-error-text">{fileError}</p>}
    </div>
  );
}

export default FileDropZone;

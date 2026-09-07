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

  const handleContainerClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

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
    if (file) {
      onFileSelect(file);
    }
  };

  const acceptTypes = allowedFileTypes.includes('docx')
    ? '.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    : '.pdf,application/pdf';

  return (
    <div className="sb-form-group">
      <label className="sb-form-label">
        Upload Assignment Document <span className="sb-text-danger">*</span>
      </label>

      <div
        role="button"
        tabIndex={0}
        onClick={handleContainerClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleContainerClick();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`sb-dropzone ${isDragging ? 'sb-dropzone--dragging' : ''} ${
          selectedFile ? 'sb-dropzone--selected' : ''
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptTypes}
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />

        {selectedFile ? (
          <div className="sb-dropzone-attached">
            <div className="sb-dropzone-file-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div className="sb-dropzone-file-details">
              <strong className="sb-dropzone-filename">{selectedFile.name}</strong>
              <span className="sb-dropzone-filesize">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
            </div>
            <Badge variant="emerald">✓ Document Attached & Ready</Badge>
            <p className="sb-dropzone-change-hint">Click or drop another file to replace</p>
          </div>
        ) : (
          <div className="sb-dropzone-prompt">
            <div className="sb-dropzone-cloud-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <p className="sb-dropzone-title">Click to browse or drag and drop your file here</p>
            <p className="sb-dropzone-sub">
              Accepted: PDF{allowedFileTypes.includes('docx') ? ' or Word (DOCX)' : ''} (Max 10MB)
            </p>
            <div className="sb-btn sb-btn-secondary sb-btn--sm" style={{ marginTop: 14, display: 'inline-flex' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>Choose File from Device</span>
            </div>
          </div>
        )}
      </div>

      {fileError && <p className="sb-form-error">{fileError}</p>}
    </div>
  );
}

export default FileDropZone;

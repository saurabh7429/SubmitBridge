import React from 'react';

export function FileTypeSelector({ allowPdf, setAllowPdf, allowDocx, setAllowDocx }) {
  return (
    <div className="sb-form-group">
      <label className="sb-form-label">Accepted Document Formats</label>
      <div className="sb-filetypes-grid">
        <label className={`sb-filetype-card ${allowPdf ? 'sb-filetype-card--active' : ''}`}>
          <input
            type="checkbox"
            checked={allowPdf}
            onChange={(e) => setAllowPdf(e.target.checked)}
          />
          <span className="sb-filetype-icon">📄</span>
          <div className="sb-filetype-text">
            <strong>PDF Document (.pdf)</strong>
            <p>Standard format for documents on all operating systems</p>
          </div>
        </label>

        <label className={`sb-filetype-card ${allowDocx ? 'sb-filetype-card--active' : ''}`}>
          <input
            type="checkbox"
            checked={allowDocx}
            onChange={(e) => setAllowDocx(e.target.checked)}
          />
          <span className="sb-filetype-icon">📝</span>
          <div className="sb-filetype-text">
            <strong>Word Document (.docx)</strong>
            <p>Standard Microsoft Word document format</p>
          </div>
        </label>
      </div>
    </div>
  );
}

export default FileTypeSelector;

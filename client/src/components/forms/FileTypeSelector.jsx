import React from 'react';

export function FileTypeSelector({ allowPdf, setAllowPdf, allowDocx, setAllowDocx }) {
  return (
    <div className="form-group">
      <label className="form-label">Accepted Document Formats</label>
      <div className="format-selection-row">
        <label className={`format-pill-box ${allowPdf ? 'active' : ''}`}>
          <input
            type="checkbox"
            checked={allowPdf}
            onChange={(e) => setAllowPdf(e.target.checked)}
          />
          <span className="format-pill-box__icon">📄</span>
          <div>
            <strong>PDF Document (.pdf)</strong>
            <p>Standard document format for all devices</p>
          </div>
        </label>

        <label className={`format-pill-box ${allowDocx ? 'active' : ''}`}>
          <input
            type="checkbox"
            checked={allowDocx}
            onChange={(e) => setAllowDocx(e.target.checked)}
          />
          <span className="format-pill-box__icon">📝</span>
          <div>
            <strong>Word Document (.docx)</strong>
            <p>Microsoft Word document format</p>
          </div>
        </label>
      </div>
    </div>
  );
}

export default FileTypeSelector;

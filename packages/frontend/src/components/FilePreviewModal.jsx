import { X, File, Image as ImageIcon, Download } from 'lucide-react'
import '../styles/file-preview-modal.css'

export default function FilePreviewModal({ fileUrl, fileName, fileType, onClose }) {
  if (!fileUrl) return null

  const isImage = fileType === 'image' || fileUrl.startsWith('data:image/')
  const isPDF = fileType === 'pdf' || fileUrl.startsWith('data:application/pdf') || fileName?.endsWith('.pdf')

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = fileName || 'report-file'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="file-preview-modal-overlay" onClick={onClose}>
      <div className="file-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="file-preview-modal-header">
          <div className="file-preview-modal-title">
            {isImage ? <ImageIcon size={20} /> : <File size={20} />}
            <span>{fileName || 'File Preview'}</span>
          </div>
          <div className="file-preview-modal-actions">
            <button onClick={handleDownload} className="btn-download" title="Download">
              <Download size={18} />
            </button>
            <button onClick={onClose} className="btn-close" title="Close">
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="file-preview-modal-content">
          {isImage ? (
            <img src={fileUrl} alt="Preview" className="file-preview-image" />
          ) : isPDF ? (
            <iframe
              src={fileUrl}
              className="file-preview-pdf"
              title="PDF Preview"
            />
          ) : (
            <div className="file-preview-unsupported">
              <File size={48} />
              <p>File preview not available</p>
              <button onClick={handleDownload} className="btn btn-primary">
                Download File
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


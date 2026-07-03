import { useEffect } from 'react'
import { X, Download, Copy } from 'lucide-react'
import './FullscreenModal.css'

function FullscreenModal({ isOpen, onClose, content, type }) {
    // Close on Escape key  
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = ''
        }
    }, [isOpen, onClose])

    if (!isOpen || !content) return null

    const renderContent = () => {
        switch (type) {
            case 'text':
                return (
                    <div className="fullscreen-text-content">
                        <h2>{content.title}</h2>
                        <p>{content.content}</p>
                        <div className="content-meta">
                            <span className="meta-model">{content.model}</span>
                            <span className="meta-prompt">Prompt: {content.prompt}</span>
                        </div>
                    </div>
                )
            case 'image':
                return (
                    <div className="fullscreen-image-content">
                        <img src={content.url} alt={content.title} />
                        <div className="content-meta">
                            <span className="meta-title">{content.title}</span>
                            <span className="meta-model">{content.model}</span>
                        </div>
                    </div>
                )
            case 'video':
                return (
                    <div className="fullscreen-video-content">
                        <video
                            src={content.url}
                            controls
                            autoPlay
                            loop
                        />
                        <div className="content-meta">
                            <span className="meta-title">{content.title}</span>
                            <span className="meta-model">{content.model}</span>
                            <span className="meta-duration">{content.duration}</span>
                        </div>
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <div className="fullscreen-modal-overlay" onClick={onClose}>
            <div className="fullscreen-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <div className="modal-title">
                        {content.title || 'Preview'}
                    </div>
                    <div className="modal-actions">
                        <button className="modal-action-btn" title="Copy">
                            <Copy size={18} />
                        </button>
                        <button className="modal-action-btn" title="Download">
                            <Download size={18} />
                        </button>
                        <button className="modal-close-btn" onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="modal-content">
                    {renderContent()}
                </div>
            </div>
        </div>
    )
}

export default FullscreenModal

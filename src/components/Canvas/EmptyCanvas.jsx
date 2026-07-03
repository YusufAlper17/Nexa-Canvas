import { createElement } from 'react'
import { Plus, Type, Image, Video } from 'lucide-react'
import './EmptyCanvas.css'

function EmptyCanvas({ onAddNode }) {
    const nodeTypes = [
        { type: 'textNode', icon: Type, label: 'Text', description: 'Generate text content' },
        { type: 'imageNode', icon: Image, label: 'Image', description: 'Generate images' },
        { type: 'videoNode', icon: Video, label: 'Video', description: 'Generate videos' },
    ]

    return (
        <div className="empty-canvas">
            <div className="empty-content">
                <div className="empty-icon">
                    <Plus size={32} />
                </div>
                <h2>Start creating</h2>
                <p>Add your first block to begin</p>

                <div className="quick-add-buttons">
                    {nodeTypes.map(({ type, icon, label, description }) => (
                        <button
                            key={type}
                            className="quick-add-btn"
                            onClick={() => onAddNode(type)}
                        >
                            {createElement(icon, { size: 20 })}
                            <span className="btn-label">{label}</span>
                            <span className="btn-description">{description}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default EmptyCanvas

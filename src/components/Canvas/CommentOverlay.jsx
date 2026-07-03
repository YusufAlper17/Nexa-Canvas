import { useState, useRef } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'
import './CommentOverlay.css'

function CommentOverlay({
    comments,
    onDeleteComment,
    onAddComment,
    isCommenting,
    reactFlowInstance
}) {
    const [newCommentText, setNewCommentText] = useState('')
    const [pendingPosition, setPendingPosition] = useState(null)
    const [draggingId, setDraggingId] = useState(null)
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
    const [commentPositions, setCommentPositions] = useState({})

    const overlayRef = useRef(null)

    const handleCanvasClick = (e) => {
        if (!isCommenting || !reactFlowInstance) return
        if (e.target !== overlayRef.current) return

        const bounds = overlayRef.current.getBoundingClientRect()
        const position = {
            x: e.clientX - bounds.left,
            y: e.clientY - bounds.top,
        }

        setPendingPosition(position)
    }

    const handleSubmitComment = () => {
        if (newCommentText.trim() && pendingPosition) {
            onAddComment(pendingPosition, newCommentText)
            setNewCommentText('')
            setPendingPosition(null)
        }
    }

    const handleCancelComment = () => {
        setNewCommentText('')
        setPendingPosition(null)
    }

    // Draggable comment handlers
    const handleDragStart = (e, commentId, commentPosition) => {
        e.stopPropagation()
        const currentPos = commentPositions[commentId] || commentPosition
        const overlayRect = overlayRef.current.getBoundingClientRect()

        setDraggingId(commentId)
        setDragOffset({
            x: e.clientX - (currentPos.x + overlayRect.left),
            y: e.clientY - (currentPos.y + overlayRect.top)
        })
    }

    const handleDragMove = (e) => {
        if (!draggingId || !overlayRef.current) return

        const overlayRect = overlayRef.current.getBoundingClientRect()
        const newX = e.clientX - overlayRect.left - dragOffset.x
        const newY = e.clientY - overlayRect.top - dragOffset.y

        setCommentPositions(prev => ({
            ...prev,
            [draggingId]: { x: newX, y: newY }
        }))
    }

    const handleDragEnd = () => {
        setDraggingId(null)
    }

    const getCommentPosition = (comment) => {
        return commentPositions[comment.id] || comment.position
    }

    return (
        <div
            ref={overlayRef}
            className={`comment-overlay ${isCommenting ? 'active' : ''}`}
            onClick={handleCanvasClick}
            onMouseMove={draggingId ? handleDragMove : undefined}
            onMouseUp={draggingId ? handleDragEnd : undefined}
            onMouseLeave={draggingId ? handleDragEnd : undefined}
        >
            {/* Existing Comments */}
            {comments.map((comment) => {
                const pos = getCommentPosition(comment)
                return (
                    <div
                        key={comment.id}
                        className={`comment-bubble ${draggingId === comment.id ? 'dragging' : ''}`}
                        style={{
                            left: pos.x,
                            top: pos.y,
                            cursor: draggingId === comment.id ? 'grabbing' : 'grab'
                        }}
                        onMouseDown={(e) => handleDragStart(e, comment.id, comment.position)}
                    >
                        <div className="comment-header">
                            <span className="comment-author">{comment.author}</span>
                            <button
                                className="comment-delete"
                                onClick={(e) => { e.stopPropagation(); onDeleteComment(comment.id); }}
                            >
                                <X size={12} />
                            </button>
                        </div>
                        <p className="comment-text">{comment.text}</p>
                        <div className="comment-tail" />
                    </div>
                )
            })}

            {/* New Comment Input */}
            {pendingPosition && (
                <div
                    className="comment-input-bubble"
                    style={{
                        left: pendingPosition.x,
                        top: pendingPosition.y,
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <textarea
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleSubmitComment()
                            }
                            if (e.key === 'Escape') {
                                handleCancelComment()
                            }
                        }}
                    />
                    <div className="comment-input-actions">
                        <button className="cancel-btn" onClick={handleCancelComment}>
                            Cancel
                        </button>
                        <button className="submit-btn" onClick={handleSubmitComment}>
                            <Send size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CommentOverlay

import { useState, useEffect } from 'react'
import { X, Send } from 'lucide-react'
import './CommentOverlay.css'

function CommentOverlay({
    comments,
    onDeleteComment,
    onAddComment,
    isCommenting,
    reactFlowInstance
}) {
    const [activeComment, setActiveComment] = useState(null)
    const [newCommentText, setNewCommentText] = useState('')
    const [pendingPosition, setPendingPosition] = useState(null)

    // Listen for click to add comment
    useEffect(() => {
        if (isCommenting) {
            const handleClick = (e) => {
                // Check if click is on the canvas (not on existing comments)
                if (e.target.closest('.comment-marker') || e.target.closest('.comment-input-popup')) {
                    return
                }

                if (reactFlowInstance) {
                    const bounds = document.querySelector('.flow-canvas-wrapper')?.getBoundingClientRect()
                    if (bounds) {
                        const position = reactFlowInstance.screenToFlowPosition({
                            x: e.clientX - bounds.left,
                            y: e.clientY - bounds.top,
                        })
                        setPendingPosition(position)
                    }
                }
            }

            document.addEventListener('click', handleClick)
            return () => document.removeEventListener('click', handleClick)
        }
    }, [isCommenting, reactFlowInstance])

    const handleSubmitComment = () => {
        if (newCommentText.trim() && pendingPosition) {
            onAddComment(pendingPosition, newCommentText.trim())
            setNewCommentText('')
            setPendingPosition(null)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmitComment()
        }
        if (e.key === 'Escape') {
            setPendingPosition(null)
            setNewCommentText('')
        }
    }

    const getScreenPosition = (flowPosition) => {
        if (!reactFlowInstance) return { x: 0, y: 0 }
        const pos = reactFlowInstance.flowToScreenPosition(flowPosition)
        return pos
    }

    return (
        <div className="comment-overlay">
            {/* Existing comments */}
            {comments.map((comment) => {
                const screenPos = getScreenPosition(comment.position)
                return (
                    <div
                        key={comment.id}
                        className="comment-marker"
                        style={{
                            left: screenPos.x,
                            top: screenPos.y,
                        }}
                        onClick={() => setActiveComment(activeComment === comment.id ? null : comment.id)}
                    >
                        <div className="comment-avatar">
                            {comment.author.charAt(0).toUpperCase()}
                        </div>

                        {activeComment === comment.id && (
                            <div className="comment-popup">
                                <div className="comment-header">
                                    <span className="comment-author">{comment.author}</span>
                                    <button
                                        className="comment-delete"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onDeleteComment(comment.id)
                                        }}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                                <p className="comment-text">{comment.text}</p>
                                <span className="comment-time">
                                    {new Date(comment.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                        )}
                    </div>
                )
            })}

            {/* New comment input */}
            {pendingPosition && (
                <div
                    className="comment-input-popup"
                    style={{
                        left: getScreenPosition(pendingPosition).x,
                        top: getScreenPosition(pendingPosition).y,
                    }}
                >
                    <div className="comment-input-container">
                        <textarea
                            className="comment-input"
                            placeholder="Add a comment..."
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoFocus
                        />
                        <div className="comment-input-actions">
                            <button
                                className="comment-cancel"
                                onClick={() => {
                                    setPendingPosition(null)
                                    setNewCommentText('')
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="comment-submit"
                                onClick={handleSubmitComment}
                                disabled={!newCommentText.trim()}
                            >
                                <Send size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CommentOverlay

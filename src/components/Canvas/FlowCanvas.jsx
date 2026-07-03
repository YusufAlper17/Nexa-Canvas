import { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import ReactFlow, {
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    ConnectionMode,
} from 'reactflow'
import 'reactflow/dist/style.css'

import TextNode from './nodes/TextNode'
import ImageNode from './nodes/ImageNode'
import VideoNode from './nodes/VideoNode'
import CommentOverlay from './CommentOverlay'
import EmptyCanvas from './EmptyCanvas'
import FullscreenModal from '../Modal/FullscreenModal'

import './FlowCanvas.css'

const nodeTypes = {
    textNode: TextNode,
    imageNode: ImageNode,
    videoNode: VideoNode,
}

const defaultEdgeOptions = {
    type: 'smoothstep',
    style: {
        stroke: 'rgba(255, 255, 255, 0.25)',
        strokeWidth: 3
    },
    animated: false,
    pathOptions: { borderRadius: 20 },
}

// Initial nodes with example positions
const initialNodes = [
    {
        id: 'node-1',
        type: 'textNode',
        position: { x: 100, y: 200 },
        data: {
            label: 'Arabadaki Kediler',
            placeholder: 'Try "A script about cats in a car"',
            model: 'Claude Opus 4.5'
        },
    },
]

const initialEdges = []
const CANVAS_STORAGE_KEY = 'nexa-canvas-state'

const loadCanvasState = () => {
    if (typeof window === 'undefined') {
        return { nodes: initialNodes, edges: initialEdges, comments: [] }
    }

    try {
        const stored = window.localStorage.getItem(CANVAS_STORAGE_KEY)
        if (!stored) {
            return { nodes: initialNodes, edges: initialEdges, comments: [] }
        }

        const parsed = JSON.parse(stored)
        return {
            nodes: Array.isArray(parsed.nodes) ? parsed.nodes : initialNodes,
            edges: Array.isArray(parsed.edges) ? parsed.edges : initialEdges,
            comments: Array.isArray(parsed.comments) ? parsed.comments : [],
        }
    } catch {
        return { nodes: initialNodes, edges: initialEdges, comments: [] }
    }
}

function FlowCanvas() {
    const reactFlowWrapper = useRef(null)
    const savedState = useMemo(() => loadCanvasState(), [])
    const [nodes, setNodes, onNodesChange] = useNodesState(savedState.nodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(savedState.edges)
    const [reactFlowInstance, setReactFlowInstance] = useState(null)
    const [comments, setComments] = useState(savedState.comments)
    const [isCommenting, setIsCommenting] = useState(false)

    // Fullscreen modal state
    const [fullscreenContent, setFullscreenContent] = useState(null)
    const [fullscreenType, setFullscreenType] = useState(null)
    const [isFullscreenOpen, setIsFullscreenOpen] = useState(false)

    // Expose fullscreen opener to window for nodes to use
    useEffect(() => {
        window.openFullscreen = (content, type) => {
            setFullscreenContent(content)
            setFullscreenType(type)
            setIsFullscreenOpen(true)
        }
        return () => {
            delete window.openFullscreen
        }
    }, [])

    useEffect(() => {
        window.localStorage.setItem(CANVAS_STORAGE_KEY, JSON.stringify({ nodes, edges, comments }))
    }, [nodes, edges, comments])

    const onConnect = useCallback(
        (params) => {
            const newEdge = {
                ...params,
                type: 'smoothstep',
                style: { stroke: 'rgba(255, 255, 255, 0.25)', strokeWidth: 3 },
                pathOptions: { borderRadius: 20 },
            }
            setEdges((eds) => addEdge(newEdge, eds))
        },
        [setEdges]
    )

    const onInit = useCallback((instance) => {
        setReactFlowInstance(instance)
    }, [])

    // Add node from toolbar
    const addNode = useCallback((type = 'textNode') => {
        const placeholders = {
            textNode: 'Try "A script for a tense negotiation in a futuristic setting"',
            imageNode: 'Try "A charming illustration of a small town"',
            videoNode: 'Try "A visual diary of a day in the life of a chef"',
        }

        const labels = {
            textNode: 'Text',
            imageNode: 'Image',
            videoNode: 'Video',
        }

        const models = {
            textNode: 'Claude Opus 4.5',
            imageNode: 'Flux 2',
            videoNode: 'Veo 3.1 (Fast)',
        }

        const newNode = {
            id: `node-${Date.now()}`,
            type,
            position: { x: Math.random() * 400 + 200, y: Math.random() * 300 + 150 },
            data: {
                label: labels[type],
                placeholder: placeholders[type],
                model: models[type],
            },
        }
        setNodes((nds) => [...nds, newNode])
    }, [setNodes])

    // Add comment
    const addComment = useCallback((position, text) => {
        const newComment = {
            id: `comment-${Date.now()}`,
            position,
            text,
            author: 'You',
            timestamp: new Date().toISOString(),
        }
        setComments((prev) => [...prev, newComment])
        setIsCommenting(false)
    }, [])

    // Delete comment
    const deleteComment = useCallback((commentId) => {
        setComments((prev) => prev.filter((c) => c.id !== commentId))
    }, [])

    // Expose functions to window for toolbar access
    useEffect(() => {
        window.addFlowNode = addNode
        window.toggleCommenting = () => setIsCommenting(prev => !prev)
        window.isCommenting = isCommenting

        return () => {
            delete window.addFlowNode
            delete window.toggleCommenting
            delete window.isCommenting
        }
    }, [addNode, isCommenting])

    return (
        <div className="flow-canvas-wrapper" ref={reactFlowWrapper}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={onInit}
                nodeTypes={nodeTypes}
                defaultEdgeOptions={defaultEdgeOptions}
                connectionMode={ConnectionMode.Loose}
                fitView={false}
                defaultViewport={{ x: 0, y: 0, zoom: 0.75 }}
                minZoom={0.1}
                maxZoom={2}
                proOptions={{ hideAttribution: true }}
                deleteKeyCode={['Backspace', 'Delete']}
                selectionKeyCode={['Shift']}
                multiSelectionKeyCode={['Meta', 'Control']}
            >
                <Background
                    variant="dots"
                    gap={24}
                    size={0.75}
                    color="#888888"
                />
            </ReactFlow>

            {/* Comments Overlay */}
            <CommentOverlay
                comments={comments}
                onDeleteComment={deleteComment}
                onAddComment={addComment}
                isCommenting={isCommenting}
                reactFlowInstance={reactFlowInstance}
            />

            {nodes.length === 0 && !isCommenting && <EmptyCanvas onAddNode={addNode} />}

            {isCommenting && (
                <div className="commenting-hint">
                    Click anywhere to add a comment
                </div>
            )}

            {/* Fullscreen Modal */}
            <FullscreenModal
                isOpen={isFullscreenOpen}
                onClose={() => setIsFullscreenOpen(false)}
                content={fullscreenContent}
                type={fullscreenType}
            />
        </div>
    )
}

export default FlowCanvas

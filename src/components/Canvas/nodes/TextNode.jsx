import { useState, useCallback, memo } from 'react'
import { Handle, Position, useReactFlow } from 'reactflow'
import {
    Info,
    CirclePlus,
    Loader2,
    Type
} from 'lucide-react'
import ModelSelector from '../../Selectors/ModelSelector'
import { generateSeed } from '../../../data/mockData'
import { generateText } from '../../../services/generationService'
import { completeGenerationTask, createGenerationTask, failGenerationTask } from '../../../services/generationQueue'
import './NodeStyles.css'

function TextNode({ id, data, selected }) {
    const { setNodes, getNode, getEdges } = useReactFlow()

    const [prompt, setPrompt] = useState('')
    const [selectedModel, setSelectedModel] = useState({
        id: 'claude-opus-4.5',
        name: 'Claude Opus 4.5',
        credits: 10,
        time: '25s'
    })
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedContent, setGeneratedContent] = useState(data.generatedContent || null)
    const [errorMessage, setErrorMessage] = useState('')

    const getConnectedInput = useCallback(() => {
        const edges = getEdges()
        const incomingEdge = edges.find(e => e.target === id)
        if (incomingEdge) {
            const sourceNode = getNode(incomingEdge.source)
            return sourceNode?.data?.generatedContent
        }
        return null
    }, [getEdges, getNode, id])

    const connectedInput = getConnectedInput()

    const handleGenerate = async () => {
        const effectivePrompt = prompt || data.placeholder || data.label || ''
        const taskId = createGenerationTask({ type: 'text', label: effectivePrompt || 'Text generation' })
        setIsGenerating(true)
        setErrorMessage('')

        try {
            const result = await generateText({
                prompt: effectivePrompt,
                connectedInput,
                selectedModel,
            })
            const content = {
                ...result,
                prompt: result.prompt || effectivePrompt || connectedInput?.content || 'Generated text',
                seed: generateSeed()
            }
            setGeneratedContent(content)

            setNodes(nodes => nodes.map(node => {
                if (node.id === id) {
                    return { ...node, data: { ...node.data, generatedContent: content } }
                }
                return node
            }))
            completeGenerationTask(taskId, content.title)
        } catch (error) {
            const message = error?.message || 'Text generation failed.'
            setErrorMessage(message)
            failGenerationTask(taskId, message)
        } finally {
            setIsGenerating(false)
        }
    }

    const handleContentClick = () => {
        if (generatedContent && window.openFullscreen) {
            window.openFullscreen(generatedContent, 'text')
        }
    }

    return (
        <div className={`canvas-node ${selected ? 'selected' : ''}`} data-id="text-block">
            {/* Node Header Toolbar with Generate Button */}
            <div className="node-header-toolbar">
                <div className="toolbar-left">
                    <ModelSelector
                        selectedModel={selectedModel}
                        onModelSelect={setSelectedModel}
                        nodeType="textNode"
                        compact
                    />
                </div>

                <div className="toolbar-right">
                    <span className="model-provider">{selectedModel.name}</span>
                </div>
            </div>

            {/* Node Label */}
            <div className="node-label-header">
                <div className="node-label-left">
                    <Type size={12} />
                    <span className="node-type-name">{data.label || 'Text'}</span>
                </div>
                <div className="node-label-right">
                    {connectedInput && (
                        <span className="connected-badge">Input connected</span>
                    )}
                </div>
            </div>

            {/* Main Node Container */}
            <div className="canvas-node-container">
                <div className="node-info-hint">
                    <Info size={14} />
                    <span>Learn about Text Blocks</span>
                </div>

                <hr className="node-divider" />

                {/* Content area */}
                <div className="node-content-area" onClick={handleContentClick}>
                    {generatedContent ? (
                        <div className="generated-text-content">
                            <h4 className="content-title">{generatedContent.title}</h4>
                            <p className="content-text">{generatedContent.content}</p>
                        </div>
                    ) : connectedInput ? (
                        <div className="connected-input-preview">
                            {connectedInput.url && (
                                <img src={connectedInput.thumbnail || connectedInput.url} alt="Input" className="input-thumbnail" />
                            )}
                            <p className="input-hint">Using connected input as context</p>
                        </div>
                    ) : null}
                    {errorMessage && (
                        <div className="generation-error">
                            {errorMessage}
                        </div>
                    )}
                </div>

                {/* Bottom prompt area with Generate button */}
                <div className="node-prompt-section">
                    <div className="prompt-input-wrapper">
                        {!prompt && !generatedContent && (
                            <span className="animated-placeholder">
                                {data.placeholder || 'Try "A script for a tense negotiation in a futuristic setting"'}
                            </span>
                        )}
                        <textarea
                            className="prompt-textarea"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows={1}
                        />
                    </div>
                    <button
                        className={`generate-button-inline ${isGenerating ? 'generating' : ''}`}
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        title="Generate"
                    >
                        {isGenerating ? (
                            <Loader2 size={18} className="spin" />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="m16 12-4-4-4 4"></path>
                                <path d="M12 16V8"></path>
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Handles with CirclePlus icons */}
            <Handle
                type="target"
                position={Position.Left}
                id={`${id}-target`}
                className="canvas-handle canvas-handle-target"
            >
                <div className="handle-icon">
                    <CirclePlus size={24} />
                </div>
            </Handle>

            <Handle
                type="source"
                position={Position.Right}
                id={`${id}-source`}
                className="canvas-handle canvas-handle-source"
            >
                <div className="handle-icon">
                    <CirclePlus size={24} />
                </div>
            </Handle>
        </div>
    )
}

export default memo(TextNode)

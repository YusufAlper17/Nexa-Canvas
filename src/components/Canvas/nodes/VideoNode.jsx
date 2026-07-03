import { useState, useCallback, memo, useRef, useEffect } from 'react'
import { Handle, Position, useReactFlow } from 'reactflow'
import {
    Info,
    ChevronDown,
    Brush,
    Settings2,
    Play,
    Loader2,
    CirclePlus
} from 'lucide-react'
import ModelSelector from '../../Selectors/ModelSelector'
import { aspectRatios, stylePresets } from '../../../data/models'
import { generateSeed } from '../../../data/mockData'
import { generateVideo } from '../../../services/generationService'
import { completeGenerationTask, createGenerationTask, failGenerationTask } from '../../../services/generationQueue'
import './NodeStyles.css'

function VideoNode({ id, data, selected }) {
    const { setNodes, getNode, getEdges } = useReactFlow()

    const [prompt, setPrompt] = useState('')
    const [selectedModel, setSelectedModel] = useState({
        id: 'veo-3.1-fast',
        name: 'Veo 3.1 (Fast)',
        credits: 18,
        time: '2m'
    })
    const [aspectRatio, setAspectRatio] = useState('16:9')
    const [selectedStyle, setSelectedStyle] = useState(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedContent, setGeneratedContent] = useState(data.generatedContent || null)
    const [errorMessage, setErrorMessage] = useState('')
    const [showAspectDropdown, setShowAspectDropdown] = useState(false)
    const [showStyleDropdown, setShowStyleDropdown] = useState(false)

    const aspectRef = useRef(null)
    const styleRef = useRef(null)
    const fileInputRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (aspectRef.current && !aspectRef.current.contains(e.target)) setShowAspectDropdown(false)
            if (styleRef.current && !styleRef.current.contains(e.target)) setShowStyleDropdown(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const getNodeDimensions = () => {
        switch (aspectRatio) {
            case '9:16': return { width: 280, contentHeight: 340 }
            case '1:1': return { width: 340, contentHeight: 240 }
            default: return { width: 420, contentHeight: 200 }
        }
    }

    const dimensions = getNodeDimensions()

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
        const taskId = createGenerationTask({ type: 'video', label: effectivePrompt || 'Video generation' })
        setIsGenerating(true)
        setErrorMessage('')
        try {
            const result = await generateVideo({
                prompt: effectivePrompt,
                connectedInput,
                selectedModel,
                aspectRatio,
                style: selectedStyle,
            })
            const content = { ...result, prompt: result.prompt || effectivePrompt || 'Generated video', seed: generateSeed() }
            setGeneratedContent(content)
            setNodes(nodes => nodes.map(node =>
                node.id === id ? { ...node, data: { ...node.data, generatedContent: content } } : node
            ))
            completeGenerationTask(taskId, content.title)
        } catch (error) {
            const message = error?.message || 'Video generation failed.'
            setErrorMessage(message)
            failGenerationTask(taskId, message)
        } finally {
            setIsGenerating(false)
        }
    }

    const handleContentClick = () => {
        if (generatedContent && window.openFullscreen) {
            window.openFullscreen(generatedContent, 'video')
        } else {
            fileInputRef.current?.click()
        }
    }

    const handleVideoFile = (file) => {
        if (!file || !file.type.startsWith('video/')) return

        const reader = new FileReader()
        reader.onload = () => {
            const content = {
                id: `uploaded-video-${Date.now()}`,
                title: file.name,
                url: reader.result,
                thumbnail: '',
                model: 'Uploaded file',
                duration: '',
                prompt: file.name,
                seed: generateSeed(),
            }

            setGeneratedContent(content)
            setErrorMessage('')
            setNodes(nodes => nodes.map(node =>
                node.id === id ? { ...node, data: { ...node.data, generatedContent: content } } : node
            ))
        }
        reader.readAsDataURL(file)
    }

    const handleDrop = (event) => {
        event.preventDefault()
        handleVideoFile(event.dataTransfer.files?.[0])
    }

    return (
        <div className={`canvas-node canvas-node-video-type ${selected ? 'selected' : ''}`} style={{ width: dimensions.width }}>
            {/* Header */}
            <div className="node-header-toolbar">
                <div className="toolbar-left">
                    <ModelSelector selectedModel={selectedModel} onModelSelect={setSelectedModel} nodeType="videoNode" compact />

                    <div className="aspect-selector" ref={aspectRef}>
                        <button className="aspect-trigger" onClick={() => setShowAspectDropdown(!showAspectDropdown)}>
                            <span>{aspectRatio}</span>
                            <ChevronDown size={12} />
                        </button>
                        {showAspectDropdown && (
                            <div className="aspect-dropdown">
                                {Object.entries(aspectRatios).map(([key, options]) => (
                                    <div className="aspect-section" key={key}>
                                        <span className="aspect-section-title">{key.toUpperCase()}</span>
                                        {options.map(ar => (
                                            <button key={ar.id} className={`aspect-option ${aspectRatio === ar.id ? 'selected' : ''}`}
                                                onClick={() => { setAspectRatio(ar.id); setShowAspectDropdown(false); }}>
                                                <span className="aspect-icon">{ar.icon}</span>
                                                <span>{ar.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="style-selector" ref={styleRef}>
                        <button className="style-trigger" onClick={() => setShowStyleDropdown(!showStyleDropdown)}>
                            <Brush size={14} />
                        </button>
                        {showStyleDropdown && (
                            <div className="style-dropdown">
                                <div className="style-options">
                                    {stylePresets.map(style => (
                                        <button key={style.id} className={`style-option ${selectedStyle === style.id ? 'selected' : ''}`}
                                            onClick={() => { setSelectedStyle(style.id); setShowStyleDropdown(false); }}>
                                            {style.icon && <span className="style-icon">{style.icon}</span>}
                                            <span>{style.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <button className="toolbar-icon-btn"><Settings2 size={14} /></button>
                </div>
                <div className="toolbar-right">
                    <span className="model-provider">{selectedModel.name}</span>
                </div>
            </div>

            {/* Label */}
            <div className="node-label-header">
                <div className="node-label-left">
                    <Play size={12} fill="currentColor" />
                    <span className="node-type-name">Video</span>
                </div>
                {connectedInput && <span className="connected-badge">Connected</span>}
            </div>

            {/* Container */}
            <div className="canvas-node-container canvas-node-video">
                <div className="node-info-hint">
                    <Info size={14} />
                    <span>Learn about Video Blocks</span>
                </div>
                <hr className="node-divider" />

                <div
                    className="node-video-area"
                    onClick={handleContentClick}
                    onDrop={handleDrop}
                    onDragOver={(event) => event.preventDefault()}
                    style={{ height: dimensions.contentHeight }}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        className="node-file-input"
                        onChange={(event) => handleVideoFile(event.target.files?.[0])}
                    />
                    {generatedContent ? (
                        <div className="video-preview">
                            <video src={generatedContent.url} poster={generatedContent.thumbnail} muted loop
                                onMouseEnter={(e) => e.target.play()} onMouseLeave={(e) => e.target.pause()} />
                            <div className="duration-badge">1.00</div>
                        </div>
                    ) : (
                        <div className="video-placeholder">
                            <Play size={32} />
                        </div>
                    )}
                    {errorMessage && (
                        <div className="generation-error overlay">
                            {errorMessage}
                        </div>
                    )}
                </div>

                {/* Prompt with inline generate */}
                <div className="node-prompt-section">
                    <div className="prompt-input-wrapper">
                        {!prompt && <span className="animated-placeholder">{data.placeholder || 'Try "A visual diary"'}</span>}
                        <textarea className="prompt-textarea" value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={1} />
                    </div>
                    <button className={`generate-button-inline ${isGenerating ? 'generating' : ''}`} onClick={handleGenerate} disabled={isGenerating}>
                        {isGenerating ? <Loader2 size={18} className="spin" /> : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="m16 12-4-4-4 4"></path>
                                <path d="M12 16V8"></path>
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Handles with CirclePlus icons */}
            <Handle type="target" position={Position.Left} id={`${id}-target`} className="canvas-handle canvas-handle-target">
                <div className="handle-icon"><CirclePlus size={24} /></div>
            </Handle>
            <Handle type="source" position={Position.Right} id={`${id}-source`} className="canvas-handle canvas-handle-source">
                <div className="handle-icon"><CirclePlus size={24} /></div>
            </Handle>
        </div>
    )
}

export default memo(VideoNode)

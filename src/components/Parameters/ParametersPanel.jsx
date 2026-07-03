import { useState } from 'react'
import {
    CircleArrowUp,
    ChevronDown,
    RefreshCw
} from 'lucide-react'
import { getModelsByType, resolutions, durations } from '../../data/models'
import { generateSeed } from '../../data/mockData'
import './ParametersPanel.css'

function ParametersPanel() {
    const [isGenerateOpen, setIsGenerateOpen] = useState(true)
    const [selectedModel, setSelectedModel] = useState('Veo 3.1 (Fast)')
    const [aspectRatio, setAspectRatio] = useState('Landscape (16:9)')
    const [resolution, setResolution] = useState('720p')
    const [duration, setDuration] = useState('6 seconds')
    const [fixedCamera, setFixedCamera] = useState(false)
    const [seed, setSeed] = useState(generateSeed())

    const [showModelDropdown, setShowModelDropdown] = useState(false)
    const [showAspectDropdown, setShowAspectDropdown] = useState(false)
    const [showResolutionDropdown, setShowResolutionDropdown] = useState(false)
    const [showDurationDropdown, setShowDurationDropdown] = useState(false)

    const videoModels = getModelsByType('video')

    const aspectOptions = [
        'Landscape (16:9)',
        'Portrait (9:16)',
        'Square (1:1)',
        'Widescreen (21:9)'
    ]

    const handleRefreshSeed = () => {
        setSeed(generateSeed())
    }

    return (
        <aside className="parameters-sidebar">
            {/* Header with Share Button */}
            <div className="sidebar-top-actions">
                <button className="share-btn">Share</button>
            </div>

            {/* Scrollable Content */}
            <div className="sidebar-scroll-content">
                <div className="sidebar-container">

                    {/* Generate Accordion */}
                    <div className="parameter-accordion">
                        <button
                            className={`accordion-header ${isGenerateOpen ? 'open' : ''}`}
                            onClick={() => setIsGenerateOpen(!isGenerateOpen)}
                        >
                            <div className="header-left">
                                <CircleArrowUp size={14} />
                                <span>Generate</span>
                            </div>
                            <ChevronDown
                                size={14}
                                className={`accordion-chevron ${isGenerateOpen ? 'open' : ''}`}
                            />
                        </button>

                        {isGenerateOpen && (
                            <div className="accordion-content">
                                {/* Model Selector */}
                                <div className="param-row">
                                    <div className="param-selector" onClick={() => setShowModelDropdown(!showModelDropdown)}>
                                        <span className="param-value">{selectedModel}</span>
                                        <ChevronDown size={14} />
                                    </div>
                                    {showModelDropdown && (
                                        <div className="param-dropdown">
                                            {videoModels.map(provider => (
                                                <div key={provider.providerId} className="provider-section">
                                                    <span className="provider-label">{provider.providerName}</span>
                                                    {provider.models.map(model => (
                                                        <button
                                                            key={model.id}
                                                            className={`dropdown-option ${selectedModel === model.name ? 'selected' : ''}`}
                                                            onClick={() => { setSelectedModel(model.name); setShowModelDropdown(false); }}
                                                        >
                                                            {model.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Aspect Ratio */}
                                <div className="param-row">
                                    <label>Aspect Ratio</label>
                                    <div className="param-selector small" onClick={() => setShowAspectDropdown(!showAspectDropdown)}>
                                        <span>{aspectRatio}</span>
                                        <ChevronDown size={12} />
                                    </div>
                                    {showAspectDropdown && (
                                        <div className="param-dropdown right">
                                            {aspectOptions.map(opt => (
                                                <button
                                                    key={opt}
                                                    className={`dropdown-option ${aspectRatio === opt ? 'selected' : ''}`}
                                                    onClick={() => { setAspectRatio(opt); setShowAspectDropdown(false); }}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Resolution */}
                                <div className="param-row">
                                    <label>Resolution</label>
                                    <div className="param-selector small" onClick={() => setShowResolutionDropdown(!showResolutionDropdown)}>
                                        <span>{resolution}</span>
                                        <ChevronDown size={12} />
                                    </div>
                                    {showResolutionDropdown && (
                                        <div className="param-dropdown right">
                                            {resolutions.map(res => (
                                                <button
                                                    key={res.id}
                                                    className={`dropdown-option ${resolution === res.label ? 'selected' : ''}`}
                                                    onClick={() => { setResolution(res.label); setShowResolutionDropdown(false); }}
                                                >
                                                    {res.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Duration */}
                                <div className="param-row">
                                    <label>Duration</label>
                                    <div className="param-selector small" onClick={() => setShowDurationDropdown(!showDurationDropdown)}>
                                        <span>{duration}</span>
                                        <ChevronDown size={12} />
                                    </div>
                                    {showDurationDropdown && (
                                        <div className="param-dropdown right">
                                            {durations.map(dur => (
                                                <button
                                                    key={dur.id}
                                                    className={`dropdown-option ${duration === dur.label ? 'selected' : ''}`}
                                                    onClick={() => { setDuration(dur.label); setShowDurationDropdown(false); }}
                                                >
                                                    {dur.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Fixed Camera */}
                                <div className="param-row">
                                    <label>Fixed Camera</label>
                                    <div className="param-toggle-wrapper">
                                        <button
                                            className={`param-toggle ${fixedCamera ? 'on' : ''}`}
                                            onClick={() => setFixedCamera(!fixedCamera)}
                                        >
                                            <span className="toggle-knob" />
                                        </button>
                                        <span className="toggle-label">{fixedCamera ? 'Yes' : 'No'}</span>
                                    </div>
                                </div>

                                {/* Seed */}
                                <div className="param-row">
                                    <label>Seed</label>
                                    <div className="seed-input-wrapper">
                                        <input
                                            type="text"
                                            value={seed}
                                            onChange={(e) => setSeed(e.target.value)}
                                            className="seed-input"
                                        />
                                        <button className="refresh-seed-btn" onClick={handleRefreshSeed}>
                                            <RefreshCw size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </aside>
    )
}

export default ParametersPanel

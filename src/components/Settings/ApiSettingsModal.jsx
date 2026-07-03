import { useState } from 'react'
import { X, KeyRound, Save } from 'lucide-react'
import { getApiSettings, saveApiSettings } from '../../services/apiSettings'
import './ApiSettingsModal.css'

function ApiSettingsModal({ isOpen, onClose }) {
    const [settings, setSettings] = useState(() => getApiSettings())
    const [saved, setSaved] = useState(false)

    if (!isOpen) return null

    const updateSetting = (key, value) => {
        setSettings((current) => ({ ...current, [key]: value }))
        setSaved(false)
    }

    const handleSave = () => {
        saveApiSettings(settings)
        setSaved(true)
    }

    return (
        <div className="api-settings-overlay" onClick={onClose}>
            <section className="api-settings-modal" onClick={(event) => event.stopPropagation()}>
                <header className="api-settings-header">
                    <div>
                        <div className="api-settings-title">
                            <KeyRound size={18} />
                            <h2>API Settings</h2>
                        </div>
                        <p>Bring your own keys. Values are stored only in this browser.</p>
                    </div>
                    <button className="api-settings-close" onClick={onClose} aria-label="Close API settings">
                        <X size={18} />
                    </button>
                </header>

                <div className="api-settings-content">
                    <div className="api-settings-section">
                        <h3>OpenAI-Compatible Provider</h3>
                        <p>Used for text and image generation. Works with OpenAI-compatible chat and image endpoints.</p>

                        <label>
                            API Key
                            <input
                                type="password"
                                placeholder="sk-..."
                                value={settings.openaiApiKey}
                                onChange={(event) => updateSetting('openaiApiKey', event.target.value)}
                            />
                        </label>

                        <label>
                            Base URL
                            <input
                                type="url"
                                value={settings.openaiBaseUrl}
                                onChange={(event) => updateSetting('openaiBaseUrl', event.target.value)}
                            />
                        </label>

                        <div className="api-settings-grid">
                            <label>
                                Text Model
                                <input
                                    type="text"
                                    value={settings.openaiTextModel}
                                    onChange={(event) => updateSetting('openaiTextModel', event.target.value)}
                                />
                            </label>
                            <label>
                                Image Model
                                <input
                                    type="text"
                                    value={settings.openaiImageModel}
                                    onChange={(event) => updateSetting('openaiImageModel', event.target.value)}
                                />
                            </label>
                            <label>
                                Image Size
                                <select
                                    value={settings.openaiImageSize}
                                    onChange={(event) => updateSetting('openaiImageSize', event.target.value)}
                                >
                                    <option value="1024x1024">1024x1024</option>
                                    <option value="1024x1792">1024x1792</option>
                                    <option value="1792x1024">1792x1024</option>
                                </select>
                            </label>
                        </div>
                    </div>

                    <div className="api-settings-section">
                        <h3>Custom Endpoints</h3>
                        <p>Optional POST endpoints for providers that expose your own gateway or serverless proxy.</p>

                        <label>
                            Custom API Key
                            <input
                                type="password"
                                placeholder="Optional bearer/x-api-key value"
                                value={settings.customApiKey}
                                onChange={(event) => updateSetting('customApiKey', event.target.value)}
                            />
                        </label>

                        <label>
                            Text Endpoint
                            <input
                                type="url"
                                placeholder="https://your-api.example.com/text"
                                value={settings.customTextEndpoint}
                                onChange={(event) => updateSetting('customTextEndpoint', event.target.value)}
                            />
                        </label>

                        <label>
                            Image Endpoint
                            <input
                                type="url"
                                placeholder="https://your-api.example.com/image"
                                value={settings.customImageEndpoint}
                                onChange={(event) => updateSetting('customImageEndpoint', event.target.value)}
                            />
                        </label>

                        <label>
                            Video Endpoint
                            <input
                                type="url"
                                placeholder="https://your-api.example.com/video"
                                value={settings.customVideoEndpoint}
                                onChange={(event) => updateSetting('customVideoEndpoint', event.target.value)}
                            />
                        </label>

                        <label>
                            Video Model
                            <input
                                type="text"
                                placeholder="veo, kling, runway, replicate-version..."
                                value={settings.customVideoModel}
                                onChange={(event) => updateSetting('customVideoModel', event.target.value)}
                            />
                        </label>
                    </div>
                </div>

                <footer className="api-settings-footer">
                    <span>{saved ? 'Settings saved.' : 'No secrets are committed to the repo.'}</span>
                    <button className="api-settings-save" onClick={handleSave}>
                        <Save size={16} />
                        Save Settings
                    </button>
                </footer>
            </section>
        </div>
    )
}

export default ApiSettingsModal

import { useEffect, useState } from 'react'
import { KeyRound } from 'lucide-react'
import { hasAnyApiConfigured } from '../../services/apiSettings'
import './CreditsIndicator.css'

function CreditsIndicator({ onOpenApiSettings }) {
    const [configured, setConfigured] = useState(false)

    useEffect(() => {
        const refresh = () => setConfigured(hasAnyApiConfigured())
        refresh()

        window.addEventListener('storage', refresh)
        window.addEventListener('focus', refresh)
        window.addEventListener('nexa-api-settings-changed', refresh)
        return () => {
            window.removeEventListener('storage', refresh)
            window.removeEventListener('focus', refresh)
            window.removeEventListener('nexa-api-settings-changed', refresh)
        }
    }, [])

    return (
        <div className="credits-indicator">
            <button className="credits-btn" onClick={onOpenApiSettings}>
                <KeyRound size={12} className="credits-icon" />
                <span className={`credits-value ${configured ? 'ready' : 'missing'}`}>
                    {configured ? 'API Ready' : 'Add API Key'}
                </span>
            </button>
        </div>
    )
}

export default CreditsIndicator

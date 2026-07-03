const STORAGE_KEY = 'nexa-canvas-api-settings'

export const defaultApiSettings = {
    openaiApiKey: '',
    openaiBaseUrl: 'https://api.openai.com/v1',
    openaiTextModel: 'gpt-4o-mini',
    openaiImageModel: 'dall-e-3',
    openaiImageSize: '1024x1024',
    customApiKey: '',
    customTextEndpoint: '',
    customImageEndpoint: '',
    customVideoEndpoint: '',
    customVideoModel: '',
}

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage)

export const getApiSettings = () => {
    if (!canUseStorage()) return { ...defaultApiSettings }

    try {
        const stored = window.localStorage.getItem(STORAGE_KEY)
        if (!stored) return { ...defaultApiSettings }
        return { ...defaultApiSettings, ...JSON.parse(stored) }
    } catch {
        return { ...defaultApiSettings }
    }
}

export const saveApiSettings = (settings) => {
    if (!canUseStorage()) return
    const nextSettings = { ...defaultApiSettings, ...settings }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSettings))
    window.dispatchEvent(new Event('nexa-api-settings-changed'))
}

export const hasAnyApiConfigured = (settings = getApiSettings()) => {
    return Boolean(
        settings.openaiApiKey ||
        settings.customTextEndpoint ||
        settings.customImageEndpoint ||
        settings.customVideoEndpoint
    )
}

export const hasTextApiConfigured = (settings = getApiSettings()) => {
    return Boolean(settings.openaiApiKey || settings.customTextEndpoint)
}

export const hasImageApiConfigured = (settings = getApiSettings()) => {
    return Boolean(settings.openaiApiKey || settings.customImageEndpoint)
}

export const hasVideoApiConfigured = (settings = getApiSettings()) => {
    return Boolean(settings.customVideoEndpoint)
}

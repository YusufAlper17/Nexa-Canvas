import { getApiSettings } from './apiSettings'

export class GenerationError extends Error {
    constructor(message, details) {
        super(message)
        this.name = 'GenerationError'
        this.details = details
    }
}

const trimTrailingSlash = (value) => value.replace(/\/+$/, '')

const readResponseBody = async (response) => {
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
        return response.json()
    }
    return response.text()
}

const assertOk = async (response, fallbackMessage) => {
    if (response.ok) return

    const body = await readResponseBody(response)
    const message = body?.error?.message || body?.message || body || fallbackMessage
    throw new GenerationError(String(message), body)
}

const buildAuthHeaders = (apiKey) => {
    const headers = { 'Content-Type': 'application/json' }
    if (apiKey) {
        headers.Authorization = `Bearer ${apiKey}`
        headers['x-api-key'] = apiKey
    }
    return headers
}

const normalizeTextResult = (payload, prompt, model) => {
    const content =
        payload?.content ||
        payload?.text ||
        payload?.output_text ||
        payload?.choices?.[0]?.message?.content ||
        payload?.choices?.[0]?.text ||
        payload?.data?.content ||
        payload?.data?.text

    if (!content) {
        throw new GenerationError('The text API response did not include generated text.', payload)
    }

    return {
        id: `text-${Date.now()}`,
        title: prompt.slice(0, 48) || 'Generated Text',
        content,
        model,
        prompt,
    }
}

const normalizeImageResult = (payload, prompt, model) => {
    const image = payload?.data?.[0] || payload?.image || payload?.output?.[0] || payload
    const url = image?.url || image?.image_url || image?.src
    const b64 = image?.b64_json || image?.base64 || payload?.b64_json

    if (!url && !b64) {
        throw new GenerationError('The image API response did not include an image URL or base64 image.', payload)
    }

    const imageUrl = url || `data:image/png;base64,${b64}`

    return {
        id: `image-${Date.now()}`,
        title: prompt.slice(0, 48) || 'Generated Image',
        url: imageUrl,
        thumbnail: imageUrl,
        model,
        prompt,
    }
}

const normalizeVideoResult = (payload, prompt, model) => {
    const video = payload?.data?.[0] || payload?.video || payload?.output?.[0] || payload
    const url =
        video?.url ||
        video?.video_url ||
        video?.src ||
        (typeof video === 'string' ? video : null)

    if (!url) {
        throw new GenerationError('The video API response did not include a video URL.', payload)
    }

    return {
        id: `video-${Date.now()}`,
        title: prompt.slice(0, 48) || 'Generated Video',
        url,
        thumbnail: video?.thumbnail || video?.thumbnail_url || '',
        model,
        duration: video?.duration || payload?.duration || '',
        prompt,
    }
}

const callCustomEndpoint = async (endpoint, apiKey, body) => {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: buildAuthHeaders(apiKey),
        body: JSON.stringify(body),
    })

    await assertOk(response, 'Custom AI endpoint request failed.')
    return readResponseBody(response)
}

export const generateText = async ({ prompt, connectedInput, selectedModel }) => {
    const settings = getApiSettings()
    const effectivePrompt = prompt?.trim() || connectedInput?.content || connectedInput?.prompt || ''

    if (!effectivePrompt) {
        throw new GenerationError('Please enter a prompt or connect an input node.')
    }

    if (settings.customTextEndpoint) {
        const payload = await callCustomEndpoint(settings.customTextEndpoint, settings.customApiKey, {
            type: 'text',
            prompt: effectivePrompt,
            input: connectedInput,
            model: selectedModel?.name || settings.openaiTextModel,
        })
        return normalizeTextResult(payload, effectivePrompt, selectedModel?.name || 'Custom Text API')
    }

    if (!settings.openaiApiKey) {
        throw new GenerationError('Add an OpenAI-compatible API key in API Settings before generating text.')
    }

    const response = await fetch(`${trimTrailingSlash(settings.openaiBaseUrl)}/chat/completions`, {
        method: 'POST',
        headers: buildAuthHeaders(settings.openaiApiKey),
        body: JSON.stringify({
            model: settings.openaiTextModel,
            messages: [
                {
                    role: 'system',
                    content: 'You are a concise creative assistant for a node-based AI canvas. Return polished usable output only.',
                },
                {
                    role: 'user',
                    content: connectedInput
                        ? `${effectivePrompt}\n\nConnected input:\n${JSON.stringify(connectedInput, null, 2)}`
                        : effectivePrompt,
                },
            ],
            temperature: 0.8,
        }),
    })

    await assertOk(response, 'Text generation failed.')
    const payload = await response.json()
    return normalizeTextResult(payload, effectivePrompt, settings.openaiTextModel)
}

export const generateImage = async ({ prompt, connectedInput, selectedModel, aspectRatio, style }) => {
    const settings = getApiSettings()
    const effectivePrompt = [
        prompt?.trim() || connectedInput?.prompt || connectedInput?.content || '',
        style ? `Style: ${style}` : '',
        aspectRatio ? `Aspect ratio: ${aspectRatio}` : '',
    ].filter(Boolean).join('\n')

    if (!effectivePrompt) {
        throw new GenerationError('Please enter a prompt or connect an input node.')
    }

    if (settings.customImageEndpoint) {
        const payload = await callCustomEndpoint(settings.customImageEndpoint, settings.customApiKey, {
            type: 'image',
            prompt: effectivePrompt,
            input: connectedInput,
            model: selectedModel?.name || settings.openaiImageModel,
            aspectRatio,
            style,
        })
        return normalizeImageResult(payload, effectivePrompt, selectedModel?.name || 'Custom Image API')
    }

    if (!settings.openaiApiKey) {
        throw new GenerationError('Add an OpenAI-compatible API key in API Settings before generating images.')
    }

    const response = await fetch(`${trimTrailingSlash(settings.openaiBaseUrl)}/images/generations`, {
        method: 'POST',
        headers: buildAuthHeaders(settings.openaiApiKey),
        body: JSON.stringify({
            model: settings.openaiImageModel,
            prompt: effectivePrompt,
            n: 1,
            size: settings.openaiImageSize,
        }),
    })

    await assertOk(response, 'Image generation failed.')
    const payload = await response.json()
    return normalizeImageResult(payload, effectivePrompt, settings.openaiImageModel)
}

export const generateVideo = async ({ prompt, connectedInput, selectedModel, aspectRatio, style }) => {
    const settings = getApiSettings()
    const effectivePrompt = [
        prompt?.trim() || connectedInput?.prompt || connectedInput?.content || '',
        style ? `Style: ${style}` : '',
        aspectRatio ? `Aspect ratio: ${aspectRatio}` : '',
    ].filter(Boolean).join('\n')

    if (!effectivePrompt) {
        throw new GenerationError('Please enter a prompt or connect an input node.')
    }

    if (!settings.customVideoEndpoint) {
        throw new GenerationError('Add a custom video generation endpoint in API Settings before generating videos.')
    }

    const payload = await callCustomEndpoint(settings.customVideoEndpoint, settings.customApiKey, {
        type: 'video',
        prompt: effectivePrompt,
        input: connectedInput,
        model: settings.customVideoModel || selectedModel?.name,
        aspectRatio,
        style,
    })

    return normalizeVideoResult(payload, effectivePrompt, settings.customVideoModel || selectedModel?.name || 'Custom Video API')
}

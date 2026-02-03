import { createStorage } from 'unstorage'

export function defineTask<T = any>(task: any) {
    return task
}

export function definePlugin(plugin: any) {
    return plugin
}

export function defineEventHandler(handler: any) {
    return handler
}

export function useRuntimeConfig() {
    return {
        tokens: process.env.SKLAND_TOKENS || process.env.TOKENS || '',
        notificationUrls: process.env.SKLAND_NOTIFICATION_URLS || process.env.NOTIFICATION_URLS || '',
        maxRetries: process.env.SKLAND_MAX_RETRIES || process.env.MAX_RETRIES || '3',
        webhookUrl: process.env.SKLAND_WEBHOOK_URL || '',
        webhookBody: process.env.SKLAND_WEBHOOK_BODY || '{"msg_type":"text","content":{"text":"{message}"}}',
    }
}

let storage: any
export function useStorage() {
    if (!storage) {
        storage = createStorage()
    }
    return storage
}

export function toArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value]
}

export interface CreateMessageCollectorOptions {
  webhookUrl?: string
  webhookBody?: string
  onError?: () => void
}

export interface CollectOptions {
  output?: boolean // Whether to output to console (default: false)
  isError?: boolean // Whether this is an error message (default: false)
}

export interface MessageCollector {
  // Console only (不收集到通知)
  log: (message: string) => void
  error: (message: string) => void

  // Notification only (不输出到控制台)
  notify: (message: string) => void
  notifyError: (message: string) => void

  // Console + Notification (同时输出和收集)
  info: (message: string) => void
  infoError: (message: string) => void

  // Utility
  push: () => Promise<void>
  hasError: () => boolean

  /** @deprecated Use notify(), info(), or notifyError() instead */
  collect: (message: string, options?: CollectOptions) => void
}

export function createMessageCollector(options: CreateMessageCollectorOptions): MessageCollector {
  const messages: string[] = []
  let hasError = false

  const log = (message: string) => {
    console.log(message)
  }

  const error = (message: string) => {
    console.error(message)
    hasError = true
  }

  // Notification only methods
  const notify = (message: string) => {
    messages.push(message)
  }

  const notifyError = (message: string) => {
    messages.push(message)
    hasError = true
  }

  // Combined methods (Console + Notification)
  const info = (message: string) => {
    console.log(message)
    messages.push(message)
  }

  const infoError = (message: string) => {
    console.error(message)
    messages.push(message)
    hasError = true
  }

  /** @deprecated Use notify(), info(), or notifyError() instead */
  const collect = (message: string, opts: CollectOptions = {}) => {
    const { output = false, isError = false } = opts
    messages.push(message)
    if (output) {
      console[isError ? 'error' : 'log'](message)
    }
    if (isError) {
      hasError = true
    }
  }

  const push = async () => {
    const content = messages.join('\n\n')
    const webhookUrl = options.webhookUrl
    const webhookBodyTemplate = options.webhookBody || '{"msg_type":"text","content":{"text":"{message}"}}'

    if (webhookUrl) {
      try {
        let body: any
        try {
          // Attempt to parse as JSON first
          body = JSON.parse(webhookBodyTemplate)

          // Helper to recursively replace {message} in an object
          const replacePlaceholder = (obj: any): any => {
            if (typeof obj === 'string') {
              return obj.split('{message}').join(content)
            }
            if (Array.isArray(obj)) {
              return obj.map(replacePlaceholder)
            }
            if (obj !== null && typeof obj === 'object') {
              const newObj: any = {}
              for (const key in obj) {
                newObj[key] = replacePlaceholder(obj[key])
              }
              return newObj
            }
            return obj
          }

          body = replacePlaceholder(body)
          body = JSON.stringify(body)
        } catch {
          // Fallback to simple string replacement if not valid JSON
          body = webhookBodyTemplate.split('{message}').join(content)
        }

        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: typeof body === 'string' ? body : JSON.stringify(body),
        })

        if (!response.ok) {
          console.error(`🔴 Webhook 推送失败: ${response.status} ${response.statusText}`)
        } else {
          console.log('🟢 Webhook 推送成功')
        }
      } catch (error) {
        console.error('🔴 Webhook 推送过程出错:', error)
      }
    }

    // Exit with error if any error occurred
    if (hasError && options.onError) {
      options.onError()
    }
  }

  return { log, error, notify, notifyError, info, infoError, collect, push, hasError: () => hasError } as const
}

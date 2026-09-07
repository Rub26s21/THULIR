import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { executeGroundInvestigation } from './src/services/investigator/investigatorCore.ts'

function groundInvestigatorDevPlugin(): Plugin {
  let env: Record<string, string> = {}

  return {
    name: 'ground-event-investigator-dev-api',
    configResolved(config) {
      env = loadEnv(config.mode, process.cwd(), '')
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/ground-event-investigator')) {
          if (req.method === 'POST') {
            let body = ''
            req.on('data', (chunk: Buffer) => {
              body += chunk.toString()
            })
            req.on('end', async () => {
              try {
                const pkg = JSON.parse(body)
                const apiKey = env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY
                const result = await executeGroundInvestigation(pkg, apiKey)
                res.setHeader('Content-Type', 'application/json')
                res.statusCode = 200
                res.end(JSON.stringify(result))
              } catch (err: unknown) {
                res.setHeader('Content-Type', 'application/json')
                res.statusCode = 500
                res.end(JSON.stringify({
                  available: false,
                  status: 'AI_ERROR',
                  reason: `Dev server error: ${(err as Error)?.message || 'Failed to process request'}`,
                  timestamp: new Date().toISOString(),
                }))
              }
            })
            return
          } else if (req.method === 'OPTIONS') {
            res.statusCode = 200
            res.end()
            return
          } else {
            res.statusCode = 405
            res.end(JSON.stringify({ error: 'Method Not Allowed' }))
            return
          }
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), groundInvestigatorDevPlugin()],
})

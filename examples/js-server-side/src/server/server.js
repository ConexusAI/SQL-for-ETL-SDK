import path from 'path'
import express from 'express'
import cookieParser from 'cookie-parser'
import { createProxyMiddleware } from 'http-proxy-middleware'

import Auth from './auth.js'

const PORT = process.env.PORT || 3000
const PATH = __dirname

const auth = new Auth({
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  redirect_uri: `http://localhost:${PORT}/login/callback`,
  scopes: ['email', 'openid', 'profile'],
})

const app = express()

// Handle cookies (required for authentication)
app.use(cookieParser())

// Handle authentication
app.use(auth.router)

// Optional: Route API calls adding API key
app.use(
  '/api',
  createProxyMiddleware({
    target: process.env.API_BASE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api': '' },
    onProxyReq: (proxyReq) => {
      proxyReq.setHeader('x-api-key', process.env.API_KEY)
    },
  })
)

// Serve static files
app.use(express.static(PATH))

// Start listening
app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`)
  console.log('Press Ctrl+C to quit.')
})

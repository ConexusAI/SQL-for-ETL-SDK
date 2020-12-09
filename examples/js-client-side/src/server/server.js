import path from 'path'
import express from 'express'

const PORT = process.env.PORT || 3000
const PATH = __dirname

//const DEFAULT_FILE = path.join(PATH, 'index.html')

const app = express()

// Optional: Always serve index.html (For routing in single page applications.)
//app.use(express.static(__dirname))app.get('*', (req, res) => {
//    res.sendFile(DEFAULT_FILE)
//})

// Serve static files
app.use(express.static(PATH))

// Start listening
app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`)
  console.log('Press Ctrl+C to quit.')
})

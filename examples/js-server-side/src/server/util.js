import crypto from 'crypto'

function toBase64UrlEncoded(str) {
  return str.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function randomBase64UrlEncodedBytes(n) {
  return toBase64UrlEncoded(crypto.randomBytes(n))
}

function generateCodeChallenge(code_verifier) {
  return toBase64UrlEncoded(crypto.createHash('sha256').update(code_verifier, 'ascii').digest('base64'))
}

export default {
  generateRandomState() {
    return randomBase64UrlEncodedBytes(32)
  },
  generateCodeChallenge() {
    const code_challenge_method = 'S256'
    const code_verifier = randomBase64UrlEncodedBytes(32)
    const code_challenge = generateCodeChallenge(code_verifier)
    return { code_challenge_method, code_challenge, code_verifier }
  },
}

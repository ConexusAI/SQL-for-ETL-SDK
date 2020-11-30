import axios from 'axios'
import { Router } from 'express'
import qs from 'qs'

import util from './util.js'

const AUTH_BASE_URL = 'https://accounts.conexus.com/'
const AUTH_LOGIN_URL = AUTH_BASE_URL + 'login'
const AUTH_TOKEN_URL = AUTH_BASE_URL + 'oauth2/token'
const AUTH_USER_INFO_URL = AUTH_BASE_URL + 'oauth2/userInfo'

function makeURL(url, query) {
  const params = qs.stringify(query)
  return `${url}?${params}`
}

function encodeBase64(s) {
  let buffer = Buffer.from(s, 'ascii')
  return buffer.toString('base64')
}

function decodeBase64(b) {
  let buffer = Buffer.from(b, 'base64')
  return buffer.toString('ascii')
}

function generateAuthToken(client_id, client_secret) {
  return encodeBase64(`${client_id}:${client_secret}`)
}

export default class AuthMiddleware {
  constructor(config) {
    this.config = config
    this.router = this.createRouter()
  }

  fetchToken(code, code_verifier) {
    const { client_id, client_secret, redirect_uri } = this.config
    const authorization = generateAuthToken(client_id, client_secret)
    const headers = {
      //Authorization: `Basic ${authorization}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    }
    const query = {
      grant_type: 'authorization_code',
      client_id,
      redirect_uri,
      code_verifier,
      code,
    }
    const body = qs.stringify(query)
    //return fetch(url, {
    //  method: 'POST',
    //  headers,
    //  body,
    //}).then((stream) => stream.json())
    return axios.post(AUTH_TOKEN_URL, body, { headers }).then((response) => response.data)
  }

  fetchUserInfo(data) {
    const headers = {
      Authorization: `Bearer ${data.access_token}`,
    }
    //return fetch(url, {
    //  method: 'GET',
    //  headers,
    //}).then((stream) => stream.json())
    return axios.get(AUTH_USER_INFO_URL, { headers }).then((response) => response.data)
  }

  createRouter() {
    const { client_id, redirect_uri, scopes } = this.config

    const router = new Router()

    router.use('/login/callback', (req, res) => {
      const { code, state } = req.query
      const { csrfState, codeVerifier } = req.cookies

      if (state && csrfState && state !== csrfState) {
        res.status(400).send(`Invalid state: ${csrfState} != ${state}`)
        return
      }

      if (!code) {
        res.status(400).send('Missing code.')
        return
      }

      const query = { code, code_verifier: codeVerifier }
      const url = makeURL('/', query)
      res.redirect(url)

      /*
      const query = {}
      this.fetchToken(code, codeVerifier)
        .then((data) => {
          console.log('Auth Success:', data)
          query.id_token = data.id_token

          //this.fetchUserInfo(data)
          //  .then((data) => {
          //    console.log('UserInfo Success:', data)
          //  })
          //  .catch((error) => {
          //    console.error('UserInfo Failure:', error)
          //  })

          //const user_attributes = data.id_token.split('.')[1]
          //console.log(decodeBase64(user_attributes))
        })
        .catch((error) => {
          console.error('Auth Failure:', error)
        })
        .finally(() => {
          const url = makeURL('/', query)
          res.redirect(url)
        })
        */
    })

    router.use('/login', (req, res) => {
      const { code_challenge_method, code_challenge, code_verifier } = util.generateCodeChallenge()
      const state = util.generateRandomState()

      const query = {
        client_id,
        code_challenge,
        code_challenge_method,
        identity_provider: 'COGNITO',
        redirect_uri,
        response_type: 'code',
        scope: scopes.join(' '),
        state,
      }

      const maxAge = 5 * 60 * 1000 // 5 minutes
      res.cookie('csrfState', state, { maxAge })
      res.cookie('codeVerifier', code_verifier, { maxAge })

      const url = makeURL(AUTH_LOGIN_URL, query)
      res.redirect(url)
    })

    router.use('/logout', (req, res) => {
      const query = {}
      const url = makeURL('/', query)
      res.redirect(url)
    })

    return router
  }
}

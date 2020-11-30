import qs from 'qs'

import './assets/styles.css'

const $ = document.getElementById.bind(document)

//const query = window.location.search.substring(1)
//const code = query.split('id_token=')[1]
//const id_token = query.split('id_token=')[1]

const query = qs.parse(window.location.search.substring(1))

function fetchToken(code, code_verifier) {
  const url = 'https://accounts.conexus.com/oauth2/token'
  const headers = {
    //Authorization: `Basic ${authorization}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  }
  const query = {
    grant_type: 'authorization_code',
    client_id: '6u3ltjmspdgmdruo7b9cc4i8jf',
    redirect_uri: `http://localhost:3000/login/callback`,
    code_verifier,
    code,
  }
  const body = qs.stringify(query)
  return fetch(url, { method: 'POST', headers, body })
    .then((stream) => stream.json())
    .then((data) => {
      console.log(data)
    })
}

if (query.code) {
  fetchToken(query.code, query.code_verifier)
}

const id_token_data = query.id_token ? atob(query.id_token.split('.')[1]) : '{}'
const user = JSON.parse(id_token_data)

$('login').style.display = query.id_token ? 'none' : 'inherit'
$('logout').style.display = query.id_token ? 'inherit' : 'none'

$('api_key').value = user['custom:api_key'] || ''

$('submit').onclick = () => {
  // Direct (Client-Side API Key) or Indirect (Server-Side API Key)
  const is_direct = $('direct').checked
  const api_key = is_direct ? $('api_key').value : undefined
  const api_base_url = is_direct ? 'https://iyt7szjn84.execute-api.us-east-1.amazonaws.com/prod' : '/api'
  const api_query = $('api_query').value
  if (query.id_token && api_query) {
    fetch(api_base_url + api_query, {
      headers: {
        Authorization: `Bearer ${id_token}`,
        'x-api-key': api_key,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        $('result').textContent = JSON.stringify(data, null, 2)
      })
  } else {
    alert('Did you forget to sign in or enter a query?')
  }
}

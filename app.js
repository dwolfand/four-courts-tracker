/* global window document localStorage fetch alert */

// Fill in with your values
const AUTH0_CLIENT_ID = 'eR-rZORRvrpQfm4ICuCXwWuBOBo4kNya';
const AUTH0_DOMAIN = 'four-courts-tracker.auth0.com';
const AUTH0_CALLBACK_URL = window.location.href; // eslint-disable-line

// initialize auth0 lock
const lock = new Auth0Lock(AUTH0_CLIENT_ID, AUTH0_DOMAIN, {
  auth: {
    params: {
      access_type: 'offline'
    }
  }
});

// Handle login
lock.on("authenticated", function(authResult) {
  console.log(authResult)
  lock.getUserInfo(authResult.accessToken, function(error, profile) {
    if (error) {
      // Handle error
      alert(JSON.stringify(error))
      return false
    }
    // authResult.accessToken && authResult.idToken
    // Save the JWT token.
    localStorage.setItem('access_token', authResult.accessToken)
    localStorage.setItem('id_token', authResult.idToken)

    // Save the profile
    localStorage.setItem('profile', JSON.stringify(profile))

    updateUI()
  });
});

function updateUI() {
  const isLoggedIn = localStorage.getItem('id_token')
  if (isLoggedIn) {
    // swap buttons
    document.getElementById('btn-login').style.display = 'none'
    document.getElementById('btn-logout').style.display = 'inline'
    const profile = JSON.parse(localStorage.getItem('profile'))
    // show username
    document.getElementById('nick').textContent = profile.nickname
  }
}

updateUI()

// Handle login
document.getElementById('btn-login').addEventListener('click', () => {
  lock.show()
})

// Handle logout
document.getElementById('btn-logout').addEventListener('click', () => {
  localStorage.removeItem('id_token')
  localStorage.removeItem('access_token')
  localStorage.removeItem('profile')
  document.getElementById('btn-login').style.display = 'flex'
  document.getElementById('btn-logout').style.display = 'none'
  document.getElementById('nick').textContent = ''
})
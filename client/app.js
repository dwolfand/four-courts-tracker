/* global window document localStorage fetch alert */

// Fill in with your values
const AUTH0_CLIENT_ID = 'JsbcZNrbXKaDyGzdOxluDDOfnx4DYqXy';
const AUTH0_DOMAIN = 'four-courts-tracker.auth0.com';
const AUTH0_CALLBACK_URL = window.location.href; // eslint-disable-line

const formatDate = (date) => {
  return moment(date).format('dddd MMM D YYYY, h:mma')
}

const events = [];

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
    document.getElementById('nick').textContent = profile.nickname;
    LogRocket.identify(profile.email, {
      email: profile.email,
    });
    fetch('https://emh0miej37.execute-api.us-east-1.amazonaws.com/dev/api/updateUser', {
    // fetch('http://localhost:3000/api/updateUser', {
      method: 'POST',
      body: JSON.stringify({email: profile.email})
    })
    .then(response => response.json())
    .then((results) => {
      if (results && results.isNewUser)
        window.location.reload();
    });
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

function addUserToDOM(user) {
  const newNode = document.getElementById('user-template').cloneNode(true);
  const eventTemplate = document.getElementById('event-template').cloneNode(true);
  newNode.classList.remove('hide');
  eventTemplate.classList.remove('hide');
  newNode.setAttribute('id', '');
  newNode.firstElementChild.textContent = user.email;
  if (user.events.length === 0) {
    eventTemplate.textContent = 'No upcoming events found.';
    newNode.appendChild(eventTemplate);
  } else {
    user.events.forEach((event) => {
      const template = eventTemplate.cloneNode(true);
      const start = event.start.dateTime || event.start.date;
      template.textContent = `${formatDate(start)} - ${event.summary}`;
      events.push({
        title: `${user.email} - ${event.summary}`,
        start,
      })
      newNode.appendChild(template);
    })
  }
  document.getElementById('events').appendChild(newNode);
}

document.addEventListener("DOMContentLoaded", function(event) {
  fetch('https://emh0miej37.execute-api.us-east-1.amazonaws.com/dev/api/events')
  //fetch('http://localhost:3000/api/events')
  .then(response => response.json())
  .then((results) => {
    document.getElementById('spinner').remove();
    results.eventResults.forEach(event => addUserToDOM(event));
  })
  .then(() => {
    $('#calendar').fullCalendar({
      events,
      header: { center: 'month,basicDay' },
      dayClick: function(date, jsEvent, view) {
        $('#calendar').fullCalendar('changeView', 'basicDay', date);
      },
    });
  });
});
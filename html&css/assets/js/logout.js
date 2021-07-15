const { remote } = require('electron').remote;

document.getElementById('window-logout-button').addEventListener('click', () => {
  window.localStorage.clear();
  remote.getCurrentWindow().loadFile('html&css/pages/auth/sign-in.html');
});


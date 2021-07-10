const { remote } = require('electron');

document.getElementById('window-logout-button').addEventListener('click', () => {
  window.localStorage.clear();
  remote.getCurrentWindow().loadFile('html&css/pages/auth/sign-in.html');
});

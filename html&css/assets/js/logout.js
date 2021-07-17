const { remote } = require('electron');

document.getElementById('window-logout-button').addEventListener('click', () => {
  window.localStorage.clear();
  remote.getCurrentWindow().loadFile('html&css/pages/auth/sign-in.html');
});

const isAdmin = JSON.parse(window.localStorage.getItem('auth')).admin;
const adminElments = document.getElementsByClassName('admin-only-button');
if (parseInt(isAdmin, 10) === 1) {
  for (const adminElement of adminElments) {
    adminElement.classList.remove('d-none');
  }
}

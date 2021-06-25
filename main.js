const { app, BrowserWindow } = require('electron');
const path = require('path');

const nodeRequire = require;

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 600,
    minHeight: 200,
    // webPreferences: {
    //   preload: path.join(__dirname, 'preload.js'),
    // },
  });

  win.loadFile('html&css/pages/examples/sign-in.html');
  win.require = nodeRequire;
  win.maximize();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows.length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

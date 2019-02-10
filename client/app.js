const {app, BrowserWindow} = require("electron");
app.on("ready", function() {
    let mainWindow = new BrowserWindow({
        frame: false,
        transparent: true,
        fullscreen: true,
        resizable: false
    })
    mainWindow.setMenu(null);
    mainWindow.loadURL(`file:///${__dirname}/index.html`);
    // mainWindow.toggleDevTools();
})
app.on('will-quit', function() { if (process.platform != 'darwin') app.quit(); });
app.on('window-all-closed', function() { if (process.platform != 'darwin') app.quit(); });
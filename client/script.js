const fs = require('fs');
let settings = JSON.parse(fs.readFileSync(__dirname + "/settings.json", "utf8"));
const alert = require("sweetalert2");
const io = require("socket.io-client")(`${settings.url}`);
const request = require('request');
const progress = require('request-progress');
const electron = require('electron');
var id = null;
var style = document.getElementById("c");
(async function() {
    const {value: key} = await alert.fire({
        title: "What is your product key?",
        input: "text",
        showCancelButton: true,
        inputValidator: (value) => {
            return !value && 'You need to write something!'
        },
        allowOutsideClick: false,
        allowEscapeKey: false
    })
    id = key;
    io.emit("is_valid_key", key);
})();

io.on("is_valid_key", function(val) {
    if (val) {
        alert.fire({
            title: "Starting install",
            onClose: function() {
                io.emit("use_key", id);
            }
        })
    } else {
        alert.fire({
            title: "Invalid key",
            text: "Sorry, that was an invalid key",
            onClose: function() {
                electron.remote.app.quit();
            }
        })
    }
})
io.on("key_url", function(url) {
    alert.fire({
        title: "Downloading",
        text: "0%",
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false
    })
    style.innerHTML = "button{display:none;}"
    progress(request(`${settings.url}?id=${url}`),{throttle: 100}).on('progress', function (state) {
        document.getElementById("swal2-content").innerHTML = (Math.floor(state.percent*1000)/10) + "%";
    }).on('end', function () {
        document.getElementById("swal2-content").innerHTML = "100%";
        style.innerHTML = "";
        fs.rename(electron.remote.app.getPath("userData") + "\\app.txt", `resources\\app.asar`, function(err) {
            if (err) throw err;
            alert.fire({
                title: "Launching app...",
                onClose: function() {
                    electron.remote.app.relaunch()
                    electron.remote.app.exit(0);
                }
            })
        })
    })
    .pipe(fs.createWriteStream(electron.remote.app.getPath("userData")+ '\\app.txt'));
})
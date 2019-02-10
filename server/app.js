var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var rs = require("randomstring");
let key_urls = [];

server.listen(process.env.PORT || 8080);

app.get('/', function (req, res) {
    let output = false;
    let val = 0;
    for (let i in key_urls) {
        if (key_urls[i] == req.query.id) {
            output = true;
            val = i;
            break;
        } else if (req.query.id == undefined) {
            output = false;
            break;
        }
    }
    if (output) {
        res.download(__dirname + "/secure/app.asar");
        delete key_urls[val]
    } else {
        res.json({code:"404"})
    }
});

var MongoClient = require('mongodb').MongoClient;
let db = null;
MongoClient.connect(`${process.env.MONGO}/${process.env.DATABASE}`, function(err, client) {
    db = client.db(process.env.DATABASE);
});

io.on('connection', function(socket) {
    socket.on("is_valid_key", function(value) {
        let output = false;
        db.collection(process.env.COLLECTION).find({}).toArray((err, rex) => {
            if (err) throw err;
            for (let i in rex) {
                if (rex[i].key == value) {
                    output = true;
                    break;
                }
            }
            socket.emit("is_valid_key", output);
        })
    });
    socket.on("use_key", function(value) {
        let is_valid_key = false;
        let r = 0;
        db.collection(process.env.COLLECTION).find({}).toArray((err, rex) => {
            if (err) throw err;
            for (let i in rex) {
                if (rex[i].key == value) {
                    r = i;
                    is_valid_key = true;
                    break;
                }
            }
            if (is_valid_key) {
                db.collection(process.env.COLLECTION).deleteOne(rex[r], function(err, res) {
                    if (err) throw err;
                });
                let output = rs.generate();
                key_urls[key_urls.length] = output;
                socket.emit("key_url", output);
            } else {
                socket.emit("key_url", "error, invalid key");
            }
        })
    })
})
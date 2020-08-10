const express = require('express')
const http = require('http')
const path = require('path')

const app = express()

// app.use('/', express.static(path.join(__dirname, 'public')))

const port = 3000
server = http.createServer(app).listen(port, function() {
    console.log('Example app listening on port 3000')
})

// WebSocket サーバを起動
const socketio = require('socket.io')
const io = socketio.listen(server)

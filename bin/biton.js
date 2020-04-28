#!/usr/bin/env node

const bitonClient = require('../')
const express = require('express')
const http = require('http')
const pug = require('pug')

const PORT = process.env.PORT || 5000
const HOST = process.env.HOST || '127.0.0.1'

console.log('biton webtorrent-hybrid client')

let client = new bitonClient()

// Setup express behind the http module
let app = express()
let server = http.createServer(app)

// Serve static files in the public directory
app.use(express.static(__dirname + "/public"))

// Setup pug for rendering views
app.set('views', __dirname + '/views/')
app.set('view engine', 'pug')
app.engine('pug', pug.renderFile)

app.get('/', function (req, res) {
    res.render('index')
})


server.listen(port=PORT, hostname=HOST, () => {
    console.log('HTTP server running at http://%s:%s', server.address().address, server.address().port)
})

server.on('error', function (e) {
    if (e.code === 'EADDRINUSE') {
        console.log('Another application (a biton client or container?) is already listening on port %s', PORT)
        exitHandler()
    } else {
        console.log('Unexpected error at the HTTP server: ' + e.code)
    }
});

/*
* Graceful shutdown. Close active connections. Delete logs and uncompleted chunks
* */

function exitHandler(options = {}, exitCode = 0) {
    if (server.listening) {
        server.close()
        app.close()
    }
    if (!client.destroyed) {
        console.log('Destroying biton wires...')
        client.destroy()
    }
    process.exit(exitCode)
}

// Attach exit handlers
// process.on('exit', exitHandler.bind())
process.on('SIGINT', exitHandler.bind())
process.on('SIGTERM', exitHandler.bind())
process.on('SIGUSR1', exitHandler.bind())
process.on('SIGUSR2', exitHandler.bind())
process.on('uncaughtException', exitHandler.bind())

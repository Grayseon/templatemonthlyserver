const { app, BrowserWindow, ipcMain } = require('electron')
const ws = require('ws')
const wss = new ws.Server({port: 8081})
var cons = {}
var users = {}

function rand(string){
    let random = Math.floor(Math.random()*10)
    return string ? random.toString() : random
}

app.on('ready', ()=>{
    var win = new BrowserWindow({
        width: 381,
        height: 300,
        x: 2263,
        y: 0,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })
    win.loadFile(`${__dirname}/index.html`)
    wss.on('connection', (con)=>{
        con.id = rand(true)+rand(true)+rand(true)+rand(true)+rand(true)
        con.send(JSON.stringify({
            type: 'id',
            content: `#${con.id}`
        }))
        cons[con.id] = con
        con.on('close', ()=>{
            delete cons[con.id]
            if(users[con.id]){
                delete users[con.id]
                win.webContents.send('dead', {
                    id: con.id
                })
            }
        })
        con.on('message', (msg)=>{
            msg = JSON.parse(msg)
            switch(msg.type){
                // client messages go here
            }
        })
    })
    ipcMain.on('action', (e, msg)=>{
        console.log(msg)
        switch(msg){
            // host messages go here
        }
    })
    ipcMain.on('login', (e,msg)=>{
        if(Object.keys(cons).includes(msg.id)){
            e.sender.send('addName', {
                id: msg.id,
                name: msg.name
            })
            cons[msg.id].send(JSON.stringify({
                'type': 'logIn',
                'content': msg.name
            }, null, 5))
        }
    })
    ipcMain.on('kill', (e, { id })=>{
        if(users[id]){
            delete users[id]
        }
        if(cons[id]){
            delete cons[id]
        }
    })
})
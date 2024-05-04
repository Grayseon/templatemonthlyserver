const { app, BrowserWindow, ipcMain } = require('electron')
const ws = require('ws')
const wss = new ws.Server({port: 8081})
var cons = {}
var playerList = {}

function rand(string){
    let random = Math.floor(Math.random()*10)
    return string ? random.toString() : random
}

function broadcast(msg){
    Object.values(cons).forEach(con=>{
        con.send(JSON.stringify(msg))
    })
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
            content: `${con.id}`
        }))
        cons[con.id] = con
        con.on('close', ()=>{
            delete cons[con.id]
            if(playerList[con.id]){
                delete playerList[con.id]
                win.webContents.send('dead', {
                    id: con.id
                })
            }
        })
        con.on('message', (msg)=>{
            msg = JSON.parse(msg)
            console.log(msg)
            switch(msg.type){
                case "userJoin":
                    win.webContents.send('addName', msg.content)
                    playerList[msg.content.id] = {
                        name: msg.content.name
                        /* other player data might go here */
                    }
                    broadcast({
                        type: "playerList",
                        content: playerList
                    })
                break
            }
        })
    })
    ipcMain.on('action', (e, msg)=>{
        console.log(msg)
        switch(msg){
            // host messages go here
        }
    })
    ipcMain.on('kill', (e, { id })=>{
        if(playerList[id]){
            delete playerList[id]
        }
        cons[id].terminate()
        if(cons[id]){
            delete cons[id]
        }
        broadcast({
            type: "playerList",
            content: playerList
        })
    })
})
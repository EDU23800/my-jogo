import { create } from 'domain'
import express from 'express'
import http from 'http'
import createGame from "./public/js/game.js"
import * as io from "socket.io"


const app = express()
const server = http.createServer( app )
const sockets = new io.Server( server )

app.use( express.static( "public" ) )

const game = createGame()

game.subscribe( (command) => {
    console.log( `> Emitting ${command.type}` )
    sockets.emit( command.type, command )
})
 
sockets.on( "connection", ( socket ) => {
    const playerId = socket.id    
    console.log( `> Player connect on server with id: ${playerId}` )
      
    game.addPlayer( { playerId: playerId } );

    socket.on( "disconnect", ( socket ) => {
        console.log( `> Player has been disconnect: ${playerId}`)
        game.removePlayer( { playerId: playerId } );

    } )

    socket.emit( 'setup', game.state )
    
} )

console.log( game.state )

server.listen( 3000, () => {
    console.log( "# server is listening on port: 3000 ")
})

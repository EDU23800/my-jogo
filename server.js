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
game.start()

game.subscribe( (command) => {
    sockets.emit( command.type, command )
})
 
sockets.on( "connection", ( socket ) => {
    const playerId = socket.id          

    game.addPlayer( { playerId: playerId } );

    socket.on( "disconnect", ( ) => {
        game.removePlayer( { playerId: playerId } );
    } )

    socket.on( "move-player", ( command ) => {
        command.playerId = playerId
        command.type = 'move-player'

        game.movePlayer( command )

    } )

    socket.emit( 'setup', game.state )

} )


server.listen( 3000, () => {
    console.log( "# server is listening on port: 3000 ")
})

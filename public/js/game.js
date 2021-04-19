export default function createGame( largura, altura ){
    altura = altura || 10 
    largura = largura || 10 
    const state = {
        players:{ } ,
        fruits: { },
        screen: {
            width: largura,
            height: altura
        },
        frequenceSeconds : 5,
        startedFruits : false
    }

    const observers = []

    function start( seconds ) {
        state.frequenceSeconds = seconds || state.frequenceSeconds
        const miliseconds = state.frequenceSeconds * 1000

        setInterval( addFruit, miliseconds )
    }

    function subscribe( observerFunction ){
        observers.push( observerFunction )
    }

    function notifyAll( command ){
        for( const observerFunction of observers ){
            observerFunction( command )
        }

    }
    function setState( newState ) {
        Object.assign( state, newState )
    }
    function addPlayer( command ){
        
        const playerId = command.playerId
        const playerX = 'x' in command ? command.x : Math.floor( Math.random() * state.screen.width )
        const playerY = 'y' in command ? command.y : Math.floor( Math.random() * state.screen.height )
        const pontos = 'pontos' in command ? command.pontos : 0
        const player = {
            x: playerX,
            y: playerY,
            pontos: pontos
        }

        state.players[playerId] = player

        notifyAll( {
            type: 'add-player',
            playerId: playerId,
            ...player
        })
    }
    
    function removePlayer( command ) {
        const playerId = command.playerId
        
        delete state.players[playerId]

        notifyAll( {
            type: 'remove-player',
            playerId: playerId
        })
    }
    
    function addFruit( command ){
        command = command || {}
        const recursive = 'recursive' in command ? command.recursive : 0

        // Se em 50 tentativas ele não achar espaço, não add nenhum fruta
        if( ! state.startedFruits || recursive >= 50 ) return
        
        const fruitId = 'fruitId' in command ? command.fruitId : Math.floor( Math.random() * 1000000 )
        const fruitX = 'x' in command ? command.x : Math.floor( Math.random() * state.screen.width )
        const fruitY = 'y' in command ? command.y : Math.floor( Math.random() * state.screen.height )
        
        for( const checkFruitId in state.fruits ){
            const fruit = state.fruits[checkFruitId]
            if( fruit && fruitX === fruit.x && fruitY === fruit.y ){
                addFruit( {fruitId: fruitId, recursive: recursive + 1 } )
                return
            }
        }
        
        const fruit = {
            x: fruitX,
            y: fruitY,
        }
        state.fruits[fruitId] = fruit

        notifyAll( {
            type: 'add-fruit',
            fruitId: fruitId,
            ...fruit
        })
    }
    
    function removeFruit( command ) {
        const fruitId = command.fruitId
        
        delete state.fruits[fruitId]

        notifyAll( {
            type: 'remove-fruit',
            fruitId: fruitId
        })
    }
    
    function movePlayer ( command ){
        notifyAll( command )

        const acceptedMoves = {
            ArrowUp( player ){
                if( player.y - 1 >= 0 ){
                    player.y -= 1
                    return 
                }
            },
            ArrowDown( player ){
                if( player.y + 1 < state.screen.height ){
                    player.y += 1
                    return 
                }
            },
            ArrowRight( player ){
                if( player.x + 1 < state.screen.width ){
                    player.x += 1
                    
                    return 
                }
            },
            ArrowLeft( player ){
                if( player.x - 1 >= 0 ){
                    player.x -= 1
                    return 
                }   
            },

            Delete( ){
                state.startedFruits = ! state.startedFruits
                console.log( `state fruit: ${state.startedFruits}`)
                return
            }
            
        }
        const keyPressed = command.keyPressed
        const playerId = command.playerId
        const player = state.players[playerId]
        const moveFunction = acceptedMoves[keyPressed]
        
        if( player && moveFunction ) {
            moveFunction( player )
            checkForFruitCollition( playerId )
        }
        
    }
    
    function checkForFruitCollition( playerId ) {
        const player = state.players[playerId]
        
        for( const fruitId in state.fruits ){
            const fruit = state.fruits[fruitId]
            
            if( player.x === fruit.x && player.y === fruit.y ){
                state.players[playerId].pontos ++
                removeFruit( { fruitId : fruitId } )
            }
        }
    }
    return { 
        movePlayer,
        state,
        addPlayer,
        removePlayer,
        addFruit,
        removeFruit,
        setState,
        subscribe,
        start
    }
}

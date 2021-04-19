export default function renderScreen( screen, scoreTableHtml, game, requestAnimationFrame, currentPlayerId ){
            
    const context = screen.getContext( "2d" )
    context.clearRect( 0, 0, screen.width, screen.height )
    
    for( const playerId in game.state.players ){
        const player = game.state.players[playerId]
        context.fillStyle = 'black'
        context.fillRect( player.x, player.y, 1, 1 )
    }
    
    for( const fruitId in game.state.fruits ){
        const fruit = game.state.fruits[fruitId]
        context.fillStyle = 'green'
        context.fillRect( fruit.x, fruit.y, 1, 1 )
    }
    
    const currentPlayer = game.state.players[currentPlayerId]
    if( currentPlayer ){
        context.fillStyle = "#F0DB4F"
        context.fillRect( currentPlayer.x, currentPlayer.y, 1, 1 )
    }

    updateScore( scoreTableHtml, game, currentPlayerId )
    requestAnimationFrame( () => {
        renderScreen( screen, scoreTableHtml, game, requestAnimationFrame, currentPlayerId )
    } )
}

function updateScore( scoreTableHtml,game, currentPlayerId ){
    let innerHmtlScore = `
        <thead>
            <tr>
                <td>User</td>
                <td>Pontuação</td>
            </tr>
        </thead>
        <tbody>
    `;

    const sortable = Object.entries( game.state.players ).sort(function (a, b) {
        debugger
        if (a[1]['pontos'] < b[1]['pontos']) {
            return 1;
        }
        if (a[1]['pontos'] > b[1]['pontos']) {
            return -1;
        }
        // a must be equal to b
        return 0;
    });

    for (let index = 0; index < sortable.length; index++) {
        const item = sortable[index]
        const playerId = item[0];
        const pontos = item[1]['pontos'];
        
        innerHmtlScore += `
        <tr class="${playerId === currentPlayerId ? "current": "another"} player">
            <td>${playerId}</td>
            <td>${pontos}</td>
        </tr>`   
    }

    scoreTableHtml.innerHTML = `${innerHmtlScore}\n</tbody>`
}
let queue = [];

const addPlayerToQueue = (player) => {
    queue.push(player);

    console.log(queue);

    if(queue.length >= 2){
        return matchPlayersFromQueue();
    }

    console.log(`Player ${player.player_id} added to the queue.`);
    return null;
}

const removePlayerFromQueue = (player_id) => {
    const playerIndex = queue.findIndex(qPlayer => qPlayer.player_id === player_id);

    if(playerIndex){
        queue.splice(playerIndex, 1);

        console.log(`Player ${player_id} removed from the queue.`);
    } else {
        console.log("No player found with that id.")
        return { error: "No player found with that id." }
    }
}

const matchPlayersFromQueue = () => {
    if(queue.length >= 2){
        const player1 = queue.shift();
        const player2 = queue.shift();
        return {
            player1: player1,
            player2: player2
        }
    } else {
        console.log("Queue error, not enough people in queue to match.");
        return;
    }
}

module.exports = {
    addPlayerToQueue,
    removePlayerFromQueue
}
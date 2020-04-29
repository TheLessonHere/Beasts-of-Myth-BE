let rooms = [];

const createRoom = ({ player1, player2 }) => {
    let room_id = player1.player_id + player2.player_id * 2;
    const room_id_string = `${room_id}${player1.socket_id}${player2.socket_id}`;

    const newRoom = {
        room_id: room_id_string,
        player1: player1,
        player2: player2,
        spectators: []
    };

    rooms.push(newRoom);
    console.log(`New room ${newRoom.room_id} created.`);
    return newRoom;
}

const getRoom = (room_id) => {
    const result = rooms.find(room => room.room_id === room_id);
    if(result){
        return result;
    } else {
        console.log("No room found with that id.");
        return { error: "No room found with that id." };
    }
}

const getAllRooms = () => {
    return rooms;
}

const removeRoom = (room_id) => {
    const roomIndex = rooms.findIndex(room => room.room_id === room_id);
    rooms.splice(roomIndex, 1);

    console.log(`Room ${room_id} removed.`);
}

const getPlayersInRoom = (room_id) => {
    const result = rooms.find(room => room.room_id === room_id);
    if(result){
        return {
            player1: result.player1,
            player2: result.player2
        };
    } else {
        console.log("No room found with that id.");
        return { error: "No room found with that id." };
    }
}

const addSpectatorToRoom = ({ room_id, spectator }) => {
    const result = rooms.find(room => room.room_id === room_id);
    if(result){
        result.spectators.push(spectator);
        console.log(`Spectator added to room ${room_id}.`);
        return;
    } else {
        console.log("No room found with that id.");
        return { error: "No room found with that id." };
    }
}

const getSpectatorsInRoom = (room_id) => {
    const result = rooms.find(room => room.room_id === room_id);
    if(result){
        return {
            spectators: result.spectators
        };
    } else {
        console.log("No room found with that id.");
        return { error: "No room found with that id." }
    }
}

module.exports = {
    createRoom,
    getRoom,
    getAllRooms,
    removeRoom,
    getPlayersInRoom,
    addSpectatorToRoom,
    getSpectatorsInRoom
}
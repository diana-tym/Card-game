import { cardWidth, cardHeight, findPosition, findX } from './game.js';
import { clientUrl } from '../config.js';

const socket = new WebSocket(`ws://${clientUrl}`);

const main = document.getElementById('main');
const output = document.getElementById('output');
const btnNewRoom = document.getElementById('btnNewRoom');
const btnJoinRoom = document.getElementById('btnJoinRoom');
const txtPlayerName = document.getElementById('txtPlayerName');
const txtRoomId = document.getElementById('txtRoomId');

let turn;
let moveType;
let clientId, roomId;
let drawCardsOnHand, drawTrumpCard, drawOnBoard;
const gameDocElements = {};

socket.onmessage = message => {
    const data = JSON.parse(message.data);
    const handler = handlers[data.event];
    handler(data);
}

// client events

const createRoom = () => {
    const payLoad = {
        event: 'createRoom',
        clientId
    }
    socket.send(JSON.stringify(payLoad));
}

const joinRoom = () => {
    const playerName = txtPlayerName.value || 'Player';

    const roomId = +txtRoomId.value;

    if (roomId === 0 || isNaN(roomId)) {
        const msg = 'Wrong room id!';
        writeMsg(output, msg);
    } else {
        const payLoad = {
            event: 'joinRoom',
            clientId: clientId,
            roomId: roomId,
            playerName: playerName
        }
        socket.send(JSON.stringify(payLoad));
    }
}

btnNewRoom.addEventListener('click', createRoom);
btnJoinRoom.addEventListener('click', joinRoom);

const makeMove = (event) => {
    const clickedCard = +event.target.id;
    if ((turn !== clientId) || isNaN(clickedCard)) return;

    const payLoad = {
        event: 'makeMove',
        moveType: moveType,
        clientId: clientId,
        roomId: roomId,
        card: clickedCard
    }
    socket.send(JSON.stringify(payLoad));
}

const clickTake = () => {
    if (turn !== clientId || moveType !== 'defendMove') {
        return;
    }
    const payLoad = {
        event: 'clickTake',
        clientId: clientId,
        roomId: roomId
    }
    socket.send(JSON.stringify(payLoad));
}

const clickDiscard = () => {
    if (turn !== clientId || moveType !== 'notFirstMove') {
        return;
    }

    const payLoad = {
        event: 'clickDiscard',
        clientId: clientId,
        roomId: roomId
    }
    socket.send(JSON.stringify(payLoad));
}

// handlers

const toConnect = (data) => {
    clientId = data.clientId;
}

const roomCreated = (data) => {
    const roomId = data.room.roomId;
    const msg = `The room was created with id ${roomId}`;
    writeMsg(output, msg);
}

const joinedRoom = (data) => {
    if (data.clientId === clientId) {
        setUpRoom();
    }
    roomId = data.roomId;
    const msg = `${data.playerName} has joined the room!`;
    broadcastMsg(msg);
}

const showError = (data) => {
    const msg = data.msg;
    writeMsg(output, msg);
}

const countdown = (data) => {
    const time = data.waitingTime;
    const countdownDiv = gameDocElements.countdownDiv;

    clearDiv(countdownDiv);
    writeMsg(countdownDiv, time);
}

const broadcastMsg = (msg) => {
    const playerConnectDiv = gameDocElements.playerConnectDiv;
    writeMsg(playerConnectDiv, msg);

    setTimeout(function() {
        clearDiv(playerConnectDiv)
    }, 3000);
}

const disconnect = (data) => {
    const msg = `${data.playerName} has left the room!`;
    broadcastMsg(msg);
}

const startGame = (data) => {
    clearDiv(gameDocElements.countdownDiv);
    drawDeck();
    drawTrumpCard(data.trumpCard);

    for (const card of data.cardsOnHand) {
        drawCardsOnHand(card);
    }

    turn = data.turn;
    moveType = 'firstMove';

    gameDocElements.takeButton = addElement('button', 'button-take', gameDocElements.cardsDiv);
    gameDocElements.discardButton = addElement('button', 'button-discard', gameDocElements.cardsDiv);
    gameDocElements.takeButton.innerHTML = 'Take';
    gameDocElements.discardButton.innerHTML = 'Discard';

    gameDocElements.takeButton.addEventListener('click', clickTake);
    gameDocElements.discardButton.addEventListener('click', clickDiscard);
    gameDocElements.cardsOnHandDiv.addEventListener('click', makeMove);
}

const getMove = (data) => {
    const card = data.card;
    drawOnBoard(card);

    if (turn === clientId) {
        document.getElementById(card).remove();
    }

    turn = data.turn;
    moveType = data.moveType;
}

const newRound = (data) => {
    turn = data.turn;
    moveType = data.moveType;

    clearDiv(gameDocElements.cardsGameDiv);

    if (data.hasOwnProperty('newCards')) {
        for (const card of data.newCards) {
            drawCardsOnHand(card);
        }
    }
}

const lose = (data) => {
    const name = data.playerName;
    gameDocElements.loseDiv = addElement('div', 'game-over', main);
    writeMsg(gameDocElements.loseDiv, `Player ${name} lost! Game over!`);
}

const draw = (data) => {
    gameDocElements.drawDiv = addElement('div', 'game-over', main);
    writeMsg(gameDocElements.loseDiv, `Tie! Game over!`);
}

const handlers = {
    'connect': toConnect,
    'roomCreated': roomCreated,
    'error': showError,
    'joinedRoom': joinedRoom,
    'countdown': countdown,
    'disconnect': disconnect,
    'startGame': startGame,
    'moveMade': getMove,
    'newRound': newRound,
    'lose': lose,
    'draw': draw
};

// additional funstions for game

const setUpRoom = () => {
    clearDiv(main);
    gameDocElements.countdownDiv = addElement('div', 'countdown', main);
    gameDocElements.playerConnectDiv = addElement('div', 'player-connection', main);
    gameDocElements.cardsDiv = addElement('div', 'cards', main);
    gameDocElements.cardsOnHandDiv = addElement('div', 'on-hand', gameDocElements.cardsDiv);
    gameDocElements.cardsGameDiv = addElement('div', 'game', gameDocElements.cardsDiv);

    drawCardsOnHand = drawCard.bind(null, gameDocElements.cardsOnHandDiv, 'card', false);
    drawTrumpCard = drawCard.bind(null, gameDocElements.cardsDiv, 'trump-card', false);
    drawOnBoard = drawCard.bind(null, gameDocElements.cardsGameDiv, 'card-on-board', true);
}

const prepareCanvas = (parent) => {
    const canvas = document.createElement('canvas');
    canvas.width = cardWidth;
    canvas.height = cardHeight;
    parent.appendChild(canvas);
    return canvas;
}

const drawDeck = () => {
    const canvas = prepareCanvas(gameDocElements.cardsDiv);
    canvas.id = 'deck';
    const ctx = canvas.getContext('2d');
    const cardImg = new Image();
    cardImg.onload = function() {
        ctx.drawImage(cardImg, 0, 0, cardWidth, cardHeight);
    }
    cardImg.src = './images/back-card.png';
}

const drawCard = (parent, className, onBoard, card) => {
    const canvas = prepareCanvas(parent);
    canvas.className = className;

    if (onBoard) {
        setPosition(canvas);
    } else {
        canvas.id = card;
    }

    const ctx = canvas.getContext('2d');
    const cardImg = new Image();
    const {sx, sy} = findPosition(card);
    cardImg.onload = function() {
        ctx.drawImage(cardImg,
            sx, sy,
            cardWidth, cardHeight,
            0, 0,
            cardWidth, cardHeight);
    }
    cardImg.src = './images/cards.png';
}

const setPosition = (canvas) => {
    let x;
    const gap = 20;
    const numberOfcards = gameDocElements.cardsGameDiv.children.length - 1;
    canvas.style.position = 'absolute';

    if (numberOfcards % 2 === 0) {
        x = numberOfcards / 2;
        canvas.style.top = '50px';
        canvas.style.zIndex = -1;
    } else {
        x = (numberOfcards - 1) / 2;
        canvas.style.top = '150px';
        canvas.style.zIndex = 0;
    }

    const left = findX(x, gap);
    canvas.style.left = `${left}px`;
}

const writeMsg = (div, msg) => {
    div.innerHTML = `<p>${msg}</p>`;
}

const clearDiv = (div) => {
    div.innerHTML = '';
}

const addElement = (type, id, parent) => {
    const element = document.createElement(type);
    element.id = id;
    parent.appendChild(element);
    return element;
}


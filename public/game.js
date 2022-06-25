const numOfCards = 52;
const numOfCardsToDeal = 6;
const cardsInRow = 13;
const aceScore = 12;
const cardWidth = 135;
const cardHeight = 203;
const inBetweenCardGap = 12;
const gap = 45;

const suits = {
    0: 'hearts',
    1: 'diamonds',   // бубни
    2: 'clubs',      // трефи
    3: 'spades'      // пики
}

const createDeck = () => {
    const deck = [...Array(numOfCards).keys()];
    return deck;
}

const shuffleDeck = (deck) => {
    const newDeck = Array.from(deck);
    for (let i = newDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
}

// const dealCards = (players, clients, deck) => {
//     for (const clientId of players) {
//         const player = clients[clientId];
//         const cardsToDeal = deck.splice(deck.length - numOfCardsToDeal, numOfCardsToDeal);
//         player.cardsAtHand = cardsToDeal;
//         console.log(`client: ${clientId}, deck: ${cardsToDeal}`);

//     }
//     console.log('------------');
// }

const dealCards = (deck) => {
    const cardsToDeal = deck.splice(deck.length - numOfCardsToDeal, numOfCardsToDeal);
    return cardsToDeal;
}

const getSuit = (card) => {
    const key = Math.floor(card / cardsInRow);
    return suits[key];
}

const getScore = (card) => {
    let score = card % cardsInRow - 1;
    if (score === -1) {
        score = aceScore;
    }
    return score;
}

const findPosition = (card) => {
    const cardInRow = card % 13;
    const cardInCol = Math.floor(card / 13);
    const sx = findX(cardInRow, inBetweenCardGap);
    const sy = findY(cardInCol, inBetweenCardGap, gap);
    return { sx, sy };
}

const findX = (card, inBetweenCardGap) => {
    const sx = (card + 1) * inBetweenCardGap + card * cardWidth;
    return sx;
}

const findY = (card, inBetweenCardGap, gap) => {
    const sy = (card + 1) * inBetweenCardGap + card * cardHeight + gap;
    return sy;
}

const checkDefendMove = (card, attackCard, trumpSuit) => {
    const cardScore = getScore(card);
    const cardSuit = getSuit(card);
    const attackCardScore = getScore(attackCard);
    const attackCardSuit = getSuit(attackCard);

    const isTrumpCard = cardSuit === trumpSuit;
    const isBigger = cardScore > attackCardScore;

    console.log(`cardScore = ${cardScore}, cardSuit = ${cardSuit}`);
    console.log(`attackCardScore = ${attackCardScore}, attackCardSuit = ${attackCardSuit}`);
    console.log(`isTrumpCard = ${isTrumpCard}, isBigger = ${isBigger}`);

    let result = false;

    if (attackCardSuit === trumpSuit) {
        if (isTrumpCard && isBigger) {
            result = true;
        }
    } else {
        if (isTrumpCard || isBigger) {
            result = true;
        }
    }

    return result;
}

export { createDeck, shuffleDeck, dealCards, getSuit, findPosition, cardWidth, cardHeight,
    findX, getScore, checkDefendMove }
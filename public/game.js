const numOfCards = 52;
const defaultNumOfCards = 6;
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

const useDeck = (numOfCardsToDeal, deck) => {
    const cardsToDeal = deck.splice(deck.length - numOfCardsToDeal, numOfCardsToDeal);
    return cardsToDeal;
}

const dealCards = useDeck.bind(null, defaultNumOfCards);

const takeFromDeck = (numOfCardsOnHand, deck) => {
    if (numOfCardsOnHand >= defaultNumOfCards) return [];
    
    let numOfCardsToDeal = defaultNumOfCards - numOfCardsOnHand;
    const numberOfCardsInDeck = deck.length;

    if (numOfCardsToDeal > numberOfCardsInDeck) {
        numOfCardsToDeal = numberOfCardsInDeck;
    }
    const cardsToDeal = useDeck(numOfCardsToDeal, deck);
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
    const sameSuit = cardSuit === attackCardSuit;

    let result = false;

    if (attackCardSuit === trumpSuit) {
        if (isTrumpCard && isBigger) {
            result = true;
        }
    } else {
        if (isTrumpCard || (isBigger && sameSuit)) {
            result = true;
        }
    }

    return result;
}

const checkAttackMove = (card, cardsInPlay) => {
    const cardScore = getScore(card);
    let result = false;

    for (const cardInPlay of cardsInPlay) {
        const cardInPlayScore = getScore(cardInPlay);

        if (cardScore === cardInPlayScore) {
            result = true;
            return result;
        }
    }
    return result;
}

export { createDeck, shuffleDeck, dealCards, getSuit, findPosition, cardWidth, cardHeight,
    findX, getScore, checkDefendMove, checkAttackMove, takeFromDeck }

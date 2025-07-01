class BlackjackGame {
    constructor(savedState = null) {
    if (savedState) {
        this.deck = savedState.deck;
        this.player = savedState.player;
        this.dealer = savedState.dealer;
        this.gameOver = savedState.gameOver;
        this.result = savedState.result;
        this.wallet = savedState.wallet;
        this.wager = savedState.wager;
    } else {
        this.wallet = 1000;
        this.wager = 0;
        this.reset();
    }
}


    reset() {
    this.deck = this.createShuffledDeck();
    this.player = [];
    this.dealer = [];
    this.gameOver = false;
    this.result = null;
}


    createShuffledDeck() {
        const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'A'];
        let deck = suits.flatMap(suit => values.map(value => ({ suit, value })));
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }

    dealCard(hand, hidden = false) {
        if (!Array.isArray(hand)) {
            throw new Error('Hand must be an array');
        }
        const card = this.deck.pop();
        hand.push(hidden ? { ...card, hidden: true } : card);
    }

    placeBet(amount) {
    const bet = parseInt(amount);
    if (isNaN(bet) || bet <= 9 || bet > this.wallet) {
        throw new Error('Invalid bet amount');
    }

    this.wager = bet;
    this.wallet -= bet;
    this.reset();

    this.dealCard(this.player);
    this.dealCard(this.dealer);
    this.dealCard(this.player);
    this.dealCard(this.dealer, true);

    if (this.getHandValue(this.player) === 21) {
        this.result = 'blackjack';
        this.wallet += this.wager * 2.5;
        this.gameOver = true;
    }
}


    getHandValue(hand) {
        let value = 0, aceCount = 0;
        for (const card of hand) {
            if (card.hidden) continue;
            if (card.value === 'A') {
                value += 11;
                aceCount++;
            } else if (['King', 'Queen', 'Jack'].includes(card.value)) {
                value += 10;
            } else {
                value += parseInt(card.value);
            }
        }
        while (value > 21 && aceCount > 0) {
            value -= 10;
            aceCount--;
        }
        return value;
    }

    playerHit() {
        if (this.gameOver) return;
        this.dealCard(this.player);
        const playerValue = this.getHandValue(this.player);
        if (playerValue > 21) {
            this.gameOver = true;
            this.result = 'bust';
        }
    }

    playerStand() {
        if (this.gameOver) return;
        this.gameOver = true;
        this.dealer.forEach(card => delete card.hidden);
        while (this.getHandValue(this.dealer) < 17) {
            this.dealCard(this.dealer);
        }

        const playerValue = this.getHandValue(this.player);
        const dealerValue = this.getHandValue(this.dealer);

        if (dealerValue > 21 || playerValue > dealerValue) {
            this.result = 'win';
            this.wallet += this.wager * 2;
        } else if (playerValue < dealerValue) {
            this.result = 'lose';
            // no payout
        } else {
            this.result = 'tie';
            this.wallet += this.wager;
        }
    }

    getState() {
        return {
            deck: this.deck,
            player: this.player,
            dealer: this.dealer,
            gameOver: this.gameOver,
            result: this.result,
            status: this.gameOver ? 'ended' : 'in progress',
            wallet: this.wallet,
            wager: this.wager
        };
    }
}

module.exports = BlackjackGame;

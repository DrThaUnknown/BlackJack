class BlackjackTable {
    constructor() {
        this.playAgainButton = document.getElementById('play-again-button');
        this.startButton = document.getElementById('start-button');
        this.splitButton = document.getElementById('split-button');
        this.isSplit = false;
        this.playerHands = [];
        this.currentHandIndex = 0;
        this.resetGame();
    }

    resetGame() {
        this.deck = this.createDeck();
        this.shuffleDeck();
        this.dealerHand = [];
        this.playerHand = [];
        this.gameOver = false;
        this.isSplit = false;
        this.playAgainButton.style.display = 'none';

        document.getElementById('dealer-cards').innerHTML = '';
        document.getElementById('player-cards').innerHTML = '';

        this.setButtons(false);
        this.startButton.disabled = false;
        document.getElementById('dealer-value').textContent = '?';
        document.getElementById('player-value').textContent = '0';
    }      

    createDeck() {
        const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'A'];
        return suits.flatMap(suit => values.map(value => ({ suit, value })));
    }

    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    dealCard(hand, containerId) {
        const card = this.deck.pop();
        hand.push(card);

        const container = document.getElementById(containerId);
        const img = document.createElement('img');

        if (hand === this.dealerHand && hand.length === 2 && !this.gameOver) {
            img.src = 'img/back.png';
            img.alt = 'Hidden Card';
        } else {
            img.src = `img/${card.value.toLowerCase()}_of_${card.suit.toLowerCase()}.png`;
            img.alt = `${card.value} of ${card.suit}`;
        }

        img.classList.add('card-img', 'deal-animation');
        container.appendChild(img);

        setTimeout(() => img.classList.remove('deal-animation'), 500);
    }

    startGame() {
        this.resetGame();
        this.dealCard(this.dealerHand, 'dealer-cards');
        this.dealCard(this.dealerHand, 'dealer-cards');

        if (this.canSplit()) this.splitButton.disabled = false;

        this.updateDisplay();
        this.setButtons(true);
        this.startButton.disabled = true;
    }

    getHandValue(hand) {
        let value = 0, aceCount = 0;
        for (let card of hand) {
            if (card.value === 'A') { aceCount++; value += 11; }
            else if (['King', 'Queen', 'Jack'].includes(card.value)) value += 10;
            else value += parseInt(card.value);
        }
        while (value > 21 && aceCount-- > 0) value -= 10;
        return value;
    }

    updateDisplay() {
        document.getElementById('dealer-value').textContent = this.gameOver ? this.getHandValue(this.dealerHand) : '?';
        document.getElementById('player-value').textContent = this.getHandValue(this.playerHand);
    }

    playerHit() {
        if (this.gameOver) return;
        this.dealCard(this.playerHand, 'player-cards');
        this.updateDisplay();
        this.checkPlayerStatus();
    }

    playerStand() {
        if (this.gameOver) return;
        this.setButtons(false);
        this.dealerTurn();
    }

    async dealerTurn() {
        this.gameOver = true;
        this.revealDealerCard();

        while (this.getHandValue(this.dealerHand) < 17) {
            await this.delay(1000);
            this.dealCard(this.dealerHand, 'dealer-cards');
            this.updateDisplay();
        }
        this.checkWinner();
        this.endGame();
    }

    revealDealerCard() {
        document.getElementById('dealer-cards').innerHTML = '';
        this.dealerHand.forEach(card => this.dealCard([card], 'dealer-cards'));
    }

    checkWinner() {
        const playerValue = this.getHandValue(this.playerHand);
        const dealerValue = this.getHandValue(this.dealerHand);
        const winnerMessage = document.getElementById('winner-message');
        const winnerText = document.getElementById('winner-text');
    
        if (dealerValue > 21 || (playerValue <= 21 && playerValue > dealerValue)) {
            winnerText.textContent = 'You win!';
            this.triggerConfetti();
        } else if (playerValue > 21 || dealerValue >= playerValue) {
            winnerText.textContent = 'Dealer wins.';
        } else {
            winnerText.textContent = "It's a tie!";
        }
    
        winnerMessage.classList.remove('hidden');
        this.endGame();
    }
    
    checkPlayerStatus() {
        const value = this.getHandValue(this.playerHand);
        const winnerMessage = document.getElementById('winner-message');
        const winnerText = document.getElementById('winner-text');
    
        if (value === 21) {
            winnerText.textContent = "Blackjack! You win!";
            this.triggerConfetti();
            winnerMessage.classList.remove('hidden');
            this.endGame();
    
        } else if (value > 21) {
            winnerText.textContent = "Bust! You lose.";
            winnerMessage.classList.remove('hidden');
            this.endGame();
        }
    }

    setButtons(enabled) {
        ['hit-button', 'stand-button', 'split-button'].forEach(id =>
            document.getElementById(id).disabled = !enabled);
    }

    canSplit() {
        return this.playerHand.length === 2 &&
            this.cardValue(this.playerHand[0]) === this.cardValue(this.playerHand[1]);
    }

    cardValue(card) {
        if (['Jack', 'Queen', 'King'].includes(card.value)) return 10;
        if (card.value === 'A') return 11;
        return parseInt(card.value);
    }

    splitHand() {
        // Split logic as provided
    }

    triggerConfetti() {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }

    endGame() {
        this.playAgainButton.style.display = 'block';
    
        
        this.setButtons(false);
    }

    closePopout() {
        const winnerMessage = document.getElementById('winner-message');
        winnerMessage.classList.add('hidden');
    }
    
    delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
}


const table = new BlackjackTable();

document.getElementById('start-button').addEventListener('click', () => {
    table.startGame();
});

document.getElementById('hit-button').addEventListener('click', () => {
    table.playerHit();
});

document.getElementById('stand-button').addEventListener('click', () => {
    table.playerStand();
});

document.getElementById('play-again-button').addEventListener('click', () => {
    alert('Game Restarted');
    table.startGame();
});

document.getElementById('close-winner-message').addEventListener('click', () => {
    table.closePopout();
});

table.splitButton.addEventListener('click', () => {
    table.splitHand();
});
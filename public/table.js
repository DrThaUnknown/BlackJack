class BlackjackTable {
    constructor() {
        this.playAgainButton = document.getElementById('play-again-button') || { style: { display: 'none' } };
        this.startButton = document.getElementById('start-button') || { disabled: true };
        this.playerHands = [];
        this.currentHandIndex = 0;
        this.cash = 1000; // Player's starting cash
        this.wager = 0; // Current wager
        this.bank = 0; // Total winnings or losses
        this.resetGame();
    }

    resetGame() {
        this.deck = this.createDeck();
        this.shuffleDeck();
        this.dealerHand = [];
        this.playerHand = [];
        this.gameOver = false;

        document.getElementById('dealer-cards').innerHTML = '';
        document.getElementById('player-cards').innerHTML = '';

        this.setButtons(false);
        this.startButton.disabled = true; // Start button disabled until a valid bet is placed
        this.playAgainButton.style.display = this.cash === 0 ? 'block' : 'none'; // Show play again button only if cash is 0
        document.getElementById('dealer-value').textContent = '?';
        document.getElementById('player-value').textContent = '0';

        this.updateDisplay();
    }
    restart() {
        this.resetGame();
        this.cash = 1000; 
        this.wager = 0; 
        this.bank = 0;
        this.currentHandIndex = 0; // Reset current hand index
        this.playerHands = []; // Clear player hands
        this.playAgainButton.style.display = 'none';
        this.updateDisplay();
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
        if (this.deck.length === 0) {
            console.error('The deck is empty. Cannot deal a card.');
            return;
        }

        const card = this.deck.pop();
        hand.push(card);

        const container = document.getElementById(containerId);
        const img = document.createElement('img');

        if (hand === this.dealerHand && hand.length === 2 && !this.gameOver) {
            img.src = 'img/back.png';
            img.alt = 'Hidden Card';
        } else {
            const cardValue = card.value === 'A' ? 'A' : card.value.toLowerCase();
            img.src = `img/${cardValue}_of_${card.suit.toLowerCase()}.png`;
            img.alt = `${card.value} of ${card.suit}`;
        }

        img.classList.add('card-img', 'deal-animation');
        container.appendChild(img);

        setTimeout(() => img.classList.remove('deal-animation'), 500);
    }

    startGame() {
        const wagerInputElement = document.getElementById('bet-input') || { value: '0' };
        const wager = parseInt(wagerInputElement.value);
    
        if (isNaN(wager) || wager < 1 || wager > this.cash) {
            alert('Invalid wager. Please enter a valid amount.');
            return;
        }
    
        this.wager = wager;
        this.cash -= wager;
    
        this.resetGame();
        this.dealCard(this.dealerHand, 'dealer-cards');
        this.dealCard(this.dealerHand, 'dealer-cards');
        this.dealCard(this.playerHand, 'player-cards');
        this.dealCard(this.playerHand, 'player-cards');
    
        this.updateDisplay();
    
        // Check if the player has Blackjack (21) immediately after the initial deal
        if (this.getHandValue(this.playerHand) === 21) {
            const winnerMessage = document.getElementById('winner-message');
            const winnerText = document.getElementById('winner-text');
            winnerText.textContent = "Blackjack! You win!";
            this.triggerConfetti();
            winnerMessage.classList.remove('hidden');
            this.gameOver = true;
            this.cash += this.wager * 2.5; // Blackjack pays 3:2
            this.bank += this.wager * 1.5;
            this.wager = 0;
            this.updateDisplay();
            this.setButtons(false); // Disable buttons since the game is over
            return;
        }
    
        this.setButtons(true);
        this.startButton.disabled = true; // Disable start button during the game
    
        const wagerInputClear = document.getElementById('bet-input');
        if (wagerInputClear) {
            wagerInputClear.value = ''; // Clear the wager input field
        }
    }

    getHandValue(hand) {
        let value = 0, aceCount = 0;
        for (let card of hand) {
            if (card.value === 'A') { aceCount++; value += 11; }
            else if (['King', 'Queen', 'Jack'].includes(card.value)) value += 10;
            else value += parseInt(card.value);
        }
        while (value > 21 && aceCount > 0) {
            value -= 10;
            aceCount--;
        }
        return value;
    }

    updateDisplay() {
        const dealerValueElement = document.getElementById('dealer-value');
        const playerValueElement = document.getElementById('player-value');
        const cashElement = document.getElementById('cash');
        const bankElement = document.getElementById('bank');
        const wagerElement = document.getElementById('bet-input');

        if (dealerValueElement) {
            dealerValueElement.textContent = this.gameOver ? this.getHandValue(this.dealerHand) : '?';
        }

        if (playerValueElement) {
            playerValueElement.textContent = this.getHandValue(this.playerHand);
        }

        if (cashElement) {
            cashElement.textContent = `Cash: $${this.cash}`;
        }

        if (bankElement) {
            if (this.bank < 0) {
                bankElement.textContent = `Bank: $${this.bank}`;
                bankElement.style.color = 'red';
            } else if (this.bank > 0) {
                bankElement.textContent = `Bank: $+${this.bank}`;
                bankElement.style.color = 'green';
            } else {
                bankElement.textContent = `Bank: $${this.bank}`;
                bankElement.style.color = 'black';
            }
        }

        if (wagerElement) {
            wagerElement.value = this.wager || '';
        }

        // Enable start button only if a valid bet is placed
        this.startButton.disabled = this.wager <= 0 || this.cash === 0;
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
    }

    revealDealerCard() {
        const dealerCardsContainer = document.getElementById('dealer-cards');
        dealerCardsContainer.innerHTML = ''; // Clear existing cards

        for (const card of this.dealerHand) {
            const img = document.createElement('img');
            const cardValue = card.value === 'A' ? 'A' : card.value.toLowerCase();
            img.src = `img/${cardValue}_of_${card.suit.toLowerCase()}.png`;
            img.alt = `${card.value} of ${card.suit}`;
            img.classList.add('card-img', 'reveal-animation');
            dealerCardsContainer.appendChild(img);
        }

        this.updateDisplay();
    }

    checkWinner() {
        const playerValue = this.getHandValue(this.playerHand);
        const dealerValue = this.getHandValue(this.dealerHand);
        const winnerMessage = document.getElementById('winner-message') || { classList: { remove: () => {}, add: () => {} } };
        const winnerText = document.getElementById('winner-text') || { textContent: '' };

        if (winnerMessage && winnerText) {
            if (dealerValue > 21 || (playerValue <= 21 && playerValue > dealerValue)) {
                winnerText.textContent = 'You win!';
                this.triggerConfetti();
                this.cash += this.wager * 2.5;
                this.bank += this.wager * 1.5; 
            
            } else if (playerValue === dealerValue) {
                winnerText.textContent = "It's a tie!";
                this.cash += this.wager;
            } else {
                winnerText.textContent = 'Dealer wins.';
                this.bank -= this.wager;
            }

            winnerMessage.classList.remove('hidden');
            this.wager = 0;
            this.updateDisplay();
        }
    }

    checkPlayerStatus() {
        const value = this.getHandValue(this.playerHand);
        const winnerMessage = document.getElementById('winner-message');
        const winnerText = document.getElementById('winner-text');

        if (value > 21) {
            winnerText.textContent = "Bust! You lose.";
            winnerMessage.classList.remove('hidden');
            this.gameOver = true;
            this.bank -= this.wager;
            this.wager = 0;
            this.updateDisplay();
        }
    }

    setButtons(enabled) {
        ['hit-button', 'stand-button'].forEach(id =>
            document.getElementById(id).disabled = !enabled
        );
    }

    triggerConfetti() {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }

    endGame() {
        this.setButtons(false);
        this.playAgainButton.style.display = this.cash === 0 ? 'block' : 'none'; // Show play again button only if cash is 0
    }

    closePopout() {
        const winnerMessage = document.getElementById('winner-message');
        winnerMessage.classList.add('hidden');
        this.endGame();
    }

    delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
}

const table = new BlackjackTable();

document.getElementById('start-button').addEventListener('click', () => {
    table.startGame();
});

document.getElementById('bet-input').addEventListener('input', (event) => {
    const wager = parseInt(event.target.value);
    table.startButton.disabled = isNaN(wager) || wager <= 0 || wager > table.cash;
});

document.getElementById('hit-button').addEventListener('click', () => {
    table.playerHit();
});

document.getElementById('stand-button').addEventListener('click', () => {
    table.playerStand();
});

document.getElementById('play-again-button').addEventListener('click', () => {
    table.restart();
});

document.getElementById('close-winner-message').addEventListener('click', () => {
    table.closePopout();
});

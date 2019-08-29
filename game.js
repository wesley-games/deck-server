const suits = ['D', 'C', 'H', 'S']; // Diamonds, Clovers, Hearts, Spades
const values = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];

class Game {

    constructor(player1, player2) {
        this.table = {};
        this.hands = {};
        this.hands[player1] = [];
        this.hands[player2] = [];
        this.deck = suits.reduce((sacc, sval) => {
            let varr = values.reduce((vacc, vval) => {
                vacc.push(sval + vval);
                return vacc;
            }, []);
            sacc.push(...varr);
            return sacc;
        }, []).sort(() => .5 - Math.random());
    }

    drawCard(player) {
        let card = this.deck.shift();
        this.hands[player].push(card);
        return card;
    }

    // retorna se o jogador não tiver mais cartas na mão
    playCard(player, card) {
        this.hands[player].splice(this.hands[player].indexOf(card), 1);
        return this.hands[player].length === 0;
    }

    sortCards(e1, e2) {
        let value1 = values.indexOf(e1.slice(1));
        let value2 = values.indexOf(e2.slice(1));
        return value1 - value2;
    }

    equalSuits(e1, e2) {
        let suit1 = e1.slice(0, 1);
        let suit2 = e2.slice(0, 1);
        return suit1 === suit2;
    }
}

module.exports = {
    Game: Game
}
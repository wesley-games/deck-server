class Game {

    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;
    }

    imprimir() {
        return 'imprimindo alguma coisa';
    }
}

const suits = ['D', 'C', 'H', 'S']; // Diamonds, Clovers, Hearts, Spades
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
class Deck {

    constructor() {
        this.deck = suits.reduce((sacc, sval) => {
            let varr = values.reduce((vacc, vval) => {
                vacc.push(sval + vval);
                return vacc;
            }, []);
            sacc.push(...varr);
            return sacc;
        }, []).sort(() => .5 - Math.random());
    }
}

module.exports = {
    Game: Game,
    Deck: Deck
}
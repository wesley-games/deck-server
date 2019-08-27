const suits = ['D', 'C', 'H', 'S']; // Diamonds, Clovers, Hearts, Spades
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

class Game {

    constructor() {
        this.table = {};
        this.deck = suits.reduce((sacc, sval) => {
            let varr = values.reduce((vacc, vval) => {
                vacc.push(sval + vval);
                return vacc;
            }, []);
            sacc.push(...varr);
            return sacc;
        }, []).sort(() => .5 - Math.random());
    }

    drawCard() {
        return this.deck.shift();
    }
}

module.exports = {
    Game: Game
}
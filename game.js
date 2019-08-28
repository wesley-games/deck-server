const suits = ['D', 'C', 'H', 'S']; // Diamonds, Clovers, Hearts, Spades
const values = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];

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

    sortCards(e1, e2) {
        let value1 = values.indexOf(e1.slice(1));
        let value2 = values.indexOf(e2.slice(1));
        return value1 - value2;
    }
}

module.exports = {
    Game: Game
}
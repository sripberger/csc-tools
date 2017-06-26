const utils = require('./utils');

class Rank {
	constructor(players = []) {
		this.players = players;
	}

	shuffle() {
		return new Rank(utils.shuffleArray(this.players, { copy: true }));
	}

	mutate(rate) {
		return new Rank(utils.reciprocalExchange(this.players, rate));
	}
}

module.exports = Rank;

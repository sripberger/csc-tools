const utils = require('./utils');
const _ = require('lodash');

class Rank {
	constructor(players = []) {
		this.players = players;
	}

	shuffle() {
		return new Rank(utils.shuffleArray(this.players, { copy: true }));
	}

	crossover(other) {
		return new Rank(_.sample(utils.pmx(this.players, other.players)));
	}

	mutate(rate) {
		return new Rank(utils.reciprocalExchange(this.players, rate));
	}
}

module.exports = Rank;

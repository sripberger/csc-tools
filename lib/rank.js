const utils = require('./utils');

class Rank {
	constructor(players = []) {
		this.players = players;
	}

	shuffle() {
		return new Rank(utils.shuffleArray(this.players, { copy: true }));
	}

	mutate() {
		let resultPlayers = this.players.slice();
		let [ a, b ] = utils.getMutationIndices(this.players.length);
		resultPlayers[a] = this.players[b];
		resultPlayers[b] = this.players[a];
		return new Rank(resultPlayers);
	}
}

module.exports = Rank;

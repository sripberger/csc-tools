const _ = require('lodash');

class Rank {
	constructor(players = []) {
		this.players = players;
	}

	shuffle() {
		return new Rank(_.shuffle(this.players));
	}

	mutate() {
		let resultPlayers = this.players.slice();
		let [ a, b ] = _.times(2, () => _.random(0, resultPlayers.length - 1));
		resultPlayers[a] = this.players[b];
		resultPlayers[b] = this.players[a];
		return new Rank(resultPlayers);
	}
}

module.exports = Rank;

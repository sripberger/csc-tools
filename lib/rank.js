const _ = require('lodash');

/**
 * Represents a group of players of the same rank.
 * @private
 * @param {Array<Object>} [players=[]] Array of plain player objects.
 */
class Rank {
	constructor(players = []) {
		this.players = players;
	}

	/**
	 * Returns a copy with the order of players shuffled. This does not change
	 * the original instance.
	 * @returns {Rank} Shuffled copy.
	 */
	shuffle() {
		return new Rank(_.shuffle(this.players));
	}

	/**
	 * Returns a copy with the order of two random players swapped. This does
	 * not change the original instance. Note that it is possible for no such
	 * swap to occur, since the same player may be randomly chosen twice. This
	 * is ok, however, due to the fuzzyness of genetic algorithms.
	 * @returns {Rank} Mutated copy.
	 */
	mutate() {
		let resultPlayers = this.players.slice();
		let [ a, b ] = _.times(2, () => _.random(0, resultPlayers.length - 1));
		resultPlayers[a] = this.players[b];
		resultPlayers[b] = this.players[a];
		return new Rank(resultPlayers);
	}
}

module.exports = Rank;

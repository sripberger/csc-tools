const utils = require('./utils');
const _ = require('lodash');

/**
 * Represents a tournament pool.
 * @private
 * @param {Array<Object>} [players=[]] Array of plain player objects.
 */
class Pool {
	constructor(players = []) {
		this.players = players;
	}

	/**
	 * Calculates the collision score of the pool. This score is based on the
	 * number of players from each region in the pool. For each region, the
	 * first player is worth 0, the second 1, the third 2, the fourth 3, and
	 * so on. This ensures that higher-order collisions are always considered
	 * worse than multiple lower-order collisions, causing any necessary
	 * collisions to be spread out instead of being lumped together into a
	 * single pool.
	 *
	 * @returns {number} Total of scores from each region.
	 */
	getCollisionScore() {
		let score = 0;
		let regionCounts = utils.getRegionCounts(this.players);
		_.forEach(regionCounts, (count) => {
			let nextTerm = 0;
			_.times(count, () => {
				score += nextTerm;
				nextTerm += 1;
			});
		});
		return score;
	}
}

module.exports = Pool;

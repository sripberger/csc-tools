const _ = require('lodash');
const Pool = require('./pool');
const utils = require('./utils');

/**
 * Represents a list of Pool objects.
 * @private
 * @param {Array<Pool>} [pools=[]] Array of Pool objects to include in the list.
 */
class PoolList {
	constructor(pools = []) {
		this.pools = pools;
	}

	/**
	 * Creates a PoolList populated with given array of players.
	 * @param {iterable<Object>} players Iterable object containing players in
	 *   seed order.
	 * @param {number} poolCount Number of pools to create.
	 * @returns {PoolList} Instance with players divided into its pools.
	 */
	static create(players, poolCount) {
		let pools = _.times(poolCount, () => new Pool());
		let seed = 0;
		for (let player of players) {
			let poolIndex = utils.getPoolIndex(seed, poolCount);
			let pool = pools[poolIndex];
			pool.players.push(player);
			seed += 1;
		}
		return new PoolList(pools);
	}

	/**
	 * Returns the total collision score of the entire list.
	 * @returns {number} Sum of individual pool scores.
	 */
	getCollisionScore() {
		let score = 0;
		for (let pool of this.pools) {
			score += pool.getCollisionScore();
		}
		return score;
	}

	/**
	 * Converts the list to an array of plain objects. Used by the analyze tool.
	 * @returns {Array<Object>} Array of plain objects, one for each pool. Each
	 *   will contain an individual collision score and an array of players.
	 */
	analyzePools() {
		return this.pools.map((pool) => ({
			collisionScore: pool.getCollisionScore(),
			players: pool.players
		}));
	}
}

module.exports = PoolList;

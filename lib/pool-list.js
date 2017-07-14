const _ = require('lodash');
const Pool = require('./pool');
const utils = require('./utils');

class PoolList {
	constructor(pools = []) {
		this.pools = pools;
	}

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

	getCollisionScore(ignoredRegion) {
		let score = 0;
		for (let pool of this.pools) {
			score += pool.getCollisionScore(ignoredRegion);
		}
		return score;
	}
}

module.exports = PoolList;

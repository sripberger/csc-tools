const _ = require('lodash');
const Pool = require('./pool');
const utils = require('./utils');

class Tournament {
	constructor(players, poolCount) {
		this.players = players;
		this.poolCount = poolCount;
	}

	getPools() {
		let pools = [];
		_.times(this.poolCount, () => pools.push(new Pool()));
		_.forEach(this.players, (player, seed) => {
			let poolIndex = utils.getPoolIndex(seed, this.poolCount);
			let pool = pools[poolIndex];
			pool.players.push(player);
		});
		return pools;
	}

	getMinimumCollisionScore(ignore) {
		let regionCounts = utils.getRegionCounts(this.players);
		let score = 0;
		_.forEach(regionCounts, (count, region) => {
			if (count > this.poolCount && region !== ignore) {
				let collisionCount = count - this.poolCount;
				let collisionCountPerPool = Math.floor(collisionCount / this.poolCount);
				let extraCollisionCount = count % this.poolCount;
				let nextTerm = 1;
				_.times(collisionCountPerPool, () => {
					score += nextTerm * this.poolCount;
					nextTerm += 1;
				});
				score += extraCollisionCount * nextTerm;
			}
		});
		return score;
	}
}

module.exports = Tournament;

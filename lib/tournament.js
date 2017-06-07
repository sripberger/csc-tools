const _ = require('lodash');
const Pool = require('./pool');
const utils = require('./utils');

class Tournament {
	constructor(players = [], poolCount = 1) {
		this.players = players;
		this.poolCount = poolCount;
	}

	getRegionCounts() {
		if (!this._regionCounts) {
			this._regionCounts = utils.getRegionCounts(this.players);
		}
		return this._regionCounts;
	}

	getIgnoredRegion() {
		if (!this._ignoredRegion) {
			let highestCount = 0;
			_.forEach(this.getRegionCounts(), (count, region) => {
				if (count > highestCount) {
					highestCount = count;
					this._ignoredRegion = region;
				}
			});
		}
		return this._ignoredRegion;
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
		let regionCounts = this.getRegionCounts();
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

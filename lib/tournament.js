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

	getMinimumCollisionScore() {
		if (!_.isNumber(this._minimumCollisionScore)) {
			this._minimumCollisionScore = utils.getMinimumCollisionScore(
				this.getRegionCounts(),
				this.poolCount,
				this.getIgnoredRegion()
			);
		}
		return this._minimumCollisionScore;
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

	getCollisionScore() {
		if (!_.isNumber(this._collisionScore)) {
			this._collisionScore = 0;
			let ignoredRegion = this.getIgnoredRegion();
			for (let pool of this.getPools()) {
				this._collisionScore += pool.getCollisionScore(ignoredRegion);
			}
		}
		return this._collisionScore;
	}
}

module.exports = Tournament;

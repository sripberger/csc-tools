const _ = require('lodash');
const Pool = require('./pool');
const utils = require('./utils');

class Tournament {
	constructor(players = [], settings = {}) {
		this.players = players;
		this.poolCount = settings.poolCount || 1;
		this.ignoredRegion = settings.ignoredRegion || null;
		this.targetCollisionScore = settings.targetCollisionScore || 0;
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
		let score = 0;
		for (let pool of this.getPools()) {
			score += pool.getCollisionScore(this.ignoredRegion);
		}
		return score;
	}

	getFitnessScore() {
		if (!_.isNumber(this._fitnessScore)) {
			let diff = this.getCollisionScore() - this.targetCollisionScore;
			this._fitnessScore = 1 / diff;
		}
		return this._fitnessScore;
	}
}

module.exports = Tournament;

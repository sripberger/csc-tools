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
		if (!_.isNumber(this._collisionScore)) {
			this._collisionScore = 0;
			for (let pool of this.getPools()) {
				this._collisionScore += pool.getCollisionScore(this.ignoredRegion);
			}
		}
		return this._collisionScore;
	}

	getFitnessScore() {
		if (!_.isNumber(this._fitnessScore)) {
			let difference = this.getCollisionScore() - this.targetCollisionScore;
			this._fitnessScore = 1 / difference;
		}
		return this._fitnessScore;
	}
}

module.exports = Tournament;

const _ = require('lodash');
const RankList = require('./rank-list');
const Pool = require('./pool');
const utils = require('./utils');

class Tournament {
	constructor(rankList = new RankList(), settings = {}) {
		this.rankList = rankList;
		this.settings = settings;
	}

	getPools() {
		let { poolCount } = this.settings;
		let pools = _.times(poolCount, () => new Pool());
		let seed = 0;
		for (let player of this.rankList.seedOrder()) {
			let poolIndex = utils.getPoolIndex(seed, poolCount);
			let pool = pools[poolIndex];
			pool.players.push(player);
			seed += 1;
		}
		return pools;
	}

	getCollisionScore() {
		let { ignoredRegion } = this.settings;
		let score = 0;
		for (let pool of this.getPools()) {
			score += pool.getCollisionScore(ignoredRegion);
		}
		return score;
	}

	getFitnessScore() {
		let { targetCollisionScore } = this.settings;
		if (!_.isNumber(this._fitnessScore)) {
			let diff = this.getCollisionScore() - targetCollisionScore;
			this._fitnessScore = 1 / diff;
		}
		return this._fitnessScore;
	}

	isSolution() {
		return this.getCollisionScore() === Infinity;
	}
}

module.exports = Tournament;

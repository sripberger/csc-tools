// TODO: Add gene-lib dependency once it is published.
const { Individual } = require('gene-lib');
const _ = require('lodash');
const RankList = require('./rank-list');
const Pool = require('./pool');
const utils = require('./utils');

class Tournament extends Individual {
	constructor(rankList = new RankList(), settings = {}) {
		super();
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

	calculateFitnessScore() {
		let { targetCollisionScore } = this.settings;
		let diff = this.getCollisionScore() - targetCollisionScore;
		return 1 / diff;
	}

	crossover(other, rate) {
		if (_.random(0, 1, true) >= rate) return [ this, other ];
		return this.rankList.crossover(other.rankList)
			.map((rankList) => new Tournament(rankList, this.settings));
	}

	mutate(rate) {
		return new Tournament(this.rankList.mutate(rate), this.settings);
	}
}

module.exports = Tournament;

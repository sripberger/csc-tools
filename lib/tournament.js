// TODO: Add gene-lib dependency once it is published.
const { Individual } = require('gene-lib');
const RankList = require('./rank-list');
const PoolList = require('./pool-list');

class Tournament extends Individual {
	constructor(rankList = new RankList(), settings = {}) {
		super();
		this.rankList = rankList;
		this.settings = settings;
	}

	getPlayers() {
		return [...this.rankList.seedOrder()];
	}

	getPoolList() {
		return PoolList.create(
			this.rankList.seedOrder(),
			this.settings.poolCount || 1
		);
	}

	getCollisionScore() {
		let poolList = this.getPoolList();
		return poolList.getCollisionScore(this.settings.ignoredRegion);
	}

	calculateFitnessScore() {
		let { targetCollisionScore } = this.settings;
		let diff = this.getCollisionScore() - (targetCollisionScore || 0);
		return 1 / diff;
	}

	crossover(other) {
		return this.rankList.crossover(other.rankList)
			.map((rankList) => new Tournament(rankList, this.settings));
	}

	mutate(rate) {
		return new Tournament(this.rankList.mutate(rate), this.settings);
	}
}

module.exports = Tournament;

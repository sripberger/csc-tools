const _ = require('lodash');
const RankList = require('./rank-list');
const utils = require('./utils');
const Tournament = require('./tournament');

class TournamentGenerator {
	constructor(rankList = new RankList(), poolCount = 1) {
		this.rankList = rankList;
		this.poolCount = poolCount;
	}

	static create(players, poolCount) {
		return new TournamentGenerator(RankList.create(players), poolCount);
	}

	getRegionCounts() {
		if (!this._regionCounts) {
			let players = [...this.rankList.seedOrder()];
			this._regionCounts = utils.getRegionCounts(players);
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

	getTournamentSettings() {
		if (!this._tournamentSettings) {
			this._tournamentSettings = {
				poolCount: this.poolCount,
				ignoredRegion: this.getIgnoredRegion(),
				targetCollisionScore: this.getMinimumCollisionScore()
			};
		}
		return this._tournamentSettings;
	}

	generateTournament() {
		return new Tournament(
			this.rankList.shuffle(),
			this.getTournamentSettings()
		);
	}
}

module.exports = TournamentGenerator;

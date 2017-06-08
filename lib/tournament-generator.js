const _ = require('lodash');
const utils = require('./utils');

class TournamentGenerator {
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
}

module.exports = TournamentGenerator;

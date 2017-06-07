const utils = require('./utils');
const _ = require('lodash');

class Pool {
	constructor(players = []) {
		this.players = players;
	}

	getCollisionScore(ignoredRegion) {
		let score = 0;
		let regionCounts = utils.getRegionCounts(this.players);
		_.forEach(regionCounts, (count, region) => {
			if (region !== ignoredRegion) {
				let nextTerm = 1;
				_.times(count - 1, () => {
					score += nextTerm;
					nextTerm += 1;
				});
			}
		});
		return score;
	}
}

module.exports = Pool;

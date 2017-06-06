const utils = require('./utils');
const _ = require('lodash');

class Pool {
	constructor(players = []) {
		this.players = players;
	}

	countCollisions(ignore) {
		let collisionCount = 0;
		_.forEach(utils.getRegionCounts(this.players), (count, region) => {
			if (count > 1 && region !== ignore) {
				collisionCount += count - 1;
			}
		});
		return collisionCount;
	}
}

module.exports = Pool;

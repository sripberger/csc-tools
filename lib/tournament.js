const _ = require('lodash');
const Pool = require('./pool');
const utils = require('./utils');

class Tournament {
	constructor(players, poolCount) {
		this.players = players;
		this.poolCount = poolCount;
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
}

module.exports = Tournament;

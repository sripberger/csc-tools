const _ = require('lodash');

exports.getPoolIndex = function(seed, poolCount) {
	let loopSize = 2 * poolCount;
	let loopPosition = seed % loopSize;
	if (loopPosition < poolCount) return loopPosition;
	return loopSize - loopPosition - 1;
};

exports.getPools = function(players, poolCount) {
	let pools = [];
	_.times(poolCount, () => pools.push([]));
	_.forEach(players, (player, seed) => {
		let pool = pools[exports.getPoolIndex(seed, poolCount)];
		pool.push(player);
	});
	return pools;
};

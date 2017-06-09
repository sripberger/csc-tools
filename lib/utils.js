const _ = require('lodash');

exports.shuffleArray = require('shuffle-array');

exports.getPoolIndex = function(seed, poolCount) {
	let loopSize = 2 * poolCount;
	let loopPosition = seed % loopSize;
	if (loopPosition < poolCount) return loopPosition;
	return loopSize - loopPosition - 1;
};

exports.getRegionCounts = function(players) {
	let regionCounts = {};
	for (let { region } of players) {
		if (!_.isNumber(regionCounts[region])) {
			regionCounts[region] = 1;
		} else {
			regionCounts[region] += 1;
		}
	}
	return regionCounts;
};

exports.getMinimumCollisionScore = function(regionCounts, poolCount, ignoredRegion) {
	let score = 0;
	_.forEach(regionCounts, (count, region) => {
		if (count > poolCount && region !== ignoredRegion) {
			let collisionCount = count - poolCount;
			let collisionCountPerPool = Math.floor(collisionCount / poolCount);
			let extraCollisionCount = count % poolCount;
			let nextTerm = 1;
			_.times(collisionCountPerPool, () => {
				score += nextTerm * poolCount;
				nextTerm += 1;
			});
			score += extraCollisionCount * nextTerm;
		}
	});
	return score;
};

exports.getRankGroups = function(players) {
	let groups = [];
	let playersByRank = _.groupBy(players, 'rank');
	for (let rank of _.keys(playersByRank).sort()) {
		groups.push(playersByRank[rank]);
	}
	return groups;
};

exports.getCrossoverStart = function(length) {
	return _.random(0, length - 1);
};

exports.getCrossoverEnd = function(start, length) {
	return _.random(start + 1, (start) ? length : length - 1);
};

exports.getCrossoverRange = function(length) {
	let start = exports.getCrossoverStart(length);
	let end = exports.getCrossoverEnd(start, length);
	return [ start, end ];
};

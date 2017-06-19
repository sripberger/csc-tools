const _ = require('lodash');
const shuffleArray = require('shuffle-array');

exports.shuffleArray = shuffleArray;

exports.pickFromArray = function(array, count) {
	return shuffleArray.pick(array, { picks: count });
};

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

exports.getCrossoverRange = function(length) {
	let a = _.random(0, length);
	let b = _.random(0, length);
	return (a < b) ? [ a, b ] : [ b, a ];
};

exports.pmx = function(left, right) {
	let [ start, end ] = exports.getCrossoverRange(left.length);
	let leftCrossover = left.slice(start, end);
	let rightCrossover = right.slice(start, end);
	let leftChild = [];
	let rightChild = [];
	for (let i = 0; i < left.length; i += 1) {
		let leftItem, rightItem;
		if (i >= start && i < end) {
			// Copy items directly from opposite crossover slice.
			let crossoverIndex = i - start;
			leftItem = rightCrossover[crossoverIndex];
			rightItem = leftCrossover[crossoverIndex];
		} else {
			// Use relationship between crossover slices to prevent repeats.
			leftItem = resolvePmxItem(left[i], rightCrossover, leftCrossover);
			rightItem = resolvePmxItem(right[i], leftCrossover, rightCrossover);
		}
		leftChild.push(leftItem);
		rightChild.push(rightItem);
	}
	return [ leftChild, rightChild ];
};

exports.getMutationIndices = function(length, rate) {
	let indices = [];
	for (let i = 0; i < length; i += 1) {
		if (_.random(0, 1, true) < rate) indices.push(i);
	}
	return exports.shuffleArray(indices);
};

exports.getExchanges = function(length, rate) {
	let mutations = [];
	for (let index of exports.getMutationIndices(length, rate)) {
		mutations.push([ index, _.random(0, length - 1) ]);
	}
	return mutations;
};

exports.reciprocalExchange = function(array, rate) {
	let result = array.slice();
	for (let [ a, b ] of exports.getExchanges(array.length, rate)) {
		let itemA = result[a];
		let itemB = result[b];
		result[a] = itemB;
		result[b] = itemA;
	}
	return result;
};

function resolvePmxItem(item, incomingCrossover, outgoingCrossover) {
	while (_.includes(incomingCrossover, item)) {
		item = outgoingCrossover[incomingCrossover.indexOf(item)];
	}
	return item;
}

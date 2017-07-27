const _ = require('lodash');

/**
 * Internal utility functions.
 * @name utils
 * @kind module
 * @private
 */

/**
 * Returns pool index of provided seed. Follows snake-style seeding
 * pattern, as seen on smash.gg.
 * @memberof utils
 * @param {number} seed Zero-indexed seed.
 * @param {number} poolCount Number of pools in the tournament.
 * @return {number} Pool index.
 */
exports.getPoolIndex = function(seed, poolCount) {
	let loopSize = 2 * poolCount;
	let loopPosition = seed % loopSize;
	if (loopPosition < poolCount) return loopPosition;
	return loopSize - loopPosition - 1;
};

/**
 * Given an array of players, counts the number of players in each region.
 * @memberof utils
 * @param {Array<Object>} players Array of plain player objects, each with
 *   a string region property.
 * @returns {Object} Plain object map from region strings to the number of
 *    players with that same region string.
 */
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

/**
 * Given a set of region counts and a pool count, returns the lowest possible
 * total collision score for the entire tournament. Note that this score is
 * not necessarily attainable without moving players outside of their ranks,
 * though it likely will be unless most ranks are smaller than the pool count.
 * @memberof utils
 * @param {Object} regionCounts Plain object map from region strings to the
 *    number of players with that same region string.
 * @param {number} poolCount Number of pools in the tournament.
 * @returns {number} Minimum collision score.
 */
exports.getMinCollisionScore = function(regionCounts, poolCount) {
	let score = 0;
	_.forEach(regionCounts, (count) => {
		if (count > poolCount) {
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

/**
 * Given a set of region counts and a pool count, returns the lowest possible
 * collision score that any pool can have in the case of a solution. Pools can
 * potentially have lower scores, but if any such pools exist, the result
 * cannot be a solution.
 * @memberof utils
 * @param {Object} regionCounts Plain object map from region strings to the
 *    number of players with that same region string.
 * @param {number} poolCount Number of pools in the tournament.
 * @returns {number} Minimum per-pool collision score.
 */
exports.getMinPoolCollisionScore = function(regionCounts, poolCount) {
	let score = 0;
	_.forEach(regionCounts, (count) => {
		if (count > poolCount) {
			let collisionCount = count - poolCount;
			let collisionCountPerPool = Math.floor(collisionCount / poolCount);
			let nextTerm = 1;
			_.times(collisionCountPerPool, () => {
				score += nextTerm;
				nextTerm += 1;
			});
		}
	});
	return score;
};

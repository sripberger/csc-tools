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
 * Given a set of region counts, returns the region string with the highest
 * count. Assuming the region counts include all players in the tournament,
 * the resulting region should be ignored in collision score calculations.
 * @memberof utils
 * @param {Object} regionCounts Plain object map from region strings to the
 *    number of players with that same region string.
 * @returns {string} Highest-count region string.
 */
exports.getIgnoredRegion = function(regionCounts) {
	let highestCount = 0;
	let result = null;
	_.forEach(regionCounts, (count, region) => {
		if (count > highestCount) {
			highestCount = count;
			result = region;
		}
	});
	return result;
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
 * @param {string} [ignoredRegion] Region to ignore in calculation.
 * @returns {number} Minimum collision score.
 */
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

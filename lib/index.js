const _ = require('lodash');
const geneLib = require('gene-lib');
const TournamentGenerator = require('./tournament-generator');
const PoolList = require('./pool-list');
const utils = require('./utils');

/**
 * Returns collision scores and other information about the provided array of
 * players, assuming the order of the player array is the seed order for a
 * tournament with the provided pool count.
 *
 * @param {Array} players Array of player objects.
 * @param {number} poolCount Number of pools in the tournament.
 * @returns {Object} Will contain analysis results, including collisionScore,
 *   minimumCollisionScore, ignoredRegion, regionCounts, and pools.
 */
exports.analyze = function(players, poolCount) {
	let regionCounts = sortRegionCounts(utils.getRegionCounts(players));
	let ignoredRegion = utils.getIgnoredRegion(regionCounts);
	let poolList = PoolList.create(players, poolCount);
	return {
		collisionScore: poolList.getCollisionScore(ignoredRegion),
		minimumCollisionScore: utils.getMinimumCollisionScore(
			regionCounts,
			poolCount,
			ignoredRegion
		),
		ignoredRegion,
		regionCounts,
		pools: poolList.analyzePools(ignoredRegion)
	};
};

/**
 * Rearranges players within each rank, minimizing the overall collision score
 * by way of a genetic algorithm.
 *
 * @param {Array} players Array of player objects
 * @param {number} poolCount Number of pools in the tournament.
 * @returns {Array<Object>} A new array containing the same player objects,
 *   except with the optimized sort order.
 */
exports.solve = function(players, poolCount) {
	let generator = TournamentGenerator.create(players, poolCount);
	let tournament = geneLib.run({
		generationLimit: 1000,
		crossoverRate: 0.2,
		mutationRate: 0.05,
		createIndividual: generator.generateTournament.bind(generator)
	});
	return tournament.getPlayers();
};

/**
 * Returns copy of region count map, sorted by count.
 * @private
 * @param {Object} regionCounts region count map.
 * @returns {Object} Sorted region count map.
 */
function sortRegionCounts(regionCounts) {
	return _(regionCounts)
		.toPairs()
		.orderBy([ '1', '0' ], [ 'desc' ])
		.fromPairs()
		.value();
}

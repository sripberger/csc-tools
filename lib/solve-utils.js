const geneLib = require('gene-lib');
const TournamentGenerator = require('./tournament-generator');
const PoolList = require('./pool-list');
const utils = require('./utils');

exports.solve = function(players, poolCount) {
	let generator = TournamentGenerator.create(players, poolCount);
	let tournament = geneLib.run({
		crossoverRate: 0.2,
		mutationRate: 0.05,
		createIndividual: generator.generateTournament.bind(generator)
	});
	return tournament.getPlayers();
};

exports.analyze = function(players, poolCount) {
	let regionCounts = utils.getRegionCounts(players);
	let ignoredRegion = utils.getIgnoredRegion(regionCounts);
	let poolList = PoolList.create(players, poolCount);
	return {
		regionCounts,
		ignoredRegion,
		collisionScore: poolList.getCollisionScore(ignoredRegion),
		minimumCollisionScore: utils.getMinimumCollisionScore(
			regionCounts,
			poolCount,
			ignoredRegion
		)
	};
};

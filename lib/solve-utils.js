const geneLib = require('gene-lib');
const TournamentGenerator = require('./tournament-generator');
const PoolList = require('./pool-list');
const utils = require('./utils');

exports.getTournamentFactory = function(players, poolCount) {
	let generator = TournamentGenerator.create(players, poolCount);
	return generator.generateTournament.bind(generator);
};

exports.solve = function(players, poolCount) {
	let tournament = geneLib.run({
		crossoverRate: 0.2,
		mutationRate: 0.05,
		createIndividual: exports.getTournamentFactory(players, poolCount)
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

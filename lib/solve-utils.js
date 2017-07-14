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

exports.getIgnoredRegion = function(players) {
	return utils.getIgnoredRegion(utils.getRegionCounts(players));
};

exports.getCollisionScore = function(players, poolCount) {
	let ignoredRegion = exports.getIgnoredRegion(players);
	let poolList = PoolList.create(players, poolCount);
	return poolList.getCollisionScore(ignoredRegion);
};

exports.getMinimumCollisionScore = function(players, poolCount) {
	return utils.getMinimumCollisionScore(
		utils.getRegionCounts(players),
		poolCount,
		exports.getIgnoredRegion(players)
	);
};

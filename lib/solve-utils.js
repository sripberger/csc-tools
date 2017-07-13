const geneLib = require('gene-lib');
const TournamentGenerator = require('./tournament-generator');

exports.getTournamentFactory = function(players, poolCount) {
	let generator = TournamentGenerator.create(players, poolCount);
	return generator.generateTournament.bind(generator);
};

exports.solve = function(players, poolCount) {
	return geneLib.run({
		crossoverRate: 0.2,
		mutationRate: 0.05,
		createIndividual: exports.getTournamentFactory(players, poolCount)
	});
};

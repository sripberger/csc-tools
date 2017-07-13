const solveUtils = require('../../lib/solve-utils');
const sinon = require('sinon');
const geneLib = require('gene-lib');
const TournamentGenerator = require('../../lib/tournament-generator');
const Tournament = require('../../lib/tournament');

describe('solveUtils', function() {
	let sandbox;

	beforeEach(function() {
		sandbox = sinon.sandbox.create();
	});

	afterEach(function() {
		sandbox.restore();
	});

	describe('::getTournamentFactory', function() {
		it('returns bound TournamentGenerator::generateTournament', function() {
			let players = [ { tag: 'foo' }, { tag: 'bar' } ];
			let poolCount = 4;
			let generator = new TournamentGenerator();
			let { generateTournament } = generator;
			let factory = function factory() {};
			sandbox.stub(TournamentGenerator, 'create').returns(generator);
			sandbox.stub(generateTournament, 'bind').returns(factory);

			let result = solveUtils.getTournamentFactory(players, poolCount);

			expect(TournamentGenerator.create).to.be.calledOnce;
			expect(TournamentGenerator.create).to.be.calledOn(TournamentGenerator);
			expect(TournamentGenerator.create).to.be.calledWith(players, poolCount);
			expect(generateTournament.bind).to.be.calledOnce;
			expect(generateTournament.bind).to.be.calledOn(generateTournament);
			expect(generateTournament.bind).to.be.calledWith(generator);
			expect(result).to.equal(factory);
		});
	});

	describe('::solve', function() {
		it('runs genetic algorithm using gene-lib', function() {
			let players = [ { tag: 'foo' }, { tag: 'bar' } ];
			let poolCount = 4;
			let factory = function factory() {};
			let solution = new Tournament();
			sandbox.stub(solveUtils, 'getTournamentFactory').returns(factory);
			sandbox.stub(geneLib, 'run').returns(solution);

			let result = solveUtils.solve(players, poolCount);

			expect(solveUtils.getTournamentFactory).to.be.calledOnce;
			expect(solveUtils.getTournamentFactory).to.be.calledOn(solveUtils);
			expect(solveUtils.getTournamentFactory).to.be.calledWith(
				players,
				poolCount
			);
			expect(geneLib.run).to.be.calledOnce;
			expect(geneLib.run).to.be.calledOn(geneLib);
			expect(geneLib.run).to.be.calledWith({
				crossoverRate: 0.2,
				mutationRate: 0.05,
				createIndividual: factory
			});
			expect(result).to.equal(solution);
		});
	});
});

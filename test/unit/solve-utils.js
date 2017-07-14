const solveUtils = require('../../lib/solve-utils');
const sinon = require('sinon');
const geneLib = require('gene-lib');
const TournamentGenerator = require('../../lib/tournament-generator');
const Tournament = require('../../lib/tournament');
const PoolList = require('../../lib/pool-list');
const utils = require('../../lib/utils');

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
			let tournament = new Tournament();
			let solution = [ { tag: 'baz' }, { tag: 'qux' } ];
			sandbox.stub(solveUtils, 'getTournamentFactory').returns(factory);
			sandbox.stub(geneLib, 'run').returns(tournament);
			sandbox.stub(tournament, 'getPlayers').returns(solution);

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
			expect(tournament.getPlayers).to.be.calledOnce;
			expect(tournament.getPlayers).to.be.calledOn(tournament);
			expect(result).to.equal(solution);
		});
	});

	describe('::getIgnoredRegion', function() {
		it('returns ignored region for a player array', function() {
			let players = [ { tag: 'dude' }, { tag: 'bro' } ];
			let regionCounts = { foo: 1, bar: 2 };
			let ignoredRegion = 'ignoredRegion';
			sandbox.stub(utils, 'getRegionCounts').returns(regionCounts);
			sandbox.stub(utils, 'getIgnoredRegion').returns(ignoredRegion);

			let result = solveUtils.getIgnoredRegion(players);

			expect(utils.getRegionCounts).to.be.calledOnce;
			expect(utils.getRegionCounts).to.be.calledOn(utils);
			expect(utils.getRegionCounts).to.be.calledWith(players);
			expect(utils.getIgnoredRegion).to.be.calledOnce;
			expect(utils.getIgnoredRegion).to.be.calledOn(utils);
			expect(utils.getIgnoredRegion).to.be.calledWith(regionCounts);
			expect(result).to.equal(ignoredRegion);
		});
	});

	describe('::getCollisionScore', function() {
		it('returns the collision score of a player array', function() {
			let players = [ { tag: 'dude' }, { tag: 'bro' } ];
			let poolCount = 4;
			let ignoredRegion = 'ignored region';
			let poolList = new PoolList();
			sandbox.stub(solveUtils, 'getIgnoredRegion').returns(ignoredRegion);
			sandbox.stub(PoolList, 'create').returns(poolList);
			sandbox.stub(poolList, 'getCollisionScore').returns(5);

			let result = solveUtils.getCollisionScore(players, poolCount);

			expect(solveUtils.getIgnoredRegion).to.be.calledOnce;
			expect(solveUtils.getIgnoredRegion).to.be.calledOn(solveUtils);
			expect(solveUtils.getIgnoredRegion).to.be.calledWith(players);
			expect(PoolList.create).to.be.calledOnce;
			expect(PoolList.create).to.be.calledOn(PoolList);
			expect(PoolList.create).to.be.calledWith(players, poolCount);
			expect(poolList.getCollisionScore).to.be.calledOnce;
			expect(poolList.getCollisionScore).to.be.calledOn(poolList);
			expect(poolList.getCollisionScore).to.be.calledWith(ignoredRegion);
			expect(result).to.equal(5);
		});
	});

	describe('::getMinimumCollisionScore', function() {
		it('returns the minimum collision score of a player array', function() {
			let players = [ { tag: 'dude' }, { tag: 'bro' } ];
			let poolCount = 4;
			let regionCounts = { foo: 1, bar: 2 };
			let ignoredRegion = 'ignored region';
			sandbox.stub(utils, 'getRegionCounts').returns(regionCounts);
			sandbox.stub(solveUtils, 'getIgnoredRegion').returns(ignoredRegion);
			sandbox.stub(utils, 'getMinimumCollisionScore').returns(4);

			let result = solveUtils.getMinimumCollisionScore(players, poolCount);

			expect(utils.getRegionCounts).to.be.calledOnce;
			expect(utils.getRegionCounts).to.be.calledOn(utils);
			expect(utils.getRegionCounts).to.be.calledWith(players);
			expect(solveUtils.getIgnoredRegion).to.be.calledOnce;
			expect(solveUtils.getIgnoredRegion).to.be.calledOn(solveUtils);
			expect(solveUtils.getIgnoredRegion).to.be.calledWith(players);
			expect(utils.getMinimumCollisionScore).to.be.calledOnce;
			expect(utils.getMinimumCollisionScore).to.be.calledOn(utils);
			expect(utils.getMinimumCollisionScore).to.be.calledWith(
				regionCounts,
				poolCount,
				ignoredRegion
			);
			expect(result).to.equal(4);
		});
	});
});

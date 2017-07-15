const cscTools = require('../../lib');
const sinon = require('sinon');
const geneLib = require('gene-lib');
const TournamentGenerator = require('../../lib/tournament-generator');
const Tournament = require('../../lib/tournament');
const PoolList = require('../../lib/pool-list');
const utils = require('../../lib/utils');

describe('index', function() {
	let sandbox;

	beforeEach(function() {
		sandbox = sinon.sandbox.create();
	});

	afterEach(function() {
		sandbox.restore();
	});

	describe('::analyze', function() {
		it('returns analysis of provided player array', function() {
			let players = [ { tag: 'dude' }, { tag: 'bro' } ];
			let poolCount = 4;
			let regionCounts = { foo: 1, bar: 2 };
			let ignoredRegion = 'ignored region';
			let poolList = new PoolList();
			sandbox.stub(utils, 'getRegionCounts').returns(regionCounts);
			sandbox.stub(utils, 'getIgnoredRegion').returns(ignoredRegion);
			sandbox.stub(PoolList, 'create').returns(poolList);
			sandbox.stub(poolList, 'getCollisionScore').returns(5);
			sandbox.stub(utils, 'getMinimumCollisionScore').returns(4);

			let result = cscTools.analyze(players, poolCount);

			expect(utils.getRegionCounts).to.be.calledOnce;
			expect(utils.getRegionCounts).to.be.calledOn(utils);
			expect(utils.getRegionCounts).to.be.calledWith(players);
			expect(utils.getIgnoredRegion).to.be.calledOnce;
			expect(utils.getIgnoredRegion).to.be.calledOn(utils);
			expect(utils.getIgnoredRegion).to.be.calledWith(regionCounts);
			expect(PoolList.create).to.be.calledOnce;
			expect(PoolList.create).to.be.calledOn(PoolList);
			expect(PoolList.create).to.be.calledWith(players, poolCount);
			expect(poolList.getCollisionScore).to.be.calledOnce;
			expect(poolList.getCollisionScore).to.be.calledOn(poolList);
			expect(poolList.getCollisionScore).to.be.calledWith(ignoredRegion);
			expect(utils.getMinimumCollisionScore).to.be.calledOnce;
			expect(utils.getMinimumCollisionScore).to.be.calledOn(utils);
			expect(utils.getMinimumCollisionScore).to.be.calledWith(
				regionCounts,
				poolCount,
				ignoredRegion
			);
			expect(result).to.deep.equal({
				regionCounts,
				ignoredRegion,
				collisionScore: 5,
				minimumCollisionScore: 4
			});
		});
	});

	describe('::solve', function() {
		it('runs genetic algorithm using gene-lib', function() {
			let players = [ { tag: 'foo' }, { tag: 'bar' } ];
			let poolCount = 4;
			let generator = new TournamentGenerator();
			let { generateTournament } = generator;
			let factory = function factory() {};
			let tournament = new Tournament();
			let solution = [ { tag: 'baz' }, { tag: 'qux' } ];
			sandbox.stub(TournamentGenerator, 'create').returns(generator);
			sandbox.stub(generateTournament, 'bind').returns(factory);
			sandbox.stub(geneLib, 'run').returns(tournament);
			sandbox.stub(tournament, 'getPlayers').returns(solution);

			let result = cscTools.solve(players, poolCount);

			expect(TournamentGenerator.create).to.be.calledOnce;
			expect(TournamentGenerator.create).to.be.calledOn(TournamentGenerator);
			expect(TournamentGenerator.create).to.be.calledWith(players, poolCount);
			expect(generateTournament.bind).to.be.calledOnce;
			expect(generateTournament.bind).to.be.calledOn(generateTournament);
			expect(generateTournament.bind).to.be.calledWith(generator);
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
});

const cscTools = require('../../lib');
const sinon = require('sinon');
const _ = require('lodash');
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
		const poolCount = 4;
		let players, regionCounts, poolList, poolAnalysis, result;

		beforeEach(function() {
			players = [ { tag: 'dude' }, { tag: 'bro' } ];
			regionCounts = { foo: 2, bar: 3, baz: 1, asdf: 1 };
			poolList = new PoolList();
			poolAnalysis = [ { pool: 1 }, { pool: 2 } ];

			sandbox.stub(utils, 'getRegionCounts').returns(regionCounts);
			sandbox.stub(PoolList, 'create').returns(poolList);
			sandbox.stub(poolList, 'getCollisionScore').returns(5);
			sandbox.stub(poolList, 'analyzePools').returns(poolAnalysis);
			sandbox.stub(utils, 'getMinCollisionScore').returns(4);
			sandbox.stub(utils, 'getMinPoolCollisionScore').returns(1);

			result = cscTools.analyze(players, poolCount);
		});

		it('returns analysis of provided player array', function() {
			expect(utils.getRegionCounts).to.be.calledOnce;
			expect(utils.getRegionCounts).to.be.calledOn(utils);
			expect(utils.getRegionCounts).to.be.calledWith(players);
			expect(PoolList.create).to.be.calledOnce;
			expect(PoolList.create).to.be.calledOn(PoolList);
			expect(PoolList.create).to.be.calledWith(players, poolCount);
			expect(poolList.getCollisionScore).to.be.calledOnce;
			expect(poolList.getCollisionScore).to.be.calledOn(poolList);
			expect(poolList.analyzePools).to.be.calledOnce;
			expect(poolList.analyzePools).to.be.calledOn(poolList);
			expect(utils.getMinCollisionScore).to.be.calledOnce;
			expect(utils.getMinCollisionScore).to.be.calledOn(utils);
			expect(utils.getMinCollisionScore).to.be.calledWith(
				regionCounts,
				poolCount
			);
			expect(utils.getMinPoolCollisionScore).to.be.calledOnce;
			expect(utils.getMinPoolCollisionScore).to.be.calledOn(utils);
			expect(utils.getMinPoolCollisionScore).to.be.calledWith(
				regionCounts,
				poolCount
			);
			expect(result).to.deep.equal({
				collisionScore: 5,
				minCollisionScore: 4,
				minPoolCollisionScore: 1,
				regionCounts,
				pools: poolAnalysis
			});
		});

		it('sorts keys appropriately for output', function() {
			expect(_.keys(result)).to.deep.equal([
				'collisionScore',
				'minCollisionScore',
				'minPoolCollisionScore',
				'regionCounts',
				'pools'
			]);
			expect(_.keys(result.regionCounts)).to.deep.equal([
				'bar',
				'foo',
				'asdf',
				'baz'
			]);
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
				generationSize: 100,
				generationLimit: 1000,
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

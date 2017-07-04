const Tournament = require('../../lib/tournament');
// TODO: Add gene-lib dependency once it is published.
const { Individual } = require('gene-lib');
const sinon = require('sinon');
const RankList = require('../../lib/rank-list');
const utils = require('../../lib/utils');
const Pool = require('../../lib/pool');

describe('Tournament', function() {
	let sandbox;

	beforeEach(function() {
		sandbox = sinon.sandbox.create();
	});

	afterEach(function() {
		sandbox.restore();
	});

	it('extends gene-lib Individual class', function() {
		expect(new Tournament()).to.be.an.instanceof(Individual);
	});

	it('stores provided rank list and settings object', function() {
		let rankList = new RankList();
		let settings = { foo: 'bar' };

		let tournament = new Tournament(rankList, settings);

		expect(tournament.rankList).to.equal(rankList);
		expect(tournament.settings).to.equal(settings);
	});

	it('defaults to empty rank list and settings object', function() {
		let tournament = new Tournament();

		expect(tournament.rankList).to.be.an.instanceof(RankList);
		expect(tournament.rankList.ranks).to.deep.equal([]);
		expect(tournament.settings).to.deep.equal({});
	});

	describe('#getPools', function() {
		it('arranges players into pools using utils::getPoolIndex', function() {
			let rankList = new RankList();
			let poolCount = 4;
			let tournament = new Tournament(rankList, { poolCount });
			sandbox.stub(rankList, 'seedOrder').returns({
				[Symbol.iterator]: function*() {
					yield { tag: 'foo' };
					yield { tag: 'bar' };
					yield { tag: 'baz' };
					yield { tag: 'qux' };
				}
			});
			sandbox.stub(utils, 'getPoolIndex')
				.withArgs(0, poolCount).returns(0)
				.withArgs(1, poolCount).returns(1)
				.withArgs(2, poolCount).returns(2)
				.withArgs(3, poolCount).returns(2);


			let result = tournament.getPools();

			expect(rankList.seedOrder).to.be.calledOnce;
			expect(rankList.seedOrder).to.be.calledOn(rankList);
			expect(utils.getPoolIndex).to.have.callCount(4);
			expect(utils.getPoolIndex).to.always.be.calledOn(utils);
			expect(utils.getPoolIndex).to.be.calledWith(0, poolCount);
			expect(utils.getPoolIndex).to.be.calledWith(1, poolCount);
			expect(utils.getPoolIndex).to.be.calledWith(2, poolCount);
			expect(utils.getPoolIndex).to.be.calledWith(3, poolCount);
			expect(result).to.be.an.instanceof(Array);
			expect(result).to.have.length(poolCount);
			expect(result[0]).to.be.an.instanceof(Pool);
			expect(result[0].players).to.deep.equal([ { tag: 'foo' } ]);
			expect(result[1]).to.be.an.instanceof(Pool);
			expect(result[1].players).to.deep.equal([ { tag: 'bar' } ]);
			expect(result[2]).to.be.an.instanceof(Pool);
			expect(result[2].players).to.deep.equal([ { tag: 'baz' }, { tag: 'qux' } ]);
			expect(result[3]).to.be.an.instanceof(Pool);
			expect(result[3].players).to.deep.equal([]);
		});
	});

	describe('#getCollisionScore', function() {
		it('returns sum of collision scores from all pools', function() {
			let ignoredRegion = 'baz';
			let tournament = new Tournament([], { ignoredRegion });
			let fooPool = new Pool([ { tag: 'foo' }]);
			let barPool = new Pool([ { tag: 'bar' }]);
			sandbox.stub(tournament, 'getPools').returns([ fooPool, barPool ]);
			sandbox.stub(fooPool, 'getCollisionScore').returns(2);
			sandbox.stub(barPool, 'getCollisionScore').returns(3);

			let result = tournament.getCollisionScore();

			expect(tournament.getPools).to.be.calledOnce;
			expect(tournament.getPools).to.be.calledOn(tournament);
			expect(fooPool.getCollisionScore).to.be.calledOnce;
			expect(fooPool.getCollisionScore).to.be.calledOn(fooPool);
			expect(fooPool.getCollisionScore).to.be.calledWith(ignoredRegion);
			expect(barPool.getCollisionScore).to.be.calledOnce;
			expect(barPool.getCollisionScore).to.be.calledOn(barPool);
			expect(barPool.getCollisionScore).to.be.calledWith(ignoredRegion);
			expect(result).to.equal(5);
		});
	});

	describe('#calculateFitnessScore', function() {
		it('returns inverse of difference between collision score and target', function() {
			let tournament = new Tournament([], { targetCollisionScore: 1 });
			sandbox.stub(tournament, 'getCollisionScore').returns(3);

			let result = tournament.calculateFitnessScore();

			expect(tournament.getCollisionScore).to.be.calledOnce;
			expect(tournament.getCollisionScore).to.be.calledOn(tournament);
			expect(result).to.equal(0.5);
		});
	});

	describe('#crossover', function() {
		it('returns crossed-over copies', function() {
			let foo = new Tournament();
			let bar = new Tournament();
			let fooRanks = foo.rankList;
			let barRanks = bar.rankList;
			let fooBarRanks = new RankList();
			let barFooRanks = new RankList();
			sandbox.stub(fooRanks, 'crossover').returns([
				fooBarRanks,
				barFooRanks
			]);

			let result = foo.crossover(bar);

			expect(fooRanks.crossover).to.be.calledOnce;
			expect(fooRanks.crossover).to.be.calledOn(fooRanks);
			expect(fooRanks.crossover).to.be.calledWith(
				sinon.match.same(barRanks)
			);
			expect(result).to.be.an.instanceof(Array);
			expect(result).to.have.length(2);
			expect(result[0]).to.be.an.instanceof(Tournament);
			expect(result[0].rankList).to.equal(fooBarRanks);
			expect(result[0].settings).to.equal(foo.settings);
			expect(result[1]).to.be.an.instanceof(Tournament);
			expect(result[1].rankList).to.equal(barFooRanks);
			expect(result[1].settings).to.equal(foo.settings);
		});
	});

	describe('#mutate', function() {
		it('returns copy mutated with provided rate', function() {
			let rate = 0.1;
			let rankList = new RankList();
			let mutatedRankList = new RankList();
			let tournament = new Tournament(rankList, { foo: 'bar' });
			sandbox.stub(rankList, 'mutate').returns(mutatedRankList);

			let result = tournament.mutate(rate);

			expect(rankList.mutate).to.be.calledOnce;
			expect(rankList.mutate).to.be.calledOn(rankList);
			expect(rankList.mutate).to.be.calledWith(rate);
			expect(result).to.be.an.instanceof(Tournament);
			expect(result.rankList).to.equal(mutatedRankList);
			expect(result.settings).to.equal(tournament.settings);
		});
	});
});

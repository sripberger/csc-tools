const Tournament = require('../../lib/tournament');
const sinon = require('sinon');
const RankList = require('../../lib/rank-list');
const utils = require('../../lib/utils');
const Pool = require('../../lib/pool');
const _ = require('lodash');

describe('Tournament', function() {
	let sandbox;

	beforeEach(function() {
		sandbox = sinon.sandbox.create();
	});

	afterEach(function() {
		sandbox.restore();
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

	describe('#getFitnessScore', function() {
		let tournament;

		beforeEach(function() {
			tournament = new Tournament([], { targetCollisionScore: 1 });
			sandbox.stub(tournament, 'getCollisionScore').returns(3);
		});

		it('returns inverse of difference between collision score and target', function() {
			let result = tournament.getFitnessScore();

			expect(tournament.getCollisionScore).to.be.calledOnce;
			expect(tournament.getCollisionScore).to.be.calledOn(tournament);
			expect(result).to.equal(0.5);
		});

		it('caches numeric result', function() {
			tournament.getFitnessScore();
			sandbox.resetHistory();

			let result = tournament.getFitnessScore();

			expect(tournament.getCollisionScore).to.be.not.be.called;
			expect(result).to.equal(0.5);
		});

		it('caches NaN result', function() {
			tournament.getCollisionScore.returns(NaN);
			tournament.getFitnessScore();
			sandbox.resetHistory();

			let result = tournament.getFitnessScore();

			expect(tournament.getCollisionScore).to.be.not.be.called;
			expect(result).to.be.NaN;
		});
	});

	describe('#isSolution', function() {
		let tournament;

		beforeEach(function() {
			tournament = new Tournament();
			sandbox.stub(tournament, 'getFitnessScore');
		});

		it('returns true if fitness score is Infinity', function() {
			tournament.getFitnessScore.returns(Infinity);

			let result = tournament.isSolution();

			expect(tournament.getFitnessScore).to.be.calledOnce;
			expect(tournament.getFitnessScore).to.be.calledOn(tournament);
			expect(result).to.be.true;
		});

		it('returns false otherwise', function() {
			tournament.getFitnessScore.returns(42);

			let result = tournament.isSolution();

			expect(tournament.getFitnessScore).to.be.calledOnce;
			expect(tournament.getFitnessScore).to.be.calledOn(tournament);
			expect(result).to.be.false;
		});
	});

	describe('crossover', function() {
		const rate = 0.5;
		let foo, bar, fooRanks, barRanks, fooBarRanks, barFooRanks;

		beforeEach(function() {
			foo = new Tournament();
			bar = new Tournament();
			fooRanks = foo.rankList;
			barRanks = bar.rankList;
			fooBarRanks = new RankList();
			barFooRanks = new RankList();

			sandbox.stub(_, 'random');
			sandbox.stub(fooRanks, 'crossover').returns([
				fooBarRanks,
				barFooRanks
			]);
		});

		it('gets a random float between 0 and 1', function() {
			foo.crossover(bar, rate);

			expect(_.random).to.be.calledOnce;
			expect(_.random).to.be.calledOn(_);
			expect(_.random).to.be.calledWith(0, 1, true);
		});

		context('random float less than rate', function() {
			it('returns crossed-over copies', function() {
				_.random.returns(0.49);

				let result = foo.crossover(bar, rate);

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

		context('random float greater than rate', function() {
			it('returns instance and other as-is', function() {
				_.random.returns(0.51);

				let result = foo.crossover(bar, rate);

				expect(fooRanks.crossover).to.not.be.called;
				expect(result).to.deep.equal([ foo, bar ]);
			});
		});

		context('random float equal to rate', function() {
			it('returns instance and other as-is', function() {
				_.random.returns(0.5);

				let result = foo.crossover(bar, rate);

				expect(fooRanks.crossover).to.not.be.called;
				expect(result).to.deep.equal([ foo, bar ]);
			});
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

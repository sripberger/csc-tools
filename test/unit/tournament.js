const Tournament = require('../../lib/tournament');
// TODO: Add gene-lib dependency once it is published.
const { Individual } = require('gene-lib');
const sinon = require('sinon');
const RankList = require('../../lib/rank-list');
const PoolList = require('../../lib/pool-list');

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

	describe('#getPoolList', function() {
		it('arranges players into pools using utils::getPoolIndex', function() {
			let rankList = new RankList();
			let poolCount = 4;
			let tournament = new Tournament(rankList, { poolCount });
			let players = {
				[Symbol.iterator]: function*() {
					yield { tag: 'foo' };
					yield { tag: 'bar' };
				}
			};
			let poolList = new PoolList();
			sandbox.stub(rankList, 'seedOrder').returns(players);
			sandbox.stub(PoolList, 'create').returns(poolList);

			let result = tournament.getPoolList();

			expect(rankList.seedOrder).to.be.calledOnce;
			expect(rankList.seedOrder).to.be.calledOn(rankList);
			expect(PoolList.create).to.be.calledOnce;
			expect(PoolList.create).to.be.calledOn(PoolList);
			expect(PoolList.create).to.be.calledWith(players, poolCount);
			expect(result).to.equal(poolList);
		});
	});

	describe('#getCollisionScore', function() {
		it('returns collision score from pool list', function() {
			let ignoredRegion = 'baz';
			let tournament = new Tournament(new RankList(), { ignoredRegion });
			let poolList = new PoolList();
			sinon.stub(tournament, 'getPoolList').returns(poolList);
			sinon.stub(poolList, 'getCollisionScore').returns(5);

			let result = tournament.getCollisionScore();

			expect(tournament.getPoolList).to.be.calledOnce;
			expect(tournament.getPoolList).to.be.calledOn(tournament);
			expect(poolList.getCollisionScore).to.be.calledOnce;
			expect(poolList.getCollisionScore).to.be.calledOn(poolList);
			expect(poolList.getCollisionScore).to.be.calledWith(ignoredRegion);
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

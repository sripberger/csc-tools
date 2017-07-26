const TournamentGenerator = require('../../lib/tournament-generator');
const sinon = require('sinon');
const RankList = require('../../lib/rank-list');
const utils = require('../../lib/utils');
const Tournament = require('../../lib/tournament');

describe('TournamentGenerator', function() {
	let sandbox;

	beforeEach(function() {
		sandbox = sinon.sandbox.create();
	});

	afterEach(function() {
		sandbox.restore();
	});

	it('stores provided rank list and pool count', function() {
		let rankList = new RankList();
		let poolCount = 4;

		let generator = new TournamentGenerator(rankList, poolCount);

		expect(generator.rankList).to.equal(rankList);
		expect(generator.poolCount).to.equal(poolCount);
	});

	it('defaults to empty rank list with a pool count of 1', function() {
		let generator = new TournamentGenerator();

		expect(generator.rankList).to.be.an.instanceof(RankList);
		expect(generator.rankList.ranks).to.deep.equal([]);
		expect(generator.poolCount).to.equal(1);
	});

	describe('::create', function() {
		it('returns a TournamentGenerator with rank list created from provided player array', function() {
			let players = [
				{ tag: 'foo' },
				{ tag: 'bar' }
			];
			let poolCount = 2;
			let rankList = new RankList(players);
			sandbox.stub(RankList, 'create').returns(rankList);

			let result = TournamentGenerator.create(players, 2);

			expect(RankList.create).to.be.calledOnce;
			expect(RankList.create).to.be.calledOn(RankList);
			expect(RankList.create).to.be.calledWith(players);
			expect(result).to.be.an.instanceof(TournamentGenerator);
			expect(result.rankList).to.equal(rankList);
			expect(result.poolCount).to.equal(poolCount);
		});
	});

	describe('#getRegionCounts', function() {
		let generator, rankList;

		beforeEach(function() {
			generator = new TournamentGenerator();
			({ rankList } = generator);
			sandbox.stub(rankList, 'seedOrder').returns({
				[Symbol.iterator]: function*() {
					yield { tag: 'dude' };
					yield { tag: 'bro' };
				}
			});
			sandbox.stub(utils, 'getRegionCounts').returns({ foo: 1, bar: 2 });
		});

		it('returns region counts using utils::getRegionCounts', function() {
			let result = generator.getRegionCounts();

			expect(rankList.seedOrder).to.be.calledOnce;
			expect(rankList.seedOrder).to.be.calledOn(rankList);
			expect(utils.getRegionCounts).to.be.calledOnce;
			expect(utils.getRegionCounts).to.be.calledOn(utils);
			expect(utils.getRegionCounts).to.be.calledWith([
				{ tag: 'dude' },
				{ tag: 'bro' }
			]);
			expect(result).to.deep.equal({ foo: 1, bar: 2 });
		});

		it('caches result', function() {
			generator.getRegionCounts();
			sandbox.resetHistory();

			let result = generator.getRegionCounts();

			expect(rankList.seedOrder).to.not.be.called;
			expect(utils.getRegionCounts).to.not.be.called;
			expect(result).to.deep.equal({ foo: 1, bar: 2 });
		});
	});

	describe('#getMinimumCollisionScore', function() {
		let generator;

		beforeEach(function() {
			generator = new TournamentGenerator(new RankList(), 4);
			sandbox.stub(generator, 'getRegionCounts').returns({ foo: 1, bar: 2 });
			sandbox.stub(utils, 'getMinimumCollisionScore').returns(42);
		});

		it('returns minimum collison score using utils::getMinimumCollisionScore', function() {
			let result = generator.getMinimumCollisionScore();

			expect(generator.getRegionCounts).to.be.calledOnce;
			expect(generator.getRegionCounts).to.be.calledOn(generator);
			expect(utils.getMinimumCollisionScore).to.be.calledOnce;
			expect(utils.getMinimumCollisionScore).to.be.calledOn(utils);
			expect(utils.getMinimumCollisionScore).to.be.calledWith(
				{ foo: 1, bar: 2 },
				generator.poolCount
			);
			expect(result).to.equal(42);
		});

		it('caches nonzero result', function() {
			generator.getMinimumCollisionScore();
			sandbox.resetHistory();

			let result = generator.getMinimumCollisionScore();

			expect(generator.getRegionCounts).to.not.be.called;
			expect(utils.getMinimumCollisionScore).to.not.be.called;
			expect(result).to.equal(42);
		});

		it('caches zero result', function() {
			utils.getMinimumCollisionScore.returns(0);
			generator.getMinimumCollisionScore();
			sandbox.resetHistory();

			let result = generator.getMinimumCollisionScore();

			expect(generator.getRegionCounts).to.not.be.called;
			expect(utils.getMinimumCollisionScore).to.not.be.called;
			expect(result).to.equal(0);
		});
	});

	describe('#getTournamentSettings', function() {
		const minimumCollisionScore = 42;
		let generator;

		beforeEach(function() {
			generator = new TournamentGenerator(new RankList(), 4);
			sandbox.stub(generator, 'getMinimumCollisionScore')
				.returns(minimumCollisionScore);
		});

		it('returns a settings object for generated tournaments', function() {
			let result = generator.getTournamentSettings();

			expect(generator.getMinimumCollisionScore).to.be.calledOnce;
			expect(generator.getMinimumCollisionScore).to.be.calledOn(generator);
			expect(result).to.deep.equal({
				poolCount: generator.poolCount,
				targetCollisionScore: minimumCollisionScore
			});
		});

		it('caches result', function () {
			let firstResult = generator.getTournamentSettings();
			sandbox.resetHistory();

			let secondResult = generator.getTournamentSettings();

			expect(generator.getMinimumCollisionScore).to.not.be.called;
			expect(secondResult).to.equal(firstResult);
		});
	});

	describe('#generateTournament', function() {
		it('returns a Tournament with settings and shuffled rank list', function() {
			let generator = new TournamentGenerator();
			let { rankList } = generator;
			let shuffledList = new RankList();
			let tournamentSettings = { foo: 'bar '};
			sandbox.stub(rankList, 'shuffle').returns(shuffledList);
			sandbox.stub(generator, 'getTournamentSettings')
				.returns(tournamentSettings);

			let result = generator.generateTournament();

			expect(generator.getTournamentSettings).to.be.calledOnce;
			expect(generator.getTournamentSettings).to.be.calledOn(generator);
			expect(rankList.shuffle).to.be.calledOnce;
			expect(rankList.shuffle).to.be.calledOn(rankList);
			expect(result).to.be.an.instanceof(Tournament);
			expect(result.rankList).to.equal(shuffledList);
			expect(result.settings).to.equal(tournamentSettings);
		});
	});
});

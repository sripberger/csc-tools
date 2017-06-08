const TournamentGenerator = require('../../lib/tournament-generator');
const sinon = require('sinon');
const utils = require('../../lib/utils');

describe('TournamentGenerator', function() {
	let sandbox;

	beforeEach(function() {
		sandbox = sinon.sandbox.create();
	});

	afterEach(function() {
		sandbox.restore();
	});

	it('stores provided player array and pool count', function() {
		let players = [
			{ tag: 'foo' },
			{ tag: 'bar' }
		];
		let poolCount = 4;

		let generator = new TournamentGenerator(players, poolCount);

		expect(generator.players).to.equal(players);
		expect(generator.poolCount).to.equal(poolCount);
	});

	it('defaults to empty player array with a pool count of 1', function() {
		let generator = new TournamentGenerator();

		expect(generator.players).to.deep.equal([]);
		expect(generator.poolCount).to.equal(1);
	});

	describe('#getRegionCounts', function() {
		let generator;

		beforeEach(function() {
			generator = new TournamentGenerator([
				{ tag: 'dude' },
				{ tag: 'bro' }
			]);
			sandbox.stub(utils, 'getRegionCounts').returns({ foo: 1, bar: 2 });
		});

		it('returns region counts using utils::getRegionCounts', function() {
			let result = generator.getRegionCounts();

			expect(utils.getRegionCounts).to.be.calledOnce;
			expect(utils.getRegionCounts).to.be.calledOn(utils);
			expect(utils.getRegionCounts).to.be.calledWith(generator.players);
			expect(result).to.deep.equal({ foo: 1, bar: 2 });
		});

		it('caches result', function() {
			generator.getRegionCounts();
			sandbox.resetHistory();

			let result = generator.getRegionCounts();

			expect(utils.getRegionCounts).to.not.be.called;
			expect(result).to.deep.equal({ foo: 1, bar: 2 });
		});
	});

	describe('#getIgnoredRegion', function() {
		let generator;

		beforeEach(function() {
			generator = new TournamentGenerator();
			sandbox.stub(generator, 'getRegionCounts').returns({
				foo: 1,
				bar: 3,
				baz: 2
			});
		});

		it('returns the region with the highest count', function() {
			let result = generator.getIgnoredRegion();

			expect(generator.getRegionCounts).to.be.calledOnce;
			expect(generator.getRegionCounts).to.be.calledOn(generator);
			expect(result).to.equal('bar');
		});

		it('caches result', function() {
			generator.getIgnoredRegion();
			sandbox.resetHistory();

			let result = generator.getIgnoredRegion();

			expect(generator.getRegionCounts).to.not.be.called;
			expect(result).to.equal('bar');
		});
	});

	describe('#getMinimumCollisionScore', function() {
		let generator;

		beforeEach(function() {
			generator = new TournamentGenerator([], 4);
			sandbox.stub(generator, 'getRegionCounts').returns({ foo: 1, bar: 2 });
			sandbox.stub(generator, 'getIgnoredRegion').returns('baz');
			sandbox.stub(utils, 'getMinimumCollisionScore').returns(42);
		});

		it('returns minimum collison score using utils::getMinimumCollisionScore', function() {
			let result = generator.getMinimumCollisionScore();

			expect(generator.getRegionCounts).to.be.calledOnce;
			expect(generator.getRegionCounts).to.be.calledOn(generator);
			expect(generator.getIgnoredRegion).to.be.calledOnce;
			expect(generator.getIgnoredRegion).to.be.calledOn(generator);
			expect(utils.getMinimumCollisionScore).to.be.calledOnce;
			expect(utils.getMinimumCollisionScore).to.be.calledOn(utils);
			expect(utils.getMinimumCollisionScore).to.be.calledWith(
				{ foo: 1, bar: 2 },
				generator.poolCount,
				'baz'
			);
			expect(result).to.equal(42);
		});

		it('caches nonzero result', function() {
			generator.getMinimumCollisionScore();
			sandbox.resetHistory();

			let result = generator.getMinimumCollisionScore();

			expect(generator.getRegionCounts).to.not.be.called;
			expect(generator.getIgnoredRegion).to.not.be.called;
			expect(utils.getMinimumCollisionScore).to.not.be.called;
			expect(result).to.equal(42);
		});

		it('caches zero result', function() {
			utils.getMinimumCollisionScore.returns(0);
			generator.getMinimumCollisionScore();
			sandbox.resetHistory();

			let result = generator.getMinimumCollisionScore();

			expect(generator.getRegionCounts).to.not.be.called;
			expect(generator.getIgnoredRegion).to.not.be.called;
			expect(utils.getMinimumCollisionScore).to.not.be.called;
			expect(result).to.equal(0);
		});
	});
});

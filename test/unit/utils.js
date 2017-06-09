const utils = require('../../lib/utils');
const sinon = require('sinon');
const shuffleArray = require('shuffle-array');
const _ = require('lodash');

describe('utils', function() {
	let sandbox;

	beforeEach(function() {
		sandbox = sinon.sandbox.create();
	});

	afterEach(function() {
		sandbox.restore();
	});

	describe('::shuffleArray', function() {
		it('is shuffle-array module', function() {
			expect(utils.shuffleArray).to.equal(shuffleArray);
		});
	});

	describe('::getPoolIndex', function() {
		it('returns pool index of seed based on pool count', function() {
			// 2 pools
			expect(utils.getPoolIndex(0, 2)).to.equal(0);
			expect(utils.getPoolIndex(1, 2)).to.equal(1);
			expect(utils.getPoolIndex(2, 2)).to.equal(1);
			expect(utils.getPoolIndex(3, 2)).to.equal(0);
			expect(utils.getPoolIndex(4, 2)).to.equal(0);
			expect(utils.getPoolIndex(5, 2)).to.equal(1);
			expect(utils.getPoolIndex(6, 2)).to.equal(1);
			expect(utils.getPoolIndex(7, 2)).to.equal(0);

			// 3 pools
			expect(utils.getPoolIndex(0, 3)).to.equal(0);
			expect(utils.getPoolIndex(1, 3)).to.equal(1);
			expect(utils.getPoolIndex(2, 3)).to.equal(2);
			expect(utils.getPoolIndex(3, 3)).to.equal(2);
			expect(utils.getPoolIndex(4, 3)).to.equal(1);
			expect(utils.getPoolIndex(5, 3)).to.equal(0);
			expect(utils.getPoolIndex(6, 3)).to.equal(0);
			expect(utils.getPoolIndex(7, 3)).to.equal(1);
			expect(utils.getPoolIndex(8, 3)).to.equal(2);

			// 4 pools
			expect(utils.getPoolIndex(0, 4)).to.equal(0);
			expect(utils.getPoolIndex(1, 4)).to.equal(1);
			expect(utils.getPoolIndex(2, 4)).to.equal(2);
			expect(utils.getPoolIndex(3, 4)).to.equal(3);
			expect(utils.getPoolIndex(4, 4)).to.equal(3);
			expect(utils.getPoolIndex(5, 4)).to.equal(2);
			expect(utils.getPoolIndex(6, 4)).to.equal(1);
			expect(utils.getPoolIndex(7, 4)).to.equal(0);
			expect(utils.getPoolIndex(8, 4)).to.equal(0);
			expect(utils.getPoolIndex(9, 4)).to.equal(1);
			expect(utils.getPoolIndex(10, 4)).to.equal(2);
			expect(utils.getPoolIndex(11, 4)).to.equal(3);
		});
	});

	describe('::getRegionCounts', function() {
		it('returns map from regions to number of players in each', function() {
			expect(utils.getRegionCounts([
				{ region: 'foo' },
				{ region: 'bar' },
				{ region: 'baz' },
				{ region: 'bar' },
				{ region: 'baz' },
				{ region: 'baz' }
			])).to.deep.equal({ foo: 1, bar: 2, baz: 3 });
		});
	});

	describe('::getMinimumCollisionScore', function() {
		it('returns smallest possible collision score based on region counts and pool count', function() {
			expect(utils.getMinimumCollisionScore({
				foo: 4, // 1 single collision
				bar: 5, // 2 single collisions
				baz: 3, // 0 collisions
				qux: 1 // 0 collisions
			}, 3)).to.equal(3);
		});

		it('accounts for collisions with more than one duplicate', function() {
			expect(utils.getMinimumCollisionScore({
				foo: 9, // 3 single collisions, 1 double collision, (3 * 1) + (1 * 3) = 6
				bar: 15, // 1 double collision, 3 triple collisions, (1 * 3) + (3 * 6) = 21
				baz: 8, // 4 single collisions, (4 * 1)  = 4
				qux: 3 // 0 collisions
			}, 4)).to.equal(31);
		});

		it('supports ignoredRegion argument', function() {
			expect(utils.getMinimumCollisionScore({
				foo: 5, // Should be ignored
				bar: 6 // 2 single collisions
			}, 4, 'foo')).to.equal(2);
		});
	});

	describe('::getRankGroups', function() {
		it('divides and sorts players based on their ranks', function() {
			let players = [
				{ tag: 'a', rank: 1 },
				{ tag: 'b', rank: 1 },
				{ tag: 'c', rank: 2 },
				{ tag: 'd', rank: 2 },
				{ tag: 'e', rank: 1.5 },
				{ tag: 'f', rank: 1.5 },
				{ tag: 'g', rank: 1 }
			];

			expect(utils.getRankGroups(players)).to.deep.equal([
				[ players[0], players[1], players[6] ],
				[ players[4], players[5] ],
				[ players[2], players[3] ],
			]);
		});
	});

	describe('::getCrossoverStart', function() {
		it('returns a random integer between 0 and last index', function() {
			let length = 10;
			sandbox.stub(_, 'random').returns(7);

			let result = utils.getCrossoverStart(length);

			expect(_.random).to.be.calledOnce;
			expect(_.random).to.be.calledOn(_);
			expect(_.random).to.be.calledWith(0, length - 1);
			expect(result).to.equal(7);
		});
	});

	describe('::getCrossoverEnd', function() {
		const length = 10;

		it('returns a random index after start', function() {
			let start = 3;
			sandbox.stub(_, 'random').returns(7);

			let result = utils.getCrossoverEnd(start, length);

			expect(_.random).to.be.calledOnce;
			expect(_.random).to.be.calledOn(_);
			expect(_.random).to.be.calledWith(start + 1, length);
			expect(result).to.equal(7);
		});

		it('returns a random index between 1 and last index if start is 0', function() {
			sandbox.stub(_, 'random').returns(8);

			let result = utils.getCrossoverEnd(0, length);

			expect(_.random).to.be.calledOnce;
			expect(_.random).to.be.calledOn(_);
			expect(_.random).to.be.calledWith(1, length - 1);
			expect(result).to.equal(8);
		});
	});

	describe('::getCrossoverRange', function() {
		it('returns crossover start and end as a two-element array', function() {
			let length = 10;
			let start = 3;
			let end = 7;
			sandbox.stub(utils, 'getCrossoverStart').returns(start);
			sandbox.stub(utils, 'getCrossoverEnd').returns(end);

			let result = utils.getCrossoverRange(length);

			expect(utils.getCrossoverStart).to.be.calledOnce;
			expect(utils.getCrossoverStart).to.be.calledOn(utils);
			expect(utils.getCrossoverStart).to.be.calledWith(length);
			expect(utils.getCrossoverEnd).to.be.calledOnce;
			expect(utils.getCrossoverEnd).to.be.calledOn(utils);
			expect(utils.getCrossoverEnd).to.be.calledWith(start, length);
			expect(result).to.deep.equal([ start, end ]);
		});
	});
});

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

	describe('::pickFromArray', function() {
		it('returns result of shuffle-array pick method with provided count', function() {
			let array = [ 'foo', 'bar', 'baz' ];
			sandbox.stub(shuffleArray, 'pick').returns([ 'foo', 'baz' ]);

			let result = utils.pickFromArray(array, 2);

			expect(shuffleArray.pick).to.be.calledOnce;
			expect(shuffleArray.pick).to.be.calledOn(shuffleArray);
			expect(shuffleArray.pick).to.be.calledWith(array, { picks: 2 });
			expect(result).to.deep.equal([ 'foo', 'baz' ]);
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

	describe('::getCrossoverRange', function() {
		const length = 10;

		beforeEach(function() {
			sandbox.stub(_, 'random');
		});

		it('returns two random indices between 0 and length', function() {
			_.random
				.onFirstCall().returns(3)
				.onSecondCall().returns(7);

			let result = utils.getCrossoverRange(length);

			expect(_.random).to.be.calledTwice;
			expect(_.random).to.always.be.calledOn(_);
			expect(_.random).to.always.be.calledWithExactly(0, length);
			expect(result).to.deep.equal([ 3, 7 ]);
		});

		it('returns smaller of to results first', function() {
			_.random
				.onFirstCall().returns(7)
				.onSecondCall().returns(3);

			expect(utils.getCrossoverRange(length)).to.deep.equal([ 3, 7 ]);
		});
	});

	describe('::getMutationIndices', function() {
		it('returns two random incides between 0 length minus 1', function() {
			let length = 10;
			sandbox.stub(_, 'random')
				.onFirstCall().returns(3)
				.onSecondCall().returns(7);

			let result = utils.getMutationIndices(length);

			expect(_.random).to.be.calledTwice;
			expect(_.random).to.always.be.calledOn(_);
			expect(_.random).to.always.be.calledWith(0, length - 1);
			expect(result).to.deep.equal([ 3, 7 ]);
		});
	});

	describe('::pmx', function() {
		it('performs a partially-mapped crossover', function() {
			let left = [ 1, 2, 3, 4, 5, 6, 7 ];
			let right = [ 5, 4, 6, 7, 2, 1, 3 ];
			sandbox.stub(utils, 'getCrossoverRange').returns([ 2, 6 ]);

			let result = utils.pmx(left, right);

			expect(utils.getCrossoverRange).to.be.calledOnce;
			expect(utils.getCrossoverRange).to.be.calledOn(utils);
			expect(utils.getCrossoverRange).to.be.calledWith(left.length);
			expect(result).to.deep.equal([
				[ 3, 5, 6, 7, 2, 1, 4 ],
				[ 2, 7, 3, 4, 5, 6, 1 ]
			]);
		});
	});
});

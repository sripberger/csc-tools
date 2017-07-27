const utils = require('../../lib/utils');
const sinon = require('sinon');

describe('utils', function() {
	let sandbox;

	beforeEach(function() {
		sandbox = sinon.sandbox.create();
	});

	afterEach(function() {
		sandbox.restore();
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

	describe('::getMinCollisionScore', function() {
		it('returns smallest possible total collision score', function() {
			expect(utils.getMinCollisionScore({
				foo: 9, // 3 single collisions, 1 double collision, (3 * 1) + (1 * 3) = 6
				bar: 15, // 1 double collision, 3 triple collisions, (1 * 3) + (3 * 6) = 21
				baz: 8, // 4 single collisions, (4 * 1)  = 4
				qux: 3 // 0 collisions
			}, 4)).to.equal(31);
		});
	});

	describe('::getMinPoolCollisionScore', function() {
		it('returns per-pool minimum collision score of solution', function() {
			expect(utils.getMinPoolCollisionScore({
				foo: 9, // At least 2 per pool, 0 + 1 = 1
				bar: 15, // At least 3 per pool, 0 + 1 + 2 = 3
				baz: 8, // At least 2 per pool, 0 + 1 = 1
				qux: 5 // Some pools may have none
			}, 4)).to.equal(5);
		});
	});
});

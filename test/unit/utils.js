const utils = require('../../lib/utils');
const shuffleArray = require('shuffle-array');

describe('utils', function() {
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
});

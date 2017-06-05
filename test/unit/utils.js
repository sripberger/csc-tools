const utils = require('../../lib/utils');

describe('utils', function() {
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
});

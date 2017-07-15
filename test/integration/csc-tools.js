const cscTools = require('../../lib');
const csc5Players = require('../data/csc5-players.json');

describe('csc-tools', function() {
	const poolCount = 16;

	describe('::analyze', function() {
		it('returns analysis of provided player list', function() {
			expect(cscTools.analyze(csc5Players, poolCount)).to.deep.equal({
				regionCounts: {
					Cincinnati: 64,
					Colorado: 1,
					Columbus: 20,
					Dayton: 14,
					Indiana: 4,
					Kentucky: 9,
					NEOH: 8,
					Pittsburgh: 2
				},
				ignoredRegion: 'Cincinnati',
				collisionScore: 13,
				minimumCollisionScore: 4
			});
		});
	});

	describe('::solve', function() {
		it('minimizes regional collisions in pools', function() {
			let solution = cscTools.solve(csc5Players, poolCount);
			let { collisionScore, minimumCollisionScore } =
				cscTools.analyze(solution, poolCount);

			expect(collisionScore).to.equal(minimumCollisionScore);
		});
	});
});

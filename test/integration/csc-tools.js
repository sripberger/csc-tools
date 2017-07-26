const cscTools = require('../../lib');
const csc5Players = require('../data/csc5-players.json');
const csc5Analysis = require('../data/csc5-analysis.json');

describe('csc-tools', function() {
	const poolCount = 16;
	this.timeout(10000);

	describe('::analyze', function() {
		it('returns analysis of provided player list', function() {
			expect(cscTools.analyze(csc5Players, poolCount))
				.to.deep.equal(csc5Analysis);
		});
	});

	describe('::solve', function() {
		it('minimizes regional collisions in pools', function() {
			let solution = cscTools.solve(csc5Players, poolCount);
			let { collisionScore } = cscTools.analyze(solution, poolCount);

			expect(collisionScore).to.equal(csc5Analysis.minimumCollisionScore);
		});
	});
});

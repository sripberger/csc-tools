const cscTools = require('../../lib');
const players = require('../data/players.json');
const analysis = require('../data/analysis.json');

describe('csc-tools', function() {
	const poolCount = 16;
	this.timeout(10000);

	describe('::analyze', function() {
		it('returns analysis of provided player list', function() {
			expect(cscTools.analyze(players, poolCount))
				.to.deep.equal(analysis);
		});
	});

	describe('::solve', function() {
		it('minimizes regional collisions in pools', function() {
			let solution = cscTools.solve(players, poolCount);
			let { collisionScore } = cscTools.analyze(solution, poolCount);

			expect(collisionScore).to.equal(analysis.minCollisionScore);
		});
	});
});

const cscTools = require('../../lib');
const csc5Players = require('../data/csc5-players.json');

describe('csc-tools', function() {
	it('should minimize regional collisions in pools', function() {
		let poolCount = 16;
		let solution = cscTools.solve(csc5Players, poolCount);
		let collisionScore = cscTools.getCollisionScore(solution, poolCount);
		let minimum = cscTools.getMinimumCollisionScore(csc5Players, poolCount);

		expect(collisionScore).to.equal(minimum);
		expect(minimum).to.equal(4);
	});
});

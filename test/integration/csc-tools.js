const cscTools = require('../../lib');
const csc5Players = require('../data/csc5-players.json');

describe('csc-tools', function() {
	it('should minimize regional collisions in pools', function() {
		let tournament = cscTools.solve(csc5Players, 16);

		expect(tournament.getFitnessScore()).to.equal(Infinity);
	});
});

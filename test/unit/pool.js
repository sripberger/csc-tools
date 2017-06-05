const Pool = require('../../lib/pool');

describe('Pool', function() {
	it('stores provided array of players', function() {
		let players = [
			{ tag: 'foo' },
			{ tag: 'bar' }
		];

		let pool = new Pool(players);

		expect(pool.players).to.equal(players);
	});

	it('defaults to an empty array of players', function() {
		let pool = new Pool();

		expect(pool.players).to.deep.equal([]);
	});

	describe('#countCollisions', function() {
		let pool;

		beforeEach(function() {
			pool = new Pool([
				{ region: 'foo' },
				{ region: 'bar' },
				{ region: 'baz' },
				{ region: 'bar' },
				{ region: 'baz' },
				{ region: 'baz' }
			]);
		});

		it('returns sum of regional repeats', function() {
			expect(pool.countCollisions()).to.equal(3);
		});

		it('ignores provided region, if any', function() {
			expect(pool.countCollisions('baz')).to.equal(1);
		});
	});
});

const Pool = require('../../lib/pool');
const sinon = require('sinon');
const utils = require('../../lib/utils');

describe('Pool', function() {
	let sandbox;

	beforeEach(function() {
		sandbox = sinon.sandbox.create();
	});

	afterEach(function() {
		sandbox.restore();
	});

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

	describe('#getCollisionScore', function() {
		let pool;

		beforeEach(function() {
			sandbox.stub(utils, 'getRegionCounts');
			pool = new Pool([
				{ tag: 'dude' },
				{ tag: 'bro' }
			]);
		});

		it('returns number of colliding regions', function() {
			utils.getRegionCounts.returns({
				foo: 2,
				bar: 2,
				baz: 1
			});

			let result = pool.getCollisionScore();

			expect(utils.getRegionCounts).to.be.calledOnce;
			expect(utils.getRegionCounts).to.be.calledOn(utils);
			expect(utils.getRegionCounts).to.be.calledWith(pool.players);
			expect(result).to.equal(2);
		});

		it('counts mutiple collisions using natural sums', function() {
			utils.getRegionCounts.returns({
				foo: 3, // 2 collisions: 1 + 2 = 3
				bar: 4 // 3 collisions:  1 + 2 + 3 = 6
			});

			expect( pool.getCollisionScore()).to.equal(9);
		});

		it('ignores provided region, if any', function() {
			utils.getRegionCounts.returns({
				foo: 10, // should be ignored
				bar: 5, // 4 collisions: 1 + 2 + 3 + 4 = 10
			});

			expect( pool.getCollisionScore('foo')).to.equal(10);
		});
	});
});

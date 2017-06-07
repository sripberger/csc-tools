const Tournament = require('../../lib/tournament');
const sinon = require('sinon');
const utils = require('../../lib/utils');
const Pool = require('../../lib/pool');

describe('Tournament', function() {
	let sandbox;

	beforeEach(function() {
		sandbox = sinon.sandbox.create();
	});

	afterEach(function() {
		sandbox.restore();
	});

	it('stores provided player array and pool count', function() {
		let players = [
			{ tag: 'foo' },
			{ tag: 'bar' }
		];
		let poolCount = 4;

		let tournament = new Tournament(players, poolCount);

		expect(tournament.players).to.equal(players);
		expect(tournament.poolCount).to.equal(poolCount);
	});

	it('defaults to empty player array with a pool count of 1', function() {
		let tournament = new Tournament();

		expect(tournament.players).to.deep.equal([]);
		expect(tournament.poolCount).to.equal(1);
	});

	describe('#getRegionCounts', function() {
		let tournament;

		beforeEach(function() {
			tournament = new Tournament([
				{ tag: 'dude' },
				{ tag: 'bro' }
			]);
			sandbox.stub(utils, 'getRegionCounts').returns({ foo: 1, bar: 2 });
		});

		it('returns region counts using utils::getRegionCounts', function() {
			let result = tournament.getRegionCounts();

			expect(utils.getRegionCounts).to.be.calledOnce;
			expect(utils.getRegionCounts).to.be.calledOn(utils);
			expect(utils.getRegionCounts).to.be.calledWith(tournament.players);
			expect(result).to.deep.equal({ foo: 1, bar: 2 });
		});

		it('caches result', function() {
			tournament.getRegionCounts();
			utils.getRegionCounts.reset();

			let result = tournament.getRegionCounts();

			expect(utils.getRegionCounts).to.not.be.called;
			expect(result).to.deep.equal({ foo: 1, bar: 2 });
		});
	});

	describe('#getIgnoredRegion', function() {
		let tournament;

		beforeEach(function() {
			tournament = new Tournament();
			sinon.stub(tournament, 'getRegionCounts').returns({
				foo: 1,
				bar: 3,
				baz: 2
			});
		});

		it('returns the region with the highest count', function() {
			let result = tournament.getIgnoredRegion();

			expect(tournament.getRegionCounts).to.be.calledOnce;
			expect(tournament.getRegionCounts).to.be.calledOn(tournament);
			expect(result).to.equal('bar');
		});

		it('caches result', function() {
			tournament.getIgnoredRegion();
			tournament.getRegionCounts.reset();

			let result = tournament.getIgnoredRegion();

			expect(tournament.getRegionCounts).to.not.be.called;
			expect(result).to.equal('bar');
		});
	});

	describe('#getPools', function() {
		it('arranges players into pools using utils::getPoolIndex', function() {
			let players = [
				{ tag: 'foo' },
				{ tag: 'bar' },
				{ tag: 'baz' },
				{ tag: 'qux'}
			];
			let poolCount = 4;
			let tournament = new Tournament(players, poolCount);
			sandbox.stub(utils, 'getPoolIndex')
				.withArgs(0, poolCount).returns(0)
				.withArgs(1, poolCount).returns(1)
				.withArgs(2, poolCount).returns(2)
				.withArgs(3, poolCount).returns(2);


			let result = tournament.getPools();

			expect(utils.getPoolIndex).to.have.callCount(4);
			expect(utils.getPoolIndex).to.always.be.calledOn(utils);
			expect(utils.getPoolIndex).to.be.calledWith(0, poolCount);
			expect(utils.getPoolIndex).to.be.calledWith(1, poolCount);
			expect(utils.getPoolIndex).to.be.calledWith(2, poolCount);
			expect(utils.getPoolIndex).to.be.calledWith(3, poolCount);
			expect(result).to.be.an.instanceof(Array);
			expect(result).to.have.length(poolCount);
			expect(result[0]).to.be.an.instanceof(Pool);
			expect(result[0].players).to.deep.equal([ players[0] ]);
			expect(result[1]).to.be.an.instanceof(Pool);
			expect(result[1].players).to.deep.equal([ players[1] ]);
			expect(result[2]).to.be.an.instanceof(Pool);
			expect(result[2].players).to.deep.equal([ players[2], players[3] ]);
			expect(result[3]).to.be.an.instanceof(Pool);
			expect(result[3].players).to.deep.equal([]);
		});
	});

	describe('#getMinimumCollisionScore', function() {
		let tournament;

		beforeEach(function() {
			tournament = new Tournament([], 4);
			sinon.stub(tournament, 'getRegionCounts');
		});

		it('returns smallest possible collision score based on region counts', function() {
			tournament.getRegionCounts.returns({
				foo: 5, // 1 single collision
				bar: 7, // 3 single collisions
				baz: 4, // 0 collisions
				qux: 3 // 0 collisions
			});

			let result = tournament.getMinimumCollisionScore();

			expect(tournament.getRegionCounts).to.be.calledOnce;
			expect(tournament.getRegionCounts).to.be.calledOn(tournament);
			expect(result).to.equal(4);
		});

		it('accounts for collisions with more than one duplicate', function() {
			tournament.getRegionCounts.returns({
				foo: 9, // 3 single collisions, 1 double collision, (3 * 1) + (1 * 3) = 6
				bar: 15, // 1 double collision, 3 triple collisions, (1 * 3) + (3 * 6) = 21
				baz: 8, // 4 single collisions, (4 * 1)  = 4
				qux: 3 // 0 collisions
			});

			expect(tournament.getMinimumCollisionScore()).to.equal(31);
		});

		it('ignores provided region, if any', function() {
			tournament.getRegionCounts.returns({
				foo: 5, // Should be ignored
				bar: 6 // 2 single collisions
			});

			expect(tournament.getMinimumCollisionScore('foo')).to.equal(2);
		});
	});
});

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

	it('stores provided player array and settings', function() {
		let players = [
			{ tag: 'foo' },
			{ tag: 'bar' }
		];
		let settings = {
			poolCount: 4,
			ignoredRegion: 'ignored region',
			targetCollisionScore: 42,
		};

		let tournament = new Tournament(players, settings);

		expect(tournament.players).to.equal(players);
		expect(tournament.poolCount).to.equal(settings.poolCount);
		expect(tournament.ignoredRegion).to.equal(settings.ignoredRegion);
		expect(tournament.targetCollisionScore).to.equal(settings.targetCollisionScore);
	});

	it('defaults to empty player array with default settings', function() {
		let tournament = new Tournament();

		expect(tournament.players).to.deep.equal([]);
		expect(tournament.poolCount).to.equal(1);
		expect(tournament.ignoredRegion).to.be.null;
		expect(tournament.targetCollisionScore).to.equal(0);
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
			let tournament = new Tournament(players, { poolCount });
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

	describe('#getCollisionScore', function() {
		it('returns sum of collision scores from all pools', function() {
			let tournament = new Tournament([], { ignoredRegion: 'baz' });
			let fooPool = new Pool([ { tag: 'foo' }]);
			let barPool = new Pool([ { tag: 'bar' }]);
			sandbox.stub(tournament, 'getPools').returns([ fooPool, barPool ]);
			sandbox.stub(fooPool, 'getCollisionScore').returns(2);
			sandbox.stub(barPool, 'getCollisionScore').returns(3);

			let result = tournament.getCollisionScore();

			expect(tournament.getPools).to.be.calledOnce;
			expect(tournament.getPools).to.be.calledOn(tournament);
			expect(fooPool.getCollisionScore).to.be.calledOnce;
			expect(fooPool.getCollisionScore).to.be.calledOn(fooPool);
			expect(fooPool.getCollisionScore).to.be.calledWith(tournament.ignoredRegion);
			expect(barPool.getCollisionScore).to.be.calledOnce;
			expect(barPool.getCollisionScore).to.be.calledOn(barPool);
			expect(barPool.getCollisionScore).to.be.calledWith(tournament.ignoredRegion);
			expect(result).to.equal(5);
		});
	});

	describe('#getFitnessScore', function() {
		let tournament;

		beforeEach(function() {
			tournament = new Tournament([], { targetCollisionScore: 1 });
			sandbox.stub(tournament, 'getCollisionScore').returns(3);
		});

		it('returns inverse of difference between collision score and target', function() {
			let result = tournament.getFitnessScore();

			expect(tournament.getCollisionScore).to.be.calledOnce;
			expect(tournament.getCollisionScore).to.be.calledOn(tournament);
			expect(result).to.equal(0.5);
		});

		it('caches numeric result', function() {
			tournament.getFitnessScore();
			sandbox.resetHistory();

			let result = tournament.getFitnessScore();

			expect(tournament.getCollisionScore).to.be.not.be.called;
			expect(result).to.equal(0.5);
		});

		it('caches NaN result', function() {
			tournament.getCollisionScore.returns(NaN);
			tournament.getFitnessScore();
			sandbox.resetHistory();

			let result = tournament.getFitnessScore();

			expect(tournament.getCollisionScore).to.be.not.be.called;
			expect(result).to.be.NaN;
		});
	});
});

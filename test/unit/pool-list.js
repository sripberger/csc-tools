const PoolList = require('../../lib/pool-list');
const sinon = require('sinon');
const Pool = require('../../lib/pool');
const utils = require('../../lib/utils');

describe('PoolList', function() {
	let sandbox;

	beforeEach(function() {
		sandbox = sinon.sandbox.create();
	});

	afterEach(function() {
		sandbox.restore();
	});

	it('stores provided array of pools', function() {
		let pools = [ new Pool(), new Pool() ];

		let poolList = new PoolList(pools);

		expect(poolList.pools).to.equal(pools);
	});

	it('defaults to empty array of pools', function() {
		let poolList = new PoolList();

		expect(poolList.pools).to.deep.equal([]);
	});

	describe('::create', function() {
		it('arranges players into pools using utils::getPoolIndex', function() {
			let players = {
				[Symbol.iterator]: function*() {
					yield { tag: 'foo' };
					yield { tag: 'bar' };
					yield { tag: 'baz' };
					yield { tag: 'qux' };
				}
			};
			let poolCount = 4;
			sandbox.stub(utils, 'getPoolIndex')
				.withArgs(0, poolCount).returns(0)
				.withArgs(1, poolCount).returns(1)
				.withArgs(2, poolCount).returns(2)
				.withArgs(3, poolCount).returns(2);


			let result = PoolList.create(players, poolCount);

			expect(utils.getPoolIndex).to.have.callCount(4);
			expect(utils.getPoolIndex).to.always.be.calledOn(utils);
			expect(utils.getPoolIndex).to.be.calledWith(0, poolCount);
			expect(utils.getPoolIndex).to.be.calledWith(1, poolCount);
			expect(utils.getPoolIndex).to.be.calledWith(2, poolCount);
			expect(utils.getPoolIndex).to.be.calledWith(3, poolCount);
			expect(result).to.be.an.instanceof(PoolList);
			expect(result.pools).to.have.length(poolCount);
			expect(result.pools[0]).to.be.an.instanceof(Pool);
			expect(result.pools[0].players).to.deep.equal([ { tag: 'foo' } ]);
			expect(result.pools[1]).to.be.an.instanceof(Pool);
			expect(result.pools[1].players).to.deep.equal([ { tag: 'bar' } ]);
			expect(result.pools[2]).to.be.an.instanceof(Pool);
			expect(result.pools[2].players).to.deep.equal([
				{ tag: 'baz' },
				{ tag: 'qux' }
			]);
			expect(result.pools[3]).to.be.an.instanceof(Pool);
			expect(result.pools[3].players).to.deep.equal([]);
		});
	});

	describe('#getCollisionScore', function() {
		it('returns sum of collision scores from all pools', function() {
			let fooPool = new Pool([ { tag: 'foo' }]);
			let barPool = new Pool([ { tag: 'bar' }]);
			let poolList = new PoolList([ fooPool, barPool ]);
			let ignoredRegion = 'ignored region';
			sinon.stub(fooPool, 'getCollisionScore').returns(2);
			sinon.stub(barPool, 'getCollisionScore').returns(3);

			let result = poolList.getCollisionScore(ignoredRegion);

			expect(fooPool.getCollisionScore).to.be.calledOnce;
			expect(fooPool.getCollisionScore).to.be.calledOn(fooPool);
			expect(fooPool.getCollisionScore).to.be.calledWith(ignoredRegion);
			expect(barPool.getCollisionScore).to.be.calledOnce;
			expect(barPool.getCollisionScore).to.be.calledOn(barPool);
			expect(barPool.getCollisionScore).to.be.calledWith(ignoredRegion);
			expect(result).to.equal(5);
		});
	});

	describe('#analyzePools', function() {
		it('returns collision score and player list from each pool', function() {
			let fooPool = new Pool([ { tag: 'foo' }]);
			let barPool = new Pool([ { tag: 'bar' }]);
			let poolList = new PoolList([ fooPool, barPool ]);
			let ignoredRegion = 'ignored region';
			sinon.stub(fooPool, 'getCollisionScore').returns(2);
			sinon.stub(barPool, 'getCollisionScore').returns(3);

			let result = poolList.analyzePools(ignoredRegion);

			expect(fooPool.getCollisionScore).to.be.calledOnce;
			expect(fooPool.getCollisionScore).to.be.calledOn(fooPool);
			expect(fooPool.getCollisionScore).to.be.calledWith(ignoredRegion);
			expect(barPool.getCollisionScore).to.be.calledOnce;
			expect(barPool.getCollisionScore).to.be.calledOn(barPool);
			expect(barPool.getCollisionScore).to.be.calledWith(ignoredRegion);
			expect(result).to.deep.equal([
				{ collisionScore: 2, players: fooPool.players },
				{ collisionScore: 3, players: barPool.players }
			]);
		});
	});
});

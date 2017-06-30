const Rank = require('../../lib/rank');
const sinon = require('sinon');
const _ = require('lodash');

describe('Rank', function() {
	let sandbox;

	beforeEach(function() {
		sandbox = sinon.sandbox.create();
	});

	afterEach(function() {
		sandbox.restore();
	});

	it('stores provided player array', function() {
		let players = [
			{ tag: 'foo' },
			{ tag: 'bar' }
		];

		let rank = new Rank(players);

		expect(rank.players).to.equal(players);
	});

	it('defaults to an empty players array', function() {
		let rank = new Rank();

		expect(rank.players).to.deep.equal([]);
	});

	describe('#shuffle', function() {
		it('returns a copy with shuffled player array', function() {
			let players = [
				{ tag: 'foo' },
				{ tag: 'bar' },
				{ tag: 'baz' },
				{ tag: 'qux' }
			];
			let shuffledPlayers = [
				{ tag: 'bar' },
				{ tag: 'qux' },
				{ tag: 'baz' },
				{ tag: 'foo' }
			];
			let rank = new Rank(players);
			sandbox.stub(_, 'shuffle').returns(shuffledPlayers);

			let result = rank.shuffle();

			expect(_.shuffle).to.be.calledOnce;
			expect(_.shuffle).to.be.calledOn(_);
			expect(_.shuffle).to.be.calledWith(rank.players);
			expect(result).to.be.an.instanceof(Rank);
			expect(result.players).to.equal(shuffledPlayers);
		});
	});

	describe('#mutate', function() {
		it('returns a copy with two random players swapped', function() {
			let foo = { tag: 'foo' };
			let bar = { tag: 'bar' };
			let baz = { tag: 'baz' };
			let qux = { tag: 'qux' };
			let rank = new Rank([ foo, bar, baz, qux ]);
			sandbox.stub(_, 'random')
				.onFirstCall().returns(0)
				.onSecondCall().returns(2);

			let result = rank.mutate();

			expect(_.random).to.be.calledTwice;
			expect(_.random).to.always.be.calledOn(_);
			expect(_.random).to.always.be.calledWithExactly(
				0,
				rank.players.length - 1
			);
			expect(result).to.be.an.instanceof(Rank);
			expect(result.players).to.deep.equal([ baz, bar, foo, qux ]);
		});
	});
});

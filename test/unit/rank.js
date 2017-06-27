const Rank = require('../../lib/rank');
const sinon = require('sinon');
const utils = require('../../lib/utils');

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
			sandbox.stub(utils, 'shuffleArray').returns(shuffledPlayers);

			let result = rank.shuffle();

			expect(utils.shuffleArray).to.be.calledOnce;
			expect(utils.shuffleArray).to.be.calledOn(utils);
			expect(utils.shuffleArray).to.be.calledWith(rank.players, { copy: true });
			expect(result).to.be.an.instanceof(Rank);
			expect(result.players).to.equal(shuffledPlayers);
		});
	});

	describe('#mutate', function() {
		it('returns a copy with players swapped based on utils::getMutationIndices', function() {
			let foo = { tag: 'foo' };
			let bar = { tag: 'bar' };
			let baz = { tag: 'baz' };
			let qux = { tag: 'qux' };
			let rank = new Rank([ foo, bar, baz, qux ]);
			sandbox.stub(utils, 'getMutationIndices').returns([ 0, 2 ]);

			let result = rank.mutate();

			expect(utils.getMutationIndices).to.be.calledOnce;
			expect(utils.getMutationIndices).to.be.calledOn(utils);
			expect(utils.getMutationIndices).to.be.calledWith(rank.players.length);
			expect(result).to.be.an.instanceof(Rank);
			expect(result.players).to.deep.equal([ baz, bar, foo, qux ]);
		});
	});
});

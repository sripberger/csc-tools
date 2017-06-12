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

	describe('#crossover', function() {
		it('returns offspring created using utils::pmx', function() {
			let baz = { tag: 'baz' };
			let qux = { tag: 'qux' };
			let fooRank = new Rank([ { tag: 'foo' } ]);
			let barRank = new Rank([ { tag: 'bar' } ]);
			sandbox.stub(utils, 'pmx').returns([ [ baz ], [ qux ] ]);

			let result = fooRank.crossover(barRank);

			expect(utils.pmx).to.be.calledOnce;
			expect(utils.pmx).to.be.calledOn(utils);
			expect(utils.pmx).to.be.calledWith(fooRank.players, barRank.players);
			expect(result).to.be.an.instanceof(Array);
			expect(result).to.have.length(2);
			expect(result[0]).to.be.an.instanceof(Rank);
			expect(result[0].players).to.deep.equal([ baz ]);
			expect(result[1]).to.be.an.instanceof(Rank);
			expect(result[1].players).to.deep.equal([ qux ]);
		});
	});

	describe('#mutate', function() {
		it('returns mutated copy created using utils::reciprocalExchange', function() {
			let foo = { tag: 'foo' };
			let bar = { tag: 'bar' };
			let rank = new Rank([ foo, bar ]);
			let rate = 0.001;
			sandbox.stub(utils, 'reciprocalExchange').returns([ bar, foo ]);

			let result = rank.mutate(rate);

			expect(utils.reciprocalExchange).to.be.calledOnce;
			expect(utils.reciprocalExchange).to.be.calledOn(utils);
			expect(utils.reciprocalExchange).to.be.calledWith(rank.players, rate);
			expect(result).to.be.an.instanceof(Rank);
			expect(result.players).to.deep.equal([ bar, foo ]);
		});
	});
});

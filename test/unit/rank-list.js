const RankList = require('../../lib/rank-list');
const sinon = require('sinon');
const Rank = require('../../lib/rank');
const utils = require('../../lib/utils');
const _ = require('lodash');

describe('RankList', function() {
	let sandbox;

	beforeEach(function() {
		sandbox = sinon.sandbox.create();
	});

	afterEach(function() {
		sandbox.restore();
	});

	it('stores provided ranks array', function() {
		let ranks = [
			new Rank([ { tag: 'foo' } ]),
			new Rank([ { tag: 'bar' } ])
		];

		let rankList = new RankList(ranks);

		expect(rankList.ranks).to.equal(ranks);
	});

	it('defaults to empty ranks array', function() {
		let rankList = new RankList();

		expect(rankList.ranks).to.deep.equal([]);
	});

	describe('::create', function() {
		it('returns a RankList populated with provided player list', function() {
			let players = [
				{ tag: 'a', rank: 1 },
				{ tag: 'b', rank: 1 },
				{ tag: 'c', rank: 2 },
				{ tag: 'd', rank: 2 },
				{ tag: 'e', rank: 1.5 },
				{ tag: 'f', rank: 1.5 },
				{ tag: 'g', rank: 1 }
			];

			let result = RankList.create(players);

			expect(result).to.be.an.instanceof(RankList);
			expect(result.ranks).to.be.an.instanceof(Array);
			expect(result.ranks).to.have.length(3);
			expect(result.ranks[0]).to.be.an.instanceof(Rank);
			expect(result.ranks[0].players).to.deep.equal([
				players[0],
				players[1],
				players[6]
			]);
			expect(result.ranks[1]).to.be.an.instanceof(Rank);
			expect(result.ranks[1].players).to.deep.equal([
				players[4],
				players[5]
			]);
			expect(result.ranks[2]).to.be.an.instanceof(Rank);
			expect(result.ranks[2].players).to.deep.equal([
				players[2],
				players[3]
			]);
		});
	});

	describe('#seedOrder', function() {
		it('returns an iterable that yields players in seed order', function() {
			let foo = { tag: 'foo' };
			let bar = { tag: 'bar' };
			let baz = { tag: 'baz' };
			let qux = { tag: 'qux' };
			let rankList = new RankList([
				new Rank([ foo, bar ]),
				new Rank([ baz, qux ])
			]);

			expect([...rankList.seedOrder()]).to.deep.equal([
				foo,
				bar,
				baz,
				qux
			]);
		});
	});

	describe('#shuffle', function() {
		it('returns copy with each rank shuffled', function() {
			let fooRank = new Rank([ { tag: 'foo' }, { tag: 'baz' } ]);
			let shuffledFooRank = new Rank([ { tag: 'baz' }, { tag: 'foo' } ]);
			let barRank = new Rank([ { tag: 'bar' }, { tag: 'qux' } ]);
			let shuffledBarRank = new Rank([ { tag: 'qux'}, { tag: 'bar' } ]);
			let rankList = new RankList([ fooRank, barRank ]);
			sinon.stub(fooRank, 'shuffle').returns(shuffledFooRank);
			sinon.stub(barRank, 'shuffle').returns(shuffledBarRank);

			let result = rankList.shuffle();

			expect(fooRank.shuffle).to.be.calledOnce;
			expect(fooRank.shuffle).to.be.calledOn(fooRank);
			expect(barRank.shuffle).to.be.calledOnce;
			expect(barRank.shuffle).to.be.calledOn(barRank);
			expect(result).to.be.an.instanceof(RankList);
			expect(result.ranks).to.deep.equal([
				shuffledFooRank,
				shuffledBarRank
			]);
		});
	});

	describe('#crossover', function() {
		it('returns copies with ranks exchanged within crossover range', function() {
			let foo = new RankList();
			let bar = new RankList();
			_.times(4 ,(index) => {
				foo.ranks.push(new Rank([ { tag: 'bar', index } ]));
				bar.ranks.push(new Rank([ { tag: 'bar', index } ]));
			});
			sandbox.stub(utils, 'getCrossoverRange').returns([ 1, 3 ]);

			let result = foo.crossover(bar);

			expect(utils.getCrossoverRange).to.be.calledOnce;
			expect(utils.getCrossoverRange).to.be.calledOn(utils);
			expect(utils.getCrossoverRange).to.be.calledWith(4);
			expect(result).to.be.an.instanceof(Array);
			expect(result).to.have.length(2);
			expect(result[0]).to.be.an.instanceof(RankList);
			expect(result[0].ranks).to.deep.equal([
				foo.ranks[0],
				bar.ranks[1],
				bar.ranks[2],
				foo.ranks[3]
			]);
			expect(result[1]).to.be.an.instanceof(RankList);
			expect(result[1].ranks).to.deep.equal([
				bar.ranks[0],
				foo.ranks[1],
				foo.ranks[2],
				bar.ranks[3]
			]);
		});
	});

	describe('#mutate', function() {
		it('returns a mutated copy', function() {
			let fooRank = new Rank([ { tag: 'foo' } ]);
			let barRank = new Rank([ { tag: 'bar' } ]);
			let bazRank = new Rank([ { tag: 'baz' } ]);
			let quxRank = new Rank([ { tag: 'qux' } ]);
			let rankList = new RankList([ fooRank, barRank ]);
			let rate = 0.001;
			sinon.stub(fooRank, 'mutate').returns(bazRank);
			sinon.stub(barRank, 'mutate').returns(quxRank);

			let result = rankList.mutate(rate);

			expect(fooRank.mutate).to.be.calledOnce;
			expect(fooRank.mutate).to.be.calledOn(fooRank);
			expect(fooRank.mutate).to.be.calledWith(rate);
			expect(barRank.mutate).to.be.calledOnce;
			expect(barRank.mutate).to.be.calledOn(barRank);
			expect(barRank.mutate).to.be.calledWith(rate);
			expect(result).to.be.an.instanceof(RankList);
			expect(result.ranks).to.deep.equal([ bazRank, quxRank ]);
		});
	});
});

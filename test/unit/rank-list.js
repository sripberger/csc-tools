const RankList = require('../../lib/rank-list');
const sinon = require('sinon');
const geneLib = require('gene-lib');
const Rank = require('../../lib/rank');
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
			sandbox.stub(geneLib, 'getCrossoverRange').returns([ 1, 3 ]);

			let result = foo.crossover(bar);

			expect(geneLib.getCrossoverRange).to.be.calledOnce;
			expect(geneLib.getCrossoverRange).to.be.calledOn(geneLib);
			expect(geneLib.getCrossoverRange).to.be.calledWith(4);
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
		it('returns a mutated copy based on provided mutation rate', function() {
			let foo = new Rank([ { tag: 'foo' } ]);
			let bar = new Rank([ { tag: 'bar' } ]);
			let baz = new Rank([ { tag: 'baz' } ]);
			let qux = new Rank([ { tag: 'qux' } ]);
			let fooPrime = new Rank([ { tag: 'foo-prime' } ]);
			let barPrime = new Rank([ { tag: 'bar-prime' } ]);
			let bazPrime = new Rank([ { tag: 'baz-prime' } ]);
			let quxPrime = new Rank([ { tag: 'qux-prime' } ]);
			let rankList = new RankList([ foo, bar, baz, qux ]);
			let rate = 0.1;
			sandbox.stub(_, 'random')
				.onCall(0).returns(0.09)
				.onCall(1).returns(0.11)
				.onCall(2).returns(0.05)
				.onCall(3).returns(0.1);
			sandbox.stub(foo, 'mutate').returns(fooPrime);
			sandbox.stub(bar, 'mutate').returns(barPrime);
			sandbox.stub(baz, 'mutate').returns(bazPrime);
			sandbox.stub(qux, 'mutate').returns(quxPrime);

			let result = rankList.mutate(rate);

			expect(_.random).to.have.callCount(4);
			expect(_.random).to.always.be.calledOn(_);
			expect(_.random).to.always.be.calledWith(0, 1, true);
			expect(foo.mutate).to.be.calledOnce;
			expect(foo.mutate).to.be.calledOn(foo);
			expect(baz.mutate).to.be.calledOnce;
			expect(baz.mutate).to.be.calledOn(baz);
			expect(result).to.be.an.instanceof(RankList);
			expect(result.ranks).to.deep.equal([
				fooPrime,
				bar,
				bazPrime,
				qux
			]);
		});
	});
});

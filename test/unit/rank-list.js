const RankList = require('../../lib/rank-list');
const sinon = require('sinon');
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
		it('returns offpring based on crossover rate', function() {
			let fooRanks = [];
			let barRanks = [];
			let crossoverRanks = [];
			let sampleRanks = [];
			_.times(4 ,(index) => {
				let fooRank = new Rank([ { tag: 'bar', index } ]);
				let crossoverRank = new Rank([ { tag: 'crossover', index } ]);
				sinon.stub(fooRank, 'crossover').returns(crossoverRank);
				fooRanks.push(fooRank);
				crossoverRanks.push(crossoverRank);
				barRanks.push(new Rank([ { tag: 'bar', index } ]));
				sampleRanks.push(new Rank([ { tag: 'sample', index } ]));
			});
			let fooList = new RankList(fooRanks);
			let barList = new RankList(barRanks);
			let rate = 0.7;
			sandbox.stub(_, 'random')
				.onCall(0).returns(0.69)
				.onCall(1).returns(0.7)
				.onCall(2).returns(0.1)
				.onCall(3).returns(0.71);
			sandbox.stub(_, 'sample')
				.withArgs([ fooRanks[1], barRanks[1] ]).returns(sampleRanks[1])
				.withArgs([ fooRanks[3], barRanks[3] ]).returns(sampleRanks[3]);

			let result = fooList.crossover(barList, rate);

			expect(_.random).to.have.callCount(4);
			expect(_.random).to.always.be.calledOn(_);
			expect(_.random).to.always.be.calledWith(0, 1, true);
			expect(fooRanks[0].crossover).to.be.calledOnce;
			expect(fooRanks[0].crossover).to.be.calledOn(fooRanks[0]);
			expect(fooRanks[0].crossover).to.be.calledWith(barRanks[0]);
			expect(fooRanks[2].crossover).to.be.calledWith(barRanks[2]);
			expect(fooRanks[2].crossover).to.be.calledWith(barRanks[2]);
			expect(fooRanks[2].crossover).to.be.calledWith(barRanks[2]);
			expect(_.sample).to.be.calledTwice;
			expect(_.sample).to.always.be.calledOn(_);
			expect(_.sample).to.be.calledWith([ fooRanks[1], barRanks[1] ]);
			expect(_.sample).to.be.calledWith([ fooRanks[3], barRanks[3] ]);
			expect(result).to.be.an.instanceOf(RankList);
			expect(result.ranks).to.deep.equal([
				crossoverRanks[0],
				sampleRanks[1],
				crossoverRanks[2],
				sampleRanks[3]
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

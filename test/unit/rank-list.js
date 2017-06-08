const RankList = require('../../lib/rank-list');
const sinon = require('sinon');
const Rank = require('../../lib/rank');

describe('RankList', function() {
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
});

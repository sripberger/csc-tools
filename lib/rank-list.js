const _ = require('lodash');

class RankList {
	constructor(ranks = []) {
		this.ranks = ranks;
	}

	shuffle() {
		return new RankList(this.ranks.map((rank) => rank.shuffle()));
	}

	mutate(rate) {
		return new RankList(this.ranks.map((rank) => rank.mutate(rate)));
	}

	crossover(other, rate) {
		let result = new RankList();
		for (let rankIndex = 0; rankIndex < this.ranks.length; rankIndex += 1) {
			let rank = this.ranks[rankIndex];
			let otherRank = this.ranks[rankIndex];
			let resultRank;
			if (_.random(0, 1, true) < rate) {
				resultRank = rank.crossover(otherRank);
			} else {
				resultRank = _.sample([ rank, otherRank ]);
			}
			result.ranks.push(resultRank);
		}
		return result;
	}
}

module.exports = RankList;

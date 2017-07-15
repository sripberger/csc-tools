const _ = require('lodash');
// TODO: Add gene-lib dependency once it is published.
const geneLib = require('gene-lib');
const Rank = require('./rank');


class RankList {
	constructor(ranks = []) {
		this.ranks = ranks;
	}

	static create(players) {
		let ranks = [];
		let rankValues = _(players).map('rank').uniq().sortBy().value();
		let playersByRank = _.groupBy(players, 'rank');
		for (let rankValue of rankValues) {
			ranks.push(new Rank(playersByRank[rankValue]));
		}
		return new RankList(ranks);
	}

	seedOrder() {
		let { ranks } = this;
		return { [Symbol.iterator]: function*() {
			for (let rank of ranks) {
				yield* rank.players;
			}
		} };
	}

	shuffle() {
		return new RankList(this.ranks.map((rank) => rank.shuffle()));
	}

	crossover(other) {
		let { length } = this.ranks;
		let [ start, end ] = geneLib.getCrossoverRange(length);
		let results = _.times(2, () => new RankList());
		for (let i = 0; i < length; i += 1) {
			if (_.inRange(i, start, end)) {
				results[0].ranks.push(other.ranks[i]);
				results[1].ranks.push(this.ranks[i]);
			} else {
				results[0].ranks.push(this.ranks[i]);
				results[1].ranks.push(other.ranks[i]);
			}
		}
		return results;
	}

	mutate(rate) {
		return new RankList(this.ranks.map((rank) => {
			return (_.random(0, 1, true) < rate) ? rank.mutate() : rank;
		}));
	}
}

module.exports = RankList;

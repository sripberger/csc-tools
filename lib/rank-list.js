const _ = require('lodash');
const Rank = require('./rank');
const utils = require('./utils');

class RankList {
	constructor(ranks = []) {
		this.ranks = ranks;
	}

	static create(players) {
		let ranks = [];
		let playersByRank = _.groupBy(players, 'rank');
		for (let rank of _.keys(playersByRank).sort()) {
			ranks.push(new Rank(playersByRank[rank]));
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
		let [ start, end ] = utils.getCrossoverRange(length);
		let leftResult = new RankList();
		let rightResult = new RankList();
		for (let i = 0; i < length; i += 1) {
			let left, right;
			if (_.inRange(i, start, end)) {
				left = other;
				right = this;
			} else {
				left = this;
				right = other;
			}
			leftResult.ranks.push(left.ranks[i]);
			rightResult.ranks.push(right.ranks[i]);
		}
		return [ leftResult, rightResult ];
	}

	mutate(rate) {
		return new RankList(this.ranks.map((rank) => rank.mutate(rate)));
	}
}

module.exports = RankList;

class Pool {
	constructor(players) {
		this.players = players;
	}

	countCollisions(ignore) {
		let collisionCount = 0;
		let regionsFound = {};
		for (let { region } of this.players) {
			if (regionsFound[region]) {
				collisionCount += 1;
			} else if (region !== ignore) {
				regionsFound[region] = true;
			}
		}
		return collisionCount;
	}
}

module.exports = Pool;

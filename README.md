# csc-tools
A small set of tools for optimizing competitive tournament pools, originally
created to help aid a Super Smash Bros. Melee tournament series by the name
of Cincinnati Smash Classic.

Nothing specific to SSBM is included in any of the logic, so if you're running
any kind of competitive tournament in which competitors are divided up into
an initial pool stage, you might find it useful.

## The Problem
Most decently-sized SSBM tournaments consist of at least two stages: a pool
stage, and a bracket stage. The bracket stage is a double-elimination tournament
that most people are familiar with. In the pool stage, however, players are
divided up into smaller groups that compete with one another. Usually, a set
number of players from each pool will advance into the bracket stage, with
seeding positions based on their performance in the pool stages.

This structure helps greatly with tournament logistics and, if implemented
properly, is widely considered to produce more fair results than a straight
double-elimination bracket. It does, however, come with its own set of problems.

Like a straight double-elimination bracket, pools cannot simply be created at
random without seriously risking the accuracy of the results. Imagine a
tournament in which the 3 best players are all shoved into the same pool in
which only the top 2 advance, and you can easily see the issue. In that case,
one of the most likely top 3 competitors wouldn't even get to play in bracket,
no matter what.

### A solution?
This skill-balancing problem is easily addressed by arranging competitors into a
*seed order* based on their expected performance. For example, let's say I've
sorted the following list of players based on known skill level from power
rankings and previous events:

1. Fox
2. Falco
3. Marth
4. Sheik
5. Jigglypuff
6. Peach
7. Ice Climbers
8. Captain Falcon
9. Pikachu
10. Samus
11. Dr. Mario
12. Yoshi
13. Luigi
14. Ganondorf
15. Mario
16. Young Link

I would then arrange players into 4 pools using a *snake-style* seeding pattern,
which is widely regarded as the most fair pattern and is used by
[smash.gg](http://smash.gg) and other popular tournament hosting services. This
pattern looks like this:

```
1, 2, 3, 4, 4, 3, 2, 1, repeat
```

This produces the following pools:

| Pool 1         | Pool 2       | Pool 3       | Pool 4       |
| -------------- | ------------ | ------------ | ------------ |
| Fox            | Falco        | Marth        | Sheik        |
| Captain Falcon | Ice Climbers | Peach        | Jigglypuff   |
| Pikachu        | Samus        | Dr. Mario    | Yoshi        |
| Young Link     | Mario        | Ganondorf    | Luigi        |

Looks great, right? Well... As it turns out there's one more problem...

### Regional Collisions
For most players, an important part of the tournament experience is the
opportunity to play against new people. Nobody likes to drive 6+ hours only to
get stuck in a pool with their carpool mates from back home. Very large
tourmaments don't usually take steps to prevent this, since it isn't very likely
to occur, but at small to midsize events, organizers are expected to reduce such
collisions as much as possible to keep everybody happy.

### Ok, now what?
Let's go back and reimagine our seeding process a little bit and try to take
this new problem into account. Obviously, we can't have a set-in-stone seeding
order like we did above. If we did, we wouldn't be able to rearrange players to
reduce regional collisions.

Instead of a hard seed order, let's arrange players into *ranks*. Players of
a better rank are always seeded earlier than players of a worse rank, but
players within a rank can be rearranged as much as needed.

| Player         | Rank | Region           |
| -------------- | :--: | ---------------- |
| Fox            | 1    | Brockway         |
| Falco          | 2    | Ogdenville       |
| Marth          | 2    | Brockway         |
| Sheik          | 2    | Brockway         |
| Jigglypuff     | 3    | Ogdenville       |
| Peach          | 3    | North Haverbrook |
| Ice Climbers   | 4    | Ogdenville       |
| Captain Falcon | 4    | Brockway         |
| Pikachu        | 5    | North Haverbrook |
| Samus          | 5    | Ogdenville       |
| Dr. Mario      | 6    | North Haverbrook |
| Yoshi          | 6    | Brockway         |
| Luigi          | 6    | Brockway         |
| Ganondorf      | 7    | Ogdenville       |
| Mario          | 7    | North Haverbrook |
| Young Link     | 7    | Ogdenville       |

Now, if we assume the same seeding order as above and check out the regions,
we'll notice some problems. There are only 4 North Haverbrook players, and two
of them are in Pool 3. Meanwhile, Pool 2 has 3 Ogdenville players, and Pool 4
has 3 Brockway players! Based on the total number of players from each of those
regions, there's no need to have more than 2 players from either in a given
pool.

So, let's try to fix this manually. One of the North Haverbrook players in Pool
3 needs to move into Pool 4. Those players are Peach and Dr. Mario, and their
ranks are 3 and 6. In pool 4, there is one rank 3 player (Jigglypuff) and one
rank 6 player (Yoshi). Jigglypuff is from Ogdenville, however, and moving her
into Pool 3 would create a new collision where there wasn't one before.
Therefore, we must swap Dr. Mario and Yoshi. Now we've got these pools:

| Pool 1         | Pool 2       | Pool 3       | Pool 4       |
| -------------- | ------------ | ------------ | ------------ |
| Fox            | Falco        | Marth        | Sheik        |
| Captain Falcon | Ice Climbers | Peach        | Jigglypuff   |
| Pikachu        | Samus        | Yoshi        | Dr. Mario    |
| Young Link     | Mario        | Ganondorf    | Luigi        |

This had the added benefit of reducing the number of Brockway players in
Pool 4. But now, we still have Pool 2, with no Brockway players at all, while
every other pool has two! So, we need to move one of those 6 Brockway players
into Pool 2.

Let's evaluate each Brockway player in sequence:

- Fox can't move because he's the only rank 1 player.
- Marth could potentially switch with Falco.
- Sheik could also switch with Falco.
- Captain Falcon could switch with the Ice Climbers.
- Yoshi can't move into Pool 2 because nobody in pool 2 shares his rank.
- Luigi can't move into Pool 2 for the same reason as Yoshi.

Both Falco and the Ice Climbers are from Ogdenville, and we *do* need to move
an Ogdenville player out of Pool 2. Thus, any one of the three moves above will
work. To eliminate bias, we should choose randomly. Let's say I rolled a die
just now, 1-2 for Marth, 3-4 for Sheik, 5-6 for Captain Falcon. I rolled a 3,
so I swap Sheik and Falco:

| Pool 1         | Pool 2       | Pool 3       | Pool 4       |
| -------------- | ------------ | ------------ | ------------ |
| Fox            | Sheik        | Marth        | Falco        |
| Captain Falcon | Ice Climbers | Peach        | Jigglypuff   |
| Pikachu        | Samus        | Yoshi        | Dr. Mario    |
| Young Link     | Mario        | Ganondorf    | Luigi        |

At this point, we've reduced regional collisions in this tournament to their
absolute minimum. Fortunately, in this case, we were able to do it in only two
moves.

Now imagine, for a moment, doing this for a tournament with one hundred or more
players, ten or more ranks, and six or seven different regions. Hopefully you
can see why this is a huge undertaking. For a real tournament it takes hours,
it's very easy to mess up, and when pre-registered players drop out, it
sometimes has to be done all over again. This is the reason why most organizers
don't bother going this far with keeping everyone happy.

### Enter csc-tools
Computer programs can solve these kinds of problems much more rapidly than a
human ever could. `csc-tools` is one such program, and it can perform this
regional collision minimization in a matter of seconds. It does this by way of a
genetic algorithm. If you're curious about how it works, feel free to look over
the [source code](https://github.com/sripberger/csc-tools). Otherwise, keep
reading to learn how to use it!

## Getting Started
`csc-tools` is a [Node.js](https://nodejs.org/) script. I'm assuming that most
people reading this will not be well-versed in node or similar environments. In
the future, I may create a web app for these folks so they don't have to go
through the hassle of setting up node on their system, but until then I'll
include some basics here. Feel free to skip this if you already know what
you're doing.

### Installing node and npm
Node can be installed in several different ways. Ideally, you should find
your system and follow the instructions
[here](https://nodejs.org/en/download/package-manager/). If you are using
Windows, however, you're probably best off downloading and runnning the msi
installer package from [here](https://nodejs.org/en/download/).

All of these methods will install both the node `node` and `npm` commands to
your system. `node` can be used to run programs, while `npm` is a package
manager for easily downloading public node programs (like `csc-tools`).

### Installing csc-tools
Open a terminal. Mac or Linux users can use the built in terminal app. Windows
users can either use Command Prompt or Windows Powershell. Type the following
and press enter:

```
npm install -g csc-tools
```

This will download `csc-tools` and place it somewhere in your system path,
allowing you to easily use it from anywhere on your system. To make sure it
worked, try running this command next:

```
csc-tools --version
```

This should display the version of `csc-tools` that you have installed.

## Using csc-tools

To use csc tools, you'll want to start by having a
[csv](https://en.wikipedia.org/wiki/Comma-separated_values) file somewhere
containing your list of players, in seed order. I chose csv for this purpose
because its easily downloaded from Google Sheets, which I use for most of my
organizational work. Other formats might be supported in the future, but for
now, use csv.

The first row should contain column names. You can include any columns you like,
though the three required ones are `tag`, `rank`, and `region`. These can be in
any order, but the **names are case sensitive**. If you call your rank column
`Rank` instead of `rank`, for example, `csc-tools` will not work.

The sample player list from above would look like this:

```
tag,rank,region
Fox,1,Brockway
Falco,2,Ogdenville
Marth,2,Brockway
Sheik,2,Brockway
Jigglypuff,3,Ogdenville
Peach,3,North Haverbrook
Ice Climbers,4,Ogdenville
Captain Falcon,4,Brockway
Pikachu,5,North Haverbrook
Samus,5,Ogdenville
Dr. Mario,6,North Haverbrook
Yoshi,6,Brockway
Luigi,6,Brockway
Ganondorf,7,Ogdenville
Mario,7,North Haverbrook
Young Link,7,Ogdenville
```

Note that the rank column must contain numbers, but these numbers need not be
integers. If you wanted to make sure Falco was always seeded above Marth and
Sheik but below Fox, for example, you can change his rank to 1.5.

Also note that the region names here are case sensitive. If we changed Marth's
region to `brockway`, he would actually be treated as if he were in a completely
different region than Sheik.

Once you have your csv file, use your terminal to change directories (`cd`) to
wherever that file is. If I'm using Windows 10 and put it on my desktop, for
example, I would do the following. If you do the same, you'll want to replace
`Steve` with your own Windows username.

```
cd C:\Users\Steve\Desktop
```

Now that we're in the same directory as our csv file, we can run `csc-tools`
to check on the status and perform the minimization.

### The Analyze Tool
First things first, let's check out the seeding order we already have. We want
to know how many collisions it currently has, and how many collisions we'd
ideally like it to have. We can do this by way of the `analyze` tool, which
we can run like so:

```
csc-tools analyze 4 players.csv
```

In case you're wondering what all that means, `csc-tools` is the name of the
program I'm running, and `analyze` is an argument telling it to use the analyze
tool. `4` is the number of pools in the tournament (you'll want to change this
for larger tournaments), and `players.csv` is the name of my file.

This command will cause the following to be logged into the terminal:

```
collisionScore:        8
minimumCollisionScore: 4
```

- The `collisionScore` is based on the number of regional collisions. It isn't
exactly linear, meaning this result doesn't mean there are exactly eight
collisions. In fact, there are only four collisions occurring right now, but
since two of them involve three players instead of just two, they're considered
more severe. The key thing to take away here is that lower is better, and higher
is worse.

- The `minimumCollisionScore` is based on the total number of players in each
region. It represents the absolute smallest `collisionScore` that can possibly
be reached by shifting players around. Ideally, we'd like our `collisionScore`
and our `minimumCollisionScore` to be the same. This will not *necessarily* be
possible without moving players outside of their ranks, but `csc-tools` will
get as close as it possibly can when we run the `solve` tool later.

This short analysis seen above is all well and good, but sometimes you might
want some more detail.

#### Showing Region Counts
To include region counts in analysis, include the -r flag, like so:

```
csc-tools analyze -r 4 players.csv
```

Which will output the following:

```
collisionScore:        8
minimumCollisionScore: 4

Region Counts
Brockway:         6
Ogdenville:       6
North Haverbrook: 4
```

This is nice because it helps us verify the `minimumCollisionScore`. We know
that 4 is correct, because four collisions are necessary. Ogdenville and
Brockway each have two more players than there are pools, and each of these 4
overflowing players will cause at least one collision, no matter what we do.

#### Showing Pools
To actually display the pools in analysis, include the -p flag, like so:

```
csc-tools analyze -p 4 players.csv
```

Which will output the following:

```
collisionScore:        8
minimumCollisionScore: 4

Pool 1 (collisionScore: 1)
tag            rank region
Fox            1    Brockway
Captain Falcon 4    Brockway
Pikachu        5    North Haverbrook
Young Link     7    Ogdenville

Pool 2 (collisionScore: 3)
tag          rank region
Falco        2    Ogdenville
Ice Climbers 4    Ogdenville
Samus        5    Ogdenville
Mario        7    North Haverbrook

Pool 3 (collisionScore: 1)
tag       rank region
Marth     2    Brockway
Peach     3    North Haverbrook
Dr. Mario 6    North Haverbrook
Ganondorf 7    Ogdenville

Pool 4 (collisionScore: 3)
tag        rank region
Sheik      2    Brockway
Jigglypuff 3    Ogdenville
Yoshi      6    Brockway
Luigi      6    Brockway
```

We can use this to preview the pools, as well as trace the sources of the
total collision score. As we can see, pools 2 and 4 our our main problem pools.
Pool 3 could use some adjustment as well, seeing as North Haverbrook only as
four players and thus should not have any collisions at all.

#### Showing Everything
If you wish, you can combine the r and p flags, like so:

```
csc-tools analyze -rp players.csv
```

Which will output everything:

```
collisionScore:        8
minimumCollisionScore: 4

Region Counts
Brockway:         6
Ogdenville:       6
North Haverbrook: 4

Pool 1 (collisionScore: 1)
tag            rank region
Fox            1    Brockway
Captain Falcon 4    Brockway
Pikachu        5    North Haverbrook
Young Link     7    Ogdenville

Pool 2 (collisionScore: 3)
tag          rank region
Falco        2    Ogdenville
Ice Climbers 4    Ogdenville
Samus        5    Ogdenville
Mario        7    North Haverbrook

Pool 3 (collisionScore: 1)
tag       rank region
Marth     2    Brockway
Peach     3    North Haverbrook
Dr. Mario 6    North Haverbrook
Ganondorf 7    Ogdenville

Pool 4 (collisionScore: 3)
tag        rank region
Sheik      2    Brockway
Jigglypuff 3    Ogdenville
Yoshi      6    Brockway
Luigi      6    Brockway
```

For a large tournament this can be a lot of information cluttering your console,
which is why only the basics are shown by default.

### The Solve Tool
Now that we've analyzed our player list, let's see if we can cut down that
collision score using the `solve` tool, like so:

```
csc-tools solve 4 players.csv > players-optimized.csv
```

Again, `csc-tools` is the program we're running, `solve` is the tool we're
using, `4` is the pool count, and `players.csv` is the file. Normally, the
solve tool will output the optimized csv into the console. The `>` allows you
to instead redirect it into a file, in this case one named
`players-optimized.csv`.

Now, let's try analyzing this new file:

```
csc-tools analyze 4 players-optimized.csv
```

```
collisionScore:        4
minimumCollisionScore: 4

Region Counts
Brockway:         6
Ogdenville:       6
North Haverbrook: 4

Pool 1 (collisionScore: 1)
tag          rank region
Fox          1    Brockway
Ice Climbers 4    Ogdenville
Samus        5    Ogdenville
Mario        7    North Haverbrook

Pool 2 (collisionScore: 1)
tag            rank region
Sheik          2    Brockway
Captain Falcon 4    Brockway
Pikachu        5    North Haverbrook
Ganondorf      7    Ogdenville

Pool 3 (collisionScore: 1)
tag        rank region
Marth      2    Brockway
Jigglypuff 3    Ogdenville
Dr. Mario  6    North Haverbrook
Young Link 7    Ogdenville

Pool 4 (collisionScore: 1)
tag   rank region
Falco 2    Ogdenville
Peach 3    North Haverbrook
Yoshi 6    Brockway
Luigi 6    Brockway
```

As you can see, the collisions have now been minimized. Now, we're free to
take `players-optimized.csv` and upload it into Google Sheets or copy it into
smash.gg or some other service.

If you find that the solve tool takes a long time and can't seem to hit that
mimimum collision score, this probably means that your rankings are too strict
and that truly minimizing collisions is not possible without moving some
players outside of their ranks. You can remedy this by merging some of your
ranks together and running the solve tool again.

This should be all you need to know for basic use. The rest of this README
is stuff for nerds that may or may not interest you.

## Usage
```
csc-tools [options] [command]


  Options:

    -V, --version  output the version number
    -h, --help     output usage information


  Commands:

    analyze|a [options] <poolCount> [path]  analyze a player list
    solve|s <poolCount> [path]              minimize regional collisions in a player list
```

```
csc-tools analyze|a [options] <poolCount> [path]

 analyze a player list


 Options:

   -r, --show-region-counts  Show region counts
   -p, --show-pools          Show pools
   -h, --help                output usage information
```

```
csc-tools solve|s [options] <poolCount> [path]

  minimize regional collisions in a player list


  Options:

    -h, --help  output usage information
```

For either command, if `path` is omitted, input is instead read from stdin.

## API
`csc-tools` can also be used programatically in node, like so:

```
npm install csc-tools --save
```

```js
const cscTools = require('csc-tools');

let players = [
	{ tag: 'Fox', rank: 1, region: 'Brockway' },
	{ tag: 'Falco', rank: 2, region: 'Ogdenville' },
	{ tag: 'Marth', rank: 2, region: 'Brockway' },
	{ tag: 'Sheik', rank: 2, region: 'Brockway' },
	{ tag: 'Jigglypuff', rank: 3, region: 'Ogdenville' },
	{ tag: 'Peach', rank: 3, region: 'North Haverbrook' },
	{ tag: 'Ice Climbers', rank: 4, region: 'Ogdenville' },
	{ tag: 'Captain Falcon', rank: 4, region: 'Brockway' },
	{ tag: 'Pikachu', rank: 5, region: 'North Haverbrook' },
	{ tag: 'Samus', rank: 5, region: 'Ogdenville' },
	{ tag: 'Dr. Mario', rank: 6, region: 'North Haverbrook' },
	{ tag: 'Yoshi', rank: 6, region: 'Brockway' },
	{ tag: 'Luigi', rank: 6, region: 'Brockway' },
	{ tag: 'Ganondorf', rank: 7, region: 'Ogdenville' },
	{ tag: 'Mario', rank: 7, region: 'North Haverbrook' },
	{ tag: 'Young Link', rank: 7, region: 'Ogdenville' }
];

let optimizedPlayers = cscTools.solve(players, 4);
let analysis = cscTools.analyze(optimizedPlayers, 4);

// analysis example:
// {
// 	collisionScore: 2,
// 	minimumCollisionScore: 2,
// 	regionCounts: {
// 		'Brockway': 6,
// 		'Ogdenville': 6,
// 		'North Haverbrook': 4
// 	},
// 	pools: [
// 		{
// 			collisionScore: 1,
// 			players: [
// 				{ tag: 'Fox', rank: 1, region: 'Brockway' },
// 				{ tag: 'Ice Climbers', rank: 4, region: 'Ogdenville' },
// 				{ tag: 'Samus', rank: 5, region: 'Ogdenville' },
// 				{ tag: 'Mario', rank: 7, region: 'North Haverbrook' }
// 			]
// 		},
// 		{
// 			collisionScore: 0,
// 			players: [
// 				{ tag: 'Marth', rank: 2, region: 'Brockway' },
// 				{ tag: 'Captain Falcon', rank: 4, region: 'Brockway' },
// 				{ tag: 'Pikachu', rank: 5, region: 'North Haverbrook' },
// 				{ tag: 'Ganondorf', rank: 7, region: 'Ogdenville' }
// 			]
// 		},
// 		{
// 			collisionScore: 1,
// 			players: [
// 				{ tag: 'Sheik', rank: 2, region: 'Brockway' },
// 				{ tag: 'Jigglypuff', rank: 3, region: 'Ogdenville' },
// 				{ tag: 'Dr. Mario', rank: 6, region: 'North Haverbrook' },
// 				{ tag: 'Young Link', rank: 7, region: 'Ogdenville' }
// 			]
// 		},
// 		{
// 			collisionScore: 0,
// 			players: [
// 				{ tag: 'Falco', rank: 2, region: 'Ogdenville' },
// 				{ tag: 'Peach', rank: 3, region: 'North Haverbrook' },
// 				{ tag: 'Yoshi', rank: 6, region: 'Brockway' },
// 				{ tag: 'Luigi', rank: 6, region: 'Brockway' }
// 			]
// 		}
// 	]
// }

```

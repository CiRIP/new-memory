const FATAL_PIECES = [
    {
        id: 0,
        fatal: true,
        image: "/images/cards/0",
    },
]

const NORMAL_PIECES = [
    {
        id: 1,
        fatal: false,
        image: "/images/cards/0",
    },
    {
        id: 2,
        fatal: false,
        image: "/images/cards/0",
    },
    {
        id: 3,
        fatal: false,
        image: "/images/cards/0",
    },
    {
        id: 4,
        fatal: false,
        image: "/images/cards/0",
    },
    {
        id: 5,
        fatal: false,
        image: "/images/cards/0",
    },
    {
        id: 6,
        fatal: false,
        image: "/images/cards/0",
    },
    {
        id: 7,
        fatal: false,
        image: "/images/cards/0",
    },
    {
        id: 8,
        fatal: false,
        image: "/images/cards/0",
    },
    {
        id: 9,
        fatal: false,
        image: "/images/cards/0",
    },
    {
        id: 10,
        fatal: false,
        image: "/images/cards/0",
    },
    {
        id: 11,
        fatal: false,
        image: "/images/cards/0",
    },
    {
        id: 12,
        fatal: false,
        image: "/images/cards/0",
    },
];

function shuffle(array) {
    var m = array.length, t, i;
  
    while (m) {
        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);
    
        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
  
    return array;
  }

function makeBoard() {
    const board = [...NORMAL_PIECES, ...NORMAL_PIECES, ...FATAL_PIECES];

    return shuffle(board);
}

module.exports = makeBoard;

const FATAL_PIECES = [
    {
        id: 0,
        fatal: true,
        image: "https://d2k0ddhflgrk1i.cloudfront.net/_processed_/0/8/csm_Claudia%20Hauff_3d2ecb0632.jpg",
    },
]

const NORMAL_PIECES = [
    {
        id: 1,
        fatal: false,
        image: "https://m.media-amazon.com/images/I/71YhzequzXL._AC_SX466_.jpg",
    },
    {
        id: 2,
        fatal: false,
        image: "https://www.vanhoutdecoratiefiguren.nl/wp-content/uploads/2021/01/R-051-TULIP-FLOWER.jpg",
    },
    {
        id: 3,
        fatal: false,
        image: "https://preview.redd.it/hup1a010wf341.jpg?auto=webp&s=453a750d5abab37104561261aaca1271d6221fc1",
    },
    {
        id: 4,
        fatal: false,
        image: "https://royaldelft.com/wp-content/uploads/2020/12/10207200-1-scaled.jpg",
    },
    {
        id: 5,
        fatal: false,
        image: "https://d2k0ddhflgrk1i.cloudfront.net/TUDelft/Onderwijs/Opleidingen/Master/MSc_Systems_Engineering__Policy_Analysis_and_Management/20131017_tudelft_campus__R9B0638_AP%20%281%29.jpg",
    },
    {
        id: 6,
        fatal: false,
        image: "https://cdn.pixabay.com/photo/2018/06/30/21/34/mallard-duck-3508455_960_720.jpg",
    },
    {
        id: 7,
        fatal: false,
        image: "https://i.redd.it/a4zurjk9zue21.png",
    },
    {
        id: 8,
        fatal: false,
        image: "https://image.isu.pub/180829145051-abf8777950108b6168d550b13af5fb4d/jpg/page_1.jpg",
    },
    {
        id: 9,
        fatal: false,
        image: "https://www.mediamatic.net/image/2016/12/14/pitt_bier_2.jpg%28mediaclass-full-width--portrait.1df3d6f438769113d26ed8577bc84d61afea2a7e%29.jpg",
    },
    {
        id: 10,
        fatal: false,
        image: "https://www.annemiekpunt.nl/pages/wp-content/uploads/2014/07/CTE4309-2.jpeg",
    },
    {
        id: 11,
        fatal: false,
        image: "https://upload.wikimedia.org/wikipedia/en/3/30/Miffy%2C_by_Dick_Bruna.jpg",
    },
    {
        id: 12,
        fatal: false,
        image: "https://www.corporatiegids.nl/resize/size/header/1200x/TenHwYkPQMX0IcPup3DuKNrweo6eIJwg_DUWOjpg.jpg",
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

    console.debug(`Placing fatal at ${array.findIndex(e => e.fatal)}`);
  
    return array;
  }

function makeBoard() {
    const board = [...NORMAL_PIECES, ...NORMAL_PIECES, ...FATAL_PIECES];

    return shuffle(board);
}

module.exports = makeBoard;

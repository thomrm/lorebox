import satori from 'satori';
import {Resvg} from '@resvg/resvg-js';
import BarlowMedium from '$lib/BarlowCondensed-Medium.ttf';
import BarlowBold from '$lib/BarlowCondensed-ExtraBold.ttf';
import {read} from '$app/server';
import {html as toReactNode} from 'satori-html';
import deckImage from '$lib/deck-image.svelte';

const fontData1 = read(BarlowMedium).arrayBuffer();
const fontData2 = read(BarlowBold).arrayBuffer();

let height = 1000;
let width = 1070;

let gap = 10;
let gutter = 20;
let cardHeight = 350;

let cards;
let deck = {
    colors: [],
    cardsCount: 0,
    cards: [],
    price: 0
};

const bigID = (cardID) => {
    let set = String(cardID).slice(0, 2);
    let id = String(cardID).slice(2, 5);
    
    let card = cards.filter(function(x) {
        return x.collector_number == String(parseInt(id)) && x.set.code == String(parseInt(set));
    });

    return card[0].id;
}

/** @type {import('./$types').RequestHandler} */
export const GET = async ({url}) => {
    const response = await fetch('http://lorebox.ink/data/allCards.json');
    const data = await response.json();
    cards = data.results;

    deck.cards = [];

    const deckString = url.searchParams.get('d') ?? undefined;
    deckString.match(/.{6}/g).forEach(function(x) {
        let cardID = bigID(x.slice(1, 6));
        let num = parseInt(x[0])

        deck.cards.push({
            id: cardID,
            data: cards.filter(x => x.id == cardID)[0],
            number: Math.min(num, 4)
        });
    });

    height = (Math.ceil(deck.cards.length / 4) * cardHeight) + ((Math.ceil(deck.cards.length / 4) - 1) * gap) + (gutter * 2);

    const result = deckImage.render({deck});
    
    const element = toReactNode(`${result.html}<style>${result.css.code}</style>`);

    const svg = await satori(element, {
        fonts: [
        {
            name: 'Barlow Medium',
            data: await fontData1,
            style: 'normal'
        },
        {
            name: 'Barlow Bold',
            data: await fontData2,
            style: 'bold'
        }
        ],
        height,
        width
    });

    const resvg = new Resvg(svg, {
        fitTo: {
            mode: 'width',
            value: width
        }
    });

    const image = resvg.render();

    return new Response(image.asPng(), {
        headers: {
            'content-type': 'image/png'
        }
    });
};
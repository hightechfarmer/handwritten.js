const unidecode = require('unidecode-plus');
const mergeImg = require('merge-img');
const jimp = require('jimp');

const symbols = '!?"()@&*[]<>{}.,:;-\'';
const alphanuml = 'qwertyuiopasdfghjklzxcvbnm1234567890';
const alphanumu = 'QWERTYUIOPASDFGHJKLZXCVBNM';
let batch_size = 36;


while ([true, false][Math.floor(Math.random() * 2)]) {
    batch_size += 1;
}

function getbuffersync(image) {
    return new Promise((resolve, reject) => {
        image.getBuffer(jimp.AUTO, (err, buf) => {
            resolve(buf);
        });
    });
}

async function main(raw_text) {
    const text = unidecode(raw_text).trim();
    if (text.length !== 0) {
        const all = [];
        let res = [];
        for (let i = 0; i < text.length; i += 1) {
            if (alphanuml.includes(text[i])) {
                res.push(`${__dirname}/dataset/${text[i]}${Math.floor(Math.random() * 6) + 1}.jpg`);
            } else if (alphanumu.includes(text[i])) {
                res.push(`${__dirname}/dataset/${Math.floor(Math.random() * 6) + 1}${text[i]}.jpg`);
            } else if (symbols.includes(text[i])) {
                res.push(`${__dirname}/dataset/symbol${symbols.indexOf(text[i])}${Math.floor(Math.random() * 6) + 1}.jpg`);
            } else if (text[i] === ' ') {
                if (res.length >= batch_size - 1) {
                    all.push(res);
                    res = [];
                } else {
                    res.push(`${__dirname}/dataset/space.jpg`);
                }
            } else if (text[i] === '\n') {
                all.push(res);
                res = [];
            } else {
                res.push(`${__dirname}/dataset/space.jpg`);
            }
        }
        all.push(res);
        let m = all[0].length;
        for (let i = 1; i < all.length; i += 1) {
            if (all[i].length > m) {
                m = all[i].length;
            }
        }
        for (let i = 0; i < all.length; i += 1) {
            while (all[i].length !== m) {
                all[i].push(`${__dirname}/dataset/space.jpg`);
            }
        }
        const k = [];
        for (let i = 0; i < all.length; i += 1) {
            const img = await mergeImg(all[i]);
            k.push(img);
        }
        const result = new Array(Math.ceil(k.length / batch_size))
            .fill()
            .map(_ => k.splice(0, batch_size));
        const img_arr = [];
        for (let i = 0; i < result.length; i += 1) {
            const image = await mergeImg(result[i], {
                direction: true,
            });
            img_arr.push(await getbuffersync(image));
        }
        return img_arr;
    } else {
        return [];
    }
}
module.exports = main;
import 'ts-helpers';
import * as fs2 from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import getPixels = require('get-pixels');
import Jimp = require('jimp');
import argParser from './argParser';
import gynaptic = require('gynaptic');

const Neuron = gynaptic.Neuron;
const Evolution = gynaptic.Evolution;
const Trainer = gynaptic.Trainer;
const Methods = gynaptic.Methods;
const Layer = gynaptic.Layer;
const Network = gynaptic.Network;
const Architect = gynaptic.Architect;

const CONFIG = argParser(process.argv);
let overlays: [string] = glob.sync('./outputImg/*').forEach(f => {
    fs2.unlinkSync(f);
});
!fs2.existsSync('./outputImg') ? fs2.mkdirSync('./outputImg') : null;
!fs2.existsSync('./backups') ? fs2.mkdirSync('./backups') : null;


// create the network
var inputLayer = new Layer(2);
var hiddenLayer = new Layer(10);
var outputLayer = new Layer(3);


inputLayer.project(hiddenLayer);
hiddenLayer.project(outputLayer);

let networkBackup: any = {};
if (!CONFIG.new && fs2.existsSync(path.join('backups', `${CONFIG.photoName}.json`))) {
    try {
        networkBackup = JSON.parse(fs2.readFileSync(path.join('backups', `${CONFIG.photoName}.json`), 'utf8'));
    } catch (e) {
        networkBackup = {};
        throw new Error(`Error parsing ${CONFIG.photoName}.json`);
    }
}
let myNetwork;

if (networkBackup.neurons && !CONFIG.new) {
    console.log('Restore newtwork');
    myNetwork = Network.fromJSON(networkBackup);
} else {
    console.log('Create new newtwork');
    myNetwork = new Network({
        input: inputLayer,
        hidden: [hiddenLayer],
        output: outputLayer
    });
}

function trainNetwork(rate, X, Y, R, G, B) {
    myNetwork.activate([X, Y]);
    myNetwork.propagate(rate, [R, G, B]);
}


function generateImg(name, width, height) {
    var image = new Jimp(width, height);
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            let color = myNetwork.activate([(x + 1) / width, (y + 1) / height]);
            // console.log('');
            let colorHEX = Jimp.rgbaToInt(Math.ceil(color[0] * 255), Math.ceil(color[1] * 255), Math.ceil(color[2] * 255), 255);
            image.setPixelColor(colorHEX, x, y);
        }
    }
    image.write(path.join('outputImg', name));
}

function getErrorRate(pixels, train) {
    let width = pixels.shape[0];
    let height = pixels.shape[1];
    let err = {
        r: 0,
        g: 0,
        b: 0
    }
    let cor = {
        r: 0,
        g: 0,
        b: 0
    }
    for (let x = 0; x < width; x++) {
        // console.log('x', x);
        for (let y = 0; y < height; y++) {
            let color = myNetwork.activate([(x + 1) / width, (y + 1) / height]);

            let r = pixels.get(x, y, 0) / 255;
            let g = pixels.get(x, y, 1) / 255;
            let b = pixels.get(x, y, 2) / 255;
            r != Math.ceil(color[0] * 255) ? err.r++ : cor.r++;
            g != Math.ceil(color[1] * 255) ? err.g++ : cor.g++;
            b != Math.ceil(color[2] * 255) ? err.b++ : cor.b++;

            if (train)
                trainNetwork(0.1, (x + 1) / width, (y + 1) / height, r, g, b);
        }
    }
    return 100 * (err.r / (err.r + cor.r) + err.g / (err.g + cor.g) + err.b / (err.b + cor.b)) / 3;
}

getPixels(CONFIG.photo, function (err, pixels) {
    // console.log('gg');
    let width = pixels.shape[0];
    let height = pixels.shape[1];
    let mult = 10;
    if (CONFIG.iterations > 0) {
        console.log(`Start train with ${CONFIG.iterations} iterations with rate ${CONFIG.learnRate}`);
    }
    for (let i = 0; i < CONFIG.iterations; i++) {
        i % (1 * mult) == 0 ? console.log(i) : null;
        i % (1 * mult) == 0 ? generateImg(`it-${i}.png`, width, height) : null;
        let err = getErrorRate(pixels, true);
        // i % 10 == 0 ? console.log(err) : null;
    }
    generateImg('final.png', width, height);
    fs2.writeFileSync(path.join('backups', `${CONFIG.photoName}.json`), JSON.stringify(myNetwork.toJSON()));
});



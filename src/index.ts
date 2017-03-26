import 'ts-helpers';
// import * as fs from 'fs';
import getPixels = require('get-pixels');

import gynaptic = require('gynaptic');

const Neuron = gynaptic.Neuron;
const Evolution = gynaptic.Evolution;
const Trainer = gynaptic.Trainer;
const Methods = gynaptic.Methods;
const Layer = gynaptic.Layer;
const Network = gynaptic.Network;
const Architect = gynaptic.Architect;


// create the network
var inputLayer = new Layer(2);
var hiddenLayer = new Layer(5);
var hiddenLayer2 = new Layer(3);
var outputLayer = new Layer(1);

inputLayer.project(hiddenLayer);
hiddenLayer.project(outputLayer);

// var myNetwork = new Network({
//     input: inputLayer,
//     hidden: [hiddenLayer],
//     output: outputLayer
// });

let networkBackup = JSON.parse(fs.readFileSync('backup.json', 'utf8'));

let myNetwork;

if (networkBackup.neurons) {
    console.log('Restore newtwork');
    myNetwork = Network.fromJSON(networkBackup);
} else {
    console.log('Create new newtwork');
    myNetwork = new Network({
        input: inputLayer,
        hidden: [hiddenLayer, hiddenLayer2],
        output: outputLayer
    });
}

function trainNetwork(rate, A, B) {
    myNetwork.activate([A / 100, B / 100]);
    myNetwork.propagate(.1, [(A + B) / 100]);
}

// for (let i = 0; i < 10000; i++) {
//     for (let j = 0; j <= 100; j++) {
//         for (let k = 0; k <= 100 - j; k++) {
//             myNetwork.activate([j / 100, k / 100]);
//             myNetwork.propagate(.1, [(j + k) / 100]);
//         }
//     }

//     if (i % 1000 == 0) {
//         console.log(`gen train ${i}`);
//     }
// }

// for (let i = 0; i < 1000000; i++) {
//     let A = Math.ceil(Math.random() * 50);
//     let B = Math.ceil(Math.random() * 50);
//     myNetwork.activate([A / 100, B / 100]);
//     myNetwork.propagate(.01, [(A + B) / 100]);
//     if (i % 100000 == 0)
//         console.log(i);
//     // console.log(A / 100, B / 100, (A + B) / 100);
// }

// test the network


let errors = 0;
let correct = 0;
let abbreviation = [];
for (let i = 0; i < 1000; i++) {
    for (let j = 0; j <= 100; j++) {
        for (let k = 0; k <= 100 - j; k++) {
            let rs = Math.floor(myNetwork.activate([j / 100, k / 100]) * 100);
            if (j + k != rs) {
                trainNetwork(.5, j, k);
                errors++;
                abbreviation.push(Math.abs(rs - j - k));
            } else {
                // trainNetwork(.001, j, k);
                correct++;
            }
        }
    }
}

// for (let i = 0; i < 10000000; i++) {
//     let A = Math.ceil(Math.random() * 50);
//     let B = Math.ceil(Math.random() * 50);
//     let rs = Math.floor(myNetwork.activate([A / 100, B / 100]) * 100);
//     if (A + B != rs) {
//         trainNetwork(.1, A, B);
//         errors++;
//         abbreviation.push(Math.abs(rs - A - B));
//     } else {
//         // trainNetwork(.001, A, B);
//         correct++;
//     }
// }

let abbreviationMediane = 0;
let maxAbr = 0;
for (let i in abbreviation) {
    if (abbreviation[i] > maxAbr)
        maxAbr = abbreviation[i];
    abbreviationMediane += abbreviation[i];
}
abbreviationMediane /= abbreviation.length;
let errRate = Math.ceil((errors / (errors + correct)) * 10000) / 100;
let corrRate = Math.ceil((correct / (errors + correct)) * 10000) / 100;

console.log(`errors: ${errors} | error rate: ${errRate} % |`);
console.log(`Average abbreviation: +-${abbreviationMediane} | Maximal abreviation: ${maxAbr}`)
console.log(`correct: ${correct} | correct rate: ${corrRate} %`);


fs.writeFileSync('backup.json', JSON.stringify(myNetwork.toJSON()));



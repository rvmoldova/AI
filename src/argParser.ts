import * as fs from 'fs';
import * as path from 'path';

export default function argParser(args): { new: boolean, photo: string, iterations: number, photoName: string, learnRate: number } {
    let conf: any = {
        iterations: 1000,
        learnRate: 0.1
    };
    for (let i in args) {
        if (args[i] == '--new')
            conf.new = true;

        if (args[i] == '--photo')
            if (args[parseInt(i) + 1] && fs.existsSync(path.resolve(args[parseInt(i) + 1])))
                conf.photo = path.resolve(args[parseInt(i) + 1]);

        if (args[i] == '--iterations')
            if (typeof parseInt(args[parseInt(i) + 1]) === 'number')
                conf.iterations = parseInt(args[parseInt(i) + 1]);

        if (args[i] == '--learnRate')
            if (typeof parseFloat(args[parseInt(i) + 1]) === 'number')
                conf.learnRate = parseFloat(args[parseInt(i) + 1]);

        // todo: setup neuron layers from CLI
    }
    if (!conf.photo)
        throw new Error('Missing --photo');
    let phP = path.parse(conf.photo).base;
    conf.photoName = phP;
    return conf;
}
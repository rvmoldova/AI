import * as fs from 'fs';
import * as path from 'path';

export default function argParser(args): { new: boolean, photo: string, iterations: number, photoName: string } {
    let conf: any = { iterations: 1000 };
    for (let i in args) {
        if (args[i] == '--new')
            conf.new = true;

        if (args[i] == '--photo')
            if (args[parseInt(i) + 1] && fs.existsSync(path.resolve(args[parseInt(i) + 1])))
                conf.photo = path.resolve(args[parseInt(i) + 1]);

        if (args[i] == '--iterations')
            if (typeof parseInt(args[parseInt(i) + 1]) === 'number')
                conf.iterations = parseInt(args[parseInt(i) + 1]);
    }
    if (!conf.photo)
        throw new Error('Missing --photo');
    let phP = conf.photo.split('/');
    conf.photoName = phP[phP.length - 1];
    return conf;
}
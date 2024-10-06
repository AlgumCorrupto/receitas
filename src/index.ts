import * as utils from './utils';

let postPath =  './posts';
let templatePath = './templates';
let outPath  =  './docs';
let imagePath = './imagens';

utils.copyFolder('./css', outPath);
utils.copyFolder('./imagens', outPath);
utils.copyFolder('./fonts', outPath);

let postsYamls  = utils.readPostsFromPath(postPath);

utils.genHomeFile(templatePath, outPath, structuredClone(postsYamls));
utils.genPostFolder(templatePath, outPath, structuredClone(postsYamls));

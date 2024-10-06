"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilesToRead = getFilesToRead;
exports.readPostsFromPath = readPostsFromPath;
exports.genPostFolder = genPostFolder;
exports.copyFolder = copyFolder;
exports.tagExists = tagExists;
exports.genHomeFile = genHomeFile;
var fs = __importStar(require("fs"));
var yaml = __importStar(require("js-yaml"));
var moustache = __importStar(require("mustache"));
function getFilesToRead(path) {
    var files = fs.readdirSync(path);
    var posts = [];
    files.forEach(function (file) {
        if (file.endsWith(".yml"))
            posts.push(path + '/' + file);
    });
    return posts;
}
// it should return a plain js object...
function readPostsFromPath(path) {
    var postPaths = getFilesToRead(path);
    var docs = [];
    postPaths.forEach(function (postPath) {
        var ymldoc = yaml.load(fs.readFileSync(postPath, 'utf8'));
        ymldoc.filename = postPath.substring(postPath.lastIndexOf('/'), postPath.lastIndexOf('.'));
        docs.push(ymldoc);
    });
    return docs;
}
function genPostFolder(templatePath, sitePath, posts) {
    var template = fs.readFileSync(templatePath + '/post.html').toString();
    var outPath = sitePath + '/receitas';
    var indexFile = fs.readFileSync(templatePath + '/index.html').toString();
    posts.forEach(function (post) {
        if (!post.banner.startsWith('http')) {
            post.banner = '../imagens' + post.banner;
        }
        for (var i = 0; i < post.ingredientes.length; i++) {
            if (!post.ingredientes[i].imagem.startsWith('http')) {
                post.ingredientes[i].imagem = '../imagens' + post.ingredientes[i].imagem;
            }
        }
        for (var i = 0; i < post.preparo.length; i++) {
            if (post.preparo[i].imagem != undefined) {
                if (!post.preparo[i].imagem.startsWith('http')) {
                    post.preparo[i].imagem = '../imagens' + post.ingredientes[i].imagem;
                }
            }
        }
        var htmlpost = moustache.render(template, post);
        var indexedPost = {
            corpo: htmlpost,
            titulo: post.titulo,
            rootPath: '../'
        };
        fs.writeFileSync(outPath + post.filename + '.html', moustache.render(indexFile, indexedPost));
    });
}
function copyFolder(from, to) {
    var fromname = from.substring(from.indexOf('/', from.length));
    fs.cpSync(from, to + '/' + fromname, { recursive: true });
}
function tagExists(tag, classArray) {
    for (var i = 0; i < classArray.length; i++) {
        if (tag == classArray[i].nome)
            return true;
    }
    return false;
}
function genHomeFile(templatePath, sitePath, recipes, destaques) {
    var tags = [];
    recipes.forEach(function (recipe) {
        if (!recipe.banner.startsWith('http')) {
            recipe.banner = './imagens' + recipe.banner;
        }
        recipe.tags.forEach(function (rcpTag) {
            if (!tagExists(rcpTag, tags))
                tags.push({ nome: rcpTag, receitas: [] });
            for (var i = 0; i < tags.length; i++) {
                if (tags[i].nome == rcpTag)
                    tags[i].receitas.push(recipe);
            }
        });
    });
    var home = {
        tags: tags
        // TODO: destaques
    };
    var homehtml = fs.readFileSync(templatePath + '/home.html').toString();
    var indexhtml = fs.readFileSync(templatePath + '/index.html').toString();
    var indexedHome = {
        corpo: moustache.render(homehtml, home),
        titulo: "Página inicial",
        rootPath: "./"
    };
    fs.writeFileSync(sitePath + '/index.html', moustache.render(indexhtml, indexedHome));
}

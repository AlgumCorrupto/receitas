import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as moustache from 'mustache';

export interface Preparo {
    passo: string,
    imagem: string | undefined
}

export interface ClassReceita {
    nome: string
    receitas: Receita[]
}

export interface IndexedHtml {
    corpo: string,
    titulo: string,
    rootPath: string
}

export interface HomeInterface {
    //destaques: Receita[],
    tags: ClassReceita[]
}

export interface Ingredientes {
    nome: string,
    quantidade: string,
    imagem: string
}

export interface Receita {
    filename: string,
    tempo: string,
    banner: string,
    titulo: string,
    descricao: string,
    ingredientes: Ingredientes[], // isso aqui na verdade representa uma tabela
    preparo: Preparo[],
    tags: string[]
}

export function getFilesToRead(path: string): string[]
{
    const files: string[] = fs.readdirSync(path);
    let posts: string[] = [];
    files.forEach(file => {
        if(file.endsWith(".yml")) posts.push(path + '/'+ file);
    });
    return posts;
}

// it should return a plain js object...
export function readPostsFromPath(path: string)
{
    let postPaths: string[] = getFilesToRead(path);
    let docs: Receita[] = [];
    postPaths.forEach( postPath => {
        let ymldoc: Receita = yaml.load(fs.readFileSync(postPath, 'utf8')) as Receita;
        ymldoc.filename     = postPath.substring(postPath.lastIndexOf('/'), postPath.lastIndexOf('.'));
        docs.push(ymldoc);
    });
    return docs;
}

export function genPostFolder(templatePath: string, sitePath: string, posts: Receita[])
{
    let template: string = fs.readFileSync(templatePath + '/post.html').toString();
    let outPath: string = sitePath + '/receitas'
    let indexFile = fs.readFileSync(templatePath + '/index.html').toString();
    posts.forEach( post => {
        if(!post.banner.startsWith('http'))
        {
            post.banner = '../imagens'+ post.banner;
        }
        for(let i = 0; i < post.ingredientes.length; i++)
        {
            if(!post.ingredientes[i].imagem.startsWith('http'))
            {
                post.ingredientes[i].imagem = '../imagens'+ post.ingredientes[i].imagem;
            }
        }
        for(let i = 0; i < post.preparo.length; i++)
            {
                if(post.preparo[i].imagem != undefined)
                {
                    if(!post.preparo[i].imagem!.startsWith('http'))
                        {
                            post.preparo[i].imagem = '../imagens'+ post.ingredientes[i].imagem;
                        }
                }
            }
        let htmlpost = moustache.render(template, post);
        let indexedPost: IndexedHtml = {
            corpo: htmlpost,
            titulo: post.titulo,
            rootPath: '../'
        }
        fs.writeFileSync(
            outPath + post.filename + '.html',
            moustache.render(indexFile, indexedPost)
        )
    })
}

export function copyFolder(from: string, to:string)
{
    let fromname = from.substring(from.indexOf('/', from.length));
    fs.cpSync(from, to + '/' + fromname, {recursive: true});
}

export function tagExists(tag: string, classArray: ClassReceita[])
{
    for(let i = 0; i < classArray.length; i++)
    {
        if(tag == classArray[i].nome)
            return true
    }
    return false
}

export function genHomeFile(templatePath: string, sitePath: string, recipes: Receita[], destaques?: Receita[])
{
    let tags: ClassReceita[] = []
    recipes.forEach(recipe => {
        if(!recipe.banner.startsWith('http'))
        {
                recipe.banner = './imagens'+ recipe.banner;
        }
        recipe.tags.forEach(rcpTag => {
            if(!tagExists(rcpTag, tags))
                tags.push({nome: rcpTag, receitas: []})
            for(let i = 0; i < tags.length; i++)
            {
                if(tags[i].nome == rcpTag)
                    tags[i].receitas.push(recipe)
            }
        })
    })
    let home: HomeInterface = {
        tags: tags
        // TODO: destaques
    }

    let homehtml = fs.readFileSync(templatePath + '/home.html').toString();
    let indexhtml = fs.readFileSync(templatePath + '/index.html').toString();

    let indexedHome: IndexedHtml = {
        corpo: moustache.render(homehtml, home),
        titulo: "Página inicial",
        rootPath: "./"
    }
    fs.writeFileSync(sitePath + '/index.html', moustache.render(indexhtml, indexedHome))
}

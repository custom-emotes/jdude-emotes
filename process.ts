import * as sharp from "sharp";
import * as fs from "fs";
import * as path from "path";


const emotesFolder = './emotes/';
const assets = './assets/';

const out = "./output/";
const assetsOutput = "./output/static/";

if (!fs.existsSync(out)){
    fs.mkdirSync(out);
}

if (!fs.existsSync(assetsOutput)){
    fs.mkdirSync(assetsOutput);
}

fs.readdirSync(emotesFolder).forEach(async file => {
    const pathfile:string = emotesFolder + file;
    const ext:string = path.extname(pathfile);
    const name:string = path.basename(pathfile,ext);
    const image = await sharp(pathfile)
    //const imageInfo = await image.metadata();

    await ResizeImages(image,name,assetsOutput);

});


fs.readdirSync(assets).forEach(async file => {
    const pathfile:string = assets + file;
    const filename:string = path.basename(pathfile);

    fs.copyFile(pathfile, assetsOutput + filename, (err) => {});
});
fs.copyFile("_headers", out + "_headers", (err) => {});
fs.copyFile("emotes.json", out + "emotes.json", (err) => {});

async function ResizeImages(image, name, outputFolder){
    await image.resize({width: 28}).toFile(outputFolder + name + "_28.webp" )
    await image.resize({width: 56}).toFile(outputFolder + name + "_56.webp" )
    await image.resize({width: 112}).toFile(outputFolder + name + "_112.webp" )
}
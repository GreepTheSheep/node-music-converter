require('dotenv').config();
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

const acceptedFormats = [".flac", ".mp3", ".wav", ".wma"];

// source files located in SOURCE_DIR (default /source)
const sourceDir = String(process.env.SOURCE_DIR) || "/source";
// dest files located in DEST_DIR (default /dest)
const destDir = String(process.env.DEST_DIR) || "/dest";

let files = Array.from(fs.readdirSync(sourceDir, {recursive: true}));
let filesToConvert = [];

for (let i = 0; i < files.length; i++) {
    let pathSource = path.join(sourceDir, files[i]),
        pathDest = path.join(destDir, files[i]);
    // check if dir, create it
    if (fs.lstatSync(pathSource).isDirectory()) {
        if (!fs.existsSync(pathDest)) {
            console.log("Create dir:", pathDest);
            fs.mkdirSync(pathDest);
        }
    }

    if (fs.lstatSync(pathSource).isFile()) {
        if (acceptedFormats.includes(path.extname(pathSource).toLowerCase())) {
            // convert it to pathDest
            let fileDest = pathDest.substring(0, pathDest.lastIndexOf(".")) + ".mp3";
            if (fs.existsSync(fileDest)) {
                console.log("File", fileDest, "exists already, skipping");
            } else {
                filesToConvert.push({source: pathSource, dest: fileDest});
            }
        }
    }
    convert();
}

function convert() {
    let file = filesToConvert[0];
    console.log("Processing file:", file);
    ffmpeg(file.source)
        .audioBitrate(256)
        .audioCodec('libmp3lame')
        .save(file.dest)
        .on('progress', function(progress) {
            console.log(file.source, 'Processing: ' + progress.percent + '% done');
        })
        .on('error', function(err, stdout, stderr) {
            console.log(file.source, 'Cannot process file: ' + err.message);
            filesToConvert.shift();
            convert();
        })
        .on('end', function(stdout, stderr) {
            console.log('Converting succeeded to:',pathDest);
            if (filesToConvert.length > 0) {
                filesToConvert.shift();
                convert();
            } else process.exit(0);
        });
}
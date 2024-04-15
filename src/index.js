require('dotenv').config();
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

const acceptedFormats = [".flac", ".mp3", ".wav", ".wma", ".ogg"];

// source files located in SOURCE_DIR (default /source)
const sourceDir = String(process.env.SOURCE_DIR) || "/source";
// dest files located in DEST_DIR (default /dest)
const destDir = String(process.env.DEST_DIR) || "/dest";

const deleteDist = Boolean(process.env.DELETE_DEST_ON_START) || false,
    igonreIfExists = Boolean(process.env.IGNORE_EXISTS) || true,
    audioBitrate = Number(process.env.MP3_BITRATE) || 256;


fetchFiles();

function fetchFiles() {
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir);

    if (deleteDist) {
        console.log("DELETE_DEST_ON_START is set to true, deleting content from", destDir);
        let destFiles = Array.from(fs.readdirSync(destDir, {recursive: true})).reverse();
        for (let d = 0; d < destFiles.length; d++) {
            let filePath = path.join(destDir, destFiles[d]);
            fs.rmSync(filePath, {recursive: true, force: true});
            console.log(filePath, "is deleted");
        }
    }

    let files = Array.from(fs.readdirSync(sourceDir, {recursive: true})),
        filesToConvert = [];

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
                    if (igonreIfExists) console.log("File", fileDest, "exists already, skipping");
                    else filesToConvert.push({source: pathSource, dest: fileDest, existsAlready: true});
                } else {
                    filesToConvert.push({source: pathSource, dest: fileDest, existsAlready: false});
                }
            }
        }
    }
    if (filesToConvert.length > 0) convert(filesToConvert);
}

function convert(filesToConvert) {
    console.log("-- Remaining files:", filesToConvert.length);
    let file = filesToConvert[0];
    console.log("Processing file:", file.source);
    try {
        if (file.existsAlready) fs.unlinkSync(file.dest);
        ffmpeg(file.source)
            .audioBitrate(audioBitrate)
            .audioCodec('libmp3lame')
            .save(file.dest)
            .on('error', function(err, stdout, stderr) {
                console.log(file.source, 'Cannot process file: ' + err.message);
                if (filesToConvert.length > 1) {
                    filesToConvert.shift();
                    convert(filesToConvert);
                } else process.exit(0);
            })
            .on('end', function(stdout, stderr) {
                console.log('Converting succeeded to:', file.dest);
                if (filesToConvert.length > 1) {
                    filesToConvert.shift();
                    convert(filesToConvert);
                } else process.exit(0);
            });
    } catch (err) {
        console.error("Error while processing", file.source, err);
        if (filesToConvert.length > 1) {
            filesToConvert.shift();
            convert(filesToConvert);
        } else process.exit(0);
    }
}
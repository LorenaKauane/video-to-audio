const express = require("express");
const multer = require("multer");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;

ffmpeg.setFfmpegPath(ffmpegPath);

const PORT = process.env.PORT || 5000;
const app = express();

const storage = multer.diskStorage({
  destination: (request, file, callback) => {
    callback(null, "./tmp/");
  },
  filename: (request, file, callback) => {
    callback(null, Date.now() + "-" + file.originalname);
  },
});

app.use(multer({ storage }).single("file"));

app.post("/convert", (request, response) => {
  const file = request.file;
  const fileName = "-output.mp3";

  ffmpeg("tmp/" + file.filename)
    .toFormat("mp3")
    .on("end", () => {
      return response.download(__dirname + fileName, (error) => {
        if (error) throw error;
        console.log("conversion success");
        removeFile(`${__dirname}/tmp/${file.filename}`);
      });
    })
    .on("error", (error) => {
      console.log(error);
      removeFile(`${__dirname}/tmp/${file.filename}`);
    })
    .saveToFile(__dirname + fileName);
});

function removeFile(directory) {
  fs.unlink(directory, (error) => {
    if (error) throw error;
    console.log("File deleted");
  });
}

app.listen(PORT);

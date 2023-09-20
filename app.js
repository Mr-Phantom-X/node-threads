const express = require("express");
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const axios = require("axios");

require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.static("public"))



app.use(cors(
  {
    origin: "*",
    methods: ["POST", "GET"],
    credentials: true
  }
)
);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://zzzthreads.com');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

const port = process.env.PORT||4000;


app.get("/", (req, res) => {
    res.send("index")
})



app.get("/download-video", (req, res) => {
     let url = req.query.url;
  
    url = "https://threadsvideodownloader.io/download?v=" + url;

    fetch(url)
        .then((response) => {
            if (response.ok) {
                return response.text();
            } else {
                throw new Error(`Failed to retrieve the website. Status code: ${response.status}`);
            }
        })

        .then((htmlContent) => {

            const $ = cheerio.load(htmlContent);



            const jsonArray = [];

            $('.download-item').each(function () {
                const videoSource = $(this).find('video').attr('src');
                const fileType = $(this).find('.type div').text();
                const downloadLink = $(this).find('.btn-download').attr('href');

                const jsonData = {
                    videoSource: videoSource,
                    fileType: fileType,
                    downloadLink: downloadLink
                };
                jsonArray.push(jsonData);

            });

            console.log(jsonArray);
            res.status(200).send(jsonArray);
        })
        .catch((error) => {
            console.error(`An error occurred: ${error.message}`);
            res.status(500).send('An error occurred');
        });
});



app.get("/message", (req, res) => {
    res.send({ message: "Message from other sides" })
})



app.post("/convert", async (req, res) => {
    const videoUrl = req.body.videoUrl;

    try {
        const response = await axios.get(videoUrl, {
            responseType: 'arraybuffer'
        });

        const inputBuffer = Buffer.from(response.data);

        let output = Date.now() + "output.mp3";
        exec(`ffmpeg -i pipe:0 -f mp3 pipe:1`, { encoding: 'binary', maxBuffer: 1024 * 1024 * 50 }, (error, stdout, stderr) => {
            if (error) {
                console.log(`Error: ${error.message}`);
                res.status(500).send("Error converting video");
            } else {
                console.log("File is converted");
                res.set('Content-Type', 'audio/mp3');
                res.set('Content-Disposition', `attachment; filename=${output}`);
                res.send(Buffer.from(stdout, 'binary'));
            }
        }).stdin.end(inputBuffer);

    } catch (error) {
        console.error("Error fetching video:", error);
        res.status(500).send("Error fetching video");
    }
});

app.listen(port, () => {
    console.log("server started " + port );
})

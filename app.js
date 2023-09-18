const express = require("express");
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const cors = require("cors");

require("dotenv").config();

const app = express();

app.use(express.json());

app.use(cors(
  {
    origin: ["https://node-threads.vercel.app/"],
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


app.listen(port, () => {
    console.log("server started " + port );
})

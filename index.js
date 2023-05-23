const express = require('express');
const app = express();
const port = 7000 || process.env.PORT;

const { training, getTrainedResponse } = require('./training')
const sentiment = require('./sentiment')

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.listen(port, async () => {
  console.log("Starting ...")
  await training()
  console.log(`Example app listening at http://localhost:${port}`)
})

// Cada speaker
app.post("/sentiment", async (req, res) => {
  const { text } = req.body
  const lines = text.split("\n");
  const speakers = {};
  let currentSpeakerId = null;

  for (let line of lines) {
    if (line.startsWith("SPEAKER")) {
      const [, speakerId] = line.split(" ");
      currentSpeakerId = speakerId;
      if (!speakers[currentSpeakerId]) {
        speakers[currentSpeakerId] = [];
      }
    } else {
      if (currentSpeakerId) {
        speakers[currentSpeakerId].push(line.trim());
      }
    }
  }


  const result = await Promise.all(
    Object.keys(speakers).map(async (speakerId) => {
      const speakerText = speakers[speakerId].join(" ");
      const speakerSentiment = await sentiment(speakerText);
      return {
        speakerId,
        speakerSentiment: speakerSentiment.vote,
      };
    }))

  res.json(result)
})

// texto completo
app.post("/sentiment-full", async (req, res) => {
  const { text } = req.body
  const result = await sentiment(text)
  res.json(result)
})

app.post("/api/trained-model", async (req, res) => {
  const body = req.body
  const result = await getTrainedResponse(body)
  console.log(result.length)
  res.json(result)
})
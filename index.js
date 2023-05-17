const express = require('express');
const app = express();
const port = 7000 || process.env.PORT;

const {training, getTrainedResponse} = require('./training')
const sentiment = require('./sentiment')

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.listen(port, async () => {
  console.log("Starting ...")
  await training()
  console.log(`Example app listening at http://localhost:${port}`)
})

app.post("/sentiment", async (req, res) => {
  const { text } = req.body
  const result = await sentiment(text)
  res.json(result)
});

app.post("/api/trained-model", async (req, res) => {
  const body = req.body
  const result = await getTrainedResponse(body)
  console.log(result.length)
  res.json(result)
});
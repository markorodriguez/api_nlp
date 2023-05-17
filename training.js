const { containerBootstrap } = require("@nlpjs/core-loader");
const { Nlp } = require("@nlpjs/nlp");
const { LangEs, NormalizerEs } = require("@nlpjs/lang-es");

const fs = require("fs");

let nlpModel

const training = async () => {

  const labels = {
    "negativo": 0,
    "positivo": 1,
  };

  const normalizer = new NormalizerEs();
  /*
  const csvData = fs
    .readFileSync("data.csv", "utf8")
    .split("\n")
    .map((line) => {
      const lineParts = line.split("^");
      return {
        text: normalizer.normalize(lineParts[0].toLowerCase().trim()),
        label: lineParts[1].toLowerCase().trim(),
        score: labels[lineParts[1]],
      };
    });
  */
  const csvData = JSON.parse(fs.readFileSync("out.json", "utf8")).map((item) => {
    return {
      text: normalizer.normalize(item.text.toLowerCase().trim()),
      label: item.sentiment.toLowerCase().trim(),
      score: labels[item.sentiment.toLowerCase().trim()],
    };
  })

  // balance data 

  const positiveData = csvData.filter((item) => item.score === 1);
  const negativeData = csvData.filter((item) => item.score === 0);

  const balancedData = positiveData.slice(0, negativeData.length).concat(negativeData);

  console.log("positive balanced items:", balancedData.filter((item) => item.score === 1).length);
  console.log("negative balanced items:", balancedData.filter((item) => item.score === -1).length);

  const container = await containerBootstrap();
  container.use(Nlp);
  container.use(LangEs);

  const nlp = container.get("nlp");
  nlp.settings.autosave = false;
  nlp.addLanguage("es");
  

  // TRAINING
  if (balancedData) {
    balancedData.forEach((item) => {
      nlp.addDocument("es", item.text, item.label);
    });
  }

  await nlp.train();
  nlpModel = nlp

};

const getTrainedResponse = async (body) => {
  const responses = [];

  try {
    const promises = body.map(async (element) => {
      const { textMessage } = element;
      console.log(textMessage);
      const { classifications } = await nlpModel.process("es", textMessage);

      return { ...element, qualification: classifications[0].intent, model: "NlpJs" };
    });

    const result = await Promise.all(promises);
    console.log(result);
    responses.push(result);
  } catch (error) {
    console.error(error);
  }

  console.log(responses.length, "length");
  return responses;
};


module.exports = {training, getTrainedResponse};
const { containerBootstrap } = require("@nlpjs/core-loader");
const { Nlp } = require("@nlpjs/nlp");
const { LangEs, NormalizerEs } = require("@nlpjs/lang-es");

const fs = require("fs");

let nlpModel

const training = async () => {

  const labels = {
    negativo: -1,
    positivo: 1,
  };

  const normalizer = new NormalizerEs();

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

  // console.log(csvData, 'csvData')

  console.log("positive items:", csvData.filter((item) => item.score === 1).length);
  console.log("negative items:", csvData.filter((item) => item.score === -1).length);

  const container = await containerBootstrap();
  container.use(Nlp);
  container.use(LangEs);

  const nlp = container.get("nlp");
  nlp.settings.autosave = false;
  nlp.addLanguage("es");
  

  // TRAINING
  if (csvData) {
    csvData.forEach((item) => {
      nlp.addDocument("es", item.text, item.label);
    });
  }

  await nlp.train();
  nlpModel = nlp

};

const getTrainedResponse = async (text) => {
  const response = await nlpModel.process("es", text);
  return response;
};

module.exports = {training, getTrainedResponse};
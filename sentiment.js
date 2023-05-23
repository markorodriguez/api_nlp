const { LangEs } = require("@nlpjs/lang-es")
const { Container } = require("@nlpjs/core-loader")
const { SentimentAnalyzer } = require("@nlpjs/sentiment") 

// ANALISIS DE SENTIMIENTOS EN ESPAÑOL

const sentiment = async (text) => {
  const container = new Container();
  container.use(LangEs);
  const sentiment = new SentimentAnalyzer({ container });
  const result = await sentiment.process({ locale: 'es', text });
  return result.sentiment;
}

module.exports = sentiment;


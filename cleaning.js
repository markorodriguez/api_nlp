const fs = require("fs")

const csvFile = fs.readFileSync("./data.csv", "utf8")

const lines = csvFile.split("\n")

const dataJSON = []

lines.forEach(line => {
  const [text, sentiment] = line.split("^")
  if (sentiment == 'positivo' || sentiment == 'negativo') {
    dataJSON.push({ text, sentiment })
  }
})

console.log(lines.length, 'TOTAL')
console.log(dataJSON.length, 'TOTAL VALID')

fs.writeFileSync("./out.json", JSON.stringify(dataJSON, null, 2))

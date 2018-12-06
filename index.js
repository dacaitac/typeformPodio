const request = require('request')

const fs        = require('fs')
const typeform = require('./typeformSetup')
const podio = require('./podioHandler')
const config = JSON.parse(fs.readFileSync('./config.json'))

const copFormId = 'LFqikz' // ID del formulario en typeform
const audFormId = 'e5MPWx'

let copValues = {
  'COMPANY_NAME': {
    'typeform_id': 2,
    'podio_id' : 176573088,
    'data': []
  },
  'OPPORTUNITIES': {
    'typeform_id': 3,
    'podio_id' : 176573087,
    'data': []
  },
  'COPERATIONS': {
    'typeform_id': 5,
    'podio_id' : 176573089,
    'data': []
  }
}

let audValues = {
  'COMPANY_NAME': {
    'typeform_id': 4,
    'data': []
  }
}

function resetValues(values){
  for(field in values)
    values[field].data = []
}

async function writeConfig( newConfig ){
  await fs.writeFile('config.json', JSON.stringify(config), function (err) {
    if (err) return console.log(err);
    // console.log(JSON.stringify(config));
    console.log('Writing new config');
  });
}

async function setCopValues(formId, values){
  config.podio.appToken = "ac254c52522c4e599e723312074005e8"
  config.podio.appId = 21460631
  writeConfig( config )

  resetValues(values)
  for(field in values){
    values[field].data = await podio.getCategoryField(21460631, values[field].podio_id)
    .catch((err) => {
      console.log(err)
    })
  }
  typeform.updateForm(copFormId, values)
}

// Aud hace referencia a la app de auditoria en podio
async function setAudValues(values){
  // Llama primero todas las empresas que estan en la aplicacion
  // CRM Empresas
  config.podio.appToken = "0980ba976500450cacfcef31848883e3"
  config.podio.appId = 14636882
  writeConfig( config )

  resetValues(values)
  for(field in values){
    // values[field].data = await podio.getAllItems(14636882)
    await podio.getAllItems(14636882).then( items =>{
      let titles = items.map(item => { return item.title })
      values[field].data = titles
    })
    .catch((err) => {
      console.log(err)
    })
  }
  typeform.updateForm(audFormId, values)
}

var express = require("express"),
    app = express(),
    bodyParser  = require("body-parser"),
    methodOverride = require("method-override");
    mongoose = require('mongoose');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());

var router = express.Router();

app.get('/coperations', (req, res) => {
  setCopValues(copValues)
  res.status(200).send('Coperations form Updated');
});

app.get('/audit', (req, res) => {
  setAudValues(audValues)
  res.status(200).send('Audit form Updated');
});

// app.get('/file', (req, res) => {
//   setCopValues(values)
//   res.status(200).send('File Updated');
// });)

if (module === require.main) {
  // [START server]
  // Start the server
  const server = app.listen(process.env.PORT || 8080, () => {
    const port = server.address().port;
    console.log(`App listening on port ${port}`);
  });
  // [END server]
}

module.exports = app;

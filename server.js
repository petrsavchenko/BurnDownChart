const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const schedule = require('node-schedule');
const axios = require('axios');

const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

/**
 * Config
 */
const config = require('./config');

const statsManager = require('./helpers/statsManager');

const app = express();
const port = config.port;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

app.use(morgan(`API Request (port ${port}): :method :url :status :response-time ms - :res[content-length]`));

axios.defaults.headers.common = {
  "authorization": `Bearer ${config.external.access_token}`
}

// axios.post(config.external.getAuthUrl, {
//   "Domain": config.external.domain,
//   "RefreshToken": config.external.refresh_token
// })
// .then(res => {
//   axios.defaults.headers.common = {
//     // "authorization": `Bearer ${res.data.access_token}`
//     "authorization": `Bearer ${res.data.access_token}`
//   }
//   console.log(res.data.access_token);
// })
// .catch(err => {console.error(err)});
app.use(express.static(path.join(__dirname, 'client')));

/**
 * Connect to MongoDB via Mongoose
 */
var mongoose = require('mongoose')

const opts = {
  promiseLibrary: global.Promise,
  auto_reconnect: true,
  autoIndex: true,
  useNewUrlParser: true 
}

mongoose.Promise = opts.promiseLibrary
mongoose.connect(config.db.uri, opts)

const db = mongoose.connection

db.on('error', (err) => {
  console.error(err);
  if (err.message.code === 'ETIMEDOUT') {
      winston.error('Db connection error. Reconnect is required.', err)
      mongoose.connect(config.db.uri, opts)
  }
})

db.once('open', () => {
  console.log('Opened fine');
  
  app.use(require('./routes/defects'));
  app.use(require('./routes/settings'));

  const jobRunTime = { hour: 7, minute: 0 };
  // 5pm Au 
  // '* * 1 * *' every one hour
  // const jobRunTime = { hour: 12, minute: 0 };
  // const jobRunTime = '* * 1 * *';

  const statsSaveJob = schedule.scheduleJob(jobRunTime, function(){
    statsManager.saveStatistics();
    console.log(`Schedule Job happend. Date is ${new Date().toString()}`)
  }); 

  statsManager.saveStatistics();
  app.listen(port, () => console.log(`Server is listening on port ${port}`));
  
  // ping itself to awake
  // setInterval(() => {
  //   axios.get(config.prodUrl)
  //   .then(res => console.log('ping was successful'))
  //   .catch(err => console.log('ping was successful'));
  // }, 600000); // every 10 minutes (600000)
})


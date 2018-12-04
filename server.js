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

axios.post(config.external.getAuthUrl, {
  "Domain": config.external.domain,
  "RefreshToken": config.external.refresh_token
})
.then(res => {
  axios.defaults.headers.common = {
    "authorization": `Bearer ${res.data.access_token}`
  }
})
.catch(err => {debugger; console.error(err)});
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

  // const jobRunTime = { hour: 23, minute: 30 };
  // 5pm Au 
  const jobRunTime = { hour: 6, minute: 0 };

  const statsSaveJob = schedule.scheduleJob(jobRunTime, function(){
    statsManager.saveStatistics();
  }); 

  statsManager.saveStatistics();
  app.listen(port, () => console.log(`Server is listening on port ${port}`));
})


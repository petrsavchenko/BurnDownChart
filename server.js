const express = require('express');
// const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const needle = require('needle');

// Authentification
// const jwt = require('express-jwt');
// const jwtAuthz = require('express-jwt-authz');
// const jwksRsa = require('jwks-rsa');
const cors = require('cors');
const morgan = require('morgan');

/**
 * Config
 */
// const config = require('./config');

const app = express();
const port = 3001;
const axios = require('axios');

// Serve static files from the React app
// app.use(express.static(path.join(__dirname, 'client/build')));

// if (!config.auth.domain || !config.auth.audience) {
//   throw 'Make sure you have auth.domain, and auth.audience in your config file'
// }

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(cors());


app.get('/status', (req, res) => {
  axios.post('https://home.plutoratest.com/api/authentication/auth/refresh', {
    "Domain": "home",
    "RefreshToken": "hAtQb7vG4yaTiyXgDX/+G9PuVs4ov1AZ4GfNXP06FEa8s1IviHNkU/WB7rxNyQdK0VcG8abg2c4FRQmwePGHVw=="
  })
  .then(function (response) {
    axios.defaults.headers.common = {
      "authorization": `Bearer ${response.data.access_token}`
    }
    axios.post('https://home.plutoratest.com/api/suggestion/suggest', {"PageNum":4,"RecordsPerPage":10,"Text":"","SuggestionType":"Release","IncludeChildren":false})
    .then(res => {
      debugger;
       res
    })
    .catch(err => console.error(err));
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });
});



app.use(morgan(`API Request (port ${port}): :method :url :status :response-time ms - :res[content-length]`));

/**
 * Winston Logger configuration
 */
// const winston = require('winston');
// const fs = require('fs');
// // const env = config.env;
// const logDir = config.logDir;

// // Create the log directory if it does not exist
// if (!fs.existsSync(logDir)) {
//   fs.mkdirSync(logDir);
// }

// const tsFormat = () => (new Date()).toLocaleTimeString();
// winston.add(new (require('winston-daily-rotate-file'))({
//   filename: `${logDir}/log`,
//   timestamp: tsFormat,
//   datePattern: 'D-M-Y',
//   prepend: true,
//   json: false,
//   level: env === 'development' ? 'verbose' : 'info',
// }));

//
// You can add a separate exception logger by passing it to `.exceptions.handle`
//
// winston.exceptions.handle(
//   new winston.transports.File({ filename: `${logDir}/exceptions.log` })
// );

// winston.exitOnError = false;

// Set up mongoose connection
// var mongoose = require('mongoose');
// var dev_db_url = 'mongodb://localhost:27017/pricechecker'
// var mongoDB = process.env.MONGODB_URI || dev_db_url;
// mongoose.connect(mongoDB, { useNewUrlParser: true });
// mongoose.Promise = global.Promise;
// var db = mongoose.connection;
// db.on('error', console.error.bind(console, 'MongoDB connection error:'));


/**
 * Connect to MongoDB via Mongoose
 */
// var mongoose = require('mongoose')

// const opts = {
//   promiseLibrary: global.Promise,
//   auto_reconnect: true,
//   autoIndex: true,
//   useNewUrlParser: true 
// }

// mongoose.Promise = opts.promiseLibrary
// mongoose.connect(config.db.uri, opts)

// const db = mongoose.connection

// db.on('error', (err) => {
//   console.error(err);
//   if (err.message.code === 'ETIMEDOUT') {
//       winston.error('Db connection error. Reconnect is required.', err)
//       mongoose.connect(config.db.uri, opts)
//   }
// })

// db.once('open', () => {
//   console.log('Opened fine');

//   app.use(require('./routes/users'));
//   app.use(require('./routes/crawlers'));

//   // The "catchall" handler: for any request that doesn't
//   // match one above, send back React's index.html file.
//   app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname + '/client/build/index.html'));
//   });

//   //Start crawling
//   const crawlersManager = require('./helpers/crawlersManager');
//   crawlersManager.startAll();

//   app.listen(port, () => console.log(`Server is listening on port ${port}`));
//   winston.info(`Server is listening on port ${port}`);
// })
app.listen(port, () => console.log(`Server is listening on port ${port}`));

// Authentification to API using JWT
// Commented out for time being.
// const checkJwt = jwt({
//   // Dynamically provide a signing key based on the kid in the header and the singing keys provided by the JWKS endpoint.
//   secret: jwksRsa.expressJwtSecret({
//     cache: true,
//     rateLimit: true,
//     jwksRequestsPerMinute: 5,
//     jwksUri: `https://${config.auth.domain}/.well-known/jwks.json`
//   }),
//   // Validate the audience and the issuer.
//   audience: config.auth.audience,
//   issuer: `https://${config.auth.domain}/`,
//   algorithms: ['RS256']
// });

// const checkScopes = jwtAuthz([ 'read:messages' ]);

// app.get('/api/hello', checkJwt, checkScopes, (req, res) => {
//   res.send({ express: 'Hello From Express' });
// });

//not to cancel dependent thread tasks
// process.on('uncaughtException', err => console.log(err));
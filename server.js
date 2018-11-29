const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

/**
 * Config
 */
const config = require('./config');

const app = express();
const port = config.port;
const axios = require('axios');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());


app.use(morgan(`API Request (port ${port}): :method :url :status :response-time ms - :res[content-length]`));

axios.post('https://home.plutoratest.com/api/authentication/auth/refresh', {
    "Domain": config.domain,
    "RefreshToken": config.refresh_token
  })
  .then(function (response) {
    axios.defaults.headers.common = {
      "authorization": `Bearer ${response.data.access_token}`
    }
  })
  .catch(err => console.error(err));


app.use(require('./routes/defects'));
app.use(require('./routes/settings'));

app.use(express.static(path.join(__dirname, 'client')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname + '/client/index.html'));
// });

// app.get('/status', (req, res) => {
//   axios.post('https://home.plutoratest.com/api/authentication/auth/refresh', {
//     "Domain": config.domain,
//     "RefreshToken": config.refresh_token
//   })
//   .then(function (response) {
//     axios.defaults.headers.common = {
//       "authorization": `Bearer ${response.data.access_token}`
//     }
//     axios.post('https://home.plutoratest.com/api/suggestion/suggest', {"PageNum":4,"RecordsPerPage":10,"Text":"","SuggestionType":"Release","IncludeChildren":false})
//       .then(res => {
//         debugger;
//         res
//       })
//       .catch(err => console.error(err));
//   })
//   .catch(function (error) {
//     console.log(error);
//   });
// });

app.listen(port, () => console.log(`Server is listening on port ${port}`));
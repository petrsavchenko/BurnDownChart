// // Crowling
// const needle = require('needle');
// const cheerio = require('cheerio');
// const winston = require('winston');

// const User = require('../models/user');
// const Crawler = require('../models/crawler');

const axios = require('axios');
const fs = require('fs');

// /**
//  * Config
//  */
// const config = require('../config');

class StatsManager {

    saveStatistics() {
        fs.readFile('db.json', (err, data) => {
            if (err){
                console.log(err);
            }
            const obj = JSON.parse(data);
            const releaseId = obj.releaseId;

            axios.post('https://home.plutoratest.com/api/defects/defects/search', 
            {
                "ReleaseIds" : [releaseId],
                "NoRelease" : false,
                "PageNum" : 0,
                "RecordsPerPage" : 1000,
                "SearchFilters" : [
                ],
                // "SearchFilters" : [
                //     {
                //         "Direction" : null,
                //         "FilterOrder" : 0,
                //         "Operator" : "IsWithin",
                //         "Property" : "EntityFieldValues.Status",
                //         "Value" : "Submitted",
                //         "ComplexValue" : null,
                //         "ColumnType" : "Preset"
                //     }
                // ],
                "DataGridName":"Defect"
            })
            .then(result => {
                const data = result.data.Data;

                const estimatedItems = data.ResultSet
                    .filter(item => /*item.Status && item.Status.Value === "Submitted" && */ 
                        parseInt(item.Fields.find(field => field.Name === "Story Points").Value))
                    .map(item => parseInt(item.Fields.find(field => field.Name === "Story Points").Value));
        
                const estimatedItemsTotal = estimatedItems
                    .reduce((sum, item) => sum + item, 0);
            
                const endStatuses = ["Verified", "Approved for RT"];
            
                const doneItems = data.ResultSet
                    .filter(item => item.Status && endStatuses.includes(item.Status.Value) &&  
                    parseInt(item.Fields.find(field => field.Name === "Story Points").Value))
                    .map(item => parseInt(item.Fields.find(field => field.Name === "Story Points").Value));
            
                const doneItemsTotal = doneItems
                    .reduce((sum, item) => sum + item, 0);    
            
                const workLeft = estimatedItemsTotal - doneItemsTotal;
                
                fs.readFile('db.json', (err, data) => {
                    const today = new Date().toISOString().split('T')[0];
        
                    if (err){
                        if (err.code === 'ENOENT') {
                            var obj = {
                                statistics: {}
                            };
                            obj.statistics[releaseId] = { [today] : workLeft};
                            const jsonString = JSON.stringify(obj);
                            fs.writeFile('db.json', jsonString, () => console.log("statistic was saved"));
                        }
                        console.log(err);
                    } else {
        
                    const obj = JSON.parse(data);
                    const releaseObj = obj.statistics[releaseId];
                    if (releaseObj) {
                        releaseObj[today] = workLeft;
        
                        // TODO: handle error case if today was exist before
                        // const todayObj = releaseObj[today];
                        // if (todayObj) {
                        // } else {
                        // }
        
                    } else{
                        obj.statistics.push({releaseId : {today : workLeft}});
                    }
                    const jsonString = JSON.stringify(obj);
                    fs.writeFile('db.json', jsonString, () => console.log("statistic was saved"));
                }});
            });
        })
    }
}

// class CrawlersManager {

//     constructor() {
//         this.crawlerTimerDictionary = [];
//     }

//     startAll () {
//         var me = this;
//         Crawler.find({ status: { $ne: "Achieved" } })
//             .then(crawlers => {
//                 crawlers.forEach(crawler => me.start(crawler));   
//             })
//             .catch(err => winston.error(`Error on Crawler.find`, err))
//     }

//     start (crawler) {
//         var me = this;
//         var checkInterval = config.pricecheckingInverval;
//         if (this.crawlerTimerDictionary[crawler.id]) {
//             winston.error(`The crawler id: ${crawler.id} has been being processed`);
//             return;
//         }
//         var timerId = setInterval(function() {
//             winston.info(`Started crawling id: ${crawler.id} of ${crawler.url}`);
//             me._checkPrice(crawler);
//         }, checkInterval);

//         this.crawlerTimerDictionary[crawler.id] = timerId;
//     }

//     stop (crawler) {
//         if (!crawler) {
//             winston.error('Crawler obj cannot be null');
//             return;
//         }
//         var timerId = this.crawlerTimerDictionary[crawler.id];
//         if (!timerId){
//             winston.error(`The crawler id: ${crawler.id} is not being processed`);
//             return;
//         }

//         clearInterval(timerId);
//         delete this.crawlerTimerDictionary[crawler.id];
//         winston.info(`Crawling of ${crawler.url} id: ${crawler.id} has been stopped`);
//     }

//     _checkPrice (crawler) {
//         var me = this;
//         if (!crawler) {
//             winston.error('Crawler obj cannot be null');
//             return;
//         }
//         try {
//             needle('get', crawler.url)
//                 .then(res => {
//                     var $ = cheerio.load(res.body);
//                     var priceText = $("#priceblock_ourprice").text();
        
//                     var price = parseFloat(priceText.replace('$',''));
//                     if (isNaN(price)) {
//                         winston.warn("invalid format of price " + priceText);
//                     } else {
//                         winston.info('Price is ' + price);
//                         if(price <= crawler.desiredPrice) {
//                             me._sendEmail(crawler, price);
//                             me._markAsArchieved(crawler._id);
//                             me.stop(crawler);
//                         }
//                     }
//                     winston.info('Finished crawling of ' + crawler.url);
//                 })
//                 .catch(err => winston.error(`Error during get request to ${crawler.url}`, err))
//         } catch (error) {
//             winston.error(`Error during get request to ${crawler.url}`, err);        
//         }        
//     }

//     _sendEmail(crawler, realtimePrice) {
//         var nodemailer = require('nodemailer');

//         var transporter = nodemailer.createTransport({
//             service: 'gmail',
//             auth: {
//               user: 'pricecheckerappheroku@gmail.com',
//               pass: 'pFY6@Rv]Z83gzP^E'
//             }
//         });

//         console.log(`Start sending email to ${crawler.userId}`);

//         User.findById(crawler.userId)
// 			.then(user => {

// 				if (!user) {
//                     winston.error('User was not found');
//                 }
                
//                 var mailOptions = {
//                     from: 'pricecheckerappheroku@gmail.com',
//                     to: user.email,
//                     subject: 'Price notification about ' + crawler.url,
//                     html: `Hey ${user.name.first}</br>
//                         Your desired price was $${crawler.desiredPrice}</br>
//                         Real time price is $${realtimePrice}`
//                 };

//                 console.log(`Ready to send email to ${user.email}`);
        
//                 transporter.sendMail(mailOptions, function(error, info) {
//                     if (error) {
//                         console.log(`Error during sending email ${error}`);
//                         winston.error('Error during sending email', error);
//                     } else {
//                         winston.info(`Email sent: ${ info.response}. CrawlerId: ${crawler.id}. Real time price: ${realtimePrice}`);
//                         console.log(`Email sent: ${ info.response}. CrawlerId: ${crawler.id}. Real time price: ${realtimePrice}`);
//                     }
//                 });


// 			}).catch(err => {
// 				winston.error('Error on User.findById', err);
// 			})
//     }

//     _markAsArchieved(crawlerId) {
//         Crawler.update({ _id: crawlerId }, { status : "Achieved" })
//             .then(crawler => {

//                 if (!crawler) {
//                     winston.error('Crawler was not found');
//                 }

//             })
//             .catch(err => {
//                 winston.error('Error on Crawler.update', err);
//             })

//     }
// }

module.exports = new StatsManager();
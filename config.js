'use strict'

module.exports = {
    name: 'burnDownChart',
    version: '0.0.0.1',
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3001,
    domain: 'home',
    refresh_token: 'hAtQb7vG4yaTiyXgDX/+G9PuVs4ov1AZ4GfNXP06FEa8s1IviHNkU/WB7rxNyQdK0VcG8abg2c4FRQmwePGHVw==',
    db: {
        uri: 'mongodb://localhost:27017/burnDownChart'
        // 'mongodb+srv://pricechecker:gtnh5512+@pricechecker-bsqyh.mongodb.net/pricechecker?retryWrites=true' 
        //   || 'mongodb://localhost:27017/pricechecker',
      },
}

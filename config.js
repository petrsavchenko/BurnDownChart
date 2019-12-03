'use strict'

module.exports = {
    name: 'burnDownChart',
    version: '0.0.0.1',
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3001,
    prodUrl: 'https://plutorachart.herokuapp.com',
    external: {
        domain: 'home',
        getRelasesUrl: 'https://home.plutoratest.org/api/suggestion/suggest',
        getTicketsUrl: 'https://home.plutoratest.org/api/defects/defects/search',
        getAuthUrl: 'https://home.plutoratest.org/api/authentication/auth/refresh',
        refresh_token: 'hAtQb7vG4yaTiyXgDX/+G9PuVs4ov1AZ4GfNXP06FEa8s1IviHNkU/WB7rxNyQdK0VcG8abg2c4FRQmwePGHVw==',
        // due to secutity changes in plutora test
        access_token: 'L/TzYxENX8c5KO3G0b1eO9ciMcF1ki/GRQ360tG/9hyK7CwISlASJa7S+3wY43UTjjekkX5XM/6TlRwS2J+ppIVihLEOage4tFvXGJnKfoURFJQM8CYIsZgddzyoVEa5H/8NN9wyKhkh8jqiR+l/vwOC6FRk9xyhETTdzUfG1WKGuO1hk/XenRclNRVFg24Rc8NHLj7os7JngNxfaHZElKf2ifPpdCFudVAEEf2FMIht03sJKm7+IFZfMG2q8GqcNGl5w+W74X3mAUVAeAyAbMW8hq0qqhulgyMYTMjICuMyuHXy/pPq/bXq5nSIfRg5sVlXmw9nHUGcxFeCASL8Os6g1+OrsveAMrVOrC4hidfTDXX/EDcqsxlma9f62zP4qSSpg3oPS3fLCrmhZxObKn4zYYPm3ltJlFHRVJKfBvWUjYF2wB3PSYVSClLVxzpUbv+xgCg9k0rzD/FH9Mmb9y1GQvrpQL71VkrrPRaI+b5xCIR6TlT6hgsvPM1zr1mTPVFQ6gdtjL/KP0CwDFggL77Ndi3Z0PAc3rteS5BUcN3UwfUvVUIS0//koQT76QK9XGcQVzX43RRhOMXM2eESYV03tgvplLNv/PsSlwIfUQB/e5dE'
    },    
    db: {
        uri: 'mongodb+srv://pricechecker:gtnh5512+@pricechecker-bsqyh.mongodb.net/burnDownChart?retryWrites=true' 
          || 'mongodb://localhost:27017/burnDownChart',
    },
}

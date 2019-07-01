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
        access_token: '1E8zezg/x0LfmhOMEwBOBNV6DTJElBYCpIDHjL0cNVHmLBw6ExAqLfEt8IA1t3cPd0eiDExsXezHC8LWlvd+z/8yod6J8Wx2USTHsy7Wa7fEA7htKTCmibbtkBKBZY7UXFFIn5lBgL5snFKCAFqhnJEnovZDnu2A27m31FidmJmohxkrNE514sElz0X51ktlz+W1NzBBvV/nlHPffRHxrAAYOoLGzIvr3nDbaspmbUd1fm/uIPvvPogeEpFTqZ1VHrradw9zvsJTShXPyCrjo33sa3mlehxmINblV4zJvtSW9finI6rJf2nRHVUW7K5KgLJlNBKtFqSC/V4WYAJl9wlwlMk5yfDW/ZS5tZbkDTQ3dKebE05llpJ0rL6p/zZjAS2YEn5WexaDwYxjbe1TrSEo4WMcvzS+IiXLbuX426wqtdGyLW9vG2NOK4EV5iSzeHxxPVuyYIMW6iiluH4+WK7P7gYZJBVlS+7PowT83RcrQGt1vRSRMnz3xdyU2I5/HTbbpbYEfzn689brByUMixGjGmkDFcgMAAazFb16xhPciHkYyG0WbsQc70BDLFzh5BVND5C6VGUkFxlTwuTEbMpfo5hFRSJNpZGcDzyZqBwSUAvQ'
    },    
    db: {
        uri: 'mongodb+srv://pricechecker:gtnh5512+@pricechecker-bsqyh.mongodb.net/burnDownChart?retryWrites=true' 
          || 'mongodb://localhost:27017/burnDownChart',
    },
}

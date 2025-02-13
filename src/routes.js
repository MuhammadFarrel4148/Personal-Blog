const { registerAccount } = require("./handler");

const routes = [
    {
        method: 'POST',
        path: '/register',
        handler: registerAccount,
    },
    {
        method: 'POST',
        path: '/login',
        handler: () => {},
    },
    {
        method: 'POST',
        path: '/forgotpassword',
        handler: () => {},
    },
    {
        method: 'POST',
        path: '/inputotp',
        handler: () => {},
    },
    {
        method: 'POST',
        path: '/logout',
        handler: () => {},
    },
    {
        method: 'GET',
        path: '/home/{username}',
        handler: () => {},
    },
    {
        method: 'GET',
        path: '/article/{id}',
        handler: () => {},
    },
    {
        method: 'GET',
        path: '/admin',
        handler: () => {},
    },
    {
        method: 'POST',
        path: '/add',
        handler: () => {},
    },
    {
        method: 'POST',
        path: '/edit/{id}',
        handler: () => {},
    },
    {
        method: 'GET',
        path: '/delete/{id}',
        handler: () => {},
    },
];

module.exports = routes

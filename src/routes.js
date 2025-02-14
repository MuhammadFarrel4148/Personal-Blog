const { registerAccount, loginAccount, forgotPassword, inputotp, logoutAccount, AutomaticCodeOTP } = require("./handler");

const routes = [
    {
        method: 'POST',
        path: '/register',
        handler: registerAccount,
    },
    {
        method: 'POST',
        path: '/login',
        handler: loginAccount,
    },
    {
        method: 'POST',
        path: '/forgotpassword',
        handler: forgotPassword,
    },
    {
        method: 'POST',
        path: '/automatic',
        handler: AutomaticCodeOTP,
    },
    {
        method: 'POST',
        path: '/inputotp',
        handler: inputotp,
    },
    {
        method: 'POST',
        path: '/logout',
        handler: logoutAccount,
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

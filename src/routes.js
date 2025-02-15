const { registerAccount, loginAccount, forgotPassword, inputotp, logoutAccount, AutomaticCodeOTP, addArticle, AccessValidation, editArticle, deleteArticle, homeUser, getArticle, adminArticle } = require("./handler");

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
        handler: homeUser,
        options: {
            pre: [{ method: AccessValidation }]
        }
    },
    {
        method: 'GET',
        path: '/article/{id}',
        handler: getArticle,
        options: {
            pre: [{ method: AccessValidation }]
        }
    },
    {
        method: 'GET',
        path: '/admin',
        handler: adminArticle,
        options: {
            pre: [{ method: AccessValidation }]
        }
    },
    {
        method: 'POST',
        path: '/add',
        handler: addArticle,
        options: {
            pre: [{ method: AccessValidation }]
        },
    },
    {
        method: 'PUT',
        path: '/edit/{id}',
        handler: editArticle,
        options: {
            pre: [{ method: AccessValidation }]
        }
    },
    {
        method: 'DELETE',
        path: '/delete/{id}',
        handler: deleteArticle,
        options: {
            pre: [{ method: AccessValidation }]
        }
    },
];

module.exports = routes;

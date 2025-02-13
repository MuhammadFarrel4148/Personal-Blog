require('dotenv').config();

const jwt = require('jsonwebtoken');
const db = require('./database');
const { nanoid } = require('nanoid');   
const nodemailer = require('nodemailer');

const GenerateToken = (user) => {
    const token = jwt.sign({ id: user[0].id, email: user[0].email}, process.env.JWT_SECRET, { expiresIn: '1h' });
    return token;
};

const AccessValidation = async(request, h) => {
    const authorization = request.headers.authorization;

    if(!authorization) {
        const response = h.response({
            status: 'fail',
            message: 'unauthorized',
        });
        response.code(400);
        return response.takeover();
    };

    const token = authorization.split(' ')[1];
    const [isBlacklist] = await db.query(`SELECT * FROM blacklisttoken WHERE token = ?`, [token]);

    if(isBlacklist.length > 0) {
        const response = h.response({
            status: 'fail',
            message: 'unauthorized',
        });
        response.code(400);
        return response.takeover();
    };

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        request.auth = { credentials: decoded };
        return h.continue;

    } catch(error) {
        const response = h.response({
            status: 'fail',
            message: 'Invalid access validation',
        });
        response.code(400);
        return response.takeover();
    };
};

const registerAccount = async(request, h) => {
    const { username, email, password } = request.payload;

    try {
        if(!username || !email || !password) {
            const response = h.response({
                status: 'fail',
                message: 'silahkan inputkan data yang valid',
            });
            response.code(400);
            return response;
        };
    
        const id = nanoid(16);
    
        const [result] = await db.query(`INSERT INTO users(id, username, email, password) VALUES(?, ?, ?, ?)`, [id, username, email, password]);
    
        if(result.affectedRows === 1) {
            const response = h.response({
                status: 'success',
                message: 'akun berhasil dibuat',
                data: {
                    id, username, email
                }
            });
            response.code(201);
            return response;
        };
    
        const response = h.response({
            status: 'fail',
            message: 'akun gagal dibuat',
        });
        response.code(400);
        return response;

    } catch(error) {
        console.log(error);
        const response = h.response({
            status: 'fail',
            message: 'Invalid register account',
        });
        response.code(400);
        return response;
    };
};

const loginAccount = async(request, h) => {
    const { email, password } = request.payload;

    try{
        if(!email || !password) {
            const response = h.response({
                status: 'fail',
                message: 'silahkan inputkan data yang valid',
            });
            response.code(400);
            return response;
        };
    
        const [account] = await db.query(`SELECT * FROM users WHERE email = ? AND password = ?`, [email, password]);
    
        if(account.length > 0) {
            GenerateToken(account);
    
            const response = h.response({
                status: 'success',
                message: 'berhasil login ke akun',
                token: token,
            });
            response.code(200);
            return response;
        };
    
        const response = h.response({
            status: 'fail',
            message: 'gagal login ke akun',
        });
        response.code(400);
        return response;

    } catch(error) {
        const response = h.response({
            status: 'fail',
            message: 'Invalid login account',
        });
        response.code(400);
        return response;
    };
};

const forgotPassword = async(request, h) => {
    const { email } = request.payload;

    try {
        const [existEmail] = await db.query(`SELECT * FROM users WHERE email = ?`, [email]);

        if(existEmail.length > 0) {
            const code = nanoid(5);
            await db.query(`INSERT INTO codeotp(email, code) VALUES(?, ?)`, [email, code]);

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                }
            });

            await transporter.sendMail({
                from: 'Personal Blog',
                to: email,
                subject: 'OTP Verification',
                text: `This is your code otp ${code}, dont share with anyone`,
            });

            const response = h.response({
                status: 'success',
                message: 'code otp berhasil dikirimkan, silahkan cek di email anda',
            });
            response.code(200);
            return response;
        };

        const response = h.response({
            status: 'fail',
            message: 'gagal mengirimkan code otp',
        });
        response.code(400);
        return response;

    } catch(error) {
        const response = h.response({
            status: 'fail',
            message: 'Invalid forgot password',
        });
        response.code(400);
        return response;
    };
};

const inputotp = async(request, h) => {
    const { codeOTP, newPassword } = request.payload;

    try {
        if(!codeOTP || !newPassword) {
            const response = h.response({
                status: 'fail',
                message: 'massukkan input yang valid',
            });
            response.code(400);
            return response;
        };
    
        const [existResult] = await db.query(`SELECT * FROM codeotp WHERE code = ?`, [codeOTP]);

        if(existResult.length > 0) {
            const [existAccount] = await db.query(`SELECT * FROM users WHERE email = ?`, [existResult[0].email]);
            const [updatedPassword] = await db.query(`UPDATE users SET password = ? WHERE email = ?`, [newPassword, existAccount[0].email]);

            if(updatedPassword.affectedRows === 1) {
                const response = h.response({
                    status: 'success',
                    message: 'password berhasil diubah',
                });
                response.code(400);
                return response;
            };
        };

        const response = h.response({
            status: 'fail',
            message: 'code otp tidak ditemukan',
        });
        response.code(404);
        return response;

    } catch(error) {
        const response = h.response({
            status: 'fail',
            message: 'Invalid input OTP',
        });
        response.code(400);
        return response;
    };
};

const logoutAccount = async(request, h) => {
    const authorization = request.headers.authorization;

    try {
        if(!authorization) {
            const response = h.response({
                status: 'fail',
                message: 'unauthorized',
            });
            response.code(400);
            return response;
        };
    
        const token = authorization.split(' ')[1];
        const [isBlacklist] = await db.query(`SELECT * FROM blacklisttoken WHERE token = ?`, [token]);
    
        if(isBlacklist.length > 0) {
            const response = h.response({
                status: 'fail',
                message: 'unauthorized',
            });
            response.code(400);
            return response;
        };

        jwt.verify(token, process.env.JWT_SECRET);
        await db.query(`INSERT INTO blacklisttoken WHERE token = ?`, [token]);

        const response = h.response({
            status: 'success',
            message: 'berhasil logout'
        });
        response.code(200);
        return response;

    } catch(error) {
        const response = h.response({
            status: 'fail',
            message: 'Invalid access validation',
        });
        response.code(400);
        return response;
    };
}

module.exports = { registerAccount, loginAccount, forgotPassword, inputotp, logoutAccount };

//table codeotp = email, code
//blacklisttoken = token

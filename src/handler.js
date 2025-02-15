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

const AutomaticCodeOTP = async(request, h) => {
    const { email } = request.payload;

    try {
        const [result] = await db.query(`SELECT * FROM codeotp WHERE email = ?`, [email]);

        if(result.length > 0) {
            const response = h.response({
                status: 'success',
                code: result[0].code,
            });
            response.code(200);
            return response;
        };

        const response = h.response({
            status: 'fail',
            message: 'email tidak ditemukan',
        });
        response.code(404);
        return response;

    } catch(error) {
        const response = h.response({
            status: 'fail',
            message: 'Invalid automatic code OTP',
        });
        response.code(400);
        return response;
    }
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
            const token = GenerateToken(account);
    
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
            await db.query(`DELETE FROM codeotp WHERE code = ?`, [codeOTP]);

            if(updatedPassword.affectedRows === 1) {
                const response = h.response({
                    status: 'success',
                    message: 'password berhasil diubah',
                });
                response.code(200);
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
        await db.query(`INSERT INTO blacklisttoken(token) VALUES(?)`, [token]);

        const response = h.response({
            status: 'success',
            message: 'berhasil logout'
        });
        response.code(200);
        return response;

    } catch(error) {
        console.log(error);
        const response = h.response({
            status: 'fail',
            message: 'Invalid logout account',
        });
        response.code(400);
        return response;
    };
};

const homeUser = async(request, h) => {
    const { username } = request.params;

    try {
        const [user] = await db.query(`SELECT * FROM users WHERE username = ?`, [username]);

        if(!user) {
            const response = h.response({
                status: 'fail',
                message: 'user tidak ditemukan',
            });
            response.code(404);
            return response;
        };

        const [articles] = await db.query(`SELECT * FROM article WHERE userId = ?`, [user[0].id]);

        const response = h.response({
            status: 'success',
            data: {
                result: articles.map(({ title, publishingdate }) => ({ title, publishingdate })),
            }
        });
        response.code(200);
        return response;

    } catch(error) {
        const response = h.respones({
            status: 'fail',
            message: 'Invalid get all article user'
        });
        response.code(400);
        return response;
    };
};

const addArticle = async(request, h) => {
    const { title, datepublishing, content } = request.payload;

    try{
        if(!title || !datepublishing || !content) {
            const response = h.response({
                status: 'fail',
                message: 'masukkan data yang valid',
            });
            response.code(400);
            return response;
        };
    
        const userId = request.auth.credentials.id;
        const id = nanoid(16)
    
        const [result] = await db.query(`INSERT INTO article(id, userId, title, content, publishingdate) VALUES(?, ?, ?, ?, ?)`, [id, userId, title, content, datepublishing]);
    
        if(result.affectedRows === 1) {
            const response = h.response({
                status: 'success',
                message: 'artikel berhasil ditambahkan',
                data: {
                    id, title, content, datepublishing
                }
            });
            response.code(201);
            return response;
        };
    
        const response = h.response({
            status: 'fail',
            message: 'artikel gagal dibuat, coba lagi',
        });
        response.code(400);
        return response;

    } catch(error) {
        console.log(error)
        const response = h.response({
            status: 'fail',
            message: 'Invalid add article'
        })
        response.code(400);
        return response;
    };
};

const getArticle = async(request, h) => {
    const { id } = request.params;

    try {
        const [article] = await db.query(`SELECT * FROM article WHERE id = ?`, [id]);

        if(!article) {
            const response = h.response({
                status: 'fail',
                message: 'artikel tidak ditemukan, coba lagi',
            });
            response.code(404);
            return response;
        };

        const response = h.response({
            status: 'success',
            data: {
                result: article.map(({ title, publishingdate, content }) => ({ title, publishingdate, content }))
            }
        });
        response.code(200);
        return response;

    } catch(error) {
        const response = h.response({
            status: 'fail',
            message: 'Invalid get article',
        });
        response.code(400);
        return response;
    };
};

const adminArticle = async(request, h) => {
    const userId = request.auth.credentials.id;

    try {
        const [articles] = await db.query(`SELECT * FROM article WHERE userId = ?`, [userId]);

        const response = h.response({
            status: 'success',
            data: {
                result: articles.map(({ title }) => ({ title }))
            }
        });
        response.code(200);
        return response;

    } catch(error) {
        const response = h.response({
            status: 'fail',
            message: 'Invalid admin article',
        });
        response.code(400);
        return response;
    };
};

const editArticle = async(request, h) => {
    const userId = request.auth.credentials.id;
    const { id } = request.params;
    const [existArticle] = await db.query(`SELECT * FROM article WHERE id = ? AND userId = ?`, [id, userId]);

    const { titleUpdate = existArticle[0].title, datepublishingUpdate = existArticle[0].publishingdate, contentUpdate = existArticle[0].content } = request.payload || {};

    try {
        const [updateArticle] = await db.query(`UPDATE article SET title = ?, publishingdate = ?, content = ? WHERE id = ?`, [titleUpdate, datepublishingUpdate, contentUpdate, id]);

        if(updateArticle.affectedRows === 1) {
            const response = h.response({
                status: 'success',
                message: 'artikel berhasil diupdate',
            });
            response.code(200);
            return response;
        };

        const response = h.response({
            status: 'fail',
            message: 'artikel gagal diupdate, coba lagi',
        });
        response.code(400);
        return response;

    } catch(error) {
        const response = h.response({
            status: 'fail',
            message: 'Invalid edit article',
        });
        response.code(400);
        return response;
    };
};

const deleteArticle = async(request, h) => {
    const userId = request.auth.credentials.id;
    const { id } = request.params;

    try {
        const [article] = await db.query(`DELETE FROM article WHERE userId = ? AND id = ?`, [userId, id]);

        if(article.affectedRows === 1) {
            const response = h.response({
                status: 'success',
                message: 'article berhasil dihapus',
            });
            response.code(200);
            return response;
        };

        const response = h.response({
            status: 'fail',
            message: 'article tidak ditemukan, coba lagi',
        });
        response.code(400);
        return response;

    } catch(error) {
        const response = h.response({
            status: 'fail',
            message: 'Invalid delete',
        });
        response.code(400);
        return response;
    };
};

module.exports = { AccessValidation, registerAccount, loginAccount, forgotPassword, AutomaticCodeOTP, inputotp, logoutAccount, homeUser, addArticle, getArticle, adminArticle, editArticle, deleteArticle };

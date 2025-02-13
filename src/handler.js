const jwt = require('jsonwebtoken');
const db = require('./database');
const { nanoid } = require('nanoid');   

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
}

module.exports = { registerAccount };

# Personal Blog
API untuk menulis dan mempublikasikan artikel. Artikel dapat diakses oleh siapapun, namun penambahan dan update artikel hanya dapat dilakukan oleh admin.

## Fitur Utama
### Guest Section
- Home Page: Page ini digunakan untuk menampilkan artikel yang telah dipublish.
- Article Page: Page ini menampilkan konten dari artikel beserta publikasinya.

### Admin Section
- Dashboard: Page ini menampilkan list dari artikel yang telah dipublish serta terdapat opsi menambah artikel, edit artikel, dan delete artikel.
- Add Article Page: Page ini akan menampilkan form untuk menambah artikel baru. Form memiliki judul, konten, dan date publishing.
- Edit Article Page: Page ini akan menampilkan form untuk mengedit artikel yang ada. Form memiliki judul, konten, dan date publishing.

## Gambaran
### Guest Section
![Guest-Section-Page][guest-section.png]
### Admin Section
![Admin Section Page][admin-section.png]

## Teknologi yang Digunakan
- **Node.js**: Runtime javascript
- **MySQL**: Database relasional
- **JWT**: Autentikasi
- **Postman**: Testing dan dokumentasi
- **Dotenv**: Mengelola environment variables
- **Nodemailer**: Mengirim pengingat melalui email
- **Docker** (opsional): containerization 
- **GitHub**: Version control dan menyimpan proyek
 
## Struktur Database
### Users Table
```json
{
    "id": "string PRIMARY KEY",
    "username": "string",
    "email": "string",
    "password": "string"
}
```

### Codeotp Table
```json
{
    "email": "string PRIMARY KEY",
    "code": "string"
}
```

### Blacklist Token Table
```json
{
    "token": "string PRIMARY KEY"
}
```

### Article Table
```json
{
    "id": "string PRIMARY KEY",
    "userId": "string FOREIGN KEY to Users(id)",
    "title": "string",
    "content": "string",
    "publishing-date": "DATETIME",
}
```

## Instalasi (Coming Soon)
1. 

## Endpoint (API Routes)

| HTTP Method | Endpoint             | Deskripsi                                 |
|-------------|----------------------|-------------------------------------------|
| POST        | /register            | Membuat akun                              |
| POST        | /login               | Melakukan login pada akun                 |
| POST        | /forgotpassword      | Melakukan pengiriman otp untuk reset password          |
| POST        | /automatic           | Melakukan pengiriman otp otomatis untuk pengujian      |
| POST        | /inputotp            | Melakukan verifikasi otp untuk reset password          |
| POST        | /logout              | Melakukan logout pada akun                |
| GET         | /home/{username}     | Mengambil daftar artikel orang lain       |
| GET         | /article/{id}        | Mengambil konten artikel beserta date publishing       |
| GET         | /admin               | Mengambil artikel milik diri sendiri      |
| POST        | /add                 | Menambahkan artikel                       |
| POST        | /edit/{id}           | Mengubah artikel berdasarkan id           |
| GET         | /delete/{id}         | Menghapus artikel berdasarkan id          |

## Penulis
- **Muhammad Farrel Putra Pambudi** 
    - ([GitHub](https://github.com/MuhammadFarrel4148))
    - ([LinkedIn](https://www.linkedin.com/in/farrelputrapambudi/))


[guest-section.png]: guest-section.png
[admin-section.png]: admin-section.png
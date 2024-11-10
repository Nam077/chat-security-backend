const fs = require('fs');
const crypto = require('crypto');

// Tạo cặp khóa RSA
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048, // Chiều dài của khóa RSA
    publicKeyEncoding: {
        type: 'spki', // Xử lý public key với chuẩn spki (SubjectPublicKeyInfo)
        format: 'pem', // Định dạng PEM
    },
    privateKeyEncoding: {
        type: 'pkcs8', // Xử lý private key với chuẩn pkcs8
        format: 'pem', // Định dạng PEM
        cipher: 'aes-256-cbc', // Mã hóa private key bằng AES-256-CBC
        passphrase: 'your-secure-passphrase', // Thêm passphrase bảo vệ private key (bạn có thể thay đổi passphrase)
    },
});

// Lưu private key vào file
fs.writeFileSync('private_key.pem', privateKey);

// Lưu public key vào file
fs.writeFileSync('public_key.pem', publicKey);

console.log('Cặp khóa RSA đã được tạo và lưu vào private_key.pem và public_key.pem');

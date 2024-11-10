import * as crypto from 'crypto';

/**
 * Hàm tạo khóa ngẫu nhiên 32 byte (256 bit).
 * Trả về một chuỗi hexadecimal.
 */
export const generateRandomKey = (length: number = 16): string => {
    return crypto.randomBytes(length).toString('hex'); // Độ dài tùy ý, mặc định là 16 byte
};
/**
 * Hàm chuẩn hóa khóa AES từ chuỗi bất kỳ, trả về Buffer có độ dài cố định 32 byte (256 bit).
 * Nếu không có chuỗi đầu vào, mặc định dùng 'default_random_key'.
 */
export const createFixedLengthKey = (input: string = 'default_random_key'): Buffer => {
    return crypto.createHash('sha256').update(input).digest(); // Trả về Buffer 32 byte
};

/**
 * Hàm mã hóa dữ liệu bằng AES-256-CBC.
 * Trả về chuỗi mã hóa kết hợp IV và ciphertext.
 */
export const encrypt = (data: string, keyInput: string = 'default_random_key'): string => {
    const key = createFixedLengthKey(keyInput); // Tạo khóa AES từ chuỗi đầu vào
    const iv = crypto.randomBytes(16); // Tạo IV ngẫu nhiên 16 byte
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Kết hợp IV và ciphertext để lưu trữ hoặc truyền
    return iv.toString('hex') + ':' + encrypted;
};

/**
 * Hàm giải mã dữ liệu đã mã hóa bằng AES-256-CBC.
 * Tách IV và ciphertext trước khi giải mã.
 */
export const decrypt = (encryptedData: string, keyInput: string = 'default_random_key'): string => {
    const [ivHex, encryptedText] = encryptedData.split(':');

    if (!ivHex || ivHex.length !== 32) {
        throw new Error('Invalid initialization vector length');
    }

    const iv = Buffer.from(ivHex, 'hex');
    const key = createFixedLengthKey(keyInput); // Tạo khóa AES từ chuỗi đầu vào
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
};

export const encryptWithRSA = (data: string, publicKey: string): string => {
    const buffer = Buffer.from(data, 'utf8');
    const encrypted = crypto.publicEncrypt(
        {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256',
        },
        buffer,
    );
    return encrypted.toString('base64');
};

/**
 * Hàm giải mã dữ liệu mã hóa bằng RSA với khóa riêng (private key).
 * Trả về dữ liệu gốc ở dạng chuỗi.
 */
export const decryptWithRSA = (encryptedData: string, privateKey: string): string => {
    const buffer = Buffer.from(encryptedData, 'base64');
    const decrypted = crypto.privateDecrypt(
        {
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256',
        },
        buffer,
    );
    return decrypted.toString('utf8');
};

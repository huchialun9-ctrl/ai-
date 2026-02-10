import CryptoJS from "crypto-js";

const SECRET_KEY = "nova-agent-local-key"; // In production, this would be derived from a user password

export const encryptData = (data: any) => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

export const decryptData = (ciphertext: string) => {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

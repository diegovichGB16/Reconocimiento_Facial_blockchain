import notp from "notp"

export function Seed() {
    function generateRandomBytes(length) {
        const randomBytes = new Uint8Array(length);
        crypto.getRandomValues(randomBytes);
        return randomBytes;
    }

    function generateBase32Secret(length) {
        const randomBytes = generateRandomBytes(length);
        const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let base32Secret = '';

        for (let i = 0; i < randomBytes.length; i++) {
            const byte = randomBytes[i];
            const index1 = byte >> 3;
            const index2 = (byte & 7) << 2;
            base32Secret += base32Chars[index1];
            base32Secret += base32Chars[index2];
        }

        return base32Secret;
    }
    const seedOTP = generateBase32Secret(16); // 16 bytes = 128 bits
    console.log('Seed OTP: ' + seedOTP);
    return seedOTP;
}

export function SeedOtp(seed) {
    const totp = notp.totp.gen({
        secret: seed,
        time: 30, // Intervalo de tiempo (30 segundos por defecto)
    });

    return totp.token;
}
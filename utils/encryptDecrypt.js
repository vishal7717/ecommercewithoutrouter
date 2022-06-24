const crypto = require("crypto");
let charCode = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    '@', '.', '_'];

module.exports = {
    encrypt:function(email) {
        let length = email.length;
        let encryptedText = ""
        for (let i = 0; i < length; i++) {
            let charCurr = email[i];
            let encryptedIndex = charCode.indexOf(charCurr);
            encryptedIndex += length;
            encryptedIndex %= 65;
            encryptedText += charCode[encryptedIndex]
        }
        return encryptedText;
    },



    decrypt:function(encryptedText) {
        let length = encryptedText.length;
        let email = "";
        for (let i = 0; i < length; i++) {
            let charCurr = encryptedText[i];
            let encryptedIndex = charCode.indexOf(charCurr);
            encryptedIndex -= length;
            encryptedIndex %= 65;
            if (encryptedIndex < 0) {
                encryptedIndex += 65;
            }
            email += charCode[encryptedIndex];
        }
        return email;
    },

    sha256:function(password){
        let hashedBuffer = crypto.createHash("sha256").update(password).digest();
        return hashedBuffer.toString("hex")
    }

}

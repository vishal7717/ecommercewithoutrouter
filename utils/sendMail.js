const mailjet = require('node-mailjet')

const transporter = mailjet.connect('eda548319568fa4ec2caefd1b758c9c0', '267c0d8a0c23c08b73004bcdb47d8cfa')

module.exports = function sendMail(email, title,html,callback) {
    
    const request = transporter
        .post("send")
        .request({
            FromEmail:'vishalpankaj9661@gmail.com',    
            FromName:'VP Store',    
            Subject: title,
            "Html-Part": html,
            Recipients: [{ Email: email }]
        })
    request
        .then((result) => {
            callback()
        })
        .catch((err) => {
            callback(err)
        })
}
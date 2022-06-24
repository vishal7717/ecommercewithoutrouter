const mailjet = require('node-mailjet')

const transporter = mailjet.connect('mailid', 'secret id')

module.exports = function sendMail(email, title,html,callback) {
    
    const request = transporter
        .post("send")
        .request({
            FromEmail:'your mail',    
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

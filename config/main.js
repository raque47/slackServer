require('dotenv').config();

module.exports = {
    // Secret key for JWT signing and encryption
    'secret': 'super secret passphrase',
    // Database connection information
    'database': 'mongodb://localhost:27017/Slack',
    //'database': 'mongodb://raque47:Tommy-457@ds137882.mlab.com:37882/slack_clone',
    // Setting port for server
    'port': process.env.PORT || 3000

}
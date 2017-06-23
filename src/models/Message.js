const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    content:{
        type: String,
    },
    idTransmitter:{
        type: String,
    },
    idReceiver:{
        type: String,
    },
    hour:{
        type: String,
    }
});

module.exports = mongoose.model('Message', messageSchema);
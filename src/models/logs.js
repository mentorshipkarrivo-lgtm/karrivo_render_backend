
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const logsSchema = new Schema({
    path: {
        type: String,
        required: true
    },
    err_message: {
        type: String,
    },
    err: {
        type: String,
        required: true
    },
    err_date: {
        type: Date,
        required: true
    },

});

const logs = model("logs", logsSchema);

export default logs;
import mongoose from "mongoose";

const { Schema, model } = mongoose;


const excelDataSchema = new Schema({
    name: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true, index: true },
    amount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

const ExcelData = model("ExcelData", excelDataSchema);

export default ExcelData;
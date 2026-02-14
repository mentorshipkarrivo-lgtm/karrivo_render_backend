import express from "express";
import multer from "multer";
import ExcelController from "../../controllers/dataExtraction/dataExtractionController.js";

const router = express.Router();

// Multer memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    fileFilter: (req, file, cb) => {
        const allowed = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel",
        ];
        cb(allowed.includes(file.mimetype) ? null : new Error("Only Excel files are allowed"));
    },
});

// Use the static method directly
router.post("/upload-excel", upload.single("file"), ExcelController.uploadExcel);

export default router;

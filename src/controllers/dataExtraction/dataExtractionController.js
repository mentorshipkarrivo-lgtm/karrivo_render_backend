// import express from "express";
// import multer from "multer";
// import XLSX from "xlsx";

// import ExcelData from "../models/ExcelData.js"; // note: add .js extension for ESM




// class AiMentorsController {



//     /* MEMORY STORAGE */
//     const upload = multer({
//         storage: multer.memoryStorage(),

//         limits: {
//             fileSize: 10 * 1024 * 1024 // 10MB limit
//         },

//         fileFilter: (req, file, cb) => {
//             const allowedTypes = [
//                 "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//                 "application/vnd.ms-excel"
//             ];

//             if (allowedTypes.includes(file.mimetype)) {
//                 cb(null, true);
//             } else {
//                 cb(new Error("Only Excel files allowed"));
//             }
//         }
//     });





// /* MAIN API */
// // router.post("/upload-excel", upload.single("file"), async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Excel file is required"
//             });
//         }

//         /* Convert Excel Buffer → JSON */
//         const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
//         const sheetName = workbook.SheetNames[0];

//         const rows = XLSX.utils.sheet_to_json(
//             workbook.Sheets[sheetName],
//             { defval: "" }
//         );

//         if (!rows.length) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Excel is empty"
//             });
//         }

//         /* Clean + Format Data */
//         const cleanedData = rows.map((row) => ({
//             name: row.name || row.Name || "",
//             email: (row.email || row.Email || "").toLowerCase(),
//             amount: Number(row.amount || row.Amount || 0),
//             createdAt: new Date()
//         }));

//         /* Remove Invalid Rows */
//         const validData = cleanedData.filter(
//             (r) => r.email && !isNaN(r.amount)
//         );

//         /* Remove Duplicates (by email) */
//         const emails = validData.map(r => r.email);

//         const existing = await ExcelData.find({
//             email: { $in: emails }
//         }).select("email");

//         const existingEmails = new Set(existing.map(e => e.email));

//         const finalData = validData.filter(
//             r => !existingEmails.has(r.email)
//         );

//         /* Bulk Insert */
//         await ExcelData.insertMany(finalData);

//         return res.json({
//             success: true,
//             totalRowsInExcel: rows.length,
//             inserted: finalData.length,
//             duplicatesSkipped: validData.length - finalData.length
//         });

//     } catch (error) {
//         console.error("Upload Error:", error);

//         return res.status(500).json({
//             success: false,
//             message: "Server error while processing Excel"
//         });
//     }
// };



import XLSX from "xlsx";
import ExcelData from "../../models/documentdata.js";

class ExcelController {
  /**
   * Upload Excel and save data to MongoDB
   * @param {object} req - Express request
   * @param {object} res - Express response
   */
  static async uploadExcel(req, res) {
    try {
      // 1️⃣ Check if file exists
      if (!req.file) {
        return res.status(400).json({ success: false, message: "Excel file is required" });
      }

      // 2️⃣ Convert Excel buffer → JSON
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });

      if (!rows.length) {
        return res.status(400).json({ success: false, message: "Excel is empty" });
      }

      // 3️⃣ Clean + format data
      const cleanedData = rows.map((row) => ({
        name: row.name || row.Name || "",
        email: (row.email || row.Email || "").toLowerCase(),
        amount: Number(row.amount || row.Amount || 0),
        createdAt: new Date(),
      }));

      // 4️⃣ Remove invalid rows
      const validData = cleanedData.filter((r) => r.email && !isNaN(r.amount));
      const emails = validData.map((r) => r.email);

      // 5️⃣ Remove duplicates already in DB
      const existing = await ExcelData.find({ email: { $in: emails } }).select("email");
      const existingEmails = new Set(existing.map((e) => e.email));
      const finalData = validData.filter((r) => !existingEmails.has(r.email));

      // 6️⃣ Bulk insert
      await ExcelData.insertMany(finalData);

      // 7️⃣ Return response
      return res.json({
        success: true,
        totalRowsInExcel: rows.length,
        inserted: finalData.length,
        duplicatesSkipped: validData.length - finalData.length,
      });
    } catch (error) {
      console.error("Upload Error:", error);
      return res.status(500).json({ success: false, message: "Server error while processing Excel" });
    }
  }
}

export default ExcelController; // ✅ Export class itself, do NOT call it

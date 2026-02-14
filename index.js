// // import { onRequest } from "firebase-functions/v2/https";
// // import express from "express";
// // import admin from "firebase-admin";
// // import dotenv from "dotenv";
// // import cors from "cors";
// // import AuthRouter from "./src/routes/authRouter.js";
// // import MenteeApplicationRouter from "./src/routes/mentorApplicationRoutes.js";
// // import EngineeringMentorsRouter from "./src/routes/engineeringMentorRoutes.js";
// // import startUpMentorsRouter from "./src/routes/startUpmentorsRoutes.js";
// // import ProductMentorsRouter from "./src/routes/productMentorsRoutes.js";
// // import MarketingMentorsRouter from "./src/routes/marketingMentorsRoutes.js";
// // import MentorsessionRouter from "./src/routes/sessionRoutes.js";
// // import LeaderShipMentorsRouter from "./src/routes/leadershipmentorsRoutes.js";
// // import AiMentorsRouter from "./src/routes/AimentorsRoutes.js";
// // import GoogleSigninRouter from "./src/routes/googlesignRouter.js";
// // import MenteeTrailbookingsRouter from "./src/routes/trialBookingRoutes.js";
// // import MenteeProfileSaveRouter from "./src/routes/ProfileRoutes.js";
// // import menteePaymentRouter from "./src/routes/paymentRoutes.js";
// // import zoomMeetingRoutes from "./src/routes/zoomMeetingRoutes.js";
// // import TicketsRouter from "./src/routes/ticketsRoutes.js";
// // import ContactRouter from "./src/routes/contactRoutes.js";
// // import MentorDashboardRouter from "./src/routes/mentorRoutes/mentorRoutes.js";
// // import MentorSupportRouter from "./src/routes/mentorRoutes/mentorSupportRoutes.js";
// // import AdminMentorSupportRouter from "./src/routes/mentorRoutes/adminMentorSupportRoutes.js";
// // import UsersRouter from "./src/routes/mentorRoutes/userRoutes.js";
// // import SessionsBookingsRouter from "./src/routes/mentorRoutes/sessionBookingRoutes.js";
// // import AllMentessRouter from "./src/routes/allmentessRouter.js";


// // import { connectToDatabase } from "./src/config/config.js";

// // dotenv.config();

// // const app = express();

// // // -------------------- Initialize Firebase Admin --------------------
// // admin.initializeApp();

// // // -------------------- Connect Database (Cold Start) --------------------
// // connectToDatabase();



// // // -------------------- Middleware --------------------

// // // Body parser
// // app.use(express.json());


// // // -------------------- CORS Configuration (FIXED) --------------------


// // // List of allowed origins
// // const allowedOrigins = [
// //   "https://karrivo.in",
// //   "https://www.karrivo.in",
// //   "http://localhost:5173",
// //   "http://localhost:5174", // Added this for your second localhost port
// //   "https://karrivoadmin.web.app",
// //   "https://karrivoadmin.firebaseapp.com"
// //   // "https://www.admin.jaimax.com",
// //   // "http://devadmin.jaimax.com","http://dev.jaimax.com",
// //   // "http://localhost:5173",
// // ];
// // const corsOptions = {
// //   origin: (origin, callback) => {
// //     if (process.env.NODE_ENV !== "production") {
// //       // Allow all origins in development and qa
// //       callback(null, true);
// //     } else {
// //       // Restrict origins in production
// //       if (!origin || allowedOrigins.includes(origin)) {
// //         // Allow requests with no origin (like mobile apps) or matching origins
// //         callback(null, true);
// //       } else {
// //         logger.error("Blocked CORS request from:", origin); // Log the origin
// //         callback(new Error("Not allowed by CORS"));
// //       }
// //     }
// //   },
// //   methods: "*",
// //   allowedHeaders: "*",
// //   credentials: true, // Allow cookies or authentication headers
// // };

// // // Enable CORS for all domains and methods
// // app.use(cors(corsOptions));
// // app.disable("x-powered-by");
// // // // 6. ADDITIONAL SECURITY HEADERS
// // app.use((req, res, next) => {
// //   res.removeHeader("X-Powered-By");
// //   res.removeHeader("Server");
// //   res.setHeader("X-Content-Type-Options", "nosniff");
// //   res.setHeader("X-Frame-Options", "DENY");
// //   res.setHeader("X-XSS-Protection", "1; mode=block");
// //   next();
// // });

// // app.use((req, res, next) => {
// //   const origin = req.headers.origin;
// //   if (origin && allowedOrigins.includes(origin.replace(/\/$/, ""))) {
// //     res.header("Access-Control-Allow-Origin", origin);
// //   }
// //   res.header("Access-Control-Allow-Credentials", "true");
// //   next();
// // });

// // // Handle preflight requests explicitly
// // // app.options("*", cors());

// // // -------------------- Basic Routes --------------------

// // // Root
// // app.get("/", (req, res) => {
// //   res.send("API is running 🚀");
// // });

// // // Health check
// // app.get("/health", (req, res) => {
// //   res.status(200).json({
// //     success: true,
// //     message: "Server is healthy",
// //   });
// // });

// // // Test API
// // app.get("/test", (req, res) => {
// //   res.json({
// //     success: true,
// //     message: "Test route working",
// //   });
// // });


// // app.use("/Auth", AuthRouter);
// // app.use("/Mentor", MenteeApplicationRouter);
// // app.use("/EngineeringMentors", EngineeringMentorsRouter);
// // app.use("/startUpMentors", startUpMentorsRouter);
// // app.use("/ProductMentors", ProductMentorsRouter);
// // app.use("/MarketingMentors", MarketingMentorsRouter);
// // app.use("/LeaderShipMentors", LeaderShipMentorsRouter);
// // app.use("/auth", GoogleSigninRouter);
// // app.use("/sessions", MentorsessionRouter);
// // app.use("/admin", AllMentessRouter);
// // app.use("/AiMentors", AiMentorsRouter);
// // app.use("/mentee/trailbookings", MenteeTrailbookingsRouter);
// // app.use("/mentee/dashboard", MenteeProfileSaveRouter);
// // app.use("/mentee/support", TicketsRouter);
// // app.use("/mentee", menteePaymentRouter);
// // app.use("/meetings", zoomMeetingRoutes);
// // app.use("/contact", ContactRouter);
// // app.use("/mentor/dashboard", MentorDashboardRouter);
// // app.use("/mentor/support", MentorSupportRouter);
// // app.use("/admin/mentor-support", AdminMentorSupportRouter);
// // app.use("/users", UsersRouter);
// // app.use("/Admin", SessionsBookingsRouter);

// // // -------------------- Error Handling --------------------

// // // 404 handler
// // app.use((req, res) => {
// //   res.status(404).json({
// //     success: false,
// //     message: "Route not found"
// //   });
// // });

// // // Global error handler
// // app.use((err, req, res, next) => {
// //   console.error("Error:", err);
// //   res.status(err.status || 500).json({
// //     success: false,
// //     message: err.message || "Internal server error"
// //   });
// // });

// // // -------------------- Export Firebase HTTPS Function --------------------
// // // export const api = onRequest(
// // //   {
// // //     region: "us-central1",
// // //     timeoutSeconds: 60,
// // //     cors: allowedOrigins, // Firebase functions CORS config
// // //   },
// // //   app
// // // );



// // export const api = onRequest(
// //   {
// //     region: "us-central1",
// //     timeoutSeconds: 60,
// //     cors: [
// //       "https://karrivo.in",
// //       "https://www.karrivo.in",
// //       "https://karrivoadmin.web.app",
// //       "https://karrivoadmin.firebaseapp.com",
// //       "http://localhost:5173",
// //       "http://localhost:5174"
// //     ],
// //   },
// //   app
// // );



// // import { onRequest } from "firebase-functions/v2/https";
// // import express from "express";
// // import admin from "firebase-admin";
// // import dotenv from "dotenv";

// // import AuthRouter from "./src/routes/authRouter.js";
// // import MenteeApplicationRouter from "./src/routes/mentorApplicationRoutes.js";
// // import EngineeringMentorsRouter from "./src/routes/engineeringMentorRoutes.js";
// // import startUpMentorsRouter from "./src/routes/startUpmentorsRoutes.js";
// // import ProductMentorsRouter from "./src/routes/productMentorsRoutes.js";
// // import MarketingMentorsRouter from "./src/routes/marketingMentorsRoutes.js";
// // import MentorsessionRouter from "./src/routes/sessionRoutes.js";
// // import LeaderShipMentorsRouter from "./src/routes/leadershipmentorsRoutes.js";
// // import AiMentorsRouter from "./src/routes/AimentorsRoutes.js";
// // import GoogleSigninRouter from "./src/routes/googlesignRouter.js";
// // import MenteeTrailbookingsRouter from "./src/routes/trialBookingRoutes.js";
// // import MenteeProfileSaveRouter from "./src/routes/ProfileRoutes.js";
// // import menteePaymentRouter from "./src/routes/paymentRoutes.js";
// // import zoomMeetingRoutes from "./src/routes/zoomMeetingRoutes.js";
// // import TicketsRouter from "./src/routes/ticketsRoutes.js";
// // import ContactRouter from "./src/routes/contactRoutes.js";
// // import MentorDashboardRouter from "./src/routes/mentorRoutes/mentorRoutes.js";
// // import MentorSupportRouter from "./src/routes/mentorRoutes/mentorSupportRoutes.js";
// // import AdminMentorSupportRouter from "./src/routes/mentorRoutes/adminMentorSupportRoutes.js";
// // import UsersRouter from "./src/routes/mentorRoutes/userRoutes.js";
// // import SessionsBookingsRouter from "./src/routes/mentorRoutes/sessionBookingRoutes.js";
// // import AllMentessRouter from "./src/routes/allmentessRouter.js";

// // import { connectToDatabase } from "./src/config/config.js";

// // dotenv.config();

// // const app = express();

// // // -------------------- Initialize Firebase Admin --------------------
// // admin.initializeApp();

// // // -------------------- Connect Database (Cold Start) --------------------
// // connectToDatabase();

// // // -------------------- Middleware --------------------
// // app.use(express.json());
// // app.disable("x-powered-by");

// // // Security headers
// // app.use((req, res, next) => {
// //   res.removeHeader("X-Powered-By");
// //   res.removeHeader("Server");
// //   res.setHeader("X-Content-Type-Options", "nosniff");
// //   res.setHeader("X-Frame-Options", "DENY");
// //   res.setHeader("X-XSS-Protection", "1; mode=block");
// //   next();
// // });

// // // -------------------- Basic Routes --------------------

// // // Root
// // app.get("/", (req, res) => {
// //   res.send("API is running 🚀");
// // });

// // // Health check
// // app.get("/health", (req, res) => {
// //   res.status(200).json({
// //     success: true,
// //     message: "Server is healthy",
// //   });
// // });

// // // Test API
// // app.get("/test", (req, res) => {
// //   res.json({
// //     success: true,
// //     message: "Test route working",
// //   });
// // });

// // // -------------------- Routes --------------------

// // app.use("/Auth", AuthRouter);
// // app.use("/Mentor", MenteeApplicationRouter);
// // app.use("/EngineeringMentors", EngineeringMentorsRouter);
// // app.use("/startUpMentors", startUpMentorsRouter);
// // app.use("/ProductMentors", ProductMentorsRouter);
// // app.use("/MarketingMentors", MarketingMentorsRouter);
// // app.use("/LeaderShipMentors", LeaderShipMentorsRouter);
// // app.use("/auth", GoogleSigninRouter);
// // app.use("/sessions", MentorsessionRouter);
// // app.use("/admin", AllMentessRouter);
// // app.use("/AiMentors", AiMentorsRouter);
// // app.use("/mentee/trailbookings", MenteeTrailbookingsRouter);
// // app.use("/mentee/dashboard", MenteeProfileSaveRouter);
// // app.use("/mentee/support", TicketsRouter);
// // app.use("/mentee", menteePaymentRouter);
// // app.use("/meetings", zoomMeetingRoutes);
// // app.use("/contact", ContactRouter);
// // app.use("/mentor/dashboard", MentorDashboardRouter);
// // app.use("/mentor/support", MentorSupportRouter);
// // app.use("/admin/mentor-support", AdminMentorSupportRouter);
// // app.use("/users", UsersRouter);
// // app.use("/Admin", SessionsBookingsRouter);

// // // -------------------- 404 Handler --------------------
// // app.use((req, res) => {
// //   res.status(404).json({
// //     success: false,
// //     message: "Route not found",
// //   });
// // });

// // // -------------------- Global Error Handler --------------------
// // app.use((err, req, res, next) => {
// //   console.error("Error:", err);
// //   res.status(err.status || 500).json({
// //     success: false,
// //     message: err.message || "Internal server error",
// //   });
// // });

// // // -------------------- Export Firebase HTTPS Function --------------------

// // export const api = onRequest(
// //   {
// //     region: "us-central1",
// //     timeoutSeconds: 60,
// //     cors: [
// //       "https://karrivo.in",
// //       "https://www.karrivo.in",
// //       "https://karrivoadmin.web.app",
// //       "https://karrivoadmin.firebaseapp.com",
// //       "http://localhost:5173",
// //       "http://localhost:5174",
// //     ],
// //   },
// //   app
// // );



// // index.js (Firebase Function entry)


// import { onRequest } from "firebase-functions/v2/https";
// import express from "express";
// import cors from "cors";


// import { connectToDatabase } from "./src/config/config.js";

// // Import your routers
// import AuthRouter from "./src/routes/authRouter.js";
// import MenteeApplicationRouter from "./src/routes/mentorApplicationRoutes.js"
// import EngineeringMentorsRouter from "./src/routes/engineeringMentorRoutes.js";
// import startUpMentorsRouter from "./src/routes/startUpmentorsRoutes.js";
// import ProductMentorsRouter from "./src/routes/productMentorsRoutes.js";
// import MarketingMentorsRouter from "./src/routes/marketingMentorsRoutes.js";
// import MentorsessionRouter from "./src/routes/sessionRoutes.js";
// import LeaderShipMentorsRouter from "./src/routes/leadershipmentorsRoutes.js";
// import AiMentorsRouter from "./src/routes/AimentorsRoutes.js";
// import GoogleSigninRouter from "./src/routes/googlesignRouter.js";
// import MenteeTrailbookingsRouter from "./src/routes/trialBookingRoutes.js";
// import MenteeProfileSaveRouter from "./src/routes/ProfileRoutes.js";
// import menteePaymentRouter from "./src/routes/paymentRoutes.js";
// import zoomMeetingRoutes from "./src/routes/zoomMeetingRoutes.js";
// import TicketsRouter from "./src/routes/ticketsRoutes.js";
// import ContactRouter from "./src/routes/contactRoutes.js";
// import MentorDashboardRouter from "./src/routes/mentorRoutes/mentorRoutes.js";
// import MentorSupportRouter from "./src/routes/mentorRoutes/mentorSupportRoutes.js";
// import AdminMentorSupportRouter from "./src/routes/mentorRoutes/adminMentorSupportRoutes.js";
// import UsersRouter from "./src/routes/mentorRoutes/userRoutes.js";
// import SessionsBookingsRouter from "./src/routes/mentorRoutes/sessionBookingRoutes.js";
// import AllMentessRouter from "./src/routes/allmentessRouter.js";
// import DataExtractionRouter from "./src/routes/mentorRoutes/dataExtracionRouter.js"
// connectToDatabase();


// const app = express();

// // Enable CORS
// app.use(cors({ origin: true }));

// // Parse JSON bodies
// app.use(express.json());

// // Root route
// app.get("/", (req, res) => {
//     res.status(200).send("API is running 🚀");
// });

// // Mount your routers
// app.use("/Auth", AuthRouter);
// app.use("/Mentor", MenteeApplicationRouter);
// app.use("/EngineeringMentors", EngineeringMentorsRouter);
// app.use("/startUpMentors", startUpMentorsRouter);
// app.use("/ProductMentors", ProductMentorsRouter);
// app.use("/MarketingMentors", MarketingMentorsRouter);
// app.use("/LeaderShipMentors", LeaderShipMentorsRouter);
// app.use("/auth", GoogleSigninRouter);
// app.use("/sessions", MentorsessionRouter);
// app.use("/admin", AllMentessRouter);
// app.use("/AiMentors", AiMentorsRouter);
// app.use("/mentee/trailbookings", MenteeTrailbookingsRouter);
// app.use("/mentee/dashboard", MenteeProfileSaveRouter);
// app.use("/mentee/support", TicketsRouter);
// app.use("/mentee", menteePaymentRouter);
// app.use("/meetings", zoomMeetingRoutes);
// app.use("/contact", ContactRouter);
// app.use("/mentor/dashboard", MentorDashboardRouter);
// app.use("/mentor/support", MentorSupportRouter);
// app.use("/admin/mentor-support", AdminMentorSupportRouter);
// app.use("/users", UsersRouter);
// app.use("/Admin", SessionsBookingsRouter);
// app.use("/dataextraction", DataExtractionRouter)
// // 404 handler for unmatched routes
// app.use((req, res) => {
//     res.status(404).json({ message: "Route not found" });
// });

// // Export Firebase function
// export const api = onRequest(app);



// import { onRequest } from "firebase-functions/v2/https";
// import express from "express";
// import cors from "cors";

// import { connectToDatabase } from "./src/config/config.js";
// import DataExtractionRouter from  "./src/routes/mentorRoutes/dataExtracionRouter.js"

// connectToDatabase();

// const app = express();

// // ⚡ Only enable CORS globally (optional)
// app.use(cors({ origin: true }));

// // ✅ Root route
// app.get("/", (req, res) => res.send("API is running 🚀"));

// // ⚡ Mount router
// app.use("/dataextraction", DataExtractionRouter);

// // ⚡ 404 fallback
// app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// export const api = onRequest(app);







import { onRequest } from "firebase-functions/v2/https";
import express from "express";
import cors from "cors";
import { connectToDatabase } from "./src/config/config.js";
import dotenv from "dotenv";



// Import your routers
import AuthRouter from "./src/routes/authRouter.js";
import MenteeApplicationRouter from "./src/routes/mentorApplicationRoutes.js";
import EngineeringMentorsRouter from "./src/routes/engineeringMentorRoutes.js";
import startUpMentorsRouter from "./src/routes/startUpmentorsRoutes.js";
import ProductMentorsRouter from "./src/routes/productMentorsRoutes.js";
import MarketingMentorsRouter from "./src/routes/marketingMentorsRoutes.js";
import MentorsessionRouter from "./src/routes/sessionRoutes.js";
import LeaderShipMentorsRouter from "./src/routes/leadershipmentorsRoutes.js";
import AiMentorsRouter from "./src/routes/AimentorsRoutes.js";
import GoogleSigninRouter from "./src/routes/googlesignRouter.js";
import MenteeTrailbookingsRouter from "./src/routes/trialBookingRoutes.js";
import MenteeProfileSaveRouter from "./src/routes/ProfileRoutes.js";
import menteePaymentRouter from "./src/routes/paymentRoutes.js";
import zoomMeetingRoutes from "./src/routes/zoomMeetingRoutes.js";
import TicketsRouter from "./src/routes/ticketsRoutes.js";
import ContactRouter from "./src/routes/contactRoutes.js";
import MentorDashboardRouter from "./src/routes/mentorRoutes/mentorRoutes.js";
import MentorSupportRouter from "./src/routes/mentorRoutes/mentorSupportRoutes.js";
import AdminMentorSupportRouter from "./src/routes/mentorRoutes/adminMentorSupportRoutes.js";
import UsersRouter from "./src/routes/mentorRoutes/userRoutes.js";
import SessionsBookingsRouter from "./src/routes/mentorRoutes/sessionBookingRoutes.js";
import AllMentessRouter from "./src/routes/allmentessRouter.js";
import DataExtractionRouter from "./src/routes/mentorRoutes/dataExtracionRouter.js";

import logger from "./src/helper/logger.js";
import User from "./src/models/users.js";




dotenv.config();
const app = express();



// connectToDatabase();





// // Connect to database
// app.use(async (req, res, next) => {
//     try {
//         await connectToDatabase();
//         next();
//     } catch (err) {
//         console.error("DB connection failed:", err);
//         res.status(500).json({ error: "Database connection failed" });
//     }
// });




// Disable X-Powered-By header
app.disable("x-powered-by");




// List of allowed origins for production
const productionOrigins = [
    "https://karrivo.in",
    "https://karrivoadmin.web.app",
    "https://www.karrivo.in",
];

const corsOptions = {
    origin: (origin, callback) => {
        if (process.env.NODE_ENV !== "production") {
            callback(null, true);
        } else {
            // Restrict origins in production
            if (!origin || productionOrigins.includes(origin)) {
                callback(null, true);
            } else {
                logger.error("Blocked CORS request from:", origin);
                callback(new Error("Not allowed by CORS"));
            }
        }
    },
    methods: "*",
    allowedHeaders: "*",
    credentials: true,
};

app.use(cors(corsOptions));


app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));


app.use((req, res, next) => {
    const start = Date.now();
    const currentDateIST = new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
    });

    res.on("finish", () => {
        const end = Date.now();
        const responseTime = end - start;
        const user = req.user || req.admin;

        const logData = {
            timestampIST: currentDateIST,
            method: req.method,
            path: req.url,
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`,
            userId: user ? user.id : null,
        };

        if (res.statusCode >= 400) {
            logger.error(logData);
        } else {
            logger.info(logData);
        }
    });

    next();
});


// Root route
app.get("/", (req, res) => {
    res.status(200).json({ status: "working", message: "API is running 🚀" });
});

// Health check route
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// Mount all routers with their specific paths
app.use("/Auth", AuthRouter);
app.use("/Mentor", MenteeApplicationRouter);
app.use("/EngineeringMentors", EngineeringMentorsRouter);
app.use("/startUpMentors", startUpMentorsRouter);
app.use("/ProductMentors", ProductMentorsRouter);
app.use("/MarketingMentors", MarketingMentorsRouter);
app.use("/LeaderShipMentors", LeaderShipMentorsRouter);
app.use("/auth", GoogleSigninRouter);
app.use("/sessions", MentorsessionRouter);
app.use("/admin", AllMentessRouter);
app.use("/AiMentors", AiMentorsRouter);
app.use("/mentee/trailbookings", MenteeTrailbookingsRouter);
app.use("/mentee/dashboard", MenteeProfileSaveRouter);
app.use("/mentee/support", TicketsRouter);
app.use("/mentee", menteePaymentRouter);
app.use("/meetings", zoomMeetingRoutes);
app.use("/contact", ContactRouter);
app.use("/mentor/dashboard", MentorDashboardRouter);
app.use("/mentor/support", MentorSupportRouter);
app.use("/admin/mentor-support", AdminMentorSupportRouter);
app.use("/users", UsersRouter);
app.use("/Admin", SessionsBookingsRouter);
app.use("/dataextraction", DataExtractionRouter);


// 404 handler for unmatched routes
app.use((req, res) => {
    logger.warn(`404 - Route not found: ${req.method} ${req.url}`);
    res.status(404).json({
        error: "Route not found",
        path: req.url,
        method: req.method,
    });
});

// Global error handler
app.use((err, req, res, next) => {
    const start = Date.now();
    const currentDateIST = new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
    });
    const end = Date.now();
    const responseTime = end - start;
    const user = req.user || req.admin;

    const logData = {
        timestampIST: currentDateIST,
        method: req.method,
        path: req.url,
        responseTime: `${responseTime}ms`,
        userId: user ? user.id : null,
        error: err?.message,
        stack: process.env.NODE_ENV === "development" ? err?.stack : undefined,
    };

    logger.error(JSON.stringify(logData));

    // Don't leak error details in production
    const errorMessage =
        process.env.NODE_ENV === "production"
            ? "Internal server error"
            : err?.message || "Unknown error";

    res.status(err.status || 500).json({
        error: errorMessage,
        ...(process.env.NODE_ENV === "development" && { stack: err?.stack }),
    });
});


process.on("uncaughtException", (err) => {
    logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
    // In Firebase Functions, don't exit process - let it handle lifecycle
});

process.on("unhandledRejection", (reason, promise) => {
    logger.error(`Unhandled Rejection: ${reason}`, { promise });
});


export const api = onRequest(app);
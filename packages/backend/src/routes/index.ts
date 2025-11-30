import express, { Router } from "express";
import authRoutes from "./auth.routes.js";

const router: Router = express.Router();

// Mount route modules
router.use("/auth", authRoutes);

export default router;


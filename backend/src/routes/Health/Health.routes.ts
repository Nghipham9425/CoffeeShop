import { Router } from "express";
import { healthController } from "../../controllers/Health/Health.controller.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";

export const healthRoutes = Router();

healthRoutes.get("/", asyncHandler(healthController.getHealth));

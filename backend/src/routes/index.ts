import { Router } from "express";
import { authRoutes } from "./Auth/Auth.routes.js";
import { categoryRoutes } from "./Category/Category.routes.js";
import { healthRoutes } from "./Health/Health.routes.js";
import { productRoutes } from "./Product/Product.routes.js";
import { quoteRequestRoutes } from "./QuoteRequest/QuoteRequest.routes.js";

export const apiRoutes = Router();

apiRoutes.use("/auth", authRoutes);
apiRoutes.use("/categories", categoryRoutes);
apiRoutes.use("/health", healthRoutes);
apiRoutes.use("/products", productRoutes);
apiRoutes.use("/quote-requests", quoteRequestRoutes);

import cors from "cors"
import express from "express"
import helmet from "helmet"
import morgan from "morgan"
import swaggerUi from "swagger-ui-express"
import { env, isDevelopment } from "./config/env.js"
import { swaggerSpec } from "./config/swagger.js"
import { errorHandler } from "./middleware/errorHandler.js"
import { notFoundHandler } from "./middleware/notFoundHandler.js"
import { apiRoutes } from "./routes/index.js"

export const app = express()

app.use(helmet())
app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

if (isDevelopment) {
  app.use(morgan("dev"))
}

app.get("/", (_req, res) => {
  res.json({
    name: "Coffee Works API",
    version: "0.1.0",
    docs: "/api-docs",
  })
})

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use("/api", apiRoutes)
app.use(notFoundHandler)
app.use(errorHandler)

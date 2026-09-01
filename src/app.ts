import express from "express";
import morgan from "morgan";
import cardRouter from "./card-validation.routes.js";

const app = express();

// middlewares
app.use(morgan("dev"));
app.use(express.json());

// routes
app.use("/card", cardRouter);

export default app;

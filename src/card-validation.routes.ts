import { Router } from "express";
import cardController from "./card-validation.controller.js";

const router = Router();

router.post("/", cardController.validateCard);

export default router;

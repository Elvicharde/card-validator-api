import { Router } from "express";
import cardController from "./card.controller.js";

const router = Router();

router.post("/validate", async (req, res) => {
  // Call the validateCard method from the cardController
  await cardController.validateCard(req, res);
});


export default router;
import type { Request, Response } from "express";
import type { CardValidationApiResponse } from "./types/card-validation.types.js";

import { validateCardNumber } from "./card-validation.service.js";

const cardController = {
  async validateCard(req: Request, res: Response<CardValidationApiResponse>) {
    const cardNumber = req.body?.cardNumber;
    const isValid = validateCardNumber(cardNumber);
    res.json({
      status: "success",
      message: "Card validation successful",
      data: { isValid },
    });
  },
};

export default cardController;

import { Router } from "express";

const router = Router();

/**
 * GET
 */

router.get("*", (request, response, next) => {
  response.send({ test: "test" });
});

export default router;

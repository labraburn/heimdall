import { Router } from "express";

const router = Router();

/**
 * GET
 */

router.get("/", (request, response, next) => {
  broadcaster.add({ request, response });
});

export default router;

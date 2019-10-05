import { Router } from "express";

import { TestController } from "./controllers";
import { TestMiddleware } from "./middleware";

const router: Router = Router();

router.use("/", TestMiddleware);
router.use("/", TestController);

export const MainRouter: Router = router;
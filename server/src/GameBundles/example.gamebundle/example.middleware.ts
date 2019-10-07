import { NextFunction, Request, Response, Router } from "express";
import httpStatus from "http-status";

const router: Router = Router();

router.get("/test", (req: Request, res: Response, next: NextFunction) => {
    res.status(httpStatus.OK).send("OK");
});

export default router;
import { NextFunction, Request, Response, Router } from "express";
import httpStatus from "http-status";
import path from "path";

const router: Router = Router();

router.get("/test", (req: Request, res: Response, next: NextFunction) => {
    res.status(httpStatus.OK).send("OK");
});

router.get("/createGame.vue", (req, res, next) => {
	res.status(httpStatus.OK).contentType("text/plain").sendFile(path.join(__dirname, "client/createGame.vue"));
});

router.get("/game.vue", (req, res, next) => {
	res.status(httpStatus.OK).contentType("text/plain").sendFile(path.join(__dirname, "client/game.vue"));
});

export default router;
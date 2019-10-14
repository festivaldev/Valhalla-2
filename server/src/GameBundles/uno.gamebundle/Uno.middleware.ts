import { NextFunction, Request, Response, Router } from "express";
import httpStatus from "http-status";
import path from "path";

const router: Router = Router();

router.get("/createGame.vue", (req, res, next) => {
	res.status(httpStatus.OK).contentType("text/plain").sendFile(path.join(__dirname, "client/createGame.vue"));
});

router.get("/game.vue", (req, res, next) => {
	res.status(httpStatus.OK).contentType("text/plain").sendFile(path.join(__dirname, "client/game.vue"));
});

export default router;
import { NextFunction, Request, Response, Router } from "express";
import httpStatus from "http-status";
import path from "path";

const router: Router = Router();

router.get("/test", (req: Request, res: Response, next: NextFunction) => {
    res.status(httpStatus.OK).send("OK");
});

router.get("/createGame.html", (req, res, next) => {
	res.status(httpStatus.OK).contentType("text/html").sendFile(path.join(__dirname, "client/createGame.html"));
});

router.get("/example.vue", (req, res, next) => {
	res.status(httpStatus.OK).contentType("text/html").sendFile(path.join(__dirname, "client/example.vue"));
});

export default router;
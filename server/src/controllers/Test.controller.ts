import { Request, Router } from "express";

const router: Router = Router();

router.get("/", (req: Request, res, next) => {
    res.send(req.message);
});

export const TestController: Router = router;
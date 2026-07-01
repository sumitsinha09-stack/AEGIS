import { Router, type IRouter } from "express";
import healthRouter from "./health";
import overviewRouter from "./overview";
import riskRouter from "./risk";
import scenariosRouter from "./scenarios";
import procurementRouter from "./procurement";
import reserveRouter from "./reserve";
import digitalTwinRouter from "./digitalTwin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(overviewRouter);
router.use(riskRouter);
router.use(scenariosRouter);
router.use(procurementRouter);
router.use(reserveRouter);
router.use(digitalTwinRouter);

export default router;

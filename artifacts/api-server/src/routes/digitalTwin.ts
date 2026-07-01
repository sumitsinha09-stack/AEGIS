import { Router, type IRouter } from "express";
import { db, digitalTwinNodesTable, shippingCorridorsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/digital-twin/nodes", async (_req, res): Promise<void> => {
  const nodes = await db.select().from(digitalTwinNodesTable);
  res.json(nodes);
});

router.get("/digital-twin/corridors", async (_req, res): Promise<void> => {
  const corridors = await db.select().from(shippingCorridorsTable);
  res.json(corridors);
});

router.post("/digital-twin/whatif", async (req, res): Promise<void> => {
  const { targetId, targetType, disruptionType = "closure" } = req.body ?? {};

  const CORRIDOR_IMPACTS: Record<string, { volumeMbpd: number; alternatives: string[] }> = {
    hormuz: { volumeMbpd: 2.1, alternatives: ["Cape of Good Hope routing via ADNOC Fujairah terminal", "Red Sea via Yanbu (Saudi Arabia)", "ESPO pipeline via Vladivostok"] },
    red_sea: { volumeMbpd: 0.9, alternatives: ["Cape of Good Hope rerouting (+12 days)", "Suez Canal northern approach", "Bab-el-Mandeb alternate routing"] },
    malacca: { volumeMbpd: 0.3, alternatives: ["Lombok Strait (Indonesia)", "Sunda Strait (Indonesia)", "Makassar Strait"] },
    cape_good_hope: { volumeMbpd: 0.4, alternatives: ["Suez Canal (primary)", "Panama Canal (Pacific reroute)"] },
    persian_gulf: { volumeMbpd: 1.8, alternatives: ["East African coast routing", "ESPO pipeline", "Atlantic Basin sourcing"] },
  };

  const impact = CORRIDOR_IMPACTS[targetId] ?? { volumeMbpd: 0.5, alternatives: ["Alternative routing analysis required"] };

  const NODE_IMPACTS: Record<string, string> = {
    jamnagar: "Reliance Jamnagar offline. Route 650,000 BPD to Vadinar and Paradip. Activate alternative crude grade procurement.",
    paradip: "IOCL Paradip offline. Divert Eastern India supply to Haldia and Vizag refineries. 45-day crude inventory buffer available.",
    vadinar: "Nayara Vadinar offline. Critical — processes 20% of India's crude. Emergency SPR drawdown authorized.",
    mangalore: "MRPL Mangalore offline. Karnataka supply impacted. Redirect pipeline flows from Paradip.",
  };

  const impactSummary = targetType === "corridor"
    ? `${disruptionType === "closure" ? "Full closure" : "Partial restriction"} of ${targetId} corridor. Estimated supply disruption: ${impact.volumeMbpd.toFixed(1)} MBPD (${Math.round(impact.volumeMbpd / 5.2 * 100)}% of India's daily imports). Immediate rerouting required.`
    : (NODE_IMPACTS[targetId] ?? `${targetId} node disrupted. Impact assessment underway. Activating contingency protocols.`);

  res.json({
    targetId,
    impactSummary,
    affectedVolumeMbpd: impact.volumeMbpd,
    alternativeRoutes: impact.alternatives,
    recommendedAction: `Initiate emergency procurement from alternative sources. Brief Ministry of Petroleum within 4 hours. Pre-position SPR drawdown authorization.`,
  });
});

export default router;

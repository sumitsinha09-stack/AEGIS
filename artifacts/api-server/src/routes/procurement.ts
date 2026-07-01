import { Router, type IRouter } from "express";
import { db, procurementRecommendationsTable } from "@workspace/db";
import { asc } from "drizzle-orm";

const router: IRouter = Router();

const CRUDE_SOURCES = [
  { id: 1, supplier: "Iraq State Oil", country: "Iraq", gradeType: "Basra Heavy", typicalVolume: 1.2, currentPrice: 78.4 },
  { id: 2, supplier: "Saudi Aramco", country: "Saudi Arabia", gradeType: "Arab Light", typicalVolume: 0.9, currentPrice: 81.2 },
  { id: 3, supplier: "Rosneft", country: "Russia", gradeType: "Urals", typicalVolume: 0.8, currentPrice: 62.5 },
  { id: 4, supplier: "ADNOC", country: "UAE", gradeType: "Murban", typicalVolume: 0.5, currentPrice: 84.1 },
  { id: 5, supplier: "NNPC", country: "Nigeria", gradeType: "Bonny Light", typicalVolume: 0.3, currentPrice: 87.3 },
  { id: 6, supplier: "Chevron", country: "United States", gradeType: "WTI Midland", typicalVolume: 0.25, currentPrice: 79.8 },
  { id: 7, supplier: "Kuwait Petroleum", country: "Kuwait", gradeType: "Kuwait Export", typicalVolume: 0.35, currentPrice: 79.1 },
];

const SCENARIO_REASONINGS: Record<string, string[]> = {
  hormuz_closure: [
    "Hormuz closure eliminates direct Gulf access. Basra supply fully disrupted — switch to Cape of Good Hope routing via non-Gulf sources. US WTI and West African Bonny Light prioritized for grade compatibility with Jamnagar complex.",
    "Saudi Aramco Red Sea terminal (Yanbu) partially viable. Routing via Suez adds 4 days transit but maintains refinery grade. Pre-position 2 VLCCs at Fujairah anchorage for immediate dispatch post-clearance.",
    "ADNOC's Fujairah export terminal unaffected. Murban grade compatible with Vadinar and Paradip. Recommend 30% volume increase on ADNOC contract for next 90 days.",
    "Russian Urals available via Black Sea → Suez. Discounted pricing partially offsets rerouting costs. Grade adjustment required at Barauni and Mathura refineries.",
    "Kuwait routing blocked. Deferring to Q2 — no viable alternative route identified within cost parameters.",
  ],
  opec_cut: [
    "OPEC+ cut increases spot price 22%. Accelerate US WTI spot procurement before further tightening. Lock in 60-day forward contracts at today's price.",
    "Russian Urals offers 28% discount to Brent. Volume increase viable — initiate diplomatic channel for payment settlement in INR.",
    "Saudi volumes reduced but not eliminated. Maintain relationship purchasing at reduced volume; renegotiate contract floor price.",
    "Nigerian Bonny Light unaffected by OPEC+ cut. Increase allocation; vessel availability confirmed via Paradip port authority.",
    "UAE Murban allocation unchanged. Minor pricing adjustment expected. Continue at current volume.",
  ],
};

router.get("/procurement/recommendations", async (_req, res): Promise<void> => {
  const recs = await db.select().from(procurementRecommendationsTable).orderBy(asc(procurementRecommendationsTable.rank));
  res.json(recs.map(r => ({ ...r })));
});

router.post("/procurement/run", async (req, res): Promise<void> => {
  const { scenarioId = "hormuz_closure" } = req.body ?? {};

  const reasonings = SCENARIO_REASONINGS[scenarioId] ?? SCENARIO_REASONINGS["hormuz_closure"];

  const sources = [
    { supplier: "ADNOC", country: "UAE", route: "Fujairah → Cape Guardafui → Lakshadweep → Paradip", spotPrice: 84.1, tankerAvail: 0.92, portCong: 0.82, gradeComp: 0.95 },
    { supplier: "Saudi Aramco", country: "Saudi Arabia", route: "Yanbu → Suez → Red Sea → Jamnagar", spotPrice: 81.2, tankerAvail: 0.85, portCong: 0.78, gradeComp: 0.90 },
    { supplier: "Chevron", country: "United States", route: "Houston → Atlantic → Cape of Good Hope → Paradip", spotPrice: 79.8, tankerAvail: 0.88, portCong: 0.91, gradeComp: 0.88 },
    { supplier: "Rosneft", country: "Russia", route: "Novorossiysk → Suez → Arabian Sea → Vadinar", spotPrice: 62.5, tankerAvail: 0.72, portCong: 0.65, gradeComp: 0.75 },
    { supplier: "NNPC", country: "Nigeria", route: "Bonny → Cape of Good Hope → Paradip", spotPrice: 87.3, tankerAvail: 0.80, portCong: 0.88, gradeComp: 0.85 },
  ];

  const scored = sources.map((s, i) => {
    const priceScore = (1 - (s.spotPrice - 60) / 40) * 100;
    const overallScore = parseFloat((
      priceScore * 0.30 + s.tankerAvail * 100 * 0.25 + s.portCong * 100 * 0.20 + s.gradeComp * 100 * 0.25
    ).toFixed(1));
    const status = overallScore >= 82 ? "RECOMMENDED" : overallScore >= 70 ? "VIABLE" : overallScore >= 55 ? "MARGINAL" : "AVOID";
    return {
      id: i + 1,
      rank: i + 1,
      supplier: s.supplier,
      country: s.country,
      route: s.route,
      spotPrice: s.spotPrice,
      tankerAvailability: s.tankerAvail,
      portCongestion: s.portCong,
      gradeCompatibility: s.gradeComp,
      overallScore,
      reasoning: reasonings[i] ?? `Standard procurement analysis for ${s.supplier}. Score based on multi-factor assessment.`,
      status,
    };
  });

  const sorted = scored.sort((a, b) => b.overallScore - a.overallScore).map((s, i) => ({ ...s, rank: i + 1 }));

  res.json(sorted);
});

router.get("/procurement/sources", async (_req, res): Promise<void> => {
  res.json(CRUDE_SOURCES);
});

export default router;

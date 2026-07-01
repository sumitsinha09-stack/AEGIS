import { db } from "./index";
import {
  riskScoresTable,
  newsSignalsTable,
  supplierRisksTable,
  procurementRecommendationsTable,
  reserveStatusTable,
  digitalTwinNodesTable,
  shippingCorridorsTable
} from "./schema";

async function seed() {
  console.log("Seeding database...");

  // 1. Clear existing data
  await db.delete(riskScoresTable);
  await db.delete(newsSignalsTable);
  await db.delete(supplierRisksTable);
  await db.delete(procurementRecommendationsTable);
  await db.delete(reserveStatusTable);
  await db.delete(digitalTwinNodesTable);
  await db.delete(shippingCorridorsTable);

  console.log("Database cleared.");

  // 2. Insert Risk Scores
  await db.insert(riskScoresTable).values([
    { corridor: "Strait of Hormuz", score: 72, level: "HIGH", trend: "stable" },
    { corridor: "Red Sea", score: 68, level: "HIGH", trend: "increasing" },
    { corridor: "Malacca Strait", score: 15, level: "LOW", trend: "stable" },
    { corridor: "Cape of Good Hope", score: 20, level: "LOW", trend: "stable" },
    { corridor: "Persian Gulf", score: 55, level: "MODERATE", trend: "increasing" }
  ]);
  console.log("Seeded risk scores.");

  // 3. Insert News Signals
  await db.insert(newsSignalsTable).values([
    {
      headline: "Maritime security tightened in Strait of Hormuz after tanker boarded",
      source: "Lloyd's List",
      corridor: "Strait of Hormuz",
      severity: "HIGH",
      extractedRisk: "Insurance premiums hike by 15% for Gulf-bound vessels. Rerouting considered."
    },
    {
      headline: "Drone swarm reported near Bab-el-Mandeb; commercial shipping warned",
      source: "UKMTO",
      corridor: "Red Sea",
      severity: "CRITICAL",
      extractedRisk: "Major container and tanker lines divert to Cape route. +12 days delay expected."
    },
    {
      headline: "Saudi Aramco Yanbu terminal expands crude loading operations",
      source: "Platts",
      corridor: "Red Sea",
      severity: "MODERATE",
      extractedRisk: "Yanbu loading volume rises to 2.5 MBPD. Mitigates Hormuz transit dependency."
    },
    {
      headline: "OPEC+ signals potential delay in production output rollback",
      source: "Reuters",
      corridor: "Persian Gulf",
      severity: "MODERATE",
      extractedRisk: "Spot market price spikes 3% on tighter supply outlook."
    }
  ]);
  console.log("Seeded news signals.");

  // 4. Insert Supplier Risks
  await db.insert(supplierRisksTable).values([
    {
      supplier: "Iraq State Oil",
      country: "Iraq",
      share: 25.0,
      riskScore: 72.0,
      riskLevel: "HIGH",
      primaryRoute: "Strait of Hormuz",
      notes: "Primary grade: Basra Heavy. High dependency."
    },
    {
      supplier: "Saudi Aramco",
      country: "Saudi Arabia",
      share: 18.0,
      riskScore: 68.0,
      riskLevel: "HIGH",
      primaryRoute: "Strait of Hormuz",
      notes: "Yanbu terminal provides alternative exit."
    },
    {
      supplier: "Rosneft",
      country: "Russia",
      share: 22.0,
      riskScore: 30.0,
      riskLevel: "MODERATE",
      primaryRoute: "Northern Sea / Baltic",
      notes: "Urals grade. High freight discount."
    },
    {
      supplier: "ADNOC",
      country: "UAE",
      share: 12.0,
      riskScore: 55.0,
      riskLevel: "MODERATE",
      primaryRoute: "Strait of Hormuz",
      notes: "Murban grade. Strategic alternate pipeline."
    },
    {
      supplier: "Chevron",
      country: "United States",
      share: 5.0,
      riskScore: 15.0,
      riskLevel: "LOW",
      primaryRoute: "Cape Route",
      notes: "WTI Midland. High shipping time."
    }
  ]);
  console.log("Seeded supplier risks.");

  // 5. Insert Procurement Recommendations
  await db.insert(procurementRecommendationsTable).values([
    {
      rank: 1,
      supplier: "ADNOC",
      country: "UAE",
      route: "Fujairah → Cape Guardafui → Lakshadweep → Paradip",
      spotPrice: 84.1,
      tankerAvailability: 0.92,
      portCongestion: 0.82,
      gradeCompatibility: 0.95,
      overallScore: 88.0,
      status: "RECOMMENDED",
      reasoning: "ADNOC's Fujairah export terminal unaffected. Murban grade compatible with Vadinar and Paradip. Recommend 30% volume increase on ADNOC contract for next 90 days."
    },
    {
      rank: 2,
      supplier: "Saudi Aramco",
      country: "Saudi Arabia",
      route: "Yanbu → Suez → Red Sea → Jamnagar",
      spotPrice: 81.2,
      tankerAvailability: 0.85,
      portCongestion: 0.78,
      gradeCompatibility: 0.90,
      overallScore: 84.5,
      status: "RECOMMENDED",
      reasoning: "Saudi Aramco Red Sea terminal (Yanbu) partially viable. Routing via Suez adds 4 days transit but maintains refinery grade."
    },
    {
      rank: 3,
      supplier: "Chevron",
      country: "United States",
      route: "Houston → Atlantic → Cape of Good Hope → Paradip",
      spotPrice: 79.8,
      tankerAvailability: 0.88,
      portCongestion: 0.91,
      gradeCompatibility: 0.88,
      overallScore: 78.2,
      status: "VIABLE",
      reasoning: "Hormuz closure eliminates direct Gulf access. US WTI and West African Bonny Light prioritized for grade compatibility with Jamnagar complex."
    },
    {
      rank: 4,
      supplier: "Rosneft",
      country: "Russia",
      route: "Novorossiysk → Suez → Arabian Sea → Vadinar",
      spotPrice: 62.5,
      tankerAvailability: 0.72,
      portCongestion: 0.65,
      gradeCompatibility: 0.75,
      overallScore: 75.0,
      status: "VIABLE",
      reasoning: "Russian Urals available via Black Sea → Suez. Discounted pricing partially offsets rerouting costs. Grade adjustment required."
    },
    {
      rank: 5,
      supplier: "NNPC",
      country: "Nigeria",
      route: "Bonny → Cape of Good Hope → Paradip",
      spotPrice: 87.3,
      tankerAvailability: 0.80,
      portCongestion: 0.88,
      gradeCompatibility: 0.85,
      overallScore: 72.1,
      status: "VIABLE",
      reasoning: "Standard procurement analysis for NNPC. Volume increase viable via Cape route."
    }
  ]);
  console.log("Seeded procurement recommendations.");

  // 6. Insert Reserve Status
  await db.insert(reserveStatusTable).values([
    {
      currentDays: 9.5,
      capacityDays: 14.0,
      fillPercent: 67.8,
      drawdownRate: 0.0,
      recommendedAction: "Maintain current SPR levels. Monitor Hormuz risk indicators.",
      riskOfDepletion: "LOW",
      replenishmentWindow: "Next 90 days"
    }
  ]);
  console.log("Seeded reserve status.");

  // 7. Insert Digital Twin Nodes
  await db.insert(digitalTwinNodesTable).values([
    {
      id: "hormuz_node",
      name: "Strait of Hormuz",
      type: "strait",
      lat: 26.5,
      lon: 56.3,
      riskLevel: "HIGH",
      details: "Critical chokepoint. 40% of India's crude imports transit here."
    },
    {
      id: "bab_el_mandeb",
      name: "Bab-el-Mandeb",
      type: "strait",
      lat: 12.6,
      lon: 43.3,
      riskLevel: "HIGH",
      details: "Red Sea southern entry. Elevated threat from regional drone/missile activity."
    },
    {
      id: "fujairah",
      name: "Fujairah Port",
      type: "terminal",
      lat: 25.1,
      lon: 56.3,
      riskLevel: "MODERATE",
      details: "UAE bypass port on Gulf of Oman. Strategic alternative to Hormuz transit."
    },
    {
      id: "yanbu",
      name: "Yanbu Port",
      type: "terminal",
      lat: 24.0,
      lon: 38.0,
      riskLevel: "MODERATE",
      details: "Saudi Red Sea terminal. Key alternate routing point."
    },
    {
      id: "cape",
      name: "Cape Route",
      type: "strait",
      lat: -12.0,
      lon: 22.0,
      riskLevel: "LOW",
      details: "Safe alternative shipping lane. Adds 12-14 days transit time to India."
    },
    {
      id: "malacca",
      name: "Strait of Malacca",
      type: "strait",
      lat: 2.0,
      lon: 98.0,
      riskLevel: "LOW",
      details: "East Asian trade gateway. Minimal risk to India-bound tankers."
    },
    {
      id: "jamnagar",
      name: "Reliance Jamnagar",
      type: "refinery",
      lat: 22.5,
      lon: 70.0,
      riskLevel: "LOW",
      details: "World's largest refining complex (1.24 MBPD capacity). Relies heavily on Middle East crudes."
    },
    {
      id: "vadinar",
      name: "Nayara Vadinar",
      type: "refinery",
      lat: 22.4,
      lon: 69.7,
      riskLevel: "LOW",
      details: "Critical refinery (400,000 BPD). Direct marine terminal access."
    },
    {
      id: "paradip",
      name: "IOCL Paradip",
      type: "port",
      lat: 20.3,
      lon: 86.7,
      riskLevel: "LOW",
      details: "East Coast energy hub. Major unloading port for Russian and West African crudes."
    },
    {
      id: "mangalore",
      name: "MRPL Mangalore",
      type: "refinery",
      lat: 12.9,
      lon: 74.8,
      riskLevel: "LOW",
      details: "West Coast refinery (300,000 BPD). Close proximity to Arabian Sea lanes."
    }
  ]);
  console.log("Seeded digital twin nodes.");

  // 8. Insert Shipping Corridors
  await db.insert(shippingCorridorsTable).values([
    {
      id: "hormuz",
      name: "Strait of Hormuz Corridor",
      from: "Persian Gulf Ports",
      to: "Jamnagar/Vadinar Refineries",
      riskLevel: "HIGH",
      riskScore: 72.0,
      volumeMbpd: 2.1,
      status: "RESTRICTED",
      waypoints: [
        [27.0, 50.0],
        [26.5, 56.3],
        [24.0, 59.0],
        [22.4, 69.8]
      ]
    },
    {
      id: "red_sea",
      name: "Red Sea Corridor",
      from: "Suez Canal / Yanbu",
      to: "Jamnagar Refinery",
      riskLevel: "HIGH",
      riskScore: 68.0,
      volumeMbpd: 0.9,
      status: "OPEN",
      waypoints: [
        [30.0, 32.5],
        [24.0, 38.0],
        [12.6, 43.3],
        [11.0, 50.0],
        [15.0, 62.0],
        [22.5, 70.0]
      ]
    },
    {
      id: "malacca",
      name: "Strait of Malacca Corridor",
      from: "East Asian Ports",
      to: "Paradip Port",
      riskLevel: "LOW",
      riskScore: 15.0,
      volumeMbpd: 0.3,
      status: "OPEN",
      waypoints: [
        [10.0, 95.0],
        [2.0, 98.0],
        [12.0, 88.0],
        [20.3, 86.7]
      ]
    },
    {
      id: "cape_good_hope",
      name: "Cape of Good Hope Route",
      from: "West African Ports / US Gulf",
      to: "Paradip Port",
      riskLevel: "LOW",
      riskScore: 20.0,
      volumeMbpd: 0.4,
      status: "OPEN",
      waypoints: [
        [-12.0, 22.0],
        [-12.0, 45.0],
        [0.0, 65.0],
        [20.3, 86.7]
      ]
    },
    {
      id: "persian_gulf",
      name: "Persian Gulf Corridor",
      from: "Basra Port",
      to: "Mangalore Refinery",
      riskLevel: "MODERATE",
      riskScore: 55.0,
      volumeMbpd: 1.8,
      status: "OPEN",
      waypoints: [
        [30.0, 48.0],
        [27.0, 51.0],
        [26.5, 56.3],
        [18.0, 65.0],
        [12.9, 74.8]
      ]
    }
  ]);
  console.log("Seeded shipping corridors.");

  console.log("Database seeded successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Failed to seed database:", err);
  process.exit(1);
});

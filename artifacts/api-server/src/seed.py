import os
import sys

# Ensure api-server is on path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

from src.database import engine, Base, SessionLocal
from src.models import (
    RiskScore, NewsSignal, SupplierRisk, ProcurementRecommendation,
    ReserveStatus, DigitalTwinNode, ShippingCorridor
)

def seed():
    print("Recreating database tables in Python...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("Database tables recreated.")

    db = SessionLocal()
    try:
        print("Inserting Risk Scores...")
        db.add_all([
            RiskScore(corridor="Strait of Hormuz", score=72.0, level="HIGH", trend="stable"),
            RiskScore(corridor="Red Sea", score=68.0, level="HIGH", trend="increasing"),
            RiskScore(corridor="Malacca Strait", score=15.0, level="LOW", trend="stable"),
            RiskScore(corridor="Cape of Good Hope", score=20.0, level="LOW", trend="stable"),
            RiskScore(corridor="Persian Gulf", score=55.0, level="MODERATE", trend="increasing")
        ])

        print("Inserting News Signals...")
        db.add_all([
            NewsSignal(
                headline="Maritime security tightened in Strait of Hormuz after tanker boarded",
                source="Lloyd's List",
                corridor="Strait of Hormuz",
                severity="HIGH",
                extracted_risk="Insurance premiums hike by 15% for Gulf-bound vessels. Rerouting considered."
            ),
            NewsSignal(
                headline="Drone swarm reported near Bab-el-Mandeb; commercial shipping warned",
                source="UKMTO",
                corridor="Red Sea",
                severity="CRITICAL",
                extracted_risk="Major container and tanker lines divert to Cape route. +12 days delay expected."
            ),
            NewsSignal(
                headline="Saudi Aramco Yanbu terminal expands crude loading operations",
                source="Platts",
                corridor="Red Sea",
                severity="MODERATE",
                extracted_risk="Yanbu loading volume rises to 2.5 MBPD. Mitigates Hormuz transit dependency."
            ),
            NewsSignal(
                headline="OPEC+ signals potential delay in production output rollback",
                source="Reuters",
                corridor="Persian Gulf",
                severity="MODERATE",
                extracted_risk="Spot market price spikes 3% on tighter supply outlook."
            )
        ])

        print("Inserting Supplier Risks...")
        db.add_all([
            SupplierRisk(
                supplier="Iraq State Oil",
                country="Iraq",
                share=25.0,
                risk_score=72.0,
                risk_level="HIGH",
                primary_route="Strait of Hormuz",
                notes="Primary grade: Basra Heavy. High dependency."
            ),
            SupplierRisk(
                supplier="Saudi Aramco",
                country="Saudi Arabia",
                share=18.0,
                risk_score=68.0,
                risk_level="HIGH",
                primary_route="Strait of Hormuz",
                notes="Yanbu terminal provides alternative exit."
            ),
            SupplierRisk(
                supplier="Rosneft",
                country="Russia",
                share=22.0,
                risk_score=30.0,
                risk_level="MODERATE",
                primary_route="Northern Sea / Baltic",
                notes="Urals grade. High freight discount."
            ),
            SupplierRisk(
                supplier="ADNOC",
                country="UAE",
                share=12.0,
                risk_score=55.0,
                risk_level="MODERATE",
                primary_route="Strait of Hormuz",
                notes="Murban grade. Strategic alternate pipeline."
            ),
            SupplierRisk(
                supplier="Chevron",
                country="United States",
                share=5.0,
                risk_score=15.0,
                risk_level="LOW",
                primary_route="Cape Route",
                notes="WTI Midland. High shipping time."
            )
        ])

        print("Inserting Procurement Recommendations...")
        db.add_all([
            ProcurementRecommendation(
                rank=1,
                supplier="ADNOC",
                country="UAE",
                route="Fujairah → Cape Guardafui → Lakshadweep → Paradip",
                spot_price=84.1,
                tanker_availability=0.92,
                port_congestion=0.82,
                grade_compatibility=0.95,
                overall_score=88.0,
                status="RECOMMENDED",
                reasoning="ADNOC's Fujairah export terminal unaffected. Murban grade compatible with Vadinar and Paradip. Recommend 30% volume increase on ADNOC contract for next 90 days."
            ),
            ProcurementRecommendation(
                rank=2,
                supplier="Saudi Aramco",
                country="Saudi Arabia",
                route="Yanbu → Suez → Red Sea → Jamnagar",
                spot_price=81.2,
                tanker_availability=0.85,
                port_congestion=0.78,
                grade_compatibility=0.90,
                overall_score=84.5,
                status="RECOMMENDED",
                reasoning="Saudi Aramco Red Sea terminal (Yanbu) partially viable. Routing via Suez adds 4 days transit but maintains refinery grade."
            ),
            ProcurementRecommendation(
                rank=3,
                supplier="Chevron",
                country="United States",
                route="Houston → Atlantic → Cape of Good Hope → Paradip",
                spot_price=79.8,
                tanker_availability=0.88,
                port_congestion=0.91,
                grade_compatibility=0.88,
                overall_score=78.2,
                status="VIABLE",
                reasoning="Hormuz closure eliminates direct Gulf access. US WTI and West African Bonny Light prioritized for grade compatibility with Jamnagar complex."
            ),
            ProcurementRecommendation(
                rank=4,
                supplier="Rosneft",
                country="Russia",
                route="Novorossiysk → Suez → Arabian Sea → Vadinar",
                spot_price=62.5,
                tanker_availability=0.72,
                port_congestion=0.65,
                grade_compatibility=0.75,
                overall_score=75.0,
                status="VIABLE",
                reasoning="Russian Urals available via Black Sea → Suez. Discounted pricing partially offsets rerouting costs. Grade adjustment required."
            ),
            ProcurementRecommendation(
                rank=5,
                supplier="NNPC",
                country="Nigeria",
                route="Bonny → Cape of Good Hope → Paradip",
                spot_price=87.3,
                tanker_availability=0.80,
                port_congestion=0.88,
                grade_compatibility=0.85,
                overall_score=72.1,
                status="VIABLE",
                reasoning="Standard procurement analysis for NNPC. Volume increase viable via Cape route."
            )
        ])

        print("Inserting Reserve Status...")
        db.add(ReserveStatus(
            current_days=9.5,
            capacity_days=14.0,
            fill_percent=67.8,
            drawdown_rate=0.0,
            recommended_action="Maintain current SPR levels. Monitor Hormuz risk indicators.",
            risk_of_depletion="LOW",
            replenishment_window="Next 90 days"
        ))

        print("Inserting Digital Twin Nodes...")
        db.add_all([
            DigitalTwinNode(
                id="hormuz_node",
                name="Strait of Hormuz",
                type="strait",
                lat=26.5,
                lon=56.3,
                risk_level="HIGH",
                details="Critical chokepoint. 40% of India's crude imports transit here."
            ),
            DigitalTwinNode(
                id="bab_el_mandeb",
                name="Bab-el-Mandeb",
                type="strait",
                lat=12.6,
                lon=43.3,
                risk_level="HIGH",
                details="Red Sea southern entry. Elevated threat from regional drone/missile activity."
            ),
            DigitalTwinNode(
                id="fujairah",
                name="Fujairah Port",
                type="terminal",
                lat=25.1,
                lon=56.3,
                risk_level="MODERATE",
                details="UAE bypass port on Gulf of Oman. Strategic alternative to Hormuz transit."
            ),
            DigitalTwinNode(
                id="yanbu",
                name="Yanbu Port",
                type="terminal",
                lat=24.0,
                lon=38.0,
                risk_level="MODERATE",
                details="Saudi Red Sea terminal. Key alternate routing point."
            ),
            DigitalTwinNode(
                id="cape",
                name="Cape Route",
                type="strait",
                lat=-12.0,
                lon=22.0,
                risk_level="LOW",
                details="Safe alternative shipping lane. Adds 12-14 days transit time to India."
            ),
            DigitalTwinNode(
                id="malacca",
                name="Strait of Malacca",
                type="strait",
                lat=2.0,
                lon=98.0,
                risk_level="LOW",
                details="East Asian trade gateway. Minimal risk to India-bound tankers."
            ),
            DigitalTwinNode(
                id="jamnagar",
                name="Reliance Jamnagar",
                type="refinery",
                lat=22.5,
                lon=70.0,
                risk_level="LOW",
                details="World's largest refining complex (1.24 MBPD capacity). Relies heavily on Middle East crudes."
            ),
            DigitalTwinNode(
                id="vadinar",
                name="Nayara Vadinar",
                type="refinery",
                lat=22.4,
                lon=69.7,
                risk_level="LOW",
                details="Critical refinery (400,000 BPD). Direct marine terminal access."
            ),
            DigitalTwinNode(
                id="paradip",
                name="IOCL Paradip",
                type="port",
                lat=20.3,
                lon=86.7,
                risk_level="LOW",
                details="East Coast energy hub. Major unloading port for Russian and West African crudes."
            ),
            DigitalTwinNode(
                id="mangalore",
                name="MRPL Mangalore",
                type="refinery",
                lat=12.9,
                lon=74.8,
                risk_level="LOW",
                details="West Coast refinery (300,000 BPD). Close proximity to Arabian Sea lanes."
            )
        ])

        print("Inserting Shipping Corridors...")
        db.add_all([
            ShippingCorridor(
                id="hormuz",
                name="Strait of Hormuz Corridor",
                from_="Persian Gulf Ports",
                to="Jamnagar/Vadinar Refineries",
                risk_level="HIGH",
                risk_score=72.0,
                volume_mbpd=2.1,
                status="RESTRICTED",
                waypoints=[[27.0, 50.0], [26.5, 56.3], [24.0, 59.0], [22.4, 69.8]]
            ),
            ShippingCorridor(
                id="red_sea",
                name="Red Sea Corridor",
                from_="Suez Canal / Yanbu",
                to="Jamnagar Refinery",
                risk_level="HIGH",
                risk_score=68.0,
                volume_mbpd=0.9,
                status="OPEN",
                waypoints=[[30.0, 32.5], [24.0, 38.0], [12.6, 43.3], [11.0, 50.0], [15.0, 62.0], [22.5, 70.0]]
            ),
            ShippingCorridor(
                id="malacca",
                name="Strait of Malacca Corridor",
                from_="East Asian Ports",
                to="Paradip Port",
                risk_level="LOW",
                risk_score=15.0,
                volume_mbpd=0.3,
                status="OPEN",
                waypoints=[[10.0, 95.0], [2.0, 98.0], [12.0, 88.0], [20.3, 86.7]]
            ),
            ShippingCorridor(
                id="cape_good_hope",
                name="Cape of Good Hope Route",
                from_="West African Ports / US Gulf",
                to="Paradip Port",
                risk_level="LOW",
                risk_score=20.0,
                volume_mbpd=0.4,
                status="OPEN",
                waypoints=[[-12.0, 22.0], [-12.0, 45.0], [0.0, 65.0], [20.3, 86.7]]
            ),
            ShippingCorridor(
                id="persian_gulf",
                name="Persian Gulf Corridor",
                from_="Basra Port",
                to="Mangalore Refinery",
                risk_level="MODERATE",
                risk_score=55.0,
                volume_mbpd=1.8,
                status="OPEN",
                waypoints=[[30.0, 48.0], [27.0, 51.0], [26.5, 56.3], [18.0, 65.0], [12.9, 74.8]]
            )
        ])

        db.commit()
        print("Database seeded successfully in Python!")
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed()

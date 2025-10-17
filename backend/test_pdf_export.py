"""
Test PDF export for simulation
"""
import sys
sys.path.insert(0, '/app')

from app.database import SessionLocal
from app.models.simulation import Simulation
from app.services.pdf_generator import PDFGenerator


def test_pdf():
    db = SessionLocal()

    try:
        # Get latest simulation
        sim = db.query(Simulation).order_by(Simulation.created_at.desc()).first()

        if not sim:
            print("❌ No simulations found in database")
            return

        print(f"📄 Testing PDF export for simulation #{sim.id}")
        print(f"   {sim.current_country} -> {sim.target_country}")
        print(f"   Created: {sim.created_at}")

        # Get simulation data
        simulation_data = sim.to_dict()
        print(f"\n✅ Simulation data retrieved")
        print(f"   Keys: {list(simulation_data.keys())}")

        # Generate HTML
        try:
            html_content = PDFGenerator.generate_simulation_report(
                simulation_data=simulation_data,
                user_info={"email": "test@example.com"}
            )
            print(f"\n✅ HTML generated ({len(html_content)} bytes)")
        except Exception as e:
            print(f"\n❌ HTML generation failed: {e}")
            import traceback
            traceback.print_exc()
            return

        # Test PDF conversion
        try:
            import asyncio
            pdf_bytes = asyncio.run(PDFGenerator.html_to_pdf(html_content))
            print(f"\n✅ PDF generated successfully ({len(pdf_bytes)} bytes)")

            # Save to test file
            with open("/tmp/test_simulation.pdf", "wb") as f:
                f.write(pdf_bytes)
            print(f"   Saved to /tmp/test_simulation.pdf")

        except Exception as e:
            print(f"\n❌ PDF generation failed: {e}")
            import traceback
            traceback.print_exc()

    finally:
        db.close()


if __name__ == "__main__":
    test_pdf()

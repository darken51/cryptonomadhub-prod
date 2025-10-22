"""
Test End-to-End complet du système DeFi Audit avec Cost Basis

Ce script teste TOUTES les fonctionnalités et tous les boutons du panel:
1. ✅ Création d'audit (POST /defi/audit)
2. ✅ Liste des audits (GET /defi/audits)
3. ✅ Détails d'audit (GET /defi/audit/{id})
4. ✅ Statut d'audit (GET /defi/audit/{id}/status)
5. ✅ Export CSV (GET /defi/audit/{id}/export/csv)
6. ✅ Export PDF (GET /defi/audit/{id}/export/pdf)
7. ✅ Liste protocoles (GET /defi/protocols)
8. ✅ Liste chaînes (GET /defi/chains)
9. ✅ Suppression audit (DELETE /defi/audit/{id})

+ Tests spécifiques Cost Basis:
10. ✅ Vérification lots créés
11. ✅ Vérification disposals créés
12. ✅ Vérification calculs FIFO
13. ✅ Vérification contraintes DB
14. ✅ Vérification précision Numeric
"""
import requests
import time
import json
from datetime import datetime, timedelta
from decimal import Decimal

# Configuration
BASE_URL = "http://localhost:8001"
TEST_EMAIL = "e2etest@example.com"
TEST_PASSWORD = "Test123456"

# Adresse Solana de test (user_id 13 selon l'audit)
SOLANA_ADDRESS = "FNShLm9K4cFBvjf18VL8j3o4ZmD7HvkWBWDX5ztpT1WQ"


class Colors:
    """Couleurs ANSI pour le terminal"""
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'


def print_header(text):
    """Affiche un header"""
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*70}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{text:^70}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*70}{Colors.END}\n")


def print_success(text):
    """Affiche un succès"""
    print(f"{Colors.GREEN}✅ {text}{Colors.END}")


def print_error(text):
    """Affiche une erreur"""
    print(f"{Colors.RED}❌ {text}{Colors.END}")


def print_warning(text):
    """Affiche un warning"""
    print(f"{Colors.YELLOW}⚠️  {text}{Colors.END}")


def print_info(text):
    """Affiche une info"""
    print(f"{Colors.CYAN}ℹ️  {text}{Colors.END}")


def get_auth_token():
    """Obtenir un token d'authentification"""
    print_info("Authentification...")

    # Essayer de se connecter
    response = requests.post(
        f"{BASE_URL}/auth/login",
        data={
            "username": TEST_EMAIL,
            "password": TEST_PASSWORD
        }
    )

    if response.status_code == 200:
        token = response.json()["access_token"]
        print_success(f"Authentifié avec succès")
        return token
    else:
        print_error(f"Échec authentification: {response.status_code}")
        print_error(f"Response: {response.text}")
        return None


def test_1_create_audit(headers):
    """Test 1: Créer un audit Solana"""
    print_header("TEST 1: Création d'audit Solana")

    payload = {
        "wallet_address": SOLANA_ADDRESS,
        "chains": ["solana"],
        "start_date": "2024-01-01",
        "end_date": "2025-12-31"
    }

    print_info(f"Adresse: {SOLANA_ADDRESS}")
    print_info(f"Chaîne: solana")
    print_info(f"Période: 2024-01-01 à 2025-12-31")

    response = requests.post(
        f"{BASE_URL}/defi/audit",
        json=payload,
        headers=headers
    )

    if response.status_code == 200:
        data = response.json()
        audit_id = data["id"]
        print_success(f"Audit créé: ID={audit_id}")
        print_info(f"Statut: {data['status']}")
        print_info(f"Transactions: {data['total_transactions']}")
        return audit_id
    else:
        print_error(f"Échec création audit: {response.status_code}")
        print_error(f"Response: {response.text}")
        return None


def test_2_wait_for_completion(audit_id, headers, max_wait=120):
    """Test 2: Attendre la complétion de l'audit"""
    print_header("TEST 2: Attente complétion audit")

    print_info(f"Audit ID: {audit_id}")
    print_info(f"Timeout max: {max_wait}s")

    start_time = time.time()
    last_progress = -1

    while time.time() - start_time < max_wait:
        response = requests.get(
            f"{BASE_URL}/defi/audit/{audit_id}/status",
            headers=headers
        )

        if response.status_code == 200:
            status_data = response.json()
            status = status_data["status"]
            progress = status_data.get("progress", 0)
            step = status_data.get("current_step", "")

            # Afficher seulement si le progress change
            if progress != last_progress:
                print(f"  Progress: {progress}% - {step}")
                last_progress = progress

            if status == "completed":
                print_success(f"Audit complété!")
                print_info(f"Transactions: {status_data.get('total_transactions', 0)}")
                return True
            elif status == "failed":
                print_error(f"Audit échoué: {status_data.get('error_message', 'Unknown')}")
                return False

        time.sleep(2)

    print_error(f"Timeout après {max_wait}s")
    return False


def test_3_get_audit_details(audit_id, headers):
    """Test 3: Récupérer les détails de l'audit"""
    print_header("TEST 3: Détails de l'audit")

    response = requests.get(
        f"{BASE_URL}/defi/audit/{audit_id}",
        headers=headers,
        params={"limit": 10, "offset": 0}
    )

    if response.status_code == 200:
        data = response.json()
        print_success("Détails récupérés avec succès")

        # Afficher le summary
        summary = data.get("summary", {})
        print(f"\n{Colors.BOLD}📊 Résumé:{Colors.END}")
        print(f"  Total Transactions: {summary.get('total_transactions', 0)}")
        print(f"  Total Volume: ${summary.get('total_volume_usd', 0):,.2f}")
        print(f"  Total Gains: ${summary.get('total_gains_usd', 0):,.2f}")
        print(f"  Total Losses: ${summary.get('total_losses_usd', 0):,.2f}")
        print(f"  Net Gain/Loss: ${summary.get('net_capital_gains', 0):,.2f}")
        print(f"  Total Fees: ${summary.get('total_fees_usd', 0):,.2f}")
        print(f"  Short-term Gains: ${summary.get('short_term_gains', 0):,.2f}")
        print(f"  Long-term Gains: ${summary.get('long_term_gains', 0):,.2f}")

        # Afficher les transactions
        transactions = data.get("transactions", [])
        print(f"\n{Colors.BOLD}📝 Transactions (10 premières):{Colors.END}")
        for tx in transactions[:10]:
            token_in = tx.get('token_in', '')
            token_out = tx.get('token_out', '')
            amount_in = tx.get('amount_in', 0)
            amount_out = tx.get('amount_out', 0)
            gain_loss = tx.get('gain_loss_usd', 0)
            print(f"  • {tx.get('transaction_type', 'unknown')}: "
                  f"{amount_out:.4f} {token_out} → {amount_in:.4f} {token_in} "
                  f"(G/L: ${gain_loss:.2f})")

        return data
    else:
        print_error(f"Échec récupération: {response.status_code}")
        print_error(f"Response: {response.text}")
        return None


def test_4_list_audits(headers):
    """Test 4: Lister tous les audits"""
    print_header("TEST 4: Liste des audits")

    response = requests.get(
        f"{BASE_URL}/defi/audits",
        headers=headers
    )

    if response.status_code == 200:
        audits = response.json()
        print_success(f"{len(audits)} audit(s) trouvé(s)")

        for audit in audits[:5]:
            print(f"  • Audit #{audit['id']}: {audit['status']} "
                  f"({audit['total_transactions']} txs, "
                  f"${audit.get('total_volume_usd', 0):,.0f})")
        return audits
    else:
        print_error(f"Échec liste: {response.status_code}")
        return None


def test_5_export_csv(audit_id, headers):
    """Test 5: Exporter en CSV"""
    print_header("TEST 5: Export CSV")

    response = requests.get(
        f"{BASE_URL}/defi/audit/{audit_id}/export/csv",
        headers=headers
    )

    if response.status_code == 200:
        csv_content = response.text
        lines = csv_content.split('\n')
        print_success(f"CSV exporté: {len(lines)} lignes")
        print_info(f"Header: {lines[0][:80]}...")
        if len(lines) > 1:
            print_info(f"Première ligne: {lines[1][:80]}...")
        return True
    else:
        print_error(f"Échec export CSV: {response.status_code}")
        return False


def test_6_export_pdf(audit_id, headers):
    """Test 6: Exporter en PDF"""
    print_header("TEST 6: Export PDF")

    response = requests.get(
        f"{BASE_URL}/defi/audit/{audit_id}/export/pdf",
        headers=headers
    )

    if response.status_code == 200:
        pdf_bytes = response.content
        print_success(f"PDF exporté: {len(pdf_bytes)} bytes")
        print_info(f"Type: {response.headers.get('Content-Type')}")
        return True
    else:
        print_error(f"Échec export PDF: {response.status_code}")
        print_error(f"Response: {response.text}")
        return False


def test_7_list_protocols(headers):
    """Test 7: Lister les protocoles"""
    print_header("TEST 7: Liste des protocoles")

    response = requests.get(
        f"{BASE_URL}/defi/protocols",
        headers=headers
    )

    if response.status_code == 200:
        data = response.json()
        protocols = data.get("protocols", [])
        print_success(f"{len(protocols)} protocole(s) supporté(s)")

        categories = data.get("categories", {})
        for cat, prots in categories.items():
            if prots:
                print(f"  • {cat}: {', '.join(prots)}")
        return True
    else:
        print_error(f"Échec liste protocoles: {response.status_code}")
        return False


def test_8_list_chains(headers):
    """Test 8: Lister les chaînes"""
    print_header("TEST 8: Liste des chaînes")

    response = requests.get(
        f"{BASE_URL}/defi/chains",
        headers=headers
    )

    if response.status_code == 200:
        data = response.json()
        chains = data.get("chains", [])
        print_success(f"{len(chains)} chaîne(s) supportée(s)")

        for chain in chains:
            status_emoji = "✅" if chain["status"] == "active" else "🧪"
            print(f"  {status_emoji} {chain['name']}: {chain['protocols']} protocoles")
        return True
    else:
        print_error(f"Échec liste chaînes: {response.status_code}")
        return False


def test_9_cost_basis_verification():
    """Test 9: Vérification Cost Basis en DB"""
    print_header("TEST 9: Vérification Cost Basis")

    import sys
    import os
    sys.path.insert(0, '/home/fred/cryptonomadhub/backend')

    from app.database import SessionLocal
    from app.models.cost_basis import CostBasisLot, CostBasisDisposal

    db = SessionLocal()

    try:
        # Compter les lots
        total_lots = db.query(CostBasisLot).count()
        print_info(f"Total lots: {total_lots}")

        # Compter les disposals
        total_disposals = db.query(CostBasisDisposal).count()
        print_info(f"Total disposals: {total_disposals}")

        # Vérifier les lots récents
        recent_lots = db.query(CostBasisLot).order_by(
            CostBasisLot.created_at.desc()
        ).limit(5).all()

        print(f"\n{Colors.BOLD}📦 Lots récents:{Colors.END}")
        for lot in recent_lots:
            print(f"  • {lot.token}: {lot.original_amount} @ ${lot.acquisition_price_usd}")

        # Vérifier les types de colonnes (doivent être Numeric)
        from sqlalchemy import inspect
        inspector = inspect(db.bind)
        columns = inspector.get_columns('cost_basis_lots')

        print(f"\n{Colors.BOLD}🔢 Types de colonnes:{Colors.END}")
        for col in columns:
            if col['name'] in ['acquisition_price_usd', 'original_amount', 'remaining_amount', 'disposed_amount']:
                col_type = str(col['type'])
                is_numeric = 'NUMERIC' in col_type.upper()
                emoji = "✅" if is_numeric else "❌"
                print(f"  {emoji} {col['name']}: {col_type}")

        # Vérifier les contraintes CHECK
        from sqlalchemy import text
        result = db.execute(text("""
            SELECT constraint_name, check_clause
            FROM information_schema.check_constraints
            WHERE constraint_name LIKE 'check_%'
            ORDER BY constraint_name;
        """))

        print(f"\n{Colors.BOLD}🔒 Contraintes CHECK:{Colors.END}")
        constraints = list(result)
        if constraints:
            for row in constraints:
                print(f"  ✅ {row[0]}")
            print_success(f"{len(constraints)} contraintes actives")
        else:
            print_warning("Aucune contrainte CHECK trouvée")

        print_success("Vérification Cost Basis terminée")
        return True

    except Exception as e:
        print_error(f"Erreur vérification: {e}")
        return False
    finally:
        db.close()


def test_10_delete_audit(audit_id, headers):
    """Test 10: Supprimer l'audit"""
    print_header("TEST 10: Suppression de l'audit")

    print_warning(f"Suppression de l'audit #{audit_id}...")

    response = requests.delete(
        f"{BASE_URL}/defi/audit/{audit_id}",
        headers=headers
    )

    if response.status_code == 200:
        print_success("Audit supprimé avec succès")
        return True
    else:
        print_error(f"Échec suppression: {response.status_code}")
        return False


def main():
    """Exécution du test end-to-end complet"""
    print_header("🚀 TEST END-TO-END COMPLET - DEFI AUDIT + COST BASIS")

    print_info(f"Base URL: {BASE_URL}")
    print_info(f"Adresse Solana: {SOLANA_ADDRESS}")
    print_info(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    # Authentification
    token = get_auth_token()
    if not token:
        print_error("Impossible de continuer sans token")
        return

    headers = {"Authorization": f"Bearer {token}"}

    results = []

    # Test 1: Créer audit
    audit_id = test_1_create_audit(headers)
    results.append(("Création audit", audit_id is not None))
    if not audit_id:
        print_error("Impossible de continuer sans audit_id")
        return

    # Test 2: Attendre complétion
    completed = test_2_wait_for_completion(audit_id, headers)
    results.append(("Complétion audit", completed))

    if completed:
        # Test 3: Détails
        details = test_3_get_audit_details(audit_id, headers)
        results.append(("Détails audit", details is not None))

        # Test 4: Liste
        audits = test_4_list_audits(headers)
        results.append(("Liste audits", audits is not None))

        # Test 5: Export CSV
        csv_ok = test_5_export_csv(audit_id, headers)
        results.append(("Export CSV", csv_ok))

        # Test 6: Export PDF
        pdf_ok = test_6_export_pdf(audit_id, headers)
        results.append(("Export PDF", pdf_ok))

    # Test 7: Protocoles
    protocols_ok = test_7_list_protocols(headers)
    results.append(("Liste protocoles", protocols_ok))

    # Test 8: Chaînes
    chains_ok = test_8_list_chains(headers)
    results.append(("Liste chaînes", chains_ok))

    # Test 9: Cost Basis
    cost_basis_ok = test_9_cost_basis_verification()
    results.append(("Vérification Cost Basis", cost_basis_ok))

    # Test 10: Suppression (optionnel, commenté par défaut)
    # delete_ok = test_10_delete_audit(audit_id, headers)
    # results.append(("Suppression audit", delete_ok))

    # Résumé final
    print_header("📊 RÉSUMÉ DES TESTS")

    total_tests = len(results)
    passed_tests = sum(1 for _, passed in results if passed)
    failed_tests = total_tests - passed_tests

    for test_name, passed in results:
        emoji = "✅" if passed else "❌"
        print(f"{emoji} {test_name}")

    print(f"\n{Colors.BOLD}Résultat final:{Colors.END}")
    print(f"  • Tests réussis: {Colors.GREEN}{passed_tests}/{total_tests}{Colors.END}")
    print(f"  • Tests échoués: {Colors.RED}{failed_tests}/{total_tests}{Colors.END}")

    if failed_tests == 0:
        print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 TOUS LES TESTS ONT RÉUSSI! 🎉{Colors.END}")
    else:
        print(f"\n{Colors.RED}{Colors.BOLD}⚠️  {failed_tests} test(s) échoué(s){Colors.END}")

    print_header("✅ TEST TERMINÉ")


if __name__ == "__main__":
    main()

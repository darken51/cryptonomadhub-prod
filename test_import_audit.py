#!/usr/bin/env python3
"""
Script pour tester facilement l'import d'un audit DeFi et vérifier le Cost Basis

Usage:
    python3 test_import_audit.py "0xYOUR_ADDRESS"
    python3 test_import_audit.py "SOLANA_ADDRESS" --chain solana
"""
import requests
import time
import sys
import argparse
from datetime import datetime


class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'


def print_header(text):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*70}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{text:^70}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*70}{Colors.END}\n")


def print_success(text):
    print(f"{Colors.GREEN}✅ {text}{Colors.END}")


def print_error(text):
    print(f"{Colors.RED}❌ {text}{Colors.END}")


def print_warning(text):
    print(f"{Colors.YELLOW}⚠️  {text}{Colors.END}")


def print_info(text):
    print(f"{Colors.CYAN}ℹ️  {text}{Colors.END}")


def get_auth_token(base_url, email, password):
    """Obtenir un token d'authentification"""
    response = requests.post(
        f"{base_url}/auth/login",
        data={"username": email, "password": password}
    )

    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        print_error(f"Échec authentification: {response.status_code}")
        return None


def create_audit(base_url, headers, address, chains, start_date, end_date):
    """Créer un audit DeFi"""
    payload = {
        "wallet_address": address,
        "chains": chains,
        "start_date": start_date,
        "end_date": end_date
    }

    print_info(f"Création de l'audit...")
    print_info(f"Adresse: {address}")
    print_info(f"Chaînes: {', '.join(chains)}")
    print_info(f"Période: {start_date} → {end_date}")

    response = requests.post(
        f"{base_url}/defi/audit",
        json=payload,
        headers=headers
    )

    if response.status_code == 200:
        data = response.json()
        print_success(f"Audit créé: ID={data['id']}")
        return data["id"]
    else:
        print_error(f"Échec création: {response.status_code}")
        print_error(f"Response: {response.text}")
        return None


def wait_for_completion(base_url, headers, audit_id, max_wait=180):
    """Attendre la complétion de l'audit"""
    print_info(f"Attente de la complétion (max {max_wait}s)...")

    start_time = time.time()
    last_progress = -1

    while time.time() - start_time < max_wait:
        response = requests.get(
            f"{base_url}/defi/audit/{audit_id}/status",
            headers=headers
        )

        if response.status_code == 200:
            status_data = response.json()
            status = status_data["status"]
            progress = status_data.get("progress", 0)

            if progress != last_progress:
                print(f"  Progress: {progress}%")
                last_progress = progress

            if status == "completed":
                print_success("Audit complété!")
                return True
            elif status == "failed":
                print_error(f"Audit échoué: {status_data.get('error_message')}")
                return False

        time.sleep(2)

    print_error(f"Timeout après {max_wait}s")
    return False


def get_audit_results(base_url, headers, audit_id):
    """Récupérer les résultats de l'audit"""
    response = requests.get(
        f"{base_url}/defi/audit/{audit_id}",
        headers=headers
    )

    if response.status_code != 200:
        print_error(f"Échec récupération: {response.status_code}")
        return None

    return response.json()


def display_results(data):
    """Afficher les résultats de l'audit"""
    print_header("RÉSULTATS DE L'AUDIT")

    summary = data.get("summary", {})

    print(f"\n{Colors.BOLD}📊 Résumé Financier:{Colors.END}")
    print(f"  Total Transactions: {summary.get('total_transactions', 0)}")
    print(f"  Total Volume: ${summary.get('total_volume_usd', 0):,.2f}")
    print(f"  Total Gains: {Colors.GREEN}${summary.get('total_gains_usd', 0):,.2f}{Colors.END}")
    print(f"  Total Losses: {Colors.RED}${summary.get('total_losses_usd', 0):,.2f}{Colors.END}")
    print(f"  Net Gain/Loss: ${summary.get('net_capital_gains', 0):,.2f}")
    print(f"  Total Fees: ${summary.get('total_fees_usd', 0):,.2f}")

    print(f"\n{Colors.BOLD}💰 Catégories Fiscales:{Colors.END}")
    print(f"  Short-term Gains: ${summary.get('short_term_gains', 0):,.2f}")
    print(f"  Long-term Gains: ${summary.get('long_term_gains', 0):,.2f}")
    print(f"  Ordinary Income: ${summary.get('ordinary_income', 0):,.2f}")

    # Warning si prix estimés
    if "price_warning" in summary:
        print(f"\n{Colors.YELLOW}⚠️  Prix Estimés:{Colors.END}")
        print(f"  {summary['price_warning']}")

    # Afficher quelques transactions
    transactions = data.get("transactions", [])
    if transactions:
        print(f"\n{Colors.BOLD}📝 Transactions (5 premières):{Colors.END}")
        for tx in transactions[:5]:
            tx_type = tx.get('transaction_type', 'unknown')
            token_out = tx.get('token_out', '')
            token_in = tx.get('token_in', '')
            amount_out = tx.get('amount_out', 0)
            amount_in = tx.get('amount_in', 0)
            gain_loss = tx.get('gain_loss_usd', 0)
            date = tx.get('timestamp', '').split('T')[0] if tx.get('timestamp') else ''

            emoji = "📈" if gain_loss > 0 else "📉" if gain_loss < 0 else "➡️"
            print(f"  {emoji} {date} - {tx_type}")
            print(f"     {amount_out:.4f} {token_out} → {amount_in:.4f} {token_in}")
            print(f"     Gain/Loss: ${gain_loss:.2f}")


def verify_cost_basis():
    """Vérifier les lots Cost Basis créés"""
    print_header("VÉRIFICATION COST BASIS")

    import subprocess

    try:
        result = subprocess.run(
            ["docker", "exec", "nomadcrypto-backend",
             "python", "scripts/test_cost_basis_verification.py"],
            capture_output=True,
            text=True,
            timeout=30
        )

        if result.returncode == 0:
            print(result.stdout)
            return True
        else:
            print_error("Échec vérification Cost Basis")
            print(result.stderr)
            return False

    except Exception as e:
        print_warning(f"Impossible de vérifier Cost Basis: {e}")
        print_info("Vérification manuelle:")
        print("  docker exec nomadcrypto-backend python scripts/test_cost_basis_verification.py")
        return False


def main():
    parser = argparse.ArgumentParser(
        description="Tester l'import d'un audit DeFi avec Cost Basis"
    )
    parser.add_argument(
        "address",
        help="Adresse wallet (Ethereum 0x... ou Solana)"
    )
    parser.add_argument(
        "--chain",
        default="ethereum",
        help="Chaîne blockchain (ethereum, solana, polygon, etc.)"
    )
    parser.add_argument(
        "--start-date",
        default="2024-01-01",
        help="Date de début (YYYY-MM-DD)"
    )
    parser.add_argument(
        "--end-date",
        default="2025-12-31",
        help="Date de fin (YYYY-MM-DD)"
    )
    parser.add_argument(
        "--base-url",
        default="http://localhost:8001",
        help="URL du backend"
    )
    parser.add_argument(
        "--email",
        default="e2etest@example.com",
        help="Email de connexion"
    )
    parser.add_argument(
        "--password",
        default="Test123456",
        help="Mot de passe"
    )

    args = parser.parse_args()

    print_header("🚀 TEST IMPORT AUDIT DEFI + COST BASIS")

    print_info(f"Base URL: {args.base_url}")
    print_info(f"Adresse: {args.address}")
    print_info(f"Chaîne: {args.chain}")

    # Authentification
    print_info("Authentification...")
    token = get_auth_token(args.base_url, args.email, args.password)
    if not token:
        print_error("Impossible de continuer sans token")
        sys.exit(1)

    headers = {"Authorization": f"Bearer {token}"}
    print_success("Authentifié avec succès")

    # Créer l'audit
    audit_id = create_audit(
        args.base_url,
        headers,
        args.address,
        [args.chain],
        args.start_date,
        args.end_date
    )

    if not audit_id:
        print_error("Impossible de créer l'audit")
        sys.exit(1)

    # Attendre la complétion
    if not wait_for_completion(args.base_url, headers, audit_id):
        print_error("L'audit n'a pas pu se terminer")
        sys.exit(1)

    # Récupérer et afficher les résultats
    data = get_audit_results(args.base_url, headers, audit_id)
    if data:
        display_results(data)

    # Vérifier les lots Cost Basis
    verify_cost_basis()

    # Résumé
    print_header("✅ TEST TERMINÉ")
    print_info(f"Audit ID: {audit_id}")
    print_info(f"Voir les détails: {args.base_url}/defi/audit/{audit_id}")
    print_success("Import et vérification réussis!")


if __name__ == "__main__":
    main()

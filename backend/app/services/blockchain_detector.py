"""
Blockchain Auto-Detection Service

Automatically detects which blockchain a wallet address belongs to.
Supports EVM, Solana, Bitcoin, and 50+ chains.
"""

import re
import logging
from typing import Optional, List, Tuple
from enum import Enum

logger = logging.getLogger(__name__)


class BlockchainType(str, Enum):
    """Blockchain types"""
    EVM = "evm"
    SOLANA = "solana"
    BITCOIN = "bitcoin"
    UNKNOWN = "unknown"


class ChainDetector:
    """Auto-detect blockchain from wallet address"""

    # EVM chains (all use 0x addresses)
    EVM_CHAINS = [
        "ethereum", "polygon", "bsc", "arbitrum", "optimism",
        "avalanche", "fantom", "base", "gnosis", "celo",
        "moonbeam", "moonriver", "aurora", "harmony",
        "cronos", "evmos", "kava", "metis", "boba",
        "fuse", "okx", "polygon_zkevm", "zksync", "linea",
        "scroll", "mantle", "blast", "mode", "zora"
    ]

    # Solana chains
    SOLANA_CHAINS = ["solana"]

    # Bitcoin chains
    BITCOIN_CHAINS = ["bitcoin", "litecoin", "dogecoin", "bitcoin_cash"]

    @classmethod
    def detect_blockchain_type(cls, address: str) -> BlockchainType:
        """
        Detect the blockchain type from address format

        Args:
            address: Wallet address

        Returns:
            BlockchainType enum
        """
        address = address.strip()

        # EVM: 0x + 40 hex chars
        if re.match(r'^0x[a-fA-F0-9]{40}$', address):
            return BlockchainType.EVM

        # Solana: base58, 32-44 chars
        if re.match(r'^[1-9A-HJ-NP-Za-km-z]{32,44}$', address):
            return BlockchainType.SOLANA

        # Bitcoin: Various formats
        # Legacy (P2PKH): starts with 1
        if re.match(r'^1[a-km-zA-HJ-NP-Z1-9]{25,34}$', address):
            return BlockchainType.BITCOIN

        # SegWit (P2SH): starts with 3
        if re.match(r'^3[a-km-zA-HJ-NP-Z1-9]{25,34}$', address):
            return BlockchainType.BITCOIN

        # Native SegWit (Bech32): starts with bc1
        if re.match(r'^bc1[a-z0-9]{39,59}$', address.lower()):
            return BlockchainType.BITCOIN

        return BlockchainType.UNKNOWN

    @classmethod
    def get_possible_chains(cls, address: str) -> List[str]:
        """
        Get list of possible chains for this address

        Args:
            address: Wallet address

        Returns:
            List of possible chain names
        """
        blockchain_type = cls.detect_blockchain_type(address)

        if blockchain_type == BlockchainType.EVM:
            return cls.EVM_CHAINS
        elif blockchain_type == BlockchainType.SOLANA:
            return cls.SOLANA_CHAINS
        elif blockchain_type == BlockchainType.BITCOIN:
            return cls.BITCOIN_CHAINS
        else:
            return []

    @classmethod
    def validate_address_format(cls, address: str, chain: Optional[str] = None) -> Tuple[bool, str]:
        """
        Validate address format and optionally match with chain

        Args:
            address: Wallet address
            chain: Expected chain (optional)

        Returns:
            (is_valid, error_message)
        """
        address = address.strip()
        blockchain_type = cls.detect_blockchain_type(address)

        if blockchain_type == BlockchainType.UNKNOWN:
            return False, "Invalid address format. Supported: EVM (0x...), Solana, Bitcoin"

        # If chain specified, verify compatibility
        if chain:
            chain_lower = chain.lower()
            possible_chains = cls.get_possible_chains(address)

            if chain_lower not in possible_chains:
                return False, f"Address format doesn't match chain '{chain}'. This looks like a {blockchain_type.value} address."

        return True, ""

    @classmethod
    def normalize_address(cls, address: str, chain: str) -> str:
        """
        Normalize address (checksum for EVM, etc.)

        Args:
            address: Wallet address
            chain: Blockchain name

        Returns:
            Normalized address
        """
        address = address.strip()
        blockchain_type = cls.detect_blockchain_type(address)

        # EVM: Convert to checksum address
        if blockchain_type == BlockchainType.EVM:
            try:
                from eth_utils import to_checksum_address, is_address
                if is_address(address):
                    return to_checksum_address(address)
            except ImportError:
                # Fallback: lowercase
                return address.lower()

        # Bitcoin Bech32: lowercase
        if blockchain_type == BlockchainType.BITCOIN and address.startswith('bc1'):
            return address.lower()

        # Others: return as-is
        return address

    @classmethod
    def get_chain_info(cls, chain: str) -> dict:
        """
        Get metadata about a chain

        Args:
            chain: Chain name

        Returns:
            Chain metadata
        """
        chain_lower = chain.lower()

        CHAIN_INFO = {
            # EVM Mainnets
            "ethereum": {
                "name": "Ethereum",
                "type": BlockchainType.EVM,
                "chain_id": 1,
                "symbol": "ETH",
                "rpc_url": "https://cloudflare-eth.com",
                "explorer": "https://etherscan.io"
            },
            "polygon": {
                "name": "Polygon",
                "type": BlockchainType.EVM,
                "chain_id": 137,
                "symbol": "MATIC",
                "rpc_url": "https://polygon-rpc.com",
                "explorer": "https://polygonscan.com"
            },
            "bsc": {
                "name": "BNB Smart Chain",
                "type": BlockchainType.EVM,
                "chain_id": 56,
                "symbol": "BNB",
                "rpc_url": "https://bsc-dataseed.binance.org",
                "explorer": "https://bscscan.com"
            },
            "arbitrum": {
                "name": "Arbitrum One",
                "type": BlockchainType.EVM,
                "chain_id": 42161,
                "symbol": "ETH",
                "rpc_url": "https://arb1.arbitrum.io/rpc",
                "explorer": "https://arbiscan.io"
            },
            "optimism": {
                "name": "Optimism",
                "type": BlockchainType.EVM,
                "chain_id": 10,
                "symbol": "ETH",
                "rpc_url": "https://mainnet.optimism.io",
                "explorer": "https://optimistic.etherscan.io"
            },
            "avalanche": {
                "name": "Avalanche C-Chain",
                "type": BlockchainType.EVM,
                "chain_id": 43114,
                "symbol": "AVAX",
                "rpc_url": "https://api.avax.network/ext/bc/C/rpc",
                "explorer": "https://snowtrace.io"
            },
            "base": {
                "name": "Base",
                "type": BlockchainType.EVM,
                "chain_id": 8453,
                "symbol": "ETH",
                "rpc_url": "https://mainnet.base.org",
                "explorer": "https://basescan.org"
            },
            "fantom": {
                "name": "Fantom",
                "type": BlockchainType.EVM,
                "chain_id": 250,
                "symbol": "FTM",
                "rpc_url": "https://rpc.ftm.tools",
                "explorer": "https://ftmscan.com"
            },
            "gnosis": {
                "name": "Gnosis Chain",
                "type": BlockchainType.EVM,
                "chain_id": 100,
                "symbol": "XDAI",
                "rpc_url": "https://rpc.gnosischain.com",
                "explorer": "https://gnosisscan.io"
            },
            "zksync": {
                "name": "zkSync Era",
                "type": BlockchainType.EVM,
                "chain_id": 324,
                "symbol": "ETH",
                "rpc_url": "https://mainnet.era.zksync.io",
                "explorer": "https://explorer.zksync.io"
            },
            "linea": {
                "name": "Linea",
                "type": BlockchainType.EVM,
                "chain_id": 59144,
                "symbol": "ETH",
                "rpc_url": "https://rpc.linea.build",
                "explorer": "https://lineascan.build"
            },
            "scroll": {
                "name": "Scroll",
                "type": BlockchainType.EVM,
                "chain_id": 534352,
                "symbol": "ETH",
                "rpc_url": "https://rpc.scroll.io",
                "explorer": "https://scrollscan.com"
            },
            "blast": {
                "name": "Blast",
                "type": BlockchainType.EVM,
                "chain_id": 81457,
                "symbol": "ETH",
                "rpc_url": "https://rpc.blast.io",
                "explorer": "https://blastscan.io"
            },
            # Solana
            "solana": {
                "name": "Solana",
                "type": BlockchainType.SOLANA,
                "chain_id": None,
                "symbol": "SOL",
                "rpc_url": "https://api.mainnet-beta.solana.com",
                "explorer": "https://solscan.io"
            },
            # Bitcoin
            "bitcoin": {
                "name": "Bitcoin",
                "type": BlockchainType.BITCOIN,
                "chain_id": None,
                "symbol": "BTC",
                "rpc_url": None,
                "explorer": "https://blockchair.com/bitcoin"
            },
        }

        return CHAIN_INFO.get(chain_lower, {
            "name": chain.title(),
            "type": BlockchainType.UNKNOWN,
            "chain_id": None,
            "symbol": "UNKNOWN",
            "rpc_url": None,
            "explorer": None
        })

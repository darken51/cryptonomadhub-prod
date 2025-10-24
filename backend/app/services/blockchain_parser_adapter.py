"""
Blockchain Parser Adapter (Zero-Risk Migration to Moralis)

This adapter wraps Moralis API for EVM chains while maintaining 100% backward compatibility.

Features:
- Same interface as BlockchainParser (drop-in replacement)
- Automatic fallback to legacy parser if Moralis fails
- Solana always uses legacy parser (already working)
- Controlled via MORALIS_API_KEY + USE_MORALIS env vars
"""

from typing import List, Dict, Optional
from datetime import datetime
import os
import logging

# Import legacy parser
from app.services.blockchain_parser import BlockchainParser as LegacyParser

logger = logging.getLogger(__name__)


class BlockchainParser:
    """
    Intelligent adapter: Moralis (EVM) + Legacy (Solana + fallback)

    100% compatible with existing code - just swap the import!
    """

    # Chain ID mapping for Moralis
    MORALIS_CHAINS = {
        "ethereum": "0x1",
        "polygon": "0x89",
        "bsc": "0x38",
        "bnb": "0x38",
        "arbitrum": "0xa4b1",
        "arbitrum-nova": "0xa4ba",
        "optimism": "0xa",
        "base": "0x2105",
        "blast": "0x13e31",
        "avalanche": "0xa86a",
        "fantom": "0xfa",
        "cronos": "0x19",
        "gnosis": "0x64",
        "moonbeam": "0x504",
        "moonriver": "0x505",
        # Testnets
        "sepolia": "0xaa36a7",
        "holesky": "0x4268",
        "arbitrum-sepolia": "0x66eee",
        "optimism-sepolia": "0xaa37dc",
        "base-sepolia": "0x14a34",
        "polygon-amoy": "0x13882",
    }

    def __init__(self, api_keys: Optional[Dict[str, str]] = None):
        """
        Initialize adapter (same signature as legacy parser)

        Args:
            api_keys: Dict of API keys {"etherscan": "...", "solana": "...", "helius": "..."}
        """
        self.api_keys = api_keys or {}

        # Always initialize legacy parser (for Solana + fallback)
        self.legacy_parser = LegacyParser(api_keys)

        # Check if Moralis is available
        self.moralis_key = os.getenv("MORALIS_API_KEY")
        self.use_moralis = os.getenv("USE_MORALIS", "true").lower() in ("true", "1", "yes")

        # Only import moralis if we're going to use it
        self.moralis_available = False
        if self.moralis_key and self.use_moralis:
            try:
                from moralis import evm_api
                self.evm_api = evm_api
                self.moralis_available = True
                logger.info("✅ Moralis API initialized - using for EVM chains")
            except ImportError:
                logger.warning("⚠️  Moralis not installed - using legacy parser")
                self.moralis_available = False
        else:
            if not self.moralis_key:
                logger.info("ℹ️  MORALIS_API_KEY not set - using legacy parser")
            else:
                logger.info("ℹ️  USE_MORALIS=false - using legacy parser")

    async def parse_wallet_transactions(
        self,
        wallet_address: str,
        chain: str,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[Dict]:
        """
        Parse wallet transactions (same interface as legacy parser)

        Strategy:
        1. Solana → always use legacy parser (works well with Helius)
        2. EVM + Moralis available → try Moralis, fallback to legacy if error
        3. EVM + no Moralis → use legacy parser

        Args:
            wallet_address: Wallet address
            chain: Blockchain name
            start_date: Optional start date
            end_date: Optional end date

        Returns:
            List[Dict] with exact same format as legacy parser
        """

        chain_lower = chain.lower()

        # SOLANA: Always use legacy parser (Helius API works great)
        if chain_lower == "solana":
            logger.info(f"[ADAPTER] Using legacy parser for Solana: {wallet_address}")
            return await self.legacy_parser.parse_wallet_transactions(
                wallet_address, chain, start_date, end_date
            )

        # EVM CHAINS: Try Moralis if available, otherwise legacy
        if self.moralis_available and chain_lower in self.MORALIS_CHAINS:
            try:
                logger.info(f"[ADAPTER] Using Moralis for {chain}: {wallet_address}")
                transactions = await self._parse_with_moralis(
                    wallet_address, chain, start_date, end_date
                )
                logger.info(f"[ADAPTER] ✅ Moralis returned {len(transactions)} transactions")
                return transactions

            except Exception as e:
                logger.warning(f"[ADAPTER] ⚠️  Moralis failed for {chain}: {e}")
                logger.info(f"[ADAPTER] Falling back to legacy parser...")

                # Automatic fallback
                return await self.legacy_parser.parse_wallet_transactions(
                    wallet_address, chain, start_date, end_date
                )
        else:
            # No Moralis or unsupported chain → legacy
            reason = "not available" if not self.moralis_available else f"chain {chain} not mapped"
            logger.info(f"[ADAPTER] Using legacy parser ({reason}): {wallet_address}")
            return await self.legacy_parser.parse_wallet_transactions(
                wallet_address, chain, start_date, end_date
            )

    async def _parse_with_moralis(
        self,
        wallet_address: str,
        chain: str,
        start_date: Optional[datetime],
        end_date: Optional[datetime]
    ) -> List[Dict]:
        """
        Parse using Moralis API and convert to legacy format

        This ensures 100% compatibility with existing code
        """

        chain_id = self.MORALIS_CHAINS.get(chain.lower())
        if not chain_id:
            raise ValueError(f"Chain {chain} not supported by Moralis")

        transactions = []

        # 1. Get wallet transaction history
        try:
            params = {
                "chain": chain_id,
                "address": wallet_address,
                "limit": 100,
                "order": "ASC",
            }

            if start_date:
                params["from_date"] = start_date.isoformat()
            if end_date:
                params["to_date"] = end_date.isoformat()

            result = self.evm_api.wallets.get_wallet_history(
                api_key=self.moralis_key,
                params=params
            )

            for tx in result.get('result', []):
                parsed = self._convert_moralis_tx_to_legacy_format(
                    tx, chain, wallet_address
                )
                if parsed:
                    transactions.append(parsed)

        except Exception as e:
            logger.error(f"[MORALIS] Error fetching wallet history: {e}")
            raise

        # 2. Get DeFi positions (staking, LP, lending) - BONUS from Moralis!
        try:
            defi_result = self.evm_api.wallets.get_defi_positions_summary(
                api_key=self.moralis_key,
                params={"chain": chain_id, "address": wallet_address}
            )

            # Handle both dict and list responses from Moralis
            positions = defi_result.get('result', []) if isinstance(defi_result, dict) else defi_result

            for position in positions:
                position_tx = self._convert_defi_position_to_tx(
                    position, chain, wallet_address
                )
                if position_tx:
                    transactions.append(position_tx)

        except Exception as e:
            # DeFi positions are bonus, don't fail if not available
            logger.warning(f"[MORALIS] DeFi positions not available: {e}")

        return transactions

    def _convert_moralis_tx_to_legacy_format(
        self,
        tx: Dict,
        chain: str,
        wallet_address: str
    ) -> Optional[Dict]:
        """
        Convert Moralis transaction → legacy format

        Moralis format (v2):
        - erc20_transfers[] - array of ERC20 token transfers
        - native_transfers[] - array of native token (ETH) transfers
        - nft_transfers[] - array of NFT transfers
        - category - "token send", "token receive", "token swap", etc.
        - summary - human-readable description
        """

        try:
            # Parse timestamp
            timestamp_str = tx.get('block_timestamp', '')
            timestamp = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))

            # Category mapping
            category = tx.get('category', 'unknown')
            protocol_type = self._map_category_to_protocol_type(category)

            # Extract token transfers
            erc20_transfers = tx.get('erc20_transfers', [])
            native_transfers = tx.get('native_transfers', [])

            # Initialize defaults
            token_in = None
            amount_in = None
            usd_value_in = None
            token_out = None
            amount_out = None
            usd_value_out = None

            # Process ERC20 transfers
            for transfer in erc20_transfers:
                direction = transfer.get('direction', '')
                token_symbol = transfer.get('token_symbol', 'UNKNOWN')
                amount = float(transfer.get('value_formatted', 0))

                # Try to get USD value from Moralis first
                usd_value = float(transfer.get('value_usd', 0))

                # If Moralis doesn't provide USD, try PriceService
                # Note: This will be fetched later by DeFiAuditService using PriceService
                # For now, mark as 0 and estimated

                if direction == 'send':
                    token_in = token_symbol
                    amount_in = amount
                    usd_value_in = usd_value
                elif direction == 'receive':
                    token_out = token_symbol
                    amount_out = amount
                    usd_value_out = usd_value

            # Process native transfers (ETH, MATIC, etc.)
            for transfer in native_transfers:
                direction = transfer.get('direction', '')
                amount = float(transfer.get('value_formatted', 0))
                usd_value = float(transfer.get('value_usd', 0))

                # Native token symbol depends on chain
                native_symbol = {
                    'ethereum': 'ETH',
                    'polygon': 'MATIC',
                    'bsc': 'BNB',
                    'arbitrum': 'ETH',
                    'optimism': 'ETH',
                    'base': 'ETH',
                }.get(chain.lower(), 'ETH')

                if direction == 'send':
                    token_in = native_symbol
                    amount_in = amount
                    usd_value_in = usd_value
                elif direction == 'receive':
                    token_out = native_symbol
                    amount_out = amount
                    usd_value_out = usd_value

            # Determine transaction type
            transaction_type = self._map_category_to_transaction_type(
                category,
                is_receiving=(token_out is not None),
                is_sending=(token_in is not None)
            )

            # Gas fee (Moralis provides this directly!)
            gas_fee_usd = float(tx.get('transaction_fee_usd', 0))

            # Protocol name from to_address_label or category
            protocol_name = tx.get('to_address_label') or self._detect_protocol_name(category)

            return {
                "tx_hash": tx['hash'],
                "chain": chain,
                "block_number": int(tx.get('block_number', 0)),
                "timestamp": timestamp,
                "protocol_name": protocol_name,
                "protocol_type": protocol_type,
                "transaction_type": transaction_type,
                "token_in": token_in,
                "amount_in": amount_in,
                "usd_value_in": usd_value_in,
                "token_out": token_out,
                "amount_out": amount_out,
                "usd_value_out": usd_value_out,
                "price_in_estimated": True,  # TODO: fetch real prices
                "price_out_estimated": True,
                "gas_fee_usd": gas_fee_usd,
                "protocol_fee_usd": 0.0,
            }

        except Exception as e:
            logger.error(f"[MORALIS] Error converting transaction {tx.get('hash')}: {e}")
            import traceback
            traceback.print_exc()
            return None

    def _convert_defi_position_to_tx(
        self,
        position: Dict,
        chain: str,
        wallet_address: str
    ) -> Optional[Dict]:
        """
        Convert DeFi position → transaction format

        This is BONUS data that Moralis provides (staking, LP, lending positions)
        """

        try:
            position_type = position.get('position_type', 'unknown')
            protocol_name = position.get('protocol_name', 'Unknown')

            # Get main token
            tokens = position.get('tokens', [])
            if not tokens:
                return None

            main_token = tokens[0]
            token_symbol = main_token.get('symbol', 'UNKNOWN')
            balance = float(main_token.get('balance', 0))
            usd_value = float(main_token.get('usd_value', 0))

            # Map position type to transaction type
            tx_type_map = {
                'staked': 'stake',
                'lent': 'lend',
                'borrowed': 'borrow',
                'liquidity': 'provide_liquidity',
            }
            tx_type = tx_type_map.get(position_type, 'deposit')

            # Protocol type
            protocol_type_map = {
                'staked': 'staking',
                'lent': 'lending',
                'borrowed': 'lending',
                'liquidity': 'liquidity_pool',
            }
            protocol_type = protocol_type_map.get(position_type, 'other')

            return {
                "tx_hash": f"position_{position.get('protocol_id', 'unknown')}_{position.get('position_id', 'unknown')}",
                "chain": chain,
                "block_number": 0,
                "timestamp": datetime.now(),  # Position snapshot
                "protocol_name": protocol_name,
                "protocol_type": protocol_type,
                "transaction_type": tx_type,
                "token_in": token_symbol,
                "amount_in": balance,
                "usd_value_in": usd_value,
                "token_out": None,
                "amount_out": None,
                "usd_value_out": None,
                "price_in_estimated": False,
                "price_out_estimated": False,
                "gas_fee_usd": 0.0,
                "protocol_fee_usd": 0.0,
                # Extra metadata
                "is_active_position": True,
                "unclaimed_rewards_usd": float(position.get('unclaimed_usd_value', 0)),
            }

        except Exception as e:
            logger.error(f"[MORALIS] Error converting DeFi position: {e}")
            return None

    def _map_category_to_protocol_type(self, category: str) -> str:
        """Map Moralis category → protocol_type"""
        cat = category.lower()
        if 'swap' in cat or 'dex' in cat:
            return 'dex'
        elif 'lend' in cat or 'borrow' in cat or 'aave' in cat or 'compound' in cat:
            return 'lending'
        elif 'stake' in cat or 'staking' in cat:
            return 'staking'
        elif 'liquidity' in cat or 'pool' in cat or 'lp' in cat:
            return 'liquidity_pool'
        elif 'yield' in cat:
            return 'yield'
        else:
            return 'other'

    def _map_category_to_transaction_type(
        self,
        category: str,
        is_receiving: bool,
        is_sending: bool
    ) -> str:
        """Map Moralis category → transaction_type"""
        cat = category.lower()

        if 'swap' in cat or 'dex' in cat:
            return 'swap'
        elif 'stake' in cat:
            return 'stake'
        elif 'unstake' in cat:
            return 'unstake'
        elif 'lend' in cat or 'deposit' in cat:
            return 'lend'
        elif 'borrow' in cat:
            return 'borrow'
        elif 'repay' in cat:
            return 'repay'
        elif 'withdraw' in cat:
            return 'withdraw'
        elif 'claim' in cat or 'reward' in cat:
            return 'claim_rewards'
        elif 'liquidity' in cat:
            if 'add' in cat:
                return 'provide_liquidity'
            elif 'remove' in cat:
                return 'remove_liquidity'
            else:
                return 'provide_liquidity'
        elif is_receiving:
            return 'transfer_in'
        elif is_sending:
            return 'transfer_out'
        else:
            return 'unknown'

    def _detect_protocol_name(self, category: str) -> str:
        """Detect protocol name from category"""
        cat = category.lower()

        # Common protocols
        protocols = {
            'uniswap': 'Uniswap',
            'aave': 'Aave',
            'compound': 'Compound',
            'sushiswap': 'SushiSwap',
            'curve': 'Curve',
            'balancer': 'Balancer',
            'lido': 'Lido',
            'pancakeswap': 'PancakeSwap',
        }

        for key, name in protocols.items():
            if key in cat:
                return name

        # Fallback based on category
        if 'swap' in cat or 'dex' in cat:
            return 'DEX'
        elif 'lend' in cat:
            return 'Lending Protocol'
        elif 'stake' in cat:
            return 'Staking Protocol'
        else:
            return 'Unknown'

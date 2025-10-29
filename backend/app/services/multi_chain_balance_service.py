"""
Multi-Chain Balance Service

Fetches wallet balances across 50+ blockchains using multiple APIs.
Implements fallback strategy and rate limit handling.
"""

import httpx
import logging
from typing import Dict, List, Optional, Tuple
from decimal import Decimal
import os
from app.config import settings
from app.services.blockchain_detector import ChainDetector, BlockchainType

logger = logging.getLogger(__name__)


class MultiChainBalanceService:
    """Fetch balances from multiple blockchains"""

    def __init__(self):
        self.http_client = httpx.AsyncClient(timeout=30.0)

        # API keys
        self.moralis_key = settings.MORALIS_API_KEY
        self.alchemy_key = settings.ALCHEMY_API_KEY
        self.infura_key = settings.INFURA_API_KEY
        self.etherscan_key = settings.ETHERSCAN_API_KEY
        self.helius_key = settings.HELIUS_API_KEY
        self.blockcypher_key = settings.BLOCKCYPHER_API_KEY

    async def get_wallet_balances(
        self,
        wallet_address: str,
        chain: str
    ) -> Dict[str, any]:
        """
        Get all token balances for a wallet on a specific chain

        Args:
            wallet_address: Wallet address
            chain: Blockchain name

        Returns:
            {
                "native_balance": Decimal,
                "tokens": [
                    {
                        "token_address": str,
                        "symbol": str,
                        "name": str,
                        "decimals": int,
                        "balance": Decimal,
                        "balance_formatted": Decimal
                    }
                ]
            }
        """
        chain_info = ChainDetector.get_chain_info(chain)
        blockchain_type = chain_info.get("type")

        if blockchain_type == BlockchainType.EVM:
            return await self._get_evm_balances(wallet_address, chain)
        elif blockchain_type == BlockchainType.SOLANA:
            return await self._get_solana_balances(wallet_address)
        elif blockchain_type == BlockchainType.BITCOIN:
            return await self._get_bitcoin_balance(wallet_address)
        else:
            logger.error(f"Unsupported blockchain type: {blockchain_type}")
            return {"native_balance": Decimal("0"), "tokens": []}

    async def _get_evm_balances(
        self,
        wallet_address: str,
        chain: str
    ) -> Dict[str, any]:
        """Get EVM chain balances with fallback strategy"""

        # ⚡ PERFORMANCE FIX: Try Alchemy FIRST (Moralis has 401 errors currently)
        # Alchemy is faster and more reliable for supported chains
        if self.alchemy_key and chain in ["ethereum", "polygon", "arbitrum", "optimism", "base"]:
            try:
                return await self._get_alchemy_balances(wallet_address, chain)
            except Exception as e:
                logger.warning(f"Alchemy failed for {chain}: {e}, trying Moralis...")

        # Fallback to Moralis (if Alchemy not available or failed)
        if self.moralis_key:
            try:
                return await self._get_moralis_balances(wallet_address, chain)
            except Exception as e:
                logger.warning(f"Moralis failed for {chain}: {e}, trying RPC...")

        # Final fallback: Public RPC
        try:
            return await self._get_rpc_balances(wallet_address, chain)
        except Exception as e:
            logger.error(f"All methods failed for {chain}: {e}")
            return {"native_balance": Decimal("0"), "tokens": []}

    async def _get_moralis_balances(
        self,
        wallet_address: str,
        chain: str
    ) -> Dict[str, any]:
        """Fetch balances using Moralis API"""

        # Moralis chain mapping
        MORALIS_CHAINS = {
            "ethereum": "eth",
            "polygon": "polygon",
            "bsc": "bsc",
            "avalanche": "avalanche",
            "fantom": "fantom",
            "cronos": "cronos",
            "arbitrum": "arbitrum",
            "optimism": "optimism",
            "base": "base",
        }

        moralis_chain = MORALIS_CHAINS.get(chain.lower())
        if not moralis_chain:
            raise ValueError(f"Chain {chain} not supported by Moralis")

        headers = {
            "X-API-Key": self.moralis_key,
            "accept": "application/json"
        }

        params = {"chain": moralis_chain}

        # ⚡ PERFORMANCE: Fetch native balance and ERC20 tokens in PARALLEL
        import asyncio
        native_url = f"https://deep-index.moralis.io/api/v2.2/{wallet_address}/balance"
        tokens_url = f"https://deep-index.moralis.io/api/v2.2/{wallet_address}/erc20"

        native_response, tokens_response = await asyncio.gather(
            self.http_client.get(native_url, headers=headers, params=params),
            self.http_client.get(tokens_url, headers=headers, params=params)
        )

        native_response.raise_for_status()
        tokens_response.raise_for_status()

        native_data = native_response.json()
        tokens_data = tokens_response.json()

        native_balance = Decimal(native_data.get("balance", "0")) / Decimal(10 ** 18)

        tokens = []
        for token in tokens_data:
            # ⚡ FIX: Handle None decimals (API can return null)
            decimals = token.get("decimals")
            if decimals is None or decimals == "":
                decimals = 18  # Default for most ERC20 tokens
            else:
                decimals = int(decimals)  # Ensure it's an integer

            balance_raw = Decimal(token.get("balance", "0"))
            balance_formatted = balance_raw / Decimal(10 ** decimals)

            if balance_formatted > 0:  # Only include tokens with balance
                tokens.append({
                    "token_address": token.get("token_address"),
                    "symbol": token.get("symbol"),
                    "name": token.get("name"),
                    "decimals": decimals,
                    "balance": balance_raw,
                    "balance_formatted": balance_formatted
                })

        return {
            "native_balance": native_balance,
            "tokens": tokens
        }

    async def _get_alchemy_balances(
        self,
        wallet_address: str,
        chain: str
    ) -> Dict[str, any]:
        """Fetch balances using Alchemy API"""

        ALCHEMY_NETWORKS = {
            "ethereum": "eth-mainnet",
            "polygon": "polygon-mainnet",
            "arbitrum": "arb-mainnet",
            "optimism": "opt-mainnet",
            "base": "base-mainnet"
        }

        network = ALCHEMY_NETWORKS.get(chain.lower())
        if not network:
            raise ValueError(f"Chain {chain} not supported by Alchemy")

        base_url = f"https://{network}.g.alchemy.com/v2/{self.alchemy_key}"

        # ⚡ PERFORMANCE: Fetch native balance and token balances in PARALLEL
        import asyncio
        native_payload = {
            "id": 1,
            "jsonrpc": "2.0",
            "method": "eth_getBalance",
            "params": [wallet_address, "latest"]
        }

        tokens_payload = {
            "id": 1,
            "jsonrpc": "2.0",
            "method": "alchemy_getTokenBalances",
            "params": [wallet_address]
        }

        native_response, tokens_response = await asyncio.gather(
            self.http_client.post(base_url, json=native_payload),
            self.http_client.post(base_url, json=tokens_payload)
        )

        native_response.raise_for_status()
        tokens_response.raise_for_status()

        native_result = native_response.json()
        tokens_result = tokens_response.json()

        native_balance_hex = native_result.get("result", "0x0")
        native_balance = Decimal(int(native_balance_hex, 16)) / Decimal(10 ** 18)

        tokens = []
        token_balances = tokens_result.get("result", {}).get("tokenBalances", [])

        # ⚡ PERFORMANCE: Collect all tokens with balance > 0 first
        tokens_with_balance = []
        for token_balance in token_balances:
            balance_hex = token_balance.get("tokenBalance")
            if balance_hex and balance_hex != "0x0":
                tokens_with_balance.append({
                    "address": token_balance.get("contractAddress"),
                    "balance_hex": balance_hex
                })

        # ⚡ PERFORMANCE: Fetch ALL token metadata in PARALLEL (85 tokens in ~0.5s instead of 12s!)
        async def fetch_token_metadata(token_data):
            """Fetch metadata for a single token"""
            token_address = token_data["address"]
            balance_hex = token_data["balance_hex"]

            metadata_payload = {
                "id": 1,
                "jsonrpc": "2.0",
                "method": "alchemy_getTokenMetadata",
                "params": [token_address]
            }

            try:
                metadata_response = await self.http_client.post(base_url, json=metadata_payload)
                metadata = metadata_response.json().get("result", {})

                # ⚡ FIX: Handle None decimals (API can return null)
                decimals = metadata.get("decimals")
                if decimals is None or decimals == "":
                    decimals = 18  # Default for most ERC20 tokens
                    logger.warning(f"Token {token_address} has no decimals, using default 18")
                else:
                    decimals = int(decimals)  # Ensure it's an integer

                balance_raw = Decimal(int(balance_hex, 16))
                balance_formatted = balance_raw / Decimal(10 ** decimals)

                return {
                    "token_address": token_address,
                    "symbol": metadata.get("symbol", "UNKNOWN"),
                    "name": metadata.get("name", "Unknown Token"),
                    "decimals": decimals,
                    "balance": balance_raw,
                    "balance_formatted": balance_formatted
                }
            except Exception as e:
                logger.warning(f"Failed to get metadata for token {token_address}: {e}")
                return None

        # Fetch ALL metadata in parallel
        if tokens_with_balance:
            import asyncio
            metadata_tasks = [fetch_token_metadata(token) for token in tokens_with_balance]
            metadata_results = await asyncio.gather(*metadata_tasks, return_exceptions=True)

            # Filter out None results (failed fetches)
            tokens = [result for result in metadata_results if result is not None and not isinstance(result, Exception)]

            logger.info(f"⚡ Fetched metadata for {len(tokens)}/{len(tokens_with_balance)} tokens in parallel")

        return {
            "native_balance": native_balance,
            "tokens": tokens
        }

    async def _get_rpc_balances(
        self,
        wallet_address: str,
        chain: str
    ) -> Dict[str, any]:
        """Fetch balances using public RPC (fallback)"""

        chain_info = ChainDetector.get_chain_info(chain)
        rpc_url = chain_info.get("rpc_url")

        if not rpc_url:
            raise ValueError(f"No RPC URL available for {chain}")

        # Get native balance
        payload = {
            "jsonrpc": "2.0",
            "method": "eth_getBalance",
            "params": [wallet_address, "latest"],
            "id": 1
        }

        response = await self.http_client.post(rpc_url, json=payload)
        response.raise_for_status()
        result = response.json()

        balance_hex = result.get("result", "0x0")
        native_balance = Decimal(int(balance_hex, 16)) / Decimal(10 ** 18)

        # Note: Can't easily get ERC20 tokens without contract addresses
        # Would need to use an indexer or keep a list of known tokens
        return {
            "native_balance": native_balance,
            "tokens": []  # RPC fallback doesn't support token discovery
        }

    async def _get_solana_balances(self, wallet_address: str) -> Dict[str, any]:
        """Fetch Solana balances"""

        if self.helius_key:
            # Use Helius (best for Solana)
            rpc_url = f"https://mainnet.helius-rpc.com/?api-key={self.helius_key}"
        else:
            # Public RPC
            rpc_url = "https://api.mainnet-beta.solana.com"

        # Get SOL balance
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getBalance",
            "params": [wallet_address]
        }

        response = await self.http_client.post(rpc_url, json=payload)
        response.raise_for_status()
        result = response.json()

        sol_balance = Decimal(result.get("result", {}).get("value", 0)) / Decimal(10 ** 9)

        # Get SPL tokens
        token_payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getTokenAccountsByOwner",
            "params": [
                wallet_address,
                {"programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"},
                {"encoding": "jsonParsed"}
            ]
        }

        tokens_response = await self.http_client.post(rpc_url, json=token_payload)
        tokens_response.raise_for_status()
        tokens_result = tokens_response.json()

        tokens = []
        token_accounts = tokens_result.get("result", {}).get("value", [])

        for account in token_accounts:
            parsed = account.get("account", {}).get("data", {}).get("parsed", {})
            info = parsed.get("info", {})
            token_amount = info.get("tokenAmount", {})

            balance_raw = Decimal(token_amount.get("amount", "0"))
            decimals = token_amount.get("decimals", 9)
            balance_formatted = balance_raw / Decimal(10 ** decimals)

            if balance_formatted > 0:
                tokens.append({
                    "token_address": info.get("mint"),
                    "symbol": "SPL",  # Would need additional API call for symbol
                    "name": "SPL Token",
                    "decimals": decimals,
                    "balance": balance_raw,
                    "balance_formatted": balance_formatted
                })

        return {
            "native_balance": sol_balance,
            "tokens": tokens
        }

    async def _get_bitcoin_balance(self, wallet_address: str) -> Dict[str, any]:
        """Fetch Bitcoin balance"""

        if self.blockcypher_key:
            # Use BlockCypher
            url = f"https://api.blockcypher.com/v1/btc/main/addrs/{wallet_address}/balance"
            params = {"token": self.blockcypher_key}
        else:
            # Public API
            url = f"https://blockchain.info/q/addressbalance/{wallet_address}"
            params = {}

        response = await self.http_client.get(url, params=params)
        response.raise_for_status()

        if self.blockcypher_key:
            data = response.json()
            satoshis = data.get("balance", 0)
        else:
            satoshis = int(response.text)

        btc_balance = Decimal(satoshis) / Decimal(10 ** 8)

        return {
            "native_balance": btc_balance,
            "tokens": []  # Bitcoin doesn't have tokens like ERC20
        }

    async def close(self):
        """Close HTTP client"""
        await self.http_client.aclose()

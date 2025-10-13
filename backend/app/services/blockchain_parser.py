"""
Blockchain Transaction Parser

Parses blockchain transactions and extracts DeFi activity
"""

from typing import List, Dict, Optional, Tuple
from datetime import datetime
from decimal import Decimal
import logging
import httpx
from app.services.price_service import PriceService
from app.services.transaction_decoder import TransactionDecoder

logger = logging.getLogger(__name__)


class BlockchainParser:
    """
    Parse blockchain transactions from various chains

    Supports: Ethereum, Polygon, BSC, Arbitrum, Optimism
    """

    # Known DeFi protocol addresses (Ethereum mainnet examples)
    PROTOCOL_ADDRESSES = {
        # Uniswap V3
        "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45": {"name": "Uniswap V3 Router", "type": "dex"},
        "0xe592427a0aece92de3edee1f18e0157c05861564": {"name": "Uniswap V3 SwapRouter", "type": "dex"},
        "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984": {"name": "Uniswap Token", "type": "token"},

        # Uniswap Universal Router (multi-chain)
        "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad": {"name": "Uniswap Universal Router", "type": "dex"},

        # Uniswap V2 (très utilisé!)
        "0x7a250d5630b4cf539739df2c5dacb4c659f2488d": {"name": "Uniswap V2 Router", "type": "dex"},
        "0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f": {"name": "Uniswap V2 Factory", "type": "dex"},

        # Sushiswap
        "0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f": {"name": "Sushiswap Router", "type": "dex"},
        "0xc0aee478e3658e2610c5f7a4a2e1777ce9e4f2ac": {"name": "Sushiswap Factory", "type": "dex"},

        # Aave V3
        "0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2": {"name": "Aave V3 Pool", "type": "lending"},

        # Aave V2 (legacy)
        "0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9": {"name": "Aave V2 Pool", "type": "lending"},

        # Compound V3
        "0xc3d688b66703497daa19211eedff47f25384cdc3": {"name": "Compound V3 USDC", "type": "lending"},

        # Compound V2 (legacy)
        "0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b": {"name": "Compound V2 Comptroller", "type": "lending"},

        # Curve
        "0x99a58482bd75cbab83b27ec03ca68ff489b5788f": {"name": "Curve Router", "type": "dex"},
        "0xf5f5b97624542d72a9e06f04804bf81baa15e2b4": {"name": "Curve 3Pool", "type": "dex"},

        # Convex
        "0xf403c135812408bfbe8713b5a23a04b3d48aae31": {"name": "Convex Booster", "type": "yield"},

        # 1inch
        "0x1111111254fb6c44bac0bed2854e76f90643097d": {"name": "1inch V4 Router", "type": "dex"},

        # Balancer
        "0xba12222222228d8ba445958a75a0704d566bf2c8": {"name": "Balancer Vault", "type": "dex"},

        # Lido
        "0xae7ab96520de3a18e5e111b5eaab095312d7fe84": {"name": "Lido stETH", "type": "staking"},

        # MakerDAO
        "0x5ef30b9986345249bc32d8928b7ee64de9435e39": {"name": "MakerDAO CDP Manager", "type": "lending"},
    }

    # Method signatures for common DeFi operations
    METHOD_SIGNATURES = {
        # ERC20 Standard
        "0xa9059cbb": "transfer",
        "0x095ea7b3": "approve",
        "0x23b872dd": "transferFrom",

        # Uniswap V2
        "0x38ed1739": "swapExactTokensForTokens",
        "0x7ff36ab5": "swapExactETHForTokens",
        "0x18cbafe5": "swapExactTokensForETH",
        "0x5c11d795": "swapExactTokensForTokensSupportingFeeOnTransferTokens",
        "0xfb3bdb41": "swapETHForExactTokens",
        "0x8803dbee": "swapTokensForExactTokens",

        # Uniswap V3
        "0x04e45aaf": "exactInputSingle",
        "0xb858183f": "exactInput",
        "0xdb3e2198": "exactOutputSingle",
        "0x09b81346": "exactOutput",

        # Aave
        "0xe8eda9df": "deposit",
        "0x69328dec": "withdraw",
        "0xa415bcad": "borrow",
        "0x573ade81": "repay",

        # Compound
        "0xa0712d68": "mint",
        "0xdb006a75": "redeem",
        "0xc5ebeaec": "borrow",
        "0x0e752702": "repay",

        # Staking
        "0xa694fc3a": "stake",
        "0x2e1a7d4d": "withdraw",
        "0x3d18b912": "getReward",

        # Liquidity
        "0xe8e33700": "addLiquidity",
        "0xf305d719": "addLiquidityETH",
        "0xbaa2abde": "removeLiquidity",
        "0x02751cec": "removeLiquidityETH",
    }

    def __init__(self, api_keys: Optional[Dict[str, str]] = None):
        """
        Initialize parser

        Args:
            api_keys: Optional dict of API keys for blockchain explorers
                     {"etherscan": "...", "polygonscan": "...", "bscscan": "..."}
        """
        self.api_keys = api_keys or {}
        self.price_service = PriceService()
        self.transaction_decoder = TransactionDecoder()

    async def parse_wallet_transactions(
        self,
        wallet_address: str,
        chain: str,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[Dict]:
        """
        Parse all transactions for a wallet address

        Args:
            wallet_address: Wallet address to parse
            chain: Blockchain (ethereum, polygon, bsc, arbitrum, optimism)
            start_date: Optional start date filter
            end_date: Optional end date filter

        Returns:
            List of parsed transaction dicts
        """
        print(f"[PARSER] Parsing wallet {wallet_address} on {chain}")
        logger.info(f"Parsing wallet {wallet_address} on {chain}")

        transactions = []

        # Solana uses different API
        if chain.lower() == "solana":
            return await self._parse_solana_transactions(wallet_address, start_date, end_date)

        # Map chain to API endpoint and key
        chain_config = self._get_chain_config(chain)
        if not chain_config:
            print(f"[PARSER] Chain {chain} not supported")
            logger.warning(f"Chain {chain} not supported")
            return transactions

        api_key = self.api_keys.get(chain_config["key_name"])
        if not api_key:
            print(f"[PARSER] No API key found for {chain}")
            logger.warning(f"No API key found for {chain}")
            return transactions

        print(f"[PARSER] API key found, calling {chain_config['url']}")

        # Fetch transactions from blockchain explorer
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                url = chain_config["url"]
                params = {
                    "chainid": chain_config["chainid"],
                    "module": "account",
                    "action": "txlist",
                    "address": wallet_address,
                    "startblock": 0,
                    "endblock": 99999999,
                    "sort": "asc",
                    "apikey": api_key
                }

                print(f"[PARSER] Fetching transactions from {url}")
                logger.info(f"Fetching transactions from {url}")
                response = await client.get(url, params=params)
                response.raise_for_status()

                data = response.json()
                print(f"[PARSER] API response status: {data.get('status')}")

                if data.get("status") != "1":
                    error_msg = data.get('message', 'Unknown error')
                    result = data.get('result', '')
                    print(f"[PARSER] API error: {error_msg} - {result}")
                    logger.error(f"Etherscan API error: {error_msg} - {result}")
                    logger.error(f"Full API response: {data}")
                    return transactions

                raw_txs = data.get("result", [])
                print(f"[PARSER] Fetched {len(raw_txs)} raw transactions")
                logger.info(f"Fetched {len(raw_txs)} raw transactions")

                # Parse each transaction
                for tx in raw_txs:
                    # Filter by date if specified
                    tx_timestamp = datetime.fromtimestamp(int(tx.get("timeStamp", 0)))
                    if start_date and tx_timestamp < start_date:
                        continue
                    if end_date and tx_timestamp > end_date:
                        continue

                    parsed = self._parse_transaction(tx, chain)
                    if parsed:
                        transactions.append(parsed)

        except httpx.HTTPError as e:
            logger.error(f"HTTP error fetching transactions: {e}")
        except Exception as e:
            logger.error(f"Error parsing transactions: {e}")

        logger.info(f"Found {len(transactions)} DeFi transactions")
        return transactions

    def _get_chain_config(self, chain: str) -> Optional[Dict]:
        """
        Get API configuration for a blockchain

        Single Etherscan API key works for 50+ chains via v2 API
        """
        configs = {
            # Ethereum & Testnets
            "ethereum": {"chainid": 1},
            "sepolia": {"chainid": 11155111},
            "holesky": {"chainid": 17000},

            # Layer 2s
            "arbitrum": {"chainid": 42161},
            "arbitrum-nova": {"chainid": 42170},
            "optimism": {"chainid": 10},
            "base": {"chainid": 8453},
            "blast": {"chainid": 81457},
            "scroll": {"chainid": 534352},
            "zksync": {"chainid": 324},
            "linea": {"chainid": 59144},
            "mantle": {"chainid": 5000},
            "taiko": {"chainid": 167000},

            # Alternative L1s
            "polygon": {"chainid": 137},
            "bsc": {"chainid": 56},
            "bnb": {"chainid": 56},  # Alias for BSC
            "avalanche": {"chainid": 43114},
            "fantom": {"chainid": 250},
            "cronos": {"chainid": 25},
            "gnosis": {"chainid": 100},
            "celo": {"chainid": 42220},
            "moonbeam": {"chainid": 1284},
            "moonriver": {"chainid": 1285},

            # Emerging Chains
            "abstract": {"chainid": 2741},
            "apechain": {"chainid": 33139},
            "berachain": {"chainid": 80094},
            "fraxtal": {"chainid": 252},
            "sei": {"chainid": 1329},
            "sonic": {"chainid": 146},
            "sophon": {"chainid": 50104},
            "unichain": {"chainid": 130},
            "world": {"chainid": 480},

            # Testnets (popular)
            "arbitrum-sepolia": {"chainid": 421614},
            "optimism-sepolia": {"chainid": 11155420},
            "base-sepolia": {"chainid": 84532},
            "polygon-amoy": {"chainid": 80002},
            "avalanche-fuji": {"chainid": 43113},
        }

        chain_info = configs.get(chain.lower())
        if not chain_info:
            return None

        # All chains use the same Etherscan v2 API endpoint with different chainid
        return {
            "url": "https://api.etherscan.io/v2/api",
            "key_name": "etherscan",
            "chainid": chain_info["chainid"]
        }

    def _parse_transaction(self, raw_tx: Dict, chain: str) -> Optional[Dict]:
        """
        Parse a single raw transaction

        Args:
            raw_tx: Raw transaction data from blockchain API
            chain: Blockchain name

        Returns:
            Parsed transaction dict (returns ALL transactions, not just DeFi)
        """
        # Extract basic info
        tx_hash = raw_tx.get("hash")
        from_address = raw_tx.get("from", "").lower()
        to_address = raw_tx.get("to", "").lower()
        input_data = raw_tx.get("input", "")
        value = raw_tx.get("value", "0")
        timestamp = datetime.fromtimestamp(int(raw_tx.get("timeStamp", 0)))

        # Check if it's a known DeFi protocol
        protocol_info = self.PROTOCOL_ADDRESSES.get(to_address)

        # Extract method signature (first 10 characters of input)
        method_sig = input_data[:10] if len(input_data) >= 10 else None
        method_name = self.METHOD_SIGNATURES.get(method_sig, "unknown")

        # Calculate USD values
        native_token = self.price_service.get_native_token(chain)
        usd_value = None
        gas_fee_usd = None

        # Calculate transaction value in USD (if native token transfer)
        if value and value != "0":
            usd_value = self.price_service.wei_to_usd(
                wei_amount=value,
                token_symbol=native_token,
                timestamp=timestamp,
                decimals=18
            )

        # Calculate gas fees in USD
        gas_used = raw_tx.get("gasUsed")
        gas_price = raw_tx.get("gasPrice")
        if gas_used and gas_price:
            total_gas_wei = str(int(gas_used) * int(gas_price))
            gas_fee_usd = self.price_service.wei_to_usd(
                wei_amount=total_gas_wei,
                token_symbol=native_token,
                timestamp=timestamp,
                decimals=18
            )

        # Decode transaction to extract token and amount data
        token_in = None
        token_out = None
        amount_in = None
        amount_out = None

        if input_data and len(input_data) >= 10:
            try:
                decoded = self.transaction_decoder.decode_transaction(input_data, value)

                if "error" not in decoded:
                    operation = decoded.get("operation")

                    if operation == "swap":
                        token_in = decoded.get("token_in")
                        token_out = decoded.get("token_out")
                        amount_in = Decimal(str(decoded.get("amount_in", 0))) if decoded.get("amount_in") else None
                        amount_out = Decimal(str(decoded.get("amount_out_min", 0))) if decoded.get("amount_out_min") else None

                    elif operation == "transfer":
                        # For ERC20 transfers
                        token_symbol = self.transaction_decoder._get_token_symbol(to_address)
                        token_out = token_symbol
                        amount_out = Decimal(str(decoded.get("amount", 0))) if decoded.get("amount") else None

            except Exception as e:
                logger.error(f"Error decoding transaction {tx_hash}: {e}")

        if protocol_info:
            # It's a known DeFi protocol
            tx_type = self._determine_transaction_type(method_name, protocol_info["type"])

            return {
                "tx_hash": tx_hash,
                "chain": chain,
                "from_address": from_address,
                "to_address": to_address,
                "protocol_name": protocol_info["name"],
                "protocol_type": protocol_info["type"],
                "transaction_type": tx_type,
                "timestamp": timestamp,
                "method": method_name,
                "value": value,
                "token_in": token_in,
                "token_out": token_out,
                "amount_in": float(amount_in) if amount_in else None,
                "amount_out": float(amount_out) if amount_out else None,
                "usd_value_in": float(usd_value) if usd_value else None,
                "gas_fee_usd": float(gas_fee_usd) if gas_fee_usd else None,
                "is_defi": True,
                "raw_data": raw_tx
            }
        else:
            # Not a known protocol, but still show it
            # Try to identify transaction type from method signature
            tx_type = "transfer" if value != "0" else "contract_interaction"

            # Check if it's a token transfer (ERC20)
            if method_sig == "0xa9059cbb":  # transfer(address,uint256)
                tx_type = "token_transfer"
            elif method_sig == "0x095ea7b3":  # approve(address,uint256)
                tx_type = "token_approval"

            return {
                "tx_hash": tx_hash,
                "chain": chain,
                "from_address": from_address,
                "to_address": to_address,
                "protocol_name": "Unknown",
                "protocol_type": "unknown",
                "transaction_type": tx_type,
                "timestamp": timestamp,
                "method": method_name,
                "value": value,
                "token_in": token_in,
                "token_out": token_out,
                "amount_in": float(amount_in) if amount_in else None,
                "amount_out": float(amount_out) if amount_out else None,
                "usd_value_in": float(usd_value) if usd_value else None,
                "gas_fee_usd": float(gas_fee_usd) if gas_fee_usd else None,
                "is_defi": False,
                "raw_data": raw_tx
            }

    def _determine_transaction_type(self, method_name: str, protocol_type: str) -> str:
        """Determine high-level transaction type"""

        if "swap" in method_name.lower():
            return "swap"
        elif "deposit" in method_name.lower() or "mint" in method_name.lower():
            if protocol_type == "dex":
                return "provide_liquidity"
            else:
                return "lend"
        elif "withdraw" in method_name.lower() or "redeem" in method_name.lower():
            if protocol_type == "dex":
                return "remove_liquidity"
            else:
                return "withdraw"
        elif "borrow" in method_name.lower():
            return "borrow"
        elif "repay" in method_name.lower():
            return "repay"
        elif "stake" in method_name.lower():
            return "stake"
        elif "getreward" in method_name.lower():
            return "claim_rewards"
        else:
            return "unknown"

    async def _parse_solana_transactions(
        self,
        wallet_address: str,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[Dict]:
        """
        Parse Solana transactions using Helius/Solscan API

        Args:
            wallet_address: Solana wallet address (base58)
            start_date: Optional start date filter
            end_date: Optional end date filter

        Returns:
            List of parsed transaction dicts
        """
        print(f"[PARSER] Parsing Solana wallet {wallet_address}")
        logger.info(f"Parsing Solana wallet {wallet_address}")

        transactions = []

        api_key = self.api_keys.get("solana")
        if not api_key:
            print(f"[PARSER] No Solana API key found")
            logger.warning(f"No Solana API key found")
            return transactions

        # Helius API endpoint
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                url = f"https://api.helius.xyz/v0/addresses/{wallet_address}/transactions"
                params = {
                    "api-key": api_key,
                    "type": "SWAP"  # Focus on DeFi swaps
                }

                print(f"[PARSER] Fetching Solana transactions from Helius API")
                logger.info(f"Fetching Solana transactions from {url}")

                response = await client.get(url, params=params)
                response.raise_for_status()

                data = response.json()
                raw_txs = data if isinstance(data, list) else []

                print(f"[PARSER] Fetched {len(raw_txs)} Solana transactions")
                logger.info(f"Fetched {len(raw_txs)} Solana transactions")

                # Parse Solana transactions (simplified for now)
                for tx in raw_txs:
                    # Filter by date if specified
                    tx_timestamp = datetime.fromtimestamp(tx.get("timestamp", 0))
                    if start_date and tx_timestamp < start_date:
                        continue
                    if end_date and tx_timestamp > end_date:
                        continue

                    # Check if it's a DeFi transaction (has swap/protocol info)
                    if tx.get("type") in ["SWAP", "TRANSFER"]:
                        parsed = {
                            "tx_hash": tx.get("signature"),
                            "chain": "solana",
                            "protocol_name": tx.get("source", "Unknown"),
                            "protocol_type": "dex",
                            "transaction_type": "swap",
                            "timestamp": tx_timestamp,
                            "method": "swap",
                            "raw_data": tx
                        }
                        transactions.append(parsed)

        except httpx.HTTPError as e:
            print(f"[PARSER] HTTP error fetching Solana transactions: {e}")
            logger.error(f"HTTP error fetching Solana transactions: {e}")
        except Exception as e:
            print(f"[PARSER] Error parsing Solana transactions: {e}")
            logger.error(f"Error parsing Solana transactions: {e}")

        print(f"[PARSER] Found {len(transactions)} Solana DeFi transactions")
        logger.info(f"Found {len(transactions)} Solana DeFi transactions")
        return transactions

    async def parse_single_transaction(
        self,
        tx_hash: str,
        chain: str
    ) -> Optional[Dict]:
        """
        Parse a single transaction by hash

        Args:
            tx_hash: Transaction hash
            chain: Blockchain name

        Returns:
            Parsed transaction dict or None
        """
        logger.info(f"Parsing transaction {tx_hash} on {chain}")

        # TODO: Fetch transaction details from blockchain API
        # For now, return demo structure

        return None

    def decode_token_transfer(self, log: Dict) -> Optional[Tuple[str, str, Decimal]]:
        """
        Decode ERC20 transfer event from transaction log

        Args:
            log: Transaction log entry

        Returns:
            Tuple of (from_address, to_address, amount) or None
        """
        # ERC20 Transfer event signature
        TRANSFER_EVENT_SIG = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"

        topics = log.get("topics", [])
        if not topics or topics[0] != TRANSFER_EVENT_SIG:
            return None

        # Topics: [signature, from, to]
        # Data: amount
        if len(topics) < 3:
            return None

        from_address = "0x" + topics[1][-40:]  # Last 40 chars (20 bytes)
        to_address = "0x" + topics[2][-40:]

        # Decode amount from data field
        data = log.get("data", "0x")
        try:
            amount = int(data, 16)
            # Convert from wei to token decimals (assuming 18 decimals)
            amount_decimal = Decimal(amount) / Decimal(10 ** 18)
        except (ValueError, TypeError):
            amount_decimal = Decimal(0)

        return (from_address, to_address, amount_decimal)

    def get_token_info(self, token_address: str, chain: str) -> Optional[Dict]:
        """
        Get token metadata (symbol, decimals, name)

        Args:
            token_address: Token contract address
            chain: Blockchain name

        Returns:
            Dict with token info or None
        """
        # TODO: Implement token info lookup
        # This would call the ERC20 contract methods: symbol(), decimals(), name()

        return {
            "address": token_address,
            "symbol": "UNKNOWN",
            "decimals": 18,
            "name": "Unknown Token"
        }

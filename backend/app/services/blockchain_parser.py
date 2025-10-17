"""
Blockchain Transaction Parser

Parses blockchain transactions and extracts DeFi activity
"""

from typing import List, Dict, Optional, Tuple
from datetime import datetime
from decimal import Decimal
import logging
import httpx
import asyncio
from app.services.price_service import PriceService
from app.services.transaction_decoder import TransactionDecoder

logger = logging.getLogger(__name__)


class BlockchainParser:
    """
    Parse blockchain transactions from various chains

    Supports: Ethereum, Polygon, BSC, Arbitrum, Optimism
    """

    # Common ERC20 Token Addresses (multi-chain)
    TOKEN_ADDRESSES = {
        # Ethereum Mainnet Tokens
        "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": {"symbol": "USDC", "name": "USD Coin", "decimals": 6, "chain": "ethereum"},
        "0xdac17f958d2ee523a2206206994597c13d831ec7": {"symbol": "USDT", "name": "Tether USD", "decimals": 6, "chain": "ethereum"},
        "0x6b175474e89094c44da98b954eedeac495271d0f": {"symbol": "DAI", "name": "Dai Stablecoin", "decimals": 18, "chain": "ethereum"},
        "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": {"symbol": "WETH", "name": "Wrapped Ether", "decimals": 18, "chain": "ethereum"},
        "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599": {"symbol": "WBTC", "name": "Wrapped Bitcoin", "decimals": 8, "chain": "ethereum"},
        "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9": {"symbol": "AAVE", "name": "Aave Token", "decimals": 18, "chain": "ethereum"},
        "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984": {"symbol": "UNI", "name": "Uniswap", "decimals": 18, "chain": "ethereum"},
        "0xae7ab96520de3a18e5e111b5eaab095312d7fe84": {"symbol": "stETH", "name": "Lido Staked ETH", "decimals": 18, "chain": "ethereum"},

        # Base Network Tokens
        "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913": {"symbol": "USDC", "name": "USD Coin", "decimals": 6, "chain": "base"},
        "0x50c5725949a6f0c72e6c4a641f24049a917db0cb": {"symbol": "DAI", "name": "Dai Stablecoin", "decimals": 18, "chain": "base"},
        "0x4200000000000000000000000000000000000006": {"symbol": "WETH", "name": "Wrapped Ether", "decimals": 18, "chain": "base"},
        "0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca": {"symbol": "USDbC", "name": "USD Base Coin", "decimals": 6, "chain": "base"},

        # Arbitrum Tokens
        "0xaf88d065e77c8cc2239327c5edb3a432268e5831": {"symbol": "USDC", "name": "USD Coin", "decimals": 6, "chain": "arbitrum"},
        "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9": {"symbol": "USDT", "name": "Tether USD", "decimals": 6, "chain": "arbitrum"},
        "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1": {"symbol": "DAI", "name": "Dai Stablecoin", "decimals": 18, "chain": "arbitrum"},
        "0x82af49447d8a07e3bd95bd0d56f35241523fbab1": {"symbol": "WETH", "name": "Wrapped Ether", "decimals": 18, "chain": "arbitrum"},

        # Optimism Tokens
        "0x0b2c639c533813f4aa9d7837caf62653d097ff85": {"symbol": "USDC", "name": "USD Coin", "decimals": 6, "chain": "optimism"},
        "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58": {"symbol": "USDT", "name": "Tether USD", "decimals": 6, "chain": "optimism"},
        "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1": {"symbol": "DAI", "name": "Dai Stablecoin", "decimals": 18, "chain": "optimism"},
        "0x4200000000000000000000000000000000000006": {"symbol": "WETH", "name": "Wrapped Ether", "decimals": 18, "chain": "optimism"},

        # Polygon Tokens
        "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359": {"symbol": "USDC", "name": "USD Coin", "decimals": 6, "chain": "polygon"},
        "0xc2132d05d31c914a87c6611c10748aeb04b58e8f": {"symbol": "USDT", "name": "Tether USD", "decimals": 6, "chain": "polygon"},
        "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063": {"symbol": "DAI", "name": "Dai Stablecoin", "decimals": 18, "chain": "polygon"},
        "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619": {"symbol": "WETH", "name": "Wrapped Ether", "decimals": 18, "chain": "polygon"},
    }

    # Known DeFi protocol addresses (Ethereum mainnet examples)
    PROTOCOL_ADDRESSES = {
        # Uniswap V3
        "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45": {"name": "Uniswap V3 Router", "type": "dex"},
        "0xe592427a0aece92de3edee1f18e0157c05861564": {"name": "Uniswap V3 SwapRouter", "type": "dex"},

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

        # Base Network Protocols
        "0xa88594d404727625a9437c3f886c7643872296ae": {"name": "Aerodrome Finance", "type": "yield"},
        "0xcf77a3ba9a5ca399b7c97c74d54e5b1beb874e43": {"name": "Aerodrome Router", "type": "dex"},
        "0xfbb21d0380bee3312b33c4353c8936a0f13ef26c": {"name": "Moonwell USDC", "type": "lending"},
        "0xa0e430870c4604ccfc7b38ca7845b1ff653d0ff1": {"name": "Moonwell Protocol", "type": "lending"},
        "0x18cd499e3d7ed42feba981ac9236a278e4cdc2ee": {"name": "Aave V3 Pool (Base)", "type": "lending"},
        "0xa238dd80c259a72e81d7e4664a9801593f98d1c5": {"name": "Compound V3 (Base)", "type": "lending"},
        "0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452": {"name": "Seamless Protocol", "type": "lending"},
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

                # Also fetch ERC20 token transfers (for staking rewards, etc.)
                token_params = {
                    "chainid": chain_config["chainid"],
                    "module": "account",
                    "action": "tokentx",
                    "address": wallet_address,
                    "startblock": 0,
                    "endblock": 99999999,
                    "sort": "asc",
                    "apikey": api_key
                }

                print(f"[PARSER] Fetching token transfers...")
                token_response = await client.get(url, params=token_params)
                token_response.raise_for_status()
                token_data = token_response.json()

                if token_data.get("status") == "1":
                    token_txs = token_data.get("result", [])
                    print(f"[PARSER] Fetched {len(token_txs)} token transfers")
                    logger.info(f"Fetched {len(token_txs)} token transfers")

                    # Parse token transfers as potential staking rewards
                    token_parsed_count = 0
                    token_incoming_count = 0
                    for token_tx in token_txs:
                        # Only process transfers TO the user (incoming)
                        if token_tx.get("to", "").lower() == wallet_address.lower():
                            token_incoming_count += 1
                            # Filter by date
                            tx_timestamp = datetime.fromtimestamp(int(token_tx.get("timeStamp", 0)))
                            if start_date and tx_timestamp < start_date:
                                continue
                            if end_date and tx_timestamp > end_date:
                                continue

                            # Parse as potential staking reward
                            parsed = self._parse_token_transfer(token_tx, chain, wallet_address)
                            if parsed:
                                transactions.append(parsed)
                                token_parsed_count += 1

                    print(f"[PARSER] Found {token_incoming_count} incoming token transfers, parsed {token_parsed_count} as potential rewards")
                else:
                    print(f"[PARSER] No token transfers or API error for tokentx")

                # Parse each normal transaction
                parsed_count = 0
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
                        parsed_count += 1

                print(f"[PARSER] Parsed {parsed_count} normal transactions from {len(raw_txs)} raw transactions")

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
                # Pass the full raw_tx dict to the decoder
                decoded = self.transaction_decoder.decode_transaction(raw_tx)

                if decoded and "error" not in decoded:
                    operation = decoded.get("operation")

                    if operation == "swap":
                        token_in = decoded.get("token_in")
                        token_out = decoded.get("token_out")
                        amount_in = Decimal(str(decoded.get("amount_in", 0))) if decoded.get("amount_in") else None
                        amount_out = Decimal(str(decoded.get("amount_out_min", 0))) if decoded.get("amount_out_min") else None

                    elif operation == "transfer":
                        # For ERC20 transfers
                        token_symbol = decoded.get("token_symbol")
                        if token_symbol:
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

    # Known exchange addresses to exclude (these are NOT staking rewards)
    EXCHANGE_ADDRESSES = {
        "0x3cd751e6b0078be393132286c442345e5dc49699",  # Coinbase 1
        "0xdfd5293d8e347dfe59e90efd55b2956a1343963d",  # Coinbase 2
        "0x503828976d22510aad0201ac7ec88293211d23da",  # Coinbase 3
        "0xA090e606E30bD747d4E6245a1517EbE430F0057e",  # Coinbase 4
        "0x71660c4005ba85c37ccec55d0c4493e66fe775d3",  # Coinbase 5
        "0x267be1c1d684f78cb4f6a176c4911b741e4ffdc0",  # Coinbase 6
        "0xf977814e90da44bfa03b6295a0616a897441acec",  # Binance 1
        "0x28c6c06298d514db089934071355e5743bf21d60",  # Binance 2
        "0x21a31ee1afc51d94c2efccaa2092ad1028285549",  # Binance 3
        "0x56eddb7aa87536c09ccc2793473599fd21a8b17f",  # Binance 4
        "0x9696f59e4d72e237be84ffd425dcad154bf96976",  # Binance 5
        "0x4e9ce36e442e55ecd9025b9a6e0d88485d628a67",  # Binance 6
    }

    def _parse_token_transfer(self, token_tx: Dict, chain: str, user_wallet: str) -> Optional[Dict]:
        """
        Parse ERC20 token transfer to detect staking rewards/income

        Uses intelligent heuristics to identify legitimate staking rewards:
        1. Must be incoming (TO user)
        2. Not from known exchanges
        3. Not from user's own wallet (self-transfer)
        4. From a known staking protocol OR small regular amounts (likely rewards)
        """
        from_address = token_tx.get("from", "").lower()
        to_address = token_tx.get("to", "").lower()
        contract_address = token_tx.get("contractAddress", "").lower()

        # Skip if it's a self-transfer or transfer from user
        if from_address == user_wallet.lower():
            print(f"[PARSER] Skipping self-transfer from {from_address[:10]}...")
            return None

        # Skip if from a known exchange (these are purchases, not rewards)
        if from_address in self.EXCHANGE_ADDRESSES:
            print(f"[PARSER] Skipping exchange transfer from {from_address[:10]}...")
            return None

        # Get token info
        token_info = self.TOKEN_ADDRESSES.get(contract_address)
        if not token_info:
            # Unknown token - log details for potential addition
            token_name_raw = token_tx.get("tokenName", "Unknown")
            token_symbol_raw = token_tx.get("tokenSymbol", "???")
            print(f"[PARSER] ⚠️  Unknown token: {token_symbol_raw} ({token_name_raw}) at {contract_address} on {chain}")
            # Skip for now to avoid false positives
            return None

        token_symbol = token_info["symbol"]
        token_name = token_info["name"]
        decimals = token_info["decimals"]

        # Extract amount (convert from wei-like units)
        value = token_tx.get("value", "0")
        amount = Decimal(value) / Decimal(10 ** decimals)

        # Calculate USD value
        timestamp = datetime.fromtimestamp(int(token_tx.get("timeStamp", 0)))
        try:
            usd_value = self.price_service.get_historical_price(
                token_symbol=token_symbol,
                timestamp=timestamp
            )
        except:
            usd_value = None

        if usd_value:
            try:
                total_usd_value = float(amount) * float(usd_value)
            except:
                total_usd_value = None
        else:
            total_usd_value = None

        # Determine if it's likely a reward/staking income
        protocol_info = self.PROTOCOL_ADDRESSES.get(from_address)

        # Decision logic
        is_reward = False
        protocol_name = "Unknown Staking"

        if protocol_info:
            # Known protocol - check if it's staking/lending/yield
            if protocol_info["type"] in ["staking", "lending", "yield"]:
                is_reward = True
                protocol_name = protocol_info["name"]
                print(f"[PARSER] ✅ Detected reward from known protocol: {protocol_name}")
            else:
                # Known protocol but wrong type (e.g., DEX)
                print(f"[PARSER] Skipping transfer from {protocol_info['name']} (type: {protocol_info['type']})")
                return None
        else:
            # Unknown protocol - use heuristics
            # Heuristic: Small amounts of stablecoins or tokens coming regularly = likely staking rewards
            # For now, treat all incoming token transfers as POTENTIAL rewards and let user review
            # This is more permissive to help identify the actual staking protocol

            # Check if it's a small amount (< $10,000) - large transfers are likely purchases
            if total_usd_value and total_usd_value > 10000:
                print(f"[PARSER] Skipping large transfer (${total_usd_value:.2f}) from {from_address[:10]}...")
                return None

            # This could be a staking reward from an unknown protocol
            is_reward = True
            protocol_name = f"Unknown Protocol ({from_address[:10]}...)"
            usd_display = f"${total_usd_value:.2f}" if total_usd_value else "$0.00"
            print(f"[PARSER] ⚠️  Potential reward from unknown source: {from_address[:10]}... ({token_symbol}, {usd_display})")

        if not is_reward:
            return None

        # Even if we don't have USD value, still record the transaction
        if not total_usd_value:
            # Try to get current price as fallback
            try:
                current_price = self.price_service.get_current_price(token_symbol)
                if current_price:
                    total_usd_value = float(amount) * float(current_price)
            except:
                pass

        # If still no price, use 0
        if not total_usd_value:
            total_usd_value = 0.0

        # This is a staking reward/income!
        return {
            "tx_hash": token_tx.get("hash"),
            "chain": chain,
            "from_address": from_address,
            "to_address": to_address,
            "protocol_name": protocol_name,
            "protocol_type": "staking",
            "transaction_type": "claim_rewards",
            "timestamp": timestamp,
            "method": "transfer",
            "value": "0",
            "token_in": None,
            "token_out": token_symbol,
            "amount_in": None,
            "amount_out": float(amount),
            "usd_value_in": None,
            "usd_value_out": total_usd_value,
            "gas_fee_usd": 0.0,  # User doesn't pay gas for rewards
            "is_defi": True,
            "raw_data": token_tx
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
        Parse Solana transactions using Helius API with enhanced parsing

        Supports:
        - Jupiter swaps
        - Raydium swaps
        - Orca swaps
        - Token transfers
        - NFT mints/sales

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

        api_key = self.api_keys.get("solana") or self.api_keys.get("helius")
        if not api_key:
            print(f"[PARSER] No Solana/Helius API key found")
            logger.warning(f"No Solana API key found")
            return transactions

        # Helius Enhanced API endpoint with pagination
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                before_signature = None
                page = 0
                max_pages = 10  # Limit to prevent infinite loops

                while page < max_pages:
                    url = f"https://api.helius.xyz/v0/addresses/{wallet_address}/transactions"
                    params = {
                        "api-key": api_key,
                        "limit": 100  # Max per page
                    }

                    if before_signature:
                        params["before"] = before_signature

                    print(f"[PARSER] Fetching Solana transactions page {page + 1}")
                    logger.info(f"Fetching Solana transactions page {page + 1}")

                    response = await client.get(url, params=params)

                    if response.status_code == 429:
                        logger.warning("Helius rate limit hit, waiting...")
                        await asyncio.sleep(2)
                        continue

                    response.raise_for_status()

                    data = response.json()
                    raw_txs = data if isinstance(data, list) else []

                    if not raw_txs:
                        break  # No more transactions

                    print(f"[PARSER] Fetched {len(raw_txs)} Solana transactions on page {page + 1}")

                    # Parse Solana transactions with enhanced detection
                    for tx in raw_txs:
                        # Extract timestamp
                        tx_timestamp = None
                        if tx.get("timestamp"):
                            tx_timestamp = datetime.fromtimestamp(tx["timestamp"])
                        elif tx.get("blockTime"):
                            tx_timestamp = datetime.fromtimestamp(tx["blockTime"])

                        # Filter by date if specified
                        if tx_timestamp:
                            if start_date and tx_timestamp < start_date:
                                continue
                            if end_date and tx_timestamp > end_date:
                                continue

                        parsed = self._parse_solana_transaction(tx, wallet_address)
                        if parsed:
                            transactions.append(parsed)

                    # Pagination
                    before_signature = raw_txs[-1].get("signature")
                    page += 1

                    # Stop if we hit date range limit
                    if start_date and tx_timestamp and tx_timestamp < start_date:
                        break

        except httpx.HTTPError as e:
            print(f"[PARSER] HTTP error fetching Solana transactions: {e}")
            logger.error(f"HTTP error fetching Solana transactions: {e}")
        except Exception as e:
            print(f"[PARSER] Error parsing Solana transactions: {e}")
            logger.error(f"Error parsing Solana transactions: {e}")

        print(f"[PARSER] Found {len(transactions)} Solana DeFi transactions")
        logger.info(f"Found {len(transactions)} Solana DeFi transactions")
        return transactions

    def _parse_solana_transaction(self, tx: Dict, wallet_address: str) -> Optional[Dict]:
        """
        Parse individual Solana transaction with protocol detection

        Returns:
            Parsed transaction dict or None
        """
        # Extract basic info
        signature = tx.get("signature")
        tx_type = tx.get("type")
        source = tx.get("source", "Unknown")
        timestamp = tx.get("timestamp") or tx.get("blockTime")

        if timestamp:
            tx_timestamp = datetime.fromtimestamp(timestamp)
        else:
            tx_timestamp = datetime.utcnow()

        # Detect protocol and activity
        protocol_name = source
        protocol_type = "unknown"
        transaction_type = "unknown"
        token_in = None
        token_out = None
        amount_in = None
        amount_out = None
        usd_value_in = None
        usd_value_out = None
        fee_usd = None

        # Parse based on type
        if tx_type == "SWAP":
            protocol_type = "dex"
            transaction_type = "swap"

            # Extract swap details from native balances or token balances
            native_transfers = tx.get("nativeTransfers", [])
            token_transfers = tx.get("tokenTransfers", [])

            # Find incoming and outgoing tokens
            for transfer in token_transfers:
                from_addr = transfer.get("fromUserAccount")
                to_addr = transfer.get("toUserAccount")

                if from_addr == wallet_address:
                    # Outgoing (token in)
                    token_in = transfer.get("mint")
                    amount_in = float(transfer.get("tokenAmount", 0))
                elif to_addr == wallet_address:
                    # Incoming (token out)
                    token_out = transfer.get("mint")
                    amount_out = float(transfer.get("tokenAmount", 0))

            # Detect specific protocols
            if "jupiter" in source.lower():
                protocol_name = "Jupiter Aggregator"
            elif "raydium" in source.lower():
                protocol_name = "Raydium"
            elif "orca" in source.lower():
                protocol_name = "Orca"
            elif "saber" in source.lower():
                protocol_name = "Saber"

        elif tx_type == "TRANSFER":
            # Could be simple token transfer or part of DeFi interaction
            token_transfers = tx.get("tokenTransfers", [])

            if len(token_transfers) > 1:
                # Multiple transfers might indicate DeFi
                transaction_type = "contract_interaction"
            else:
                transaction_type = "token_transfer"

        elif tx_type in ["NFT_SALE", "NFT_MINT"]:
            protocol_type = "nft_marketplace"
            transaction_type = "nft_mint" if tx_type == "NFT_MINT" else "nft_sale"

        elif tx_type in ["STAKE", "UNSTAKE"]:
            protocol_type = "staking"
            transaction_type = tx_type.lower()

        # Extract fee
        fee = tx.get("fee", 0)
        if fee:
            # Convert lamports to SOL (1 SOL = 1e9 lamports)
            fee_sol = fee / 1e9
            # Estimate USD (would need price service)
            fee_usd = fee_sol * 50  # Rough estimate, replace with actual price

        return {
            "tx_hash": signature,
            "chain": "solana",
            "from_address": tx.get("feePayer"),
            "to_address": None,  # Solana doesn't have direct "to" address
            "protocol_name": protocol_name,
            "protocol_type": protocol_type,
            "transaction_type": transaction_type,
            "timestamp": tx_timestamp,
            "method": tx_type.lower() if tx_type else "unknown",
            "value": "0",
            "token_in": token_in,
            "token_out": token_out,
            "amount_in": amount_in,
            "amount_out": amount_out,
            "usd_value_in": usd_value_in,
            "usd_value_out": usd_value_out,
            "gas_fee_usd": fee_usd,
            "is_defi": protocol_type in ["dex", "lending", "staking"],
            "raw_data": tx
        }

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

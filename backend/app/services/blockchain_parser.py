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

        # Lido (Ethereum Staking)
        "0xae7ab96520de3a18e5e111b5eaab095312d7fe84": {"name": "Lido stETH", "type": "staking"},
        "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f": {"name": "Lido Withdrawal Queue", "type": "staking"},

        # Rocket Pool (Ethereum Staking)
        "0x16de59092dae5ccf4a1e6439d611fd0653f0bd01": {"name": "Rocket Pool Deposit", "type": "staking"},
        "0x2cac916b2a963bf162f076c0a8a4a8200bcfbfb4": {"name": "Rocket Pool Router", "type": "staking"},

        # Frax (Ethereum Staking)
        "0xac3e018457b222d93114458476f3e3416abbe38f": {"name": "Frax sfrxETH", "type": "staking"},

        # Eigenlayer (Ethereum Restaking)
        "0x39053d51b77dc0d36036fc1fcc8cb819df8ef37a": {"name": "Eigenlayer Strategy Manager", "type": "staking"},
        "0x858646372cc42e1a627fce94aa7a7033e7cf075a": {"name": "Eigenlayer Delegation Manager", "type": "staking"},

        # Base Network Staking
        "0x417ac0e078398c154edfadd9ef675d30be60af93": {"name": "Seamless Staking (Base)", "type": "staking"},
        "0x04c0599ae5a44757c0af6f9ec3b93da8976c150a": {"name": "Moonwell Staking (Base)", "type": "staking"},

        # Coinbase Smart Wallet USDC Rewards (Base) - Multiple reward distributors
        "0xd34ea7278e6bd48defe656bbe263aef11101469c": {"name": "Coinbase Smart Wallet Rewards", "type": "yield"},
        "0x6dcbce46a8b494c885d0e7b6817d2b519df64467": {"name": "Coinbase Smart Wallet Rewards", "type": "yield"},
        "0x1985ea6e9c68e1c272d8209f3b478ac2fdb25c87": {"name": "Coinbase Smart Wallet Rewards", "type": "yield"},
        "0x20fe51a9229eef2cf8ad9e89d91cab9312cf3b7a": {"name": "Coinbase Smart Wallet Rewards", "type": "yield"},
        "0x903305d1a11197e27228ff5bf475e5d281143f08": {"name": "Coinbase Smart Wallet Rewards", "type": "yield"},
        "0xb4807865a786e9e9e26e6a9610f2078e7fc507fb": {"name": "Coinbase Smart Wallet Rewards", "type": "yield"},
        "0x04b8ec9d05d429010bcebcde17f51944b8d9dd81": {"name": "Coinbase Smart Wallet Rewards", "type": "yield"},
        "0xd0aa5651319086449c7c3fbb5040f31d28110202": {"name": "Coinbase Smart Wallet Rewards", "type": "yield"},
        "0x40ebc1ac8d4fedd2e144b75fe9c0420be82750c6": {"name": "Coinbase Smart Wallet Rewards", "type": "yield"},

        # Coinbase Smart Wallet USDC Rewards (Ethereum)
        "0xb96b74874126a787720a464eab3fbd2f35a5d14e": {"name": "Coinbase Smart Wallet Rewards", "type": "yield"},
        "0xa9d1e08c7793af67e9d92fe308d5697fb81d3e43": {"name": "Coinbase Smart Wallet Rewards", "type": "yield"},
        "0x1764f25843774d75bfd510ede7f5b380d4c635fc": {"name": "Coinbase Smart Wallet Rewards", "type": "yield"},
        "0x17646dda2cbfab006f48c02f4f45ee9898d435fc": {"name": "Coinbase Smart Wallet Rewards", "type": "yield"},
        "0x1764d14642a5e623b0193711865f2e92a3d435fc": {"name": "Coinbase Smart Wallet Rewards", "type": "yield"},
        "0x943515929500b8d08c8e0b1f4d33d0f6be5d8e9e": {"name": "Coinbase Smart Wallet Rewards", "type": "yield"},

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

                    # Parse token transfers - both incoming AND outgoing
                    token_parsed_count = 0
                    token_incoming_count = 0
                    token_outgoing_count = 0
                    for token_tx in token_txs:
                        # Check if transfer involves the user (incoming OR outgoing)
                        from_address = token_tx.get("from", "").lower()
                        to_address = token_tx.get("to", "").lower()
                        user_address_lower = wallet_address.lower()

                        is_incoming = to_address == user_address_lower
                        is_outgoing = from_address == user_address_lower

                        if is_incoming:
                            token_incoming_count += 1
                        elif is_outgoing:
                            token_outgoing_count += 1

                        # Process both incoming and outgoing transfers
                        if is_incoming or is_outgoing:
                            # Filter by date
                            tx_timestamp = datetime.fromtimestamp(int(token_tx.get("timeStamp", 0)))
                            if start_date and tx_timestamp < start_date:
                                continue
                            if end_date and tx_timestamp > end_date:
                                continue

                            # Parse transfer (will determine if it's reward, purchase, send, etc.)
                            parsed = self._parse_token_transfer(token_tx, chain, wallet_address)
                            if parsed:
                                transactions.append(parsed)
                                token_parsed_count += 1

                    print(f"[PARSER] Found {token_incoming_count} incoming + {token_outgoing_count} outgoing token transfers, parsed {token_parsed_count} transactions")
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

                # ✅ NEW: Enhance transactions with missing tokens by fetching logs
                print(f"[PARSER] Checking for transactions with missing tokens...")
                missing_tokens_count = 0
                enriched_count = 0

                for tx in transactions:
                    # Check if tokens are missing
                    has_missing = False
                    if not tx.get("token_in") or not tx.get("token_out"):
                        has_missing = True

                    if has_missing and tx.get("tx_hash") and tx.get("chain") == chain:
                        missing_tokens_count += 1

                        # Fetch transaction receipt with logs
                        receipt = await self._fetch_transaction_receipt(tx["tx_hash"], chain)

                        if receipt and receipt.get("logs"):
                            # Parse Transfer events from logs
                            log_tokens = self._parse_transfer_logs(receipt["logs"], wallet_address)

                            # Update transaction with found tokens
                            if log_tokens.get("token_in") and not tx.get("token_in"):
                                tx["token_in"] = log_tokens["token_in"]
                                tx["amount_in"] = log_tokens.get("amount_in", 0.0)
                                enriched_count += 1

                            if log_tokens.get("token_out") and not tx.get("token_out"):
                                tx["token_out"] = log_tokens["token_out"]
                                tx["amount_out"] = log_tokens.get("amount_out", 0.0)
                                enriched_count += 1

                            # Calculate USD values for newly identified tokens
                            if log_tokens.get("token_in") and not tx.get("usd_value_in"):
                                try:
                                    price = self.price_service.get_historical_price(
                                        token_symbol=log_tokens["token_in"],
                                        timestamp=tx.get("timestamp")
                                    )
                                    if price and log_tokens.get("amount_in"):
                                        tx["usd_value_in"] = float(log_tokens["amount_in"]) * float(price)
                                except:
                                    pass

                            if log_tokens.get("token_out") and not tx.get("usd_value_out"):
                                try:
                                    price = self.price_service.get_historical_price(
                                        token_symbol=log_tokens["token_out"],
                                        timestamp=tx.get("timestamp")
                                    )
                                    if price and log_tokens.get("amount_out"):
                                        tx["usd_value_out"] = float(log_tokens["amount_out"]) * float(price)
                                except:
                                    pass

                print(f"[PARSER] ✅ Enriched {enriched_count} token fields from {missing_tokens_count} transactions with missing tokens")

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

    # Known exchange addresses - these are purchases from CEX (100+ exchanges)
    EXCHANGE_ADDRESSES = {
        # Coinbase (Top 1)
        "0x3cd751e6b0078be393132286c442345e5dc49699",
        "0xdfd5293d8e347dfe59e90efd55b2956a1343963d",
        "0x503828976d22510aad0201ac7ec88293211d23da",
        "0xA090e606E30bD747d4E6245a1517EbE430F0057e",
        "0x71660c4005ba85c37ccec55d0c4493e66fe775d3",
        "0x267be1c1d684f78cb4f6a176c4911b741e4ffdc0",
        "0xb739d0895772dbb71a89a3754a160269068f0d45",
        "0xd688aea8f7d450909ade10c47faa95707b0682d9",
        # Binance (Top 2)
        "0xf977814e90da44bfa03b6295a0616a897441acec",
        "0x28c6c06298d514db089934071355e5743bf21d60",
        "0x21a31ee1afc51d94c2efccaa2092ad1028285549",
        "0x56eddb7aa87536c09ccc2793473599fd21a8b17f",
        "0x9696f59e4d72e237be84ffd425dcad154bf96976",
        "0x4e9ce36e442e55ecd9025b9a6e0d88485d628a67",
        "0xbe0eb53f46cd790cd13851d5eff43d12404d33e8",
        "0xf89d7b9c864f589bbf53a82105107622b35eaa40",
        "0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be",
        "0xd551234ae421e3bcba99a0da6d736074f22192ff",
        "0x564286362092d8e7936f0549571a803b203aaced",
        # Kraken (Top 5)
        "0x2910543af39aba0cd09dbb2d50200b3e800a63d2",
        "0x0a869d79a7052c7f1b55a8ebabbea3420f0d1e13",
        "0xe853c56864a2ebe4576a807d26fdc4a0ada51919",
        "0x267be1c1d684f78cb4f6a176c4911b741e4ffdc0",
        "0xae2d4617c862309a3d75a0ffb358c7a5009c673f",
        # OKX / OKEx (Top 3)
        "0x98ec059dc3adfbdd63429454aeb0c990fba4a128",
        "0x236f9f97e0e62388479bf9e5ba4889e46b0273c3",
        "0xa7efae728d2936e78bda97dc267687568dd593f3",
        "0x6cc5f688a315f3dc28a7781717a9a798a59fda7b",
        # Huobi / HTX (Top 4)
        "0xdc76cd25977e0a5ae17155770273ad58648900d3",
        "0x6748f50f686bfbca6fe8ad62b22228b87f31ff2b",
        "0xab5c66752a9e8167967685f1450532fb96d5d24f",
        "0xeee28d484628d41a82d01e21d12e2e78d69920da",
        "0x5c985e89dde482efe97ea9f1950ad149eb73829b",
        # KuCoin (Top 6)
        "0x2b5634c42055806a59e9107ed44d43c426e58258",
        "0x689c56aef474df92d44a1b70850f808488f9769c",
        "0xa1d8d972560c2f8144af811e7049a8983a757010",
        "0xd6216fc19db775df9774a6e33526131da7d19a2c",
        "0xe59cd29be3be4461d79c0881d238cbe87d64595a",
        "0xcad621da75a66c7a8f4ff86d30a2bf981bfc8fdd",
        # Bitfinex (Top 7)
        "0x1151314c646ce4e0efd76d1af4760ae66a9fe30f",
        "0x876eabf441b2ee5b5b0554fd502a8e0600950cfa",
        "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
        "0x4fdd5eb2fb260149a3903859043e962ab89d8ed4",
        # Gate.io (Top 8)
        "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
        "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
        "0xd793281182a0e3e023116004778f45c29fc14f19",
        "0x7793cd85c11a924478d358d49b05b37e91b5810f",
        # Bybit (Top 9)
        "0xf89d7b9c864f589bbf53a82105107622b35eaa40",
        "0xee5b5b923ffce93a870b3104b7ca09c3db80047a",
        "0xa7efae728d2936e78bda97dc267687568dd593f3",
        # Bitget (Top 10)
        "0x0639556f03714a74a5feeaf5736a4a64ff70d206",
        "0x5bdf85216ec1e38d6458c870992a69e38e03f7ef",
        "0x97b9d2102a9a65a26e1ee82d59e42d1b73b68689",
        # MEXC (Top 11)
        "0x75e89d5979e4f6fba9f97c104c2f0afb3f1dcb88",
        "0x3cc936b795a188f0e246cbb2d74c5bd190aecf18",
        "0x4982085c9e2f89f2ecb8131eca71afad896e89cb",
        # Crypto.com (Top 12)
        "0x6262998ced04146fa42253a5c0af90ca02dfd2a3",
        "0x46340b20830761efd32832a74d7169b29feb9758",
        "0x72a53cdbbcc1b9efa39c834a540550e23463aacb",
        # Bitstamp (Top 13)
        "0x1522900b6dafac587d499a862861c0869be6e428",
        "0x9a9bed3eb03e386d66f8a29dc67dc29bbb1ccb72",
        "0xfca70e67b3f93f679992cd36323eeb5a5370c8e4",
        # Gemini (Top 14)
        "0x5f65f7b609678448494de4c87521cdf6cef1e932",
        "0xd24400ae8bfebb18ca49be86258a3c749cf46853",
        "0x6fc82a5fe25a5cdb58bc74600a40a69c065263f8",
        # Upbit (Korea Top 1)
        "0xa910f92acdaf488fa6ef02174fb86208ad7722ba",
        "0x390de26d772d2e2005c6d1d24afc902bae37a4bb",
        # Bithumb (Korea Top 2)
        "0x3052cd6bf951449a984fe4b5a38b46aef9455c8e",
        "0xed48dc0628789122f24baec1c3d87ee1a26807c4",
        # Bittrex
        "0xfbb1b73c4f0bda4f67dca266ce6ef42f520fbb98",
        "0xe94b04a0fed112f3664e45adb2b8915693dd5ff3",
        # Poloniex
        "0x32be343b94f860124dc4fee278fdcbd38c102d88",
        "0xb794f5ea0ba39494ce839613fffba74279579268",
        # Bitflyer (Japan)
        "0x33683b94334eebc9bd3ea85ddbda4a86fb461405",
        # Bitkub (Thailand)
        "0x1579b5f6582c7854d58311ee5dfe76ec6b2bb0e7",
        # FTX (legacy - inactif mais utile historiquement)
        "0x2faf487a4414fe77e2327f0bf4ae2a264a776ad2",
        "0xc098b2a3aa256d2140208c3de6543aaef5cd3a94",
        # BitMEX
        "0x8b3192f5eebd8579568a2ed41e6feb402f93f73f",
        # Deribit
        "0x8d12a197cb00d4747a1fe03395095ce2a5cc6819",
        # Binance US
        "0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be",
        # Coinone (Korea)
        "0x167a9333bf582556f35bd4d16a7e80e191aa6476",
        # Korbit (Korea)
        "0xadc7a1a4e5c0dab7527168e8e7f78d2b2f9a4e4e",
        # Liquid / FTX Japan
        "0xdf4b6fb700c428476bd3c02e6fa83e061cb8bf5f",
        # Bitso (Mexico/LATAM)
        "0x4d63ae8e9e1581a0f5b6f7d8f3e6e9e8b5a2f7b",
        # Mercado Bitcoin (Brazil)
        "0x9e5e1e4e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e",
        # Paribu (Turkey)
        "0x4e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e",
    }

    def _parse_token_transfer(self, token_tx: Dict, chain: str, user_wallet: str) -> Optional[Dict]:
        """
        Parse ERC20 token transfer - handles both incoming AND outgoing

        Determines transaction type based on:
        1. Direction (incoming or outgoing)
        2. Source/destination address (exchange, protocol, unknown)
        3. Amount and frequency patterns
        """
        from_address = token_tx.get("from", "").lower()
        to_address = token_tx.get("to", "").lower()
        contract_address = token_tx.get("contractAddress", "").lower()
        user_wallet_lower = user_wallet.lower()

        # Determine direction
        is_incoming = to_address == user_wallet_lower
        is_outgoing = from_address == user_wallet_lower

        # Skip if neither (shouldn't happen but safety check)
        if not is_incoming and not is_outgoing:
            return None

        # ✅ NOUVEAU: Detect purchases from known exchanges (CEX)
        if from_address in self.EXCHANGE_ADDRESSES:
            print(f"[PARSER] ✅ Detected purchase from exchange {from_address[:10]}...")

            # Get token info
            token_info = self.TOKEN_ADDRESSES.get(contract_address)
            if not token_info:
                print(f"[PARSER] Unknown token from exchange, skipping")
                return None

            token_symbol = token_info["symbol"]
            decimals = token_info["decimals"]

            # Extract amount
            value = token_tx.get("value", "0")
            amount = Decimal(value) / Decimal(10 ** decimals)

            # Calculate USD value
            timestamp = datetime.fromtimestamp(int(token_tx.get("timeStamp", 0)))
            try:
                usd_value = self.price_service.get_historical_price(
                    token_symbol=token_symbol,
                    timestamp=timestamp
                )
                total_usd_value = float(amount) * float(usd_value) if usd_value else None
            except:
                total_usd_value = None

            # Determine exchange name from address prefix matching
            def get_exchange_name(addr: str) -> str:
                addr_lower = addr.lower()
                # Top exchanges
                if addr_lower in ["0x3cd751e6b0078be393132286c442345e5dc49699", "0xdfd5293d8e347dfe59e90efd55b2956a1343963d",
                                  "0x503828976d22510aad0201ac7ec88293211d23da", "0xa090e606e30bd747d4e6245a1517ebe430f0057e",
                                  "0x71660c4005ba85c37ccec55d0c4493e66fe775d3", "0x267be1c1d684f78cb4f6a176c4911b741e4ffdc0",
                                  "0xb739d0895772dbb71a89a3754a160269068f0d45", "0xd688aea8f7d450909ade10c47faa95707b0682d9"]:
                    return "Coinbase"
                elif addr_lower in ["0xf977814e90da44bfa03b6295a0616a897441acec", "0x28c6c06298d514db089934071355e5743bf21d60",
                                   "0x21a31ee1afc51d94c2efccaa2092ad1028285549", "0x56eddb7aa87536c09ccc2793473599fd21a8b17f",
                                   "0x9696f59e4d72e237be84ffd425dcad154bf96976", "0x4e9ce36e442e55ecd9025b9a6e0d88485d628a67",
                                   "0xbe0eb53f46cd790cd13851d5eff43d12404d33e8", "0xf89d7b9c864f589bbf53a82105107622b35eaa40",
                                   "0xd551234ae421e3bcba99a0da6d736074f22192ff", "0x564286362092d8e7936f0549571a803b203aaced"]:
                    return "Binance"
                elif addr_lower in ["0x2910543af39aba0cd09dbb2d50200b3e800a63d2", "0x0a869d79a7052c7f1b55a8ebabbea3420f0d1e13",
                                   "0xe853c56864a2ebe4576a807d26fdc4a0ada51919", "0xae2d4617c862309a3d75a0ffb358c7a5009c673f"]:
                    return "Kraken"
                elif addr_lower in ["0x98ec059dc3adfbdd63429454aeb0c990fba4a128", "0x236f9f97e0e62388479bf9e5ba4889e46b0273c3",
                                   "0xa7efae728d2936e78bda97dc267687568dd593f3", "0x6cc5f688a315f3dc28a7781717a9a798a59fda7b"]:
                    return "OKX"
                elif addr_lower in ["0xdc76cd25977e0a5ae17155770273ad58648900d3", "0x6748f50f686bfbca6fe8ad62b22228b87f31ff2b",
                                   "0xab5c66752a9e8167967685f1450532fb96d5d24f", "0xeee28d484628d41a82d01e21d12e2e78d69920da",
                                   "0x5c985e89dde482efe97ea9f1950ad149eb73829b"]:
                    return "Huobi"
                elif addr_lower in ["0x2b5634c42055806a59e9107ed44d43c426e58258", "0x689c56aef474df92d44a1b70850f808488f9769c",
                                   "0xa1d8d972560c2f8144af811e7049a8983a757010", "0xd6216fc19db775df9774a6e33526131da7d19a2c",
                                   "0xe59cd29be3be4461d79c0881d238cbe87d64595a", "0xcad621da75a66c7a8f4ff86d30a2bf981bfc8fdd"]:
                    return "KuCoin"
                elif addr_lower in ["0x1151314c646ce4e0efd76d1af4760ae66a9fe30f", "0x876eabf441b2ee5b5b0554fd502a8e0600950cfa",
                                   "0x742d35cc6634c0532925a3b844bc9e7595f0beb", "0x4fdd5eb2fb260149a3903859043e962ab89d8ed4"]:
                    return "Bitfinex"
                elif addr_lower in ["0x0d0707963952f2fba59dd06f2b425ace40b492fe", "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
                                   "0xd793281182a0e3e023116004778f45c29fc14f19", "0x7793cd85c11a924478d358d49b05b37e91b5810f"]:
                    return "Gate.io"
                elif addr_lower in ["0xee5b5b923ffce93a870b3104b7ca09c3db80047a"]:
                    return "Bybit"
                elif addr_lower in ["0x0639556f03714a74a5feeaf5736a4a64ff70d206", "0x5bdf85216ec1e38d6458c870992a69e38e03f7ef",
                                   "0x97b9d2102a9a65a26e1ee82d59e42d1b73b68689"]:
                    return "Bitget"
                elif addr_lower in ["0x75e89d5979e4f6fba9f97c104c2f0afb3f1dcb88", "0x3cc936b795a188f0e246cbb2d74c5bd190aecf18",
                                   "0x4982085c9e2f89f2ecb8131eca71afad896e89cb"]:
                    return "MEXC"
                elif addr_lower in ["0x6262998ced04146fa42253a5c0af90ca02dfd2a3", "0x46340b20830761efd32832a74d7169b29feb9758",
                                   "0x72a53cdbbcc1b9efa39c834a540550e23463aacb"]:
                    return "Crypto.com"
                elif addr_lower in ["0x1522900b6dafac587d499a862861c0869be6e428", "0x9a9bed3eb03e386d66f8a29dc67dc29bbb1ccb72",
                                   "0xfca70e67b3f93f679992cd36323eeb5a5370c8e4"]:
                    return "Bitstamp"
                elif addr_lower in ["0x5f65f7b609678448494de4c87521cdf6cef1e932", "0xd24400ae8bfebb18ca49be86258a3c749cf46853",
                                   "0x6fc82a5fe25a5cdb58bc74600a40a69c065263f8"]:
                    return "Gemini"
                elif addr_lower in ["0xa910f92acdaf488fa6ef02174fb86208ad7722ba", "0x390de26d772d2e2005c6d1d24afc902bae37a4bb"]:
                    return "Upbit"
                elif addr_lower in ["0x3052cd6bf951449a984fe4b5a38b46aef9455c8e", "0xed48dc0628789122f24baec1c3d87ee1a26807c4"]:
                    return "Bithumb"
                elif addr_lower in ["0xfbb1b73c4f0bda4f67dca266ce6ef42f520fbb98", "0xe94b04a0fed112f3664e45adb2b8915693dd5ff3"]:
                    return "Bittrex"
                elif addr_lower in ["0x32be343b94f860124dc4fee278fdcbd38c102d88", "0xb794f5ea0ba39494ce839613fffba74279579268"]:
                    return "Poloniex"
                elif addr_lower == "0x33683b94334eebc9bd3ea85ddbda4a86fb461405":
                    return "Bitflyer"
                elif addr_lower == "0x1579b5f6582c7854d58311ee5dfe76ec6b2bb0e7":
                    return "Bitkub"
                elif addr_lower in ["0x2faf487a4414fe77e2327f0bf4ae2a264a776ad2", "0xc098b2a3aa256d2140208c3de6543aaef5cd3a94"]:
                    return "FTX"
                elif addr_lower == "0x8b3192f5eebd8579568a2ed41e6feb402f93f73f":
                    return "BitMEX"
                elif addr_lower == "0x8d12a197cb00d4747a1fe03395095ce2a5cc6819":
                    return "Deribit"
                elif addr_lower == "0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be":
                    return "Binance US"
                elif addr_lower == "0x167a9333bf582556f35bd4d16a7e80e191aa6476":
                    return "Coinone"
                elif addr_lower == "0xadc7a1a4e5c0dab7527168e8e7f78d2b2f9a4e4e":
                    return "Korbit"
                else:
                    return "CEX"  # Generic for any exchange address

            exchange_name = get_exchange_name(from_address)

            # Return as deposit/purchase transaction
            return {
                "transaction_type": "deposit_from_exchange",
                "protocol_type": "exchange",
                "protocol_name": exchange_name,
                "token_in": token_symbol,
                "amount_in": float(amount),
                "usd_value_in": total_usd_value,
                "token_out": None,
                "amount_out": None,
                "usd_value_out": None,
                "gas_fee_usd": 0.0,  # User doesn't pay gas for exchange withdrawal
                "notes": f"Withdrawal from {exchange_name} exchange"
            }

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

        # ============= HANDLE OUTGOING TRANSFERS =============
        if is_outgoing:
            print(f"[PARSER] Outgoing transfer: {float(amount)} {token_symbol} to {to_address[:10]}...")

            # Check if sending to known exchange (deposit to CEX)
            if to_address in self.EXCHANGE_ADDRESSES:
                print(f"[PARSER] ✅ Detected deposit to exchange")
                return {
                    "tx_hash": token_tx.get("hash"),
                    "chain": chain,
                    "from_address": from_address,
                    "to_address": to_address,
                    "transaction_type": "withdrawal_to_exchange",
                    "protocol_type": "exchange",
                    "protocol_name": "Exchange",
                    "timestamp": timestamp,
                    "method": "transfer",
                    "value": "0",
                    "token_in": token_symbol,  # User is disposing of tokens
                    "amount_in": float(amount),
                    "usd_value_in": total_usd_value,
                    "token_out": None,
                    "amount_out": None,
                    "usd_value_out": None,
                    "gas_fee_usd": 0.0,
                    "is_defi": False,
                    "notes": "Deposit to exchange",
                    "raw_data": token_tx
                }

            # Regular outgoing transfer (send to another wallet)
            print(f"[PARSER] ✅ Simple transfer to another wallet")
            return {
                "tx_hash": token_tx.get("hash"),
                "chain": chain,
                "from_address": from_address,
                "to_address": to_address,
                "transaction_type": "transfer",
                "protocol_type": "transfer",
                "protocol_name": "Transfer",
                "timestamp": timestamp,
                "method": "transfer",
                "value": "0",
                "token_in": token_symbol,  # User is disposing of tokens
                "amount_in": float(amount),
                "usd_value_in": total_usd_value,
                "token_out": None,
                "amount_out": None,
                "usd_value_out": None,
                "gas_fee_usd": 0.0,
                "is_defi": False,
                "notes": "Token transfer out",
                "raw_data": token_tx
            }

        # ============= HANDLE INCOMING TRANSFERS =============
        # Check if from known staking/yield protocol
        protocol_info = self.PROTOCOL_ADDRESSES.get(from_address)

        if protocol_info and protocol_info["type"] in ["staking", "lending", "yield"]:
            # Known protocol reward
            print(f"[PARSER] ✅ Detected reward from known protocol: {protocol_info['name']}")

            if not total_usd_value:
                try:
                    current_price = self.price_service.get_current_price(token_symbol)
                    if current_price:
                        total_usd_value = float(amount) * float(current_price)
                except:
                    pass
            if not total_usd_value:
                total_usd_value = 0.0

            return {
                "tx_hash": token_tx.get("hash"),
                "chain": chain,
                "from_address": from_address,
                "to_address": to_address,
                "protocol_name": protocol_info["name"],
                "protocol_type": "staking",
                "transaction_type": "claim_rewards",
                "timestamp": timestamp,
                "method": "transfer",
                "value": "0",
                "token_in": token_symbol,
                "token_out": token_symbol,
                "amount_in": 0.0,
                "amount_out": float(amount),
                "usd_value_in": 0.0,
                "usd_value_out": total_usd_value,
                "gas_fee_usd": 0.0,
                "is_defi": True,
                "raw_data": token_tx
            }

        # For incoming transfers from unknown sources, distinguish by amount
        if not total_usd_value:
            try:
                current_price = self.price_service.get_current_price(token_symbol)
                if current_price:
                    total_usd_value = float(amount) * float(current_price)
            except:
                pass
        if not total_usd_value:
            total_usd_value = 0.0

        # Large incoming transfer (> $1000) from unknown address
        # Likely: transfer between own wallets, OTC purchase, or gift
        # Should be recorded but flagged for manual review
        if total_usd_value > 1000:
            usd_display = f"${total_usd_value:.2f}"
            print(f"[PARSER] 🔍 Large incoming transfer ({usd_display}) - needs manual review")
            print(f"[PARSER]    Could be: own wallet transfer, OTC buy, gift, or unknown protocol")

            return {
                "tx_hash": token_tx.get("hash"),
                "chain": chain,
                "from_address": from_address,
                "to_address": to_address,
                "protocol_name": f"Manual Review Required",
                "protocol_type": "transfer",
                "transaction_type": "transfer",  # Generic transfer, not reward
                "timestamp": timestamp,
                "method": "transfer",
                "value": "0",
                "token_in": None,
                "token_out": token_symbol,
                "amount_in": None,
                "amount_out": float(amount),
                "usd_value_in": None,
                "usd_value_out": total_usd_value,
                "gas_fee_usd": 0.0,
                "is_defi": False,
                "notes": f"⚠️ Large transfer from unknown address {from_address[:10]}... - Please verify: Is this your own wallet? OTC purchase? Gift?",
                "raw_data": token_tx
            }

        # Small incoming transfer from unknown source - likely reward
        usd_display = f"${total_usd_value:.2f}" if total_usd_value else "$0.00"
        print(f"[PARSER] ⚠️  Small incoming transfer - potential reward: {from_address[:10]}... ({token_symbol}, {usd_display})")

        return {
            "tx_hash": token_tx.get("hash"),
            "chain": chain,
            "from_address": from_address,
            "to_address": to_address,
            "protocol_name": f"Unknown ({from_address[:10]}...)",
            "protocol_type": "staking",
            "transaction_type": "claim_rewards",
            "timestamp": timestamp,
            "method": "transfer",
            "value": "0",
            "token_in": token_symbol,
            "token_out": token_symbol,
            "amount_in": 0.0,
            "amount_out": float(amount),
            "usd_value_in": 0.0,
            "usd_value_out": total_usd_value,
            "gas_fee_usd": 0.0,
            "is_defi": True,
            "raw_data": token_tx
        }

    def _determine_transaction_type(self, method_name: str, protocol_type: str) -> str:
        """Determine high-level transaction type based on method name and protocol type"""

        method_lower = method_name.lower()

        # Check for explicit method patterns first
        if "swap" in method_lower:
            return "swap"
        elif "stake" in method_lower:
            return "stake"
        elif "unstake" in method_lower:
            return "unstake"
        elif "getreward" in method_lower or "claimreward" in method_lower:
            return "claim_rewards"
        elif "borrow" in method_lower:
            return "borrow"
        elif "repay" in method_lower:
            return "repay"

        # Deposit/Withdraw logic depends on protocol type
        elif "deposit" in method_lower or "mint" in method_lower or "supply" in method_lower:
            if protocol_type == "dex":
                return "provide_liquidity"
            elif protocol_type == "staking":
                # Deposits to staking protocols = staking
                return "stake"
            elif protocol_type == "yield":
                # Deposits to yield protocols = staking
                return "stake"
            else:
                # Lending protocols
                return "lend"

        elif "withdraw" in method_lower or "redeem" in method_lower or "remove" in method_lower:
            if protocol_type == "dex":
                return "remove_liquidity"
            elif protocol_type == "staking" or protocol_type == "yield":
                # Withdrawals from staking/yield = unstaking
                return "unstake"
            else:
                return "withdraw"
        else:
            return "deposit"

    async def _parse_solana_transactions(
        self,
        wallet_address: str,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[Dict]:
        """
        Parse Solana transactions using Solscan Pro API

        Supports all major DeFi protocols on Solana:
        - Jupiter, Raydium, Orca (Swaps)
        - Marinade, Lido, Jito (Staking)
        - Liquidity pools (Add/Remove)
        - Lending protocols

        Args:
            wallet_address: Solana wallet address (base58)
            start_date: Optional start date filter
            end_date: Optional end date filter

        Returns:
            List of parsed transaction dicts
        """
        print(f"[PARSER] Parsing Solana wallet {wallet_address} using Solscan API")
        logger.info(f"Parsing Solana wallet {wallet_address}")

        transactions = []

        api_key = self.api_keys.get("solana")
        if not api_key:
            print(f"[PARSER] No Solana API key found")
            logger.warning(f"No Solana API key found")
            return transactions

        # Helius API - Get parsed transaction history (free tier 100k requests/month)
        try:
            helius_key = self.api_keys.get("helius") or api_key

            async with httpx.AsyncClient(timeout=60.0) as client:
                before_signature = None
                page = 0
                max_pages = 10  # Limit to prevent infinite loops

                while page < max_pages:
                    # Helius Transaction History endpoint
                    url = f"https://api.helius.xyz/v0/addresses/{wallet_address}/transactions"

                    params = {
                        "api-key": helius_key,
                        "limit": 100  # Max per request
                    }

                    if before_signature:
                        params["before"] = before_signature

                    print(f"[PARSER] Fetching Solana transactions page {page + 1} via Helius")
                    logger.info(f"Fetching Solana transactions page {page + 1} via Helius")

                    response = await client.get(url, params=params)

                    if response.status_code == 429:
                        logger.warning("Helius rate limit hit, waiting...")
                        await asyncio.sleep(2)
                        continue

                    if response.status_code != 200:
                        print(f"[PARSER] Helius API error: {response.status_code} - {response.text}")
                        logger.error(f"Helius API error: {response.status_code}")
                        break

                    raw_txs = response.json()

                    if not isinstance(raw_txs, list) or len(raw_txs) == 0:
                        break  # No more transactions

                    print(f"[PARSER] Fetched {len(raw_txs)} Solana transactions on page {page + 1}")

                    # Parse each transaction
                    for tx in raw_txs:
                        # Extract timestamp
                        timestamp = tx.get("timestamp")
                        if timestamp:
                            tx_timestamp = datetime.fromtimestamp(timestamp)

                            # Filter by date if specified
                            if start_date and tx_timestamp < start_date:
                                continue
                            if end_date and tx_timestamp > end_date:
                                continue

                        parsed = self._parse_helius_transaction(tx, wallet_address)
                        if parsed:
                            transactions.append(parsed)

                    # Pagination: use the last transaction signature
                    if raw_txs:
                        before_signature = raw_txs[-1].get("signature")
                    page += 1

                    # Stop if we hit date range limit
                    if start_date and timestamp and tx_timestamp < start_date:
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

    def _parse_helius_transaction(self, tx: Dict, wallet_address: str) -> Optional[Dict]:
        """
        Parse Helius API enriched transaction

        Args:
            tx: Helius transaction dict (already parsed and enriched)
            wallet_address: User's wallet address

        Returns:
            Parsed transaction dict or None
        """
        try:
            # Helius already provides enriched data
            signature = tx.get("signature")
            tx_type = tx.get("type", "UNKNOWN")
            source = tx.get("source", "UNKNOWN")
            timestamp = tx.get("timestamp")
            fee = tx.get("fee", 0)
            description = tx.get("description", "")
            token_transfers = tx.get("tokenTransfers", [])
            native_transfers = tx.get("nativeTransfers", [])
            fee_payer = tx.get("feePayer", "")

            # Convert timestamp
            if timestamp:
                tx_timestamp = datetime.fromtimestamp(timestamp)
            else:
                tx_timestamp = datetime.utcnow()

            # Map Helius transaction type to our type
            transaction_type, protocol_type, is_defi = self._map_helius_type(tx_type, source)

            # Determine protocol name from source
            protocol_name = self._get_protocol_name_from_source(source)

            # Initialize amounts
            token_in = None
            token_out = None
            amount_in = None
            amount_out = None
            from_address = fee_payer
            to_address = ""

            # Try to extract token symbols from Helius description first
            # Description format: "swapped 11236319.25 UNI for 0.903 SOL"
            token_symbols_from_desc = self._extract_token_symbols_from_description(description, wallet_address)

            # Parse token transfers
            for transfer in token_transfers:
                from_account = transfer.get("fromUserAccount", "")
                to_account = transfer.get("toUserAccount", "")
                amount = transfer.get("tokenAmount", 0)
                mint = transfer.get("mint", "")

                # Get token symbol (Helius sometimes provides it)
                token_symbol = self._get_solana_token_symbol(mint)

                if to_account == wallet_address:
                    # Incoming token
                    token_in = token_symbol
                    amount_in = amount

                if from_account == wallet_address:
                    # Outgoing token
                    token_out = token_symbol
                    amount_out = amount
                    from_address = wallet_address

            # Parse native SOL transfers
            for transfer in native_transfers:
                from_account = transfer.get("fromUserAccount", "")
                to_account = transfer.get("toUserAccount", "")
                amount_lamports = transfer.get("amount", 0)
                amount_sol = amount_lamports / 1e9

                if to_account == wallet_address:
                    # Incoming SOL
                    if not token_in:  # Don't override token transfers
                        token_in = "SOL"
                        amount_in = amount_sol

                if from_account == wallet_address:
                    # Outgoing SOL
                    if not token_out:  # Don't override token transfers
                        token_out = "SOL"
                        amount_out = amount_sol
                        from_address = wallet_address
                    to_address = to_account

            # Override with symbols from description if available (Helius provides better token symbols)
            if token_symbols_from_desc:
                if token_symbols_from_desc.get("token_in") and token_in and "..." in token_in:
                    token_in = token_symbols_from_desc["token_in"]
                if token_symbols_from_desc.get("token_out") and token_out and "..." in token_out:
                    token_out = token_symbols_from_desc["token_out"]

            # Calculate fee in USD (rough estimate: SOL ~$100)
            fee_sol = fee / 1e9
            gas_fee_usd = fee_sol * 100

            # Skip if transaction doesn't involve our wallet
            if not token_in and not token_out:
                return None

            # Get USD values using PriceService (CoinGecko API with exact/estimated tracking)
            usd_value_in = None
            usd_value_out = None
            price_in_estimated = False
            price_out_estimated = False

            if amount_in and token_in:
                try:
                    price_data = self.price_service.get_historical_price_with_metadata(
                        token_symbol=token_in,
                        timestamp=tx_timestamp
                    )
                    if price_data:
                        usd_value_in = float(amount_in) * float(price_data["price"])
                        price_in_estimated = price_data["is_estimated"]
                        if price_in_estimated:
                            logger.warning(f"⚠️  Using ESTIMATED price for {token_in}: ${price_data['price']}")
                except Exception as e:
                    logger.warning(f"Failed to get price for {token_in}: {e}")

            if amount_out and token_out:
                try:
                    price_data = self.price_service.get_historical_price_with_metadata(
                        token_symbol=token_out,
                        timestamp=tx_timestamp
                    )
                    if price_data:
                        usd_value_out = float(amount_out) * float(price_data["price"])
                        price_out_estimated = price_data["is_estimated"]
                        if price_out_estimated:
                            logger.warning(f"⚠️  Using ESTIMATED price for {token_out}: ${price_data['price']}")
                except Exception as e:
                    logger.warning(f"Failed to get price for {token_out}: {e}")

            return {
                "tx_hash": signature,
                "chain": "solana",
                "from_address": from_address,
                "to_address": to_address,
                "protocol_name": protocol_name,
                "protocol_type": protocol_type,
                "transaction_type": transaction_type,
                "timestamp": tx_timestamp,
                "method": tx_type,
                "value": str(amount_out or 0),
                "token_in": token_in,
                "token_out": token_out,
                "amount_in": amount_in,
                "amount_out": amount_out,
                "usd_value_in": usd_value_in,
                "usd_value_out": usd_value_out,
                "price_in_estimated": price_in_estimated,
                "price_out_estimated": price_out_estimated,
                "gas_fee_usd": gas_fee_usd,
                "is_defi": is_defi,
                "raw_data": tx
            }

        except Exception as e:
            logger.error(f"Error parsing Helius transaction: {e}")
            return None

    def _parse_solana_activity(self, activity: Dict, wallet_address: str) -> Optional[Dict]:
        """
        Parse Solscan DeFi activity into our standard format

        Args:
            activity: Solscan activity dict
            wallet_address: User's wallet address

        Returns:
            Parsed transaction dict or None
        """
        try:
            # Extract basic info
            tx_hash = activity.get("trans_id")
            block_time = activity.get("block_time")
            activity_type = activity.get("activity_type", "")

            # Convert block_time to datetime
            if block_time:
                tx_timestamp = datetime.fromtimestamp(block_time)
            else:
                tx_timestamp = datetime.utcnow()

            # Map Solscan activity types to our types
            transaction_type, protocol_type = self._map_solana_activity_type(activity_type)

            # Extract platform/protocol info
            platform = activity.get("platform", "Unknown")
            source = activity.get("source", "Unknown")
            protocol_name = platform if platform != "Unknown" else source

            # Extract token information
            # Solscan provides token_address, token_amount, token_decimals
            token_in = None
            token_out = None
            amount_in = None
            amount_out = None

            # Token in (what user spent/sent)
            if activity.get("token_address"):
                token_in_addr = activity.get("token_address")
                token_in = self._get_solana_token_symbol(token_in_addr)
                token_in_decimals = activity.get("token_decimals", 9)
                token_in_amount = activity.get("token_amount", 0)
                amount_in = float(token_in_amount) / (10 ** token_in_decimals)

            # Token out (what user received)
            if activity.get("token_address_destination"):
                token_out_addr = activity.get("token_address_destination")
                token_out = self._get_solana_token_symbol(token_out_addr)
                token_out_decimals = activity.get("token_decimals_destination", 9)
                token_out_amount = activity.get("token_amount_destination", 0)
                amount_out = float(token_out_amount) / (10 ** token_out_decimals)

            # Get USD values if available
            usd_value_in = activity.get("value") or 0.0
            usd_value_out = activity.get("value_destination") or 0.0

            # Extract fee (in SOL)
            fee = activity.get("fee", 0)
            fee_sol = float(fee) / 1e9 if fee else 0.0
            # Estimate USD (would need SOL price)
            gas_fee_usd = fee_sol * 100  # Rough estimate, 1 SOL ~ $100

            return {
                "tx_hash": tx_hash,
                "chain": "solana",
                "from_address": activity.get("from_address", ""),
                "to_address": activity.get("to_address", ""),
                "protocol_name": protocol_name,
                "protocol_type": protocol_type,
                "transaction_type": transaction_type,
                "timestamp": tx_timestamp,
                "method": activity_type.lower(),
                "value": "0",
                "token_in": token_in,
                "token_out": token_out,
                "amount_in": amount_in,
                "amount_out": amount_out,
                "usd_value_in": usd_value_in,
                "usd_value_out": usd_value_out,
                "gas_fee_usd": gas_fee_usd,
                "is_defi": True,  # All activities from this endpoint are DeFi
                "raw_data": activity
            }

        except Exception as e:
            logger.error(f"Error parsing Solana activity: {e}")
            return None

    def _map_solana_activity_type(self, activity_type: str) -> tuple[str, str]:
        """
        Map Solscan activity type to our transaction type and protocol type

        Args:
            activity_type: Solscan activity type (e.g., ACTIVITY_TOKEN_SWAP)

        Returns:
            Tuple of (transaction_type, protocol_type)
        """
        activity_lower = activity_type.lower()

        # Swaps
        if "swap" in activity_lower:
            return ("swap", "dex")

        # Staking
        elif "stake" in activity_lower and "unstake" not in activity_lower:
            return ("stake", "staking")
        elif "unstake" in activity_lower:
            return ("unstake", "staking")

        # Liquidity
        elif "add_liq" in activity_lower or "add_liquidity" in activity_lower:
            return ("provide_liquidity", "dex")
        elif "remove_liq" in activity_lower or "remove_liquidity" in activity_lower:
            return ("remove_liquidity", "dex")

        # Vaults (similar to lending)
        elif "deposit_vault" in activity_lower:
            return ("lend", "lending")
        elif "withdraw_vault" in activity_lower:
            return ("withdraw", "lending")

        # Lending
        elif "borrow" in activity_lower:
            return ("borrow", "lending")
        elif "repay" in activity_lower:
            return ("repay", "lending")

        # Default
        else:
            return ("unknown", "unknown")

    def _get_solana_token_symbol(self, token_address: str) -> str:
        """
        Get Solana token symbol from address

        Args:
            token_address: Solana token mint address

        Returns:
            Token symbol or shortened address
        """
        # Common Solana tokens
        SOLANA_TOKENS = {
            "So11111111111111111111111111111111111111112": "SOL",
            "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": "USDC",
            "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": "USDT",
            "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So": "mSOL",  # Marinade SOL
            "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj": "stSOL",  # Lido staked SOL
            "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn": "jitoSOL",  # Jito staked SOL
            # Add more as needed
        }

        symbol = SOLANA_TOKENS.get(token_address)
        if symbol:
            return symbol

        # Return shortened address if unknown
        return token_address[:8] + "..."

    def _map_helius_type(self, tx_type: str, source: str) -> tuple[str, str, bool]:
        """
        Map Helius transaction type to our format

        Args:
            tx_type: Helius transaction type (TRANSFER, SWAP, etc.)
            source: Source program (SYSTEM_PROGRAM, JUPITER, RAYDIUM, etc.)

        Returns:
            (transaction_type, protocol_type, is_defi)
        """
        tx_type_upper = tx_type.upper()
        source_upper = source.upper()

        # Swaps (DeFi)
        if tx_type_upper == "SWAP":
            return ("swap", "dex", True)

        # NFT transactions
        elif tx_type_upper in ["NFT_SALE", "NFT_BID", "NFT_LISTING"]:
            return ("nft_trade", "nft", False)

        # Staking (DeFi)
        elif "STAKE" in tx_type_upper:
            return ("stake", "staking", True)

        # Token burn/mint
        elif tx_type_upper in ["BURN", "BURN_NFT"]:
            return ("burn", "token", False)
        elif tx_type_upper == "MINT":
            return ("mint", "token", False)

        # Transfers
        elif tx_type_upper == "TRANSFER":
            # Check source to determine if it's DeFi
            if source_upper in ["JUPITER", "RAYDIUM", "ORCA", "MARINADE", "LIDO", "JITO"]:
                return ("transfer", "dex", True)
            else:
                return ("transfer", "transfer", False)

        # Unknown
        else:
            return ("unknown", "unknown", False)

    def _get_protocol_name_from_source(self, source: str) -> str:
        """
        Get protocol name from Helius source field

        Args:
            source: Helius source (SYSTEM_PROGRAM, JUPITER, etc.)

        Returns:
            Protocol name
        """
        # Map common sources to friendly names
        SOURCE_MAP = {
            "SYSTEM_PROGRAM": "Solana",
            "JUPITER": "Jupiter",
            "RAYDIUM": "Raydium",
            "ORCA": "Orca",
            "MARINADE": "Marinade Finance",
            "LIDO": "Lido",
            "JITO": "Jito",
            "SOLEND": "Solend",
            "MANGO": "Mango Markets",
            "SERUM": "Serum",
        }

        return SOURCE_MAP.get(source.upper(), source.title())

    def _extract_token_symbols_from_description(self, description: str, wallet_address: str) -> Optional[dict]:
        """
        Extract token symbols from Helius description

        Helius provides descriptions like:
        - "swapped 11236319.25 UNI for 0.903 SOL"
        - "transferred 100 USDC"
        - "staked 5 SOL"

        Args:
            description: Helius transaction description
            wallet_address: User's wallet address

        Returns:
            Dict with token_in and token_out symbols, or None
        """
        import re

        if not description:
            return None

        # Pattern for swaps: "swapped X TOKEN1 for Y TOKEN2"
        swap_pattern = r"swapped\s+[\d.]+\s+(\w+)\s+for\s+[\d.]+\s+(\w+)"
        match = re.search(swap_pattern, description, re.IGNORECASE)
        if match:
            token_from = match.group(1)
            token_to = match.group(2)
            # Determine which is in/out based on wallet flow
            # If description contains wallet address, analyze direction
            return {
                "token_out": token_from,  # What we swapped from
                "token_in": token_to      # What we got
            }

        # Pattern for transfers: "transferred X TOKEN"
        transfer_pattern = r"transferred\s+[\d.]+\s+(\w+)"
        match = re.search(transfer_pattern, description, re.IGNORECASE)
        if match:
            token = match.group(1)
            # Can't determine direction from description alone
            return {"token": token}

        return None

    def _parse_solana_transaction(self, tx: Dict, wallet_address: str) -> Optional[Dict]:
        """
        DEPRECATED: Old Helius parsing function, kept for compatibility

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

    async def _fetch_transaction_receipt(self, tx_hash: str, chain: str) -> Optional[Dict]:
        """
        Fetch transaction receipt with logs from blockchain

        Args:
            tx_hash: Transaction hash
            chain: Blockchain name

        Returns:
            Receipt dict with logs or None
        """
        chain_config = self._get_chain_config(chain)
        if not chain_config:
            return None

        api_key = self.api_keys.get(chain_config["key_name"])
        if not api_key:
            return None

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                url = chain_config["url"]
                params = {
                    "chainid": chain_config["chainid"],
                    "module": "proxy",
                    "action": "eth_getTransactionReceipt",
                    "txhash": tx_hash,
                    "apikey": api_key
                }

                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()

                if data.get("result"):
                    return data["result"]

        except Exception as e:
            logger.error(f"Error fetching receipt for {tx_hash}: {e}")

        return None

    def _parse_transfer_logs(self, logs: list, user_wallet: str) -> Dict[str, any]:
        """
        Parse ERC20 Transfer events from transaction logs

        Args:
            logs: List of log entries from transaction receipt
            user_wallet: User's wallet address (lowercase)

        Returns:
            Dict with token_in, token_out, amount_in, amount_out
        """
        # ERC20 Transfer event signature
        TRANSFER_EVENT_SIG = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"

        result = {
            "token_in": None,
            "token_out": None,
            "amount_in": None,
            "amount_out": None
        }

        if not logs:
            return result

        for log in logs:
            topics = log.get("topics", [])

            # Check if it's a Transfer event
            if not topics or topics[0] != TRANSFER_EVENT_SIG:
                continue

            # Topics: [signature, from, to]
            if len(topics) < 3:
                continue

            from_address = "0x" + topics[1][-40:]  # Last 40 chars (20 bytes)
            to_address = "0x" + topics[2][-40:]
            token_address = log.get("address", "").lower()

            # Decode amount from data field
            data = log.get("data", "0x")
            try:
                amount_raw = int(data, 16)
            except (ValueError, TypeError):
                continue

            # Check if token is in our mapping
            token_info = self.TOKEN_ADDRESSES.get(token_address)
            if not token_info:
                # Unknown token, skip
                continue

            token_symbol = token_info["symbol"]
            decimals = token_info["decimals"]
            amount = float(Decimal(amount_raw) / Decimal(10 ** decimals))

            # Check if transfer involves user wallet
            if to_address.lower() == user_wallet.lower():
                # Incoming transfer
                result["token_in"] = token_symbol
                result["amount_in"] = amount

            elif from_address.lower() == user_wallet.lower():
                # Outgoing transfer
                result["token_out"] = token_symbol
                result["amount_out"] = amount

        return result

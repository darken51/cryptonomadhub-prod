"""
Transaction Decoder Service

Decodes DeFi transaction input data using contract ABIs
Extracts token addresses, amounts, and operation details
"""

from typing import Dict, List, Optional, Tuple
from web3 import Web3
from eth_abi import decode
import json
import logging

logger = logging.getLogger(__name__)


class TransactionDecoder:
    """
    Decode DeFi transactions using contract ABIs

    Supports:
    - Uniswap V2/V3
    - ERC20 transfers
    - Common DeFi protocols
    """

    # Uniswap V2 Router ABI (simplified - just swap functions)
    UNISWAP_V2_SWAP_ABI = [
        {
            "name": "swapExactTokensForTokens",
            "inputs": [
                {"name": "amountIn", "type": "uint256"},
                {"name": "amountOutMin", "type": "uint256"},
                {"name": "path", "type": "address[]"},
                {"name": "to", "type": "address"},
                {"name": "deadline", "type": "uint256"}
            ]
        },
        {
            "name": "swapExactETHForTokens",
            "inputs": [
                {"name": "amountOutMin", "type": "uint256"},
                {"name": "path", "type": "address[]"},
                {"name": "to", "type": "address"},
                {"name": "deadline", "type": "uint256"}
            ]
        },
        {
            "name": "swapExactTokensForETH",
            "inputs": [
                {"name": "amountIn", "type": "uint256"},
                {"name": "amountOutMin", "type": "uint256"},
                {"name": "path", "type": "address[]"},
                {"name": "to", "type": "address"},
                {"name": "deadline", "type": "uint256"}
            ]
        }
    ]

    # ERC20 Transfer ABI
    ERC20_ABI = [
        {
            "name": "transfer",
            "inputs": [
                {"name": "recipient", "type": "address"},
                {"name": "amount", "type": "uint256"}
            ]
        },
        {
            "name": "approve",
            "inputs": [
                {"name": "spender", "type": "address"},
                {"name": "amount", "type": "uint256"}
            ]
        },
        {
            "name": "transferFrom",
            "inputs": [
                {"name": "sender", "type": "address"},
                {"name": "recipient", "type": "address"},
                {"name": "amount", "type": "uint256"}
            ]
        }
    ]

    # Known token addresses with symbols
    TOKEN_ADDRESSES = {
        # Ethereum mainnet - Major tokens
        "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": "WETH",
        "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": "USDC",
        "0xdac17f958d2ee523a2206206994597c13d831ec7": "USDT",
        "0x6b175474e89094c44da98b954eedeac495271d0f": "DAI",
        "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599": "WBTC",
        "0x514910771af9ca656af840dff83e8264ecf986ca": "LINK",
        "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984": "UNI",
        "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9": "AAVE",
        "0xc00e94cb662c3520282e6f5717214004a7f26888": "COMP",
        "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce": "SHIB",
        "0x4d224452801aced8b2f0aebe155379bb5d594381": "APE",
        "0x6982508145454ce325ddbe47a25d4ec3d2311933": "PEPE",
        "0x0f5d2fb29fb7d3cfee444a200298f468908cc942": "MANA",
        "0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b": "CVX",
        "0xd533a949740bb3306d119cc777fa900ba034cd52": "CRV",
        "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2": "MKR",
        "0x1258d60b224c0c5cd888d37bbf31aa5fcfb7e870": "PSYOP",  # Example meme token
        "0x5a98fcbea516cf06857215779fd812ca3bef1b32": "LDO",
        "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2": "SUSHI",
        "0xae78736cd615f374d3085123a210448e74fc6393": "rETH",
        "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0": "MATIC",
        "0xc18360217d8f7ab5e7c516566761ea12ce7f9d72": "ENS",
        "0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0": "FXS",
        "0xba100000625a3754423978a60c9317c58a424e3d": "BAL",
        "0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e": "YFI",
        "0xa693b19d2931d498c5b318df961919bb4aee87a5": "UST",
        "0x853d955acef822db058eb8505911ed77f175b99e": "FRAX",
        "0x056fd409e1d7a124bd7017459dfea2f387b6d5cd": "GUSD",
        "0x8e870d67f660d95d5be530380d0ec0bd388289e1": "USDP",

        # Base
        "0x4200000000000000000000000000000000000006": "WETH",
        "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913": "USDC",
        "0x50c5725949a6f0c72e6c4a641f24049a917db0cb": "DAI",

        # Polygon
        "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270": "WMATIC",
        "0x2791bca1f2de4661ed88a30c99a7a9449aa84174": "USDC",
        "0xc2132d05d31c914a87c6611c10748aeb04b58e8f": "USDT",
    }

    def __init__(self):
        self.w3 = Web3()

    def decode_transaction(self, input_data: str, value: str = "0") -> Dict:
        """
        Decode transaction input data

        Args:
            input_data: Transaction input (0x...)
            value: Transaction value in Wei

        Returns:
            Dict with decoded information
        """
        if not input_data or len(input_data) < 10:
            return {"error": "Invalid input data"}

        # Extract method signature (first 4 bytes / 10 chars including 0x)
        method_sig = input_data[:10]

        # Try to decode based on known signatures
        result = self._decode_by_signature(method_sig, input_data, value)

        if result:
            return result

        return {"error": "Unknown method signature", "signature": method_sig}

    def _decode_by_signature(self, method_sig: str, input_data: str, value: str) -> Optional[Dict]:
        """Decode transaction by method signature"""

        # Uniswap V2 swaps
        if method_sig == "0x38ed1739":  # swapExactTokensForTokens
            return self._decode_swap_exact_tokens_for_tokens(input_data)

        elif method_sig == "0x7ff36ab5":  # swapExactETHForTokens
            return self._decode_swap_exact_eth_for_tokens(input_data, value)

        elif method_sig == "0x18cbafe5":  # swapExactTokensForETH
            return self._decode_swap_exact_tokens_for_eth(input_data)

        # ERC20 operations
        elif method_sig == "0xa9059cbb":  # transfer
            return self._decode_erc20_transfer(input_data)

        elif method_sig == "0x095ea7b3":  # approve
            return self._decode_erc20_approve(input_data)

        elif method_sig == "0x23b872dd":  # transferFrom
            return self._decode_erc20_transfer_from(input_data)

        # Uniswap V3 / Universal Router (complex)
        elif method_sig == "0x3593564c":  # execute (Universal Router)
            return self._decode_universal_router(input_data, value)

        # WETH deposit/withdraw
        elif method_sig == "0xd0e30db0":  # deposit() to WETH
            return self._decode_weth_deposit(value)

        elif method_sig == "0x2e1a7d4d":  # withdraw(uint256) from WETH
            return self._decode_weth_withdraw(input_data)

        # Staking
        elif method_sig == "0xa694fc3a":  # stake(uint256)
            return self._decode_stake(input_data, value)

        return None

    def _decode_swap_exact_tokens_for_tokens(self, input_data: str) -> Dict:
        """Decode swapExactTokensForTokens"""
        try:
            # Remove 0x and method sig
            params = input_data[10:]

            # Decode parameters: (uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)
            decoded = decode(
                ['uint256', 'uint256', 'address[]', 'address', 'uint256'],
                bytes.fromhex(params)
            )

            amount_in = decoded[0]
            amount_out_min = decoded[1]
            path = decoded[2]

            token_in = self._get_token_symbol(path[0])
            token_out = self._get_token_symbol(path[-1])

            return {
                "operation": "swap",
                "token_in": token_in,
                "token_in_address": path[0].lower(),
                "amount_in": amount_in,
                "token_out": token_out,
                "token_out_address": path[-1].lower(),
                "amount_out_min": amount_out_min,
                "path": [addr.lower() for addr in path]
            }
        except Exception as e:
            logger.error(f"Error decoding swapExactTokensForTokens: {e}")
            return {"error": str(e)}

    def _decode_swap_exact_eth_for_tokens(self, input_data: str, value: str) -> Dict:
        """Decode swapExactETHForTokens"""
        try:
            params = input_data[10:]

            # Decode: (uint256 amountOutMin, address[] path, address to, uint256 deadline)
            decoded = decode(
                ['uint256', 'address[]', 'address', 'uint256'],
                bytes.fromhex(params)
            )

            amount_out_min = decoded[0]
            path = decoded[1]

            token_out = self._get_token_symbol(path[-1])

            return {
                "operation": "swap",
                "token_in": "ETH",
                "token_in_address": "native",
                "amount_in": int(value),
                "token_out": token_out,
                "token_out_address": path[-1].lower(),
                "amount_out_min": amount_out_min,
                "path": [addr.lower() for addr in path]
            }
        except Exception as e:
            logger.error(f"Error decoding swapExactETHForTokens: {e}")
            return {"error": str(e)}

    def _decode_swap_exact_tokens_for_eth(self, input_data: str) -> Dict:
        """Decode swapExactTokensForETH"""
        try:
            params = input_data[10:]

            decoded = decode(
                ['uint256', 'uint256', 'address[]', 'address', 'uint256'],
                bytes.fromhex(params)
            )

            amount_in = decoded[0]
            amount_out_min = decoded[1]
            path = decoded[2]

            token_in = self._get_token_symbol(path[0])

            return {
                "operation": "swap",
                "token_in": token_in,
                "token_in_address": path[0].lower(),
                "amount_in": amount_in,
                "token_out": "ETH",
                "token_out_address": "native",
                "amount_out_min": amount_out_min,
                "path": [addr.lower() for addr in path]
            }
        except Exception as e:
            logger.error(f"Error decoding swapExactTokensForETH: {e}")
            return {"error": str(e)}

    def _decode_erc20_transfer(self, input_data: str) -> Dict:
        """Decode ERC20 transfer"""
        try:
            params = input_data[10:]
            decoded = decode(['address', 'uint256'], bytes.fromhex(params))

            return {
                "operation": "transfer",
                "recipient": decoded[0].lower(),
                "amount": decoded[1]
            }
        except Exception as e:
            return {"error": str(e)}

    def _decode_erc20_approve(self, input_data: str) -> Dict:
        """Decode ERC20 approve"""
        try:
            params = input_data[10:]
            decoded = decode(['address', 'uint256'], bytes.fromhex(params))

            return {
                "operation": "approve",
                "spender": decoded[0].lower(),
                "amount": decoded[1]
            }
        except Exception as e:
            return {"error": str(e)}

    def _decode_erc20_transfer_from(self, input_data: str) -> Dict:
        """Decode ERC20 transferFrom"""
        try:
            params = input_data[10:]
            decoded = decode(['address', 'address', 'uint256'], bytes.fromhex(params))

            return {
                "operation": "transferFrom",
                "sender": decoded[0].lower(),
                "recipient": decoded[1].lower(),
                "amount": decoded[2]
            }
        except Exception as e:
            return {"error": str(e)}

    def _decode_universal_router(self, input_data: str, value: str) -> Dict:
        """Decode Uniswap Universal Router execute()"""
        try:
            # Universal Router: execute(bytes commands, bytes[] inputs, uint256 deadline)
            params = input_data[10:]

            # Decode the three parameters
            decoded = decode(
                ['bytes', 'bytes[]', 'uint256'],
                bytes.fromhex(params)
            )

            commands = decoded[0]  # bytes of command codes
            inputs = decoded[1]    # array of encoded inputs for each command
            deadline = decoded[2]

            # Commands mapping (from UniversalRouter.sol)
            COMMAND_NAMES = {
                0x00: "V3_SWAP_EXACT_IN",
                0x01: "V3_SWAP_EXACT_OUT",
                0x08: "V2_SWAP_EXACT_IN",
                0x09: "V2_SWAP_EXACT_OUT",
                0x0b: "WRAP_ETH",
                0x0c: "UNWRAP_WETH",
            }

            # Parse each command
            token_in = None
            token_out = None
            amount_in = None
            path = []

            for i, cmd_byte in enumerate(commands):
                cmd_name = COMMAND_NAMES.get(cmd_byte, f"UNKNOWN_{hex(cmd_byte)}")

                if i < len(inputs):
                    cmd_input = inputs[i]

                    # V3_SWAP_EXACT_IN or V2_SWAP_EXACT_IN
                    if cmd_byte in [0x00, 0x08]:
                        # Try to decode swap parameters
                        try:
                            # V3 swap: (address recipient, uint256 amountIn, uint256 amountOutMin, bytes path, bool payerIsUser)
                            if cmd_byte == 0x00:
                                swap_decoded = decode(
                                    ['address', 'uint256', 'uint256', 'bytes', 'bool'],
                                    cmd_input
                                )
                                amount_in = swap_decoded[1]
                                path_bytes = swap_decoded[3]

                                # V3 path encoding: token0(20) + fee(3) + token1(20) + fee(3) + token2(20)...
                                if len(path_bytes) >= 20:
                                    # Extract first and last token addresses
                                    token_in_addr = '0x' + path_bytes[:20].hex()
                                    # Last token is at the end
                                    token_out_addr = '0x' + path_bytes[-20:].hex()

                                    token_in = self._get_token_symbol(token_in_addr)
                                    token_out = self._get_token_symbol(token_out_addr)
                                    path = [token_in_addr.lower(), token_out_addr.lower()]

                            # V2 swap: (address recipient, uint256 amountIn, uint256 amountOutMin, address[] path, bool payerIsUser)
                            elif cmd_byte == 0x08:
                                swap_decoded = decode(
                                    ['address', 'uint256', 'uint256', 'address[]', 'bool'],
                                    cmd_input
                                )
                                amount_in = swap_decoded[1]
                                path_addresses = swap_decoded[3]

                                if len(path_addresses) >= 2:
                                    token_in = self._get_token_symbol(path_addresses[0])
                                    token_out = self._get_token_symbol(path_addresses[-1])
                                    path = [addr.lower() for addr in path_addresses]

                        except Exception as e:
                            logger.error(f"Error decoding swap command: {e}")
                            continue

                    # WRAP_ETH
                    elif cmd_byte == 0x0b:
                        # If we're wrapping ETH and have value, that's our token_in
                        if int(value) > 0:
                            token_in = "ETH"
                            amount_in = int(value)

            # Build result
            if token_in and token_out:
                return {
                    "operation": "swap",
                    "token_in": token_in,
                    "token_in_address": path[0] if path else "native",
                    "amount_in": amount_in or int(value),
                    "token_out": token_out,
                    "token_out_address": path[-1] if path else "unknown",
                    "path": path
                }
            elif token_in and int(value) > 0:
                # We know input but not output yet
                return {
                    "operation": "swap",
                    "token_in": token_in,
                    "amount_in": int(value),
                    "token_out": "UNKNOWN",
                    "note": "Partial Universal Router decode"
                }

            return {
                "operation": "swap",
                "note": "Universal Router - could not extract tokens"
            }

        except Exception as e:
            logger.error(f"Error decoding Universal Router: {e}")
            return {"error": str(e)}

    def _decode_weth_deposit(self, value: str) -> Dict:
        """Decode WETH deposit (wrap ETH)"""
        try:
            return {
                "operation": "wrap",
                "token_in": "ETH",
                "amount_in": int(value),
                "token_out": "WETH",
                "token_out_address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
            }
        except Exception as e:
            return {"error": str(e)}

    def _decode_weth_withdraw(self, input_data: str) -> Dict:
        """Decode WETH withdraw (unwrap to ETH)"""
        try:
            params = input_data[10:]
            decoded = decode(['uint256'], bytes.fromhex(params))

            return {
                "operation": "unwrap",
                "token_in": "WETH",
                "token_in_address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                "amount_in": decoded[0],
                "token_out": "ETH"
            }
        except Exception as e:
            return {"error": str(e)}

    def _decode_stake(self, input_data: str, value: str) -> Dict:
        """Decode staking transaction"""
        try:
            params = input_data[10:]

            # Most stake functions: stake(uint256 amount)
            if len(params) >= 64:
                decoded = decode(['uint256'], bytes.fromhex(params[:64]))

                return {
                    "operation": "stake",
                    "amount_in": decoded[0]
                }

            # If no amount, use transaction value
            if int(value) > 0:
                return {
                    "operation": "stake",
                    "token_in": "ETH",
                    "amount_in": int(value)
                }

            return {
                "operation": "stake"
            }
        except Exception as e:
            return {"error": str(e)}

    def _get_token_symbol(self, address: str) -> str:
        """Get token symbol from address"""
        address = address.lower()
        return self.TOKEN_ADDRESSES.get(address, address[:10] + "...")

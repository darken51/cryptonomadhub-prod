"""
NFT Parser Service

Parses NFT transactions (ERC-721, ERC-1155) from blockchain data.
Detects mints, sales, transfers with marketplace integration.
"""

from typing import Optional, Dict, List
from datetime import datetime
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)


class NFTParser:
    """
    Parse NFT transactions for tax reporting
    
    Supports:
    - ERC-721 (single NFTs)
    - ERC-1155 (semi-fungible tokens)
    - Marketplaces: OpenSea, Blur, LooksRare, X2Y2, Rarible
    """
    
    # Known NFT marketplaces
    MARKETPLACES = {
        "0x00000000006c3852cbef3e08e8df289169ede581": "OpenSea Seaport",
        "0x7be8076f4ea4a4ad08075c2508e481d6c946d12b": "OpenSea (old)",
        "0x74312363e45dcaba76c59ec49a7aa8a65a67ead3": "X2Y2",
        "0x59728544b08ab483533076417fbbb2fd0b17ce3a": "LooksRare",
        "0x39da41747a83aee658334415666f3ef92dd0d541": "Blur",
        "0xcd4ec7b66fbc029c116ba9ffb3e59351c20b5b06": "Rarible",
    }
    
    # ERC-721 Transfer event signature
    ERC721_TRANSFER = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
    
    # ERC-1155 TransferSingle event
    ERC1155_TRANSFER_SINGLE = "0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62"
    
    def __init__(self, price_service):
        self.price_service = price_service
    
    def parse_nft_transaction(
        self,
        tx: Dict,
        user_wallet: str,
        chain: str
    ) -> Optional[Dict]:
        """
        Parse a blockchain transaction to detect NFT activity
        
        Args:
            tx: Transaction dict from blockchain API
            user_wallet: User's wallet address
            chain: Blockchain name
        
        Returns:
            Parsed NFT transaction dict or None
        """
        user_wallet = user_wallet.lower()
        
        # Check if transaction involves known NFT marketplace
        to_address = tx.get("to", "").lower()
        from_address = tx.get("from", "").lower()
        
        marketplace = None
        if to_address in self.MARKETPLACES:
            marketplace = self.MARKETPLACES[to_address]
        
        # Parse transaction logs for Transfer events
        logs = tx.get("logs", [])
        
        for log in logs:
            topics = log.get("topics", [])
            if not topics:
                continue
            
            event_sig = topics[0].lower() if topics else None
            
            # ERC-721 Transfer
            if event_sig == self.ERC721_TRANSFER and len(topics) >= 4:
                return self._parse_erc721_transfer(
                    log, tx, user_wallet, chain, marketplace
                )
            
            # ERC-1155 TransferSingle
            elif event_sig == self.ERC1155_TRANSFER_SINGLE:
                return self._parse_erc1155_transfer(
                    log, tx, user_wallet, chain, marketplace
                )
        
        return None
    
    def _parse_erc721_transfer(
        self,
        log: Dict,
        tx: Dict,
        user_wallet: str,
        chain: str,
        marketplace: Optional[str]
    ) -> Optional[Dict]:
        """Parse ERC-721 Transfer event"""
        topics = log.get("topics", [])
        
        # ERC-721: Transfer(address indexed from, address indexed to, uint256 indexed tokenId)
        if len(topics) < 4:
            return None
        
        from_addr = "0x" + topics[1][-40:]
        to_addr = "0x" + topics[2][-40:]
        token_id = str(int(topics[3], 16))
        contract_address = log.get("address", "").lower()
        
        # Determine transaction type
        is_mint = from_addr == "0x0000000000000000000000000000000000000000"
        is_burn = to_addr == "0x0000000000000000000000000000000000000000"
        is_incoming = to_addr.lower() == user_wallet
        is_outgoing = from_addr.lower() == user_wallet
        
        if not (is_incoming or is_outgoing):
            return None  # Not user's transaction
        
        # Determine transaction type
        if is_mint and is_incoming:
            transaction_type = "mint"
        elif is_burn and is_outgoing:
            transaction_type = "burn"
        elif is_incoming and marketplace:
            transaction_type = "purchase"
        elif is_outgoing and marketplace:
            transaction_type = "sale"
        elif is_incoming:
            transaction_type = "transfer_in"
        elif is_outgoing:
            transaction_type = "transfer_out"
        else:
            return None
        
        # Get price from transaction value
        value_wei = int(tx.get("value", "0"))
        price_eth = Decimal(value_wei) / Decimal(10 ** 18)
        
        # Get ETH price at time
        timestamp = datetime.fromtimestamp(int(tx.get("timeStamp", 0)))
        try:
            eth_price_usd = self.price_service.get_historical_price(
                token_symbol="ETH",
                timestamp=timestamp
            )
            price_usd = float(price_eth) * float(eth_price_usd) if eth_price_usd else None
        except:
            price_usd = None
        
        # Gas fees
        gas_used = int(tx.get("gasUsed", 0))
        gas_price = int(tx.get("gasPrice", 0))
        gas_fee_eth = Decimal(gas_used * gas_price) / Decimal(10 ** 18)
        gas_fee_usd = float(gas_fee_eth) * float(eth_price_usd) if eth_price_usd else None
        
        return {
            "tx_hash": tx.get("hash"),
            "chain": chain,
            "timestamp": timestamp,
            "block_number": int(tx.get("blockNumber", 0)),
            "contract_address": contract_address,
            "token_id": token_id,
            "token_standard": "ERC-721",
            "transaction_type": transaction_type,
            "price_eth": float(price_eth),
            "price_usd": price_usd,
            "gas_fee_eth": float(gas_fee_eth),
            "gas_fee_usd": gas_fee_usd,
            "marketplace": marketplace,
            "buyer_address": to_addr if is_outgoing else None,
            "seller_address": from_addr if is_incoming else None,
        }
    
    def _parse_erc1155_transfer(
        self,
        log: Dict,
        tx: Dict,
        user_wallet: str,
        chain: str,
        marketplace: Optional[str]
    ) -> Optional[Dict]:
        """Parse ERC-1155 TransferSingle event"""
        # Similar logic to ERC-721 but for semi-fungible tokens
        # TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)
        topics = log.get("topics", [])
        
        if len(topics) < 4:
            return None
        
        from_addr = "0x" + topics[2][-40:]
        to_addr = "0x" + topics[3][-40:]
        
        is_incoming = to_addr.lower() == user_wallet
        is_outgoing = from_addr.lower() == user_wallet
        
        if not (is_incoming or is_outgoing):
            return None
        
        # Simplified parsing (token_id and amount would need data field parsing)
        return {
            "tx_hash": tx.get("hash"),
            "chain": chain,
            "timestamp": datetime.fromtimestamp(int(tx.get("timeStamp", 0))),
            "contract_address": log.get("address", "").lower(),
            "token_standard": "ERC-1155",
            "transaction_type": "transfer_in" if is_incoming else "transfer_out",
            "marketplace": marketplace,
        }

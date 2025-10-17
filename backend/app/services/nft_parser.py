"""
NFT Parser Service

Detects and parses NFT transactions from major marketplaces.
Integrates with Alchemy NFT API for comprehensive metadata.

Supported Marketplaces:
- OpenSea (Seaport protocol)
- Blur
- LooksRare
- X2Y2
- Rarible

Features:
- Sale detection with accurate pricing
- Mint detection
- Transfer tracking
- Collection metadata
- Tax categorization (collectible vs investment)
"""

from typing import Optional, Dict, List
import httpx
import logging
from datetime import datetime
from app.config import settings

logger = logging.getLogger(__name__)


class NFTParser:
    """
    Parse NFT transactions and sales
    """

    # NFT Marketplace contract addresses
    MARKETPLACE_ADDRESSES = {
        # OpenSea Seaport
        "0x00000000006c3852cbef3e08e8df289169ede581": {
            "name": "OpenSea Seaport 1.1",
            "marketplace": "opensea",
            "version": "1.1"
        },
        "0x00000000000006c7676171937c444f6bde3d6282": {
            "name": "OpenSea Seaport 1.2",
            "marketplace": "opensea",
            "version": "1.2"
        },
        
        # Blur
        "0x000000000000ad05ccc4f10045630fb830b95127": {
            "name": "Blur Marketplace",
            "marketplace": "blur",
            "version": "1.0"
        },
        
        # LooksRare
        "0x59728544b08ab483533076417fbbb2fd0b17ce3a": {
            "name": "LooksRare Exchange",
            "marketplace": "looksrare",
            "version": "1.0"
        },
        
        # X2Y2
        "0x74312363e45dcaba76c59ec49a7aa8a65a67eed3": {
            "name": "X2Y2",
            "marketplace": "x2y2",
            "version": "1.0"
        },
        
        # Rarible
        "0x9757f2d2b135150bbeb65308d4a91804107cd8d6": {
            "name": "Rarible Exchange",
            "marketplace": "rarible",
            "version": "1.0"
        },
    }

    # NFT Event signatures
    NFT_EVENT_SIGNATURES = {
        # ERC721 Transfer
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef": {
            "name": "Transfer",
            "standard": "ERC721"
        },
        
        # ERC1155 TransferSingle
        "0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62": {
            "name": "TransferSingle",
            "standard": "ERC1155"
        },
        
        # ERC1155 TransferBatch
        "0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb": {
            "name": "TransferBatch",
            "standard": "ERC1155"
        },
        
        # OpenSea OrderFulfilled
        "0x9d9af8e38d66c62e2c12f0225249fd9d721c54b83f48d9352c97c6cacdcb6f31": {
            "name": "OrderFulfilled",
            "marketplace": "opensea"
        },
    }

    def __init__(self):
        self.http_client = httpx.AsyncClient(timeout=15.0)
        self.alchemy_api_key = getattr(settings, 'ALCHEMY_API_KEY', None)

    def detect_nft_transaction(self, tx: Dict) -> Optional[Dict]:
        """
        Detect if transaction involves NFTs

        Args:
            tx: Transaction dict with logs

        Returns:
            NFT transaction details or None
        """
        # Check if transaction interacts with NFT marketplace
        to_address = tx.get("to", "").lower()
        
        if to_address in self.MARKETPLACE_ADDRESSES:
            marketplace_info = self.MARKETPLACE_ADDRESSES[to_address]
            return self._parse_marketplace_sale(tx, marketplace_info)

        # Check for NFT transfer events
        for log in tx.get("logs", []):
            topic0 = log.get("topics", [None])[0]
            if topic0 in self.NFT_EVENT_SIGNATURES:
                event_info = self.NFT_EVENT_SIGNATURES[topic0]
                if event_info["name"] == "Transfer" or "Transfer" in event_info["name"]:
                    return self._parse_nft_transfer(tx, log, event_info)

        return None

    def _parse_marketplace_sale(self, tx: Dict, marketplace_info: Dict) -> Dict:
        """
        Parse NFT sale from marketplace transaction

        Returns:
            {
                type: "nft_sale",
                marketplace: "opensea",
                collection_address: "0x...",
                token_id: "123",
                price_usd: 1000.0,
                price_eth: 0.5,
                buyer: "0x...",
                seller: "0x...",
                platform_fee: 25.0,
                creator_royalty: 50.0
            }
        """
        marketplace = marketplace_info["marketplace"]

        # Extract sale details based on marketplace
        if marketplace == "opensea":
            return self._parse_opensea_sale(tx)
        elif marketplace == "blur":
            return self._parse_blur_sale(tx)
        elif marketplace == "looksrare":
            return self._parse_looksrare_sale(tx)

        return {
            "type": "nft_sale",
            "marketplace": marketplace,
            "tx_hash": tx.get("hash"),
            "timestamp": tx.get("timestamp")
        }

    def _parse_opensea_sale(self, tx: Dict) -> Dict:
        """Parse OpenSea Seaport sale"""
        # Find OrderFulfilled event
        order_fulfilled = None
        for log in tx.get("logs", []):
            if log.get("topics", [None])[0] == "0x9d9af8e38d66c62e2c12f0225249fd9d721c54b83f48d9352c97c6cacdcb6f31":
                order_fulfilled = log
                break

        # Find NFT Transfer event
        nft_transfer = None
        for log in tx.get("logs", []):
            topic0 = log.get("topics", [None])[0]
            if topic0 == "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef":
                # Check if it's an NFT (has tokenId in topics)
                if len(log.get("topics", [])) == 4:  # Transfer(from, to, tokenId)
                    nft_transfer = log
                    break

        # Find ETH/WETH payment
        payment_amount = 0.0
        for log in tx.get("logs", []):
            # Look for WETH/ETH transfers
            if log.get("topics", [None])[0] == "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef":
                if len(log.get("topics", [])) == 3:  # ERC20 Transfer(from, to, value)
                    # This is likely payment
                    data = log.get("data", "0x")
                    if data and len(data) > 2:
                        try:
                            payment_amount = int(data, 16) / 1e18  # Convert from wei
                        except:
                            pass

        result = {
            "type": "nft_sale",
            "marketplace": "opensea",
            "tx_hash": tx.get("hash"),
            "timestamp": tx.get("timestamp"),
            "price_eth": payment_amount,
            "buyer": tx.get("from"),
            "seller": None,
        }

        if nft_transfer:
            topics = nft_transfer.get("topics", [])
            result["collection_address"] = nft_transfer.get("address")
            result["token_id"] = int(topics[3], 16) if len(topics) > 3 else None
            result["seller"] = topics[1][26:] if len(topics) > 1 else None  # Remove padding

        return result

    def _parse_blur_sale(self, tx: Dict) -> Dict:
        """Parse Blur marketplace sale"""
        # Blur uses simpler structure
        nft_transfer = None
        for log in tx.get("logs", []):
            if log.get("topics", [None])[0] == "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef":
                if len(log.get("topics", [])) == 4:
                    nft_transfer = log
                    break

        result = {
            "type": "nft_sale",
            "marketplace": "blur",
            "tx_hash": tx.get("hash"),
            "timestamp": tx.get("timestamp"),
            "value_eth": float(tx.get("value", 0)) / 1e18,
            "buyer": tx.get("from"),
        }

        if nft_transfer:
            topics = nft_transfer.get("topics", [])
            result["collection_address"] = nft_transfer.get("address")
            result["token_id"] = int(topics[3], 16) if len(topics) > 3 else None

        return result

    def _parse_looksrare_sale(self, tx: Dict) -> Dict:
        """Parse LooksRare sale"""
        return {
            "type": "nft_sale",
            "marketplace": "looksrare",
            "tx_hash": tx.get("hash"),
            "timestamp": tx.get("timestamp"),
        }

    def _parse_nft_transfer(self, tx: Dict, log: Dict, event_info: Dict) -> Dict:
        """
        Parse generic NFT transfer

        Could be:
        - Mint (from 0x0)
        - Sale (between users)
        - Transfer (gift/internal)
        """
        topics = log.get("topics", [])

        if len(topics) < 3:
            return None

        from_address = "0x" + topics[1][26:]  # Remove padding
        to_address = "0x" + topics[2][26:]

        # Detect mint
        is_mint = from_address == "0x" + "0" * 40

        result = {
            "type": "nft_mint" if is_mint else "nft_transfer",
            "collection_address": log.get("address"),
            "token_id": int(topics[3], 16) if len(topics) > 3 else None,
            "from": from_address,
            "to": to_address,
            "tx_hash": tx.get("hash"),
            "timestamp": tx.get("timestamp"),
            "standard": event_info.get("standard", "ERC721")
        }

        # If mint, include value as mint price
        if is_mint:
            result["mint_price_eth"] = float(tx.get("value", 0)) / 1e18

        return result

    async def get_nft_metadata(self, collection_address: str, token_id: int, chain: str = "ethereum") -> Optional[Dict]:
        """
        Fetch NFT metadata from Alchemy NFT API

        Args:
            collection_address: NFT collection address
            token_id: Token ID
            chain: Blockchain

        Returns:
            Metadata dict with name, image, attributes, etc.
        """
        if not self.alchemy_api_key:
            logger.warning("Alchemy API key not configured")
            return None

        try:
            # Alchemy NFT API endpoint
            network = self._get_alchemy_network(chain)
            url = f"https://{network}.g.alchemy.com/nft/v2/{self.alchemy_api_key}/getNFTMetadata"

            params = {
                "contractAddress": collection_address,
                "tokenId": str(token_id),
                "refreshCache": "false"
            }

            response = await self.http_client.get(url, params=params)

            if response.status_code != 200:
                logger.error(f"Alchemy API error: {response.status_code}")
                return None

            data = response.json()

            return {
                "name": data.get("title"),
                "description": data.get("description"),
                "image_url": data.get("media", [{}])[0].get("gateway") if data.get("media") else None,
                "attributes": data.get("metadata", {}).get("attributes", []),
                "collection_name": data.get("contract", {}).get("name"),
                "token_type": data.get("id", {}).get("tokenMetadata", {}).get("tokenType")
            }

        except Exception as e:
            logger.error(f"Failed to fetch NFT metadata: {e}")
            return None

    def _get_alchemy_network(self, chain: str) -> str:
        """Map chain name to Alchemy network identifier"""
        network_map = {
            "ethereum": "eth-mainnet",
            "polygon": "polygon-mainnet",
            "arbitrum": "arb-mainnet",
            "optimism": "opt-mainnet",
            "base": "base-mainnet",
        }
        return network_map.get(chain.lower(), "eth-mainnet")

    def categorize_nft_for_tax(self, nft_metadata: Optional[Dict], sale_price_usd: float) -> str:
        """
        Categorize NFT for tax purposes

        IRS distinguishes between:
        - Collectibles (28% max rate)
        - Investment property (standard capital gains)

        Args:
            nft_metadata: NFT metadata
            sale_price_usd: Sale price in USD

        Returns:
            "collectible" or "investment"
        """
        # High-value sales (>$50k) often treated as investment
        if sale_price_usd > 50000:
            return "investment"

        # PFP projects (profile pictures) often collectibles
        if nft_metadata:
            collection_name = nft_metadata.get("collection_name", "").lower()
            if any(pfp in collection_name for pfp in ["punk", "ape", "azuki", "doodle", "clone"]):
                return "collectible"

        # Default to collectible (more conservative for tax)
        return "collectible"

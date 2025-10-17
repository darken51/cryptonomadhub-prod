"""
NFT Transaction Model

Track NFT purchases, sales, mints, and transfers for tax reporting.
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class NFTTransaction(Base):
    """
    NFT Transaction for tax tracking
    
    Tracks NFT mints, purchases, sales, and transfers with cost basis.
    """
    __tablename__ = "nft_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    audit_id = Column(Integer, ForeignKey("defi_audits.id"), nullable=True, index=True)
    
    # Transaction identification
    tx_hash = Column(String(255), nullable=False, index=True)
    chain = Column(String(50), nullable=False, index=True)  # ethereum, polygon, etc.
    timestamp = Column(DateTime, nullable=False, index=True)
    block_number = Column(Integer, nullable=True)
    
    # NFT identification
    contract_address = Column(String(255), nullable=False, index=True)
    token_id = Column(String(255), nullable=False, index=True)  # Can be very large number
    collection_name = Column(String(255), nullable=True)
    token_standard = Column(String(20), nullable=True)  # ERC-721, ERC-1155
    
    # Transaction type
    transaction_type = Column(String(50), nullable=False, index=True)
    # mint, purchase, sale, transfer_in, transfer_out, burn
    
    # Financial data
    price_eth = Column(Float, nullable=True)  # Native token price (ETH, MATIC, etc.)
    price_usd = Column(Float, nullable=True)  # USD value at time of transaction
    gas_fee_eth = Column(Float, nullable=True)
    gas_fee_usd = Column(Float, nullable=True)
    marketplace_fee_usd = Column(Float, nullable=True)  # OpenSea, Blur fees
    royalty_fee_usd = Column(Float, nullable=True)  # Creator royalties
    
    # Cost basis (for sales/disposals)
    acquisition_cost_usd = Column(Float, nullable=True)  # What you paid to get it
    holding_period_days = Column(Integer, nullable=True)  # Days held
    gain_loss_usd = Column(Float, nullable=True)  # Capital gain/loss
    
    # Marketplace info
    marketplace = Column(String(100), nullable=True)  # OpenSea, Blur, LooksRare, etc.
    buyer_address = Column(String(255), nullable=True)
    seller_address = Column(String(255), nullable=True)
    
    # Metadata
    token_uri = Column(Text, nullable=True)  # IPFS link to metadata
    image_url = Column(Text, nullable=True)
    attributes = Column(Text, nullable=True)  # JSON attributes
    
    # Tax categorization
    is_taxable = Column(Boolean, default=True)
    tax_category = Column(String(50), nullable=True)  # capital_gains, collectible, income
    
    # Notes
    notes = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User")
    audit = relationship("DeFiAudit", back_populates="nft_transactions")
    
    def __repr__(self):
        return f"<NFTTransaction {self.collection_name} #{self.token_id} - {self.transaction_type}>"

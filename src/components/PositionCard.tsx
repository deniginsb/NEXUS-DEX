/**
 * Position Card Component
 *
 * Displays information about a single liquidity position.
 * Shows token pair, fee tier, price range, liquidity amount, and fees earned.
 *
 * Note: This is a simplified example. The production version includes
 * real-time price updates, in-range indicator, and action buttons.
 */

import React from 'react'

interface Token {
  symbol: string
  address: string
  logoURI?: string
}

interface Position {
  tokenId: string
  tokenA: Token
  tokenB: Token
  feeTier: number
  liquidity: string
  priceLower: string
  priceUpper: string
  currentPrice: string
  feesEarnedA: string
  feesEarnedB: string
  isInRange: boolean
}

interface PositionCardProps {
  position: Position
  onIncrease?: () => void
  onRemove?: () => void
  onCollectFees?: () => void
}

export function PositionCard({
  position,
  onIncrease,
  onRemove,
  onCollectFees,
}: PositionCardProps) {
  const feeTierLabel = {
    100: '0.01%',
    500: '0.05%',
    3000: '0.3%',
    10000: '1%',
  }[position.feeTier]

  return (
    <div className="position-card">
      {/* Header */}
      <div className="position-header">
        <div className="token-pair">
          <div className="token-logos">
            <img
              src={position.tokenA.logoURI}
              alt={position.tokenA.symbol}
              className="token-logo"
            />
            <img
              src={position.tokenB.logoURI}
              alt={position.tokenB.symbol}
              className="token-logo overlap"
            />
          </div>
          <span className="pair-name">
            {position.tokenA.symbol}/{position.tokenB.symbol}
          </span>
        </div>
        <div className="position-badges">
          <span className="fee-badge">{feeTierLabel}</span>
          <span
            className={`range-badge ${position.isInRange ? 'in-range' : 'out-of-range'}`}
          >
            {position.isInRange ? 'In Range' : 'Out of Range'}
          </span>
        </div>
      </div>

      {/* Price Range */}
      <div className="position-range">
        <div className="range-item">
          <span className="range-label">Min Price</span>
          <span className="range-value">{position.priceLower}</span>
          <span className="range-denomination">
            {position.tokenB.symbol} per {position.tokenA.symbol}
          </span>
        </div>
        <div className="range-arrow">↔</div>
        <div className="range-item">
          <span className="range-label">Max Price</span>
          <span className="range-value">{position.priceUpper}</span>
          <span className="range-denomination">
            {position.tokenB.symbol} per {position.tokenA.symbol}
          </span>
        </div>
      </div>

      {/* Current Price */}
      <div className="current-price">
        <span className="label">Current Price:</span>
        <span className="value">
          {position.currentPrice} {position.tokenB.symbol} per{' '}
          {position.tokenA.symbol}
        </span>
      </div>

      {/* Liquidity Info */}
      <div className="liquidity-info">
        <h4>Liquidity</h4>
        <div className="liquidity-value">${position.liquidity}</div>
      </div>

      {/* Fees Earned */}
      <div className="fees-earned">
        <h4>Uncollected Fees</h4>
        <div className="fees-row">
          <span>
            {position.feesEarnedA} {position.tokenA.symbol}
          </span>
          <span>
            {position.feesEarnedB} {position.tokenB.symbol}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="position-actions">
        <button className="action-button collect" onClick={onCollectFees}>
          Collect Fees
        </button>
        <button className="action-button increase" onClick={onIncrease}>
          Increase Liquidity
        </button>
        <button className="action-button remove" onClick={onRemove}>
          Remove Liquidity
        </button>
      </div>
    </div>
  )
}

export default PositionCard

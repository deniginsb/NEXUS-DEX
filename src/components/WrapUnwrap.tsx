/**
 * Wrap/Unwrap Component
 *
 * Simple interface for converting between native NEX and wrapped WNEX.
 * Wrapping is required for certain DeFi operations that need ERC20 tokens.
 *
 * Note: This is a simplified example. The production version includes
 * balance checking, gas estimation, and transaction status tracking.
 */

import React, { useState, useCallback } from 'react'

interface WrapUnwrapProps {
  nativeBalance?: string
  wrappedBalance?: string
  onWrap?: (amount: string) => Promise<void>
  onUnwrap?: (amount: string) => Promise<void>
}

type Mode = 'wrap' | 'unwrap'

export function WrapUnwrap({
  nativeBalance = '0',
  wrappedBalance = '0',
  onWrap,
  onUnwrap,
}: WrapUnwrapProps) {
  const [mode, setMode] = useState<Mode>('wrap')
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const inputToken = mode === 'wrap' ? 'NEX' : 'WNEX'
  const outputToken = mode === 'wrap' ? 'WNEX' : 'NEX'
  const balance = mode === 'wrap' ? nativeBalance : wrappedBalance

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === 'wrap' ? 'unwrap' : 'wrap'))
    setAmount('')
  }, [])

  const handleMaxClick = useCallback(() => {
    setAmount(balance)
  }, [balance])

  const handleSubmit = useCallback(async () => {
    if (!amount || parseFloat(amount) <= 0) return

    setIsLoading(true)
    try {
      if (mode === 'wrap' && onWrap) {
        await onWrap(amount)
      } else if (mode === 'unwrap' && onUnwrap) {
        await onUnwrap(amount)
      }
      setAmount('')
    } catch (error) {
      console.error(`${mode} failed:`, error)
    } finally {
      setIsLoading(false)
    }
  }, [mode, amount, onWrap, onUnwrap])

  return (
    <div className="wrap-unwrap-container">
      <div className="wrap-header">
        <h2>{mode === 'wrap' ? 'Wrap NEX' : 'Unwrap WNEX'}</h2>
        <p>
          {mode === 'wrap'
            ? 'Convert NEX to WNEX for use in DeFi'
            : 'Convert WNEX back to native NEX'}
        </p>
      </div>

      <div className="wrap-body">
        {/* Input */}
        <div className="wrap-input">
          <div className="input-header">
            <span>From</span>
            <span className="balance" onClick={handleMaxClick}>
              Balance: {balance} {inputToken}
            </span>
          </div>
          <div className="input-row">
            <input
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className="token-display">
              <span className="token-symbol">{inputToken}</span>
            </div>
          </div>
        </div>

        {/* Toggle Button */}
        <button className="toggle-direction" onClick={toggleMode}>
          ↓
        </button>

        {/* Output */}
        <div className="wrap-output">
          <div className="output-header">
            <span>To</span>
          </div>
          <div className="output-row">
            <input type="number" placeholder="0.0" value={amount} readOnly />
            <div className="token-display">
              <span className="token-symbol">{outputToken}</span>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="wrap-info">
          <p>
            {mode === 'wrap'
              ? 'Wrapping converts your native NEX into an ERC20 token (WNEX) at a 1:1 ratio. WNEX can be used in liquidity pools and other DeFi protocols.'
              : 'Unwrapping converts WNEX back to native NEX at a 1:1 ratio.'}
          </p>
        </div>

        {/* Submit Button */}
        <button
          className="wrap-button"
          onClick={handleSubmit}
          disabled={isLoading || !amount || parseFloat(amount) <= 0}
        >
          {isLoading
            ? 'Processing...'
            : mode === 'wrap'
              ? 'Wrap NEX'
              : 'Unwrap WNEX'}
        </button>
      </div>
    </div>
  )
}

export default WrapUnwrap

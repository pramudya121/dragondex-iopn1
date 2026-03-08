/**
 * Input validation utilities for DragonDEX
 * Centralizes all user input validation with strict bounds
 */
import { z } from 'zod';

// Swap amount schema
export const swapAmountSchema = z.string()
  .refine(val => val === '' || /^\d*\.?\d*$/.test(val), 'Invalid number format')
  .refine(val => {
    if (val === '') return true;
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0;
  }, 'Amount must be non-negative')
  .refine(val => {
    if (val === '') return true;
    const num = parseFloat(val);
    return num <= 1e18; // Reasonable upper bound
  }, 'Amount exceeds maximum')
  .refine(val => {
    if (val === '' || !val.includes('.')) return true;
    return val.split('.')[1].length <= 18; // Max 18 decimals
  }, 'Too many decimal places');

// Slippage schema
export const slippageSchema = z.number()
  .min(0.01, 'Slippage too low (min 0.01%)')
  .max(50, 'Slippage too high (max 50%)');

// Address schema
export const addressSchema = z.string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address');

/**
 * Sanitize numeric input - only allow digits and single decimal point
 */
export function sanitizeAmountInput(value: string): string {
  // Remove anything that's not a digit or decimal point
  let sanitized = value.replace(/[^0-9.]/g, '');
  
  // Only allow one decimal point
  const parts = sanitized.split('.');
  if (parts.length > 2) {
    sanitized = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Prevent leading zeros (except "0." pattern)
  if (sanitized.length > 1 && sanitized[0] === '0' && sanitized[1] !== '.') {
    sanitized = sanitized.slice(1);
  }
  
  // Limit to 18 decimal places
  if (parts.length === 2 && parts[1].length > 18) {
    sanitized = parts[0] + '.' + parts[1].slice(0, 18);
  }
  
  return sanitized;
}

/**
 * Validate and clamp slippage value
 */
export function sanitizeSlippage(value: number): number {
  if (isNaN(value) || value < 0.01) return 0.5; // Default
  if (value > 50) return 50; // Cap at 50%
  return Math.round(value * 100) / 100; // Round to 2 decimals
}

/**
 * Generate a safe transaction deadline (capped at 30 minutes)
 */
export function getSafeDeadline(minutes: number = 30): bigint {
  const clampedMinutes = Math.min(Math.max(minutes, 1), 60);
  return BigInt(Math.floor(Date.now() / 1000) + clampedMinutes * 60);
}

/**
 * Calculate safe minimum output with slippage protection
 */
export function calculateMinOutput(amount: bigint, slippagePercent: number): bigint {
  const clampedSlippage = sanitizeSlippage(slippagePercent);
  // Use integer math to avoid precision loss: minOutput = amount * (10000 - slippage*100) / 10000
  const slippageBps = BigInt(Math.floor(clampedSlippage * 100));
  return (amount * (10000n - slippageBps)) / 10000n;
}

/**
 * Safe approval amount - approve exact amount + 10% buffer instead of MAX_UINT256
 */
export function getSafeApprovalAmount(requiredAmount: bigint): bigint {
  // Add 10% buffer to avoid re-approval on minor price changes
  return (requiredAmount * 110n) / 100n;
}

/**
 * Validate that amount doesn't exceed balance
 */
export function isAmountWithinBalance(amount: string, balance: string): boolean {
  if (!amount || !balance) return true;
  const amountNum = parseFloat(amount);
  const balanceNum = parseFloat(balance);
  if (isNaN(amountNum) || isNaN(balanceNum)) return true;
  return amountNum <= balanceNum;
}

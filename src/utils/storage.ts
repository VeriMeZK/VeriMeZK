// Storage utilities for verification history
import type { StoredVerification } from '@/types';

const STORAGE_KEY = 'verimezk_verifications';
const MAX_STORED_VERIFICATIONS = 100;

export function getStoredVerifications(walletAddress?: string): StoredVerification[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    const allVerifications: StoredVerification[] = parsed.map((v: any) => ({
      ...v,
      timestamp: v.timestamp ? new Date(v.timestamp) : new Date(),
    }));
    
    // Filter by wallet address if provided
    if (walletAddress) {
      return allVerifications.filter(v => v.walletAddress === walletAddress);
    }
    
    return allVerifications;
  } catch (error) {
    console.error('Error reading stored verifications:', error);
    return [];
  }
}

export function saveVerification(verification: StoredVerification): void {
  try {
    const existing = getStoredVerifications();
    
    // Remove duplicates (same proof hash)
    const filtered = existing.filter(v => v.proofHash !== verification.proofHash);
    
    // Add new verification at the beginning
    const updated = [verification, ...filtered].slice(0, MAX_STORED_VERIFICATIONS);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving verification:', error);
  }
}

export function deleteVerification(id: string): void {
  try {
    const existing = getStoredVerifications();
    const filtered = existing.filter(v => v.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting verification:', error);
  }
}

export function clearAllVerifications(walletAddress?: string): void {
  try {
    if (walletAddress) {
      const existing = getStoredVerifications();
      const filtered = existing.filter(v => v.walletAddress !== walletAddress);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (error) {
    console.error('Error clearing verifications:', error);
  }
}


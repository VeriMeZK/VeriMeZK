import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { VerificationState, VerificationStep, MRZData, ProofResult, StoredVerification } from '@/types';
import { saveVerification } from '@/utils/storage';

interface VerificationContextType {
  state: VerificationState;
  setStep: (step: VerificationStep) => void;
  setWalletInfo: (address: string, name: string) => void;
  setMRZData: (data: MRZData) => void;
  setFaceMatchScore: (score: number) => void;
  setProofResult: (result: ProofResult) => void;
  setError: (error: string | undefined) => void;
  reset: () => void;
}

const VerificationContext = createContext<VerificationContextType | undefined>(undefined);

const initialState: VerificationState = {
  step: 'idle',
};

export function VerificationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<VerificationState>(initialState);

  const setStep = useCallback((step: VerificationStep) => {
    setState((prev) => ({ ...prev, step }));
  }, []);

  const setWalletInfo = useCallback((address: string, name: string) => {
    setState((prev) => ({ ...prev, walletAddress: address, walletName: name, step: 'connected' }));
  }, []);

  const setMRZData = useCallback((data: MRZData) => {
    setState((prev) => ({ ...prev, mrzData: data, step: 'scanning' }));
  }, []);

  const setFaceMatchScore = useCallback((score: number) => {
    setState((prev) => ({ ...prev, faceMatchScore: score, step: 'verifying' }));
  }, []);

  const setProofResult = useCallback((result: ProofResult) => {
    setState((prev) => {
      // If proof is successful and we have wallet address, save to storage
      if (result.success && prev.walletAddress) {
        const storedVerification: StoredVerification = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          proofHash: result.hash,
          clauses: result.clauses,
          timestamp: result.timestamp,
          status: 'verified',
          walletAddress: prev.walletAddress,
          claims: prev.mrzData ? {
            name: prev.mrzData.name,
            countryCode: prev.mrzData.countryCode,
            dob: prev.mrzData.dob,
            expiry: prev.mrzData.expiryDate,
          } : undefined,
        };
        saveVerification(storedVerification);
      }
      return { ...prev, proofResult: result, step: result.success ? 'signing' : 'idle' };
    });
  }, []);

  const setError = useCallback((error: string | undefined) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return (
    <VerificationContext.Provider
      value={{
        state,
        setStep,
        setWalletInfo,
        setMRZData,
        setFaceMatchScore,
        setProofResult,
        setError,
        reset,
      }}
    >
      {children}
    </VerificationContext.Provider>
  );
}

export function useVerification() {
  const context = useContext(VerificationContext);
  if (context === undefined) {
    throw new Error('useVerification must be used within a VerificationProvider');
  }
  return context;
}


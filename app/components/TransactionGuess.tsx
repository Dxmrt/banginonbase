'use client';

import { useCallback, useState } from 'react';
import { 
  Transaction, 
  TransactionButton,
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction,
} from '@coinbase/onchainkit/transaction';
import type { LifecycleStatus } from '@coinbase/onchainkit/transaction';
import { Input } from '@/components/ui/input';
import { encodeFunctionData } from 'viem';
import { BANGINONBASE_CONTRACT_CONFIG } from '@/lib/contracts';
import { getTodayIndex, getTodaySong } from '@/data/songs';
import { playClick, playCorrect, playIncorrect, resumeAudio } from '@/lib/soundEffects';
import type { GuessResult } from '@/types/game';

interface TransactionGuessProps {
  onGuessResult: (result: GuessResult) => void;
  playerScore: number;
  alreadyGuessed: boolean;
  isWalletConnected: boolean;
}

export function TransactionGuess({ 
  onGuessResult, 
  playerScore, 
  alreadyGuessed, 
  isWalletConnected
}: TransactionGuessProps) {
  const [guess, setGuess] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [transactionStatus, setTransactionStatus] = useState<LifecycleStatus | null>(null);

  // La wallet se conecta automáticamente con el conector de Farcaster
  const effectiveWalletConnected = isWalletConnected;

  // Generate transaction calls for the guess submission
  const generateTransactionCalls = useCallback(() => {
    if (!guess.trim()) return [];

    const dayIndex = getTodayIndex();
    
    try {
      return [
        {
          to: BANGINONBASE_CONTRACT_CONFIG.address,
          data: encodeFunctionData({
            abi: BANGINONBASE_CONTRACT_CONFIG.abi,
            functionName: 'submitGuess',
            args: [guess.trim(), BigInt(dayIndex)]
          }),
        }
      ];
    } catch (error) {
      console.error('Error generating transaction calls:', error);
      return [];
    }
  }, [guess]);

  // Handle transaction status updates
  const handleTransactionStatus = useCallback((status: LifecycleStatus) => {
    console.log('🎵 Transaction status:', status);
    setTransactionStatus(status);

    // Resume audio context for sound effects
    resumeAudio();

    switch (status.statusName) {
      case 'init':
        setIsSubmitting(false);
        break;
      case 'buildingTransaction':
        setIsSubmitting(true);
        playClick();
        break;
      case 'transactionPending':
        setIsSubmitting(true);
        break;
      case 'success':
        setIsSubmitting(false);
        handleTransactionSuccess(status);
        break;
      case 'error':
        setIsSubmitting(false);
        handleTransactionError(status);
        break;
    }
  }, []);

  // Handle successful transaction
  const handleTransactionSuccess = useCallback((status: LifecycleStatus) => {
    const todaySong = getTodaySong();
    
    // FIXED: Use proper answer checking with better normalization
    const isCorrect = checkAnswerCorrectness(guess.trim(), todaySong.title);
    const pointsEarned = isCorrect ? 5 : 0;
    
    // Play appropriate sound
    if (isCorrect) {
      playCorrect();
    } else {
      playIncorrect();
    }

    // Safely extract a transaction hash from possible statusData shapes
    const statusData = status.statusData as any;
    const txHash: string | undefined = statusData
      ? (('transactionReceipts' in statusData && Array.isArray(statusData.transactionReceipts))
          ? statusData.transactionReceipts?.[0]?.transactionHash
          : (('transactionHashList' in statusData && Array.isArray(statusData.transactionHashList))
              ? statusData.transactionHashList?.[0]
              : undefined))
      : undefined;

    const result: GuessResult = {
      correct: isCorrect,
      message: isCorrect 
        ? `🎉 CORRECT ON-CHAIN! You earned ${pointsEarned} points! The song was "${todaySong.title}" by ${todaySong.artist}! 🔗`
        : `❌ Not quite! The correct answer was "${todaySong.title}" by ${todaySong.artist}. Your guess is recorded on-chain! 🔗`,
      pointsEarned,
      todaysSong: todaySong,
      transactionHash: txHash
    };

    onGuessResult(result);
    setGuess('');
  }, [guess, onGuessResult]);

  // Handle transaction error
  const handleTransactionError = useCallback((status: LifecycleStatus) => {
    playIncorrect();
    
    const sd: any = status.statusData;
    const errorMessage = (sd && 'error' in sd && sd.error?.message) ? sd.error.message : 'Transaction failed';
    
    const result: GuessResult = {
      correct: false,
      message: `❌ Transaction failed: ${errorMessage}. Please try again!`,
      pointsEarned: 0,
      todaysSong: getTodaySong(), // Fallback to local data
    };

    onGuessResult(result);
  }, [onGuessResult]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !isSubmitting && guess.trim()) {
      // The transaction will be triggered by the TransactionButton
      // We just need to make sure the guess is set
    }
  };

  // Show wallet connection prompt (only in browser, not in mini app)
  if (!effectiveWalletConnected) {
    return (
      <div className="text-center">
        <p className="text-yellow-400 font-bold mb-2">🔐 Connect your wallet to play!</p>
        <p className="text-gray-400 text-sm">Link your wallet to start making on-chain guesses and earning points!</p>
      </div>
    );
  }

  // Show already guessed message
  if (alreadyGuessed) {
    return (
      <div className="text-center">
        <p className="text-cyan-400 font-bold mb-2">✅ You've already guessed on-chain today!</p>
        <p className="text-gray-400 text-sm">Come back tomorrow for a new track! 🎵</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Guess Input Section */}
      <div className="w-full">
        <div className="mb-4">
          <label className="block text-cyan-400 font-bold text-lg mb-2 text-center">
            🎵 What's the song? 🎵
          </label>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Input
            type="text"
            placeholder="Enter song title... (e.g., 'Take On Me')"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSubmitting}
            className="w-full sm:flex-1 h-16 px-6 text-xl bg-gray-800/90 border-3 border-purple-500 text-white placeholder-gray-300 placeholder:text-lg focus:border-pink-500 focus:ring-4 focus:ring-pink-500/30 font-mono rounded-xl shadow-2xl min-w-0"
          />

          {/* Transaction Component */}
          <Transaction
            chainId={8453} // Base Mainnet
            calls={generateTransactionCalls()}
            onStatus={handleTransactionStatus}
          >
            <TransactionButton
              disabled={!guess.trim() || isSubmitting}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold px-8 py-4 h-16 text-lg border-none disabled:opacity-50 rounded-xl shadow-2xl w-full sm:w-auto"
              text={isSubmitting ? '🎵 ON-CHAIN...' : '🔗 GUESS ON-CHAIN!'}
            />
          </Transaction>
        </div>
      </div>

      {/* Transaction Status */}
      {transactionStatus && (
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg p-4 border border-cyan-500/30">
          <Transaction
            chainId={8453}
            calls={generateTransactionCalls()}
            onStatus={handleTransactionStatus}
          >
            <TransactionStatus>
              <TransactionStatusLabel />
              <TransactionStatusAction />
            </TransactionStatus>
          </Transaction>
        </div>
      )}

      {/* Status Messages */}
      {isSubmitting && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500 mx-auto mb-2"></div>
          <p className="text-pink-400 text-sm font-mono">
            🔗 Processing your on-chain guess...
          </p>
        </div>
      )}

      {/* Info about on-chain gaming */}
      <div className="text-center mt-4">
        <p className="text-gray-500 text-xs font-mono">
          🌟 Your guesses are now recorded on Base Network • Permanent & Verifiable
        </p>
      </div>
    </div>
  );
}

// FIXED: Improved answer checking function with better logic
function checkAnswerCorrectness(userGuess: string, correctAnswer: string): boolean {
  console.log('🎵 Checking answer:', { userGuess, correctAnswer });
  
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/gi, '') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  };

  const normalizedGuess = normalizeText(userGuess);
  const normalizedAnswer = normalizeText(correctAnswer);
  
  console.log('🎵 Normalized:', { normalizedGuess, normalizedAnswer });
  
  // Exact match
  if (normalizedGuess === normalizedAnswer) {
    console.log('🎵 Exact match found!');
    return true;
  }
  
  // Check if one contains the other (for partial matches)
  if (normalizedGuess.length > 3 && normalizedAnswer.includes(normalizedGuess)) {
    console.log('🎵 Guess found in answer!');
    return true;
  }
  
  if (normalizedAnswer.length > 3 && normalizedGuess.includes(normalizedAnswer)) {
    console.log('🎵 Answer found in guess!');
    return true;
  }
  
  // Remove common words for better matching
  const removeCommonWords = (str: string): string => {
    return str
      .replace(/\b(the|a|an|and|or|but|in|on|at|to|for|of|with|by|is|are|was|were|be|been|have|has|had|do|does|did|will|would|could|should|may|might|can|must|shall)\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };
  
  const cleanGuess = removeCommonWords(normalizedGuess);
  const cleanAnswer = removeCommonWords(normalizedAnswer);
  
  console.log('🎵 Cleaned:', { cleanGuess, cleanAnswer });
  
  if (cleanGuess && cleanAnswer) {
    if (cleanGuess === cleanAnswer) {
      console.log('🎵 Clean match found!');
      return true;
    }
    
    // Final check for partial matches of cleaned versions
    if (cleanGuess.length > 3 && cleanAnswer.includes(cleanGuess)) {
      console.log('🎵 Clean guess found in answer!');
      return true;
    }
    
    if (cleanAnswer.length > 3 && cleanGuess.includes(cleanAnswer)) {
      console.log('🎵 Clean answer found in guess!');
      return true;
    }
  }
  
  console.log('🎵 No match found.');
  return false;
}
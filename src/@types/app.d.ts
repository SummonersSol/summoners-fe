export type Stats = {
    totalDeposit: number;
    totalEntries: number;
    totalDistributed: number;
    totalKeyStats: { gamba: number; greed: number; fair: number; };
    keyPrice: number;
    jackpotMaxEntry: number;
    jackpot: number;
    miniJackpot: number;
    jackpotWeights: { gamba: number; greed: number; fair: number; };
    nextJackpot: number; // in seconds
    nextMiniJackpot: number; // in seconds
}
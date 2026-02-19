export interface SolarProject {
  id: string;
  name: string;
  location: string;
  capacity: string; // e.g., "500 kW"
  totalShares: number;
  availableShares: number;
  pricePerShare: number;
  expectedYield: number; // Annual %
  status: 'active' | 'funding' | 'completed';
  image: string;
  description: string;
}

export interface UserInvestment {
  projectId: string;
  sharesOwned: number;
  totalInvested: number;
  totalEarnings: number;
  energyGenerated: number; // kWh
}

export interface EnergyDataPoint {
  timestamp: string;
  yield: number;
}

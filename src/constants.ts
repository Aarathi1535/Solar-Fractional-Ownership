import { SolarProject } from './types';

export const SOLAR_PROJECTS: SolarProject[] = [
  {
    id: '1',
    name: 'Desert Sun Array',
    location: 'Mojave Desert, CA',
    capacity: '1.2 MW',
    totalShares: 10000,
    availableShares: 2450,
    pricePerShare: 50,
    expectedYield: 8.5,
    status: 'funding',
    image: 'https://picsum.photos/seed/solar1/800/600',
    description: 'A large-scale utility project providing clean energy to the local grid. High efficiency tracking panels installed.'
  },
  {
    id: '2',
    name: 'Green Roof Initiative',
    location: 'Brooklyn, NY',
    capacity: '250 kW',
    totalShares: 5000,
    availableShares: 120,
    pricePerShare: 75,
    expectedYield: 6.2,
    status: 'active',
    image: 'https://picsum.photos/seed/solar2/800/600',
    description: 'Urban solar installation on commercial rooftops. Directly offsets SME energy costs.'
  },
  {
    id: '3',
    name: 'Azure Plains Farm',
    location: 'Castile, Spain',
    capacity: '5 MW',
    totalShares: 50000,
    availableShares: 15000,
    pricePerShare: 40,
    expectedYield: 9.1,
    status: 'funding',
    image: 'https://picsum.photos/seed/solar3/800/600',
    description: 'Expansive solar farm in one of Europe\'s sunniest regions. Optimized for maximum grid contribution.'
  }
];

export const MOCK_USER_INVESTMENTS = [
  {
    projectId: '2',
    sharesOwned: 10,
    totalInvested: 750,
    totalEarnings: 45.20,
    energyGenerated: 1240
  }
];

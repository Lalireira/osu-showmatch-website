export interface Player {
  id: number;
  username: string;
  statistics?: {
    pp: number;
    accuracy: number;
    global_rank: number;
    country_rank: number;
  };
}

export interface Team {
  name: string;
  players: Player[];
}

export const teams: Team[] = [
  {
    name: 'Team A',
    players: [
      { id: 1184175, username: 'Reira' },
      { id: 4733185, username: 'KonKonKinakoN' },
      { id: 4355380, username: 'Nobuchi-' },
      { id: 21911882, username: 'Tsubaban' },
      { id: 7096642, username: 'WiggleCalt' },
      { id: 13011078, username: '-K4rimw-' },
    ],
  },
  {
    name: 'Team B',
    players: [
      { id: 11414953, username: 'Eryth' },
      { id: 1661227, username: 'Satellite' },
      { id: 4796794, username: 'Vento' },
      { id: 4304495, username: '----' },
      { id: 8655635, username: 'Homutan' },
      { id: 5326197, username: 'invoker' },
    ],
  },
]; 
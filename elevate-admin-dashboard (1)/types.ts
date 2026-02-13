
export interface RankingRecord {
  id: string;
  player_name: string;
  total_contracts: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'player' | 'admin' | 'creator';
  created_at: string;
}

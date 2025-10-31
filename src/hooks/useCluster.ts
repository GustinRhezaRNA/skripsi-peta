import type { ClusterRequest, ClusterResponse } from '../types/cluster';

export const useClusters = async (data: ClusterRequest): Promise<ClusterResponse> => {
  const res = await fetch('http://127.0.0.1:8000/cluster', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

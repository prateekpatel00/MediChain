import { GET } from '../app/api/health/route';

describe('Health API Route', () => {
  it('returns HTTP 200 with status ok and system metadata', async () => {
    const response = await GET();
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.status).toBe('ok');
    expect(data.service).toBe('MediChain Network Node API');
    expect(data.version).toBe('1.0.0');
    expect(data.timestamp).toBeDefined();
  });
});

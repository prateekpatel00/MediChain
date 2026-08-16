import { NextResponse } from 'next/server';

export async function GET() {
  const healthData = {
    status: 'ok',
    service: 'MediChain Network Node API',
    version: '1.0.0',
    network: process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'futurenet',
    contracts: {
      core: process.env.NEXT_PUBLIC_CORE_CONTRACT_ID ? 'configured' : 'active',
      registry: process.env.NEXT_PUBLIC_REGISTRY_CONTRACT_ID ? 'configured' : 'active',
    },
    uptimeSeconds: process.uptime(),
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(healthData, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'Content-Type': 'application/json',
    },
  });
}

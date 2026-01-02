import BentoGrid from '../src/components/BentoGrid';
import Card from '../src/components/Card';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="w-full">
      <h1 className="text-4xl font-bold mb-2">PayFi Dashboard</h1>
      <p className="text-slate-600 mb-8">Privacy-preserving token management on Solana</p>
      <BentoGrid>
        <Link href="/deposit">
          <Card title="Deposit">
            <p className="text-sm text-slate-600">Deposit tokens into the privacy vault.</p>
            <p className="text-xs text-slate-500 mt-3">→ Make a deposit</p>
          </Card>
        </Link>
        <Link href="/withdraw">
          <Card title="Withdraw">
            <p className="text-sm text-slate-600">Withdraw tokens with a valid proof or relayer attestation.</p>
            <p className="text-xs text-slate-500 mt-3">→ Make a withdrawal</p>
          </Card>
        </Link>
        <Link href="/admin">
          <Card title="Admin">
            <p className="text-sm text-slate-600">Admin utilities (initialize, relayer management).</p>
            <p className="text-xs text-slate-500 mt-3">→ Go to admin panel</p>
          </Card>
        </Link>
        <Link href="/debug">
          <Card title="Debug">
            <p className="text-sm text-slate-600">On-chain PDA and account debug panel.</p>
            <p className="text-xs text-slate-500 mt-3">→ View state</p>
          </Card>
        </Link>
      </BentoGrid>
    </div>
  )
}

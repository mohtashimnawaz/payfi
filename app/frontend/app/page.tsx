import BentoGrid from '../src/components/BentoGrid';
import Card from '../src/components/Card';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="w-full animate-fade-in">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 gradient-text">
          Privacy-First Finance
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Secure token management with built-in privacy. Deposit, withdraw, and manage your assets with confidence on Solana.
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-3 gap-4 mb-12 lg:gap-6">
        {[
          { label: 'Network', value: 'Solana Devnet' },
          { label: 'Privacy', value: 'Zero-Knowledge' },
          { label: 'Speed', value: 'Instant' }
        ].map(({ label, value }) => (
          <div key={label} className="card text-center">
            <div className="text-2xl font-bold text-purple-400">{value}</div>
            <div className="text-sm text-slate-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Main Features */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-100 mb-8">Core Features</h2>
        <BentoGrid>
          <Link href="/deposit">
            <Card title="🏦 Deposit" badge="Primary">
              <p className="text-slate-300 mb-4">
                Deposit tokens into the privacy vault securely with full encryption.
              </p>
              <div className="text-sm text-purple-400 font-semibold group-hover:text-purple-300 transition">
                → Start Deposit
              </div>
            </Card>
          </Link>
          
          <Link href="/withdraw">
            <Card title="💰 Withdraw" badge="Coming Soon">
              <p className="text-slate-300 mb-4">
                Withdraw tokens with valid ZK proofs or relayer attestation.
              </p>
              <div className="text-sm text-purple-400 font-semibold group-hover:text-purple-300 transition">
                → Request Withdrawal
              </div>
            </Card>
          </Link>
          
          <Link href="/admin">
            <Card title="⚙️ Admin" badge="Advanced">
              <p className="text-slate-300 mb-4">
                Admin utilities for protocol initialization and relayer management.
              </p>
              <div className="text-sm text-purple-400 font-semibold group-hover:text-purple-300 transition">
                → Go to Admin
              </div>
            </Card>
          </Link>
          
          <Link href="/relayer">
            <Card title="🔗 Relayer" badge="Advanced">
              <p className="text-slate-300 mb-4">
                Register and manage relayers for transaction processing.
              </p>
              <div className="text-sm text-purple-400 font-semibold group-hover:text-purple-300 transition">
                → Manage Relayers
              </div>
            </Card>
          </Link>
          
          <Link href="/debug">
            <Card title="🔍 Debug" badge="Developer">
              <p className="text-slate-300 mb-4">
                View on-chain PDAs and account state for debugging.
              </p>
              <div className="text-sm text-purple-400 font-semibold group-hover:text-purple-300 transition">
                → View State
              </div>
            </Card>
          </Link>
          
          <div className="card">
            <Card title="📊 Stats" badge="Monitoring">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total Deposits</span>
                  <span className="font-bold text-purple-300">-</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Active Relayers</span>
                  <span className="font-bold text-purple-300">-</span>
                </div>
              </div>
            </Card>
          </div>
        </BentoGrid>
      </div>

      {/* Info Section */}
      <div className="mt-16 p-8 card border-purple-500/50">
        <h3 className="text-lg font-bold text-slate-100 mb-4">ℹ️ Getting Started</h3>
        <ul className="space-y-3 text-slate-300">
          <li>✓ Connect your Phantom wallet in the top right</li>
          <li>✓ Navigate to Deposit to add funds to the vault</li>
          <li>✓ Use Admin panel for protocol management (admin-only)</li>
          <li>✓ Monitor on-chain state with the Debug panel</li>
        </ul>
      </div>
    </div>
  )
}

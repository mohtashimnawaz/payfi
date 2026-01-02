import BentoGrid from '../src/components/BentoGrid';
import Card from '../src/components/Card';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero/Dashboard Section - Center Top */}
      <div className="mb-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-indigo-500/5 to-transparent rounded-3xl blur-2xl -z-10" />
        <div className="dashboard-card">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 gradient-text leading-tight">
              Privacy-First Finance
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed mb-8">
              Secure token management with built-in privacy protocols. Deposit, withdraw, and manage your assets with confidence on Solana blockchain.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/deposit" className="btn-primary">
                Get Started
              </Link>
              <a href="#features" className="btn-secondary">
                Learn More
              </a>
            </div>
          </div>

          {/* Dashboard Stats */}
          <div className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-purple-500/20">
            <div className="text-center">
              <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text mb-2">–</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider">Total Deposits</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text mb-2">–</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider">Active Relayers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text mb-2">–</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider">TVL</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="mb-16">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-slate-100 mb-3">Protocol Features</h2>
          <p className="text-slate-400 text-lg">Powerful tools for secure token management</p>
        </div>

        <BentoGrid>
          {/* Featured Card - Takes more space */}
          <Link href="/deposit" className="md:col-span-2 lg:col-span-2">
            <Card title="Deposit Vault" badge="Primary">
              <p className="text-slate-300 mb-6 leading-relaxed">
                Securely deposit tokens into the privacy vault with full encryption and commitment-based access control.
              </p>
              <div className="h-32 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-xl border border-purple-500/20 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-sm text-slate-400 mb-2">Fast & Secure</div>
                  <div className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text">Deposit</div>
                </div>
              </div>
              <div className="text-sm text-purple-400 font-semibold mt-4">
                Start Depositing
              </div>
            </Card>
          </Link>

          <Link href="/withdraw">
            <Card title="Withdraw" badge="Advanced">
              <p className="text-slate-300 mb-6 text-sm">
                Withdraw tokens with valid zero-knowledge proofs or relayer attestation.
              </p>
              <div className="h-20 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 rounded-lg border border-indigo-500/20 flex items-center justify-center">
                <div className="text-sm font-medium text-slate-300">ZK-Powered</div>
              </div>
              <div className="text-sm text-indigo-400 font-semibold mt-4">
                Request Withdrawal
              </div>
            </Card>
          </Link>

          <Link href="/admin">
            <Card title="Admin Panel" badge="Control">
              <p className="text-slate-300 mb-4 text-sm">
                Protocol initialization and management utilities.
              </p>
              <div className="text-xs text-slate-400 space-y-2">
                <div>Initialize protocol</div>
                <div>Manage settings</div>
              </div>
              <div className="text-sm text-cyan-400 font-semibold mt-4">
                Open Panel
              </div>
            </Card>
          </Link>

          <Link href="/relayer" className="lg:col-span-1">
            <Card title="Relayers" badge="Network">
              <p className="text-slate-300 text-sm mb-4">
                Register and manage relayers for transaction processing.
              </p>
              <div className="text-sm text-purple-400 font-semibold">
                Manage Relayers
              </div>
            </Card>
          </Link>

          <Link href="/debug" className="lg:col-span-1">
            <Card title="Debug" badge="Developer">
              <p className="text-slate-300 text-sm mb-4">
                View on-chain state and account debugging.
              </p>
              <div className="text-sm text-indigo-400 font-semibold">
                View State
              </div>
            </Card>
          </Link>
        </BentoGrid>
      </div>

      {/* Info Section with Curved Design */}
      <div className="relative mt-20 mb-8">
        <div className="absolute -top-32 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-to-b from-purple-500/20 to-transparent rounded-full blur-3xl -z-10" />
        
        <div className="card border-purple-500/40 rounded-3xl">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-slate-100 mb-4">Getting Started</h3>
              <ul className="space-y-3 text-slate-300">
                <li className="flex gap-3">
                  <span className="text-indigo-400 font-bold min-w-fit">Step 1</span>
                  <span>Connect your Phantom wallet using the button in the top right</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-purple-400 font-bold min-w-fit">Step 2</span>
                  <span>Navigate to Deposit to add funds to the secure vault</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-cyan-400 font-bold min-w-fit">Step 3</span>
                  <span>Use Admin or Relayer panels for protocol management</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-indigo-400 font-bold min-w-fit">Step 4</span>
                  <span>Monitor on-chain state with the Debug panel</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-100 mb-4">Key Features</h3>
              <ul className="space-y-3 text-slate-300">
                <li className="flex gap-3">
                  <span className="text-sm text-purple-400 min-w-fit">•</span>
                  <span>Zero-Knowledge Proof integration</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-sm text-indigo-400 min-w-fit">•</span>
                  <span>Built-in relayer attestation</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-sm text-cyan-400 min-w-fit">•</span>
                  <span>Privacy-preserving transactions</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-sm text-purple-400 min-w-fit">•</span>
                  <span>Solana blockchain security</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

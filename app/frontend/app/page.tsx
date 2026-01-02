import BentoGrid from '../src/components/BentoGrid';
import Card from '../src/components/Card';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="w-full max-w-[1000px] mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-24 animate-reveal">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[11px] font-medium uppercase tracking-widest text-white/60">Protocol Live on Devnet</span>
        </div>
        <h1 className="text-[64px] md:text-[80px] font-semibold tracking-[-0.04em] leading-[0.95] text-white mb-8 text-balance">
          Privacy for the <br /> next billion.
        </h1>
        <p className="text-xl text-white/40 max-w-[600px] mx-auto leading-relaxed text-balance mb-12">
          PayFi is a decentralized privacy protocol built on Solana. 
          Secure your assets with zero-knowledge proofs.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/deposit" className="btn-primary">
            Launch App
          </Link>
          <Link href="/debug" className="btn-secondary">
            View State
          </Link>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-24">
        {/* Main Feature */}
        <Link href="/deposit" className="md:col-span-4 group">
          <div className="card h-full flex flex-col justify-between">
            <div>
              <div className="badge mb-6">Primary</div>
              <h2 className="text-3xl font-medium text-white mb-4">Private Deposits</h2>
              <p className="text-white/40 leading-relaxed max-w-[300px]">
                Shield your tokens in our secure vault using advanced ZK commitments.
              </p>
            </div>
            <div className="mt-12 flex items-end justify-between">
              <div className="text-[13px] font-medium text-white/20 group-hover:text-white transition-colors">
                Start Shielding →
              </div>
              <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <div className="w-8 h-8 border-2 border-white/20 rounded-full border-t-white animate-spin-slow" />
              </div>
            </div>
          </div>
        </Link>

        {/* Secondary Feature */}
        <Link href="/withdraw" className="md:col-span-2 group">
          <div className="card h-full bg-white/[0.02] border-white/5">
            <div className="badge mb-6">Secure</div>
            <h2 className="text-2xl font-medium text-white mb-4">Withdraw</h2>
            <p className="text-sm text-white/40 leading-relaxed">
              Redeem your assets with cryptographic proofs.
            </p>
            <div className="mt-12 text-[13px] font-medium text-white/20 group-hover:text-white transition-colors">
              Redeem →
            </div>
          </div>
        </Link>

        {/* Small Cards */}
        <Link href="/admin" className="md:col-span-2 group">
          <div className="card h-full py-6">
            <h3 className="text-lg font-medium text-white mb-2">Admin</h3>
            <p className="text-sm text-white/40">Protocol control.</p>
          </div>
        </Link>

        <Link href="/relayer" className="md:col-span-2 group">
          <div className="card h-full py-6">
            <h3 className="text-lg font-medium text-white mb-2">Relayers</h3>
            <p className="text-sm text-white/40">Network nodes.</p>
          </div>
        </Link>

        <div className="md:col-span-2 card py-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-white mb-1">Status</h3>
            <p className="text-[11px] uppercase tracking-widest text-green-500 font-bold">Operational</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-white/5 pt-24 pb-24 text-center">
        <h3 className="text-sm font-medium uppercase tracking-[0.3em] text-white/20 mb-12">Built for Solana</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 opacity-20 grayscale hover:grayscale-0 transition-all duration-700">
          <div className="text-xl font-bold">SOLANA</div>
          <div className="text-xl font-bold">ANCHOR</div>
          <div className="text-xl font-bold">RUST</div>
          <div className="text-xl font-bold">NEXTJS</div>
        </div>
      </div>
    </div>
  )
}

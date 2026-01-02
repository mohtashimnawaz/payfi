import BentoGrid from '../src/components/BentoGrid';
import Card from '../src/components/Card';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="w-full max-w-[1000px] mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-32 animate-reveal relative">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] -z-10" />
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.05] mb-10">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Protocol Live on Devnet</span>
        </div>
        
        <h1 className="text-[72px] md:text-[96px] font-semibold tracking-[-0.05em] leading-[0.9] text-white mb-10 text-balance">
          Privacy for the <br /> <span className="prism-text">next billion.</span>
        </h1>
        
        <p className="text-lg text-white/30 max-w-[540px] mx-auto leading-relaxed text-balance mb-14 font-medium">
          PayFi is a decentralized privacy protocol built on Solana. 
          Secure your assets with zero-knowledge proofs.
        </p>
        
        <div className="flex items-center justify-center gap-6">
          <div className="prism-glow">
            <Link href="/deposit" className="btn-primary px-10">
              Launch App
            </Link>
          </div>
          <Link href="/debug" className="btn-secondary px-10">
            View State
          </Link>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-5 mb-32">
        {/* Main Feature */}
        <Link href="/deposit" className="md:col-span-4 group">
          <div className="card h-full flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] -z-10 group-hover:bg-indigo-500/10 transition-colors duration-700" />
            <div>
              <div className="badge mb-8">Primary</div>
              <h2 className="text-3xl font-medium text-white mb-4 tracking-tight">Private Deposits</h2>
              <p className="text-white/30 leading-relaxed max-w-[320px] font-medium">
                Shield your tokens in our secure vault using advanced ZK commitments.
              </p>
            </div>
            <div className="mt-16 flex items-end justify-between">
              <div className="text-[12px] font-medium text-white/20 group-hover:text-white/60 transition-colors duration-500">
                Start Shielding →
              </div>
              <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                <div className="w-7 h-7 border-[1.5px] border-white/10 rounded-full border-t-indigo-400 animate-spin-slow" />
              </div>
            </div>
          </div>
        </Link>

        {/* Secondary Feature */}
        <Link href="/withdraw" className="md:col-span-2 group">
          <div className="card h-full flex flex-col justify-between">
            <div>
              <div className="badge mb-8">Secure</div>
              <h2 className="text-2xl font-medium text-white mb-4 tracking-tight">Withdraw</h2>
              <p className="text-sm text-white/30 leading-relaxed font-medium">
                Redeem your assets with cryptographic proofs.
              </p>
            </div>
            <div className="mt-16 text-[12px] font-medium text-white/20 group-hover:text-white/60 transition-colors duration-500">
              Redeem →
            </div>
          </div>
        </Link>

        {/* Small Cards */}
        <Link href="/admin" className="md:col-span-2 group">
          <div className="card h-full py-8">
            <h3 className="text-lg font-medium text-white mb-2 tracking-tight">Admin</h3>
            <p className="text-sm text-white/30 font-medium">Protocol control.</p>
          </div>
        </Link>

        <Link href="/relayer" className="md:col-span-2 group">
          <div className="card h-full py-8">
            <h3 className="text-lg font-medium text-white mb-2 tracking-tight">Relayers</h3>
            <p className="text-sm text-white/30 font-medium">Network nodes.</p>
          </div>
        </Link>

        <div className="md:col-span-2 card py-8 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-white mb-1 tracking-tight">Status</h3>
            <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-400 font-bold">Operational</p>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.5)]" />
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-white/[0.03] pt-32 pb-32 text-center">
        <h3 className="text-[10px] font-medium uppercase tracking-[0.4em] text-white/10 mb-16">Built for Solana</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-16 opacity-10 grayscale hover:grayscale-0 transition-all duration-1000">
          <div className="text-lg font-bold tracking-tighter">SOLANA</div>
          <div className="text-lg font-bold tracking-tighter">ANCHOR</div>
          <div className="text-lg font-bold tracking-tighter">RUST</div>
          <div className="text-lg font-bold tracking-tighter">NEXTJS</div>
        </div>
      </div>
    </div>
  )
}

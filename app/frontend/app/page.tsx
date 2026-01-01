import Header from '../src/components/Header';
import BentoGrid from '../src/components/BentoGrid';
import Card from '../src/components/Card';

export default function Home() {
  return (
    <div>
      <Header />
      <h1>PayFi Dashboard</h1>
      <BentoGrid>
        <Card title="Deposit">
          <p>Deposit tokens into the privacy vault.</p>
        </Card>
        <Card title="Withdraw">
          <p>Withdraw tokens with a valid proof or relayer attestation.</p>
        </Card>
        <Card title="Admin">
          <p>Admin utilities (initialize, relayer management).</p>
        </Card>
        <Card title="Debug">
          <p>On-chain PDA and account debug panel.</p>
        </Card>
      </BentoGrid>
    </div>
  )
}

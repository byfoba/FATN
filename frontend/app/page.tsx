import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <h1>Futures Analysis Tool</h1>
      <p>Private two-user MVP for real-time market bias analysis.</p>
      <ul>
        <li><Link href="/dashboard">Dashboard</Link></li>
        <li><Link href="/analysis">Analysis</Link></li>
        <li><Link href="/settings">Settings</Link></li>
      </ul>
    </main>
  );
}

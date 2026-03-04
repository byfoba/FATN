import { TimezoneSaver } from '../../components/TimezoneSaver';

export default function DashboardPage() {
  const nowUtc = new Date().toISOString();
  const nowLocal = new Date().toLocaleString();
  return (
    <main>
      <h2>Dashboard</h2>
      <p>UTC: {nowUtc}</p>
      <p>Local: {nowLocal}</p>
      <TimezoneSaver />
    </main>
  );
}

import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, DollarSign, Activity } from 'lucide-react';

const stats = [
  { icon: DollarSign, label: 'Total Value Locked', value: '$0.00' },
  { icon: Activity, label: '24h Volume', value: '$0.00' },
  { icon: TrendingUp, label: 'Total Trades', value: '0' },
];

export default function Analytics() {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-center mb-8 gradient-text">Analytics</h1>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          {stats.map((s, i) => (
            <div key={i} className="stat-card">
              <s.icon className="w-8 h-8 text-primary mb-3" />
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="glass-card p-8 max-w-4xl mx-auto text-center">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Charts and detailed analytics coming soon...</p>
        </div>
      </motion.div>
    </div>
  );
}

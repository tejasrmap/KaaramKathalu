import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, TrendingUp, Users, ShoppingBag, CreditCard } from 'lucide-react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    orderCount: 0,
    activePacking: 0,
    customerCount: 0
  });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen to all orders for stats and chart
    const qAll = query(collection(db, 'orders'), orderBy('createdAt', 'asc'));
    const unsubscribeStats = onSnapshot(qAll, (snapshot) => {
      const orders = snapshot.docs.map(doc => doc.data());
      
      // Calculate Stats
      const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
      const active = orders.filter(o => ['pending', 'processing'].includes(o.status.toLowerCase())).length;
      const uniqueCustomers = new Set(orders.map(o => o.customer?.email)).size;

      setStats({
        totalRevenue: revenue,
        orderCount: orders.length,
        activePacking: active,
        customerCount: uniqueCustomers
      });

      // Calculate Revenue Chart Data
      const monthlyData: { [key: string]: number } = {};
      orders.forEach(o => {
        if (o.createdAt) {
          const date = o.createdAt.toDate();
          const month = date.toLocaleString('default', { month: 'short' });
          monthlyData[month] = (monthlyData[month] || 0) + (o.total || 0);
        }
      });

      const chartData = Object.keys(monthlyData).map(month => ({
        name: month,
        total: monthlyData[month]
      }));
      setRevenueData(chartData);
    });

    // Listen to recent orders
    const qRecent = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5));
    const unsubscribeRecent = onSnapshot(qRecent, (snapshot) => {
      const recent = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate().toLocaleDateString() || 'Recent'
      }));
      setRecentOrders(recent);
      setIsLoading(false);
    });

    return () => {
      unsubscribeStats();
      unsubscribeRecent();
    };
  }, []);
  const StatCard = ({ title, value, trend, icon: Icon }: any) => (
    <div className="bg-warm-light p-5 md:p-6 rounded-2xl flex items-start justify-between relative overflow-hidden border border-warm-dark/5 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-full">
        <p className="text-warm-dark/50 font-semibold uppercase tracking-widest text-[10px] mb-1.5">{title}</p>
        <h3 className="text-2xl md:text-3xl font-serif font-bold text-warm-dark">{value}</h3>
        <div className="flex items-center gap-1 mt-3 text-warm-accent font-medium border-t border-dashed border-warm-dark/10 pt-2.5 text-[10px] uppercase tracking-wider">
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span className="truncate">{trend}</span>
        </div>
      </div>
      <div className="flex w-10 h-10 rounded-xl bg-white items-center justify-center text-warm-accent border border-warm-dark/5 shadow-sm">
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-[100vw] overflow-x-hidden md:max-w-none">
      <div className="bg-warm-light p-6 rounded-2xl border border-warm-dark/5 shadow-sm mb-6">
        <h2 className="text-2xl font-serif font-bold text-warm-dark">Welcome back, Admin</h2>
        <p className="text-sm text-warm-dark/60 mt-1 font-serif">Here is a summary of what's happening in your store today.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full max-w-[95vw] md:max-w-none mx-auto">
        <StatCard title="Total Cash" value={`₹${Math.round(stats.totalRevenue/1000)}k`} trend="+12%" icon={CreditCard} />
        <StatCard title="Parcels" value={stats.orderCount.toString()} trend="+8%" icon={TrendingUp} />
        <StatCard title="Packing" value={stats.activePacking.toString()} trend="+2%" icon={ShoppingBag} />
        <StatCard title="Patrons" value={stats.customerCount.toString()} trend="+18%" icon={Users} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-warm-light p-6 rounded-2xl border border-warm-dark/5 shadow-sm relative z-10">
          <h3 className="text-xl font-bold text-warm-dark font-serif mb-6 border-b border-dashed border-warm-dark/10 pb-4">Revenue Over Time</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B83A20" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#B83A20" stopOpacity={0}/>
                   </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#2A1B19" strokeOpacity={0.05} />
                <XAxis dataKey="name" axisLine={{ stroke: '#2A1B19', strokeOpacity: 0.1, strokeWidth: 1 }} tickLine={false} tick={{ fill: '#2A1B19', fontSize: 10, fontWeight: 'medium' }} dy={10} />
                <YAxis axisLine={{ stroke: '#2A1B19', strokeOpacity: 0.1, strokeWidth: 1 }} tickLine={false} tick={{ fill: '#2A1B19', fontSize: 10, fontWeight: 'medium' }} tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid rgba(42,27,25,0.08)', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', fontWeight: 'medium', fontFamily: 'sans-serif' }}
                  itemStyle={{ color: '#B83A20' }}
                  formatter={(value: number) => [`₹${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="total" stroke="#B83A20" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-warm-dark/5 shadow-sm relative z-10">
          <div className="flex justify-between items-center mb-6 border-b border-warm-dark/10 pb-4">
            <h3 className="text-xl font-bold text-warm-dark font-serif">Recent Parcels</h3>
            <button className="text-[10px] uppercase font-bold tracking-widest text-warm-accent underline underline-offset-4 decoration-2 hover:text-warm-dark transition-colors">View All</button>
          </div>
          
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between pb-4 border-b border-dashed border-warm-dark/10 last:border-0 last:pb-0">
                <div>
                  <p className="font-bold text-warm-dark font-serif">{order.customer?.name}</p>
                  <p className="text-[10px] text-warm-dark/50 uppercase tracking-widest font-semibold mt-1">{order.id.slice(0,8)}... • {order.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-warm-dark font-serif text-lg">₹{order.total}</p>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider mt-1 bg-warm-accent/10 text-warm-accent`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && !isLoading && (
              <p className="text-center font-serif italic text-warm-dark/40 py-8">No orders yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

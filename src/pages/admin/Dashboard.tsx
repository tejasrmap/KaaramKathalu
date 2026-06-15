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
    <div className="bg-warm-light p-4 md:p-6 border-2 border-warm-dark shadow-[4px_4px_0px_#3A2A22] flex flex-col md:flex-row items-start justify-between relative transform rotate-0 hover:-translate-y-1 transition-transform overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]"></div>
      
      <div className="relative z-10 w-full">
        <p className="text-warm-dark/70 font-bold uppercase tracking-widest text-[8px] md:text-[10px] mb-1 md:mb-2">{title}</p>
        <h3 className="text-xl md:text-3xl font-serif font-bold text-warm-dark">{value}</h3>
        <div className="flex items-center gap-1 mt-2 md:mt-3 text-warm-dark font-medium border-t-2 border-dashed border-warm-dark/20 pt-2 text-[8px] md:text-[10px] uppercase tracking-wider">
          <ArrowUpRight className="w-3 h-3 text-warm-accent" />
          <span className="truncate">{trend}</span>
        </div>
      </div>
      <div className="hidden md:flex w-12 h-12 bg-white border-2 border-warm-dark shadow-[2px_2px_0px_#3A2A22] items-center justify-center text-warm-accent relative z-10 transform rotate-3">
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-[100vw] overflow-x-hidden md:max-w-none">
      <div className="bg-white p-6 border-2 border-warm-dark shadow-[4px_4px_0px_#3A2A22] transform -rotate-1 w-full max-w-[95vw] md:max-w-none mx-auto relative z-10 mb-8 mt-4 md:mt-0">
         <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-warm-accent border border-warm-dark shadow-sm"></div>
        <h1 className="text-3xl font-serif font-bold text-warm-dark italic">Ledger Overview</h1>
        <p className="text-warm-dark/70 mt-2 font-serif">Welcome back, here's what's happening with your pantry today.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full max-w-[95vw] md:max-w-none mx-auto p-1">
        <StatCard title="Total Cash" value={`₹${Math.round(stats.totalRevenue/1000)}k`} trend="+12%" icon={CreditCard} />
        <StatCard title="Parcels" value={stats.orderCount.toString()} trend="+8%" icon={TrendingUp} />
        <StatCard title="Packing" value={stats.activePacking.toString()} trend="+2%" icon={ShoppingBag} />
        <StatCard title="Patrons" value={stats.customerCount.toString()} trend="+18%" icon={Users} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-warm-light p-6 border-2 border-warm-dark shadow-[6px_6px_0px_#3A2A22] relative z-10">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-white/40 border border-warm-dark/20 shadow-sm transform -rotate-2"></div>
          <h3 className="text-xl font-bold text-warm-dark font-serif mb-6 border-b-2 border-dashed border-warm-dark/20 pb-4">Revenue Over Time</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B83A20" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#B83A20" stopOpacity={0}/>
                   </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#3A2A22" strokeOpacity={0.1} />
                <XAxis dataKey="name" axisLine={{ stroke: '#3A2A22', strokeWidth: 2 }} tickLine={false} tick={{ fill: '#3A2A22', fontSize: 10, fontWeight: 'bold' }} dy={10} />
                <YAxis axisLine={{ stroke: '#3A2A22', strokeWidth: 2 }} tickLine={false} tick={{ fill: '#3A2A22', fontSize: 10, fontWeight: 'bold' }} tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '2px solid #3A2A22', borderRadius: '0px', boxShadow: '4px 4px 0px #3A2A22', fontWeight: 'bold', fontFamily: 'serif' }}
                  itemStyle={{ color: '#B83A20' }}
                  formatter={(value: number) => [`₹${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="total" stroke="#B83A20" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 border-2 border-warm-dark shadow-[6px_6px_0px_#3A2A22] transform rotate-1 relative z-10">
          <div className="flex justify-between items-center mb-6 border-b-2 border-solid border-warm-dark pb-4">
            <h3 className="text-xl font-bold text-warm-dark font-serif">Recent Parcels</h3>
            <button className="text-[10px] uppercase font-bold tracking-widest text-warm-accent underline underline-offset-4 decoration-2 hover:text-warm-dark transition-colors">View All</button>
          </div>
          
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between pb-4 border-b-2 border-dashed border-warm-dark/20 last:border-0 last:pb-0">
                <div>
                  <p className="font-bold text-warm-dark font-serif">{order.customer?.name}</p>
                  <p className="text-[10px] text-warm-dark/60 uppercase tracking-widest font-bold mt-1">{order.id.slice(0,8)}... • {order.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-warm-dark font-serif text-lg">₹{order.total}</p>
                  <span className={`inline-block px-2 py-1 border-2 border-warm-dark shadow-[2px_2px_0px_#3A2A22] text-[10px] font-bold uppercase tracking-wider mt-1 bg-warm-bg text-warm-dark transform rotate-1`}
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

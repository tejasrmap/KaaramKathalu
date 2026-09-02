import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { ArrowUpRight, TrendingUp, Users, ShoppingBag, CreditCard, Package, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    orderCount: 0,
    activePacking: 0,
    customerCount: 0
  });
  const [ordersData, setOrdersData] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen to all orders for stats and chart
    const qAll = query(collection(db, 'orders'), orderBy('createdAt', 'asc'));
    const unsubscribeStats = onSnapshot(qAll, (snapshot) => {
      const orders = snapshot.docs.map(doc => doc.data());
      
      // Calculate Stats
      const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
      const active = orders.filter(o => ['pending', 'processing'].includes(o.status?.toLowerCase())).length;
      const uniqueCustomers = new Set(orders.map(o => o.customer?.email).filter(Boolean)).size;

      setStats({
        totalRevenue: revenue,
        orderCount: orders.length,
        activePacking: active,
        customerCount: uniqueCustomers
      });

      // Calculate Orders Bar Graph Data (Monthly)
      const monthlyData: { [key: string]: { count: number; revenue: number } } = {};
      orders.forEach(o => {
        if (o.createdAt) {
          try {
            const date = typeof o.createdAt.toDate === 'function' ? o.createdAt.toDate() : new Date(o.createdAt);
            const month = date.toLocaleString('default', { month: 'short' });
            if (!monthlyData[month]) {
              monthlyData[month] = { count: 0, revenue: 0 };
            }
            monthlyData[month].count += 1;
            monthlyData[month].revenue += (o.total || 0);
          } catch (e) {
            console.error('Error parsing order date:', e);
          }
        }
      });

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentMonthIdx = new Date().getMonth();
      const recentMonths: string[] = [];
      for (let i = 5; i >= 0; i--) {
        const mIdx = (currentMonthIdx - i + 12) % 12;
        recentMonths.push(monthNames[mIdx]);
      }

      const chartData = recentMonths.map(month => ({
        name: month,
        orders: monthlyData[month]?.count || 0,
        revenue: monthlyData[month]?.revenue || 0
      }));
      setOrdersData(chartData);
    });

    // Listen to recent orders
    const qRecent = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5));
    const unsubscribeRecent = onSnapshot(qRecent, (snapshot) => {
      const recent = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toLocaleDateString() : 'Recent'
      }));
      setRecentOrders(recent);
      setIsLoading(false);
    });

    return () => {
      unsubscribeStats();
      unsubscribeRecent();
    };
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-warm-dark/10 min-w-[140px] space-y-1.5">
          <div className="flex items-center justify-between gap-2 border-b border-warm-dark/10 pb-1.5">
            <span className="font-serif font-bold text-warm-dark text-sm tracking-wider">
              {label}
            </span>
            <span className="w-2 h-2 rounded-full bg-warm-accent" />
          </div>
          <div className="pt-0.5">
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-black text-warm-accent tracking-tight">
                {data.orders}
              </span>
              <span className="font-serif italic text-xs text-warm-dark/70 font-semibold">
                {data.orders === 1 ? 'order' : 'orders'}
              </span>
            </div>
            {data.revenue > 0 && (
              <p className="text-[11px] font-mono font-bold text-warm-dark/60 mt-1 pt-1 border-t border-dashed border-warm-dark/10">
                ₹{Number(data.revenue).toLocaleString('en-IN')} total
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

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
      <div className="bg-warm-light p-6 rounded-2xl border border-warm-dark/5 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-warm-dark">Welcome back, Admin</h2>
          <p className="text-sm text-warm-dark/60 mt-1 font-serif">Here is a summary of what's happening in your store today.</p>
        </div>
        <div className="flex items-center gap-2 bg-warm-accent/10 px-4 py-2 rounded-xl text-warm-accent font-mono text-xs font-bold w-fit">
          <Package className="w-4 h-4" />
          <span>{stats.orderCount} Total Orders</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full max-w-[95vw] md:max-w-none mx-auto">
        <StatCard title="Total Cash" value={`₹${Math.round(stats.totalRevenue/1000)}k`} trend="+12%" icon={CreditCard} />
        <StatCard title="Parcels" value={stats.orderCount.toString()} trend="+8%" icon={TrendingUp} />
        <StatCard title="Packing" value={stats.activePacking.toString()} trend="+2%" icon={ShoppingBag} />
        <StatCard title="Customers" value={stats.customerCount.toString()} trend="+18%" icon={Users} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Orders Bar Graph */}
        <div className="lg:col-span-2 bg-warm-light p-6 rounded-2xl border border-warm-dark/5 shadow-sm relative z-10">
          <div className="flex items-center justify-between mb-6 border-b border-dashed border-warm-dark/10 pb-4">
            <div>
              <h3 className="text-xl font-bold text-warm-dark font-serif">Orders Over Time</h3>
              <p className="text-xs font-serif italic text-warm-dark/50">Monthly volume of customer orders placed.</p>
            </div>
            <div className="flex items-center gap-1.5 font-sans text-[11px] font-bold uppercase tracking-wider bg-white text-warm-accent px-3 py-1.5 rounded-full border border-warm-dark/10 shadow-sm">
              <Calendar className="w-3.5 h-3.5" />
              <span>Monthly Trend</span>
            </div>
          </div>

          <div className="h-[300px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ordersData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="orderBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#B83A20" stopOpacity={0.95}/>
                    <stop offset="100%" stopColor="#8A2510" stopOpacity={0.75}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#2A1B19" strokeOpacity={0.06} />
                <XAxis 
                  dataKey="name" 
                  axisLine={{ stroke: '#2A1B19', strokeOpacity: 0.15, strokeWidth: 1 }} 
                  tickLine={false} 
                  tick={{ fill: '#2A1B19', fontSize: 12, fontFamily: 'serif', fontWeight: 700 }} 
                  dy={10} 
                />
                <YAxis 
                  allowDecimals={false}
                  axisLine={{ stroke: '#2A1B19', strokeOpacity: 0.15, strokeWidth: 1 }} 
                  tickLine={false} 
                  tick={{ fill: '#2A1B19', opacity: 0.6, fontSize: 11, fontFamily: 'monospace', fontWeight: 600 }} 
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(184, 58, 32, 0.08)', radius: 8 }}
                  content={<CustomTooltip />}
                />
                <Bar 
                  dataKey="orders" 
                  fill="url(#orderBarGrad)" 
                  radius={[8, 8, 0, 0]} 
                  maxBarSize={48}
                >
                  <LabelList 
                    dataKey="orders" 
                    position="top" 
                    offset={8}
                    formatter={(val: number) => (val > 0 ? `${val}` : '')}
                    style={{ 
                      fill: '#8A2510', 
                      fontFamily: 'monospace', 
                      fontWeight: '800', 
                      fontSize: '12px' 
                    }} 
                  />
                  {ordersData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      className="transition-opacity duration-200 hover:opacity-85 cursor-pointer" 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Parcels Section */}
        <div className="bg-white p-6 rounded-2xl border border-warm-dark/5 shadow-sm relative z-10">
          <div className="flex justify-between items-center mb-6 border-b border-warm-dark/10 pb-4">
            <h3 className="text-xl font-bold text-warm-dark font-serif">Recent Parcels</h3>
            <Link 
              to="/admin/orders" 
              className="text-[10px] uppercase font-bold tracking-widest text-warm-accent underline underline-offset-4 decoration-2 hover:text-warm-dark transition-colors"
            >
              View All
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between pb-4 border-b border-dashed border-warm-dark/10 last:border-0 last:pb-0">
                <div>
                  <p className="font-bold text-warm-dark font-serif">{order.customer?.name || 'Customer'}</p>
                  <p className="text-[10px] text-warm-dark/50 uppercase tracking-widest font-semibold mt-1">
                    {(order.id || '').slice(0, 8)}... • {order.date}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-warm-dark font-sans text-lg">₹{order.total || 0}</p>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider mt-1 bg-warm-accent/10 text-warm-accent">
                    {order.status || 'Pending'}
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

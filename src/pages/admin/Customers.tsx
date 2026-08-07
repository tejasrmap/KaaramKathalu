import React, { useState, useEffect } from 'react';
import { Search, User, Mail, Calendar, Loader2 } from 'lucide-react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

export default function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('lastLogin', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const customersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastActive: doc.data().lastLogin?.toDate().toLocaleDateString() || 'Recent'
      }));
      setCustomers(customersData);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-warm-light p-6 rounded-2xl border border-warm-dark/5 shadow-sm mb-6">
        <h2 className="text-2xl font-serif font-bold text-warm-dark">Customer Directory</h2>
        <p className="text-sm text-warm-dark/60 mt-1 font-serif">Manage and view your loyal customer base.</p>
      </div>

      {/* Toolbar */}
      <div className="bg-warm-light border border-warm-dark/5 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-dark/40" />
          <input 
            type="text" 
            placeholder="Search customers by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-warm-dark/10 bg-white focus:outline-none focus:ring-0 focus:border-warm-accent text-sm font-serif"
          />
        </div>
        <div className="text-xs font-bold font-serif text-warm-dark/60 uppercase tracking-wider">
          Total Customers: <span className="text-warm-accent font-sans font-extrabold">{filteredCustomers.length}</span>
        </div>
      </div>

      {/* List Container */}
      <div className="bg-white border border-warm-dark/5 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 text-warm-accent animate-spin" />
            <p className="font-serif italic text-warm-dark/50 text-sm">Loading customer directory...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-serif font-bold text-xl italic text-warm-dark/30">No customers found.</p>
          </div>
        ) : (
          <div className="divide-y divide-warm-dark/5">
            {/* Desktop Table Header */}
            <div className="hidden md:grid grid-cols-12 px-6 py-4 bg-warm-light/60 font-serif font-bold text-xs text-warm-dark/70 uppercase tracking-widest border-b border-warm-dark/10">
              <div className="col-span-5">Customer</div>
              <div className="col-span-4">Contact Email</div>
              <div className="col-span-3 text-right">Last Active</div>
            </div>

            {/* List Rows */}
            {filteredCustomers.map(customer => (
              <div 
                key={customer.id} 
                className="p-4 md:px-6 md:py-4 hover:bg-warm-bg/20 transition-colors flex flex-col md:grid md:grid-cols-12 md:items-center gap-3 md:gap-0"
              >
                {/* Avatar + Name */}
                <div className="md:col-span-5 flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-warm-light border border-warm-dark/10 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-xs">
                    {customer.photoURL ? (
                      <img src={customer.photoURL} alt={customer.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-warm-accent/10 text-warm-accent font-serif font-bold text-base">
                        {customer.name?.charAt(0).toUpperCase() || <User className="w-5 h-5 text-warm-accent" />}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-warm-dark leading-tight">{customer.name || 'Registered Customer'}</h3>
                    <span className="inline-block md:hidden text-xs text-warm-dark/60 font-serif mt-0.5">{customer.email}</span>
                  </div>
                </div>

                {/* Email (Desktop) */}
                <div className="hidden md:flex md:col-span-4 items-center gap-2 text-sm text-warm-dark/80 font-serif">
                  <Mail className="w-3.5 h-3.5 text-warm-accent/70 flex-shrink-0" />
                  <span className="truncate">{customer.email}</span>
                </div>

                {/* Last Active & Badge */}
                <div className="md:col-span-3 flex justify-between md:justify-end items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-warm-dark/50 font-serif font-medium">
                    <Calendar className="w-3.5 h-3.5 text-warm-dark/40" />
                    <span>{customer.lastActive}</span>
                  </div>
                  <span className="bg-green-50 text-green-700 border border-green-200/60 text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                    Registered
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


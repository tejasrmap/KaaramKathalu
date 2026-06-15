import React, { useState, useEffect } from 'react';
import { Search, User, Mail, Calendar, MoreVertical } from 'lucide-react';
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
        <h2 className="text-2xl font-serif font-bold text-warm-dark">Patron Register</h2>
        <p className="text-sm text-warm-dark/60 mt-1 font-serif">Manage and view your loyal customer base.</p>
      </div>

      <div className="bg-warm-light border border-warm-dark/5 rounded-2xl p-4 flex justify-between items-center relative z-10">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-dark/40" />
          <input 
            type="text" 
            placeholder="Search patrons by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-warm-dark/10 bg-white focus:outline-none focus:ring-0 focus:border-warm-accent text-sm font-serif"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map(customer => (
          <div key={customer.id} className="bg-white border border-warm-dark/5 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-all duration-300 relative group">
            <div className="flex items-start justify-between mb-6">
              <div className="w-16 h-16 bg-warm-light rounded-2xl overflow-hidden border border-warm-dark/5 shadow-sm">
                {customer.photoURL ? (
                  <img src={customer.photoURL} alt={customer.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-warm-dark/30">
                    <User className="w-8 h-8" />
                  </div>
                )}
              </div>
              <button className="p-2 text-warm-dark/45 hover:text-warm-dark transition-colors cursor-pointer">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-serif font-bold text-xl text-warm-dark">{customer.name}</h3>
                <div className="flex items-center gap-2 text-warm-dark/60 text-xs mt-1">
                  <Mail className="w-3.5 h-3.5 text-warm-accent" /> {customer.email}
                </div>
              </div>

              <div className="pt-4 border-t border-dashed border-warm-dark/10 flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-warm-dark/40 uppercase tracking-widest">
                  <Calendar className="w-3.5 h-3.5" /> Active: {customer.lastActive}
                </div>
                <span className="bg-green-50 text-green-700 text-[10px] font-semibold px-2.5 py-1 rounded-full">Verified Patron</span>
              </div>
            </div>
          </div>
        ))}
        {filteredCustomers.length === 0 && !isLoading && (
          <div className="col-span-full py-20 text-center bg-white border border-warm-dark/5 rounded-[24px] shadow-sm">
            <p className="font-serif font-bold text-2xl italic text-warm-dark/30">No patrons found in the registry.</p>
          </div>
        )}
      </div>
    </div>
  );
}

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 border-2 border-warm-dark shadow-[4px_4px_0px_#3A2A22] transform -rotate-1 relative z-10">
         <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-warm-accent border border-warm-dark shadow-sm"></div>
        <div>
          <h1 className="text-3xl font-serif font-bold text-warm-dark italic">Patron Register</h1>
          <p className="text-warm-dark/70 mt-2 font-serif">Manage and view your loyal customer base.</p>
        </div>
      </div>

      <div className="bg-warm-light border-2 border-warm-dark shadow-[4px_4px_0px_#3A2A22] p-4 flex justify-between items-center transform rotate-1 relative z-10">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-dark/40" />
          <input 
            type="text" 
            placeholder="Search patrons by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-warm-dark bg-white focus:outline-none focus:ring-0 focus:border-warm-accent text-sm font-bold font-serif shadow-[2px_2px_0px_#3A2A22]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map(customer => (
          <div key={customer.id} className="bg-white border-2 border-warm-dark p-6 shadow-[6px_6px_0px_#3A2A22] hover:-translate-y-1 transition-transform relative group">
            <div className="flex items-start justify-between mb-6">
              <div className="w-16 h-16 bg-warm-bg border-2 border-warm-dark shadow-[3px_3px_0px_#3A2A22] overflow-hidden">
                {customer.photoURL ? (
                  <img src={customer.photoURL} alt={customer.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-warm-dark/30">
                    <User className="w-8 h-8" />
                  </div>
                )}
              </div>
              <button className="p-2 text-warm-dark/40 hover:text-warm-dark transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-serif font-bold text-xl text-warm-dark">{customer.name}</h3>
                <div className="flex items-center gap-2 text-warm-dark/60 text-xs font-bold uppercase tracking-widest mt-1">
                  <Mail className="w-3 h-3" /> {customer.email}
                </div>
              </div>

              <div className="pt-4 border-t-2 border-dashed border-warm-dark/10 flex justify-between items-center">
                <div className="flex items-center gap-2 text-[10px] font-bold text-warm-dark/40 uppercase tracking-widest">
                  <Calendar className="w-3 h-3" /> Last Active: {customer.lastActive}
                </div>
                <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-1 border border-green-200">Verified Patron</span>
              </div>
            </div>
          </div>
        ))}
        {filteredCustomers.length === 0 && !isLoading && (
          <div className="col-span-full py-20 text-center bg-white border-2 border-warm-dark shadow-[4px_4px_0px_#3A2A22]">
            <p className="font-serif font-bold text-2xl italic text-warm-dark/30">No patrons found in the registry.</p>
          </div>
        )}
      </div>
    </div>
  );
}

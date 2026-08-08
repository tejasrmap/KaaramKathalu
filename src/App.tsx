/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { PopupProvider } from './context/PopupContext';
import Layout from './components/Layout';

// Eager load critical home page for immediate initial render
import Home from './pages/Home';

// Lazy loaded Storefront pages
const Shop = lazy(() => import('./pages/Shop'));
const About = lazy(() => import('./pages/About'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Login = lazy(() => import('./pages/Login'));
const MyOrders = lazy(() => import('./pages/MyOrders'));
const Profile = lazy(() => import('./pages/Profile'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const NotFound = lazy(() => import('./pages/NotFound'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));

// Lazy loaded Admin components
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Orders = lazy(() => import('./pages/admin/Orders'));
const ProductsAdmin = lazy(() => import('./pages/admin/ProductsAdmin'));
const ProductFormAdmin = lazy(() => import('./pages/admin/ProductFormAdmin'));
const Customers = lazy(() => import('./pages/admin/Customers'));
const Settings = lazy(() => import('./pages/admin/Settings'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));

// Sleek lightweight loading spinner fallback
function PageLoader() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-9 h-9 border-3 border-warm-accent border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-heading tracking-widest uppercase text-warm-dark/50 font-bold">Loading...</span>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PopupProvider>
        <WishlistProvider>
          <CartProvider>
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Admin Login (No Layout) */}
                  <Route path="/admin/login" element={<AdminLogin />} />

                  {/* Admin Routes (No storefront layout) */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="products" element={<ProductsAdmin />} />
                    <Route path="products/new" element={<ProductFormAdmin />} />
                    <Route path="products/edit/:id" element={<ProductFormAdmin />} />
                    <Route path="customers" element={<Customers />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="users" element={<AdminUsers />} />
                  </Route>

                  {/* Storefront Routes (Wrapped in Layout) */}
                  <Route path="/*" element={
                    <Layout>
                      <Suspense fallback={<PageLoader />}>
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/shop" element={<Shop />} />
                          <Route path="/about" element={<About />} />
                          <Route path="/product/:id" element={<ProductDetail />} />
                          <Route path="/checkout" element={<Checkout />} />
                          <Route path="/login" element={<Login />} />
                          <Route path="/my-orders" element={<MyOrders />} />
                          <Route path="/my-orders/:id" element={<OrderDetail />} />
                          <Route path="/profile" element={<Profile />} />
                          <Route path="/wishlist" element={<Wishlist />} />
                          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                          <Route path="/track-order" element={<TrackOrder />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </Suspense>
                    </Layout>
                  } />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </CartProvider>
        </WishlistProvider>
      </PopupProvider>
    </AuthProvider>
  );
}


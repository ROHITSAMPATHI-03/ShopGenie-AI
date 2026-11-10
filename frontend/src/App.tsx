import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { SystemMapPage } from './pages/SystemMapPage';
import { ProductsPage } from './pages/ProductsPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './features/checkout/CheckoutPage';
import { OrderConfirmationPage } from './features/orders/OrderConfirmationPage';
import { OrdersPage } from './features/orders/OrdersPage';
import { ComparePage } from './features/comparison/ComparePage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page (Entry Hub) */}
        <Route path="/" element={<LandingPage />} />

        {/* AI Recommendations Concierge */}
        <Route path="/recommendations" element={<RecommendationsPage />} />

        {/* Interactive Architecture System Map */}
        <Route path="/system-map" element={<SystemMapPage />} />

        {/* Product Catalogue & Filtering */}
        <Route path="/products" element={<ProductsPage />} />

        {/* Cart Review & Orders */}
        <Route path="/cart" element={<CartPage />} />

        {/* PayPal Sandbox Checkout */}
        <Route path="/checkout" element={<CheckoutPage />} />

        {/* Order History */}
        <Route path="/orders" element={<OrdersPage />} />

        {/* Order Confirmation & Printable Receipt */}
        <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />

        {/* Standalone Product Comparison */}
        <Route path="/compare" element={<ComparePage />} />

        {/* Catch-all redirect to Landing Page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

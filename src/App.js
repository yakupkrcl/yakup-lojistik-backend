import React from 'react';
import AdminDocumentPanel from './pages/admin/AdminDocumentPanel';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation,Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Components
import Navbar from './components/common/Navbar';

// Public Pages
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import PublicLoads from './pages/public/PublicLoads';

// Driver Pages
import DriverWallet from './pages/driver/DriverWallet';
import MyRatings from './pages/driver/MyRatings';
import DriverDashboard from './pages/driver/DriverDashboard';
import DriverAvailableLoads from './pages/driver/DriverAvailableLoads';
import DriverMyOffers from './pages/driver/DriverMyOffers';
import DriverDocuments from './pages/driver/DriverDocuments';
import DriverLoads from './pages/driver/DriverLoads';
import DriverMakeOffer from './pages/driver/DriverMakeOffer';
import DriverActiveLoads from './pages/driver/DriverActiveLoads';
import DriverCompletedLoads from './pages/driver/DriverCompletedLoads';

// Shipper Pages
import ShipperWallet from './pages/shipper/ShipperWallet';
import ShipperTrackingMap from './pages/shipper/ShipperTrackingMap';
import ShipperLoads from './pages/shipper/ShipperLoads';
import ShipperOfferManager from './pages/shipper/ShipperOfferManager';
import ShipperTransactions from './pages/shipper/ShipperTransactions';
import CreateLoad from './pages/shipper/CreateLoad';
import ShipperDashboard from './pages/shipper/ShipperDashboard';
import ShipperCompletedLoads from './pages/shipper/ShipperCompletedLoads';
// Admin Pages
import AdminWallet from './pages/admin/AdminWallet';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLoads from './pages/admin/AdminLoads';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminLoadDetails from './pages/admin/AdminLoadDetails';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation(); // window.location yerine useLocation kullanmalısın

  if (isLoading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Yükleniyor...</div>;
  }

  // 1. Giriş kontrolü
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Rol kontrolü
  if (allowedRoles && !allowedRoles.includes(user.userType)) {
    return <Navigate to="/login" replace />;
  }

  // 3. 🔥 BELGE KONTROLÜ (DÜZELTİLDİ)
  // Sadece TASIYICI ise ve aktif değilse (belgeler onaylanmamışsa)
  if (user.userType === 'TASIYICI' && user.aktif === false) {
    // Eğer kullanıcı zaten belge sayfasında değilse onu belge sayfasına zorla gönder
    if (location.pathname !== "/driver/documents/me") {
      return <Navigate to="/driver/documents/me" replace />;
    }
  }

  return children;
};
const App = () => {
  const location = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Uygulama Yükleniyor...</div>;
  }

  const getDashboardPath = () => {
    switch (user?.userType) {
      case 'TASIYICI':
        return '/driver/dashboard';
      case 'YUK_SAHIBI':
        return '/shipper/dashboard';
      case 'ADMIN':
        return '/admin/dashboard';
      default:
        return '/login';
    }
  };

  return (
    <>
      <Navbar currentPath={location.pathname} />
      <main style={{ minHeight: '80vh', padding: '20px' }}>
        <Routes>

          {/* PUBLIC */}
          <Route path="/" element={isAuthenticated ? <Navigate to={getDashboardPath()} replace /> : <HomePage />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to={getDashboardPath()} replace /> : <LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/loads/public" element={<PublicLoads />} />

          {/* DRIVER */}
          <Route path="/driver/documents/me" element={<ProtectedRoute allowedRoles={['TASIYICI']}><DriverDocuments /></ProtectedRoute>} />
          <Route path="/driver/wallet" element={<DriverWallet />} />
          <Route path="/driver/my-ratings" element={<MyRatings />} />
          <Route path="/driver/dashboard" element={<ProtectedRoute allowedRoles={['TASIYICI']}><DriverDashboard /></ProtectedRoute>} />
          <Route path="/driver/available-loads" element={<ProtectedRoute allowedRoles={['TASIYICI']}><DriverAvailableLoads /></ProtectedRoute>} />
          <Route path="/driver/my-offers" element={<ProtectedRoute allowedRoles={['TASIYICI']}><DriverMyOffers /></ProtectedRoute>} />
          <Route path="/driver/driver-loads" element={<ProtectedRoute allowedRoles={['TASIYICI']}><DriverLoads /></ProtectedRoute>} />
          <Route path="/driver/documents/:yukId" element={<ProtectedRoute allowedRoles={['TASIYICI']}><DriverDocuments /></ProtectedRoute>} />
          <Route path="/driver/active-loads" element={<ProtectedRoute allowedRoles={['TASIYICI']}><DriverActiveLoads /></ProtectedRoute>} />
          <Route path="/driver/completed-loads" element={<ProtectedRoute allowedRoles={['TASIYICI']}><DriverCompletedLoads /></ProtectedRoute>} />
          <Route path="/driver/loads/:loadId/make-offer" element={<ProtectedRoute allowedRoles={['TASIYICI']}><DriverMakeOffer /></ProtectedRoute>} />

          {/* SHIPPER */}
          <Route path="/shipper/wallet" element={<ProtectedRoute allowedRoles={['YUK_SAHIBI']}><ShipperWallet /></ProtectedRoute>} />
          <Route path="/shipper/completed-loads" element={<ProtectedRoute allowedRoles={['YUK_SAHIBI']}><ShipperCompletedLoads /></ProtectedRoute>} />
          <Route path="/shipper/tracking/:loadId" element={<ShipperTrackingMap />} />          
          <Route path="/shipper/manage-offers/:loadId" element={<ProtectedRoute allowedRoles={['YUK_SAHIBI']}><ShipperOfferManager /></ProtectedRoute>} />          <Route path="/shipper/dashboard" element={<ProtectedRoute allowedRoles={['YUK_SAHIBI']}><ShipperDashboard  /></ProtectedRoute>} />
          <Route path="/shipper/loads/form/:loadId" element={ <ProtectedRoute allowedRoles={['YUK_SAHIBI']}> <CreateLoad /></ProtectedRoute> }/>
          <Route path="/shipper/loads" element={<ProtectedRoute allowedRoles={['YUK_SAHIBI']}><ShipperLoads /></ProtectedRoute>} />
          <Route path="/shipper/loads/:loadId/offers" element={<ProtectedRoute allowedRoles={['YUK_SAHIBI']}><ShipperOfferManager /></ProtectedRoute>} />
          <Route path="/shipper/transactions" element={<ProtectedRoute allowedRoles={['YUK_SAHIBI']}><ShipperTransactions /></ProtectedRoute>} />
          <Route path="/shipper/loads/new" element={<ProtectedRoute allowedRoles={['YUK_SAHIBI']}><CreateLoad /> </ProtectedRoute>  }/>
 
 
         {/* ADMIN */}
          <Route path="/admin/wallet" element={<AdminWallet />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/admin-loads" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminLoads /></ProtectedRoute>} />
          <Route path="/admin/admin-users" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/admin-transactions" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminTransactions /></ProtectedRoute>} />
          <Route path="/admin/load-details/:loadId" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminLoadDetails /></ProtectedRoute>} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/documents" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDocumentPanel /></ProtectedRoute>} />

          {/* FALLBACK */}
          <Route path="*" element={<div>404 | Sayfa Bulunamadı</div>} />

        </Routes>
      </main>
    </>
  );
};

export default App;

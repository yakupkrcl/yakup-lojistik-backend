import React, { useState, useEffect, useCallback } from 'react';
import * as notificationService from '../../services/notificationService';
import NotificationBell from '../common/NotificationBell';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Navbar.module.css';

const Navbar = ({ currentPath }) => {
  const { isAuthenticated, logout, user ,refreshUser } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  const isActive = (path) =>
    currentPath && currentPath.startsWith(path) ? styles.active : '';

  const isAuthPage = currentPath === '/login' || currentPath === '/register';

  // Bildirimleri getirme fonksiyonu
  const fetchNotifs = useCallback(async () => {
    if (isAuthenticated && user?.id) {
      try {
        const data = await notificationService.getMyNotifications(user.id);
        setNotifications(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Navbar: Bildirimler çekilemedi", err);
      }
    }
  }, [isAuthenticated, user?.id]);

  // Bildirim tıklandığında yapılacak işlemler
  const handleNotificationClick = async (notification) => {
    try {
      await notificationService.markAsRead(notification.id);
      fetchNotifs();
      const message = notification.message.toLowerCase();
      
      if (message.includes("teklif geldi") || message.includes("teklifiniz var")) {
          navigate(`/shipper/manage-offers/${notification.loadId}`);
      } 
      else if (message.includes("kabul edildi") || message.includes("onaylandı")) {
          navigate(`/driver/my-offers`);
      }
      else if ((message.includes("teslim edildi") || message.includes("tamamlandı")) && user.userType === 'YUK_SAHIBI') {
          navigate(`/shipper/completed-loads`, { 
              state: { autoOpenRating: true, loadId: notification.loadId } 
          });
      }
      else if (message.includes("yola çıktı")) {
          navigate(`/driver/active-loads`);
      }
    } catch (err) {
      console.error("Bildirim işlemi sırasında hata:", err);
    }
  };

useEffect(() => {
    // İlk yüklemede çalıştır
    fetchNotifs();
    
    // 🔥 EĞER KULLANICI PASİFSE BİR KERE TAZELE
    if (isAuthenticated && user?.userType === 'TASIYICI' && !user.aktif) {
        refreshUser();
    }

    const interval = setInterval(() => {
      fetchNotifs();
      
      // 🔥 HER 20 SANİYEDE BİR KONTROL ET (Admin onayladı mı?)
      if (isAuthenticated && user?.userType === 'TASIYICI' && !user.aktif) {
          console.log("Kullanıcı aktiflik durumu kontrol ediliyor...");
          refreshUser();
      }
    }, 20000); 

    return () => clearInterval(interval);
  }, [fetchNotifs, isAuthenticated, user?.aktif, refreshUser]); // Bağımlılıklara ekledik
  const getRoleSpecificNav = () => {
    if (!isAuthenticated) return null;
    switch (user?.userType) {
      case 'YUK_SAHIBI':
        return (
          <>
            <Link to="/shipper/loads" className={styles.navLink}>Yüklerimi Yönet</Link>
            <Link to="/shipper/loads/new" className={styles.navLink}>Yük Oluştur</Link>
            <Link to="/shipper/completed-loads" className={styles.navLink}>Tamamlanmış Yüklerim</Link>
            <Link to="/shipper/transactions" className={styles.navLink}>Finansal İşlemler</Link>
          </>
        );
      case 'TASIYICI':
        if (!user.aktif) {
    return (
      <Link to="/driver/documents/me" className={`${styles.navLink} ${isActive('/driver/documents')}`}>
        ⚠️ Lütfen Belgeleri Tamamlayın
      </Link>
    );
  }
        return (
          <>
            <Link to="/driver/available-loads" className={`${styles.navLink} ${isActive('/driver/available-loads')}`}>Yüklere Teklif Ver</Link>
            <Link to="/driver/my-offers" className={`${styles.navLink} ${isActive('/driver/my-offers')}`}>Verdiğim Teklifler</Link>
            <Link to="/driver/active-loads" className={`${styles.navLink} ${isActive('/driver/active-loads')}`}>Aktif Görevlerim</Link>
            <Link to="/driver/completed-loads" className={`${styles.navLink} ${isActive('/driver/completed-loads')}`}>Tamamlanmış Görevlerim</Link>
            <Link to="/driver/documents/:yukId" className={`${styles.navLink} ${isActive('/driver/documents')}`}>Belgelerim</Link>
          </>
        );
      case 'ADMIN':
        return (
          <>
            <Link to="/admin/admin-loads" className={`${styles.navLink} ${isActive('/admin/admin-loads')}`}>Yük Yönetimi</Link>
            <Link to="/admin/admin-users" className={styles.navLink}>Kullanıcılar</Link>
            <Link to="/admin/documents" className={`${styles.navLink} ${isActive('/admin/documents')}`}>Belge Onayları</Link>
            <Link to="/admin/admin-transactions" className={styles.navLink}>İşlemler</Link>
          </>
        );
      default: return null;
    }
  };

  // 🔥 Çıkış işlemi: Sadece çıkış yapar ve login sayfasına yönlendirir (Bildirimsiz)
  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.logoContainer}>
        <Link to="/" className={styles.logo}>LOGİSTİK</Link>
      </div>
      <nav className={styles.navLinks}>
        <Link to="/" className={styles.navLink}>Anasayfa</Link>
        <Link to="/loads/public" className={styles.navLink}>Yükleri Gör</Link>
        {getRoleSpecificNav()}
      </nav>
      <div className={styles.authActions}>
        {isAuthenticated ? (
          <>
            <NotificationBell 
              items={notifications} 
              count={notifications.filter(n => !(n.okundu || n.isRead)).length}
              onRefresh={fetchNotifs}
              onItemClick={handleNotificationClick}
            />
            <span className={styles.userInfo}>
              {user?.ad} ({user?.userType})
            </span>
            <button onClick={handleLogout} className={styles.logoutButton}>Çıkış Yap</button>
          </>
        ) : (
          !isAuthPage && (
            <>
              <Link to="/login" className={styles.loginButton}>Giriş Yap</Link>
              <Link to="/register" className={styles.registerButton}>Kayıt Ol</Link>
            </>
          )
        )}
      </div>
    </header>
  );
};

export default Navbar;
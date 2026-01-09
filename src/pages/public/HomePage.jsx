// src/pages/public/HomePage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './HomePage.module.css'; 

const HomePage = () => {
    const { isAuthenticated, userRole } = useAuth();
    
    // Kullanıcının rolüne göre yönlendirileceği dashboard yolunu belirler.
    const getDashboardPath = () => {
        if (!userRole) return '/login'; 
        
        switch (userRole) {
            case 'YUK_SAHIBI':
                return '/shipper/dashboard'; // Yük listesi
            case 'TASIYICI':
                return '/driver/dashboard'; // Taşıyıcı paneli
            case 'ADMIN':
                return '/admin';
            default:
                return '/login';
        }
    };

    return (
        <div className={styles.homeContainer}>
            <header className={styles.heroSection}>
                <h1>Yük ve Taşıma Yönetim Platformu</h1>
                <p>Türkiye'nin lojistik ağını dijitalleştiriyoruz. Yüklerinizi güvenle yayınlayın veya ideal rotanızı bulun.</p>
                
                {isAuthenticated ? (
                    // Kullanıcı Giriş Yapmışsa: Dashboard'a Git butonu
                    <Link to={getDashboardPath()} className={styles.ctaButtonPrimary}>
                        Panelinize Git
                    </Link>
                ) : (
                    // Kullanıcı Giriş Yapmamışsa: Sadece bir bilgilendirme metni veya genel bir CTA bırakılabilir.
                    // Giriş ve Kayıt butonları artık sadece Navbar'da görünecek.
                    <p style={{ marginTop: '20px', fontSize: '1.1em' }}>
                        Başlamak için lütfen yukarıdaki menüden Giriş Yapın veya Kayıt Olun.
                    </p>
                )}
            </header>

            <section className={styles.featureSection}>
                <div className={styles.featureCard}>
                    <h3>📦 Yük Sahibi misiniz?</h3>
                    <p>Yayınlayın, teklifleri alın ve en uygun taşıyıcıyı seçin.</p>
                    <Link to={isAuthenticated ? '/shipper/loads/new' : '/register'} className={styles.featureLink}>
                        Yük Yayınla
                    </Link>
                </div>
                <div className={styles.featureCard}>
                    <h3>🚚 Taşıyıcı mısınız?</h3>
                    <p>Size özel rotalardaki aktif yükleri anında görüntüleyin ve teklif verin.</p>
                    <Link to="/loads/public" className={styles.featureLink}>
                        Aktif Yükleri Gör
                    </Link>
                </div>
                <div className={styles.featureCard}>
                    <h3>🔒 Güvenlik</h3>
                    <p>Tüm işlemlerinizi güvenli ve şeffaf bir ortamda yönetin.</p>
                    <a href="#about" className={styles.featureLink}>
                        Hakkımızda
                    </a>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
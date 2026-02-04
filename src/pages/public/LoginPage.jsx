import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 
import ToastManager from '../../components/common/ToastManager'; // Hataları göstermek için kalsın
import styles from './LoginPage.module.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const { login, isAuthenticated, isLoading, userRole } = useAuth(); 
    const navigate = useNavigate();
    const location = useLocation();

    // --- SADECE HATA TOASTLARI İÇİN ---
    const [toasts, setToasts] = useState([]);
    const addToast = (message, type = 'error') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    };

    // Giriş sonrası otomatik yönlendirme (Bildirimsiz, direkt)
    useEffect(() => {
        if (!isLoading && isAuthenticated && userRole) {
            const target = userRole === 'YUK_SAHIBI' ? '/shipper/dashboard' : 
                           userRole === 'TASIYICI' ? '/driver/dashboard' : '/admin/dashboard';
            navigate(target, { replace: true });
        }
    }, [isLoading, isAuthenticated, userRole, navigate]);

    if (isLoading) return <div>Yükleniyor...</div>;

    const handleSubmit = async (e) => {
        e.preventDefault();  
        setError(null);
        setLoading(true);

        try {
            const role = await login(email, password); 
            if (!role) {
                const msg = "E-posta veya şifre hatalı!";
                setError(msg);
                addToast(msg, "error"); // ❌ Sadece hata anında toast
            }
            // Başarılıysa useEffect zaten yakalayıp direkt yönlendirecek, toast basmayacak.
        } catch (err) {
            const message = err.response?.data?.message || "Giriş başarısız oldu.";
            setError(message);
            addToast(message, "error"); // ❌ Sunucu hatası vb. durumda toast
        } finally {
            setLoading(false);
        }
    };

    const registered = location?.state?.registered;

    return (
        <div className={styles.loginContainer}>
            <form onSubmit={handleSubmit} className={styles.loginForm}>
                <h2>Kullanıcı Girişi</h2>
                {/* Kayıt mesajı kalsın dersen success p etiketi durabilir, istemezsen silebilirsin */}
                {registered && <p className={styles.success}>Kayıt başarılı. Giriş yapabilirsiniz.</p>}
                {error && <p className={styles.error}>{error}</p>}
                
                <div className={styles.formGroup}>
                    <label htmlFor="email">E-Posta</label>
                    <input 
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>
                
                <div className={styles.formGroup}>
                    <label htmlFor="password">Şifre</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>

                <button type="submit" disabled={loading} className={styles.submitButton}>
                    {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                </button>

                <p className={styles.registerLink}>
                    Hesabınız yok mu? 
                    <Link to="/register">Hemen Kayıt Olun!</Link> 
                </p>
            </form>

            {/* Sadece hataları basmak için burada duruyor */}
            <ToastManager toasts={toasts} />
        </div>
    );
};

export default LoginPage;
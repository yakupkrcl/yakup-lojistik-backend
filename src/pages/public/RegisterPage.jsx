import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ToastManager from '../../components/common/ToastManager'; // 🚩 Ekledik
import styles from './RegisterPage.module.css'; 

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        ad: '',
        soyad: '',
        email: '',
        password: '',
        userType: 'YUK_SAHIBI', 
        sirketAdi: '',
        vergiNumarasi: '', 
        telefon: '',          
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // 🚩 Toast State'i
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    };

    const { register } = useAuth(); 
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Şirket Adı Kontrolü
            if (formData.userType === 'YUK_SAHIBI' && !formData.sirketAdi) {
                addToast("Yük sahipleri için Şirket Adı zorunludur.", "info");
                setLoading(false);
                return;
            }

            await register(formData, false);

            // 🚩 Başarılı mesajı ver ve kısa bir süre sonra yönlendir
            addToast("Hesabınız başarıyla oluşturuldu! Giriş yapabilirsiniz.", "success");
            
            setTimeout(() => {
                navigate('/login', { replace: true, state: { registered: true } });
            }, 2000);

        } catch (err) {
            console.error('[RegisterPage] register error ->', err);
            const message = err.response?.data?.message || err.message || "Kayıt sırasında bir hata oluştu.";
            setError(message);
            addToast(message, "error"); // 🚩 Hatayı sağ altta da göster
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.registerContainer}>
            <form onSubmit={handleSubmit} className={styles.registerForm}>
                <h2>Yeni Hesap Oluştur</h2>
                
                {error && <p className={styles.error}>{error}</p>}
                
                <div className={styles.formGroup}>
                    <label htmlFor="userType">Hesap Türü</label>
                    <select name="userType" value={formData.userType} onChange={handleChange} required className={styles.selectField} disabled={loading}>
                        <option value="YUK_SAHIBI">Yük Sahibi</option>
                        <option value="TASIYICI">Taşıyıcı</option>
                        {/* Admin genelde panelden eklenir ama ihtiyacın varsa kalsın */}
                        <option value="ADMIN">Admin</option>
                    </select>
                </div>

                <div className={styles.nameGroup}>
                    <div className={styles.formGroup}>
                        <label htmlFor="ad">Adınız</label>
                        <input name="ad" type="text" value={formData.ad} onChange={handleChange} required disabled={loading} />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="soyad">Soyadınız</label>
                        <input name="soyad" type="text" value={formData.soyad} onChange={handleChange} required disabled={loading} />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="email">E-Posta</label>
                    <input name="email" type="email" value={formData.email} onChange={handleChange} required disabled={loading} />
                </div>
                
                <div className={styles.formGroup}>
                    <label htmlFor="password">Şifre</label>
                    <input name="password" type="password" value={formData.password} onChange={handleChange} required disabled={loading} />
                </div>
                
                <div className={styles.formGroup}>
                    <label htmlFor="sirketAdi">Şirket Adı {formData.userType !== 'YUK_SAHIBI' ? '(Opsiyonel)' : '*'}</label>
                    <input name="sirketAdi" type="text" value={formData.sirketAdi} onChange={handleChange} disabled={loading} placeholder={formData.userType === 'YUK_SAHIBI' ? "Zorunlu alan" : ""} />
                </div>
                
                <div className={styles.formGroup}>
                    <label htmlFor="vergiNumarasi">Vergi Numarası</label>
                    <input name="vergiNumarasi" type="text" value={formData.vergiNumarasi} onChange={handleChange} disabled={loading} />
                </div>
                
                <div className={styles.formGroup}>
                    <label htmlFor="telefon">Telefon Numarası</label>
                    <input name="telefon" type="tel" value={formData.telefon} onChange={handleChange} disabled={loading} />
                </div>
                
                <button type="submit" disabled={loading} className={styles.submitButton}>
                    {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
                </button>

                <p className={styles.loginLink}>
                    Zaten hesabınız var mı?
                    <Link to="/login" className={styles.linkText}> Giriş Yapın!</Link>
                </p>
            </form>

            {/* 🚩 Hayalet bildirimler kayıt sayfasında da aktif */}
            <ToastManager toasts={toasts} />
        </div>
    );
};

export default RegisterPage;
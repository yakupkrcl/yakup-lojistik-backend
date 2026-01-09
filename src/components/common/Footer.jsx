// src/components/common/Footer.jsx

import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <p>&copy; {new Date().getFullYear()} Yük Yönetim Sistemi. Tüm Hakları Saklıdır.</p>
                <div className={styles.links}>
                    <a href="/loads/public">Yayınlanan Yükler</a>
                    <a href="/admin">Admin Paneli</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
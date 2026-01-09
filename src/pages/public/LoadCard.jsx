import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Button, Divider } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoadCard = ({ load, showActions = false, onOfferClick }) => {
    const navigate = useNavigate();
    const { userRole, isAuthenticated } = useAuth();

    const formatLocation = (loc) => {
        if (!loc) return "Belirtilmemiş";
        const city = loc.sehir || "";
        const district = loc.ilce || "";
        if (!city && !district) return "Adres Bilgisi Yok";
        return district ? `${city}, ${district}` : city;
    };

    const handleMakeOffer = (e) => {
        // Kartın kendi tıklanma olayını engellemek için
        if (e && e.stopPropagation) e.stopPropagation();

        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (userRole === 'TASIYICI' || userRole === 'DRIVER') {
            // 🔥 EĞER onOfferClick varsa modalı açar
            if (onOfferClick) {
                onOfferClick(load);
            } else {
                navigate(`/driver/loads/${load.id}/make-offer`);
            }
        } else {
            alert('Sadece taşıyıcılar teklif verebilir.');
        }
    };

    return (
        <Card sx={{ 
            height: '100%', borderRadius: '16px', border: '1px solid #f0f0f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 20px rgba(0,0,0,0.08)' }
        }}>
            <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Chip 
                        label={load.yukTipi || 'STANDART'} 
                        size="small" 
                        sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 'bold', fontSize: '0.7rem' }} 
                    />
                    <Typography variant="caption" sx={{ color: '#999', fontWeight: 'bold' }}>
                        ID: #{load.id}
                    </Typography>
                </Box>

                <Box sx={{ position: 'relative', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <LocationOnIcon sx={{ color: '#2e7d32', fontSize: 20, mr: 1 }} />
                        <Box>
                            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', lineHeight: 1 }}>Kalkış</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatLocation(load.kalkisAdresi)}</Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationOnIcon sx={{ color: '#d32f2f', fontSize: 20, mr: 1 }} />
                        <Box>
                            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', lineHeight: 1 }}>Varış</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatLocation(load.varisAdresi)}</Typography>
                        </Box>
                    </Box>
                </Box>

                <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FitnessCenterIcon sx={{ color: '#666', fontSize: 18, mr: 0.5 }} />
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#444' }}>
                            {load.agirlikKg || '0'} kg
                        </Typography>
                    </Box>
                    {showActions && (
                     <Button 
                variant="contained" 
                color="primary"
                fullWidth
                // 🚩 BURASI ÖNEMLİ: Eğer onOfferClick varsa onu çalıştır, yoksa eski mantık (opsiyonel)
                onClick={() => {
                    if (onOfferClick) {
                        onOfferClick(load);
                    } else {
                        // Eski navigate kodu buradaydı, onu devre dışı bırakmış olduk
                        console.log("onOfferClick prop'u eksik!");
                    }
                }}
            >
                Teklif Ver
            </Button>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

export default LoadCard;
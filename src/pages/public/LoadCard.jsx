import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Button, Divider } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { useAuth } from '../../context/AuthContext';

const LoadCard = ({ load, showActions = false, onOfferClick }) => {
    const { userRole } = useAuth();

    // Debug için: Konsola bak, rol tam olarak ne yazıyor?
    console.log("Mevcut Kullanıcı Rolü:", userRole);

    const formatLocation = (loc) => {
        if (!loc) return "Belirtilmemiş";
        return loc.ilce ? `${loc.sehir}, ${loc.ilce}` : loc.sehir;
    };

    return (
        <Card sx={{ 
            height: '100%', borderRadius: '16px', border: '1px solid #f0f0f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 20px rgba(0,0,0,0.08)' }
        }}>
            <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Chip label={load.yukTipi || 'STANDART'} size="small" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 'bold' }} />
                    <Typography variant="caption" sx={{ color: '#999' }}>ID: #{load.id}</Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOnIcon sx={{ color: '#2e7d32', fontSize: 20, mr: 1 }} />
                        <Typography variant="body2"><b>Kalkış:</b> {formatLocation(load.kalkisAdresi)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationOnIcon sx={{ color: '#d32f2f', fontSize: 20, mr: 1 }} />
                        <Typography variant="body2"><b>Varış:</b> {formatLocation(load.varisAdresi)}</Typography>
                    </Box>
                </Box>

                <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FitnessCenterIcon sx={{ color: '#666', fontSize: 18, mr: 0.5 }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{load.agirlikKg || '0'} kg</Typography>
                    </Box>
                </Box>

                {/* 🔥 BUTON KONTROLÜ BURASI */}
                {showActions && (
                    <Box sx={{ mt: 1 }}>
                        {(userRole === 'DRIVER' || userRole === 'TASIYICI') ? (
                            <Button 
                                variant="contained" 
                                color="primary" 
                                fullWidth 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onOfferClick(load);
                                }}
                            >
                                Teklif Ver
                            </Button>
                        ) : (
                            <Typography variant="caption" sx={{ color: 'orange', fontStyle: 'italic', display: 'block', textAlign: 'center' }}>
                                {userRole === 'ADMIN' ? "🛡️ Admin Teklif Veremez" : "📢 Sürücü Girişi Gerekli"}
                            </Typography>
                        )}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default LoadCard;
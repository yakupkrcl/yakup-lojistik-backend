import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
    Container, Typography, Grid, Box, TextField, 
    InputAdornment, CircularProgress, Button, Paper 
} from '@mui/material';
import { createOfferByDriver } from '../../services/offerService';
import SearchIcon from '@mui/icons-material/Search';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import LoadCard from './LoadCard';
import api from '../../services/api';

import ApprovalModal from '../../components/common/ApprovalModal';
import ToastManager from '../../components/common/ToastManager';

const PublicLoads = () => {
    const [loads, setLoads] = useState([]);
    const [offerPrice, setOfferPrice] = useState('');
    const [driverNote, setDriverNote] = useState('');
    const [loading, setLoading] = useState(true);
    const { isAuthenticated, user, userRole } = useAuth();

    const [searchTerm, setSearchTerm] = useState('');
    const [minWeight, setMinWeight] = useState('');
    const [maxWeight, setMaxWeight] = useState('');

    const [toasts, setToasts] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedLoad, setSelectedLoad] = useState(null);

    const addToast = (message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => removeToast(id), 4000);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    useEffect(() => {
        fetchPublicLoads();
    }, []);

    const fetchPublicLoads = () => {
        setLoading(true);
        api.get('/loads/public') 
            .then(res => setLoads(res.data))
            .catch(() => addToast("Veriler yüklenirken bir hata oluştu!", "error"))
            .finally(() => setLoading(false));
    };

    const handleActionClick = (load) => {
        if (!isAuthenticated) {
            addToast("Teklif vermek için giriş yapmalısınız!", "warning");
            return;
        }

        if (userRole === 'TASIYICI' && !user?.aktif) {
            addToast("Belgeleriniz onaylanmadan teklif veremezsiniz.", "error");
            return;
        }

        setSelectedLoad(load);
        setModalOpen(true);
    };

 const confirmAction = async () => {
    if (!offerPrice || offerPrice <= 0) {
        addToast("Lütfen geçerli bir teklif tutarı giriniz!", "error");
        return;
    }

    try {
        const payload = {
            yukId: Number(selectedLoad.id),
            teklifFiyati: parseFloat(offerPrice),
            tasiyiciId: user?.id, 
            note: driverNote || ""
        };

        await createOfferByDriver(payload); 
        addToast("Teklifiniz başarıyla iletildi.", "success");
        handleCloseModal(); // Başarılıysa zaten kapatıyoruz.

    } catch (err) {
        // 🚩 SORUNUN ÇÖZÜMÜ BURASI
        const serverMessage = err.response?.data?.message;
        
        if (serverMessage === 'Bu yüke daha önce teklif verdiniz.') {
            addToast("Zaten teklifiniz var! Aynı yüke tekrar teklif veremezsiniz.", "warning");
        } else {
            addToast(serverMessage || "Teklif gönderilemedi!", "error");
        }

        // 🚩 KARTIN KAPANMASI İÇİN: 
        // Kullanıcı hatayı gördükten sonra modalın açık kalmasına gerek yoksa buraya ekle:
        handleCloseModal(); 
        
        console.error("Backend Hata Detayı:", serverMessage);
    }
};
// handleCloseModal fonksiyonuna şunu da ekle:
const handleCloseModal = () => {
    setModalOpen(false);
    setOfferPrice('');
    setDriverNote(''); // 🚩 Notu da temizle
    setSelectedLoad(null);
};

    const filteredLoads = useMemo(() => {
        return loads.filter(load => {
            const text = `${load.kalkisAdresi?.sehir} ${load.varisAdresi?.sehir}`.toLowerCase();
            const matchesSearch = text.includes(searchTerm.toLowerCase());
            const loadWeight = load.agirlikKg || 0;
            const matchesWeight = (!minWeight || loadWeight >= parseFloat(minWeight)) &&
                                (!maxWeight || loadWeight <= parseFloat(maxWeight));
            return matchesSearch && matchesWeight;
        });
    }, [loads, searchTerm, minWeight, maxWeight]);

    if (loading) return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 15 }}>
            <CircularProgress color="success" thickness={5} />
            <Typography sx={{ mt: 2, color: 'text.secondary' }}>Yükler listeleniyor...</Typography>
        </Box>
    );

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <ToastManager toasts={toasts} removeToast={removeToast} />

          <ApprovalModal 
    isOpen={modalOpen}
    title="💰 Teklif Ver"
    onConfirm={confirmAction}
    onCancel={handleCloseModal}
>
    <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a2e1f' }}>
            {selectedLoad?.kalkisAdresi?.sehir} ➡️ {selectedLoad?.varisAdresi?.sehir}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Ağırlık: {selectedLoad?.agirlikKg} kg
        </Typography>

        <TextField
            fullWidth
            label="Teklif Fiyatı (TL)"
            type="number"
            value={offerPrice}
            onChange={(e) => setOfferPrice(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{ startAdornment: <InputAdornment position="start">₺</InputAdornment> }}
        />

        <TextField
            fullWidth
            label="Sürücü Notu (Opsiyonel)"
            multiline
            rows={3}
            value={driverNote}
            onChange={(e) => setDriverNote(e.target.value)}
            placeholder="Yükleme saati, araç tipi vb. notlar yazabilirsiniz..."
        />
    </Box>
</ApprovalModal>

            <Box sx={{ mb: 5, textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>🚚 Yük Pazarı</Typography>
                <Typography variant="body1" color="text.secondary">Uygun yükü bul ve teklif ver.</Typography>
            </Box>

            <Paper elevation={0} sx={{ p: 2.5, mb: 5, borderRadius: 4, bgcolor: '#f8fafc', border: '1px solid #eef2f6' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={5}>
                        <TextField fullWidth size="small" placeholder="Şehir ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
                    </Grid>
                    <Grid item xs={6} md={2}><TextField fullWidth size="small" type="number" placeholder="Min kg" value={minWeight} onChange={(e) => setMinWeight(e.target.value)} /></Grid>
                    <Grid item xs={6} md={2}><TextField fullWidth size="small" type="number" placeholder="Max kg" value={maxWeight} onChange={(e) => setMaxWeight(e.target.value)} /></Grid>
                    <Grid item xs={12} md={3}>
                        <Button fullWidth variant="contained" color="inherit" startIcon={<DeleteSweepIcon />} onClick={() => {setSearchTerm(''); setMinWeight(''); setMaxWeight('');}}>Temizle</Button>
                    </Grid>
                </Grid>
            </Paper>

            <Grid container spacing={3}>
                {filteredLoads.map(load => (
                    <Grid item xs={12} sm={6} md={4} key={load.id}>
                        <LoadCard load={load} showActions={true} onOfferClick={() => handleActionClick(load)} />
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default PublicLoads;
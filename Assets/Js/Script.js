(function() {
    'use strict';

    let currentFontSize = 100;
    let highContrastEnabled = false;
    let librasActive = false;
    
    function setFontSize(sizePercent) {
        currentFontSize = sizePercent;
        document.body.style.fontSize = currentFontSize + '%';
        localStorage.setItem('susFontSize', currentFontSize);
    }
    
    function increaseFont() {
        if (currentFontSize < 150) {
            setFontSize(currentFontSize + 10);
        } else {
            showToast('Tamanho máximo de fonte atingido', 'info');
        }
    }
    
    function decreaseFont() {
        if (currentFontSize > 70) {
            setFontSize(currentFontSize - 10);
        } else {
            showToast('Tamanho mínimo de fonte atingido', 'info');
        }
    }
    
    function resetFont() {
        setFontSize(100);
    }
    
    function toggleHighContrast() {
        highContrastEnabled = !highContrastEnabled;
        
        if (highContrastEnabled) {
            document.body.classList.add('high-contrast');
            localStorage.setItem('susHighContrast', 'true');
            showToast('Modo de alto contraste ativado', 'success');
        } else {
            document.body.classList.remove('high-contrast');
            localStorage.setItem('susHighContrast', 'false');
            showToast('Modo de alto contraste desativado', 'info');
        }
    }
    
    function toggleLibras() {
        librasActive = !librasActive;
        
        if (librasActive) {
            showToast('Modo LIBRAS ativado. Avatar intérprete será exibido.', 'success');
            showLibrasWidget();
        } else {
            hideLibrasWidget();
            showToast('Modo LIBRAS desativado', 'info');
        }
    }
    
    function showLibrasWidget() {
        if (document.getElementById('libras-widget')) return;
        
        const widget = document.createElement('div');
        widget.id = 'libras-widget';
        widget.setAttribute('aria-label', 'Intérprete de LIBRAS - Língua Brasileira de Sinais');
        widget.setAttribute('role', 'complementary');
        widget.innerHTML = `
            <div class="libras-avatar">
                <div class="libras-avatar-icon" aria-hidden="true">🤟</div>
                <div class="libras-controls">
                    <button id="libras-minimize" aria-label="Minimizar intérprete">−</button>
                    <button id="libras-close" aria-label="Fechar intérprete">✕</button>
                </div>
                <div class="libras-status">Intérprete de LIBRAS ativo</div>
            </div>
        `;
        
        widget.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            background: var(--gov-blue, #1B4F8A);
            color: white;
            border-radius: 12px;
            padding: 12px 16px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: inherit;
        `;
        
        const avatarDiv = widget.querySelector('.libras-avatar');
        avatarDiv.style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
        `;
        
        const iconDiv = widget.querySelector('.libras-avatar-icon');
        iconDiv.style.cssText = `
            font-size: 32px;
            width: 48px;
            height: 48px;
            background: rgba(255,255,255,0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        const controlsDiv = widget.querySelector('.libras-controls');
        controlsDiv.style.cssText = `
            display: flex;
            gap: 8px;
        `;
        
        const buttons = widget.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.style.cssText = `
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 14px;
            `;
        });
        
        const statusDiv = widget.querySelector('.libras-status');
        statusDiv.style.cssText = `
            font-size: 12px;
            background: rgba(0,0,0,0.5);
            padding: 4px 8px;
            border-radius: 20px;
        `;
        
        document.body.appendChild(widget);
        
        document.getElementById('libras-minimize')?.addEventListener('click', (e) => {
            e.stopPropagation();
            const avatarIcon = widget.querySelector('.libras-avatar-icon');
            const status = widget.querySelector('.libras-status');
            if (avatarIcon.style.display === 'none') {
                avatarIcon.style.display = 'flex';
                status.style.display = 'block';
            } else {
                avatarIcon.style.display = 'none';
                status.style.display = 'none';
            }
        });
        
        document.getElementById('libras-close')?.addEventListener('click', (e) => {
            e.stopPropagation();
            hideLibrasWidget();
            librasActive = false;
            const librasBtn = document.getElementById('libras-btn');
            if (librasBtn) librasBtn.style.background = 'transparent';
        });
    }
    
    function hideLibrasWidget() {
        const widget = document.getElementById('libras-widget');
        if (widget) widget.remove();
    }
    
    function emergencyCall() {
        const confirmCall = confirm('SAMU 192 - Serviço de Atendimento Móvel de Urgência.\nDeseja realizar a ligação agora?');
        
        if (confirmCall) {
            showToast('Redirecionando para chamada de emergência SAMU 192...', 'warning');
            
            setTimeout(() => {
                showToast('Lembrete: Em caso de emergência real, ligue imediatamente para o SAMU 192.', 'info');
            }, 1500);
        }
    }
    
    function findNearbyUBS() {
        showToast('Buscando UBS mais próxima...', 'info');
        
        if (!navigator.geolocation) {
            showToast('Seu navegador não suporta geolocalização. Por favor, digite seu endereço manualmente.', 'error');
            return;
        }
        
        const mapPlaceholder = document.getElementById('map-placeholder');
        const mapContent = document.getElementById('map-content');
        const mapLoading = document.getElementById('map-loading');
        
        if (mapLoading) mapLoading.style.display = 'block';
        if (mapContent) mapContent.style.display = 'none';
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude.toFixed(4);
                const lng = position.coords.longitude.toFixed(4);
                
                if (mapLoading) mapLoading.style.display = 'none';
                if (mapContent) {
                    mapContent.style.display = 'block';
                    mapContent.innerHTML = `📍 UBS mais próxima encontrada!<br><small>Latitude: ${lat}, Longitude: ${lng}<br>Distância aproximada: 450 metros<br>Endereço: Rua da Saúde, 123 - Centro</small>`;
                }
                
                showToast('UBS encontrada com sucesso!', 'success');
            },
            (error) => {
                if (mapLoading) mapLoading.style.display = 'none';
                if (mapContent) {
                    mapContent.style.display = 'block';
                    mapContent.innerHTML = 'Não foi possível obter sua localização. Por favor, permita o acesso à localização ou digite seu endereço manualmente.';
                }
                
                let errorMessage = 'Erro ao obter localização. ';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += 'Permita o acesso à localização nas configurações do navegador.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += 'Informações de localização indisponíveis.';
                        break;
                    case error.TIMEOUT:
                        errorMessage += 'Tempo limite excedido.';
                        break;
                }
                showToast(errorMessage, 'error');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }
    
    function findHospitals() {
        showToast('Buscando hospitais e UPAs na região...', 'info');
        
        setTimeout(() => {
            const mapContent = document.getElementById('map-content');
            if (mapContent) {
                mapContent.innerHTML = `🏥 Hospitais e UPAs encontrados:<br>
                • UPA 24h - Zona Norte (1.2 km)<br>
                • Hospital Municipal (2.5 km)<br>
                • Pronto Atendimento - Zona Sul (3.8 km)`;
            }
            showToast('Unidades encontradas com sucesso!', 'success');
        }, 1000);
    }
    
    function handleLogin() {
        showToast('Redirecionando para autenticação segura com gov.br...', 'info');
        
        setTimeout(() => {
            showToast('Ambiente de demonstração. Em produção, seria redirecionado para login oficial do gov.br.', 'info');
        }, 1500);
    }
    
    function showServiceInfo(service) {
        const serviceMessages = {
            'prontuario': 'Prontuário Digital: Acesse todo seu histórico médico, consultas, exames e procedimentos realizados no SUS.',
            'vacinas': 'Carteira de Vacinas: Consulte todas as vacinas aplicadas, pendentes e baixe certificados oficiais.',
            'agendamento': 'Agendamento: Marque consultas e exames nas unidades de saúde mais próximas de você.',
            'unidades': 'Encontrar Unidade: Localize UBS, UPAs, hospitais e farmácias populares na sua região.',
            'farmacia': 'Farmácia Popular: Medicamentos gratuitos e com desconto para hipertensão, diabetes, asma e outros.',
            'telemedicina': 'Telemedicina: Consultas online com médicos do SUS, sem sair de casa.',
            'saude-mental': 'Saúde Mental: Apoio psicológico, acompanhamento psiquiátrico e recursos de autocuidado.',
            'familia': 'Saúde da Família: Gerencie as informações de saúde de seus dependentes.'
        };
        
        const message = serviceMessages[service] || 'Serviço disponível em breve.';
        showToast(message, 'info');
    }
    
    function showToast(message, type = 'info') {
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) existingToast.remove();
        
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'polite');
        toast.innerHTML = `
            <span class="toast-icon">${getToastIcon(type)}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close" aria-label="Fechar">✕</button>
        `;
        
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1100;
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideUp 0.3s ease-out;
            max-width: 90%;
            min-width: 280px;
        `;
        
        const colors = {
            success: { bg: '#00703C', text: 'white' },
            error: { bg: '#B91C1C', text: 'white' },
            warning: { bg: '#EA580C', text: 'white' },
            info: { bg: '#1B4F8A', text: 'white' }
        };
        
        const color = colors[type] || colors.info;
        toast.style.background = color.bg;
        toast.style.color = color.text;
        
        document.body.appendChild(toast);
        
        toast.querySelector('.toast-close')?.addEventListener('click', () => {
            toast.remove();
        });
        
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 5000);
    }
    
    function getToastIcon(type) {
        const icons = {
            success: '✓',
            error: '⚠',
            warning: '!',
            info: 'ℹ'
        };
        return icons[type] || 'ℹ';
    }
    
    function loadUserPreferences() {
        const savedFontSize = localStorage.getItem('susFontSize');
        if (savedFontSize && parseInt(savedFontSize) !== 100) {
            setFontSize(parseInt(savedFontSize));
        }
        
        const savedContrast = localStorage.getItem('susHighContrast');
        if (savedContrast === 'true') {
            toggleHighContrast();
        }
    }
    
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === '1') {
                e.preventDefault();
                const mainContent = document.getElementById('main-content');
                if (mainContent) mainContent.focus();
                showToast('Navegação: conteúdo principal', 'info');
            }
            
            if (e.altKey && e.key === '2') {
                e.preventDefault();
                const searchInput = document.querySelector('.search-bar input');
                if (searchInput) searchInput.focus();
            }
            
            if (e.altKey && e.key === '3') {
                e.preventDefault();
                const accessibilitySection = document.querySelector('.accessibility-tools');
                if (accessibilitySection) accessibilitySection.focus();
            }
            
            if (e.altKey && (e.key === 'e' || e.key === 'E')) {
                e.preventDefault();
                emergencyCall();
            }
            
            if (e.altKey && (e.key === 'h' || e.key === 'H')) {
                e.preventDefault();
                toggleHighContrast();
            }
            
            if (e.altKey && (e.key === 'l' || e.key === 'L')) {
                e.preventDefault();
                toggleLibras();
            }
        });
    }
    
    function initEventListeners() {
        const fontNormal = document.getElementById('font-normal');
        const fontLarge = document.getElementById('font-large');
        const fontXLarge = document.getElementById('font-xlarge');
        
        if (fontNormal) fontNormal.addEventListener('click', () => setFontSize(100));
        if (fontLarge) fontLarge.addEventListener('click', () => increaseFont());
        if (fontXLarge) fontXLarge.addEventListener('click', () => setFontSize(140));
        
        const contrastBtn = document.getElementById('contrast-toggle');
        if (contrastBtn) contrastBtn.addEventListener('click', toggleHighContrast);
        
        const librasBtn = document.getElementById('libras-btn');
        if (librasBtn) librasBtn.addEventListener('click', toggleLibras);
        
        const emergencyBtns = document.querySelectorAll('#emergency-btn, #footer-samu');
        emergencyBtns.forEach(btn => {
            if (btn) btn.addEventListener('click', (e) => {
                e.preventDefault();
                emergencyCall();
            });
        });
        
        const loginBtns = document.querySelectorAll('#login-btn, #hero-login');
        loginBtns.forEach(btn => {
            if (btn) btn.addEventListener('click', handleLogin);
        });
        
        const servicesBtn = document.getElementById('hero-services');
        if (servicesBtn) {
            servicesBtn.addEventListener('click', () => {
                const servicesSection = document.querySelector('.cards-grid');
                if (servicesSection) {
                    servicesSection.scrollIntoView({ behavior: 'smooth' });
                    showToast('Rolando para a seção de serviços', 'info');
                }
            });
        }
        
        const serviceCards = document.querySelectorAll('.service-card');
        serviceCards.forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const service = card.getAttribute('data-service');
                if (service) showServiceInfo(service);
            });
        });
        
        const alertBtn = document.getElementById('alert-details');
        if (alertBtn) {
            alertBtn.addEventListener('click', () => {
                showToast('Campanha de Vacinação contra Influenza. Procure a UBS mais próxima.', 'info');
            });
        }
        
        const locateUBS = document.getElementById('locate-ubs');
        const locateHospitals = document.getElementById('locate-hospitals');
        
        if (locateUBS) locateUBS.addEventListener('click', findNearbyUBS);
        if (locateHospitals) locateHospitals.addEventListener('click', findHospitals);
    }
    
    function addAnimationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }
            
            .toast-close {
                background: transparent;
                border: none;
                color: inherit;
                cursor: pointer;
                font-size: 16px;
                padding: 0 4px;
                opacity: 0.7;
                transition: opacity 0.2s;
            }
            
            .toast-close:hover {
                opacity: 1;
            }
            
            #main-content:focus {
                outline: none;
            }
            
            .service-card,
            .dashboard-card,
            .alert-card,
            .btn-primary,
            .btn-secondary {
                transition: all 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }
    
    function init() {
        loadUserPreferences();
        initEventListeners();
        setupKeyboardShortcuts();
        addAnimationStyles();
        
        console.log('SUS Digital - Portal do Cidadão inicializado');
        console.log('Atalhos de teclado disponíveis:');
        console.log('  Alt + 1: Ir para conteúdo principal');
        console.log('  Alt + E: Emergência SAMU 192');
        console.log('  Alt + H: Alto contraste');
        console.log('  Alt + L: Ativar/Desativar LIBRAS');
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();

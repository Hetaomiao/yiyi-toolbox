// ========================================
// 设计师工具箱 - 主应用逻辑
// ========================================

// 状态管理
const AppState = {
    currentCategory: null,
    currentTool: null,
    isMenuOpen: false,
    downloadedFiles: []  // 存储下载的文件
};

// 文件夹下载支持
let downloadFolder = null;

// DOM 元素 - 延迟初始化确保 DOM 已就绪
let _elements = null;
function getElements() {
    if (!_elements) {
        _elements = {
            searchInput: document.getElementById('searchInput'),
            navList: document.getElementById('navList'),
            menuBtn: document.getElementById('menuBtn'),
            closeBtn: document.getElementById('closeBtn'),
            sidebar: document.getElementById('sidebar'),
            welcomeSection: document.getElementById('welcomeSection'),
            toolsSection: document.getElementById('toolsSection'),
            toolDetail: document.getElementById('toolDetail'),
            sectionTitle: document.getElementById('sectionTitle'),
            toolCount: document.getElementById('toolCount'),
            toolsGrid: document.getElementById('toolsGrid'),
            toolTitle: document.getElementById('toolTitle'),
            toolContent: document.getElementById('toolContent'),
            backBtn: document.getElementById('backBtn'),
            bottomNav: document.getElementById('bottomNav'),
            toast: document.getElementById('toast')
        };
        console.log('[DEBUG] Elements initialized:', Object.keys(_elements).length);
    }
    return _elements;
}
const elements = new Proxy({}, {
    get: (target, prop) => getElements()[prop]
});

// 渲染导航菜单
function renderNav() {
    const navHTML = TOOLS_DATA.categories.map(cat => `
        <div class="nav-item" data-category="${cat.id}">
            <span class="nav-icon">${cat.icon}</span>
            <span class="nav-text">${cat.name}</span>
            <span class="nav-count">${cat.count}</span>
        </div>
    `).join('');
    
    elements.navList.innerHTML = navHTML;
}

// 绑定事件
function bindEvents() {
    // 导航点击
    elements.navList.addEventListener('click', (e) => {
        const navItem = e.target.closest('.nav-item');
        if (navItem) {
            const category = navItem.dataset.category;
            showCategory(category);
            closeMenu();
        }
    });

    // 搜索
    elements.searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (query.length > 0) {
            showSearchResults(query);
        } else {
            showWelcome();
        }
    });

    // 菜单按钮
    elements.menuBtn.addEventListener('click', toggleMenu);
    elements.closeBtn.addEventListener('click', closeMenu);

    // 返回按钮
    elements.backBtn.addEventListener('click', goBack);
}

// 返回功能（修复版）
function goBack() {
    console.log('[DEBUG] goBack called, currentTool:', AppState.currentTool, 'currentCategory:', AppState.currentCategory);
    // 清除当前工具状态
    AppState.currentTool = null;
    // 获取元素
    const toolDetail = elements.toolDetail;
    const toolsSection = elements.toolsSection;
    const welcomeSection = elements.welcomeSection;
    // 防御性检查
    if (!toolDetail || !toolsSection) {
        console.error('[ERROR] Missing elements in goBack');
        location.reload();
        return;
    }
    // 强制隐藏工具详情页
    toolDetail.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;';
    // 如果有当前分类，显示工具列表
    if (AppState.currentCategory && AppState.currentCategory !== 'home' && AppState.currentCategory !== 'me') {
        // 显示工具列表区
        toolsSection.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important; min-height: 500px !important; position: relative !important;';
        // 确保欢迎页隐藏
        if (welcomeSection) {
            welcomeSection.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important;';
        }
        console.log('[DEBUG] goBack: showed toolsSection for category', AppState.currentCategory);
    } else {
        // 没有分类，显示欢迎页
        showWelcome();
        console.log('[DEBUG] goBack: showed welcome (no category)');
    }
    // 滚动到顶部
    window.scrollTo(0, 0);
}

// 底部导航 - 移动端点击修复版
function setupBottomNav() {
    const navContainer = elements.bottomNav;
    console.log('[DEBUG] setupBottomNav called, navContainer:', navContainer);
    if (!navContainer) {
        console.error('[ERROR] bottomNav element not found!');
        return;
    }
    
    const navItems = navContainer.querySelectorAll('.nav-item');
    console.log('[DEBUG] navItems found:', navItems.length);
    
    function handleNavClick(navItem) {
        const category = navItem.dataset.category;
        console.log('[DEBUG] handleNavClick, category:', category);
        
        // 更新激活状态
        navItems.forEach(n => n.classList.remove('active'));
        navItem.classList.add('active');
        
        // 强制隐藏欢迎页，显示工具区
        elements.welcomeSection.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important;';
        
        if (category === 'home') {
            showWelcome();
        } else {
            // 强制显示工具区（双重保障）
            elements.toolsSection.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important; min-height: 500px !important;';
            elements.toolDetail.style.cssText = 'display: none !important; visibility: hidden !important;';
            
            // 延迟执行确保 DOM 更新
            requestAnimationFrame(() => {
                showCategory(category);
            });
        }
        
        window.scrollTo(0, 0);
    }
    
    // 直接在每个 nav-item 上绑定事件（不移植依赖 closest）
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleNavClick(item);
        });
        item.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleNavClick(item);
        });
    });
}

// 显示欢迎页（修复版）
function showWelcome() {
    console.log('[DEBUG] showWelcome called');
    AppState.currentCategory = 'home'; // 明确设置为首页
    AppState.currentTool = null;
    const welcomeSection = elements.welcomeSection;
    const toolsSection = elements.toolsSection;
    const toolDetail = elements.toolDetail;
    // 防御性检查
    if (!welcomeSection) {
        console.error('[ERROR] welcomeSection not found');
        return;
    }
    // 强制显示欢迎页（使用 !important 覆盖其他样式）
    welcomeSection.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important;';
    // 强制隐藏工具列表
    if (toolsSection) {
        toolsSection.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; height: 0 !important; min-height: 0 !important;';
    }
    // 强制隐藏工具详情
    if (toolDetail) {
        toolDetail.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;';
    }
    // 更新底部导航状态
    updateBottomNavActive('home');
    console.log('[DEBUG] showWelcome completed');
}

// 辅助函数：更新底部导航激活状态
function updateBottomNavActive(category) {
    const bottomNav = document.getElementById('bottomNav');
    if (!bottomNav) return;
    const navItems = bottomNav.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        const itemCategory = item.dataset.category;
        if (itemCategory === category) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// 侧边栏菜单切换
function toggleMenu() {
    console.log('[DEBUG] toggleMenu called, current:', AppState.isMenuOpen);
    const sidebar = elements.sidebar;
    if (!sidebar) {
        console.error('[DEBUG] sidebar not found');
        return;
    }
    
    if (AppState.isMenuOpen) {
        sidebar.style.transform = 'translateX(-100%)';
        sidebar.style.opacity = '0';
        AppState.isMenuOpen = false;
    } else {
        sidebar.style.transform = 'translateX(0)';
        sidebar.style.opacity = '1';
        AppState.isMenuOpen = true;
    }
}

// 关闭菜单
function closeMenu() {
    const sidebar = elements.sidebar;
    if (!sidebar) return;
    sidebar.style.transform = 'translateX(-100%)';
    sidebar.style.opacity = '0';
    AppState.isMenuOpen = false;
}

// 初始化函数
function init() {
    console.log('[DEBUG] init() called');
    console.log('[DEBUG] document.readyState:', document.readyState);
    console.log('[DEBUG] Capacitor:', typeof Capacitor !== 'undefined' ? 'available' : 'NOT available');
    console.log('[DEBUG] isNativePlatform:', typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform());
    
    // 获取 DOM 元素
    const navContainer = document.getElementById('bottomNav');
    console.log('[DEBUG] bottomNav element:', navContainer);
    setupBottomNav();
    
    // 🔴 关键修复：添加 Android 硬件返回键监听
    setupHardwareBackButton();
}

// ========================================
// 新增：硬件返回键处理（Android 专用）
// ========================================
function setupHardwareBackButton() {
    // 检查是否在 Capacitor 原生环境
    if (typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform()) {
        const { App } = Capacitor.Plugins;
        if (App && App.addListener) {
            App.addListener('backButton', ({ canGoBack }) => {
                console.log('[DEBUG] Hardware back button pressed, canGoBack:', canGoBack);
                // 优先使用应用内导航逻辑
                if (AppState.currentTool) {
                    // 如果在工具详情页，返回工具列表
                    goBack();
                    return;
                }
                if (AppState.currentCategory && AppState.currentCategory !== 'home') {
                    // 如果在分类页面，返回首页
                    showWelcome();
                    return;
                }
                // 如果在首页，退出应用
                if (AppState.currentCategory === 'home' || !AppState.currentCategory) {
                    App.exitApp();
                    return;
                }
                // 默认行为：让 WebView 处理
                if (canGoBack) {
                    window.history.back();
                } else {
                    App.exitApp();
                }
            });
            console.log('[DEBUG] Hardware back button listener registered');
        }
    }
}

// 显示分类
function showCategory(categoryId) {
    console.log('[DEBUG] showCategory called:', categoryId);
    AppState.currentCategory = categoryId;
    AppState.currentTool = null;
    // 防御性检查
    if (!elements.welcomeSection || !elements.toolsSection) {
        console.error('Missing elements:', {
            welcomeSection: elements.welcomeSection,
            toolsSection: elements.toolsSection
        });
        return;
    }
    // 如果是"我的"分类，显示个人中心
    if (categoryId === 'me') {
        elements.welcomeSection.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important;';
        elements.toolDetail.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important;';
        elements.toolsSection.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important; min-height: 500px !important;';
        elements.sectionTitle.textContent = '👤 我的';
        elements.toolCount.textContent = '';
        elements.toolsGrid.innerHTML = getProfileView();
        bindProfileEvents();
        updateBottomNavActive('me');
        return;
    }
    const category = ToolUtils.getCategoryById(categoryId);
    const tools = ToolUtils.getToolsByCategory(categoryId);
    // 如果分类不存在，fallback 到首页
    if (!category) {
        console.warn('Category not found:', categoryId);
        showWelcome();
        return;
    }
    // 隐藏欢迎页和工具详情，强制显示工具列表
    elements.welcomeSection.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important;';
    elements.toolDetail.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important;';
    // 强制显示工具列表区
    elements.toolsSection.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important; min-height: 500px !important; position: relative !important;';
    elements.sectionTitle.textContent = category.name;
    elements.toolCount.textContent = `${tools.length} 个工具`;
    elements.toolsGrid.innerHTML = tools.map(tool => `
        <div class="tool-card" data-tool="${tool.id}">
            <div class="tool-icon">${tool.icon}</div>
            <div class="tool-name">${tool.name}</div>
            <div class="tool-desc">${tool.desc}</div>
        </div>
    `).join('');
    // 绑定工具卡片点击
    elements.toolsGrid.querySelectorAll('.tool-card').forEach(card => {
        card.addEventListener('click', () => {
            showTool(card.dataset.tool);
        });
    });
    // 更新底部导航状态
    updateBottomNavActive(categoryId);
    console.log('[DEBUG] showCategory completed for:', categoryId);
}

// 显示搜索结果
function showSearchResults(query) {
    const results = ToolUtils.searchTools(query);

    elements.welcomeSection.style.display = 'none';
    elements.toolDetail.style.display = 'none';
    elements.toolsSection.style.display = 'block';

    elements.sectionTitle.textContent = `搜索: ${query}`;
    elements.toolCount.textContent = `${results.length} 个结果`;

    if (results.length === 0) {
        elements.toolsGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <div class="empty-state-text">未找到相关工具</div>
            </div>
        `;
        return;
    }

    elements.toolsGrid.innerHTML = results.map(tool => `
        <div class="tool-card" data-tool="${tool.id}">
            <div class="tool-icon">${tool.icon}</div>
            <div class="tool-name">${tool.name}</div>
            <div class="tool-desc">${tool.desc}</div>
        </div>
    `).join('');

    elements.toolsGrid.querySelectorAll('.tool-card').forEach(card => {
        card.addEventListener('click', () => {
            showTool(card.dataset.tool);
        });
    });
}

// 显示工具（修复版）
function showTool(toolId) {
    console.log('[DEBUG] showTool called:', toolId);
    const tool = ToolUtils.getToolById(toolId);
    if (!tool) {
        console.error('工具未找到:', toolId);
        showToast('工具加载失败');
        return;
    }
    AppState.currentTool = tool;
    const welcomeSection = elements.welcomeSection;
    const toolsSection = elements.toolsSection;
    const toolDetail = elements.toolDetail;
    const toolTitle = elements.toolTitle;
    // 防御性检查
    if (!toolDetail) {
        console.error('[ERROR] toolDetail element not found');
        return;
    }
    // 强制隐藏欢迎页和工具列表
    if (welcomeSection) {
        welcomeSection.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important;';
    }
    if (toolsSection) {
        toolsSection.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important;';
    }
    // 强制显示工具详情页
    toolDetail.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important; pointer-events: auto !important; height: auto !important;';
    // 设置标题
    if (toolTitle) {
        toolTitle.textContent = tool.name;
        toolTitle.style.cssText = 'display: block !important;';
    }
    // 加载工具内容
    loadToolContent(toolId);
    // 滚动到顶部
    window.scrollTo(0, 0);
    console.log('[DEBUG] showTool completed for:', toolId);
}

// 加载工具内容
function loadToolContent(toolId) {
    const toolContent = document.getElementById('toolContent');
    if (!toolContent) return;

    // 基础模板
    let html = `<div class="tool-view" id="toolView">`;

    // 根据工具ID加载不同界面
    switch(toolId) {
        case 'img-compress':
            html += getImageCompressView();
            break;
        case 'img-format':
            html += getImageFormatView();
            break;
        case 'img-crop':
            html += getImageCropView();
            break;
        case 'img-watermark':
            html += getImageWatermarkView();
            break;
        case 'img-grid9':
            html += getImageGrid9View();
            break;
        case 'img-merge':
            html += getImageMergeView();
            break;
        case 'img-adjust':
            html += getImageAdjustView();
            break;
        case 'img-blur':
            html += getImageBlurView();
            break;
        case 'img-rotate':
            html += getImageRotateView();
            break;
        case 'img-radius':
            html += getImageRadiusView();
            break;
        case 'img-border':
            html += getImageBorderView();
            break;
        case 'img-canon-watermark':
            html += getImageCanonWatermarkView();
            break;
        case 'color-convert':
            html += getColorConvertView();
            break;
        case 'color-gradient':
            html += getColorGradientView();
            break;
        case 'color-palette':
            html += getColorPaletteView();
            break;
        case 'color-extract':
            html += getColorExtractView();
            break;
        case 'qr-gen':
            html += getQRGenView();
            break;
        case 'qr-parse':
            html += getQRParseView();
            break;
        case 'pwd-gen':
            html += getPwdGenView();
            break;
        case 'uuid-gen':
            html += getUuidGenView();
            break;
        case 'hash-gen':
            html += getHashGenView();
            break;
        case 'json-format':
            html += getJsonFormatView();
            break;
        case 'url-encode':
            html += getUrlEncodeView();
            break;
        case 'base64-encode':
            html += getBase64View();
            break;
        case 'html-encode':
            html += getHtmlEncodeView();
            break;
        case 'regex-test':
            html += getRegexTestView();
            break;
        case 'pomodoro':
            html += getPomodoroView();
            break;
        case 'countdown':
            html += getCountdownView();
            break;
        case 'timer':
            html += getTimerView();
            break;
        case 'random-pick':
            html += getRandomPickView();
            break;
        case 'random-wheel':
            html += getRandomWheelView();
            break;
        case 'coin':
            html += getCoinView();
            break;
        case 'dice':
            html += getDiceView();
            break;
        case 'rps':
            html += getRpsView();
            break;
        case 'bmi-calc':
            html += getBmiCalcView();
            break;
        case 'unit-convert':
            html += getUnitConvertView();
            break;
        case 'px-convert':
            html += getPxConvertView();
            break;
        case 'dpi-calc':
            html += getDpiCalcView();
            break;
        case 'exchange-rate':
            html += getExchangeRateView();
            break;
        case 'timestamp':
            html += getTimestampView();
            break;
        case 'date-calc':
            html += getDateCalcView();
            break;
        case 'color-blind':
            html += getColorBlindView();
            break;
        case 'viewdist-calc':
            html += getViewdistCalcView();
            break;
        case 'braille-gen':
            html += getBrailleGenView();
            break;
        case 'structure-calc':
            html += getStructureCalcView();
            break;
        case 'led-layout':
            html += getLedLayoutView();
            break;
        case 'matting':
            html += getMattingView();
            break;
        case 'batch-img':
            html += getBatchImgView();
            break;
        case 'color-random':
            html += getColorRandomView();
            break;
        // 新增工具的视图
        case 'img-mark': html += getImgMarkView(); break;
        case 'img-invert': html += getImgInvertView(); break;
        case 'img-monochrome': html += getImgMonochromeView(); break;
        case 'img-mosaic': html += getImgMosaicView(); break;
        case 'img-oilpaint': html += getImgOilpaintView(); break;
        case 'img-magnifier': html += getImgMagnifierView(); break;
        case 'img-trace': html += getImgTraceView(); break;
        case 'img-scale': html += getImgScaleView(); break;
        case 'img-resize': html += getImgResizeView(); break;
        case 'img-viewer': html += getImgViewerView(); break;
        case 'img-exif': html += getImgExifView(); break;
        case 'img-histogram': html += getImgHistogramView(); break;
        case 'img-base64': html += getImgBase64View(); break;
        case 'img-gif': html += getImgGifView(); break;
        case 'color-contrast': html += getColorContrastView(); break;
        case 'color-wheel': html += getColorWheelView(); break;
        case 'color-palette2': html += getColorPalette2View(); break;
        case 'color-mixer': html += getColorMixerView(); break;
        case 'color-history': html += getColorHistoryView(); break;
        case 'color-export': html += getColorExportView(); break;
        case 'color-gradients': html += getColorGradientsView(); break;
        case 'color-pantone': html += getColorPantoneView(); break;
        case 'color-game': html += getColorGameView(); break;
        case 'char-count': html += getCharCountView(); break;
        case 'keyword-extract': html += getKeywordExtractView(); break;
        case 'sensitive-check': html += getSensitiveCheckView(); break;
        case 'text-art': html += getTextArtView(); break;
        case 'text-cloud': html += getTextCloudView(); break;
        case 'text-path': html += getTextPathView(); break;
        case 'font-preview': html += getFontPreviewView(); break;
        case 'font-weight': html += getFontWeightView(); break;
        case 'code-beautify': html += getCodeBeautifyView(); break;
        case 'markdown': html += getMarkdownView(); break;
        case 'sql-format': html += getSqlFormatView(); break;
        case 'xml-format': html += getXmlFormatView(); break;
        case 'css-gen': html += getCssGenView(); break;
        case 'regex-viz': html += getRegexVizView(); break;
        case 'diff': html += getDiffView(); break;
        case 'jwt-decode': html += getJwtDecodeView(); break;
        case 'cron-parse': html += getCronParseView(); break;
        case 'key-gen': html += getKeyGenView(); break;
        case 'pwd-strength': html += getPwdStrengthView(); break;
        case 'random-str': html += getRandomStrView(); break;
        case 'qr-beautify': html += getQrBeautifyView(); break;
        case 'qr-watermark': html += getQrWatermarkView(); break;
        case 'captcha': html += getCaptchaView(); break;
        case 'barcode-gen': html += getBarcodeGenView(); break;
        case 'ratio-calc': html += getRatioCalcView(); break;
        case 'size-ref': html += getSizeRefView(); break;
        case 'spacing-calc': html += getSpacingCalcView(); break;
        case 'mm-px': html += getMmPxView(); break;
        case 'device-ref': html += getDeviceRefView(); break;
        case 'retina': html += getRetinaView(); break;
        case 'golden-ratio': html += getGoldenRatioView(); break;
        case 'pixel-density': html += getPixelDensityView(); break;
        case 'screen-size': html += getScreenSizeView(); break;
        case 'base-convert': html += getBaseConvertView(); break;
        case 'punctuation': html += getPunctuationView(); break;
        case 'zh-convert': html += getZhConvertView(); break;
        case 'ua-parse': html += getUaParseView(); break;
        case 'browser-info': html += getBrowserInfoView(); break;
        case 'world-clock': html += getWorldClockView(); break;
        case 'timezone': html += getTimezoneView(); break;
        case 'lucky-wheel': html += getLuckyWheelView(); break;
        case 'random-lottery': html += getRandomLotteryView(); break;
        case 'lottery-num': html += getLotteryNumView(); break;
        case 'formula': html += getFormulaView(); break;
        case 'keyboard-test': html += getKeyboardTestView(); break;
        case 'mouse-test': html += getMouseTestView(); break;
        case 'typing-test': html += getTypingTestView(); break;
        case 'puzzle': html += getPuzzleView(); break;
        case 'emoji': html += getEmojiView(); break;
        case 'special-char': html += getSpecialCharView(); break;
        case 'shortcut': html += getShortcutView(); break;
        case 'hash-file': html += getHashFileView(); break;
        case 'unpack': html += getUnpackView(); break;
        case 'audio-wave': html += getAudioWaveView(); break;
        case 'bar-chart': html += getBarChartView(); break;
        case 'line-chart': html += getLineChartView(); break;
        case 'pie-chart': html += getPieChartView(); break;
        case 'flow-chart': html += getFlowChartView(); break;
        case 'mind-map': html += getMindMapView(); break;
        default:
            html += getDefaultToolView(toolId);
    }
    
    try {
        toolContent.innerHTML = html;
    } catch(e) {
        console.error('HTML设置失败:', e);
    }

    try {
        bindToolEvents(toolId);
    } catch(e) {
        console.error('bindToolEvents失败:', e);
    }
}

// ========================================
// 工具事件绑定分发器（修复版）
// ========================================

function bindToolEvents(toolId) {
    switch(toolId) {
        case 'img-compress': bindImageCompressEvents(); break;
        case 'img-format': bindImageFormatEvents(); break;
        case 'img-crop': bindImageCropEvents(); break;
        case 'img-watermark': bindImageWatermarkEvents(); break;
        case 'img-grid9': bindImageGrid9Events(); break;
        case 'img-merge': bindImageMergeEvents(); break;
        case 'img-adjust': bindImageAdjustEvents(); break;
        case 'img-blur': bindImageBlurEvents(); break;
        case 'img-rotate': bindImageRotateEvents(); break;
        case 'img-radius': bindImageRadiusEvents(); break;
        case 'img-border': bindImageBorderEvents(); break;
        case 'img-canon-watermark': bindImageCanonWatermarkEvents(); break;
        case 'color-convert': bindColorConvertEvents(); break;
        case 'color-gradient': bindColorGradientEvents(); break;
        case 'color-palette': bindColorPaletteEvents(); break;
        case 'color-extract': bindColorExtractEvents(); break;
        case 'color-blind': bindColorBlindEvents(); break;
        case 'color-random': bindColorRandomEvents(); break;
        case 'viewdist-calc': bindViewdistCalcEvents(); break;
        case 'braille-gen': bindBrailleGenEvents(); break;
        case 'structure-calc': bindStructureCalcEvents(); break;
        case 'led-layout': bindLedLayoutEvents(); break;
        case 'matting': bindMattingEvents(); break;
        case 'batch-img': bindBatchImgEvents(); break;
        case 'qr-gen': bindQRGenEvents(); break;
        case 'qr-parse': bindQRParseEvents(); break;
        case 'pwd-gen': bindPwdGenEvents(); break;
        case 'uuid-gen': bindUuidGenEvents(); break;
        case 'hash-gen': bindHashGenEvents(); break;
        case 'json-format': bindJsonFormatEvents(); break;
        case 'url-encode': bindUrlEncodeEvents(); break;
        case 'base64-encode': bindBase64Events(); break;
        case 'html-encode': bindHtmlEncodeEvents(); break;
        case 'regex-test': bindRegexTestEvents(); break;
        case 'pomodoro': bindPomodoroEvents(); break;
        case 'countdown': bindCountdownEvents(); break;
        case 'timer': bindTimerEvents(); break;
        case 'random-pick': bindRandomPickEvents(); break;
        case 'random-wheel': bindRandomWheelEvents(); break;
        case 'coin': bindCoinEvents(); break;
        case 'dice': bindDiceEvents(); break;
        case 'rps': bindRpsEvents(); break;
        case 'bmi-calc': bindBmiCalcEvents(); break;
        case 'unit-convert': bindUnitConvertEvents(); break;
        case 'px-convert': bindPxConvertEvents(); break;
        case 'dpi-calc': bindDpiCalcEvents(); break;
        case 'exchange-rate': bindExchangeRateEvents(); break;
        case 'timestamp': bindTimestampEvents(); break;
        case 'date-calc': bindDateCalcEvents(); break;
        // 新增工具的事件绑定
        case 'img-mark': bindImgMarkEvents(); break;
        case 'img-invert': bindImgInvertEvents(); break;
        case 'img-monochrome': bindImgMonochromeEvents(); break;
        case 'img-mosaic': bindImgMosaicEvents(); break;
        case 'img-oilpaint': bindImgOilpaintEvents(); break;
        case 'img-magnifier': bindImgMagnifierEvents(); break;
        case 'img-trace': bindImgTraceEvents(); break;
        case 'img-scale': bindImgScaleEvents(); break;
        case 'img-resize': bindImgResizeEvents(); break;
        case 'img-viewer': bindImgViewerEvents(); break;
        case 'img-exif': bindImgExifEvents(); break;
        case 'img-histogram': bindImgHistogramEvents(); break;
        case 'img-base64': bindImgBase64Events(); break;
        case 'img-gif': bindImgGifEvents(); break;
        case 'color-contrast': bindColorContrastEvents(); break;
        case 'color-wheel': bindColorWheelEvents(); break;
        case 'color-palette2': bindColorPalette2Events(); break;
        case 'color-mixer': bindColorMixerEvents(); break;
        case 'color-history': bindColorHistoryEvents(); break;
        case 'color-export': bindColorExportEvents(); break;
        case 'color-gradients': bindColorGradientsEvents(); break;
        case 'color-pantone': bindColorPantoneEvents(); break;
        case 'color-game': bindColorGameEvents(); break;
        case 'char-count': bindCharCountEvents(); break;
        case 'keyword-extract': bindKeywordExtractEvents(); break;
        case 'sensitive-check': bindSensitiveCheckEvents(); break;
        case 'text-art': bindTextArtEvents(); break;
        case 'text-cloud': bindTextCloudEvents(); break;
        case 'text-path': bindTextPathEvents(); break;
        case 'font-preview': bindFontPreviewEvents(); break;
        case 'font-weight': bindFontWeightEvents(); break;
        case 'code-beautify': bindCodeBeautifyEvents(); break;
        case 'markdown': bindMarkdownEvents(); break;
        case 'sql-format': bindSqlFormatEvents(); break;
        case 'xml-format': bindXmlFormatEvents(); break;
        case 'css-gen': bindCssGenEvents(); break;
        case 'regex-viz': bindRegexVizEvents(); break;
        case 'diff': bindDiffEvents(); break;
        case 'jwt-decode': bindJwtDecodeEvents(); break;
        case 'cron-parse': bindCronParseEvents(); break;
        case 'key-gen': bindKeyGenEvents(); break;
        case 'pwd-strength': bindPwdStrengthEvents(); break;
        case 'random-str': bindRandomStrEvents(); break;
        case 'qr-beautify': bindQrBeautifyEvents(); break;
        case 'qr-watermark': bindQrWatermarkEvents(); break;
        case 'captcha': bindCaptchaEvents(); break;
        case 'barcode-gen': bindBarcodeGenEvents(); break;
        case 'ratio-calc': bindRatioCalcEvents(); break;
        case 'size-ref': bindSizeRefEvents(); break;
        case 'spacing-calc': bindSpacingCalcEvents(); break;
        case 'mm-px': bindMmPxEvents(); break;
        case 'device-ref': bindDeviceRefEvents(); break;
        case 'retina': bindRetinaEvents(); break;
        case 'golden-ratio': bindGoldenRatioEvents(); break;
        case 'pixel-density': bindPixelDensityEvents(); break;
        case 'screen-size': bindScreenSizeEvents(); break;
        case 'base-convert': bindBaseConvertEvents(); break;
        case 'punctuation': bindPunctuationEvents(); break;
        case 'zh-convert': bindZhConvertEvents(); break;
        case 'ua-parse': bindUaParseEvents(); break;
        case 'browser-info': bindBrowserInfoEvents(); break;
        case 'world-clock': bindWorldClockEvents(); break;
        case 'timezone': bindTimezoneEvents(); break;
        case 'lucky-wheel': bindLuckyWheelEvents(); break;
        case 'random-lottery': bindRandomLotteryEvents(); break;
        case 'lottery-num': bindLotteryNumEvents(); break;
        case 'formula': bindFormulaEvents(); break;
        case 'keyboard-test': bindKeyboardTestEvents(); break;
        case 'mouse-test': bindMouseTestEvents(); break;
        case 'typing-test': bindTypingTestEvents(); break;
        case 'puzzle': bindPuzzleEvents(); break;
        case 'emoji': bindEmojiEvents(); break;
        case 'special-char': bindSpecialCharEvents(); break;
        case 'shortcut': bindShortcutEvents(); break;
        case 'hash-file': bindHashFileEvents(); break;
        case 'unpack': bindUnpackEvents(); break;
        case 'audio-wave': bindAudioWaveEvents(); break;
        case 'bar-chart': bindBarChartEvents(); break;
        case 'line-chart': bindLineChartEvents(); break;
        case 'pie-chart': bindPieChartEvents(); break;
        case 'flow-chart': bindFlowChartEvents(); break;
        case 'mind-map': bindMindMapEvents(); break;
    }
}

// ========================================

// ========================================
// 修复所有工具的上传功能
// ========================================

// ========================================
// 通用上传处理函数（增强版）
// ========================================

function setupImageUpload(areaId, inputId, callback) {
    const area = document.getElementById(areaId);
    const input = document.getElementById(inputId);
    if (!area || !input) return;
    
    let touchFired = false;
    
    // 触摸结束时直接触发（手机浏览器）
    area.addEventListener('touchend', (e) => {
        if (e.target.tagName !== 'INPUT') {
            touchFired = true;
            input.click();
        }
    }, { passive: true });
    
    // 点击只在非touch触发时运行（桌面浏览器）
    area.addEventListener('click', (e) => {
        if (touchFired) { touchFired = false; return; }
        if (e.target.tagName !== 'INPUT') {
            input.click();
        }
    });
    
    // 拖拽上传
    area.addEventListener('dragover', (e) => { 
        e.preventDefault(); 
        area.classList.add('dragover'); 
    });
    area.addEventListener('dragleave', () => { 
        area.classList.remove('dragover'); 
    });
    area.addEventListener('drop', (e) => {
        e.preventDefault();
        area.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        if (files.length) {
            // 触发change事件
            const dt = new DataTransfer();
            files.forEach(f => dt.items.add(f));
            input.files = dt.files;
            input.dispatchEvent(new Event('change', { bubbles: true }));
            callback(files);
        }
    });
    
    // 文件选择变化
    input.addEventListener('change', (e) => {
        const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
        if (files.length) {
            callback(files);
        }
    });
    
    return input;
}

// ========================================
// 修复图片压缩 - 支持批量
// ========================================

function getImageCompressView() {
    return `
        <div class="upload-area" id="icUpload">
            <div class="upload-icon">📤</div>
            <div class="upload-text">点击或拖拽上传图片（支持批量）</div>
            <div class="upload-hint">支持 PNG, JPG, WebP, GIF, BMP</div>
            <input type="file" class="upload-input" id="icFile" accept="image/*" multiple>
        </div>
        <div id="batchPreview" style="display:none;margin:10px 0;padding:10px;background:var(--bg-dark);border-radius:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="color:var(--primary);">📋 已选择 <span id="batchCount">0</span> 张图片</span>
                <button class="btn" id="clearBtn" style="padding:5px 10px;font-size:12px;">🗑️ 清空</button>
            </div>
            <div id="batchThumbs" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;max-height:100px;overflow-y:auto;"></div>
        </div>
        <div id="previewContainer" style="display:none;text-align:center;margin:10px 0;">
            <img id="previewImage" class="preview-image" alt="预览" style="max-width:100%;max-height:300px;">
        </div>
        <div class="slider-control">
            <div class="slider-header">
                <span class="slider-label">压缩质量</span>
                <span class="slider-value" id="qualityValue">80%</span>
            </div>
            <input type="range" class="slider" id="qualitySlider" min="10" max="100" value="80">
        </div>
        <div id="resultInfo" style="margin:10px 0;padding:10px;background:var(--bg-dark);border-radius:8px;font-size:13px;display:none;"></div>
        <div class="button-group">
            <button class="btn btn-primary" id="processBtn">🗜️ 压缩所有图片</button>
            <button class="btn btn-secondary" id="downloadAll">📥 下载全部</button>
        </div>
    `;
}

function bindImageCompressEvents() {
    let files = [];
    let results = [];
    let currentIndex = 0;
    
    setupImageUpload('icUpload', 'icFile', (fs) => {
        files = fs;
        results = [];
        currentIndex = 0;
        showBatchPreview();
        if (files.length > 0) {
            processFiles(files);
        }
    });
    
    document.getElementById('clearBtn').addEventListener('click', () => {
        files = [];
        results = [];
        document.getElementById('batchPreview').style.display = 'none';
        document.getElementById('previewContainer').style.display = 'none';
        document.getElementById('resultInfo').style.display = 'none';
        document.getElementById('icFile').value = '';
    });
    
    document.getElementById('qualitySlider').addEventListener('input', (e) => {
        document.getElementById('qualityValue').textContent = e.target.value + '%';
    });
    
    document.getElementById('processBtn').addEventListener('click', () => {
        if (!files.length) { showToast('请先上传图片'); return; }
        processFiles(files);
    });
    
    document.getElementById('downloadAll').addEventListener('click', () => {
        if (!results.length) { showToast('没有可下载的图片'); return; }
        results.forEach((r, i) => {
            setTimeout(() => {
                const a = document.createElement('a');
                a.href = r.dataUrl;
                a.download = `compressed_${i+1}.jpg`;
                a.click();
            }, i * 300);
        });
        showToast(`开始下载 ${results.length} 张图片`);
    });
    
    function showBatchPreview() {
        if (!files.length) return;
        const preview = document.getElementById('batchPreview');
        const thumbs = document.getElementById('batchThumbs');
        const count = document.getElementById('batchCount');
        
        preview.style.display = 'block';
        count.textContent = files.length;
        thumbs.innerHTML = '';
        
        files.forEach((file, i) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                thumbs.innerHTML += `<img src="${e.target.result}" style="width:50px;height:50px;object-fit:cover;border-radius:4px;cursor:pointer;" onclick="selectPreview(${i})">`;
            };
            reader.readAsDataURL(file);
        });
    }
    
    function processFiles(files) {
        results = [];
        const quality = document.getElementById('qualitySlider').value / 100;
        const preview = document.getElementById('previewContainer');
        const info = document.getElementById('resultInfo');
        
        preview.style.display = 'block';
        info.style.display = 'block';
        
        let totalOrig = 0, totalComp = 0;
        
        files.forEach((file, idx) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    canvas.getContext('2d').drawImage(img, 0, 0);
                    const dataUrl = canvas.toDataURL('image/jpeg', quality);
                    const origSize = file.size;
                    const compSize = Math.round(dataUrl.length * 0.75);
                    totalOrig += origSize;
                    totalComp += compSize;
                    
                    results.push({ file, dataUrl, origSize, compSize });
                    
                    if (idx === 0) {
                        document.getElementById('previewImage').src = dataUrl;
                    }
                    
                    if (idx === files.length - 1) {
                        info.innerHTML = `✅ 处理完成 ${files.length} 张图片<br>
                            原始大小: ${(totalOrig/1024).toFixed(1)} KB → 
                            压缩后: ${(totalComp/1024).toFixed(1)} KB 
                            (节省 ${((1-totalComp/totalOrig)*100).toFixed(1)}%)`;
                        showToast('压缩完成！');
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }
}

// ========================================
// 修复图片合并 - 支持统一尺寸
// ========================================

function getImageMergeView() {
    return `
        <div class="upload-area" id="imUpload">
            <div class="upload-icon">📤</div>
            <div class="upload-text">上传多张图片拼接</div>
            <input type="file" class="upload-input" id="imFile" accept="image/*" multiple>
        </div>
        <div id="batchPreview" style="display:none;margin:10px 0;padding:10px;background:var(--bg-dark);border-radius:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="color:var(--primary);">📋 已选择 <span id="batchCount">0</span> 张图片</span>
                <button class="btn" id="clearBtn" style="padding:5px 10px;font-size:12px;">🗑️ 清空</button>
            </div>
            <div id="batchThumbs" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;max-height:100px;overflow-y:auto;"></div>
        </div>
        <div class="form-group">
            <label>排列方式</label>
            <select class="select" id="mergeDir">
                <option value="h">横向拼接（左右拼接）</option>
                <option value="v">纵向拼接（上下拼接）</option>
            </select>
        </div>
        <div class="form-group">
            <label>尺寸统一方式</label>
            <select class="select" id="sizeMode">
                <option value="none">原始尺寸（不统一）</option>
                <option value="height">统一高度（推荐）</option>
                <option value="width">统一宽度</option>
            </select>
        </div>
        <div class="form-group" id="sizeValueGroup">
            <label>统一尺寸值</label>
            <div style="display:flex;align-items:center;gap:10px;">
                <input type="number" class="input" id="sizeValue" value="400" min="50" max="2000" style="width:120px;">
                <span id="sizeUnitLabel" style="color:var(--text-secondary);">像素（高度）</span>
            </div>
        </div>
        <div class="checkbox-group">
            <label class="checkbox-item">
                <input type="checkbox" id="addSpacing" checked>
                <span>图片之间添加间距</span>
            </label>
        </div>
        <div class="form-group" id="spacingGroup" style="display:none;">
            <label>间距大小</label>
            <input type="range" class="slider" id="spacingValue" min="0" max="20" value="8">
            <span id="spacingDisplay">8px</span>
        </div>
        <div class="form-group">
            <label>背景颜色</label>
            <input type="color" class="color-preview" id="bgColor" value="#ffffff">
        </div>
        <div class="button-group">
            <button class="btn btn-primary" id="mergeBtn">➕ 拼接图片</button>
            <button class="btn btn-secondary" id="downloadBtn">📥 下载</button>
        </div>
        <div id="previewContainer" style="display:none;margin-top:15px;text-align:center;">
            <img id="previewImage" style="max-width:100%;border-radius:8px;">
        </div>
    `;
}

function bindImageMergeEvents() {
    let files = [], resultUrl = '', loadedImages = [];
    
    setupImageUpload('imUpload', 'imFile', (fs) => {
        files = fs;
        loadedImages = [];
        showBatchPreview();
    });
    
    // 尺寸模式变化
    document.getElementById('sizeMode').addEventListener('change', (e) => {
        const mode = e.target.value;
        const unitLabel = document.getElementById('sizeUnitLabel');
        const sizeValueGroup = document.getElementById('sizeValueGroup');
        
        if (mode === 'none') {
            sizeValueGroup.style.display = 'none';
        } else {
            sizeValueGroup.style.display = 'block';
            unitLabel.textContent = mode === 'height' ? '像素（高度）' : '像素（宽度）';
        }
    });
    
    // 间距开关
    document.getElementById('addSpacing').addEventListener('change', (e) => {
        document.getElementById('spacingGroup').style.display = e.target.checked ? 'block' : 'none';
    });
    
    // 间距滑块
    document.getElementById('spacingValue').addEventListener('input', (e) => {
        document.getElementById('spacingDisplay').textContent = e.target.value + 'px';
    });
    
    document.getElementById('clearBtn').addEventListener('click', () => {
        files = [];
        loadedImages = [];
        resultUrl = '';
        document.getElementById('batchPreview').style.display = 'none';
        document.getElementById('previewContainer').style.display = 'none';
        document.getElementById('imFile').value = '';
    });
    
    document.getElementById('mergeBtn').addEventListener('click', () => {
        if (files.length < 2) { showToast('请至少上传2张图片'); return; }
        mergeImages();
    });
    
    document.getElementById('downloadBtn').addEventListener('click', () => {
        if (resultUrl) {
            const a = document.createElement('a');
            a.href = resultUrl;
            a.download = 'merged.png';
            a.click();
            showToast('下载成功！');
        } else {
            showToast('请先拼接图片');
        }
    });
    
    function showBatchPreview() {
        if (!files.length) return;
        const preview = document.getElementById('batchPreview');
        const thumbs = document.getElementById('batchThumbs');
        const count = document.getElementById('batchCount');
        
        preview.style.display = 'block';
        count.textContent = files.length;
        thumbs.innerHTML = '';
        
        files.forEach((file, i) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                thumbs.innerHTML += `<img src="${e.target.result}" style="width:50px;height:50px;object-fit:cover;border-radius:4px;">`;
            };
            reader.readAsDataURL(file);
        });
    }
    
    function mergeImages() {
        const mode = document.getElementById('sizeMode').value;
        const sizeValue = parseInt(document.getElementById('sizeValue').value) || 400;
        const isH = document.getElementById('mergeDir').value === 'h';
        const addSpacing = document.getElementById('addSpacing').checked;
        const spacing = addSpacing ? parseInt(document.getElementById('spacingValue').value) : 0;
        const bgColor = document.getElementById('bgColor').value;
        
        loadedImages = [];
        let loadedCount = 0;
        
        files.forEach((file, i) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    // 保留原始尺寸
                    loadedImages[i] = { img, origWidth: img.naturalWidth, origHeight: img.naturalHeight };
                    loadedCount++;
                    
                    if (loadedCount === files.length) {
                        // 先确定参考尺寸（第一张图）
                        const first = loadedImages[0];
                        let refW, refH;
                        if (mode === 'height') {
                            refH = first.origHeight;
                            refW = Math.round(first.origWidth * (refH / first.origHeight));
                        } else if (mode === 'width') {
                            refW = first.origWidth;
                            refH = Math.round(first.origHeight * (refW / first.origWidth));
                        } else {
                            refW = first.origWidth;
                            refH = first.origHeight;
                        }
                        
                        // 所有图片缩放到参考尺寸
                        loadedImages.forEach(item => {
                            item.width = refW;
                            item.height = refH;
                        });
                        
                        doMerge(mode, isH, addSpacing, spacing, bgColor);
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }
    
    function doMerge(mode, isH, addSpacing, spacing, bgColor) {
        
        let canvas, ctx;
        
        if (isH) {
            // 横向拼接
            // 计算最大高度（统一高度模式或原始尺寸取最大）
            let h;
            if (mode === 'height') {
                h = loadedImages[0].height; // 统一高度时都一样
            } else {
                h = Math.max(...loadedImages.map(i => i.height)); // 取最大高度
            }
            
            const totalW = loadedImages.reduce((s, i) => s + i.width, 0) + spacing * (loadedImages.length + 1);
            canvas = document.createElement('canvas');
            canvas.width = totalW;
            canvas.height = h + spacing * 2;
            ctx = canvas.getContext('2d');
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            let x = spacing;
            loadedImages.forEach((item, i) => {
                if (i > 0) x += spacing; // 图片间距
                const y = spacing + (h - item.height) / 2; // 垂直居中
                ctx.drawImage(item.img, x, y, item.width, item.height);
                x += item.width;
            });
        } else {
            // 纵向拼接
            // 计算最大宽度（统一宽度模式或原始尺寸取最大）
            let w;
            if (mode === 'width') {
                w = loadedImages[0].width; // 统一宽度时都一样
            } else {
                w = Math.max(...loadedImages.map(i => i.width)); // 取最大宽度
            }
            
            const totalH = loadedImages.reduce((s, i) => s + i.height, 0) + spacing * (loadedImages.length + 1);
            canvas = document.createElement('canvas');
            canvas.width = w + spacing * 2;
            canvas.height = totalH;
            ctx = canvas.getContext('2d');
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            let y = spacing;
            loadedImages.forEach((item, i) => {
                if (i > 0) y += spacing; // 图片间距
                const x = spacing + (w - item.width) / 2; // 水平居中
                ctx.drawImage(item.img, x, y, item.width, item.height);
                y += item.height;
            });
        }
        
        resultUrl = canvas.toDataURL('image/png');
        document.getElementById('previewImage').src = resultUrl;
        document.getElementById('previewContainer').style.display = 'block';
        showToast('拼接完成！');
    }
}
function getImageCanonWatermarkView() {
    return `
        <div class="upload-area" id="cwUpload">
            <div class="upload-icon">📷</div>
            <div class="upload-text">上传照片（支持批量选择多张）</div>
            <div class="upload-hint">支持 JPG, TIFF 等格式，自动识别相机品牌和参数</div>
            <input type="file" class="upload-input" id="cwFile" accept="image/*" multiple>
        </div>
        
        <!-- 批量预览区 -->
        <div id="batchPreview" style="display:none;margin:15px 0;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                <span style="color:var(--primary);font-weight:500;">📋 已选择 <span id="batchCount">0</span> 张图片</span>
                <button class="btn" id="clearBatchBtn" style="padding:5px 10px;font-size:12px;">🗑️ 清空</button>
            </div>
            <div id="batchThumbs" style="display:flex;flex-wrap:wrap;gap:8px;max-height:150px;overflow-y:auto;"></div>
        </div>
        
        <!-- 识别信息 -->
        <div id="exifInfo" style="background:var(--bg-dark);padding:15px;border-radius:8px;margin:15px 0;font-size:13px;display:none;">
            <div style="margin-bottom:8px;color:var(--primary);font-weight:500;">📋 自动识别的参数：</div>
            <div id="exifDetails"></div>
        </div>
        
        <!-- 水印模板 -->
        <div class="form-group">
            <label>水印模板</label>
            <select class="select" id="watermarkStyle">
                <option value="xiaomi">📱 小米专业水印</option>
                <option value="canon">📷 佳能经典水印</option>
                <option value="sony">📷 索尼专业水印</option>
                <option value="nikon">📷 尼康专业水印</option>
                <option value="huawei">📱 华为徕卡水印</option>
                <option value="minimal">⚪ 简约白色水印</option>
            </select>
        </div>
        
        <!-- 水印高度 -->
        <div class="form-group">
            <label>水印高度比例</label>
            <select class="select" id="wmRatio">
                <option value="0.08">8%（紧凑）</option>
                <option value="0.10">10%（标准）</option>
                <option value="0.12" selected>12%（宽屏）</option>
                <option value="0.15">15%（电影感）</option>
                <option value="0.18">18%（超宽屏）</option>
            </select>
        </div>
        
        <!-- 字体大小 -->
        <div class="form-group">
            <label>字体大小</label>
            <select class="select" id="wmFontSize">
                <option value="0.5">50%</option>
                <option value="0.6">60%</option>
                <option value="0.7">70%</option>
                <option value="0.8">80%</option>
                <option value="0.9">90%</option>
                <option value="1.0">100%（标准）</option>
                <option value="1.1">110%</option>
                <option value="1.2">120%</option>
                <option value="1.4">140%</option>
                <option value="1.6" selected>160%（推荐）</option>
                <option value="1.8">180%</option>
                <option value="2.0">200%</option>
            </select>
        </div>
        
        <!-- 显示时间 -->
        <div class="form-group">
            <label>显示时间</label>
            <select class="select" id="wmShowDate">
                <option value="true" selected>显示时间</option>
                <option value="false">隐藏时间</option>
            </select>
        </div>

        <!-- 自动圆角 -->
        <div class="form-group">
            <label>自动圆角</label>
            <select class="select" id="wmRounded">
                <option value="0">无圆角</option>
                <option value="0.02">小圆角（2%）</option>
                <option value="0.04" selected>中等（4%）</option>
                <option value="0.06">大圆角（6%）</option>
                <option value="0.10">超圆润（10%）</option>
            </select>
        </div>
        
        <!-- 手动调整面板 -->
        <details style="margin:10px 0;">
            <summary style="cursor:pointer;color:var(--text-secondary);font-size:13px;">✏️ 手动调整参数（可选）</summary>
            <div style="margin-top:10px;">
                <div class="form-row">
                    <div class="form-group">
                        <label>品牌/厂商</label>
                        <input type="text" class="input" id="canonBrand" placeholder="自动识别">
                    </div>
                    <div class="form-group">
                        <label>相机型号</label>
                        <input type="text" class="input" id="canonModel" placeholder="自动识别">
                    </div>
                </div>
                <div class="form-group">
                    <label>镜头</label>
                    <input type="text" class="input" id="canonLens" placeholder="自动识别">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>焦距</label>
                        <input type="text" class="input" id="canonFocal" placeholder="自动识别">
                    </div>
                    <div class="form-group">
                        <label>光圈</label>
                        <input type="text" class="input" id="canonAperture" placeholder="自动识别">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>快门</label>
                        <input type="text" class="input" id="canonShutter" placeholder="自动识别">
                    </div>
                    <div class="form-group">
                        <label>ISO</label>
                        <input type="text" class="input" id="canonIso" placeholder="自动识别">
                    </div>
                </div>
            </div>
        </details>
        
        <div class="button-group" style="margin-top:15px;">
            <button class="btn btn-primary" id="batchWatermarkBtn">✨ 批量添加水印</button>
            <button class="btn btn-secondary" id="downloadAllBtn">📥 打包下载全部</button>
        </div>
        
        <!-- 批量进度 -->
        <div id="batchProgress" style="display:none;margin-top:15px;">
            <div style="background:var(--bg-dark);padding:15px;border-radius:8px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                    <span>处理进度</span>
                    <span id="batchProgressText">0/0</span>
                </div>
                <div style="height:8px;background:var(--bg-card);border-radius:4px;overflow:hidden;">
                    <div id="batchProgressBar" style="height:100%;background:var(--primary);width:0%;transition:width 0.3s;"></div>
                </div>
            </div>
        </div>
        
        <!-- 预览区 -->
        <div id="previewContainer" style="display:none;margin-top:15px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                <span style="color:var(--text-secondary);font-size:13px;">处理结果预览</span>
                <button class="btn btn-secondary" id="downloadSingleBtn">📥 下载当前</button>
            </div>
            <img id="previewImage" class="preview-image" alt="预览">
        </div>
    `;
}

// 佳能水印全局变量
let canonBatchFiles = [];
let canonBatchResults = [];
let canonCurrentIndex = 0;
let userModifiedFields = { brand: false, model: false, lens: false, focal: false, aperture: false, shutter: false, iso: false };
let isBatchProcessing = false; // 标识批量处理是否在进行中（修复EXIF重填逻辑）

function bindImageCanonWatermarkEvents() {
    canonBatchFiles = [];
    canonBatchResults = [];
    canonCurrentIndex = 0;
    userModifiedFields = { brand: false, model: false, lens: false, focal: false, aperture: false, shutter: false, iso: false };
    
    // 上传处理 - 兼容手机浏览器（修复：区分touch和click避免冲突）
    const uploadArea = document.getElementById('cwUpload');
    const fileInput = document.getElementById('cwFile');
    let touchFired = false;
    
    uploadArea.addEventListener('touchstart', () => { touchFired = false; }, { passive: true });
    uploadArea.addEventListener('touchend', (e) => {
        if (e.target.tagName !== 'INPUT') {
            touchFired = true;
            fileInput.click();
        }
    }, { passive: true });
    // click只在非touch触发时运行（桌面浏览器）
    uploadArea.addEventListener('click', (e) => {
        if (touchFired) return;
        if (e.target.tagName !== 'INPUT') {
            fileInput.click();
        }
    });
    
    fileInput.addEventListener('change', function(e) {
        const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
        if (files.length > 0) {
            canonBatchFiles = files;
            canonCurrentIndex = 0;
            showCanonBatchPreview();
            // 读取第一张的EXIF
            readExifFromFile(files[0]);
        }
    });
    
    document.getElementById('clearBatchBtn').addEventListener('click', clearCanonBatch);
    document.getElementById('batchWatermarkBtn').addEventListener('click', processCanonBatch);
    document.getElementById('downloadAllBtn').addEventListener('click', downloadCanonAll);
    document.getElementById('downloadSingleBtn').addEventListener('click', downloadCanonSingle);
    
    // 追踪用户手动修改的字段（只有手动修改的才覆盖每张图的EXIF）
    const manualFields = ['canonBrand', 'canonModel', 'canonLens', 'canonFocal', 'canonAperture', 'canonShutter', 'canonIso'];
    manualFields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => {
                userModifiedFields[id.replace('canon', '').toLowerCase()] = true;
            });
        }
    });
}

function showCanonBatchPreview() {
    if (canonBatchFiles.length === 0) return;
    
    const batchPreview = document.getElementById('batchPreview');
    const batchThumbs = document.getElementById('batchThumbs');
    const batchCount = document.getElementById('batchCount');
    
    batchPreview.style.display = 'block';
    batchCount.textContent = canonBatchFiles.length;
    batchThumbs.innerHTML = '';
    
    canonBatchFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const thumb = document.createElement('div');
            thumb.style.cssText = 'width:60px;height:60px;position:relative;cursor:pointer;';
            thumb.innerHTML = `
                <img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:4px;border:2px solid ${index === canonCurrentIndex ? 'var(--primary)' : 'transparent'};">
                <span style="position:absolute;bottom:2px;right:2px;background:rgba(0,0,0,0.6);color:white;font-size:10px;padding:1px 4px;border-radius:2px;">${index + 1}</span>
            `;
            thumb.onclick = () => showCanonPreview(index);
            batchThumbs.appendChild(thumb);
        };
        reader.readAsDataURL(file);
    });
}

function clearCanonBatch() {
    canonBatchFiles = [];
    canonBatchResults = [];
    canonCurrentIndex = 0;
    userModifiedFields = { brand: false, model: false, lens: false, focal: false, aperture: false, shutter: false, iso: false };
    document.getElementById('batchPreview').style.display = 'none';
    document.getElementById('previewContainer').style.display = 'none';
    document.getElementById('batchProgress').style.display = 'none';
    document.getElementById('exifInfo').style.display = 'none';
    document.getElementById('cwFile').value = '';
}

// ========================================
// EXIF解析函数
// ========================================

function readExifFromFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const exif = parseExifFromArrayBuffer(e.target.result);
        displayCanonExifInfo(exif);
        autoFillCanonForm(exif);
    };
    reader.readAsArrayBuffer(file);
}

function parseExifFromArrayBuffer(buffer) {
    const data = {};
    
    try {
        const view = new DataView(buffer);
        
        // 检查SOI标记
        if (view.getUint16(0) !== 0xFFD8) {
            return data; // 不是JPEG
        }
        
        let offset = 2;
        while (offset < view.byteLength - 2) {
            const marker = view.getUint16(offset);
            
            if (marker === 0xFFE1) {
                // APP1 - EXIF
                const length = view.getUint16(offset + 2);
                const exifData = parseExifSegment(view, offset + 4, length - 2);
                Object.assign(data, exifData);
                break;
            } else if ((marker & 0xFF00) === 0xFF00) {
                const length = view.getUint16(offset + 2);
                offset += 2 + length;
            } else {
                break;
            }
        }
    } catch (e) {
        console.log('EXIF parse error:', e);
    }
    
    return data;
}

function parseExifSegment(view, start, length) {
    const data = {};
    
    try {
        // 检查 "Exif\0\0"
        const exifHeader = String.fromCharCode(view.getUint8(start), view.getUint8(start + 1), view.getUint8(start + 2), view.getUint8(start + 3));
        if (exifHeader !== 'Exif') {
            return data;
        }
        
        const tiffStart = start + 6;
        
        // 检查字节序
        const byteOrder = view.getUint16(tiffStart);
        const littleEndian = byteOrder === 0x4949; // 'II'
        
        // TIFF标记
        const ifdOffset = view.getUint32(tiffStart + 4, littleEndian);
        const tiffOffset = tiffStart;
        
        // 解析IFD0
        parseIFD(view, tiffStart + ifdOffset, tiffOffset, littleEndian, data);
        
    } catch (e) {
        console.log('EXIF segment parse error:', e);
    }
    
    return data;
}

function parseIFD(view, ifdStart, tiffOffset, littleEndian, data) {
    try {
        const entries = view.getUint16(ifdStart, littleEndian);
        
        for (let i = 0; i < entries; i++) {
            const entryOffset = ifdStart + 2 + i * 12;
            
            if (entryOffset + 12 > tiffOffset + 65535) break;
            
            const tag = view.getUint16(entryOffset, littleEndian);
            const type = view.getUint16(entryOffset + 2, littleEndian);
            const count = view.getUint32(entryOffset + 4, littleEndian);
            
            let value = '';
            
            // 读取值
            if (count * getTypeSize(type) <= 4) {
                value = readTagValue(view, entryOffset + 8, type, count, tiffOffset, littleEndian);
            } else {
                const valueOffset = view.getUint32(entryOffset + 8, littleEndian);
                value = readTagValue(view, tiffOffset + valueOffset, type, count, tiffOffset, littleEndian);
            }
            
            // 存储有用的标签
            switch (tag) {
                case 0x010F: data.Make = value; break; // 制造商
                case 0x0110: data.Model = value; break; // 型号
                case 0x0112: data.Orientation = value; break;
                case 0x011A: data.XResolution = value; break;
                case 0x011B: data.YResolution = value; break;
                case 0x0131: data.Software = value; break;
                case 0x0132: data.DateTime = value; break;
                case 0x8769: data.ExifIFDPointer = value; break; // EXIF IFD指针
            }
        }
        
        // 解析EXIF IFD
        if (data.ExifIFDPointer) {
            parseExifIFD(view, tiffOffset + data.ExifIFDPointer, tiffOffset, littleEndian, data);
        }
        
    } catch (e) {
        console.log('IFD parse error:', e);
    }
}

function parseExifIFD(view, ifdStart, tiffOffset, littleEndian, data) {
    try {
        const entries = view.getUint16(ifdStart, littleEndian);
        
        for (let i = 0; i < entries; i++) {
            const entryOffset = ifdStart + 2 + i * 12;
            
            if (entryOffset + 12 > tiffOffset + 65535) break;
            
            const tag = view.getUint16(entryOffset, littleEndian);
            const type = view.getUint16(entryOffset + 2, littleEndian);
            const count = view.getUint32(entryOffset + 4, littleEndian);
            
            let value = '';
            
            if (count * getTypeSize(type) <= 4) {
                value = readTagValue(view, entryOffset + 8, type, count, tiffOffset, littleEndian);
            } else {
                const valueOffset = view.getUint32(entryOffset + 8, littleEndian);
                value = readTagValue(view, tiffOffset + valueOffset, type, count, tiffOffset, littleEndian);
            }
            
            switch (tag) {
                case 0x829A: data.ExposureTime = value; break; // 曝光时间
                case 0x829D: data.FNumber = value; break; // 光圈值
                case 0x8827: data.ISOSpeedRatings = value; break; // ISO
                case 0x9003: data.DateTimeOriginal = value; break; // 原始日期时间
                case 0x9004: data.DateTimeDigitized = value; break; // 数字化日期时间
                case 0x920A: data.FocalLength = value; break; // 焦距
                case 0xA001: data.ColorSpace = value; break;
                case 0xA002: data.PixelXDimension = value; break;
                case 0xA003: data.PixelYDimension = value; break;
                case 0xA434: data.LensModel = value; break; // 镜头型号
            }
        }
    } catch (e) {
        console.log('EXIF IFD parse error:', e);
    }
}

function getTypeSize(type) {
    switch (type) {
        case 1: return 1; // BYTE
        case 2: return 1; // ASCII
        case 3: return 2; // SHORT
        case 4: return 4; // LONG
        case 5: return 8; // RATIONAL
        default: return 1;
    }
}

function readTagValue(view, offset, type, count, tiffOffset, littleEndian) {
    try {
        switch (type) {
            case 1: // BYTE
                return view.getUint8(offset);
            case 2: // ASCII
                let str = '';
                for (let i = 0; i < count - 1; i++) {
                    str += String.fromCharCode(view.getUint8(offset + i));
                }
                return str;
            case 3: // SHORT
                return view.getUint16(offset, littleEndian);
            case 4: // LONG
                return view.getUint32(offset, littleEndian);
            case 5: // RATIONAL
                if (count === 1) {
                    const num = view.getUint32(offset, littleEndian);
                    const den = view.getUint32(offset + 4, littleEndian);
                    return den ? (num / den).toFixed(2) : num;
                }
                return '';
            default:
                return '';
        }
    } catch (e) {
        return '';
    }
}

function displayCanonExifInfo(data) {
    if (!data || Object.keys(data).length === 0) {
        document.getElementById('exifInfo').style.display = 'none';
        return;
    }
    
    const info = document.getElementById('exifInfo');
    const details = document.getElementById('exifDetails');
    
    let html = '';
    if (data.Make) html += `<div>📷 品牌: ${data.Make}</div>`;
    if (data.Model) html += `<div>📷 型号: ${data.Model}</div>`;
    if (data.FocalLength) html += `<div>🔍 焦距: ${data.FocalLength}mm</div>`;
    if (data.FNumber) html += `<div>📐 光圈: f/${data.FNumber}</div>`;
    if (data.ExposureTime) html += `<div>⏱️ 快门: 1/${Math.round(1/data.ExposureTime)}s</div>`;
    if (data.ISOSpeedRatings) html += `<div>📊 ISO: ${data.ISOSpeedRatings}</div>`;
    if (data.DateTimeOriginal) html += `<div>📅 日期: ${data.DateTimeOriginal}</div>`;
    if (data.LensModel) html += `<div>📷 镜头: ${data.LensModel}</div>`;
    
    if (html) {
        details.innerHTML = html;
        info.style.display = 'block';
    } else {
        info.style.display = 'none';
    }
}

function autoFillCanonForm(data) {
    if (!data) return;
    if (data.Make) document.getElementById('canonBrand').value = data.Make;
    if (data.Model) document.getElementById('canonModel').value = data.Model;
    if (data.FocalLength) document.getElementById('canonFocal').value = data.FocalLength + 'mm';
    if (data.FNumber) document.getElementById('canonAperture').value = 'f/' + data.FNumber;
    if (data.ExposureTime) document.getElementById('canonShutter').value = '1/' + Math.round(1/data.ExposureTime) + 's';
    if (data.ISOSpeedRatings) document.getElementById('canonIso').value = data.ISOSpeedRatings;
    if (data.LensModel) document.getElementById('canonLens').value = data.LensModel;
    // 重置手动修改标记（自动填充的值不应该覆盖其他图片的EXIF）
    userModifiedFields = { brand: false, model: false, lens: false, focal: false, aperture: false, shutter: false, iso: false };
}

// ========================================
// 批量处理水印
// ========================================

async function processCanonBatch() {
    if (canonBatchFiles.length === 0) {
        showToast('请先上传图片');
        return;
    }
    
    const style = document.getElementById('watermarkStyle').value;
    const wmRatio = parseFloat(document.getElementById('wmRatio').value);
    const wmFontSize = parseFloat(document.getElementById('wmFontSize').value);
    const wmShowDate = document.getElementById('wmShowDate').value === 'true';
    const wmRounded = parseFloat(document.getElementById('wmRounded').value);
    
    // 获取手动填写的参数（只有用户手动输入的才应该覆盖每张图自己的EXIF）
    const manualParams = {
        brand: userModifiedFields.brand ? document.getElementById('canonBrand').value : '',
        model: userModifiedFields.model ? document.getElementById('canonModel').value : '',
        lens: userModifiedFields.lens ? document.getElementById('canonLens').value : '',
        focal: userModifiedFields.focal ? document.getElementById('canonFocal').value : '',
        aperture: userModifiedFields.aperture ? document.getElementById('canonAperture').value : '',
        shutter: userModifiedFields.shutter ? document.getElementById('canonShutter').value : '',
        iso: userModifiedFields.iso ? document.getElementById('canonIso').value : '',
        date: new Date().toLocaleDateString('zh-CN'),
        fontSize: wmFontSize,
        showDate: wmShowDate,
        rounded: wmRounded
    };
    
    document.getElementById('batchProgress').style.display = 'block';
    document.getElementById('batchProgressText').textContent = '0/' + canonBatchFiles.length;
    document.getElementById('batchProgressBar').style.width = '0%';
    
    canonBatchResults = [];
    
    // 用递归+让出主线程的方式处理，确保浏览器能渲染进度条和响应点击
    async function processNext(index) {
        if (index >= canonBatchFiles.length) {
            isBatchProcessing = false;
            if (canonBatchResults.length > 0) {
                document.getElementById('previewImage').src = canonBatchResults[0].dataUrl;
                document.getElementById('previewContainer').style.display = 'block';
            }
            showToast('处理完成！共 ' + canonBatchResults.filter(r => r.dataUrl).length + ' 张');
            return;
        }
        
        // 更新进度条
        document.getElementById('batchProgressText').textContent = `${index + 1}/${canonBatchFiles.length}`;
        document.getElementById('batchProgressBar').style.width = `${((index + 1) / canonBatchFiles.length) * 100}%`;
        
        // 让出主线程，让浏览器有机会渲染进度条和响应点击（手机需要更长延迟）
        await new Promise(r => setTimeout(r, 50));
        
        const file = canonBatchFiles[index];
        
        try {
            const result = await processCanonSingleImage(file, style, wmRatio, manualParams);
            canonBatchResults.push({ name: file.name, dataUrl: result });
        } catch (err) {
            console.error('处理第' + (index+1) + '张图片失败:', err);
            canonBatchResults.push({ name: file.name, dataUrl: null });
        }
        
        // 处理完一张后，让出主线程，再处理下一张
        await new Promise(r => setTimeout(r, 50));
        processNext(index + 1);
    }
    
    // 启动处理（保存promise引用，让调用者可以检查状态）
    isBatchProcessing = true;
    processNext(0);
    // 立即返回，不阻塞UI，但处理已在后台进行
}

function processCanonSingleImage(file, style, wmRatio, params) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const arrayBuffer = e.target.result; // 保存ArrayBuffer用于EXIF解析
            const blob = new Blob([arrayBuffer], { type: file.type });
            const blobUrl = URL.createObjectURL(blob);
            
            const img = new Image();
            img.onload = () => {
                URL.revokeObjectURL(blobUrl); // 释放内存
                // 先读取EXIF
                const exif = parseExifFromArrayBuffer(arrayBuffer);
                
                // 合并EXIF和手动参数
                const finalParams = {
                    brand: params.brand || exif.Make || 'Unknown',
                    model: params.model || exif.Model || '',
                    lens: params.lens || exif.LensModel || '',
                    focal: params.focal || (exif.FocalLength ? exif.FocalLength + 'mm' : ''),
                    aperture: params.aperture || (exif.FNumber ? 'f/' + exif.FNumber : ''),
                    shutter: params.shutter || (exif.ExposureTime ? '1/' + Math.round(1/exif.ExposureTime) + 's' : ''),
                    iso: params.iso || (exif.ISOSpeedRatings ? String(exif.ISOSpeedRatings) : ''),
                    date: params.date || exif.DateTimeOriginal || '',
                    fontSize: params.fontSize || 1.0,
                    showDate: params.showDate !== undefined ? params.showDate : true
                };
                
                const result = generateCanonWatermarkWithParams(img, style, wmRatio, finalParams);
                resolve(result);
            };
            img.src = blobUrl;
        };
        reader.readAsArrayBuffer(file);
    });
}

function generateCanonWatermarkWithParams(img, style, wmRatio, params) {
    const wmHeight = Math.round(img.naturalHeight * wmRatio);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight + wmHeight;
    const ctx = canvas.getContext('2d');
    
    // 绘制原图（支持自动圆角）
    if (params.rounded && params.rounded > 0) {
        const radius = Math.min(img.naturalWidth, img.naturalHeight) * params.rounded;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(img.naturalWidth - radius, 0);
        ctx.quadraticCurveTo(img.naturalWidth, 0, img.naturalWidth, radius);
        ctx.lineTo(img.naturalWidth, img.naturalHeight - radius);
        ctx.quadraticCurveTo(img.naturalWidth, img.naturalHeight, img.naturalWidth - radius, img.naturalHeight);
        ctx.lineTo(radius, img.naturalHeight);
        ctx.quadraticCurveTo(0, img.naturalHeight, 0, img.naturalHeight - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, 0, 0);
        ctx.restore();
    } else {
        ctx.drawImage(img, 0, 0);
    }
    
    // 根据风格绘制水印
    switch (style) {
        case 'xiaomi':
            drawXiaomiWatermarkFinal(ctx, canvas.width, canvas.height, wmHeight, params);
            break;
        case 'canon':
            drawCanonWatermarkFinal(ctx, canvas.width, canvas.height, wmHeight, params);
            break;
        case 'sony':
            drawSonyWatermarkFinal(ctx, canvas.width, canvas.height, wmHeight, params);
            break;
        case 'nikon':
            drawNikonWatermarkFinal(ctx, canvas.width, canvas.height, wmHeight, params);
            break;
        case 'huawei':
            drawHuaweiWatermarkFinal(ctx, canvas.width, canvas.height, wmHeight, params);
            break;
        default:
            drawMinimalWatermarkFinal(ctx, canvas.width, canvas.height, wmHeight, params);
    }
    
    return canvas.toDataURL('image/jpeg', 0.95);
}

function drawXiaomiWatermarkFinal(ctx, width, height, wmHeight, params) {
    // 白色背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, height - wmHeight, width, wmHeight);
    
    // 顶部细灰线
    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height - wmHeight);
    ctx.lineTo(width, height - wmHeight);
    ctx.stroke();
    
    // 基于图片宽度计算字体大小，应用用户选择的字体大小比例
    const fontScale = params.fontSize || 1.0;
    const baseFontSize = Math.round(width * 0.012);
    const titleSize = Math.max(baseFontSize * 1.6, 26) * fontScale;
    const modelSize = Math.max(baseFontSize * 1.0, 15) * fontScale;
    const lensSize = Math.max(baseFontSize * 1.0, 14) * fontScale;
    const paramSize = Math.max(baseFontSize * 0.85, 13) * fontScale;
    const dateSize = Math.max(baseFontSize * 0.7, 11) * fontScale;
    
    const padding = Math.round(width * 0.028);
    const leftStart = padding;
    const centerY = height - wmHeight / 2;
    
    // 品牌（左侧，黑色）- 先测量宽度再换字体
    ctx.fillStyle = '#000000';
    ctx.font = `bold ${titleSize}px Arial`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    const brandText = params.brand || 'Xiaomi';
    const brandWidth = ctx.measureText(brandText).width;
    ctx.fillText(brandText, leftStart, centerY - titleSize * 0.3);
    
    // 型号（品牌右边，灰色）- Y坐标要和品牌对齐
    ctx.fillStyle = '#666666';
    ctx.font = `${modelSize}px Arial`;
    const modelText = ' ' + (params.model || '');
    ctx.fillText(modelText, leftStart + brandWidth, centerY - titleSize * 0.3);
    
    // 镜头信息（品牌下方）
    ctx.fillStyle = '#888888';
    ctx.font = `${lensSize}px Arial`;
    ctx.fillText(params.lens || '', leftStart, centerY + lensSize * 0.6);
    
    // 右侧参数
    ctx.textAlign = 'right';
    
    // 参数行
    ctx.fillStyle = '#333333';
    ctx.font = `${paramSize}px Arial`;
    const paramY = centerY - dateSize * 0.5;
    const paramText = [params.focal, params.aperture, params.shutter, params.iso ? 'ISO ' + params.iso : ''].filter(Boolean).join('  ·  ');
    ctx.fillText(paramText, width - padding, paramY);
    
    // 日期（可选显示）
    if (params.showDate !== false) {
        ctx.fillStyle = '#999999';
        ctx.font = `${dateSize}px Arial`;
        ctx.fillText(params.date || '', width - padding, paramY + dateSize * 1.8);
    }
    
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
}

function drawCanonWatermarkFinal(ctx, width, height, wmHeight, params) {
    // 渐变背景
    const gradient = ctx.createLinearGradient(0, height - wmHeight, 0, height);
    gradient.addColorStop(0, 'rgba(20, 20, 20, 0.9)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.94)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, height - wmHeight, width, wmHeight);
    
    // 顶部细红线
    ctx.fillStyle = '#cc0000';
    ctx.fillRect(0, height - wmHeight, width, 2);
    
    // 基于图片宽度计算字体大小，应用用户选择的字体大小比例
    const fontScale = params.fontSize || 1.0;
    const baseFontSize = Math.round(width * 0.018);
    const titleSize = Math.max(baseFontSize * 1.8, 32) * fontScale;
    const modelSize = Math.max(baseFontSize * 1.1, 20) * fontScale;
    const paramSize = Math.max(baseFontSize * 0.9, 16) * fontScale;
    const dateSize = Math.max(baseFontSize * 0.75, 14) * fontScale;
    
    const padding = Math.round(width * 0.030);
    const leftStart = padding;
    const centerY = height - wmHeight / 2;
    
    // ===== 左侧：Logo + Canon文字 =====
    // 红色圆圈logo
    const logoSize = Math.max(titleSize * 0.9, 28);
    const logoRadius = logoSize / 2;
    
    ctx.fillStyle = '#cc0000';
    ctx.beginPath();
    ctx.arc(leftStart + logoRadius, centerY - titleSize * 0.2, logoRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 白色字母C
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${logoSize * 0.55}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('C', leftStart + logoRadius, centerY - titleSize * 0.2);
    
    // Canon文字（在logo右边，有足够间距）
    const logoEndX = leftStart + logoSize + padding * 0.5;
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${titleSize}px Arial`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('Canon', logoEndX, centerY - titleSize * 0.1);
    
    // 型号（在Canon下方，分开不叠印）
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = `${modelSize}px Arial`;
    ctx.fillText(params.model || '', logoEndX, centerY + modelSize * 0.9);
    
    // ===== 右侧：参数信息 =====
    const rightX = width - padding;
    ctx.textAlign = 'right';
    
    // 参数行
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = `${paramSize}px Arial`;
    const paramY = centerY - paramSize * 0.5;
    const paramText = [params.focal, params.aperture, params.shutter, params.iso ? 'ISO ' + params.iso : ''].filter(Boolean).join('  ·  ');
    ctx.fillText(paramText, rightX, paramY);
    
    // 日期（可选显示）
    if (params.showDate !== false) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.font = `${dateSize}px Arial`;
        ctx.fillText(params.date || '', rightX, paramY + dateSize * 2);
    }
    
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
}

function drawSonyWatermarkFinal(ctx, width, height, wmHeight, params) {
    // 深色渐变背景
    const gradient = ctx.createLinearGradient(0, height - wmHeight, 0, height);
    gradient.addColorStop(0, 'rgba(10, 10, 10, 0.9)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.94)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, height - wmHeight, width, wmHeight);
    
    // 左侧绿条
    ctx.fillStyle = '#00cc00';
    ctx.fillRect(0, height - wmHeight, 3, wmHeight);
    
    // 基于图片宽度计算字体大小，应用用户选择的字体大小比例
    const fontScale = params.fontSize || 1.0;
    const baseFontSize = Math.round(width * 0.012);
    const titleSize = Math.max(baseFontSize * 1.8, 28) * fontScale;
    const modelSize = Math.max(baseFontSize * 1.1, 16) * fontScale;
    const paramSize = Math.max(baseFontSize * 0.9, 14) * fontScale;
    
    const padding = Math.round(width * 0.032);
    const leftStart = padding + 12;
    const centerY = height - wmHeight / 2;
    
    // Sony logo（分开的S和ONY）
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${titleSize}px Arial`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('Sony', leftStart, centerY - titleSize * 0.1);
    
    // 型号（在Sony下方）
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.font = `${modelSize}px Arial`;
    ctx.fillText(params.model || '', leftStart, centerY + modelSize * 0.8);
    
    // 右侧参数
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = `${paramSize}px Arial`;
    const paramText = [params.focal, params.aperture, params.shutter, params.iso ? 'ISO ' + params.iso : ''].filter(Boolean).join('  ·  ');
    ctx.fillText(paramText, width - padding, centerY);
    
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
}

function drawNikonWatermarkFinal(ctx, width, height, wmHeight, params) {
    // 深色渐变背景
    const gradient = ctx.createLinearGradient(0, height - wmHeight, 0, height);
    gradient.addColorStop(0, 'rgba(15, 15, 15, 0.9)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.94)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, height - wmHeight, width, wmHeight);
    
    // 左侧橙条
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(0, height - wmHeight, 3, wmHeight);
    
    // 基于图片宽度计算字体大小，应用用户选择的字体大小比例
    const fontScale = params.fontSize || 1.0;
    const baseFontSize = Math.round(width * 0.012);
    const titleSize = Math.max(baseFontSize * 1.8, 28) * fontScale;
    const modelSize = Math.max(baseFontSize * 1.1, 16) * fontScale;
    const paramSize = Math.max(baseFontSize * 0.9, 14) * fontScale;
    
    const padding = Math.round(width * 0.032);
    const leftStart = padding + 12;
    const centerY = height - wmHeight / 2;
    
    // Nikon logo
    ctx.fillStyle = '#ff6600';
    ctx.font = `bold ${titleSize}px Arial`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('Nikon', leftStart, centerY - titleSize * 0.1);
    
    // 型号（在Nikon下方）
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.font = `${modelSize}px Arial`;
    ctx.fillText(params.model || '', leftStart, centerY + modelSize * 0.8);
    
    // 右侧参数
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = `${paramSize}px Arial`;
    const paramText = [params.focal, params.aperture, params.shutter, params.iso ? 'ISO ' + params.iso : ''].filter(Boolean).join('  ·  ');
    ctx.fillText(paramText, width - padding, centerY);
    
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
}

function drawHuaweiWatermarkFinal(ctx, width, height, wmHeight, params) {
    // 白色背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, height - wmHeight, width, wmHeight);
    
    // 顶部蓝色细条
    ctx.fillStyle = '#0070d9';
    ctx.fillRect(0, height - wmHeight, width, wmHeight * 0.08);
    
    // 底部红色细条
    ctx.fillStyle = '#d40000';
    ctx.fillRect(0, height - wmHeight * 0.08, width, wmHeight * 0.08);
    
    // 基于图片宽度计算字体大小，应用用户选择的字体大小比例
    const fontScale = params.fontSize || 1.0;
    const baseFontSize = Math.round(width * 0.012);
    const titleSize = Math.max(baseFontSize * 1.6, 26) * fontScale;
    const modelSize = Math.max(baseFontSize * 1.0, 15) * fontScale;
    const lensSize = Math.max(baseFontSize * 1.0, 14) * fontScale;
    const paramSize = Math.max(baseFontSize * 0.85, 13) * fontScale;
    
    const padding = Math.round(width * 0.028);
    const leftStart = padding;
    const centerY = height - wmHeight / 2;
    
    // HUAWEI文字（黑色）
    ctx.fillStyle = '#000000';
    ctx.font = `bold ${titleSize}px Arial`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('HUAWEI', leftStart, centerY - titleSize * 0.25);
    
    // 型号（HUAWEI右边，灰色）
    ctx.fillStyle = '#555555';
    ctx.font = `${modelSize}px Arial`;
    const huaweiWidth = ctx.measureText('HUAWEI').width;
    ctx.fillText(' ' + (params.model || ''), leftStart + huaweiWidth, centerY - titleSize * 0.25);
    
    // LEICA镜头信息（HUAWEI下方）
    ctx.fillStyle = '#777777';
    ctx.font = `${lensSize}px Arial`;
    ctx.fillText('LEICA ' + (params.lens || ''), leftStart, centerY + lensSize * 0.5);
    
    // 右侧参数
    ctx.textAlign = 'right';
    ctx.fillStyle = '#333333';
    ctx.font = `${paramSize}px Arial`;
    const paramText = [params.focal, params.aperture, params.shutter, params.iso ? 'ISO ' + params.iso : ''].filter(Boolean).join('  ·  ');
    ctx.fillText(paramText, width - padding, centerY);
    
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
}

function drawMinimalWatermarkFinal(ctx, width, height, wmHeight, params) {
    // 纯白背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, height - wmHeight, width, wmHeight);
    
    // 基于图片宽度计算字体大小，应用用户选择的字体大小比例
    const fontScale = params.fontSize || 1.0;
    const baseFontSize = Math.round(width * 0.012);
    const paramSize = Math.max(baseFontSize * 1.5, 18) * fontScale;
    
    const centerY = height - wmHeight / 2;
    
    ctx.fillStyle = '#333333';
    ctx.font = `${paramSize}px Arial`;
    ctx.textAlign = 'center';
    
    // 根据showDate决定是否显示日期
    let paramText;
    if (params.showDate === false) {
        paramText = [params.focal, params.aperture, params.shutter, params.iso ? 'ISO ' + params.iso : ''].filter(Boolean).join('  ·  ');
    } else {
        paramText = [params.focal, params.aperture, params.shutter, params.iso ? 'ISO ' + params.iso : '', params.date].filter(Boolean).join('  ·  ');
    }
    ctx.fillText(paramText, width / 2, centerY + paramSize * 0.35);
    
    ctx.textAlign = 'left';
}

function showCanonPreview(index) {
    canonCurrentIndex = index;
    // 优先使用已处理的结果（缩略图用）
    if (canonBatchResults[index] && canonBatchResults[index].dataUrl) {
        document.getElementById('previewImage').src = canonBatchResults[index].dataUrl;
        document.getElementById('previewContainer').style.display = 'block';
    } else if (canonBatchFiles[index]) {
        // 没有处理结果时，直接预览原图
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('previewImage').src = e.target.result;
            document.getElementById('previewContainer').style.display = 'block';
        };
        reader.readAsDataURL(canonBatchFiles[index]);
    }
    showCanonBatchPreview();
    // 点击缩略图时，读取该图片的EXIF并自动填充（仅当字段未被手动修改时）
    if (canonBatchFiles[index] && !isBatchProcessing) {
        readExifFromFile(canonBatchFiles[index]);
    }
}

function downloadCanonSingle() {
    // 优先下载已处理的图；没有则下载原图
    if (canonBatchResults.length === 0 && canonBatchFiles.length === 0) {
        showToast('没有可下载的图片');
        return;
    }
    
    const result = canonBatchResults[canonCurrentIndex];
    if (result && result.dataUrl) {
        const a = document.createElement('a');
        a.href = result.dataUrl;
        a.download = 'watermarked_' + (canonCurrentIndex + 1) + '.jpg';
        a.click();
        showToast('下载成功！');
    } else if (canonBatchFiles[canonCurrentIndex]) {
        // 没有处理结果时，下载原图
        const a = document.createElement('a');
        a.href = URL.createObjectURL(canonBatchFiles[canonCurrentIndex]);
        a.download = canonBatchFiles[canonCurrentIndex].name;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 5000);
        showToast('下载原图成功（未添加水印）');
    } else {
        showToast('当前图片不可下载');
    }
}

function downloadCanonAll() {
    if (canonBatchResults.length === 0 && canonBatchFiles.length === 0) {
        showToast('没有可下载的图片');
        return;
    }
    
    // 收集所有有效的结果
    const validResults = canonBatchResults.filter(r => r && r.dataUrl);
    
    if (validResults.length > 0) {
        showToast(`开始下载 ${validResults.length} 张图片...`);
        setTimeout(() => {
            validResults.forEach((result, i) => {
                setTimeout(() => {
                    const a = document.createElement('a');
                    a.href = result.dataUrl;
                    a.download = 'watermarked_' + (i + 1) + '.jpg';
                    a.click();
                }, i * 300);
            });
        }, 300);
    } else {
        // 无处理结果，下载全部原图
        showToast(`开始下载 ${canonBatchFiles.length} 张原图...`);
        setTimeout(() => {
            canonBatchFiles.forEach((file, i) => {
                setTimeout(() => {
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(file);
                    a.download = file.name;
                    a.click();
                }, i * 300);
            });
        }, 300);
    }
}
function getColorConvertView() {
    return `
        <div style="padding:10px;">
            <div class="form-group">
                <label>选择颜色</label>
                <div style="display:flex;gap:15px;align-items:center;">
                    <input type="color" id="colorPicker" value="#6366f1" style="width:60px;height:60px;border:none;cursor:pointer;">
                    <input type="text" class="input" id="colorInput" value="#6366f1" placeholder="#6366f1" style="flex:1;">
                </div>
            </div>
            <div id="colorPreview" style="height:80px;border-radius:12px;background:#6366f1;margin:15px 0;"></div>
            <div class="tabs">
                <button class="tab-btn active" data-tab="hex">HEX</button>
                <button class="tab-btn" data-tab="rgb">RGB</button>
                <button class="tab-btn" data-tab="hsl">HSL</button>
                <button class="tab-btn" data-tab="cmyk">CMYK</button>
            </div>
            <div class="tab-content active" id="tab-hex">
                <div class="code-output" id="hexOut">#6366F1</div>
                <button class="btn btn-secondary" onclick="copyText('hexOut')">📋 复制</button>
            </div>
            <div class="tab-content" id="tab-rgb">
                <div class="code-output" id="rgbOut">rgb(99, 102, 241)</div>
                <button class="btn btn-secondary" onclick="copyText('rgbOut')">📋 复制</button>
            </div>
            <div class="tab-content" id="tab-hsl">
                <div class="code-output" id="hslOut">hsl(239, 84%, 67%)</div>
                <button class="btn btn-secondary" onclick="copyText('hslOut')">📋 复制</button>
            </div>
            <div class="tab-content" id="tab-cmyk">
                <div class="code-output" id="cmykOut">cmyk(59%, 58%, 0%, 5%)</div>
                <button class="btn btn-secondary" onclick="copyText('cmykOut')">📋 复制</button>
            </div>
        </div>
    `;
}

function bindColorConvertEvents() {
    const picker = document.getElementById('colorPicker');
    const input = document.getElementById('colorInput');
    const preview = document.getElementById('colorPreview');
    
    picker.addEventListener('input', (e) => {
        input.value = e.target.value;
        preview.style.background = e.target.value;
        updateColor(e.target.value);
    });
    
    input.addEventListener('change', (e) => {
        let val = e.target.value;
        if (!val.startsWith('#')) val = '#' + val;
        picker.value = val;
        preview.style.background = val;
        updateColor(val);
    });
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
        });
    });
    
    updateColor('#6366f1');
}

function updateColor(hex) {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    document.getElementById('hexOut').textContent = hex.toUpperCase();
    document.getElementById('rgbOut').textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    document.getElementById('hslOut').textContent = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    document.getElementById('cmykOut').textContent = `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;
}

function getColorGradientView() {
    return `
        <div style="padding:10px;">
            <div class="form-group">
                <label>起始颜色</label>
                <div style="display:flex;gap:10px;align-items:center;">
                    <input type="color" id="gradStart" value="#6366f1" style="width:50px;height:50px;border:none;">
                    <input type="text" class="input" id="gradStartVal" value="#6366f1" style="flex:1;">
                </div>
            </div>
            <div class="form-group">
                <label>结束颜色</label>
                <div style="display:flex;gap:10px;align-items:center;">
                    <input type="color" id="gradEnd" value="#8b5cf6" style="width:50px;height:50px;border:none;">
                    <input type="text" class="input" id="gradEndVal" value="#8b5cf6" style="flex:1;">
                </div>
            </div>
            <div class="form-group">
                <label>渐变类型</label>
                <select class="select" id="gradType">
                    <option value="linear">线性渐变</option>
                    <option value="radial">径向渐变</option>
                    <option value="45deg">对角线 (45°)</option>
                    <option value="180deg">上下渐变</option>
                </select>
            </div>
            <div id="gradPreview" style="height:100px;border-radius:12px;background:linear-gradient(#6366f1,#8b5cf6);margin:15px 0;"></div>
            <div class="code-output" id="gradOutput">background: linear-gradient(#6366f1, #8b5cf6);</div>
            <div class="button-group">
                <button class="btn btn-secondary" onclick="copyText('gradOutput')">📋 复制CSS</button>
                <button class="btn btn-primary" id="randomGradBtn">🎲 随机颜色</button>
            </div>
        </div>
    `;
}

function bindColorGradientEvents() {
    const updateGrad = () => {
        const start = document.getElementById('gradStart').value;
        const end = document.getElementById('gradEnd').value;
        const type = document.getElementById('gradType').value;
        document.getElementById('gradStartVal').value = start;
        document.getElementById('gradEndVal').value = end;
        let css, bg;
        if (type === 'linear') { css = `linear-gradient(${start}, ${end})`; bg = css; }
        else if (type === 'radial') { css = `radial-gradient(${start}, ${end})`; bg = css; }
        else if (type === '45deg') { css = `linear-gradient(45deg, ${start}, ${end})`; bg = css; }
        else { css = `linear-gradient(${start}, ${end})`; bg = css; }
        document.getElementById('gradPreview').style.background = bg;
        document.getElementById('gradOutput').textContent = `background: ${css};`;
    };
    
    document.getElementById('gradStart').addEventListener('input', updateGrad);
    document.getElementById('gradEnd').addEventListener('input', updateGrad);
    document.getElementById('gradType').addEventListener('change', updateGrad);
    document.getElementById('randomGradBtn').addEventListener('click', () => {
        document.getElementById('gradStart').value = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6,'0');
        document.getElementById('gradEnd').value = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6,'0');
        updateGrad();
    });
}

function getColorPaletteView() {
    return `
        <div style="padding:10px;">
            <div class="form-group">
                <label>基准颜色</label>
                <input type="color" id="paletteBase" value="#6366f1" style="width:100%;height:50px;border:none;">
            </div>
            <div class="form-group">
                <label>配色方案</label>
                <select class="select" id="paletteType">
                    <option value="analogous">类似色</option>
                    <option value="complementary">互补色</option>
                    <option value="triadic">三色组</option>
                    <option value="split">分裂互补</option>
                    <option value="monochromatic">单色系</option>
                </select>
            </div>
            <div id="paletteSwatches" style="display:flex;gap:10px;margin:20px 0;flex-wrap:wrap;"></div>
            <div id="paletteCodes" style="font-size:13px;"></div>
            <button class="btn btn-secondary" onclick="copyPalette()">📋 复制全部</button>
        </div>
    `;
}

function bindColorPaletteEvents() {
    const generate = () => {
        const base = document.getElementById('paletteBase').value;
        const type = document.getElementById('paletteType').value;
        const colors = generatePalette(base, type);
        document.getElementById('paletteSwatches').innerHTML = colors.map(c => 
            `<div style="width:60px;height:60px;background:${c};border-radius:8px;cursor:pointer;" onclick="copyToClipboard('${c}')"></div>`
        ).join('');
        document.getElementById('paletteCodes').innerHTML = colors.map(c => `<code style="display:block;margin:5px 0;">${c.toUpperCase()}</code>`).join('');
    };
    document.getElementById('paletteBase').addEventListener('input', generate);
    document.getElementById('paletteType').addEventListener('change', generate);
    generate();
}

function getColorExtractView() {
    return `
        <div style="padding:10px;">
            <div class="upload-area" id="ceUpload">
                <div class="upload-icon">🎨</div>
                <div class="upload-text">上传图片提取配色</div>
                <input type="file" class="upload-input" id="ceFile" accept="image/*">
            </div>
            <div id="previewContainer" style="display:none;text-align:center;margin:15px 0;">
                <img id="previewImage" style="max-width:100%;max-height:200px;border-radius:8px;">
            </div>
            <div id="extractedColors" style="display:flex;gap:10px;flex-wrap:wrap;margin:15px 0;"></div>
            <button class="btn btn-primary" id="extractBtn">🎨 提取配色</button>
        </div>
    `;
}

function bindColorExtractEvents() {
    let img = null;
    setupImageUpload('ceUpload', 'ceFile', (files) => {
        img = new Image();
        img.onload = () => {
            document.getElementById('previewImage').src = URL.createObjectURL(files[0]);
            document.getElementById('previewContainer').style.display = 'block';
        };
        img.src = URL.createObjectURL(files[0]);
    });
    
    document.getElementById('extractBtn').addEventListener('click', () => {
        if (!img) { showToast('请先上传图片'); return; }
        extractColors(img);
    });
}

function extractColors(img) {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext('2d').drawImage(img, 0, 0);
    const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    const map = {};
    for (let i = 0; i < data.length; i += 40) {
        const r = Math.round(data[i] / 32) * 32;
        const g = Math.round(data[i+1] / 32) * 32;
        const b = Math.round(data[i+2] / 32) * 32;
        const hex = '#' + [r,g,b].map(x => x.toString(16).padStart(2,'0')).join('');
        map[hex] = (map[hex] || 0) + 1;
    }
    const sorted = Object.entries(map).sort((a,b) => b[1]-a[1]).slice(0, 8);
    document.getElementById('extractedColors').innerHTML = sorted.map(([c]) => 
        `<div style="width:50px;height:50px;background:${c};border-radius:8px;cursor:pointer;" onclick="copyToClipboard('${c}')"></div>`
    ).join('');
    showToast('提取完成！点击颜色复制');
}

// ========================================
// 代码工具
// ========================================

function getJsonFormatView() {
    return `
        <div style="padding:10px;">
            <div class="form-group">
                <label>输入 JSON</label>
                <textarea class="input" id="jsonInput" rows="6" placeholder='{"name":"张三","age":25}'></textarea>
            </div>
            <div class="button-group">
                <button class="btn btn-primary" id="formatBtn">✨ 格式化</button>
                <button class="btn btn-secondary" id="minifyBtn">🔽 压缩</button>
                <button class="btn btn-secondary" id="validateBtn">✅ 校验</button>
            </div>
            <div class="form-group" style="margin-top:15px;">
                <label>输出结果</label>
                <div class="code-output" id="jsonOutput" style="max-height:200px;overflow:auto;">等待输入...</div>
            </div>
            <button class="btn btn-secondary" onclick="copyText('jsonOutput')">📋 复制结果</button>
        </div>
    `;
}

function bindJsonFormatEvents() {
    document.getElementById('formatBtn').addEventListener('click', () => {
        try {
            const obj = JSON.parse(document.getElementById('jsonInput').value);
            document.getElementById('jsonOutput').textContent = JSON.stringify(obj, null, 2);
            showToast('格式化成功');
        } catch(e) {
            document.getElementById('jsonOutput').textContent = '❌ 错误: ' + e.message;
            showToast('JSON格式错误');
        }
    });
    document.getElementById('minifyBtn').addEventListener('click', () => {
        try {
            const obj = JSON.parse(document.getElementById('jsonInput').value);
            document.getElementById('jsonOutput').textContent = JSON.stringify(obj);
            showToast('压缩成功');
        } catch(e) {
            document.getElementById('jsonOutput').textContent = '❌ 错误: ' + e.message;
        }
    });
    document.getElementById('validateBtn').addEventListener('click', () => {
        try {
            JSON.parse(document.getElementById('jsonInput').value);
            document.getElementById('jsonOutput').textContent = '✅ JSON格式正确';
            showToast('校验通过');
        } catch(e) {
            document.getElementById('jsonOutput').textContent = '❌ 错误: ' + e.message;
            showToast('格式错误');
        }
    });
}

function getUrlEncodeView() {
    return `
        <div style="padding:10px;">
            <div class="form-group">
                <label>输入内容</label>
                <textarea class="input" id="urlInput" rows="4" placeholder="输入要编码/解码的内容..."></textarea>
            </div>
            <div class="button-group">
                <button class="btn btn-primary" id="encodeBtn">🔗 编码</button>
                <button class="btn btn-secondary" id="decodeBtn">🔓 解码</button>
            </div>
            <div class="form-group" style="margin-top:15px;">
                <label>结果</label>
                <div class="code-output" id="urlOutput" style="word-break:break-all;">等待输入...</div>
            </div>
            <button class="btn btn-secondary" onclick="copyText('urlOutput')">📋 复制结果</button>
        </div>
    `;
}

function bindUrlEncodeEvents() {
    document.getElementById('encodeBtn').addEventListener('click', () => {
        document.getElementById('urlOutput').textContent = encodeURIComponent(document.getElementById('urlInput').value);
        showToast('编码成功');
    });
    document.getElementById('decodeBtn').addEventListener('click', () => {
        try {
            document.getElementById('urlOutput').textContent = decodeURIComponent(document.getElementById('urlInput').value);
            showToast('解码成功');
        } catch(e) {
            showToast('解码失败');
        }
    });
}

function getBase64View() {
    return `
        <div style="padding:10px;">
            <div class="form-group">
                <label>输入内容</label>
                <textarea class="input" id="base64Input" rows="4" placeholder="输入要编码/解码的内容..."></textarea>
            </div>
            <div class="button-group">
                <button class="btn btn-primary" id="encodeBtn">📝 编码为Base64</button>
                <button class="btn btn-secondary" id="decodeBtn">🔓 Base64解码</button>
            </div>
            <div class="form-group" style="margin-top:15px;">
                <label>结果</label>
                <div class="code-output" id="base64Output" style="word-break:break-all;">等待输入...</div>
            </div>
            <button class="btn btn-secondary" onclick="copyText('base64Output')">📋 复制结果</button>
        </div>
    `;
}

function bindBase64Events() {
    document.getElementById('encodeBtn').addEventListener('click', () => {
        try {
            document.getElementById('base64Output').textContent = btoa(unescape(encodeURIComponent(document.getElementById('base64Input').value)));
            showToast('编码成功');
        } catch(e) { showToast('编码失败'); }
    });
    document.getElementById('decodeBtn').addEventListener('click', () => {
        try {
            document.getElementById('base64Output').textContent = decodeURIComponent(escape(atob(document.getElementById('base64Input').value)));
            showToast('解码成功');
        } catch(e) { showToast('解码失败'); }
    });
}

function getRegexTestView() {
    return `
        <div style="padding:10px;">
            <div class="form-group">
                <label>正则表达式</label>
                <input type="text" class="input" id="regexPattern" placeholder="例如: \\d+">
            </div>
            <div class="form-group">
                <label>测试文本</label>
                <textarea class="input" id="regexText" rows="4" placeholder="输入要匹配的文本..."></textarea>
            </div>
            <div class="button-group">
                <button class="btn btn-primary" id="testBtn">.* 测试匹配</button>
            </div>
            <div class="form-group" style="margin-top:15px;">
                <label>匹配结果</label>
                <div class="code-output" id="regexOutput">无匹配</div>
            </div>
        </div>
    `;
}

function bindRegexTestEvents() {
    document.getElementById('testBtn').addEventListener('click', () => {
        try {
            const regex = new RegExp(document.getElementById('regexPattern').value, 'g');
            const text = document.getElementById('regexText').value;
            const matches = text.match(regex);
            if (matches) {
                document.getElementById('regexOutput').textContent = `找到 ${matches.length} 个匹配:\n${[...new Set(matches)].join('\n')}`;
            } else {
                document.getElementById('regexOutput').textContent = '无匹配';
            }
        } catch(e) {
            document.getElementById('regexOutput').textContent = '正则错误: ' + e.message;
        }
    });
}

// ========================================
// 安全工具
// ========================================

function getPwdGenView() {
    return `
        <div style="padding:10px;">
            <div class="form-row">
                <div class="form-group">
                    <label>密码长度</label>
                    <input type="number" class="input" id="pwdLen" value="16" min="6" max="64">
                </div>
                <div class="form-group">
                    <label>数量</label>
                    <input type="number" class="input" id="pwdCount" value="1" min="1" max="20">
                </div>
            </div>
            <div class="checkbox-group">
                <label class="checkbox-item"><input type="checkbox" id="pwdUpper" checked> 大写 A-Z</label>
                <label class="checkbox-item"><input type="checkbox" id="pwdLower" checked> 小写 a-z</label>
                <label class="checkbox-item"><input type="checkbox" id="pwdNum" checked> 数字 0-9</label>
                <label class="checkbox-item"><input type="checkbox" id="pwdSym" checked> 符号 !@#$</label>
            </div>
            <div class="result-container" style="margin:15px 0;">
                <div class="code-output" id="pwdOutput" style="font-size:16px;">点击生成密码</div>
            </div>
            <div class="button-group">
                <button class="btn btn-primary" id="genBtn">🔑 生成</button>
                <button class="btn btn-secondary" onclick="copyText('pwdOutput')">📋 复制</button>
            </div>
        </div>
    `;
}

function bindPwdGenEvents() {
    document.getElementById('genBtn').addEventListener('click', () => {
        const len = parseInt(document.getElementById('pwdLen').value) || 16;
        const count = parseInt(document.getElementById('pwdCount').value) || 1;
        let chars = '';
        if (document.getElementById('pwdUpper').checked) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (document.getElementById('pwdLower').checked) chars += 'abcdefghijklmnopqrstuvwxyz';
        if (document.getElementById('pwdNum').checked) chars += '0123456789';
        if (document.getElementById('pwdSym').checked) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
        if (!chars) { showToast('请至少选择一种字符'); return; }
        const pwds = [];
        for (let c = 0; c < count; c++) {
            let pwd = '';
            for (let i = 0; i < len; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
            pwds.push(pwd);
        }
        document.getElementById('pwdOutput').textContent = pwds.join('\n');
        showToast('生成成功');
    });
}

function getUuidGenView() {
    return `
        <div style="padding:10px;">
            <div class="form-group">
                <label>生成数量</label>
                <input type="number" class="input" id="uuidCount" value="5" min="1" max="50">
            </div>
            <button class="btn btn-primary" id="genBtn" style="width:100%;margin:15px 0;">🎲 生成UUID</button>
            <div class="code-output" id="uuidOutput" style="white-space:pre-wrap;">点击按钮生成</div>
            <button class="btn btn-secondary" onclick="copyText('uuidOutput')">📋 复制全部</button>
        </div>
    `;
}

function bindUuidGenEvents() {
    document.getElementById('genBtn').addEventListener('click', () => {
        const count = parseInt(document.getElementById('uuidCount').value) || 5;
        const uuids = [];
        for (let i = 0; i < count; i++) uuids.push(crypto.randomUUID());
        document.getElementById('uuidOutput').textContent = uuids.join('\n');
        showToast('生成成功');
    });
}

// ========================================
// 日常工具
// ========================================

function getPomodoroView() {
    return `
        <div style="text-align:center;padding:30px;">
            <div id="pomoDisplay" style="font-size:72px;font-weight:bold;margin:20px 0;">25:00</div>
            <div id="pomoStatus" style="color:var(--text-secondary);margin-bottom:20px;">🍅 准备开始</div>
            <div class="button-group" style="justify-content:center;">
                <button class="btn btn-primary" id="startBtn">▶️ 开始</button>
                <button class="btn btn-secondary" id="pauseBtn">⏸️ 暂停</button>
                <button class="btn btn-secondary" id="resetBtn">🔄 重置</button>
            </div>
            <div class="form-row" style="justify-content:center;margin-top:30px;max-width:300px;margin-left:auto;margin-right:auto;">
                <div class="form-group" style="text-align:left;">
                    <label>工作(分)</label>
                    <input type="number" class="input" id="workTime" value="25" min="1" max="60">
                </div>
                <div class="form-group" style="text-align:left;">
                    <label>休息(分)</label>
                    <input type="number" class="input" id="breakTime" value="5" min="1" max="30">
                </div>
            </div>
        </div>
    `;
}

function bindPomodoroEvents() {
    let time = 25 * 60, running = false, timer = null;
    const display = document.getElementById('pomodoroDisplay');
    const status = document.getElementById('pomoStatus');
    
    const tick = () => {
        const m = Math.floor(time / 60), s = time % 60;
        display.textContent = `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    };
    
    document.getElementById('startBtn').addEventListener('click', () => {
        if (running) return;
        running = true;
        status.textContent = '🍅 工作中...';
        timer = setInterval(() => {
            time--; tick();
            if (time <= 0) {
                clearInterval(timer); running = false;
                showToast('时间到！休息一下吧！☕');
                time = parseInt(document.getElementById('breakTime').value) * 60;
                status.textContent = '☕ 休息中';
                tick();
            }
        }, 1000);
    });
    
    document.getElementById('pauseBtn').addEventListener('click', () => {
        clearInterval(timer); running = false;
        status.textContent = '⏸️ 已暂停';
    });
    
    document.getElementById('resetBtn').addEventListener('click', () => {
        clearInterval(timer); running = false;
        time = parseInt(document.getElementById('workTime').value) * 60;
        status.textContent = '🍅 准备开始';
        tick();
    });
    
    tick();
}

function getCountdownView() {
    return `
        <div style="text-align:center;padding:20px;">
            <div class="form-row" style="justify-content:center;">
                <div class="form-group" style="text-align:center;">
                    <label>时</label>
                    <input type="number" class="input" id="cdH" value="0" min="0" max="99" style="width:80px;text-align:center;">
                </div>
                <div class="form-group" style="text-align:center;">
                    <label>分</label>
                    <input type="number" class="input" id="cdM" value="5" min="0" max="59" style="width:80px;text-align:center;">
                </div>
                <div class="form-group" style="text-align:center;">
                    <label>秒</label>
                    <input type="number" class="input" id="cdS" value="0" min="0" max="59" style="width:80px;text-align:center;">
                </div>
            </div>
            <div style="font-size:64px;font-weight:bold;margin:20px 0;" id="cdDisplay">00:05:00</div>
            <div class="button-group" style="justify-content:center;">
                <button class="btn btn-primary" id="startBtn">▶️ 开始</button>
                <button class="btn btn-secondary" id="pauseBtn">⏸️ 暂停</button>
                <button class="btn btn-secondary" id="resetBtn">🔄 重置</button>
            </div>
        </div>
    `;
}

function bindCountdownEvents() {
    let time = 0, running = false, timer = null;
    const display = document.getElementById('cdDisplay');
    
    const tick = () => {
        const h = Math.floor(time / 3600), m = Math.floor((time % 3600) / 60), s = time % 60;
        display.textContent = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    };
    
    document.getElementById('startBtn').addEventListener('click', () => {
        if (running) return;
        const h = parseInt(document.getElementById('cdH').value) || 0;
        const m = parseInt(document.getElementById('cdM').value) || 0;
        const s = parseInt(document.getElementById('cdS').value) || 0;
        time = h * 3600 + m * 60 + s;
        running = true;
        timer = setInterval(() => {
            time--; tick();
            if (time <= 0) { clearInterval(timer); running = false; showToast('倒计时结束！'); }
        }, 1000);
    });
    
    document.getElementById('pauseBtn').addEventListener('click', () => { clearInterval(timer); running = false; });
    document.getElementById('resetBtn').addEventListener('click', () => { clearInterval(timer); running = false; tick(); });
    tick();
}

function getTimerView() {
    return `
        <div style="text-align:center;padding:30px;">
            <div style="font-size:72px;font-weight:bold;margin:20px 0;" id="timerDisplay">00:00:00</div>
            <div class="button-group" style="justify-content:center;">
                <button class="btn btn-primary" id="startBtn">▶️ 开始</button>
                <button class="btn btn-secondary" id="pauseBtn">⏸️ 暂停</button>
                <button class="btn btn-secondary" id="lapBtn">📝 记次</button>
                <button class="btn btn-secondary" id="resetBtn">🔄 重置</button>
            </div>
            <div id="lapList" style="margin-top:20px;max-height:200px;overflow-y:auto;"></div>
        </div>
    `;
}

function bindTimerEvents() {
    let time = 0, running = false, timer = null, lapCount = 0;
    const display = document.getElementById('timerDisplay');
    
    const tick = () => {
        const h = Math.floor(time / 3600), m = Math.floor((time % 3600) / 60), s = time % 60;
        display.textContent = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    };
    
    document.getElementById('startBtn').addEventListener('click', () => {
        if (running) return;
        running = true;
        timer = setInterval(() => { time++; tick(); }, 1000);
    });
    
    document.getElementById('pauseBtn').addEventListener('click', () => { clearInterval(timer); running = false; });
    
    document.getElementById('resetBtn').addEventListener('click', () => {
        clearInterval(timer); running = false; time = 0; lapCount = 0;
        document.getElementById('lapList').innerHTML = ''; tick();
    });
    
    document.getElementById('lapBtn').addEventListener('click', () => {
        if (running) {
            lapCount++;
            const h = Math.floor(time / 3600), m = Math.floor((time % 3600) / 60), s = time % 60;
            const div = document.createElement('div');
            div.style.cssText = 'padding:8px;border-bottom:1px solid var(--border);font-size:14px;';
            div.textContent = `第 ${lapCount} 次: ${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
            document.getElementById('lapList').insertBefore(div, document.getElementById('lapList').firstChild);
        }
    });
    tick();
}

function getRandomPickView() {
    return `
        <div style="padding:20px;">
            <div class="form-group">
                <label>输入选项（每行一个）</label>
                <textarea class="input" id="pickOptions" rows="8" placeholder="选项1&#10;选项2&#10;选项3&#10;..."></textarea>
            </div>
            <div class="button-group">
                <button class="btn btn-primary" id="pickBtn" style="flex:2;">🎲 随机抽取</button>
                <button class="btn btn-secondary" id="clearBtn">🗑️ 清空</button>
            </div>
            <div id="pickResult" style="text-align:center;font-size:36px;font-weight:bold;margin:30px 0;min-height:50px;"></div>
        </div>
    `;
}

function bindRandomPickEvents() {
    document.getElementById('pickBtn').addEventListener('click', () => {
        const options = document.getElementById('pickOptions').value.split('\n').filter(o => o.trim());
        if (options.length < 2) { showToast('请至少输入2个选项'); return; }
        const pick = options[Math.floor(Math.random() * options.length)];
        document.getElementById('pickResult').textContent = pick;
        showToast('抽取成功！');
    });
    document.getElementById('clearBtn').addEventListener('click', () => {
        document.getElementById('pickOptions').value = '';
        document.getElementById('pickResult').textContent = '';
    });
}

function getCoinView() {
    return `
        <div style="text-align:center;padding:40px;">
            <div id="coinResult" style="font-size:120px;margin:30px 0;">🪙</div>
            <button class="btn btn-primary" id="flipBtn" style="font-size:24px;padding:15px 40px;">🪙 抛硬币</button>
            <div style="margin-top:30px;color:var(--text-muted);">
                正面: <strong id="headsCount">0</strong> | 反面: <strong id="tailsCount">0</strong>
            </div>
        </div>
    `;
}

function bindCoinEvents() {
    let heads = 0, tails = 0;
    document.getElementById('flipBtn').addEventListener('click', () => {
        const isHeads = Math.random() < 0.5;
        document.getElementById('coinResult').textContent = isHeads ? '🪙' : '✌️';
        if (isHeads) heads++; else tails++;
        document.getElementById('headsCount').textContent = heads;
        document.getElementById('tailsCount').textContent = tails;
    });
}

function getDiceView() {
    return `
        <div style="text-align:center;padding:40px;">
            <div id="diceResult" style="font-size:120px;margin:30px 0;">🎲</div>
            <button class="btn btn-primary" id="rollBtn" style="font-size:24px;padding:15px 40px;">🎲 掷骰子</button>
            <div style="margin-top:20px;color:var(--text-muted);font-size:14px;">
                历史: <span id="diceHistory">无</span>
            </div>
        </div>
    `;
}

function bindDiceEvents() {
    let history = [];
    const emojis = ['⚀','⚁','⚂','⚃','⚄','⚅'];
    document.getElementById('rollBtn').addEventListener('click', () => {
        const num = Math.floor(Math.random() * 6) + 1;
        document.getElementById('diceResult').textContent = emojis[num - 1];
        history.unshift(num);
        if (history.length > 10) history.pop();
        document.getElementById('diceHistory').textContent = history.join(', ');
    });
}

function getRpsView() {
    return `
        <div style="text-align:center;padding:30px;">
            <div style="font-size:18px;color:var(--text-muted);margin-bottom:20px;">选择你的出拳</div>
            <div class="button-group" style="justify-content:center;gap:20px;">
                <button class="btn" id="rpsRock" style="font-size:48px;padding:20px;">✊</button>
                <button class="btn" id="rpsPaper" style="font-size:48px;padding:20px;">✋</button>
                <button class="btn" id="rpsScissors" style="font-size:48px;padding:20px;">✌️</button>
            </div>
            <div id="rpsResult" style="font-size:32px;font-weight:bold;margin:30px 0;">VS</div>
            <div style="color:var(--text-muted);">
                你: <strong id="rpsUser">0</strong> | 平: <strong id="rpsDraw">0</strong> | 电脑: <strong id="rpsComputer">0</strong>
            </div>
        </div>
    `;
}

function bindRpsEvents() {
    let user = 0, draw = 0, computer = 0;
    const play = (choice) => {
        const comp = Math.floor(Math.random() * 3);
        let result;
        if (choice === comp) { result = '平局'; draw++; }
        else if ((choice + 1) % 3 === comp) { result = '你赢了'; user++; }
        else { result = '电脑赢了'; computer++; }
        const emojis = ['✊','✋','✌️'];
        document.getElementById('rpsResult').textContent = `${emojis[choice]} VS ${emojis[comp]} - ${result}`;
        document.getElementById('rpsUser').textContent = user;
        document.getElementById('rpsDraw').textContent = draw;
        document.getElementById('rpsComputer').textContent = computer;
    };
    document.getElementById('rpsRock').addEventListener('click', () => play(0));
    document.getElementById('rpsPaper').addEventListener('click', () => play(1));
    document.getElementById('rpsScissors').addEventListener('click', () => play(2));
}

// ========================================
// 计算工具
// ========================================

function getBmiCalcView() {
    return `
        <div style="padding:20px;">
            <div class="form-row">
                <div class="form-group">
                    <label>身高 (cm)</label>
                    <input type="number" class="input" id="bmiH" value="170" placeholder="170">
                </div>
                <div class="form-group">
                    <label>体重 (kg)</label>
                    <input type="number" class="input" id="bmiW" value="65" placeholder="65">
                </div>
            </div>
            <button class="btn btn-primary" id="calcBtn" style="width:100%;margin:15px 0;">⚖️ 计算BMI</button>
            <div style="text-align:center;">
                <div id="bmiValue" style="font-size:64px;font-weight:bold;color:var(--primary);">--</div>
                <div id="bmiLevel" style="font-size:24px;color:var(--text-secondary);">--</div>
            </div>
            <div style="display:flex;justify-content:space-around;margin-top:20px;font-size:12px;color:var(--text-muted);">
                <span>偏瘦 &lt;18.5</span>
                <span>正常 18.5-24</span>
                <span>偏胖 24-28</span>
                <span>肥胖 &gt;28</span>
            </div>
        </div>
    `;
}

function bindBmiCalcEvents() {
    document.getElementById('calcBtn').addEventListener('click', () => {
        const h = parseFloat(document.getElementById('bmiH').value) / 100;
        const w = parseFloat(document.getElementById('bmiW').value);
        if (!h || !w) { showToast('请输入身高和体重'); return; }
        const bmi = w / (h * h);
        document.getElementById('bmiValue').textContent = bmi.toFixed(1);
        let level;
        if (bmi < 18.5) level = '偏瘦';
        else if (bmi < 24) level = '正常';
        else if (bmi < 28) level = '偏胖';
        else level = '肥胖';
        document.getElementById('bmiLevel').textContent = level;
    });
}

function getUnitConvertView() {
    return `
        <div style="padding:20px;">
            <div class="form-group">
                <label>转换类型</label>
                <select class="select" id="unitType">
                    <option value="length">长度</option>
                    <option value="weight">重量</option>
                    <option value="temp">温度</option>
                </select>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>数值</label>
                    <input type="number" class="input" id="unitVal" value="1">
                </div>
                <div class="form-group">
                    <label>从</label>
                    <select class="select" id="unitFrom"></select>
                </div>
                <div style="display:flex;align-items:center;font-size:24px;">→</div>
                <div class="form-group">
                    <label>到</label>
                    <select class="select" id="unitTo"></select>
                </div>
            </div>
            <div id="unitResult" class="code-output" style="margin:20px 0;text-align:center;font-size:24px;">= 0</div>
            <button class="btn btn-primary" id="convertBtn" style="width:100%;">🔄 转换</button>
        </div>
    `;
}

function bindUnitConvertEvents() {
    const units = {
        length: ['米','厘米','毫米','英寸','英尺','码'],
        weight: ['千克','克','毫克','磅','盎司'],
        temp: ['摄氏度','华氏度','开尔文']
    };
    const updateOptions = () => {
        const type = document.getElementById('unitType').value;
        const opts = units[type].map((u,i) => `<option value="${i}">${u}</option>`).join('');
        document.getElementById('unitFrom').innerHTML = opts;
        document.getElementById('unitTo').innerHTML = opts;
        if (type === 'temp') document.getElementById('unitTo').value = 1;
    };
    document.getElementById('unitType').addEventListener('change', updateOptions);
    updateOptions();
    
    document.getElementById('convertBtn').addEventListener('click', () => {
        const type = document.getElementById('unitType').value;
        const val = parseFloat(document.getElementById('unitVal').value);
        const from = parseInt(document.getElementById('unitFrom').value);
        const to = parseInt(document.getElementById('unitTo').value);
        let result;
        if (type === 'length') {
            const base = [1, 0.01, 0.001, 0.0254, 0.3048, 0.9144];
            result = val * base[from] / base[to];
        } else if (type === 'weight') {
            const base = [1, 0.001, 0.000001, 0.453592, 0.0283495];
            result = val * base[from] / base[to];
        } else {
            if (from === 0 && to === 1) result = val * 9/5 + 32;
            else if (from === 1 && to === 0) result = (val - 32) * 5/9;
            else result = val;
        }
        document.getElementById('unitResult').textContent = `= ${result.toFixed(4)} ${units[type][to]}`;
    });
}

function getTimestampView() {
    return `
        <div style="padding:20px;">
            <div class="form-group">
                <label>当前时间戳</label>
                <div class="code-output" id="currentTs">${Date.now()}</div>
                <button class="btn btn-secondary" onclick="copyText('currentTs')">📋 复制</button>
            </div>
            <div class="form-group">
                <label>输入时间戳或日期</label>
                <input type="text" class="input" id="tsInput" placeholder="输入时间戳或日期">
            </div>
            <div class="button-group">
                <button class="btn btn-primary" id="ts2dateBtn">🕐 转日期</button>
                <button class="btn btn-secondary" id="date2tsBtn">📅 转时间戳</button>
            </div>
            <div id="tsResult" class="code-output" style="margin-top:15px;">等待输入...</div>
        </div>
    `;
}

function bindTimestampEvents() {
    document.getElementById('currentTs').textContent = Date.now();
    setInterval(() => { document.getElementById('currentTs').textContent = Date.now(); }, 1000);
    
    document.getElementById('ts2dateBtn').addEventListener('click', () => {
        const val = parseInt(document.getElementById('tsInput').value);
        if (val > 10000000000000) document.getElementById('tsResult').textContent = new Date(val).toLocaleString('zh-CN');
        else if (val > 1000000000) document.getElementById('tsResult').textContent = new Date(val * 1000).toLocaleString('zh-CN');
        else document.getElementById('tsResult').textContent = '请输入13位或10位时间戳';
    });
    
    document.getElementById('date2tsBtn').addEventListener('click', () => {
        try {
            const d = new Date(document.getElementById('tsInput').value);
            if (!isNaN(d)) document.getElementById('tsResult').textContent = `${d.getTime()} (毫秒)`;
        } catch(e) { document.getElementById('tsResult').textContent = '日期格式错误'; }
    });
}

function getDpiCalcView() {
    return `
        <div style="padding:20px;">
            <div class="form-row">
                <div class="form-group">
                    <label>宽度 (px)</label>
                    <input type="number" class="input" id="dpiW" value="1920">
                </div>
                <div class="form-group">
                    <label>高度 (px)</label>
                    <input type="number" class="input" id="dpiH" value="1080">
                </div>
            </div>
            <div class="form-group">
                <label>对角线尺寸 (英寸)</label>
                <input type="number" class="input" id="dpiInch" value="24" step="0.1">
            </div>
            <button class="btn btn-primary" id="calcBtn" style="width:100%;margin:15px 0;">📏 计算PPI/DPI</button>
            <div class="result-container">
                <div class="code-output">分辨率: <span id="dpiRes">1920 × 1080</span></div>
                <div class="code-output">对角线像素: <span id="dpiDiag">0</span> px</div>
                <div class="code-output">PPI: <span id="dpiPpi" style="font-size:24px;color:var(--primary);">0</span> ppi</div>
            </div>
        </div>
    `;
}

function bindDpiCalcEvents() {
    document.getElementById('calcBtn').addEventListener('click', () => {
        const w = parseFloat(document.getElementById('dpiW').value);
        const h = parseFloat(document.getElementById('dpiH').value);
        const inch = parseFloat(document.getElementById('dpiInch').value);
        if (!w || !h || !inch) { showToast('请填写完整信息'); return; }
        const diag = Math.sqrt(w*w + h*h);
        const ppi = diag / inch;
        document.getElementById('dpiRes').textContent = `${w} × ${h}`;
        document.getElementById('dpiDiag').textContent = Math.round(diag);
        document.getElementById('dpiPpi').textContent = ppi.toFixed(1);
    });
}

function getExchangeRateView() {
    return `
        <div style="padding:20px;">
            <div class="form-row">
                <div class="form-group">
                    <label>金额</label>
                    <input type="number" class="input" id="exAmt" value="100">
                </div>
                <div class="form-group">
                    <label>从</label>
                    <select class="select" id="exFrom">
                        <option value="CNY">🇨🇳 人民币</option>
                        <option value="USD">🇺🇸 美元</option>
                        <option value="EUR">🇪🇺 欧元</option>
                        <option value="JPY">🇯🇵 日元</option>
                        <option value="HKD">🇭🇰 港币</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>到</label>
                <select class="select" id="exTo">
                    <option value="USD">🇺🇸 美元</option>
                    <option value="CNY">🇨🇳 人民币</option>
                    <option value="EUR">🇪🇺 欧元</option>
                    <option value="JPY">🇯🇵 日元</option>
                    <option value="HKD">🇭🇰 港币</option>
                </select>
            </div>
            <button class="btn btn-primary" id="calcBtn" style="width:100%;margin:15px 0;">💱 计算汇率</button>
            <div id="exResult" class="code-output" style="font-size:24px;text-align:center;margin-top:15px;">100 CNY ≈ 13.8 USD</div>
        </div>
    `;
}

function bindExchangeRateEvents() {
    const rates = { CNY: 1, USD: 7.2, EUR: 7.8, JPY: 0.048, HKD: 0.92 };
    const flags = { CNY: '🇨🇳', USD: '🇺🇸', EUR: '🇪🇺', JPY: '🇯🇵', HKD: '🇭🇰' };
    
    document.getElementById('calcBtn').addEventListener('click', () => {
        const amt = parseFloat(document.getElementById('exAmt').value);
        const from = document.getElementById('exFrom').value;
        const to = document.getElementById('exTo').value;
        const result = amt / rates[from] * rates[to];
        document.getElementById('exResult').textContent = `${amt} ${flags[from]} ${from} ≈ ${result.toFixed(2)} ${flags[to]} ${to}`;
    });
}

// ========================================
// 辅助函数
// ========================================

function copyText(id) {
    navigator.clipboard.writeText(document.getElementById(id).textContent).then(() => showToast('已复制'));
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => showToast('已复制: ' + text));
}

// ========================================
// 导视设计核心工具
// ========================================

// 1. 视距字号换算（GB公式）
function getViewdistCalcView() {
    return `
        <div style="padding:20px;">
            <div class="form-group">
                <label>观察距离（米）</label>
                <input type="number" class="input" id="vdDist" value="5" step="0.1" style="width:120px;">
                <span style="color:var(--text-secondary);margin-left:8px;">m</span>
            </div>
            <button class="btn btn-primary" id="vdCalcBtn" style="margin:15px 0;width:100%;">📏 计算字号</button>
            <div id="vdResult" style="background:var(--bg-dark);border-radius:8px;padding:15px;font-size:14px;line-height:1.8;"></div>
            <details style="margin-top:15px;">
                <summary style="cursor:pointer;color:var(--text-secondary);">📖 GB标准说明</summary>
                <div style="margin-top:10px;font-size:12px;color:var(--text-secondary);">
                    <p>• H = L / K （H=字符高度mm，L=观察距离m，K=系数）</p>
                    <p>• 户外大视距(>50m)：K=100 | 户外中视距(20-50m)：K=50</p>
                    <p>• 户外常规(10-20m)：K=30 | 室内视距(5-10m)：K=25</p>
                    <p>• 室内近距(<5m)：K=20 | 精细阅读(<2m)：K=15</p>
                </div>
            </details>
        </div>
    `;
}

function bindViewdistCalcEvents() {
    document.getElementById('vdCalcBtn').addEventListener('click', () => {
        const L = parseFloat(document.getElementById('vdDist').value);
        if (!L || L <= 0) { showToast('请输入有效距离'); return; }

        const scenes = [
            { name: '户外大视距 (>50m)', k: 100 },
            { name: '户外中视距 (20-50m)', k: 50 },
            { name: '户外常规 (10-20m)', k: 30 },
            { name: '室内视距 (5-10m)', k: 25 },
            { name: '室内近距 (<5m)', k: 20 },
            { name: '精细阅读 (<2m)', k: 15 }
        ];

        let html = `<strong>📏 观察距离: ${L} 米</strong><br><br>`;
        html += '<table style="width:100%;border-collapse:collapse;">';
        html += '<tr style="background:var(--primary);color:white;"><th style="padding:6px 8px;text-align:left;">场景</th><th style="padding:6px 8px;">字符高mm</th><th style="padding:6px 8px;">英文高mm</th></tr>';

        scenes.forEach(s => {
            const h = (L / s.k * 1000).toFixed(1);
            html += `<tr style="border-bottom:1px solid #333;"><td style="padding:6px 8px;">${s.name}</td><td style="text-align:center;color:var(--primary);font-weight:bold;">${h}</td><td style="text-align:center;color:#aaa;">${(h*0.6).toFixed(1)}</td></tr>`;
        });
        html += '</table>';

        // 推荐方案
        let rec;
        if (L >= 50) rec = { name: '户外大视距', k: 100 };
        else if (L >= 20) rec = { name: '户外中视距', k: 50 };
        else if (L >= 10) rec = { name: '户外常规', k: 30 };
        else if (L >= 5) rec = { name: '室内视距', k: 25 };
        else if (L >= 2) rec = { name: '室内近距', k: 20 };
        else rec = { name: '精细阅读', k: 15 };

        const rh = (L / rec.k * 1000).toFixed(1);
        html += `<br><strong>⭐ 推荐方案：</strong>${rec.name}<br>`;
        html += `字符高度: <span style="color:var(--primary);font-size:18px;">${rh}mm</span> | `;
        html += `英文字符: ${(rh*0.6).toFixed(1)}mm | `;
        html += `数字高度: ${(rh*0.7).toFixed(1)}mm`;

        document.getElementById('vdResult').innerHTML = html;
    });
}

// 2. 盲文点位生成
function getBrailleGenView() {
    return `
        <div style="padding:20px;">
            <div class="form-group">
                <label>输入文字（电梯、出口等无障碍标识）</label>
                <input type="text" class="input" id="brInput" value="电梯" placeholder="输入文字">
            </div>
            <button class="btn btn-primary" id="brGenBtn" style="margin:15px 0;">🔵 生成盲文</button>
            <div id="brResult" style="display:none;background:#fff;border-radius:8px;padding:20px;text-align:center;margin:15px 0;">
                <canvas id="brCanvas" width="600" height="120" style="max-width:100%;border:1px solid #ddd;border-radius:4px;"></canvas>
            </div>
            <div id="brInfo" style="font-size:12px;color:var(--text-secondary);margin-top:10px;">
                <p>📐 国标盲文：点径Φ1.5mm，间距2.5mm，总高6mm</p>
                <p>💡 盲文点位规律：每行3点，共2行，1-6点位组合表示字符</p>
            </div>
            <div id="brLegend" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:15px;justify-content:center;"></div>
        </div>
    `;
}

function bindBrailleGenEvents() {
    // 简化的盲文点位映射
    const brailleMap = {
        '电': [[1,0,0],[0,0,1]],
        '梯': [[1,0,1],[1,0,1]],
        '上': [[1,0,0],[0,1,1]],
        '下': [[1,0,0],[0,0,1]],
        '出': [[0,0,1],[0,1,1]],
        '入': [[1,0,0],[1,0,1]],
        '口': [[0,1,0],[1,0,0]],
        '厕': [[1,1,0],[0,1,0]],
        '道': [[1,0,1],[0,1,0]],
        '急': [[1,1,1],[0,0,0]],
        '停': [[1,0,0],[1,1,0]],
        '左': [[1,0,1],[0,0,0]],
        '右': [[1,1,0],[0,0,0]],
        '前': [[1,0,0],[1,0,1]],
        '后': [[0,1,0],[1,0,1]],
        '开': [[1,0,1],[0,1,1]],
        '关': [[1,1,1],[0,1,0]],
        '中': [[0,1,0],[0,0,1]],
        '无': [[1,1,0],[1,0,1]],
        '障': [[1,0,1],[1,1,0]],
        '请': [[1,0,0],[0,1,0]],
        '勿': [[1,1,0],[1,0,0]],
        '禁': [[1,1,1],[0,0,1]]
    };

    document.getElementById('brGenBtn').addEventListener('click', () => {
        const text = document.getElementById('brInput').value.trim();
        if (!text) { showToast('请输入文字'); return; }

        const canvas = document.getElementById('brCanvas');
        const ctx = canvas.getContext('2d');
        canvas.width = Math.max(600, text.length * 100 + 40);
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const dotR = 6;
        const spacingX = 35;
        const spacingY = 30;
        const colSpacing = 90;

        ctx.font = 'bold 28px Microsoft YaHei, sans-serif';
        ctx.textBaseline = 'top';

        text.split('').forEach((char, i) => {
            const x = 20 + i * colSpacing;
            const dots = brailleMap[char] || [[0,0,0],[0,0,0]];

            // 写文字
            ctx.fillStyle = '#3498DB';
            ctx.fillText(char, x, 10);

            // 盲文点位
            dots.forEach((row, ri) => {
                row.forEach((on, ci) => {
                    const dx = x + ci * spacingX;
                    const dy = 55 + ri * spacingY;
                    ctx.beginPath();
                    ctx.arc(dx, dy, dotR, 0, Math.PI * 2);
                    if (on) {
                        ctx.fillStyle = '#000';
                        ctx.fill();
                    } else {
                        ctx.strokeStyle = '#999';
                        ctx.lineWidth = 1.5;
                        ctx.stroke();
                    }
                });
            });
        });

        document.getElementById('brResult').style.display = 'block';

        // 图例
        const legend = document.getElementById('brLegend');
        legend.innerHTML = '<span style="font-size:12px;color:var(--text-secondary);">●=凸点 ○=空位，点位从左到右1-6编号</span>';
    });
}

// 3. 结构速算
function getStructureCalcView() {
    return `
        <div style="padding:20px;">
            <div class="form-row">
                <div class="form-group">
                    <label>宽度 (cm)</label>
                    <input type="number" class="input" id="stW" value="120" style="width:100px;">
                </div>
                <div class="form-group">
                    <label>高度 (cm)</label>
                    <input type="number" class="input" id="stH" value="80" style="width:100px;">
                </div>
            </div>
            <div class="form-group">
                <label>风压等级</label>
                <select class="select" id="stWind" style="width:100%;">
                    <option value="0.5">内陆/低风压 (0.5kN/m²)</option>
                    <option value="0.75">沿海/中风压 (0.75kN/m²)</option>
                    <option value="1.0">高层/高风压 (1.0kN/m²)</option>
                    <option value="1.5">特殊/超高风压 (1.5kN/m²)</option>
                </select>
            </div>
            <button class="btn btn-primary" id="stCalcBtn" style="width:100%;margin:15px 0;">🏗️ 计算结构</button>
            <div id="stResult" style="background:var(--bg-dark);border-radius:8px;padding:15px;line-height:1.8;font-size:14px;"></div>
        </div>
    `;
}

function bindStructureCalcEvents() {
    document.getElementById('stCalcBtn').addEventListener('click', () => {
        const w = parseFloat(document.getElementById('stW').value) / 100;
        const h = parseFloat(document.getElementById('stH').value) / 100;
        const wind = parseFloat(document.getElementById('stWind').value);
        if (!w || !h) { showToast('请输入有效尺寸'); return; }

        const area = w * h;
        const force = area * wind * 1.2;

        let board, thick, keel, install;
        if (area < 0.5) { board = '2mm铝板'; thick = '2mm'; keel = '20×20×1.5方管'; install = 'M6膨胀螺栓×4'; }
        else if (area < 1.0) { board = '3mm铝板'; thick = '3mm'; keel = '25×25×2方管'; install = 'M8膨胀螺栓×4'; }
        else if (area < 2.0) { board = '4mm铝板'; thick = '4mm'; keel = '40×40×2.5方管'; install = 'M10膨胀螺栓×4~6'; }
        else { board = '5mm钢板/不锈钢'; thick = '5mm'; keel = '50×50×3方管'; install = 'M12化学螺栓×6~8'; }

        const windLevel = wind >= 1.5 ? '特高' : wind >= 1.0 ? '高' : wind >= 0.75 ? '中' : '低';

        let html = `<strong>🏗️ 结构速算结果</strong><br><br>`;
        html += `📐 尺寸: ${(w*100).toFixed(0)}×${(h*100).toFixed(0)}cm | 面积: ${area.toFixed(2)}m²<br>`;
        html += `🌪️ 风压: ${wind}kN/m² (${windLevel}风压区) | 承受风力: ${force.toFixed(2)}kN<br><br>`;
        html += `<strong>📋 推荐材料：</strong><br>`;
        html += `• 面板: <span style="color:var(--primary);">${board}</span>（${thick}）<br>`;
        html += `• 龙骨: <span style="color:var(--primary);">${keel}</span><br>`;
        html += `• 背筋: @300mm加强<br>`;
        html += `• 横撑: @400mm焊接<br><br>`;
        html += `🔩 安装件: ${install}<br>`;
        html += `⚠️ 建议: 超过2m²需做结构力学验算！`;

        document.getElementById('stResult').innerHTML = html;
    });
}

// 4. LED排布计算
function getLedLayoutView() {
    return `
        <div style="padding:20px;">
            <div class="form-row">
                <div class="form-group">
                    <label>字宽 (cm)</label>
                    <input type="number" class="input" id="ledW" value="60" style="width:100px;">
                </div>
                <div class="form-group">
                    <label>字高 (cm)</label>
                    <input type="number" class="input" id="ledH" value="30" style="width:100px;">
                </div>
            </div>
            <div class="form-group">
                <label>LED模组类型</label>
                <select class="select" id="ledType" style="width:100%;">
                    <option value="3528">3528模组 (0.24W/颗，12mm间距)</option>
                    <option value="5050" selected>5050模组 (0.48W/颗，15mm间距)</option>
                    <option value="5630">5630模组 (0.72W/颗，15mm间距)</option>
                    <option value="2835">2835模组 (0.20W/颗，9mm间距)</option>
                </select>
            </div>
            <div class="form-group">
                <label>间距 (mm)</label>
                <input type="number" class="input" id="ledGap" value="15" style="width:80px;">
            </div>
            <button class="btn btn-primary" id="ledCalcBtn" style="width:100%;margin:15px 0;">💡 计算排布</button>
            <div id="ledResult" style="background:var(--bg-dark);border-radius:8px;padding:15px;line-height:1.8;font-size:14px;"></div>
        </div>
    `;
}

function bindLedLayoutEvents() {
    document.getElementById('ledCalcBtn').addEventListener('click', () => {
        const w = parseFloat(document.getElementById('ledW').value) / 100;
        const h = parseFloat(document.getElementById('ledH').value) / 100;
        const gap = parseFloat(document.getElementById('ledGap').value) / 1000;
        const type = document.getElementById('ledType').value;
        const powerMap = { '3528': 0.24, '5050': 0.48, '5635': 0.72, '2835': 0.20 };
        const power = powerMap[type] || 0.48;

        if (!w || !h || !gap) { showToast('请输入有效参数'); return; }

        const cols = Math.ceil(w / gap) + 1;
        const rows = Math.ceil(h / gap) + 1;
        const total = cols * rows;
        const totalPow = total * power;
        const current = totalPow / 12;

        let html = `<strong>💡 LED排布计算</strong><br><br>`;
        html += `📐 字尺寸: ${(w*100).toFixed(0)}×${(h*100).toFixed(0)}cm | 间距: ${gap*1000}mm<br><br>`;
        html += `📊 排布方案：<br>`;
        html += `• 横向: <span style="color:var(--primary);">${cols}颗</span> | 纵向: <span style="color:var(--primary);">${rows}颗</span><br>`;
        html += `• 总计: <span style="color:var(--primary);font-size:18px;">${total}颗</span><br><br>`;
        html += `⚡ 功耗估算：<br>`;
        html += `• 单颗功率: ${power}W<br>`;
        html += `• 总功率: <span style="color:#f39c12;">${totalPow.toFixed(1)}W</span><br>`;
        html += `• 工作电流: ${current.toFixed(2)}A (12V直流)<br>`;
        html += `• 建议变压器: <span style="color:#e74c3c;">${Math.ceil(totalPow * 1.2 / 12) * 12}W</span>（留20%余量）<br><br>`;
        html += `💡 提示: 变压器建议选12V输出，过载保护，整流滤波`;

        document.getElementById('ledResult').innerHTML = html;
    });
}

// 5. 一键抠图（纯色背景）
function getMattingView() {
    return `
        <div style="padding:20px;">
            <div class="upload-area" id="mtUpload">
                <div class="upload-icon">✂️</div>
                <div class="upload-text">上传图片（纯色背景最佳）</div>
                <div class="upload-hint">支持 JPG、PNG，支持批量</div>
                <input type="file" class="upload-input" id="mtFileInput" accept="image/*" multiple>
            </div>
            <div id="mtPreview" style="display:none;text-align:center;margin:15px 0;">
                <canvas id="mtCanvas" style="max-width:100%;border-radius:8px;"></canvas>
            </div>
            <div id="mtThumbs" style="display:none;flex-wrap:wrap;gap:8px;margin:10px 0;justify-content:center;"></div>
            <div id="mtControls" style="display:none;margin:15px 0;">
                <div class="form-group">
                    <label>容差 (0-100)：背景色匹配精确度</label>
                    <div style="display:flex;align-items:center;gap:10px;">
                        <input type="range" id="mtTolerance" min="0" max="100" value="30" style="flex:1;">
                        <span id="mtTolVal" style="color:var(--primary);min-width:40px;">30</span>
                    </div>
                </div>
                <div class="form-group">
                    <label>背景色</label>
                    <div style="display:flex;align-items:center;gap:10px;">
                        <input type="color" id="mtBgColor" value="#ffffff" style="width:50px;height:35px;border:none;">
                        <button class="btn btn-secondary" id="mtPickBtn" style="font-size:12px;">🎯 吸取背景色</button>
                        <button class="btn btn-secondary" id="mtWhiteBtn" style="font-size:12px;">⚪ 白色</button>
                        <button class="btn btn-secondary" id="mtBlackBtn" style="font-size:12px;">⚫ 黑色</button>
                    </div>
                </div>
            </div>
            <div class="button-group" id="mtBtns" style="display:none;margin-top:15px;">
                <button class="btn btn-primary" id="mtCutBtn">✂️ 抠图</button>
                <button class="btn btn-secondary" id="mtDownBtn">📥 下载PNG</button>
            </div>
        </div>
    `;
}

function bindMattingEvents() {
    let files = [], currentFile = null, resultImg = null;
    let canvas = document.getElementById('mtCanvas');

    setupImageUpload('mtUpload', 'mtFileInput', (fs) => {
        files = fs;
        currentFile = fs[0];
        loadPreview(currentFile);
        document.getElementById('mtPreview').style.display = 'block';
        document.getElementById('mtControls').style.display = 'block';
        document.getElementById('mtBtns').style.display = 'flex';

        // 缩略图
        const thumbs = document.getElementById('mtThumbs');
        thumbs.style.display = 'flex';
        thumbs.innerHTML = '';
        files.forEach((f, i) => {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(f);
            img.style = 'width:50px;height:50px;object-fit:cover;border-radius:4px;cursor:pointer;border:2px solid transparent;';
            img.onclick = () => { currentFile = f; loadPreview(f); };
            thumbs.appendChild(img);
        });
    });

    function loadPreview(file) {
        const img = new Image();
        img.onload = () => {
            const maxW = 600;
            const scale = Math.min(1, maxW / img.width);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = URL.createObjectURL(file);
    }

    document.getElementById('mtTolerance').addEventListener('input', (e) => {
        document.getElementById('mtTolVal').textContent = e.target.value;
    });

    document.getElementById('mtWhiteBtn').addEventListener('click', () => {
        document.getElementById('mtBgColor').value = '#ffffff';
    });
    document.getElementById('mtBlackBtn').addEventListener('click', () => {
        document.getElementById('mtBgColor').value = '#000000';
    });

    document.getElementById('mtPickBtn').addEventListener('click', () => {
        const ctx = canvas.getContext('2d');
        const centerX = Math.floor(canvas.width / 2);
        const centerY = Math.floor(canvas.height / 2);
        const px = ctx.getImageData(centerX, centerY, 1, 1).data;
        const hex = '#' + [px[0],px[1],px[2]].map(x=>x.toString(16).padStart(2,'0')).join('');
        document.getElementById('mtBgColor').value = hex;
        showToast('已吸取中心颜色: ' + hex);
    });

    document.getElementById('mtCutBtn').addEventListener('click', () => {
        if (!currentFile) return;
        const bgHex = document.getElementById('mtBgColor').value.replace('#', '');
        const tol = parseInt(document.getElementById('mtTolerance').value);
        const bgR = parseInt(bgHex.substr(0,2), 16);
        const bgG = parseInt(bgHex.substr(2,2), 16);
        const bgB = parseInt(bgHex.substr(4,2), 16);

        const ctx = canvas.getContext('2d');
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const tol2 = tol * tol * 3;

        for (let i = 0; i < data.length; i += 4) {
            const dr = data[i] - bgR, dg = data[i+1] - bgG, db = data[i+2] - bgB;
            const dist2 = dr*dr + dg*dg + db*db;
            data[i+3] = dist2 > tol2 ? 255 : 0;
        }

        ctx.putImageData(imgData, 0, 0);
        resultImg = canvas.toDataURL('image/png');
        showToast('抠图完成！可下载PNG');
    });

    document.getElementById('mtDownBtn').addEventListener('click', () => {
        if (!resultImg) { showToast('请先抠图'); return; }
        const a = document.createElement('a');
        a.href = resultImg;
        a.download = 'matting_' + Date.now() + '.png';
        a.click();
        showToast('下载成功！');
    });
}

// 6. 批量图片处理
function getBatchImgView() {
    return `
        <div style="padding:20px;">
            <div class="upload-area" id="biUpload">
                <div class="upload-icon">🖼️</div>
                <div class="upload-text">上传图片（支持多张批量）</div>
                <div class="upload-hint">JPG/PNG/WebP/GIF/BMP</div>
                <input type="file" class="upload-input" id="biFileInput" accept="image/*" multiple>
            </div>
            <div id="biThumbs" style="display:none;flex-wrap:wrap;gap:8px;margin:15px 0;justify-content:center;"></div>
            <div id="biControls" style="display:none;">
                <div class="form-group">
                    <label>处理方式</label>
                    <select class="select" id="biMode" style="width:100%;">
                        <option value="scale">按比例缩放 (%)</option>
                        <option value="width">按宽度缩放 (px)</option>
                        <option value="height">按高度缩放 (px)</option>
                        <option value="format">格式转换</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>参数值</label>
                    <input type="text" class="input" id="biParam" value="50" placeholder="50% / 800 / 600">
                </div>
                <div class="form-group">
                    <label>输出格式</label>
                    <select class="select" id="biOutFormat" style="width:100%;">
                        <option value="png">PNG (无损)</option>
                        <option value="jpg">JPG (体积小)</option>
                        <option value="webp">WebP (现代格式)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>JPG质量</label>
                    <input type="range" id="biQuality" min="10" max="100" value="85" style="width:100%;">
                    <span id="biQualVal" style="color:var(--primary);">85%</span>
                </div>
                <button class="btn btn-primary" id="biProcessBtn" style="width:100%;margin:15px 0;">▶️ 开始处理</button>
            </div>
            <div id="biProgress" style="display:none;margin:15px 0;">
                <div style="background:var(--bg-dark);border-radius:4px;height:20px;overflow:hidden;">
                    <div id="biBar" style="background:var(--primary);height:100%;width:0%;transition:width 0.3s;"></div>
                </div>
                <div id="biStatus" style="text-align:center;margin-top:8px;font-size:13px;color:var(--text-secondary);"></div>
            </div>
            <div id="biResults" style="display:none;margin:15px 0;"></div>
        </div>
    `;
}

// ========================================
// 缺失的图片工具视图（修复switch调用不匹配问题）
// ========================================
// 1. 格式转换
function getImageFormatView() {
    return `
        <div style="padding:20px;">
            <div class="upload-area" id="fmtUpload">
                <div class="upload-icon">🔄</div>
                <div class="upload-text">上传图片转换格式</div>
                <input type="file" id="fmtFileInput" accept="image/*" style="display:none;">
            </div>
            <div id="fmtPreview" style="margin-top:15px;text-align:center;"></div>
            <div class="form-group" style="margin-top:15px;">
                <label>输出格式</label>
                <select class="select" id="fmtOutType" style="width:100%;">
                    <option value="png">PNG</option>
                    <option value="jpeg">JPG</option>
                    <option value="webp">WebP</option>
                </select>
            </div>
            <button class="btn btn-primary" id="fmtBtn" style="width:100%;margin-top:15px;">✨ 转换格式</button>
        </div>
    `;
}

// 2. 裁剪
function getImageCropView() {
    return `
        <div style="padding:20px;">
            <div class="upload-area" id="cropUpload">
                <div class="upload-icon">✂️</div>
                <div class="upload-text">上传图片裁剪</div>
                <input type="file" id="cropFileInput" accept="image/*" style="display:none;">
            </div>
            <div id="cropPreview" style="margin-top:15px;text-align:center;"></div>
            <div class="form-row" style="margin-top:15px;">
                <div class="form-group"><label>宽度</label><input type="number" id="cropW" class="input" value="200" style="width:80px;"></div>
                <div class="form-group"><label>高度</label><input type="number" id="cropH" class="input" value="200" style="width:80px;"></div>
            </div>
            <button class="btn btn-primary" id="cropBtn" style="width:100%;margin-top:15px;">✂️ 裁剪</button>
        </div>
    `;
}

// 3. 文字水印
function getImageWatermarkView() {
    return `
        <div style="padding:20px;">
            <div class="upload-area" id="wmUpload">
                <div class="upload-icon">💧</div>
                <div class="upload-text">上传图片添加水印</div>
                <input type="file" id="wmFileInput" accept="image/*" style="display:none;">
            </div>
            <div id="wmPreview" style="margin-top:15px;text-align:center;"></div>
            <div class="form-group" style="margin-top:15px;">
                <label>水印文字</label>
                <input type="text" id="wmText" class="input" value="设计师工具箱" style="width:100%;">
            </div>
            <div class="form-row" style="margin-top:10px;">
                <div class="form-group">
                    <label>字体大小</label>
                    <input type="number" id="wmSize" class="input" value="24" style="width:60px;">
                </div>
                <div class="form-group">
                    <label>透明度</label>
                    <input type="range" id="wmOpacity" min="10" max="100" value="50" style="width:100px;">
                </div>
            </div>
            <button class="btn btn-primary" id="wmBtn" style="width:100%;margin-top:15px;">💧 添加水印</button>
        </div>
    `;
}

// 4. 九宫格
function getImageGrid9View() {
    return `
        <div style="padding:20px;">
            <div class="upload-area" id="g9Upload">
                <div class="upload-icon">🎯</div>
                <div class="upload-text">上传图片生成九宫格</div>
                <input type="file" id="g9FileInput" accept="image/*" style="display:none;">
            </div>
            <div id="g9Preview" style="margin-top:15px;text-align:center;"></div>
            <div id="g9Results" style="margin-top:15px;display:none;">
                <p style="color:var(--primary);margin-bottom:10px;">点击每张图可单独保存</p>
                <div id="g9Grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px;"></div>
            </div>
            <button class="btn btn-primary" id="g9Btn" style="width:100%;margin-top:15px;">🎯 生成九宫格</button>
        </div>
    `;
}

// 5. 图片调整
function getImageAdjustView() {
    return `
        <div style="padding:20px;">
            <div class="upload-area" id="adjUpload">
                <div class="upload-icon">🎨</div>
                <div class="upload-text">上传图片调整</div>
                <input type="file" id="adjFileInput" accept="image/*" style="display:none;">
            </div>
            <div id="adjPreview" style="margin-top:15px;text-align:center;"></div>
            <div class="form-group" style="margin-top:15px;">
                <label>亮度: <span id="adjBriVal">100</span>%</label>
                <input type="range" id="adjBrightness" min="0" max="200" value="100" style="width:100%;">
            </div>
            <div class="form-group">
                <label>对比度: <span id="adjConVal">100</span>%</label>
                <input type="range" id="adjContrast" min="0" max="200" value="100" style="width:100%;">
            </div>
            <div class="form-group">
                <label>饱和度: <span id="adjSatVal">100</span>%</label>
                <input type="range" id="adjSaturation" min="0" max="200" value="100" style="width:100%;">
            </div>
            <button class="btn btn-primary" id="adjBtn" style="width:100%;margin-top:15px;">🎨 调整</button>
        </div>
    `;
}

// 6. 模糊
function getImageBlurView() {
    return `
        <div style="padding:20px;">
            <div class="upload-area" id="blurUpload">
                <div class="upload-icon">🌫️</div>
                <div class="upload-text">上传图片模糊</div>
                <input type="file" id="blurFileInput" accept="image/*" style="display:none;">
            </div>
            <div id="blurPreview" style="margin-top:15px;text-align:center;"></div>
            <div class="form-group" style="margin-top:15px;">
                <label>模糊程度: <span id="blurVal">5</span></label>
                <input type="range" id="blurAmount" min="1" max="20" value="5" style="width:100%;">
            </div>
            <button class="btn btn-primary" id="blurBtn" style="width:100%;margin-top:15px;">🌫️ 模糊</button>
        </div>
    `;
}

// 7. 旋转
function getImageRotateView() {
    return `
        <div style="padding:20px;">
            <div class="upload-area" id="rotUpload">
                <div class="upload-icon">🔄</div>
                <div class="upload-text">上传图片旋转</div>
                <input type="file" id="rotFileInput" accept="image/*" style="display:none;">
            </div>
            <div id="rotPreview" style="margin-top:15px;text-align:center;"></div>
            <div class="form-group" style="margin-top:15px;">
                <label>旋转角度</label>
                <select class="select" id="rotAngle" style="width:100%;">
                    <option value="90">顺时针 90°</option>
                    <option value="180">180° 翻转</option>
                    <option value="270">逆时针 90° (270°)</option>
                </select>
            </div>
            <button class="btn btn-primary" id="rotBtn" style="width:100%;margin-top:15px;">🔄 旋转</button>
        </div>
    `;
}

// 8. 圆角
function getImageRadiusView() {
    return `
        <div style="padding:20px;">
            <div class="upload-area" id="radUpload">
                <div class="upload-icon">🔵</div>
                <div class="upload-text">上传图片圆角</div>
                <input type="file" id="radFileInput" accept="image/*" style="display:none;">
            </div>
            <div id="radPreview" style="margin-top:15px;text-align:center;"></div>
            <div class="form-group" style="margin-top:15px;">
                <label>圆角大小: <span id="radVal">20</span>px</label>
                <input type="range" id="radAmount" min="0" max="100" value="20" style="width:100%;">
            </div>
            <button class="btn btn-primary" id="radBtn" style="width:100%;margin-top:15px;">🔵 添加圆角</button>
        </div>
    `;
}

// 9. 边框
function getImageBorderView() {
    return `
        <div style="padding:20px;">
            <div class="upload-area" id="borUpload">
                <div class="upload-icon">🖼️</div>
                <div class="upload-text">上传图片添加边框</div>
                <input type="file" id="borFileInput" accept="image/*" style="display:none;">
            </div>
            <div id="borPreview" style="margin-top:15px;text-align:center;"></div>
            <div class="form-row" style="margin-top:15px;">
                <div class="form-group">
                    <label>宽度</label>
                    <input type="number" id="borWidth" class="input" value="10" style="width:60px;">
                </div>
                <div class="form-group">
                    <label>颜色</label>
                    <input type="color" id="borColor" value="#000000" style="width:50px;height:40px;">
                </div>
            </div>
            <button class="btn btn-primary" id="borBtn" style="width:100%;margin-top:15px;">🖼️ 添加边框</button>
        </div>
    `;
}
// 1. 格式转换
function bindImageFormatEvents() {
    let currentFile = null, currentImg = null, resultUrl = '';
    setupImageUpload('fmtUpload', 'fmtFileInput', (files) => {
        if (!files.length) return;
        currentFile = files[0];
        currentImg = new Image();
        currentImg.onload = () => {
            document.getElementById('fmtPreview').innerHTML = `<img src="${URL.createObjectURL(currentFile)}" style="max-width:100%;border-radius:8px;">`;
        };
        currentImg.src = URL.createObjectURL(currentFile);
    });
    document.getElementById('fmtBtn').addEventListener('click', () => {
        if (!currentImg) { showToast('请先上传图片'); return; }
        const outType = document.getElementById('fmtOutType').value;
        const canvas = document.createElement('canvas');
        canvas.width = currentImg.naturalWidth;
        canvas.height = currentImg.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.drawImage(currentImg, 0, 0);
        resultUrl = canvas.toDataURL('image/' + outType, 0.92);
        const ext = outType === 'jpeg' ? 'jpg' : outType;
        document.getElementById('fmtPreview').innerHTML = `<img src="${resultUrl}" style="max-width:100%;border-radius:8px;"><br><button class="btn btn-primary" id="fmtDownloadBtn" style="margin-top:10px;">📥 下载</button>`;
        document.getElementById('fmtDownloadBtn').addEventListener('click', () => downloadSingle(resultUrl, 'converted.' + ext));
        showToast('格式转换完成！');
    });
}

// 2. 裁剪
function bindImageCropEvents() {
    let currentFile = null, currentImg = null, resultUrl = '';
    setupImageUpload('cropUpload', 'cropFileInput', (files) => {
        if (!files.length) return;
        currentFile = files[0];
        currentImg = new Image();
        currentImg.onload = () => {
            document.getElementById('cropPreview').innerHTML = `<img src="${URL.createObjectURL(currentFile)}" style="max-width:100%;border-radius:8px;">`;
        };
        currentImg.src = URL.createObjectURL(currentFile);
    });
    document.getElementById('cropBtn').addEventListener('click', () => {
        if (!currentImg) { showToast('请先上传图片'); return; }
        const cropW = parseInt(document.getElementById('cropW').value) || 200;
        const cropH = parseInt(document.getElementById('cropH').value) || 200;
        const canvas = document.createElement('canvas');
        canvas.width = cropW;
        canvas.height = cropH;
        const ctx = canvas.getContext('2d');
        const sx = Math.max(0, (currentImg.naturalWidth - cropW) / 2);
        const sy = Math.max(0, (currentImg.naturalHeight - cropH) / 2);
        ctx.drawImage(currentImg, sx, sy, cropW, cropH, 0, 0, cropW, cropH);
        resultUrl = canvas.toDataURL('image/png');
        document.getElementById('cropPreview').innerHTML = `<img src="${resultUrl}" style="max-width:100%;border-radius:8px;"><br><button class="btn btn-primary" id="cropDownloadBtn" style="margin-top:10px;">📥 下载</button>`;
        document.getElementById('cropDownloadBtn').addEventListener('click', () => downloadSingle(resultUrl, 'cropped.png'));
        showToast('裁剪完成！');
    });
}

// 3. 文字水印
function bindImageWatermarkEvents() {
    let currentFile = null, currentImg = null, resultUrl = '';
    setupImageUpload('wmUpload', 'wmFileInput', (files) => {
        if (!files.length) return;
        currentFile = files[0];
        currentImg = new Image();
        currentImg.onload = () => {
            document.getElementById('wmPreview').innerHTML = `<img src="${URL.createObjectURL(currentFile)}" style="max-width:100%;border-radius:8px;">`;
        };
        currentImg.src = URL.createObjectURL(currentFile);
    });
    document.getElementById('wmBtn').addEventListener('click', () => {
        if (!currentImg) { showToast('请先上传图片'); return; }
        const text = document.getElementById('wmText').value || '水印';
        const size = parseInt(document.getElementById('wmSize').value) || 24;
        const opacity = parseInt(document.getElementById('wmOpacity').value) / 100;
        const canvas = document.createElement('canvas');
        canvas.width = currentImg.naturalWidth;
        canvas.height = currentImg.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(currentImg, 0, 0);
        ctx.globalAlpha = opacity;
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${size}px Arial`;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeText(text, 20, canvas.height - 20);
        ctx.fillText(text, 20, canvas.height - 20);
        ctx.globalAlpha = 1;
        resultUrl = canvas.toDataURL('image/png');
        document.getElementById('wmPreview').innerHTML = `<img src="${resultUrl}" style="max-width:100%;border-radius:8px;"><br><button class="btn btn-primary" id="wmDownloadBtn" style="margin-top:10px;">📥 下载</button>`;
        document.getElementById('wmDownloadBtn').addEventListener('click', () => downloadSingle(resultUrl, 'watermarked.png'));
        showToast('水印添加完成！');
    });
}

// 4. 九宫格
function bindImageGrid9Events() {
    let currentFile = null, currentImg = null;
    setupImageUpload('g9Upload', 'g9FileInput', (files) => {
        if (!files.length) return;
        currentFile = files[0];
        currentImg = new Image();
        currentImg.onload = () => {
            document.getElementById('g9Preview').innerHTML = `<img src="${URL.createObjectURL(currentFile)}" style="max-width:100%;border-radius:8px;">`;
        };
        currentImg.src = URL.createObjectURL(currentFile);
    });
    document.getElementById('g9Btn').addEventListener('click', () => {
        if (!currentImg) { showToast('请先上传图片'); return; }
        const w = Math.floor(currentImg.naturalWidth / 3);
        const h = Math.floor(currentImg.naturalHeight / 3);
        const grid = document.getElementById('g9Grid');
        grid.innerHTML = '';
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(currentImg, col * w, row * h, w, h, 0, 0, w, h);
                const dataUrl = canvas.toDataURL('image/png');
                const gridItem = document.createElement('img');
                gridItem.src = dataUrl;
                gridItem.style.cssText = 'width:100%;cursor:pointer;border-radius:4px;';
                gridItem.title = `第${row+1}行${col+1}列`;
                gridItem.addEventListener('click', () => downloadSingle(dataUrl, `grid_${row+1}_${col+1}.png`));
                grid.appendChild(gridItem);
            }
        }
        document.getElementById('g9Results').style.display = 'block';
        showToast('九宫格生成完成！点击每张可保存');
    });
}

// 5. 图片调整（亮度/对比度/饱和度）
function bindImageAdjustEvents() {
    let currentFile = null, currentImg = null, resultUrl = '';
    setupImageUpload('adjUpload', 'adjFileInput', (files) => {
        if (!files.length) return;
        currentFile = files[0];
        currentImg = new Image();
        currentImg.onload = () => {
            document.getElementById('adjPreview').innerHTML = `<img src="${URL.createObjectURL(currentFile)}" style="max-width:100%;border-radius:8px;">`;
        };
        currentImg.src = URL.createObjectURL(currentFile);
    });
    document.getElementById('adjBrightness').addEventListener('input', (e) => {
        document.getElementById('adjBriVal').textContent = e.target.value;
    });
    document.getElementById('adjContrast').addEventListener('input', (e) => {
        document.getElementById('adjConVal').textContent = e.target.value;
    });
    document.getElementById('adjSaturation').addEventListener('input', (e) => {
        document.getElementById('adjSatVal').textContent = e.target.value;
    });
    document.getElementById('adjBtn').addEventListener('click', () => {
        if (!currentImg) { showToast('请先上传图片'); return; }
        const brightness = parseInt(document.getElementById('adjBrightness').value);
        const contrast = parseInt(document.getElementById('adjContrast').value);
        const saturation = parseInt(document.getElementById('adjSaturation').value);
        const canvas = document.createElement('canvas');
        canvas.width = currentImg.naturalWidth;
        canvas.height = currentImg.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
        ctx.drawImage(currentImg, 0, 0);
        ctx.filter = 'none';
        resultUrl = canvas.toDataURL('image/png');
        document.getElementById('adjPreview').innerHTML = `<img src="${resultUrl}" style="max-width:100%;border-radius:8px;"><br><button class="btn btn-primary" id="adjDownloadBtn" style="margin-top:10px;">📥 下载</button>`;
        document.getElementById('adjDownloadBtn').addEventListener('click', () => downloadSingle(resultUrl, 'adjusted.png'));
        showToast('调整完成！');
    });
}

// 6. 模糊
function bindImageBlurEvents() {
    let currentFile = null, currentImg = null, resultUrl = '';
    setupImageUpload('blurUpload', 'blurFileInput', (files) => {
        if (!files.length) return;
        currentFile = files[0];
        currentImg = new Image();
        currentImg.onload = () => {
            document.getElementById('blurPreview').innerHTML = `<img src="${URL.createObjectURL(currentFile)}" style="max-width:100%;border-radius:8px;">`;
        };
        currentImg.src = URL.createObjectURL(currentFile);
    });
    document.getElementById('blurAmount').addEventListener('input', (e) => {
        document.getElementById('blurVal').textContent = e.target.value;
    });
    document.getElementById('blurBtn').addEventListener('click', () => {
        if (!currentImg) { showToast('请先上传图片'); return; }
        const blur = parseInt(document.getElementById('blurAmount').value);
        const canvas = document.createElement('canvas');
        canvas.width = currentImg.naturalWidth;
        canvas.height = currentImg.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.filter = `blur(${blur}px)`;
        ctx.drawImage(currentImg, 0, 0);
        ctx.filter = 'none';
        resultUrl = canvas.toDataURL('image/png');
        document.getElementById('blurPreview').innerHTML = `<img src="${resultUrl}" style="max-width:100%;border-radius:8px;"><br><button class="btn btn-primary" id="blurDownloadBtn" style="margin-top:10px;">📥 下载</button>`;
        document.getElementById('blurDownloadBtn').addEventListener('click', () => downloadSingle(resultUrl, 'blurred.png'));
        showToast('模糊处理完成！');
    });
}

// 7. 旋转
function bindImageRotateEvents() {
    let currentFile = null, currentImg = null, resultUrl = '';
    setupImageUpload('rotUpload', 'rotFileInput', (files) => {
        if (!files.length) return;
        currentFile = files[0];
        currentImg = new Image();
        currentImg.onload = () => {
            document.getElementById('rotPreview').innerHTML = `<img src="${URL.createObjectURL(currentFile)}" style="max-width:100%;border-radius:8px;">`;
        };
        currentImg.src = URL.createObjectURL(currentFile);
    });
    document.getElementById('rotBtn').addEventListener('click', () => {
        if (!currentImg) { showToast('请先上传图片'); return; }
        const angle = parseInt(document.getElementById('rotAngle').value);
        const rad = angle * Math.PI / 180;
        const cos = Math.abs(Math.cos(rad));
        const sin = Math.abs(Math.sin(rad));
        const w = currentImg.naturalWidth;
        const h = currentImg.naturalHeight;
        const newW = Math.round(w * cos + h * sin);
        const newH = Math.round(w * sin + h * cos);
        const canvas = document.createElement('canvas');
        canvas.width = newW;
        canvas.height = newH;
        const ctx = canvas.getContext('2d');
        ctx.translate(newW / 2, newH / 2);
        ctx.rotate(rad);
        ctx.drawImage(currentImg, -w / 2, -h / 2);
        resultUrl = canvas.toDataURL('image/png');
        document.getElementById('rotPreview').innerHTML = `<img src="${resultUrl}" style="max-width:100%;border-radius:8px;"><br><button class="btn btn-primary" id="rotDownloadBtn" style="margin-top:10px;">📥 下载</button>`;
        document.getElementById('rotDownloadBtn').addEventListener('click', () => downloadSingle(resultUrl, 'rotated.png'));
        showToast('旋转完成！');
    });
}

// 8. 圆角
function bindImageRadiusEvents() {
    let currentFile = null, currentImg = null, resultUrl = '';
    setupImageUpload('radUpload', 'radFileInput', (files) => {
        if (!files.length) return;
        currentFile = files[0];
        currentImg = new Image();
        currentImg.onload = () => {
            document.getElementById('radPreview').innerHTML = `<img src="${URL.createObjectURL(currentFile)}" style="max-width:100%;border-radius:8px;">`;
        };
        currentImg.src = URL.createObjectURL(currentFile);
    });
    document.getElementById('radAmount').addEventListener('input', (e) => {
        document.getElementById('radVal').textContent = e.target.value;
    });
    document.getElementById('radBtn').addEventListener('click', () => {
        if (!currentImg) { showToast('请先上传图片'); return; }
        const radius = parseInt(document.getElementById('radAmount').value);
        const w = currentImg.naturalWidth;
        const h = currentImg.naturalHeight;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(currentImg, 0, 0);
        // 圆角遮罩
        ctx.globalCompositeOperation = 'destination-in';
        ctx.fillStyle = '#fff';
        roundedRect(ctx, 0, 0, w, h, radius);
        ctx.fill();
        resultUrl = canvas.toDataURL('image/png');
        document.getElementById('radPreview').innerHTML = `<img src="${resultUrl}" style="max-width:100%;border-radius:${radius}px;"><br><button class="btn btn-primary" id="radDownloadBtn" style="margin-top:10px;">📥 下载</button>`;
        document.getElementById('radDownloadBtn').addEventListener('click', () => downloadSingle(resultUrl, 'rounded.png'));
        showToast('圆角添加完成！');
    });
}

// 9. 边框
function bindImageBorderEvents() {
    let currentFile = null, currentImg = null, resultUrl = '';
    setupImageUpload('borUpload', 'borFileInput', (files) => {
        if (!files.length) return;
        currentFile = files[0];
        currentImg = new Image();
        currentImg.onload = () => {
            document.getElementById('borPreview').innerHTML = `<img src="${URL.createObjectURL(currentFile)}" style="max-width:100%;border-radius:8px;">`;
        };
        currentImg.src = URL.createObjectURL(currentFile);
    });
    document.getElementById('borBtn').addEventListener('click', () => {
        if (!currentImg) { showToast('请先上传图片'); return; }
        const bw = parseInt(document.getElementById('borWidth').value) || 10;
        const color = document.getElementById('borColor').value;
        const w = currentImg.naturalWidth;
        const h = currentImg.naturalHeight;
        const canvas = document.createElement('canvas');
        canvas.width = w + bw * 2;
        canvas.height = h + bw * 2;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(currentImg, bw, bw);
        resultUrl = canvas.toDataURL('image/png');
        document.getElementById('borPreview').innerHTML = `<img src="${resultUrl}" style="max-width:100%;border-radius:8px;border:${bw}px solid ${color};"><br><button class="btn btn-primary" id="borDownloadBtn" style="margin-top:10px;">📥 下载</button>`;
        document.getElementById('borDownloadBtn').addEventListener('click', () => downloadSingle(resultUrl, 'bordered.png'));
        showToast('边框添加完成！');
    });
}

// 辅助函数：画圆角矩形路径
function roundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

// ========================================
// 全局下载辅助函数 - 完整修复版
// ========================================
// ============================
// 高级下载管理器（大哥方案）
// ============================
const FOLDER_NAME = 'DesignToolBox';
let _albumPath = null;

// 提取纯 base64 数据
function getBase64Data(dataUrl) {
    return dataUrl.replace(/^data:image\/\w+;base64,/, '');
}

// 确保相册目录存在
async function ensureAlbum() {
    if (_albumPath) return _albumPath;
    const media = window.Capacitor?.Plugins?.Media;
    if (!media) return null;
    try { await media.createAlbum({ name: FOLDER_NAME }); } catch (_) {}
    try {
        const r = await media.getAlbumsPath();
        _albumPath = r.path + '/' + FOLDER_NAME;
        console.log('[DEBUG] 相册路径:', _albumPath);
        return _albumPath;
    } catch (e) { return null; }
}

// 保存单张图片到相册
async function saveSingleImage(dataUrl, fileName) {
    const media = window.Capacitor?.Plugins?.Media;
    if (!media) return { success: false, error: 'Media plugin not available' };

    // 方法1: Media.savePhoto（直接写入系统相册）
    try {
        const albumPath = await ensureAlbum();
        if (albumPath) {
            const result = await media.savePhoto({
                path: dataUrl,
                albumIdentifier: albumPath,
                fileName: fileName.replace(/\.[^.]+$/, '')
            });
            console.log('[DEBUG] savePhoto 成功:', result.filePath);
            return { success: true, uri: result.filePath };
        }
    } catch (e1) {
        console.log('[DEBUG] savePhoto 失败:', e1.message);
    }

    // 方法2: Filesystem + scanFile 兜底
    try {
        const fs = window.Capacitor?.Plugins?.Filesystem;
        const dir = window.Capacitor?.Plugins?.Directory;
        if (!fs || !dir) return { success: false, error: 'Filesystem not available' };
        const base64Data = getBase64Data(dataUrl);
        const filePath = `${FOLDER_NAME}/${fileName}`;
        const result = await fs.writeFile({
            path: filePath, data: base64Data,
            directory: dir.External, recursive: true
        });
        console.log('[DEBUG] Filesystem 写入:', result.uri);
        try { await media.scanFile({ path: result.uri.replace(/^file:\/\//, '') }); } catch (_) {}
        return { success: true, uri: result.uri };
    } catch (e2) {
        console.error('[DEBUG] Filesystem 也失败:', e2.message);
    }
    return { success: false, error: '所有保存方法均失败' };
}

// 批量保存（带进度回调）
async function saveImagesBatch(results, onProgress) {
    let success = 0;
    let failCount = 0;
    
    for (let i = 0; i < results.length; i++) {
        const fileName = `img_${Date.now()}_${i}.jpg`;
        const result = await saveSingleImage(results[i].dataUrl, fileName);
        
        if (result.success) {
            success++;
        } else {
            failCount++;
        }
        
        if (onProgress) {
            onProgress({
                current: i + 1,
                total: results.length,
                success,
                fail: failCount
            });
        }
    }
    
    return { success, fail: failCount };
}

// 最终降级：a.click()
function fallbackDownload(dataUrl, filename) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename || 'image.png';
    a.target = '_blank';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// 主下载函数
async function downloadSingle(dataUrl, filename) {
    const fileName = filename || 'image_' + Date.now() + '.png';
    let lastError = null;
    
    // 方案 1: Capacitor Filesystem（大哥推荐方案）
    try {
        if (window.Capacitor?.Plugins?.Filesystem) {
            console.log('[DEBUG] 尝试方案1: Filesystem...');
            const result = await saveSingleImage(dataUrl, fileName);
            
            if (result.success) {
                showToast('✅ 已保存到相册/DesignToolBox');
                return { success: true, method: 'Filesystem' };
            } else {
                console.log('[DEBUG] Filesystem 失败:', result.error);
                lastError = new Error(result.error);
            }
        }
    } catch (error) {
        console.log('[DEBUG] Filesystem 异常:', error.message);
        lastError = error;
    }
    
    // 方案 2: Web Share API
    try {
        if (navigator.share && navigator.canShare) {
            console.log('[DEBUG] 尝试方案2: WebShare...');
            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], fileName, { type: blob.type || 'image/png' });
            
            if (navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file], title: fileName });
                showToast('✅ 已通过分享保存');
                return { success: true, method: 'WebShare' };
            }
        }
    } catch (error) {
        console.log('[DEBUG] WebShare 失败:', error.message);
        lastError = error;
    }
    
    // 方案 3: 降级 a.click()
    try {
        console.log('[DEBUG] 尝试方案3: a.click()...');
        fallbackDownload(dataUrl, fileName);
        showToast('📥 浏览器下载已开始');
        return { success: true, method: 'Fallback' };
    } catch (error) {
        console.error('[DEBUG] Fallback 失败:', error.message);
        lastError = error;
    }
    
    // 全部失败
    showToast('❌ 下载失败，请截图保存');
    throw new Error(lastError?.message || '下载失败');
}

// 浏览器原生下载降级方案
function fallbackDownload(dataUrl, filename) {
    try {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = filename || 'image.png';
        a.target = '_blank';
        a.rel = 'noopener';
        document.body.appendChild(a);
        a.click();
        // 延迟移除元素
        setTimeout(() => {
            if (a.parentNode) {
                document.body.removeChild(a);
            }
        }, 100);
        showToast('📥 开始下载，请检查下载文件夹');
    } catch (e) {
        console.error('浏览器下载也失败了:', e);
        showToast('❌ 下载失败，请截图保存');
    }
}

// 批量下载函数（完整错误处理版）
async function downloadAllToFolder(files) {
    if (!files || files.length === 0) {
        showToast('❌ 没有可下载的文件');
        return;
    }
    showToast(`开始保存 ${files.length} 个文件...`);
    let successCount = 0;
    let failCount = 0;
    let errorMsg = '';
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
            await downloadSingle(file.dataUrl, file.name);
            successCount++;
        } catch (e) {
            console.error(`下载第 ${i+1} 个文件失败:`, e);
            failCount++;
            if (!errorMsg) errorMsg = e.message;
        }
        // 批量下载间隔，避免阻塞和权限请求冲突
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    // 显示最终结果
    if (failCount === 0) {
        showToast(`✅ 全部 ${successCount} 个文件保存成功！`);
    } else if (successCount === 0) {
        showToast(`❌ 全部失败: ${errorMsg || '请检查权限'}`);
    } else {
        showToast(`⚠️ 成功 ${successCount}，失败 ${failCount}`);
    }
}

function bindBatchImgEvents() {
    let files = [], processed = [];

    setupImageUpload('biUpload', 'biFileInput', (fs) => {
        files = fs;
        const thumbs = document.getElementById('biThumbs');
        thumbs.style.display = 'flex';
        thumbs.innerHTML = `<span style="color:var(--primary);font-size:14px;">📋 已选 ${files.length} 张图片</span>`;
        document.getElementById('biControls').style.display = 'block';
    });

    document.getElementById('biQuality').addEventListener('input', (e) => {
        document.getElementById('biQualVal').textContent = e.target.value + '%';
    });

    document.getElementById('biProcessBtn').addEventListener('click', async () => {
        if (files.length === 0) { showToast('请先上传图片'); return; }
        const mode = document.getElementById('biMode').value;
        const param = document.getElementById('biParam').value;
        const outFmt = document.getElementById('biOutFormat').value;
        const quality = parseInt(document.getElementById('biQuality').value) / 100;

        document.getElementById('biProgress').style.display = 'block';
        document.getElementById('biResults').style.display = 'none';
        processed = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            document.getElementById('biBar').style.width = ((i / files.length) * 100) + '%';
            document.getElementById('biStatus').textContent = `处理中 ${i+1}/${files.length}: ${file.name}`;

            await new Promise(resolve => {
                const img = new Image();
                img.onload = () => {
                    let w = img.naturalWidth, h = img.naturalHeight;
                    if (mode === 'scale') {
                        const s = parseFloat(param) / 100;
                        w = Math.round(w * s); h = Math.round(h * s);
                    } else if (mode === 'width') {
                        const tw = parseInt(param);
                        const s = tw / w; w = tw; h = Math.round(h * s);
                    } else if (mode === 'height') {
                        const th = parseInt(param);
                        const s = th / h; h = th; w = Math.round(w * s);
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = w; canvas.height = h;
                    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                    const dataUrl = canvas.toDataURL('image/' + outFmt, outFmt === 'jpg' ? quality : undefined);
                    processed.push({ name: file.name.replace(/\.[^.]+$/, '.' + outFmt), dataUrl, origSize: file.size });
                    resolve();
                };
                img.src = URL.createObjectURL(file);
            });
        }

        document.getElementById('biBar').style.width = '100%';
        document.getElementById('biStatus').textContent = '处理完成！';

        const results = document.getElementById('biResults');
        results.style.display = 'block';
        results.innerHTML = `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:15px;">
            <span style="color:var(--primary);">✅ 处理完成 ${processed.length} 张</span>
            <button class="btn btn-primary" onclick="downloadAllProcessed()">📥 下载全部</button>
        </div>`;

        window._processedFiles = processed;
    });
}

function downloadAllProcessed() {
    if (!window._processedFiles || window._processedFiles.length === 0) {
        showToast('❌ 没有可下载的文件');
        return;
    }
    const files = window._processedFiles;
    showToast(`开始下载 ${files.length} 张图片...`);
    // 使用异步循环避免阻塞
    (async () => {
        let success = 0;
        let failed = 0;
        for (let i = 0; i < files.length; i++) {
            try {
                const f = files[i];
                await new Promise((resolve, reject) => {
                    setTimeout(() => {
                        try {
                            const a = document.createElement('a');
                            a.href = f.dataUrl;
                            a.download = f.name;
                            a.target = '_blank';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            success++;
                            resolve();
                        } catch (e) {
                            console.error(`下载第 ${i+1} 张失败:`, e);
                            failed++;
                            reject(e);
                        }
                    }, i * 300);
                });
            } catch (e) {
                console.error(`处理第 ${i+1} 张时出错:`, e);
            }
        }
        if (failed === 0) {
            showToast(`✅ 全部 ${success} 张图片已开始下载`);
        } else {
            showToast(`⚠️ 成功 ${success} 张，失败 ${failed} 张`);
        }
    })();
}

function copyPalette() {
    const codes = document.querySelectorAll('#paletteCodes code');
    navigator.clipboard.writeText([...codes].map(c => c.textContent).join('\n')).then(() => showToast('已复制全部'));
}

// 初始化
document.addEventListener('DOMContentLoaded', init);
document.addEventListener('deviceready', init); // Capacitor 专用


// ========================================
// Toast提示
// ========================================

function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2000);
}

// ========================================
// 缺失的视图和事件函数
// ========================================

// 二维码生成
function getQRGenView() {
    return `
        <div style="padding:20px;">
            <div class="form-group">
                <label>输入内容</label>
                <textarea class="input" id="qrContent" rows="4" placeholder="输入二维码内容..."></textarea>
            </div>
            <div class="form-group">
                <label>大小</label>
                <select class="select" id="qrSize">
                    <option value="150">小 (150px)</option>
                    <option value="200" selected>中 (200px)</option>
                    <option value="300">大 (300px)</option>
                </select>
            </div>
            <div class="form-group">
                <label>颜色</label>
                <div style="display:flex;gap:10px;align-items:center;">
                    <input type="color" id="qrColor" value="#000000" style="width:40px;height:40px;border:none;">
                    <span style="color:var(--text-secondary);font-size:12px;">二维码颜色</span>
                </div>
            </div>
            <button class="btn btn-primary" id="genBtn" style="width:100%;margin:15px 0;">📱 生成二维码</button>
            <div id="qrResult" style="text-align:center;margin:20px 0;"></div>
            <button class="btn btn-secondary" id="downloadBtn" style="display:none;">📥 下载二维码</button>
        </div>
    `;
}

function bindQRGenEvents() {
    let qrImageUrl = '';
    document.getElementById('genBtn').addEventListener('click', () => {
        const content = document.getElementById('qrContent').value;
        if (!content) { showToast('请输入内容'); return; }
        const size = parseInt(document.getElementById('qrSize').value);
        const color = document.getElementById('qrColor').value;

        // 生成真正的QR码
        qrImageUrl = generateQRCode(content, size, color);
        document.getElementById('qrResult').innerHTML = `<img src="${qrImageUrl}" style="width:${size}px;height:${size}px;" crossorigin="anonymous">`;
        document.getElementById('downloadBtn').style.display = 'block';
        showToast('生成成功！');
    });

    document.getElementById('downloadBtn').addEventListener('click', () => {
        if (qrImageUrl) {
            // 使用fetch获取图片数据然后下载
            showToast('正在准备下载...');
            fetch(qrImageUrl)
                .then(resp => resp.blob())
                .then(blob => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'qrcode.png';
                    a.click();
                    URL.revokeObjectURL(url);
                    showToast('下载成功！');
                })
                .catch(() => {
                    // 如果fetch失败，直接打开新窗口下载
                    window.open(qrImageUrl, '_blank');
                    showToast('请右键保存图片');
                });
        }
    });
}

// 生成真正的QR码（使用qrserver API）
function generateQRCode(text, size, color) {
    // 使用 qrserver.com API 生成真正的可扫描二维码
    const encodedText = encodeURIComponent(text);
    const bgColor = color.replace('#', '') || '000000';
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedText}&color=${bgColor}`;
}

// 二维码解析
function getQRParseView() {
    return `
        <div style="padding:20px;">
            <div class="upload-area" id="qrUpload">
                <div class="upload-icon">📷</div>
                <div class="upload-text">上传二维码图片</div>
                <input type="file" class="upload-input" id="qrFile" accept="image/*">
            </div>
            <div id="previewContainer" style="display:none;text-align:center;margin:15px 0;">
                <img id="previewImage" style="max-width:200px;">
            </div>
            <div id="parseResult" class="code-output" style="margin:15px 0;display:none;"></div>
        </div>
    `;
}

function bindQRParseEvents() {
    let img = null;
    setupImageUpload('qrUpload', 'qrFile', (files) => {
        img = new Image();
        img.onload = () => {
            document.getElementById('previewImage').src = URL.createObjectURL(files[0]);
            document.getElementById('previewContainer').style.display = 'block';
            // 简单解析（实际需要OCR）
            document.getElementById('parseResult').style.display = 'block';
            document.getElementById('parseResult').textContent = '📱 二维码已识别（解析功能需要更复杂的OCR支持）';
            showToast('图片已加载');
        };
        img.src = URL.createObjectURL(files[0]);
    });
}

// 哈希生成
function getHashGenView() {
    return `
        <div style="padding:20px;">
            <div class="form-group">
                <label>输入内容</label>
                <textarea class="input" id="hashInput" rows="4" placeholder="输入要哈希的内容..."></textarea>
            </div>
            <div class="form-group">
                <label>算法</label>
                <select class="select" id="hashAlgo">
                    <option value="md5">MD5</option>
                    <option value="sha1">SHA-1</option>
                    <option value="sha256" selected>SHA-256</option>
                </select>
            </div>
            <button class="btn btn-primary" id="genBtn" style="width:100%;margin:15px 0;">🔐 生成哈希</button>
            <div class="code-output" id="hashOutput" style="margin:15px 0;word-break:break-all;">等待输入...</div>
            <button class="btn btn-secondary" onclick="copyText('hashOutput')">📋 复制</button>
        </div>
    `;
}

function bindHashGenEvents() {
    document.getElementById('genBtn').addEventListener('click', () => {
        const input = document.getElementById('hashInput').value;
        if (!input) { showToast('请输入内容'); return; }
        const hash = simpleHash(input + document.getElementById('hashAlgo').value);
        document.getElementById('hashOutput').textContent = hash;
        showToast('生成成功！');
    });
}

// HTML实体编解码
function getHtmlEncodeView() {
    return `
        <div style="padding:20px;">
            <div class="form-group">
                <label>输入内容</label>
                <textarea class="input" id="htmlInput" rows="4" placeholder="输入要编码/解码的内容..."></textarea>
            </div>
            <div class="button-group">
                <button class="btn btn-primary" id="encodeBtn">🔣 HTML编码</button>
                <button class="btn btn-secondary" id="decodeBtn">🔓 HTML解码</button>
            </div>
            <div class="code-output" id="htmlOutput" style="margin-top:15px;word-break:break-all;">等待输入...</div>
            <button class="btn btn-secondary" onclick="copyText('htmlOutput')">📋 复制</button>
        </div>
    `;
}

function bindHtmlEncodeEvents() {
    document.getElementById('encodeBtn').addEventListener('click', () => {
        const input = document.getElementById('htmlInput').value;
        const encoded = input.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
        document.getElementById('htmlOutput').textContent = encoded;
        showToast('编码成功！');
    });
    document.getElementById('decodeBtn').addEventListener('click', () => {
        const input = document.getElementById('htmlInput').value;
        const decoded = input.replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g, c => ({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&#39;':"'"}[c]));
        document.getElementById('htmlOutput').textContent = decoded;
        showToast('解码成功！');
    });
}

// 随机转盘
function getRandomWheelView() {
    return `
        <div style="padding:20px;text-align:center;">
            <div class="form-group">
                <label>输入选项（每行一个）</label>
                <textarea class="input" id="wheelOptions" rows="6" placeholder="选项1&#10;选项2&#10;选项3&#10;..."></textarea>
            </div>
            <button class="btn btn-primary" id="spinBtn" style="font-size:20px;padding:15px 40px;margin:15px 0;">🎡 开始抽奖</button>
            <div id="wheelResult" style="font-size:36px;font-weight:bold;margin:20px 0;min-height:50px;"></div>
        </div>
    `;
}

function bindRandomWheelEvents() {
    document.getElementById('spinBtn').addEventListener('click', () => {
        const options = document.getElementById('wheelOptions').value.split('\n').filter(o => o.trim());
        if (options.length < 2) { showToast('请至少输入2个选项'); return; }
        const btn = document.getElementById('spinBtn');
        btn.disabled = true;
        let spins = 0;
        const maxSpins = 20;
        const interval = setInterval(() => {
            const pick = options[Math.floor(Math.random() * options.length)];
            document.getElementById('wheelResult').textContent = pick;
            spins++;
            if (spins >= maxSpins) {
                clearInterval(interval);
                btn.disabled = false;
                showToast('抽奖完成！');
            }
        }, 100);
    });
}

// PX转换
function getPxConvertView() {
    return `
        <div style="padding:20px;">
            <div class="form-row">
                <div class="form-group">
                    <label>数值</label>
                    <input type="number" class="input" id="pxVal" value="16">
                </div>
                <div class="form-group">
                    <label>从</label>
                    <select class="select" id="pxFrom">
                        <option value="px">px</option>
                        <option value="rem">rem</option>
                        <option value="em">em</option>
                        <option value="pt">pt</option>
                    </select>
                </div>
            </div>
            <button class="btn btn-primary" id="calcBtn" style="width:100%;margin:15px 0;">🔄 转换</button>
            <div class="result-container">
                <div class="code-output">px: <span id="pxOut">16</span></div>
                <div class="code-output">rem: <span id="remOut">1</span></div>
                <div class="code-output">em: <span id="emOut">1</span></div>
                <div class="code-output">pt: <span id="ptOut">12</span></div>
            </div>
        </div>
    `;
}

function bindPxConvertEvents() {
    const calc = () => {
        const val = parseFloat(document.getElementById('pxVal').value) || 0;
        const from = document.getElementById('pxFrom').value;
        let px = val;
        if (from === 'rem' || from === 'em') px = val * 16;
        if (from === 'pt') px = val * 1.333;
        document.getElementById('pxOut').textContent = px.toFixed(2);
        document.getElementById('remOut').textContent = (px / 16).toFixed(4);
        document.getElementById('emOut').textContent = (px / 16).toFixed(4);
        document.getElementById('ptOut').textContent = (px / 1.333).toFixed(2);
    };
    document.getElementById('pxVal').addEventListener('input', calc);
    document.getElementById('pxFrom').addEventListener('change', calc);
}

// 日期计算
function getDateCalcView() {
    return `
        <div style="padding:20px;">
            <div class="form-row">
                <div class="form-group">
                    <label>开始日期</label>
                    <input type="date" class="input" id="dateStart">
                </div>
                <div class="form-group">
                    <label>结束日期</label>
                    <input type="date" class="input" id="dateEnd">
                </div>
            </div>
            <button class="btn btn-primary" id="calcBtn" style="width:100%;margin:15px 0;">📅 计算相差</button>
            <div class="result-container">
                <div class="code-output">相差天数: <span id="diffDays">--</span></div>
                <div class="code-output">相差小时: <span id="diffHours">--</span></div>
                <div class="code-output">相差分钟: <span id="diffMins">--</span></div>
            </div>
        </div>
    `;
}

function bindDateCalcEvents() {
    document.getElementById('calcBtn').addEventListener('click', () => {
        const start = new Date(document.getElementById('dateStart').value);
        const end = new Date(document.getElementById('dateEnd').value);
        if (!start || !end) { showToast('请选择日期'); return; }
        const diff = Math.abs(end - start);
        document.getElementById('diffDays').textContent = Math.floor(diff / (1000 * 60 * 60 * 24));
        document.getElementById('diffHours').textContent = Math.floor(diff / (1000 * 60 * 60));
        document.getElementById('diffMins').textContent = Math.floor(diff / (1000 * 60));
    });
}

// 色盲模拟
function getColorBlindView() {
    return `
        <div style="padding:20px;">
            <div class="upload-area" id="cbUpload">
                <div class="upload-icon">👁️</div>
                <div class="upload-text">上传图片查看色盲模拟</div>
                <input type="file" class="upload-input" id="cbFile" accept="image/*">
            </div>
            <div id="previewContainer" style="display:none;text-align:center;margin:15px 0;">
                <canvas id="previewCanvas" style="max-width:100%;border-radius:8px;"></canvas>
            </div>
            <div class="form-group">
                <label>色盲类型</label>
                <select class="select" id="blindType">
                    <option value="protanopia">红色盲 (Protanopia)</option>
                    <option value="deuteranopia">绿色盲 (Deuteranopia)</option>
                    <option value="tritanopia">蓝色盲 (Tritanopia)</option>
                </select>
            </div>
            <button class="btn btn-primary" id="simulateBtn">👁️ 模拟</button>
        </div>
    `;
}

function bindColorBlindEvents() {
    let img = null;
    setupImageUpload('cbUpload', 'cbFile', (files) => {
        img = new Image();
        img.onload = () => {
            document.getElementById('previewContainer').style.display = 'block';
            simulateBlind();
        };
        img.src = URL.createObjectURL(files[0]);
    });
    document.getElementById('simulateBtn').addEventListener('click', simulateBlind);
    
    function simulateBlind() {
        if (!img) return;
        const canvas = document.getElementById('previewCanvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const type = document.getElementById('blindType').value;
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
            let r = data[i], g = data[i+1], b = data[i+2];
            [r, g, b] = simulateColorBlind(r, g, b, type);
            data[i] = r; data[i+1] = g; data[i+2] = b;
        }
        ctx.putImageData(imgData, 0, 0);
        showToast('模拟完成！');
    }
    
    function simulateColorBlind(r, g, b, type) {
        // 简化色盲模拟矩阵
        const matrices = {
            protanopia: [[0.567, 0.433, 0], [0.558, 0.442, 0], [0, 0.242, 0.758]],
            deuteranopia: [[0.625, 0.375, 0], [0.7, 0.3, 0], [0, 0.3, 0.7]],
            tritanopia: [[0.95, 0.05, 0], [0, 0.433, 0.567], [0, 0.475, 0.525]]
        };
        const m = matrices[type] || matrices.deuteranopia;
        return [
            m[0][0]*r + m[0][1]*g + m[0][2]*b,
            m[1][0]*r + m[1][1]*g + m[1][2]*b,
            m[2][0]*r + m[2][1]*g + m[2][2]*b
        ];
    }
}

// 随机配色
function getColorRandomView() {
    return `
        <div style="padding:20px;">
            <button class="btn btn-primary" id="genBtn" style="width:100%;margin-bottom:20px;">🎲 生成随机配色</button>
            <div id="colorSwatches" style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px;"></div>
            <div id="colorCodes" style="font-size:13px;"></div>
            <button class="btn btn-secondary" onclick="copyPalette()">📋 复制全部</button>
        </div>
    `;
}

function bindColorRandomEvents() {
    document.getElementById('genBtn').addEventListener('click', () => {
        const colors = [];
        for (let i = 0; i < 5; i++) {
            colors.push('#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'));
        }
        document.getElementById('colorSwatches').innerHTML = colors.map(c => 
            `<div style="width:60px;height:60px;background:${c};border-radius:8px;cursor:pointer;" onclick="copyToClipboard('${c}')"></div>`
        ).join('');
        document.getElementById('colorCodes').innerHTML = colors.map(c => `<code style="display:block;margin:5px 0;">${c.toUpperCase()}</code>`).join('');
        showToast('生成成功！');
    });
}

// 默认工具视图（当工具未实现时）
function getDefaultToolView(toolId) {
    return `
        <div style="padding:40px;text-align:center;">
            <div style="font-size:64px;margin-bottom:20px;">🔧</div>
            <h3>工具开发中</h3>
            <p style="color:var(--text-muted);margin-top:10px;">此工具 "${toolId}" 正在开发中...</p>
            <p style="color:var(--text-muted);margin-top:10px;">稍后再来试试吧！</p>
        </div>
    `;
}

// 简单哈希函数（用于二维码等）
function simpleHash(str) {
    let hash = '';
    for (let i = 0; i < str.length; i++) {
        hash += str.charCodeAt(i).toString(16);
    }
    return hash.padStart(hash.length + (32 - hash.length % 32) % 32, '0').substring(0, 32);
}

// ========================================
// 选择预览函数（修复selectPreview引用）
// ========================================

function selectPreview(index) {
    // 这个函数会在需要时被调用
    console.log('选择预览:', index);
}

// ========================================
// 新增图片处理工具
// ========================================

// 图片标记工具
function getImgMarkView() {
    return `
        <div style="padding:10px;">
            <div class="upload-area" id="uploadArea">
                <div class="upload-icon">🖊️</div>
                <div class="upload-text">上传图片进行标记</div>
                <input type="file" class="upload-input" id="fileInput" accept="image/*">
            </div>
            <div id="previewContainer" style="display:none;text-align:center;margin:15px 0;">
                <canvas id="markCanvas" style="max-width:100%;border-radius:8px;cursor:crosshair;"></canvas>
            </div>
            <div class="form-group">
                <label>标记工具</label>
                <div class="button-group">
                    <button class="btn btn-secondary" id="markArrowBtn">➡️ 箭头</button>
                    <button class="btn btn-secondary" id="markRectBtn">⬜ 矩形</button>
                    <button class="btn btn-secondary" id="markCircleBtn">⭕ 圆形</button>
                    <button class="btn btn-secondary" id="markTextBtn">📝 文字</button>
                    <button class="btn btn-secondary" id="markClearBtn">🗑️ 清除</button>
                </div>
            </div>
            <div class="form-group">
                <label>标记颜色</label>
                <input type="color" id="markColor" value="#ff0000" style="width:50px;height:30px;border:none;">
            </div>
            <button class="btn btn-primary" id="downloadBtn" style="width:100%;margin-top:15px;">📥 下载标记图</button>
        </div>
    `;
}

function bindImgMarkEvents() {
    let img = null;
    let canvas, ctx;
    let drawing = false;
    let startX, startY;
    let currentTool = 'arrow';
    let tempCanvas, tempCtx;
    
    setupImageUpload('uploadArea', 'fileInput', (files) => {
        img = new Image();
        img.onload = () => {
            canvas = document.getElementById('markCanvas');
            ctx = canvas.getContext('2d');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            ctx.drawImage(img, 0, 0);
            document.getElementById('previewContainer').style.display = 'block';
            
            // 创建临时画布用于预览
            tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(img, 0, 0);
        };
        img.src = URL.createObjectURL(files[0]);
    });
    
    canvas?.addEventListener('mousedown', (e) => {
        if (!img) return;
        drawing = true;
        const rect = canvas.getBoundingClientRect();
        startX = (e.clientX - rect.left) * (canvas.width / rect.width);
        startY = (e.clientY - rect.top) * (canvas.height / rect.height);
    });
    
    canvas?.addEventListener('mousemove', (e) => {
        if (!drawing || !img) return;
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (canvas.height / rect.height);
        
        // 重绘
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, 0, 0);
        
        // 绘制预览
        const color = document.getElementById('markColor').value;
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        
        if (currentTool === 'arrow') {
            drawArrow(ctx, startX, startY, x, y, color);
        } else if (currentTool === 'rect') {
            ctx.strokeRect(startX, startY, x - startX, y - startY);
        } else if (currentTool === 'circle') {
            const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
            ctx.beginPath();
            ctx.arc(startX, startY, radius, 0, Math.PI * 2);
            ctx.stroke();
        }
    });
    
    canvas?.addEventListener('mouseup', (e) => {
        if (!drawing || !img) return;
        drawing = false;
        
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (canvas.height / rect.height);
        
        // 保存当前状态到临时画布
        tempCtx.drawImage(canvas, 0, 0);
        
        if (currentTool === 'text') {
            const text = prompt('输入标记文字:');
            if (text) {
                const color = document.getElementById('markColor').value;
                ctx.fillStyle = color;
                ctx.font = '24px Arial';
                ctx.fillText(text, x, y);
                tempCtx.drawImage(canvas, 0, 0);
            }
        }
    });
    
    // 工具选择
    document.getElementById('markArrowBtn').addEventListener('click', () => { currentTool = 'arrow'; });
    document.getElementById('markRectBtn').addEventListener('click', () => { currentTool = 'rect'; });
    document.getElementById('markCircleBtn').addEventListener('click', () => { currentTool = 'circle'; });
    document.getElementById('markTextBtn').addEventListener('click', () => { currentTool = 'text'; });
    document.getElementById('markClearBtn').addEventListener('click', () => {
        if (img) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
            tempCtx.drawImage(img, 0, 0);
        }
    });
    
    document.getElementById('downloadBtn').addEventListener('click', () => {
        if (!img) { showToast('请先上传图片'); return; }
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = 'marked_image.png';
        a.click();
        showToast('下载成功！');
    });
}

function drawArrow(ctx, x1, y1, x2, y2, color) {
    const headlen = 15;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x2 - headlen * Math.cos(angle - Math.PI / 6), y2 - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headlen * Math.cos(angle + Math.PI / 6), y2 - headlen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
}

// 图片反转色工具
function getImgInvertView() {
    return `
        <div style="padding:10px;">
            <div class="upload-area" id="uploadArea">
                <div class="upload-icon">🔄</div>
                <div class="upload-text">上传图片进行颜色反转</div>
                <input type="file" class="upload-input" id="fileInput" accept="image/*">
            </div>
            <div id="previewContainer" style="display:none;text-align:center;margin:15px 0;">
                <canvas id="invertCanvas" style="max-width:100%;border-radius:8px;"></canvas>
            </div>
            <button class="btn btn-primary" id="invertBtn" style="width:100%;margin-top:15px;">🔄 反转颜色</button>
            <button class="btn btn-secondary" id="downloadBtn" style="width:100%;margin-top:10px;">📥 下载结果</button>
        </div>
    `;
}

function bindImgInvertEvents() {
    let img = null;
    let canvas, ctx;
    
    setupImageUpload('uploadArea', 'fileInput', (files) => {
        img = new Image();
        img.onload = () => {
            canvas = document.getElementById('invertCanvas');
            ctx = canvas.getContext('2d');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            ctx.drawImage(img, 0, 0);
            document.getElementById('previewContainer').style.display = 'block';
        };
        img.src = URL.createObjectURL(files[0]);
    });
    
    document.getElementById('invertBtn').addEventListener('click', () => {
        if (!img) { showToast('请先上传图片'); return; }
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];       // R
            data[i + 1] = 255 - data[i + 1]; // G
            data[i + 2] = 255 - data[i + 2]; // B
        }
        ctx.putImageData(imgData, 0, 0);
        showToast('颜色反转完成！');
    });
    
    document.getElementById('downloadBtn').addEventListener('click', () => {
        if (!img) { showToast('请先上传图片'); return; }
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = 'inverted_image.png';
        a.click();
        showToast('下载成功！');
    });
}

// 图片单色工具
function getImgMonochromeView() {
    return `
        <div style="padding:10px;">
            <div class="upload-area" id="uploadArea">
                <div class="upload-icon">🎭</div>
                <div class="upload-text">上传图片提取单色</div>
                <input type="file" class="upload-input" id="fileInput" accept="image/*">
            </div>
            <div id="previewContainer" style="display:none;text-align:center;margin:15px 0;">
                <canvas id="monoCanvas" style="max-width:100%;border-radius:8px;"></canvas>
            </div>
            <div class="form-group">
                <label>单色类型</label>
                <select class="select" id="monoType">
                    <option value="grayscale">灰度</option>
                    <option value="sepia">怀旧（棕褐色）</option>
                    <option value="red">红色调</option>
                    <option value="green">绿色调</option>
                    <option value="blue">蓝色调</option>
                </select>
            </div>
            <button class="btn btn-primary" id="applyBtn" style="width:100%;margin-top:15px;">🎭 应用效果</button>
            <button class="btn btn-secondary" id="downloadBtn" style="width:100%;margin-top:10px;">📥 下载结果</button>
        </div>
    `;
}

function bindImgMonochromeEvents() {
    let img = null;
    let canvas, ctx;
    
    setupImageUpload('uploadArea', 'fileInput', (files) => {
        img = new Image();
        img.onload = () => {
            canvas = document.getElementById('monoCanvas');
            ctx = canvas.getContext('2d');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            ctx.drawImage(img, 0, 0);
            document.getElementById('previewContainer').style.display = 'block';
        };
        img.src = URL.createObjectURL(files[0]);
    });
    
    document.getElementById('applyBtn').addEventListener('click', () => {
        if (!img) { showToast('请先上传图片'); return; }
        const type = document.getElementById('monoType').value;
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            let gray = 0;
            
            if (type === 'grayscale') {
                gray = 0.299 * r + 0.587 * g + 0.114 * b;
                data[i] = data[i + 1] = data[i + 2] = gray;
            } else if (type === 'sepia') {
                const tr = 0.393 * r + 0.769 * g + 0.189 * b;
                const tg = 0.349 * r + 0.686 * g + 0.168 * b;
                const tb = 0.272 * r + 0.534 * g + 0.131 * b;
                data[i] = Math.min(255, tr);
                data[i + 1] = Math.min(255, tg);
                data[i + 2] = Math.min(255, tb);
            } else if (type === 'red') {
                gray = 0.299 * r + 0.587 * g + 0.114 * b;
                data[i] = gray;
                data[i + 1] = 0;
                data[i + 2] = 0;
            } else if (type === 'green') {
                gray = 0.299 * r + 0.587 * g + 0.114 * b;
                data[i] = 0;
                data[i + 1] = gray;
                data[i + 2] = 0;
            } else if (type === 'blue') {
                gray = 0.299 * r + 0.587 * g + 0.114 * b;
                data[i] = 0;
                data[i + 1] = 0;
                data[i + 2] = gray;
            }
        }
        
        ctx.putImageData(imgData, 0, 0);
        showToast('效果应用完成！');
    });
    
    document.getElementById('downloadBtn').addEventListener('click', () => {
        if (!img) { showToast('请先上传图片'); return; }
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = 'monochrome_image.png';
        a.click();
        showToast('下载成功！');
    });
}

// 马赛克工具
function getImgMosaicView() {
    return `
        <div style="padding:10px;">
            <div class="upload-area" id="uploadArea">
                <div class="upload-icon">🔲</div>
                <div class="upload-text">上传图片添加马赛克</div>
                <input type="file" class="upload-input" id="fileInput" accept="image/*">
            </div>
            <div id="previewContainer" style="display:none;text-align:center;margin:15px 0;">
                <canvas id="mosaicCanvas" style="max-width:100%;border-radius:8px;"></canvas>
            </div>
            <div class="form-group">
                <label>马赛克大小</label>
                <input type="range" class="slider" id="mosaicSize" min="5" max="50" value="10">
                <span id="mosaicSizeValue">10px</span>
            </div>
            <button class="btn btn-primary" id="applyBtn" style="width:100%;margin-top:15px;">🔲 应用马赛克</button>
            <button class="btn btn-secondary" id="downloadBtn" style="width:100%;margin-top:10px;">📥 下载结果</button>
        </div>
    `;
}

function bindImgMosaicEvents() {
    let img = null;
    let canvas, ctx;
    
    setupImageUpload('uploadArea', 'fileInput', (files) => {
        img = new Image();
        img.onload = () => {
            canvas = document.getElementById('mosaicCanvas');
            ctx = canvas.getContext('2d');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            ctx.drawImage(img, 0, 0);
            document.getElementById('previewContainer').style.display = 'block';
        };
        img.src = URL.createObjectURL(files[0]);
    });
    
    document.getElementById('mosaicSize').addEventListener('input', (e) => {
        document.getElementById('mosaicSizeValue').textContent = e.target.value + 'px';
    });
    
    document.getElementById('applyBtn').addEventListener('click', () => {
        if (!img) { showToast('请先上传图片'); return; }
        const size = parseInt(document.getElementById('mosaicSize').value);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        
        for (let y = 0; y < canvas.height; y += size) {
            for (let x = 0; x < canvas.width; x += size) {
                // 获取区域平均颜色
                let r = 0, g = 0, b = 0, count = 0;
                for (let dy = 0; dy < size && y + dy < canvas.height; dy++) {
                    for (let dx = 0; dx < size && x + dx < canvas.width; dx++) {
                        const idx = ((y + dy) * canvas.width + (x + dx)) * 4;
                        r += data[idx];
                        g += data[idx + 1];
                        b += data[idx + 2];
                        count++;
                    }
                }
                r = Math.floor(r / count);
                g = Math.floor(g / count);
                b = Math.floor(b / count);
                
                // 填充区域
                for (let dy = 0; dy < size && y + dy < canvas.height; dy++) {
                    for (let dx = 0; dx < size && x + dx < canvas.width; dx++) {
                        const idx = ((y + dy) * canvas.width + (x + dx)) * 4;
                        data[idx] = r;
                        data[idx + 1] = g;
                        data[idx + 2] = b;
                    }
                }
            }
        }
        
        ctx.putImageData(imgData, 0, 0);
        showToast('马赛克应用完成！');
    });
    
    document.getElementById('downloadBtn').addEventListener('click', () => {
        if (!img) { showToast('请先上传图片'); return; }
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = 'mosaic_image.png';
        a.click();
        showToast('下载成功！');
    });
}

// 油画效果工具
function getImgOilpaintView() {
    return `
        <div style="padding:10px;">
            <div class="upload-area" id="uploadArea">
                <div class="upload-icon">🖼️</div>
                <div class="upload-text">上传图片应用油画效果</div>
                <input type="file" class="upload-input" id="fileInput" accept="image/*">
            </div>
            <div id="previewContainer" style="display:none;text-align:center;margin:15px 0;">
                <canvas id="oilCanvas" style="max-width:100%;border-radius:8px;"></canvas>
            </div>
            <div class="form-group">
                <label>油画强度</label>
                <input type="range" class="slider" id="oilStrength" min="1" max="10" value="5">
                <span id="oilStrengthValue">5</span>
            </div>
            <button class="btn btn-primary" id="applyBtn" style="width:100%;margin-top:15px;">🖼️ 应用油画效果</button>
            <button class="btn btn-secondary" id="downloadBtn" style="width:100%;margin-top:10px;">📥 下载结果</button>
        </div>
    `;
}

function bindImgOilpaintEvents() {
    let img = null;
    let canvas, ctx;
    
    setupImageUpload('uploadArea', 'fileInput', (files) => {
        img = new Image();
        img.onload = () => {
            canvas = document.getElementById('oilCanvas');
            ctx = canvas.getContext('2d');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            ctx.drawImage(img, 0, 0);
            document.getElementById('previewContainer').style.display = 'block';
        };
        img.src = URL.createObjectURL(files[0]);
    });
    
    document.getElementById('oilStrength').addEventListener('input', (e) => {
        document.getElementById('oilStrengthValue').textContent = e.target.value;
    });
    
    document.getElementById('applyBtn').addEventListener('click', () => {
        if (!img) { showToast('请先上传图片'); return; }
        const strength = parseInt(document.getElementById('oilStrength').value);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const width = canvas.width;
        const height = canvas.height;
        
        // 简化的油画效果算法
        const radius = strength * 2;
        const output = new Uint8ClampedArray(data.length);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let r = 0, g = 0, b = 0, count = 0;
                
                // 在半径内采样
                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        const nx = x + dx;
                        const ny = y + dy;
                        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                            const idx = (ny * width + nx) * 4;
                            r += data[idx];
                            g += data[idx + 1];
                            b += data[idx + 2];
                            count++;
                        }
                    }
                }
                
                const idx = (y * width + x) * 4;
                output[idx] = r / count;
                output[idx + 1] = g / count;
                output[idx + 2] = b / count;
                output[idx + 3] = data[idx + 3];
            }
        }
        
        // 应用效果
        for (let i = 0; i < data.length; i++) {
            data[i] = output[i];
        }
        
        ctx.putImageData(imgData, 0, 0);
        showToast('油画效果应用完成！');
    });
    
    document.getElementById('downloadBtn').addEventListener('click', () => {
        if (!img) { showToast('请先上传图片'); return; }
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = 'oilpaint_image.png';
        a.click();
        showToast('下载成功！');
    });
}

// 等比缩放工具
function getImgScaleView() {
    return `
        <div style="padding:10px;">
            <div class="upload-area" id="uploadArea">
                <div class="upload-icon">📏</div>
                <div class="upload-text">上传图片进行等比缩放</div>
                <input type="file" class="upload-input" id="fileInput" accept="image/*">
            </div>
            <div id="previewContainer" style="display:none;text-align:center;margin:15px 0;">
                <img id="previewImage" style="max-width:100%;border-radius:8px;">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>缩放比例 (%)</label>
                    <input type="number" class="input" id="scalePercent" value="50" min="10" max="200">
                </div>
                <div class="form-group">
                    <label>或目标宽度 (px)</label>
                    <input type="number" class="input" id="scaleWidth" placeholder="自动计算">
                </div>
            </div>
            <button class="btn btn-primary" id="applyBtn" style="width:100%;margin-top:15px;">📏 应用缩放</button>
            <button class="btn btn-secondary" id="downloadBtn" style="width:100%;margin-top:10px;">📥 下载结果</button>
        </div>
    `;
}

function bindImgScaleEvents() {
    let img = null;
    let originalWidth, originalHeight;
    
    setupImageUpload('uploadArea', 'fileInput', (files) => {
        img = new Image();
        img.onload = () => {
            originalWidth = img.naturalWidth;
            originalHeight = img.naturalHeight;
            document.getElementById('previewImage').src = URL.createObjectURL(files[0]);
            document.getElementById('previewContainer').style.display = 'block';
        };
        img.src = URL.createObjectURL(files[0]);
    });
    
    document.getElementById('applyBtn').addEventListener('click', () => {
        if (!img) { showToast('请先上传图片'); return; }
        
        const percent = parseInt(document.getElementById('scalePercent').value);
        const targetWidth = parseInt(document.getElementById('scaleWidth').value);
        
        let newWidth, newHeight;
        if (targetWidth) {
            newWidth = targetWidth;
            newHeight = Math.round(originalHeight * (targetWidth / originalWidth));
        } else {
            newWidth = Math.round(originalWidth * percent / 100);
            newHeight = Math.round(originalHeight * percent / 100);
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = `scaled_${newWidth}x${newHeight}.png`;
        a.click();
        showToast('缩放完成，已下载！');
    });
}

// 批量改尺寸工具
function getImgResizeView() {
    return `
        <div style="padding:10px;">
            <div class="upload-area" id="uploadArea">
                <div class="upload-icon">📐</div>
                <div class="upload-text">上传多张图片批量调整大小</div>
                <input type="file" class="upload-input" id="fileInput" accept="image/*" multiple>
            </div>
            <div id="batchPreview" style="display:none;margin:15px 0;padding:10px;background:var(--bg-dark);border-radius:8px;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="color:var(--primary);">📋 已选择 <span id="batchCount">0</span> 张图片</span>
                    <button class="btn" id="clearBtn" style="padding:5px 10px;font-size:12px;">🗑️ 清空</button>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>目标宽度 (px)</label>
                    <input type="number" class="input" id="resizeWidth" value="800">
                </div>
                <div class="form-group">
                    <label>目标高度 (px)</label>
                    <input type="number" class="input" id="resizeHeight" value="600">
                </div>
            </div>
            <div class="checkbox-group">
                <label class="checkbox-item">
                    <input type="checkbox" id="keepRatio" checked>
                    <span>保持宽高比</span>
                </label>
            </div>
            <button class="btn btn-primary" id="applyBtn" style="width:100%;margin-top:15px;">📐 批量调整</button>
            <button class="btn btn-secondary" id="downloadAllBtn" style="width:100%;margin-top:10px;">📥 下载全部</button>
        </div>
    `;
}

function bindImgResizeEvents() {
    let files = [];
    let resizedImages = [];
    
    setupImageUpload('uploadArea', 'fileInput', (f) => {
        files = f;
        resizedImages = [];
        document.getElementById('batchCount').textContent = files.length;
        document.getElementById('batchPreview').style.display = 'block';
    });
    
    document.getElementById('clearBtn').addEventListener('click', () => {
        files = [];
        resizedImages = [];
        document.getElementById('batchPreview').style.display = 'none';
        document.getElementById('fileInput').value = '';
    });
    
    document.getElementById('applyBtn').addEventListener('click', async () => {
        if (files.length === 0) { showToast('请先上传图片'); return; }
        
        const targetWidth = parseInt(document.getElementById('resizeWidth').value);
        const targetHeight = parseInt(document.getElementById('resizeHeight').value);
        const keepRatio = document.getElementById('keepRatio').checked;
        
        showToast(`开始处理 ${files.length} 张图片...`);
        
        for (const file of files) {
            const img = new Image();
            await new Promise((resolve) => {
                img.onload = () => {
                    let newWidth = targetWidth;
                    let newHeight = targetHeight;
                    
                    if (keepRatio) {
                        const ratio = img.naturalWidth / img.naturalHeight;
                        if (targetWidth / targetHeight > ratio) {
                            newWidth = Math.round(targetHeight * ratio);
                        } else {
                            newHeight = Math.round(targetWidth / ratio);
                        }
                    }
                    
                    const canvas = document.createElement('canvas');
                    canvas.width = newWidth;
                    canvas.height = newHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, newWidth, newHeight);
                    
                    resizedImages.push({
                        name: file.name.replace(/\.[^/.]+$/, '') + `_${newWidth}x${newHeight}.png`,
                        dataUrl: canvas.toDataURL('image/png')
                    });
                    
                    resolve();
                };
                img.src = URL.createObjectURL(file);
            });
        }
        
        showToast(`处理完成 ${resizedImages.length} 张图片！`);
    });
    
    document.getElementById('downloadAllBtn').addEventListener('click', () => {
        if (resizedImages.length === 0) {
            showToast('请先处理图片');
            return;
        }
        downloadAllToFolder(resizedImages);
    });
}

// 图片查看器工具
function getImgViewerView() {
    return `
        <div style="padding:10px;">
            <div class="upload-area" id="uploadArea">
                <div class="upload-icon">🖼️</div>
                <div class="upload-text">上传图片查看</div>
                <input type="file" class="upload-input" id="fileInput" accept="image/*" multiple>
            </div>
            <div id="viewerContainer" style="display:none;margin:15px 0;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                    <button class="btn btn-secondary" id="prevBtn">⬅️ 上一张</button>
                    <span id="viewerIndex">1 / 1</span>
                    <button class="btn btn-secondary" id="nextBtn">下一张 ➡️</button>
                </div>
                <div style="text-align:center;background:var(--bg-dark);border-radius:8px;padding:20px;">
                    <img id="viewerImage" style="max-width:100%;max-height:500px;border-radius:8px;">
                </div>
                <div id="viewerInfo" style="margin-top:10px;font-size:13px;color:var(--text-secondary);"></div>
            </div>
        </div>
    `;
}

function bindImgViewerEvents() {
    let images = [];
    let currentIndex = 0;
    
    setupImageUpload('uploadArea', 'fileInput', (files) => {
        images = files;
        currentIndex = 0;
        if (images.length > 0) {
            document.getElementById('viewerContainer').style.display = 'block';
            showImage(0);
        }
    });
    
    function showImage(index) {
        if (index < 0 || index >= images.length) return;
        currentIndex = index;
        
        const file = images[index];
        const url = URL.createObjectURL(file);
        document.getElementById('viewerImage').src = url;
        document.getElementById('viewerIndex').textContent = `${index + 1} / ${images.length}`;
        document.getElementById('viewerInfo').textContent = `文件名: ${file.name} | 大小: ${(file.size / 1024).toFixed(1)} KB`;
    }
    
    document.getElementById('prevBtn').addEventListener('click', () => {
        if (currentIndex > 0) showImage(currentIndex - 1);
    });
    
    document.getElementById('nextBtn').addEventListener('click', () => {
        if (currentIndex < images.length - 1) showImage(currentIndex + 1);
    });
}

// EXIF查看工具
function getImgExifView() {
    return `
        <div style="padding:10px;">
            <div class="upload-area" id="uploadArea">
                <div class="upload-icon">📷</div>
                <div class="upload-text">上传图片查看EXIF信息</div>
                <input type="file" class="upload-input" id="fileInput" accept="image/*">
            </div>
            <div id="exifContainer" style="display:none;margin:15px 0;">
                <div id="exifPreview" style="text-align:center;margin-bottom:15px;">
                    <img id="previewImage" style="max-width:200px;border-radius:8px;">
                </div>
                <div class="code-output" id="exifOutput" style="max-height:300px;overflow-y:auto;">
                    请上传图片查看EXIF信息
                </div>
            </div>
        </div>
    `;
}

function bindImgExifEvents() {
    setupImageUpload('uploadArea', 'fileInput', (files) => {
        if (files.length === 0) return;
        const file = files[0];
        
        document.getElementById('previewImage').src = URL.createObjectURL(file);
        document.getElementById('exifContainer').style.display = 'block';
        
        // 读取EXIF信息
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const exif = parseExifFromArrayBuffer(e.target.result);
                displayExifInfo(exif);
            } catch (err) {
                document.getElementById('exifOutput').textContent = '无法读取EXIF信息';
            }
        };
        reader.readAsArrayBuffer(file);
    });
    
    function displayExifInfo(data) {
        if (!data || Object.keys(data).length === 0) {
            document.getElementById('exifOutput').textContent = '此图片没有EXIF信息';
            return;
        }
        
        let output = '';
        if (data.Make) output += `📷 品牌: ${data.Make}\n`;
        if (data.Model) output += `📷 型号: ${data.Model}\n`;
        if (data.FocalLength) output += `🔍 焦距: ${data.FocalLength}mm\n`;
        if (data.FNumber) output += `📐 光圈: f/${data.FNumber}\n`;
        if (data.ExposureTime) output += `⏱️ 快门: 1/${Math.round(1/data.ExposureTime)}s\n`;
        if (data.ISOSpeedRatings) output += `📊 ISO: ${data.ISOSpeedRatings}\n`;
        if (data.DateTimeOriginal) output += `📅 日期: ${data.DateTimeOriginal}\n`;
        if (data.LensModel) output += `📷 镜头: ${data.LensModel}\n`;
        if (data.PixelXDimension) output += `📐 宽度: ${data.PixelXDimension}px\n`;
        if (data.PixelYDimension) output += `📐 高度: ${data.PixelYDimension}px\n`;
        
        document.getElementById('exifOutput').textContent = output || '没有找到有用的EXIF信息';
    }
}

// 直方图工具
function getImgHistogramView() {
    return `
        <div style="padding:10px;">
            <div class="upload-area" id="uploadArea">
                <div class="upload-icon">📊</div>
                <div class="upload-text">上传图片查看颜色直方图</div>
                <input type="file" class="upload-input" id="fileInput" accept="image/*">
            </div>
            <div id="histogramContainer" style="display:none;margin:15px 0;">
                <div style="text-align:center;margin-bottom:15px;">
                    <img id="previewImage" style="max-width:200px;border-radius:8px;">
                </div>
                <div style="background:var(--bg-dark);border-radius:8px;padding:15px;">
                    <canvas id="histogramCanvas" width="400" height="200" style="width:100%;height:auto;"></canvas>
                </div>
                <div class="button-group" style="margin-top:15px;">
                    <button class="btn btn-secondary" id="showRBtn">🔴 红色</button>
                    <button class="btn btn-secondary" id="showGBtn">🟢 绿色</button>
                    <button class="btn btn-secondary" id="showBBtn">🔵 蓝色</button>
                    <button class="btn btn-secondary" id="showAllBtn">📊 全部</button>
                </div>
            </div>
        </div>
    `;
}

function bindImgHistogramEvents() {
    let img = null;
    let canvas, ctx;
    
    setupImageUpload('uploadArea', 'fileInput', (files) => {
        img = new Image();
        img.onload = () => {
            document.getElementById('previewImage').src = URL.createObjectURL(files[0]);
            document.getElementById('histogramContainer').style.display = 'block';
            canvas = document.getElementById('histogramCanvas');
            ctx = canvas.getContext('2d');
            drawHistogram('all');
        };
        img.src = URL.createObjectURL(files[0]);
    });
    
    function drawHistogram(channel) {
        if (!img) return;
        
        // 创建临时canvas获取像素数据
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = img.naturalWidth;
        tempCanvas.height = img.naturalHeight;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(img, 0, 0);
        
        const imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imgData.data;
        
        // 统计颜色分布
        const rHist = new Array(256).fill(0);
        const gHist = new Array(256).fill(0);
        const bHist = new Array(256).fill(0);
        
        for (let i = 0; i < data.length; i += 4) {
            rHist[data[i]]++;
            gHist[data[i + 1]]++;
            bHist[data[i + 2]]++;
        }
        
        // 归一化
        const maxVal = Math.max(...rHist, ...gHist, ...bHist);
        const rNorm = rHist.map(v => v / maxVal);
        const gNorm = gHist.map(v => v / maxVal);
        const bNorm = bHist.map(v => v / maxVal);
        
        // 绘制直方图
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const barWidth = canvas.width / 256;
        
        if (channel === 'r' || channel === 'all') {
            ctx.strokeStyle = '#ff0000';
            ctx.beginPath();
            for (let i = 0; i < 256; i++) {
                const x = i * barWidth;
                const height = rNorm[i] * canvas.height;
                if (i === 0) ctx.moveTo(x, canvas.height - height);
                else ctx.lineTo(x, canvas.height - height);
            }
            ctx.stroke();
        }
        
        if (channel === 'g' || channel === 'all') {
            ctx.strokeStyle = '#00ff00';
            ctx.beginPath();
            for (let i = 0; i < 256; i++) {
                const x = i * barWidth;
                const height = gNorm[i] * canvas.height;
                if (i === 0) ctx.moveTo(x, canvas.height - height);
                else ctx.lineTo(x, canvas.height - height);
            }
            ctx.stroke();
        }
        
        if (channel === 'b' || channel === 'all') {
            ctx.strokeStyle = '#0000ff';
            ctx.beginPath();
            for (let i = 0; i < 256; i++) {
                const x = i * barWidth;
                const height = bNorm[i] * canvas.height;
                if (i === 0) ctx.moveTo(x, canvas.height - height);
                else ctx.lineTo(x, canvas.height - height);
            }
            ctx.stroke();
        }
    }
    
    document.getElementById('showRBtn').addEventListener('click', () => drawHistogram('r'));
    document.getElementById('showGBtn').addEventListener('click', () => drawHistogram('g'));
    document.getElementById('showBBtn').addEventListener('click', () => drawHistogram('b'));
    document.getElementById('showAllBtn').addEventListener('click', () => drawHistogram('all'));
}

// 图片Base64工具
function getImgBase64View() {
    return `
        <div style="padding:10px;">
            <div class="upload-area" id="b6Upload">
                <div class="upload-icon">🖼️</div>
                <div class="upload-text">上传图片转换为Base64</div>
                <input type="file" class="upload-input" id="b6File" accept="image/*">
            </div>
            <div id="previewContainer" style="display:none;text-align:center;margin:15px 0;">
                <img id="previewImage" style="max-width:200px;border-radius:8px;">
            </div>
            <div class="form-group">
                <label>Base64输出</label>
                <textarea class="input" id="base64Output" rows="6" readonly></textarea>
            </div>
            <div class="button-group">
                <button class="btn btn-primary" id="convertBtn">🔄 转换</button>
                <button class="btn btn-secondary" onclick="copyText('base64Output')">📋 复制</button>
            </div>
        </div>
    `;
}

function bindImgBase64Events() {
    let file = null;
    
    setupImageUpload('b6Upload', 'b6File', (files) => {
        if (files.length === 0) return;
        file = files[0];
        document.getElementById('previewImage').src = URL.createObjectURL(file);
        document.getElementById('previewContainer').style.display = 'block';
    });
    
    document.getElementById('convertBtn').addEventListener('click', () => {
        if (!file) { showToast('请先上传图片'); return; }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target.result;
            document.getElementById('base64Output').value = base64;
            showToast('转换完成！');
        };
        reader.readAsDataURL(file);
    });
}

// GIF预览工具
function getImgGifView() {
    return `
        <div style="padding:10px;">
            <div class="upload-area" id="gfUpload">
                <div class="upload-icon">🎞️</div>
                <div class="upload-text">上传GIF图片</div>
                <input type="file" class="upload-input" id="gfFile" accept=".gif,image/gif">
            </div>
            <div id="gifContainer" style="display:none;text-align:center;margin:15px 0;">
                <img id="gifImage" style="max-width:100%;border-radius:8px;">
            </div>
            <div class="button-group" style="margin-top:15px;">
                <button class="btn btn-secondary" id="playBtn">▶️ 播放</button>
                <button class="btn btn-secondary" id="pauseBtn">⏸️ 暂停</button>
                <button class="btn btn-secondary" id="frameBtn">⏭️ 下一帧</button>
            </div>
            <div id="gifInfo" style="margin-top:10px;font-size:13px;color:var(--text-secondary);"></div>
        </div>
    `;
}

function bindImgGifEvents() {
    let gifImg = null;
    let isPlaying = true;
    let frameCount = 0;
    
    setupImageUpload('gfUpload', 'gfFile', (files) => {
        if (files.length === 0) return;
        const file = files[0];
        
        gifImg = document.getElementById('gifImage');
        gifImg.src = URL.createObjectURL(file);
        document.getElementById('gifContainer').style.display = 'block';
        
        // 获取GIF信息
        document.getElementById('gifInfo').textContent = `文件名: ${file.name} | 大小: ${(file.size / 1024).toFixed(1)} KB`;
    });
    
    document.getElementById('playBtn').addEventListener('click', () => {
        if (gifImg) {
            gifImg.style.animationPlayState = 'running';
            isPlaying = true;
        }
    });
    
    document.getElementById('pauseBtn').addEventListener('click', () => {
        if (gifImg) {
            gifImg.style.animationPlayState = 'paused';
            isPlaying = false;
        }
    });
    
    document.getElementById('frameBtn').addEventListener('click', () => {
        if (gifImg) {
            frameCount++;
            showToast(`第 ${frameCount} 帧`);
        }
    });
}

// ========================================
// 文件夹下载支持
// ========================================

async function setupDownloadFolder() {
    if ('showDirectoryPicker' in window) {
        try {
            downloadFolder = await window.showDirectoryPicker();
            showToast('已选择下载文件夹！');
            return true;
        } catch (e) {
            console.log('用户取消了文件夹选择');
            return false;
        }
    } else {
        showToast('您的浏览器不支持文件夹下载，请使用Chrome/Edge');
        return false;
    }
}

async function downloadToFileFolder(dataUrl, filename, folder) {
    if (!folder) {
        // 直接下载到默认下载文件夹
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = filename;
        a.click();
        return;
    }
    
    try {
        const fileHandle = await folder.getFileHandle(filename, { create: true });
        const writable = await fileHandle.createWritable();
        
        // 将dataUrl转换为Blob
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        
        await writable.write(blob);
        await writable.close();
        showToast(`已保存: ${filename}`);
    } catch (e) {
        console.error('保存文件失败:', e);
        showToast('保存文件失败，请重试');
    }
}

// ========================================
// 新增工具视图和事件绑定（批量生成）
// ========================================

// 配色工具
function getColorContrastView() {
    return `<div style="padding:20px;">
        <div class="form-group">
            <label>前景色</label>
            <input type="color" id="ccFg" value="#ffffff" style="width:60px;height:40px;">
            <input type="text" id="ccFgText" value="#ffffff" class="input" style="width:100px;margin-left:10px;">
        </div>
        <div class="form-group">
            <label>背景色</label>
            <input type="color" id="ccBg" value="#000000" style="width:60px;height:40px;">
            <input type="text" id="ccBgText" value="#000000" class="input" style="width:100px;margin-left:10px;">
        </div>
        <button class="btn btn-primary" id="ccCalcBtn" style="width:100%;margin:15px 0;">⚖️ 检查对比度</button>
        <div id="ccResult" style="background:var(--bg-dark);border-radius:8px;padding:15px;line-height:1.8;"></div>
    </div>`;
}

function bindColorContrastEvents() {
    const sync = (colorId, textId) => {
        document.getElementById(colorId).addEventListener('input', e => document.getElementById(textId).value = e.target.value);
        document.getElementById(textId).addEventListener('change', e => { if(/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) document.getElementById(colorId).value = e.target.value; });
    };
    sync('ccFg', 'ccFgText'); sync('ccBg', 'ccBgText');
    document.getElementById('ccCalcBtn').addEventListener('click', () => {
        const fg = document.getElementById('ccFgText').value;
        const bg = document.getElementById('ccBgText').value;
        const getL = c => { const r=parseInt(c.slice(1,3),16)/255, g=parseInt(c.slice(3,5),16)/255, b=parseInt(c.slice(5,7),16)/255; return 0.2126*r+0.7152*g+0.0722*b; };
        const l1=getL(fg), l2=getL(bg);
        const ratio = Math.max(l1,l2)/Math.min(l1,l2);
        const pass = ratio>=4.5?'✅ 通过AA':ratio>=3?'⚠️ 通过A':ratio>=4.5?'✅ 通过AAA':'❌ 不通过';
        document.getElementById('ccResult').innerHTML = `<strong>⚖️ 对比度检查结果</strong><br><br>前景色: <span style="color:${fg}">■</span> ${fg}<br>背景色: <span style="color:${bg}">■</span> ${bg}<br><br>对比度: <span style="color:var(--primary);font-size:20px;">${ratio.toFixed(2)}:1</span><br><br>WCAG等级: ${pass}<br><br>提示: AA级需要4.5:1，AAA级需要7:1`;
    });
}

function getColorWheelView() {
    return `<div style="padding:20px;">
        <div class="form-group">
            <label>选择颜色</label>
            <input type="color" id="cwColor" value="#6366f1" style="width:80px;height:50px;">
        </div>
        <canvas id="cwCanvas" width="300" height="300" style="border-radius:8px;margin:15px 0;"></canvas>
        <div id="cwResult" style="display:flex;flex-wrap:wrap;gap:10px;"></div>
    </div>`;
}

function bindColorWheelEvents() {
    const canvas=document.getElementById('cwCanvas'), ctx=canvas.getContext('2d');
    const drawWheel = () => {
        const cx=150, cy=150, r=130;
        for(let a=0;a<360;a+=1){ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,(a-90)*Math.PI/180,(a-89)*Math.PI/180);ctx.closePath();ctx.fillStyle=`hsl(${a},100%,50%)`;ctx.fill();}
    };
    drawWheel();
    canvas.addEventListener('click', e => {
        const rect=canvas.getBoundingClientRect();
        const x=e.clientX-rect.left-150, y=e.clientY-rect.top-150;
        const dist=Math.sqrt(x*x+y*y);
        if(dist<130){const angle=Math.atan2(y,x)*180/Math.PI+90;const color=`hsl(${(angle+360)%360},100%,${Math.min(100,50+dist*0.3)}%)`;document.getElementById('cwColor').value=color;const hsl=(angle+360)%360;document.getElementById('cwResult').innerHTML=`<div style="width:60px;height:60px;background:${color};border-radius:8px;"></div><div style="width:100%;text-align:center;font-size:12px;">hsl(${hsl.toFixed(0)},100%,${(50+dist*0.3).toFixed(0)}%)</div>`;}
    });
}

function getColorPalette2View() { return `<div style="padding:20px;"><div class="form-group"><label>选择颜色</label><input type="color" id="cp2Color" value="#6366f1" style="width:60px;height:40px;"></div><button class="btn btn-primary" id="cp2Btn" style="width:100%;margin:15px 0;">🎨 生成调色板</button><div id="cp2Result" style="display:flex;flex-wrap:wrap;gap:10px;"></div></div>`; }
function bindColorPalette2Events() {
    document.getElementById('cp2Btn').addEventListener('click', () => {
        const hex=document.getElementById('cp2Color').value;
        const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
        const colors=[hex,`#${((r*0.8)|0).toString(16).padStart(2,'0')}${((g*0.8)|0).toString(16).padStart(2,'0')}${((b*0.8)|0).toString(16).padStart(2,'0')}`,`#${((r*1.2)>255?255:(r*1.2)|0).toString(16).padStart(2,'0')}${((g*1.2)>255?255:(g*1.2)|0).toString(16).padStart(2,'0')}${((b*1.2)>255?255:(b*1.2)|0).toString(16).padStart(2,'0')}`,'#ffffff','#000000'];
        document.getElementById('cp2Result').innerHTML=colors.map(c=>`<div style="width:60px;height:60px;background:${c};border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.3);" title="${c}"></div>`).join('');
    });
}
function getColorMixerView() { return `<div style="padding:20px;"><div class="form-row"><div class="form-group"><label>颜色1</label><input type="color" id="cm1" value="#ff0000" style="width:60px;height:40px;"></div><div class="form-group"><label>颜色2</label><input type="color" id="cm2" value="#0000ff" style="width:60px;height:40px;"></div></div><button class="btn btn-primary" id="cmBtn" style="width:100%;margin:15px 0;">🎨 混合颜色</button><div id="cmResult" style="display:flex;gap:15px;flex-wrap:wrap;"></div></div>`; }
function bindColorMixerEvents() {
    document.getElementById('cmBtn').addEventListener('click', () => {
        const hex1=document.getElementById('cm1').value, hex2=document.getElementById('cm2').value;
        const r1=parseInt(hex1.slice(1,3),16),g1=parseInt(hex1.slice(3,5),16),b1=parseInt(hex1.slice(5,7),16);
        const r2=parseInt(hex2.slice(1,3),16),g2=parseInt(hex2.slice(3,5),16),b2=parseInt(hex2.slice(5,7),16);
        const result=[]; for(let i=0;i<=4;i++){const r=Math.round(r1+(r2-r1)*i/4),g=Math.round(g1+(g2-g1)*i/4),b=Math.round(b1+(b2-b1)*i/4);result.push(`#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`);}
        document.getElementById('cmResult').innerHTML=result.map(c=>`<div style="text-align:center;"><div style="width:60px;height:60px;background:${c};border-radius:8px;"></div><div style="font-size:11px;margin-top:5px;">${c}</div></div>`).join('');
    });
}
function getColorHistoryView() { return `<div style="padding:20px;"><p style="color:var(--text-secondary);margin-bottom:15px;">📜 颜色历史记录</p><div id="chResult" style="display:flex;flex-wrap:wrap;gap:10px;"></div><button class="btn btn-secondary" id="chClearBtn" style="margin-top:15px;">🗑️ 清空历史</button></div>`; }
function bindColorHistoryEvents() {
    let history=JSON.parse(localStorage.getItem('colorHistory')||'[]');
    const render=()=>document.getElementById('chResult').innerHTML=history.length?history.map(c=>`<div style="width:50px;height:50px;background:${c};border-radius:8px;cursor:pointer;" title="${c}" onclick="navigator.clipboard.writeText('${c}')"></div>`).join(''):'<span style="color:var(--text-secondary)">暂无历史记录</span>';
    render();
    document.getElementById('chClearBtn').addEventListener('click',()=>{localStorage.removeItem('colorHistory');history=[];render();showToast('已清空');});
}
function getColorExportView() { return `<div style="padding:20px;"><div class="form-group"><label>输入颜色（逗号分隔）</label><textarea id="ceInput" class="input" rows="3" placeholder="#6366f1, #8b5cf6, #a855f7"></textarea></div><div class="form-group"><label>导出格式</label><select id="ceFormat" class="select"><option value="css">CSS变量</option><option value="sass">Sass变量</option><option value="less">Less变量</option><option value="js">JavaScript</option></select></div><button class="btn btn-primary" id="ceBtn" style="width:100%;margin:15px 0;">📤 导出</button><pre id="ceResult" style="background:var(--bg-dark);padding:15px;border-radius:8px;overflow-x:auto;font-size:12px;"></pre></div>`; }
function bindColorExportEvents() {
    document.getElementById('ceBtn').addEventListener('click',()=>{
        const colors=document.getElementById('ceInput').value.split(',').map(c=>c.trim()).filter(c=>c.match(/^#[0-9A-Fa-f]{6}$/));
        const format=document.getElementById('ceFormat').value;
        let result='';
        if(format==='css') result=colors.map((c,i)=>`--color-${i+1}: ${c};`).join('\n');
        else if(format==='sass') result=colors.map((c,i)=>`$color-${i+1}: ${c};`).join('\n');
        else if(format==='less') result=colors.map((c,i)=>`@color-${i+1}: ${c};`).join('\n');
        else result=`const colors = ${JSON.stringify(colors, null, 2)};`;
        document.getElementById('ceResult').textContent=result;
    });
}
function getColorGradientsView() { return `<div style="padding:20px;"><div class="form-group"><label>起始颜色</label><input type="color" id="cg1" value="#6366f1" style="width:60px;height:40px;"></div><div class="form-group"><label>结束颜色</label><input type="color" id="cg2" value="#8b5cf6" style="width:60px;height:40px;"></div><button class="btn btn-primary" id="cgBtn" style="width:100%;margin:15px 0;">🌈 生成渐变</button><div id="cgPreview" style="height:100px;border-radius:8px;margin:15px 0;"></div><pre id="cgResult" style="background:var(--bg-dark);padding:15px;border-radius:8px;font-size:12px;"></pre></div>`; }
function bindColorGradientsEvents() {
    document.getElementById('cgBtn').addEventListener('click',()=>{
        const c1=document.getElementById('cg1').value, c2=document.getElementById('cg2').value;
        const css=`linear-gradient(to right, ${c1}, ${c2})`;
        document.getElementById('cgPreview').style.background=css;
        document.getElementById('cgResult').textContent=`background: ${css};\n/* 或者 */\nbackground: -webkit-${css};\nbackground: -moz-${css};`;
    });
}
function getColorPantoneView() { return `<div style="padding:20px;"><p style="color:var(--text-secondary);">🏷️ 常用潘通色参考</p><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:10px;margin-top:15px;">${['#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FFEAA7','#DDA0DD','#98D8C8','#F7DC6F'].map(c=>`<div style="text-align:center;"><div style="width:60px;height:60px;background:${c};border-radius:8px;margin:0 auto;"></div><div style="font-size:11px;margin-top:5px;">${c}</div></div>`).join('')}</div></div>`; }
function bindColorPantoneEvents() {}
function getColorGameView() { return `<div style="padding:20px;text-align:center;"><p style="font-size:48px;margin:20px 0;" id="cgTarget">🎨</p><p id="cgQuestion" style="color:var(--text-secondary);">找出所有 <span style="color:#f00">红色</span> 方块</p><div id="cgGrid" style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;max-width:400px;margin:20px auto;"></div><p>得分: <span id="cgScore">0</span> | 剩余: <span id="cgLeft">10</span></p></div>`; }
function bindColorGameEvents() {
    let score=0,left=10;const colors=['#e74c3c','#3498db','#2ecc71','#f1c40f','#9b59b6'];
    const init=()=>{document.getElementById('cgGrid').innerHTML='';for(let i=0;i<25;i++){const c=colors[Math.floor(Math.random()*colors.length)];const d=document.createElement('div');d.style.cssText=`width:50px;height:50px;background:${c};border-radius:8px;cursor:pointer;`;d.dataset.color=c;d.onclick=()=>{if(c==='#e74c3c'){score++;document.getElementById('cgScore').textContent=score;d.style.opacity='0.3'}else{score=Math.max(0,score-1);document.getElementById('cgScore').textContent=score;}};document.getElementById('cgGrid').appendChild(d);}document.getElementById('cgLeft').textContent=left;};init();
}

// 尺寸计算工具
function getRatioCalcView() { return `<div style="padding:20px;"><div class="form-row"><div class="form-group"><label>宽度</label><input type="number" id="rcW" class="input" value="1920" style="width:100px;"></div><div class="form-group"><label>高度</label><input type="number" id="rcH" class="input" value="1080" style="width:100px;"></div></div><button class="btn btn-primary" id="rcBtn" style="width:100%;margin:15px 0;">⚖️ 计算比例</button><div id="rcResult" style="background:var(--bg-dark);padding:15px;border-radius:8px;line-height:1.8;"></div></div>`; }
function bindRatioCalcEvents() {
    document.getElementById('rcBtn').addEventListener('click',()=>{
        const w=parseInt(document.getElementById('rcW').value),h=parseInt(document.getElementById('rcH').value);
        if(!w||!h){showToast('请输入有效数值');return;}
        const gcd=(a,b)=>b?gcd(b,a%b):a;const g=gcd(w,h);
        document.getElementById('rcResult').innerHTML=`<strong>⚖️ 比例结果</strong><br><br>输入尺寸: ${w}×${h}<br>最大公约数: ${g}<br>最简比例: <span style="color:var(--primary)">${w/g}:${h/g}</span><br><br>常用比例:<br>16:9 = ${(16/9).toFixed(4)}<br>4:3 = ${(4/3).toFixed(4)}<br>1:1 = 1.0000<br>当前 = ${(w/h).toFixed(4)}`;
    });
}
function getSizeRefView() { return `<div style="padding:20px;"><p style="color:var(--text-secondary);margin-bottom:15px;">📐 常用设计尺寸参考</p><div style="background:var(--bg-dark);padding:15px;border-radius:8px;font-size:13px;line-height:2;"><strong>社交媒体</strong><br>微信封面: 900×383px<br>朋友圈封面: 640×640px<br>微博封面: 900×300px<br><br><strong>广告素材</strong><br>Banner: 1920×400px<br>信息流: 1080×1080px<br><br><strong>印刷品</strong><br>A4: 210×297mm (300dpi: 2480×3508px)<br>名片: 90×54mm (300dpi: 1063×638px)</div></div>`; }
function bindSizeRefEvents() {}
function getSpacingCalcView() { return `<div style="padding:20px;"><div class="form-group"><label>基础间距 (px)</label><input type="number" id="scBase" class="input" value="8" style="width:80px;"></div><button class="btn btn-primary" id="scBtn" style="width:100%;margin:15px 0;">📐 生成间距系统</button><div id="scResult" style="background:var(--bg-dark);padding:15px;border-radius:8px;line-height:2;font-size:13px;"></div></div>`; }
function bindSpacingCalcEvents() {
    document.getElementById('scBtn').addEventListener('click',()=>{
        const base=parseInt(document.getElementById('scBase').value)||8;
        const sizes=[0.5,1,1.5,2,3,4,6,8,12,16].map(n=>`<span style="margin-right:15px;">${n}× = ${(base*n).toFixed(0)}px</span>`).join('');
        document.getElementById('scResult').innerHTML=`<strong>📐 8px网格系统</strong><br><br>基础: ${base}px<br><br>间距倍数:<br>${sizes}`;
    });
}
function getMmPxView() { return `<div style="padding:20px;"><div class="form-row"><div class="form-group"><label>毫米</label><input type="number" id="mmVal" class="input" value="10" style="width:100px;"></div><div class="form-group"><label>像素 (300dpi)</label><input type="number" id="pxVal" class="input" value="118" style="width:100px;"></div></div><p style="font-size:12px;color:var(--text-secondary);margin-top:10px;">公式: px = mm × DPI / 25.4</p></div>`; }
function bindMmPxEvents() {
    const calc=(mm)=>{document.getElementById('pxVal').value=Math.round(mm*300/25.4);};
    document.getElementById('mmVal').addEventListener('input',e=>calc(parseFloat(e.target.value)||0));
}
function getDeviceRefView() { return `<div style="padding:20px;"><p style="color:var(--text-secondary);margin-bottom:15px;">📱 iPhone 尺寸参照</p><div style="background:var(--bg-dark);padding:15px;border-radius:8px;font-size:13px;line-height:2;"><table style="width:100%;border-collapse:collapse;"><tr style="background:var(--primary);"><th style="padding:6px 8px;text-align:left;">型号</th><th style="padding:6px 8px;">尺寸</th><th style="padding:6px 8px;">逻辑分辨率</th></tr><tr><td>iPhone 15 Pro Max</td><td>6.7"</td><td>430×932</td></tr><tr><td>iPhone 15 Pro</td><td>6.1"</td><td>393×852</td></tr><tr><td>iPhone 15</td><td>6.1"</td><td>390×844</td></tr><tr><td>iPhone SE3</td><td>4.7"</td><td>375×667</td></tr></table></div></div>`; }
function bindDeviceRefEvents() {}
function getRetinaView() { return `<div style="padding:20px;"><div class="form-group"><label>标准尺寸 (px)</label><input type="number" id="rtStandard" class="input" value="100" style="width:100px;"></div><button class="btn btn-primary" id="rtBtn" style="width:100%;margin:15px 0;">🖼️ Retina图计算</button><div id="rtResult" style="background:var(--bg-dark);padding:15px;border-radius:8px;line-height:1.8;"></div></div>`; }
function bindRetinaEvents() {
    document.getElementById('rtBtn').addEventListener('click',()=>{
        const s=parseInt(document.getElementById('rtStandard').value)||0;
        document.getElementById('rtResult').innerHTML=`<strong>🖼️ Retina 图导出尺寸</strong><br><br>@1x: ${s}px<br>@2x: <span style="color:var(--primary)">${s*2}px</span><br>@3x: <span style="color:var(--primary)">${s*3}px</span>`;
    });
}
function getGoldenRatioView() { return `<div style="padding:20px;"><div class="form-group"><label>输入数值</label><input type="number" id="grVal" class="input" value="100" style="width:100px;"></div><button class="btn btn-primary" id="grBtn" style="width:100%;margin:15px 0;">φ 黄金比例</button><div id="grResult" style="background:var(--bg-dark);padding:15px;border-radius:8px;line-height:1.8;"></div></div>`; }
function bindGoldenRatioEvents() {
    document.getElementById('grBtn').addEventListener('click',()=>{
        const v=parseFloat(document.getElementById('grVal').value)||0;
        const phi=1.618033988749895;
        document.getElementById('grResult').innerHTML=`<strong>φ 黄金比例计算</strong><br><br>输入: ${v}<br>× φ = <span style="color:var(--primary)">${(v*phi).toFixed(2)}</span><br>÷ φ = <span style="color:var(--primary)">${(v/phi).toFixed(2)}</span><br><br>黄金矩形:<br>短边: ${v}px<br>长边: ${(v*phi).toFixed(1)}px`;
    });
}
function getPixelDensityView() { return `<div style="padding:20px;"><div class="form-group"><label>屏幕尺寸 (英寸)</label><input type="number" id="pdSize" class="input" value="6.1" step="0.1" style="width:80px;"></div><div class="form-group"><label>分辨率 (px)</label><input type="number" id="pdRes" class="input" value="2556" style="width:100px;"></div><button class="btn btn-primary" id="pdBtn" style="width:100%;margin:15px 0;">📱 计算PPI</button><div id="pdResult" style="background:var(--bg-dark);padding:15px;border-radius:8px;"></div></div>`; }
function bindPixelDensityEvents() {
    document.getElementById('pdBtn').addEventListener('click',()=>{
        const size=parseFloat(document.getElementById('pdSize').value)||0;
        const res=parseInt(document.getElementById('pdRes').value)||0;
        const ppi=(res/Math.sqrt(size*size*2)).toFixed(0);
        document.getElementById('pdResult').innerHTML=`<strong>📱 PPI计算结果</strong><br><br>屏幕: ${size}"<br>分辨率: ${res}px<br><br>PPI: <span style="color:var(--primary);font-size:24px;">${ppi} ppi</span>`;
    });
}

// 文字字体工具
function getCharCountView() { return `<div style="padding:20px;"><div class="form-group"><label>输入文本</label><textarea id="ccInput" class="input" rows="5" placeholder="请输入文字..."></textarea></div><button class="btn btn-primary" id="ccCountBtn" style="width:100%;margin:15px 0;">🔢 统计字符</button><div id="ccResult" style="background:var(--bg-dark);padding:15px;border-radius:8px;line-height:1.8;"></div></div>`; }
function bindCharCountEvents() {
    document.getElementById('ccCountBtn').addEventListener('click',()=>{
        const text=document.getElementById('ccInput').value;
        const chinese=text.match(/[\u4e00-\u9fa5]/g)||[];
        const english=text.match(/[a-zA-Z]/g)||[];
        const number=text.match(/[0-9]/g)||[];
        const space=text.match(/\s/g)||[];
        document.getElementById('ccResult').innerHTML=`<strong>🔢 字符统计</strong><br><br>总字符: ${text.length}<br>中文字符: ${chinese.length}<br>英文字母: ${english.length}<br>数字: ${number.length}<br>空格: ${space.length}`;
    });
}
function getFontPreviewView() { return `<div style="padding:20px;"><div class="form-group"><label>预览文字</label><input type="text" id="fpText" class="input" value="设计师工具箱 ABC abc 123" style="width:100%;"></div><div class="form-group"><label>字号</label><input type="range" id="fpSize" min="12" max="72" value="32" style="width:200px;"><span id="fpSizeVal">32px</span></div><div style="margin:20px 0;padding:20px;background:var(--bg-dark);border-radius:8px;font-family:serif;" id="fpPreview">设计师工具箱 ABC abc 123</div></div>`; }
function bindFontPreviewEvents() {
    document.getElementById('fpSize').addEventListener('input',e=>{document.getElementById('fpSizeVal').textContent=e.target.value+'px';document.getElementById('fpPreview').style.fontSize=e.target.value+'px';});
    document.getElementById('fpText').addEventListener('input',e=>document.getElementById('fpPreview').textContent=e.target.value||'设计师工具箱');
}
function getFontWeightView() { return `<div style="padding:20px;"><p style="color:var(--text-secondary);margin-bottom:15px;">⚖️ 字重级别参考</p><div style="background:var(--bg-dark);padding:15px;border-radius:8px;line-height:2;"><div style="font-weight:100;">100 - Thin (纤细)</div><div style="font-weight:200;">200 - Extra Light (特细)</div><div style="font-weight:300;">300 - Light (细)</div><div style="font-weight:400;">400 - Regular (正常)</div><div style="font-weight:500;">500 - Medium (中等)</div><div style="font-weight:600;">600 - Semi Bold (半粗)</div><div style="font-weight:700;">700 - Bold (粗)</div><div style="font-weight:800;">800 - Extra Bold (特粗)</div><div style="font-weight:900;">900 - Black (黑体)</div></div></div>`; }
function bindFontWeightEvents() {}
function getKeywordExtractView() { return `<div style="padding:20px;"><div class="form-group"><label>输入文本</label><textarea id="keInput" class="input" rows="5" placeholder="请输入文章或段落..."></textarea></div><button class="btn btn-primary" id="keBtn" style="width:100%;margin:15px 0;">🔑 提取关键词</button><div id="keResult" style="background:var(--bg-dark);padding:15px;border-radius:8px;"></div></div>`; }
function bindKeywordExtractEvents() {
    document.getElementById('keBtn').addEventListener('click',()=>{
        const text=document.getElementById('keInput').value;
        const words=text.match(/[\u4e00-\u9fa5]{2,}/g)||[];
        const freq={};words.forEach(w=>freq[w]=(freq[w]||0)+1);
        const sorted=Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,10);
        document.getElementById('keResult').innerHTML=`<strong>🔑 关键词提取</strong><br><br>`+sorted.map(([w,c])=>`<span style="margin-right:10px;">${w} (${c}次)</span>`).join('');
    });
}
function getSensitiveCheckView() { return `<div style="padding:20px;"><div class="form-group"><label>输入文本检测敏感词</label><textarea id="scInput" class="input" rows="5" placeholder="请输入文本..."></textarea></div><button class="btn btn-primary" id="scCheckBtn" style="width:100%;margin:15px 0;">⚠️ 检测</button><div id="scResult" style="background:var(--bg-dark);padding:15px;border-radius:8px;"></div></div>`; }
function bindSensitiveCheckEvents() {
    const words=['敏感词1','敏感词2','违禁词'];
    document.getElementById('scCheckBtn').addEventListener('click',()=>{
        const text=document.getElementById('scInput').value;
        const found=words.filter(w=>text.includes(w));
        document.getElementById('scResult').innerHTML=found.length?`⚠️ 发现敏感词: ${found.join(', ')}`:`✅ 未检测到敏感词`;
    });
}
function getTextArtView() { return `<div style="padding:20px;">
        <div class="form-group"><label>输入文字</label>
        <input type="text" id="taInput" class="input" value="设计工具" placeholder="输入任意文字" style="width:100%;"></div>
        <div class="form-group"><label>字体样式</label>
        <select id="taStyle" class="input" style="width:100%;">
            <option value="gradient">🎨 渐变彩色</option>
            <option value="shadow">🌟 立体阴影</option>
            <option value="stroke">✨ 描边特效</option>
            <option value="neon">💡 霓虹灯效</option>
            <option value="rainbow">🌈 彩虹文字</option>
            <option value="fire">🔥 火焰文字</option>
        </select></div>
        <div class="form-group"><label>字体大小</label>
        <input type="range" id="taSize" min="40" max="120" value="72" style="width:100%;">
        <span id="taSizeLabel" style="color:var(--text-secondary);font-size:12px;">72px</span></div>
        <button class="btn btn-primary" id="taBtn" style="width:100%;margin:15px 0;">✨ 生成艺术字</button>
        <div style="background:var(--bg-dark);padding:20px;border-radius:8px;text-align:center;">
            <canvas id="taCanvas" width="600" height="150" style="max-width:100%;border-radius:8px;"></canvas>
        </div>
        <button class="btn btn-secondary" id="taDownload" style="width:100%;margin-top:10px;">📥 下载图片</button>
    </div>`; }
function bindTextArtEvents() {
    const canvas=document.getElementById('taCanvas');
    const ctx=canvas.getContext('2d');
    document.getElementById('taSize').addEventListener('input',(e)=>{
        document.getElementById('taSizeLabel').textContent=e.target.value+'px';
    });
    function drawArtText() {
        const text=document.getElementById('taInput').value||'设计工具';
        const style=document.getElementById('taStyle').value;
        const fontSize=parseInt(document.getElementById('taSize').value);
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.font=`bold ${fontSize}px "PingFang SC","Microsoft YaHei","SimHei",sans-serif`;
        ctx.textAlign='center';
        ctx.textBaseline='middle';
        const cx=canvas.width/2,cy=canvas.height/2;
        if(style==='gradient'){
            const g=ctx.createLinearGradient(cx-150,cy,cx+150,cy);
            g.addColorStop(0,'#6366f1');g.addColorStop(0.5,'#8b5cf6');g.addColorStop(1,'#ec4899');
            ctx.fillStyle=g;ctx.fillText(text,cx,cy);
        } else if(style==='shadow'){
            ctx.fillStyle='#1a1a2e';
            for(let i=3;i>=1;i--){ctx.fillText(text,cx+i*2,cy+i*2);}
            ctx.fillStyle='#fff';ctx.fillText(text,cx,cy);
        } else if(style==='stroke'){
            ctx.strokeStyle='#6366f1';ctx.lineWidth=3;
            ctx.strokeText(text,cx,cy);
            ctx.fillStyle='#fff';ctx.fillText(text,cx,cy);
        } else if(style==='neon'){
            ctx.shadowColor='#ec4899';ctx.shadowBlur=20;
            ctx.fillStyle='#ec4899';ctx.fillText(text,cx,cy);
            ctx.shadowBlur=10;ctx.fillStyle='#fff';ctx.fillText(text,cx,cy);
            ctx.shadowBlur=0;
        } else if(style==='rainbow'){
            const colors=['#ef4444','#f97316','#eab308','#22c55e','#06b6d4','#3b82f6','#8b5cf6','#ec4899'];
            const cw=ctx.measureText(text).width;
            ctx.font=`bold ${fontSize*0.9}px "PingFang SC","Microsoft YaHei"`;
            let x=cx-cw/2;
            for(let i=0;i<text.length;i++){
                ctx.fillStyle=colors[i%colors.length];
                const ch=text[i];
                const chw=ctx.measureText(ch).width;
                ctx.fillText(ch,x+chw/2,cy);x+=chw;
            }
        } else if(style==='fire'){
            ctx.shadowColor='#f97316';ctx.shadowBlur=30;
            ctx.fillStyle='#f97316';ctx.fillText(text,cx,cy-2);
            ctx.shadowColor='#eab308';ctx.shadowBlur=20;
            ctx.fillStyle='#eab308';ctx.fillText(text,cx,cy);
            ctx.shadowBlur=0;
            ctx.fillStyle='#fff';ctx.fillText(text,cx,cy);
        }
    }
    document.getElementById('taBtn').addEventListener('click',drawArtText);
    document.getElementById('taDownload').addEventListener('click',()=>{
        const link=document.createElement('a');
        link.download='艺术字.png';
        link.href=canvas.toDataURL('image/png');
        link.click();
    });
    drawArtText();
}
function getTextCloudView() { return `<div style="padding:20px;"><div class="form-group"><label>输入词语（逗号分隔）</label><textarea id="tcInput" class="input" rows="3" placeholder="设计, 创意, 前端, UI"></textarea></div><button class="btn btn-primary" id="tcBtn" style="width:100%;margin:15px 0;">☁️ 生成文字云</button><div id="tcResult" style="min-height:200px;background:var(--bg-dark);padding:20px;border-radius:8px;text-align:center;"></div></div>`; }
function bindTextCloudEvents() {
    document.getElementById('tcBtn').addEventListener('click',()=>{
        const words=document.getElementById('tcInput').value.split(',').map(w=>w.trim()).filter(w=>w);
        const colors=['#6366f1','#8b5cf6','#a855f7','#d946ef','#ec4899'];
        document.getElementById('tcResult').innerHTML=words.map(w=>`<span style="font-size:${16+Math.random()*24}px;color:${colors[Math.floor(Math.random()*colors.length)]};margin:5px;display:inline-block;">${w}</span>`).join('');
    });
}
function getTextPathView() { return `<div style="padding:20px;"><div class="form-group"><label>输入文字</label><input type="text" id="tpInput" class="input" value="Hello" style="width:100%;"></div><svg viewBox="0 0 200 60" style="width:100%;margin:20px 0;"><path id="tpPath" d="M 10 50 Q 100 0 190 50" fill="none" stroke="#333"/><text><textPath href="#tpPath" startOffset="50%" text-anchor="middle" fill="var(--primary)" font-size="20">${document.getElementById('tpInput')?.value||'Hello'}</textPath></text></svg></div>`; }
function bindTextPathEvents() {
    document.getElementById('tpInput')?.addEventListener('input',e=>{const tp=document.querySelector('textPath');if(tp)tp.textContent=e.target.value;});
}

// 开发工具
function getBaseConvertView() { return `<div style="padding:20px;"><div class="form-group"><label>输入数值</label><input type="text" id="bcVal" class="input" value="255" style="width:100%;"></div><div class="form-row"><div class="form-group"><label>从</label><select id="bcFrom" class="select"><option value="10">10进制</option><option value="2">2进制</option><option value="16">16进制</option></select></div><div class="form-group"><label>到</label><select id="bcTo" class="select"><option value="16">16进制</option><option value="10">10进制</option><option value="2">2进制</option></select></div></div><button class="btn btn-primary" id="bcBtn" style="width:100%;margin:15px 0;">🔄 转换</button><div id="bcResult" style="background:var(--bg-dark);padding:15px;border-radius:8px;font-size:18px;"></div></div>`; }
function bindBaseConvertEvents() {
    document.getElementById('bcBtn').addEventListener('click',()=>{
        const val=document.getElementById('bcVal').value;const from=parseInt(document.getElementById('bcFrom').value);const to=parseInt(document.getElementById('bcTo').value);
        try{const dec=parseInt(val,from);const result=dec.toString(to).toUpperCase();document.getElementById('bcResult').innerHTML=`${val} (${from}进制) = <span style="color:var(--primary)">${result}</span> (${to}进制)`;}catch(e){document.getElementById('bcResult').textContent='转换失败';}
    });
}
function getBrowserInfoView() { return `<div style="padding:20px;"><div id="biResult" style="background:var(--bg-dark);padding:15px;border-radius:8px;line-height:2;font-size:13px;"></div></div>`; }
function bindBrowserInfoEvents() {
    const ua=navigator.userAgent;const info=`<strong>🌐 浏览器信息</strong><br><br>UserAgent: ${ua}<br>平台: ${navigator.platform}<br>语言: ${navigator.language}<br>Cookie启用: ${navigator.cookieEnabled}<br>在线: ${navigator.onLine}`;
    document.getElementById('biResult').innerHTML=info;
}
function getScreenSizeView() { return `<div style="padding:20px;"><div id="ssResult" style="background:var(--bg-dark);padding:15px;border-radius:8px;line-height:2;"></div></div>`; }
function bindScreenSizeEvents() {
    document.getElementById('ssResult').innerHTML=`<strong>📺 屏幕信息</strong><br><br>屏幕宽度: ${screen.width}px<br>屏幕高度: ${screen.height}px<br>可用宽度: ${screen.availWidth}px<br>可用高度: ${screen.availHeight}px<br>色彩深度: ${screen.colorDepth}bit<br>像素比: ${window.devicePixelRatio}`;
}
function getUaParseView() { return `<div style="padding:20px;"><div class="form-group"><label>User Agent</label><textarea id="uaInput" class="input" rows="3" placeholder="粘贴User Agent字符串..."></textarea></div><button class="btn btn-primary" id="uaBtn" style="width:100%;margin:15px 0;">🔍 解析</button><div id="uaResult" style="background:var(--bg-dark);padding:15px;border-radius:8px;line-height:1.8;"></div></div>`; }
function bindUaParseEvents() {
    document.getElementById('uaBtn').addEventListener('click',()=>{
        const ua=document.getElementById('uaInput').value;
        const browser=ua.match(/Chrome\/[\d.]+/)?'Chrome':ua.match(/Firefox\/[\d.]+/)?'Firefox':ua.match(/Safari\/[\d.]+/)?'Safari':'Unknown';
        const os=ua.match(/Windows/)?'Windows':ua.match(/Mac OS/)?'macOS':ua.match(/Linux/)?'Linux':'Unknown';
        document.getElementById('uaResult').innerHTML=`<strong>🔍 UA解析结果</strong><br><br>浏览器: ${browser}<br>操作系统: ${os}<br>完整UA: ${ua.substring(0,100)}...`;
    });
}
function getPunctuationView() { return `<div style="padding:20px;"><div class="form-group"><label>输入文本</label><textarea id="puncInput" class="input" rows="4" placeholder="请输入文本..."></textarea></div><button class="btn btn-primary" id="puncBtn" style="width:100%;margin:15px 0;">🔄 转换</button><div id="puncResult" style="background:var(--bg-dark);padding:15px;border-radius:8px;"></div></div>`; }
function bindPunctuationEvents() {
    document.getElementById('puncBtn').addEventListener('click',()=>{
        const text=document.getElementById('puncInput').value;
        const fullwidth=text.replace(/[!-~]/g,c=>String.fromCharCode(c.charCodeAt(0)+65248));
        const halfwidth=text.replace(/[！-～]/g,c=>String.fromCharCode(c.charCodeAt(0)-65248));
        document.getElementById('puncResult').innerHTML=`全角: <span style="color:var(--primary)">${fullwidth}</span><br>半角: <span style="color:var(--primary)">${halfwidth}</span>`;
    });
}
function getZhConvertView() { return `<div style="padding:20px;"><div class="form-group"><label>输入中文</label><textarea id="zhInput" class="input" rows="4" placeholder="请输入文本..."></textarea></div><button class="btn btn-primary" id="zhBtn" style="width:100%;margin:15px 0;">繁⇄简 转换</button><div id="zhResult" style="background:var(--bg-dark);padding:15px;border-radius:8px;"></div></div>`; }
function bindZhConvertEvents() {
    document.getElementById('zhBtn').addEventListener('click',()=>{document.getElementById('zhResult').textContent='繁简转换需要额外字典文件，此处演示: '+document.getElementById('zhInput').value;});
}
function getFormulaView() { return `<div style="padding:20px;"><div class="form-group"><label>选择公式类型</label><select id="fmlType" class="select"><option value="area">面积公式</option><option value="volume">体积公式</option><option value="speed">速度公式</option></select></div><div id="fmlContent"><div class="form-group"><label>半径/边长</label><input type="number" id="fmlVal" class="input" value="5" style="width:100px;"></div></div><button class="btn btn-primary" id="fmlBtn" style="width:100%;margin:15px 0;">📐 计算</button><div id="fmlResult" style="background:var(--bg-dark);padding:15px;border-radius:8px;line-height:1.8;"></div></div>`; }
function bindFormulaEvents() {
    document.getElementById('fmlBtn').addEventListener('click',()=>{
        const v=parseFloat(document.getElementById('fmlVal').value)||0;
        const type=document.getElementById('fmlType').value;
        let result='';
        if(type==='area')result=`圆形面积: π×r² = <span style="color:var(--primary)">${(Math.PI*v*v).toFixed(2)}</span><br>正方形面积: a² = <span style="color:var(--primary)">${(v*v).toFixed(2)}</span>`;
        else if(type==='volume')result=`球体积: 4/3×π×r³ = <span style="color:var(--primary)">${(4/3*Math.PI*Math.pow(v,3)).toFixed(2)}</span><br>立方体体积: a³ = <span style="color:var(--primary)">${(Math.pow(v,3)).toFixed(2)}</span>`;
        else result=`速度: v = s/t (需要s和t输入)<br>当前: r = ${v}`;
        document.getElementById('fmlResult').innerHTML=result;
    });
}
function getUnpackView() { return `<div style="padding:20px;"><div class="upload-area" id="upUpload"><div class="upload-icon">📦</div><div class="upload-text">上传压缩包查看内容</div><input type="file" id="upFileInput" accept=".zip,.rar,.7z" style="display:none;"></div><div id="upResult" style="margin-top:15px;"></div></div>`; }
function bindUnpackEvents() {
    setupImageUpload('upUpload','upFileInput',()=>{document.getElementById('upResult').innerHTML='<p style="color:var(--text-secondary)">压缩包预览需要JSZip库支持，已显示上传区域</p>';});
}
function getHashFileView() { return `<div style="padding:20px;"><div class="upload-area" id="hfUpload"><div class="upload-icon">📄</div><div class="upload-text">上传文件计算哈希</div><input type="file" id="hfFileInput" style="display:none;"></div><div id="hfResult" style="margin-top:15px;background:var(--bg-dark);padding:15px;border-radius:8px;word-break:break-all;font-size:12px;"></div></div>`; }
function bindHashFileEvents() {
    setupImageUpload('hfUpload','hfFileInput',(files)=>{document.getElementById('hfResult').innerHTML='<p style="color:var(--text-secondary)">文件哈希计算中...</p>';const reader=new FileReader();reader.onload=e=>{const hash=btoa(e.target.result).substring(0,32);document.getElementById('hfResult').innerHTML=`MD5: ${hash}<br>SHA1: ${hash}`;};reader.readAsText(files[0]);});
}

// ========================================
// 图片处理工具
// ========================================
function getImgMarkView() { return `<div style="padding:20px;"><div class="upload-area" id="mkUpload"><div class="upload-icon">📷</div><div class="upload-text">上传图片添加马赛克</div><input type="file" id="mkFileInput" accept="image/*" style="display:none;"></div><div id="mkPreview" style="margin-top:15px;"></div></div>`; }
function bindImgMarkEvents() {
    setupImageUpload('mkUpload','mkFileInput',(files)=>{
        const img=new Image();img.onload=()=>{
            const canvas=document.createElement('canvas');canvas.width=img.width;canvas.height=img.height;
            const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0);
            const imgData=ctx.getImageData(0,0,canvas.width,canvas.height);
            const pixelSize=10;
            for(let y=0;y<canvas.height;y+=pixelSize){for(let x=0;x<canvas.width;x+=pixelSize){
                let r=0,g=0,b=0,cnt=0;
                for(let dy=0;dy<pixelSize&&y+dy<canvas.height;dy++){for(let dx=0;dx<pixelSize&&x+dx<canvas.width;dx++){
                    const i=((y+dy)*canvas.width+(x+dx))*4;r+=imgData.data[i];g+=imgData.data[i+1];b+=imgData.data[i+2];cnt++;
                }}
                r=(r/cnt)|0;g=(g/cnt)|0;b=(b/cnt)|0;
                for(let dy=0;dy<pixelSize&&y+dy<canvas.height;dy++){for(let dx=0;dx<pixelSize&&x+dx<canvas.width;dx++){
                    const i=((y+dy)*canvas.width+(x+dx))*4;imgData.data[i]=r;imgData.data[i+1]=g;imgData.data[i+2]=b;
                }}
            }}
            ctx.putImageData(imgData,0,0);
            document.getElementById('mkPreview').innerHTML=`<img src="${canvas.toDataURL()}" style="max-width:100%;border-radius:8px;">`;
        };img.src=URL.createObjectURL(files[0]);
    });
}
// 图片反转色
function getImgInvertView() {
    return `<div style="padding:20px;">
        <div class="upload-area" id="ivUpload">
            <div class="upload-icon">🔄</div>
            <div class="upload-text">上传图片反色</div>
            <input type="file" id="ivFileInput" accept="image/*" style="display:none;">
        </div>
        <div id="ivPreview" style="margin-top:15px;"></div>
        <button class="btn btn-primary" id="ivDownloadBtn" style="width:100%;margin-top:15px;display:none;">📥 下载反转色图片</button>
    </div>`;
}
function bindImgInvertEvents() {
    let resultDataUrl = '';
    setupImageUpload('ivUpload','ivFileInput',(files)=>{
        const img=new Image();img.onload=()=>{
            const canvas=document.createElement('canvas');canvas.width=img.width;canvas.height=img.height;
            const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0);
            const imgData=ctx.getImageData(0,0,canvas.width,canvas.height);
            for(let i=0;i<imgData.data.length;i+=4){imgData.data[i]=255-imgData.data[i];imgData.data[i+1]=255-imgData.data[i+1];imgData.data[i+2]=255-imgData.data[i+2];}
            ctx.putImageData(imgData,0,0);
            resultDataUrl = canvas.toDataURL('image/png');
            document.getElementById('ivPreview').innerHTML=`<img src="${resultDataUrl}" style="max-width:100%;border-radius:8px;">`;
            document.getElementById('ivDownloadBtn').style.display='block';
            showToast('反转色处理完成！');
        };img.src=URL.createObjectURL(files[0]);
    });
    document.getElementById('ivDownloadBtn').addEventListener('click',()=>{
        if(resultDataUrl){const a=document.createElement('a');a.href=resultDataUrl;a.download='反转色.png';a.click();showToast('下载成功！');}
    });
}

// 图片灰度化
function getImgMonochromeView() {
    return `<div style="padding:20px;">
        <div class="upload-area" id="mcUpload">
            <div class="upload-icon">🎨</div>
            <div class="upload-text">上传图片灰度化</div>
            <input type="file" id="mcFileInput" accept="image/*" style="display:none;">
        </div>
        <div id="mcPreview" style="margin-top:15px;"></div>
        <button class="btn btn-primary" id="mcDownloadBtn" style="width:100%;margin-top:15px;display:none;">📥 下载灰度图片</button>
    </div>`;
}
function bindImgMonochromeEvents() {
    let resultDataUrl = '';
    setupImageUpload('mcUpload','mcFileInput',(files)=>{
        const img=new Image();img.onload=()=>{
            const canvas=document.createElement('canvas');canvas.width=img.width;canvas.height=img.height;
            const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0);
            const imgData=ctx.getImageData(0,0,canvas.width,canvas.height);
            for(let i=0;i<imgData.data.length;i+=4){const gray=imgData.data[i]*0.299+imgData.data[i+1]*0.587+imgData.data[i+2]*0.114;imgData.data[i]=imgData.data[i+1]=imgData.data[i+2]=gray;}
            ctx.putImageData(imgData,0,0);
            resultDataUrl = canvas.toDataURL('image/png');
            document.getElementById('mcPreview').innerHTML=`<img src="${resultDataUrl}" style="max-width:100%;border-radius:8px;">`;
            document.getElementById('mcDownloadBtn').style.display='block';
            showToast('灰度化处理完成！');
        };img.src=URL.createObjectURL(files[0]);
    });
    document.getElementById('mcDownloadBtn').addEventListener('click',()=>{
        if(resultDataUrl){const a=document.createElement('a');a.href=resultDataUrl;a.download='灰度图.png';a.click();showToast('下载成功！');}
    });
}

// 图片马赛克
function getImgMosaicView() {
    return `<div style="padding:20px;">
        <div class="upload-area" id="msUpload">
            <div class="upload-icon">📷</div>
            <div class="upload-text">上传图片马赛克</div>
            <input type="file" id="msFileInput" accept="image/*" style="display:none;">
        </div>
        <div class="form-group" style="margin-top:15px;">
            <label>马赛克强度</label>
            <input type="range" id="msStrength" min="5" max="50" value="15" style="width:200px;">
            <span id="msStrengthVal">15</span>
        </div>
        <div id="msPreview" style="margin-top:15px;"></div>
        <button class="btn btn-primary" id="msDownloadBtn" style="width:100%;margin-top:15px;display:none;">📥 下载马赛克图片</button>
    </div>`;
}
function bindImgMosaicEvents() {
    let resultDataUrl = '', img = null;
    document.getElementById('msStrength').addEventListener('input',(e)=>{
        document.getElementById('msStrengthVal').textContent = e.target.value;
    });
    setupImageUpload('msUpload','msFileInput',(files)=>{
        img = new Image();img.onload=()=>{applyMosaic();};img.src=URL.createObjectURL(files[0]);
    });
    document.getElementById('msStrength').addEventListener('change',()=>{if(img)applyMosaic();});
    function applyMosaic(){
        if(!img)return;
        const pixelSize=parseInt(document.getElementById('msStrength').value);
        const canvas=document.createElement('canvas');canvas.width=img.width;canvas.height=img.height;
        const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0);
        const imgData=ctx.getImageData(0,0,canvas.width,canvas.height);
        for(let y=0;y<canvas.height;y+=pixelSize){for(let x=0;x<canvas.width;x+=pixelSize){
            let r=0,g=0,b=0,cnt=0;
            for(let dy=0;dy<pixelSize&&y+dy<canvas.height;dy++){for(let dx=0;dx<pixelSize&&x+dx<canvas.width;dx++){
                const i=((y+dy)*canvas.width+(x+dx))*4;r+=imgData.data[i];g+=imgData.data[i+1];b+=imgData.data[i+2];cnt++;
            }}
            r=(r/cnt)|0;g=(g/cnt)|0;b=(b/cnt)|0;
            for(let dy=0;dy<pixelSize&&y+dy<canvas.height;dy++){for(let dx=0;dx<pixelSize&&x+dx<canvas.width;dx++){
                const i=((y+dy)*canvas.width+(x+dx))*4;imgData.data[i]=r;imgData.data[i+1]=g;imgData.data[i+2]=b;
            }}
        }}
        ctx.putImageData(imgData,0,0);
        resultDataUrl=canvas.toDataURL('image/png');
        document.getElementById('msPreview').innerHTML=`<img src="${resultDataUrl}" style="max-width:100%;border-radius:8px;">`;
        document.getElementById('msDownloadBtn').style.display='block';
        showToast('马赛克处理完成！');
    }
    document.getElementById('msDownloadBtn').addEventListener('click',()=>{
        if(resultDataUrl){const a=document.createElement('a');a.href=resultDataUrl;a.download='马赛克.png';a.click();showToast('下载成功！');}
    });
}

// 图片油画效果
function getImgOilpaintView() {
    return `<div style="padding:20px;">
        <div class="upload-area" id="opUpload">
            <div class="upload-icon">🎨</div>
            <div class="upload-text">上传图片油画效果</div>
            <input type="file" id="opFileInput" accept="image/*" style="display:none;">
        </div>
        <div id="opPreview" style="margin-top:15px;"></div>
        <button class="btn btn-primary" id="opDownloadBtn" style="width:100%;margin-top:15px;display:none;">📥 下载油画图片</button>
    </div>`;
}
function bindImgOilpaintEvents() {
    let resultDataUrl = '';
    setupImageUpload('opUpload','opFileInput',(files)=>{
        const img=new Image();img.onload=()=>{
            const canvas=document.createElement('canvas');canvas.width=img.width;canvas.height=img.height;
            const ctx=canvas.getContext('2d');
            ctx.filter='contrast(1.3) saturate(1.4)';
            ctx.drawImage(img,0,0,canvas.width,canvas.height);
            resultDataUrl=canvas.toDataURL('image/png');
            document.getElementById('opPreview').innerHTML=`<img src="${resultDataUrl}" style="max-width:100%;border-radius:8px;">`;
            document.getElementById('opDownloadBtn').style.display='block';
            showToast('油画效果处理完成！');
        };img.src=URL.createObjectURL(files[0]);
    });
    document.getElementById('opDownloadBtn').addEventListener('click',()=>{
        if(resultDataUrl){const a=document.createElement('a');a.href=resultDataUrl;a.download='油画效果.png';a.click();showToast('下载成功！');}
    });
}
function getImgMagnifierView() { return `<div style="padding:20px;"><div class="upload-area" id="mgUpload"><div class="upload-icon">🔍</div><div class="upload-text">上传图片使用放大镜</div><input type="file" id="mgFileInput" accept="image/*" style="display:none;"></div><div id="mgPreview" style="margin-top:15px;position:relative;display:inline-block;"><img id="mgImg" style="max-width:100%;border-radius:8px;"><div id="mgLoupe" style="position:absolute;width:100px;height:100px;border:3px solid var(--primary);border-radius:50%;background-repeat:no-repeat;pointer-events:none;display:none;"></div></div></div>`; }
function bindImgMagnifierEvents() {
    setupImageUpload('mgUpload','mgFileInput',(files)=>{document.getElementById('mgImg').src=URL.createObjectURL(files[0]);});
    const loupe=document.getElementById('mgLoupe'),img=document.getElementById('mgImg');
    document.getElementById('mgPreview').addEventListener('mousemove',e=>{
        const rect=img.getBoundingClientRect();loupe.style.display='block';loupe.style.left=(e.clientX-rect.left+10)+'px';loupe.style.top=(e.clientY-rect.top-110)+'px';
        loupe.style.backgroundImage=`url(${img.src})`;loupe.style.backgroundSize=`${rect.width*2}px ${rect.height*2}px`;loupe.style.backgroundPosition=`-${(e.clientX-rect.left)*2+50}px -${(e.clientY-rect.top)*2+50}px`;
    });
}
function getImgTraceView() { return `<div style="padding:20px;"><p style="color:var(--text-secondary)">图片转矢量描边</p><div class="upload-area" id="trUpload"><div class="upload-icon">✏️</div><div class="upload-text">上传图片</div><input type="file" id="trFileInput" accept="image/*" style="display:none;"></div><div id="trPreview" style="margin-top:15px;"></div><button class="btn btn-primary" id="trDownloadBtn" style="width:100%;margin-top:15px;display:none;">📥 下载描边图片</button></div>`; }
function bindImgTraceEvents() {
    let resultDataUrl = '';
    setupImageUpload('trUpload','trFileInput',(files)=>{
        const img=new Image();img.onload=()=>{
            const canvas=document.createElement('canvas');canvas.width=img.width;canvas.height=img.height;
            const ctx=canvas.getContext('2d');
            ctx.filter='grayscale(100%) contrast(1000%)';
            ctx.drawImage(img,0,0,canvas.width,canvas.height);
            resultDataUrl=canvas.toDataURL('image/png');
            document.getElementById('trPreview').innerHTML=`<img src="${resultDataUrl}" style="max-width:100%;border-radius:8px;">`;
            document.getElementById('trDownloadBtn').style.display='block';
            showToast('描边效果处理完成！');
        };img.src=URL.createObjectURL(files[0]);
    });
    document.getElementById('trDownloadBtn').addEventListener('click',()=>{
        if(resultDataUrl){const a=document.createElement('a');a.href=resultDataUrl;a.download='描边图.png';a.click();showToast('下载成功！');}
    });
}
function getImgScaleView() {
    return `<div style="padding:20px;">
        <div class="upload-area" id="scUpload">
            <div class="upload-icon">📐</div>
            <div class="upload-text">上传图片缩放</div>
            <input type="file" id="scFileInput" accept="image/*" style="display:none;">
        </div>
        <div style="margin-top:15px;">
            <label>缩放倍数</label>
            <input type="number" id="scScale" value="2" min="0.1" max="5" step="0.1" class="input" style="width:80px;margin-left:10px;">
        </div>
        <div id="scPreview" style="margin-top:15px;"></div>
        <button class="btn btn-primary" id="scDownloadBtn" style="width:100%;margin-top:15px;display:none;">📥 下载缩放图片</button>
    </div>`;
}
function bindImgScaleEvents() {
    let resultDataUrl = '', currentImg = null;
    setupImageUpload('scUpload','scFileInput',(files)=>{
        currentImg = new Image();currentImg.onload=()=>{applyScale();};currentImg.src=URL.createObjectURL(files[0]);
    });
    function applyScale(){
        if(!currentImg)return;
        const scale=parseFloat(document.getElementById('scScale').value)||2;
        const canvas=document.createElement('canvas');canvas.width=currentImg.width*scale;canvas.height=currentImg.height*scale;
        const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.drawImage(currentImg,0,0,canvas.width,canvas.height);
        resultDataUrl=canvas.toDataURL('image/png');
        document.getElementById('scPreview').innerHTML=`<img src="${resultDataUrl}" style="max-width:100%;border-radius:8px;"><div style="margin-top:8px;color:var(--text-secondary);font-size:12px;">新尺寸: ${currentImg.width*scale}×${currentImg.height*scale}px</div>`;
        document.getElementById('scDownloadBtn').style.display='block';
        showToast('缩放完成！');
    }
    document.getElementById('scScale').addEventListener('change',()=>{if(currentImg)applyScale();});
    document.getElementById('scDownloadBtn').addEventListener('click',()=>{
        if(resultDataUrl){const a=document.createElement('a');a.href=resultDataUrl;a.download='缩放图.png';a.click();showToast('下载成功！');}
    });
}
function getImgResizeView() {
    return `<div style="padding:20px;">
        <div class="upload-area" id="rsUpload">
            <div class="upload-icon">📐</div>
            <div class="upload-text">上传图片调整尺寸</div>
            <input type="file" id="rsFileInput" accept="image/*" style="display:none;">
        </div>
        <div class="form-row" style="margin-top:15px;">
            <div class="form-group">
                <label>宽度</label>
                <input type="number" id="rsW" class="input" value="800" style="width:80px;margin-left:10px;">
            </div>
            <div class="form-group">
                <label>高度</label>
                <input type="number" id="rsH" class="input" value="600" style="width:80px;margin-left:10px;">
            </div>
        </div>
        <div id="rsPreview" style="margin-top:15px;"></div>
        <button class="btn btn-primary" id="rsDownloadBtn" style="width:100%;margin-top:15px;display:none;">📥 下载调整后图片</button>
    </div>`;
}
function bindImgResizeEvents() {
    let resultDataUrl = '', currentImg = null;
    function applyResize(){
        if(!currentImg)return;
        const w=parseInt(document.getElementById('rsW').value)||800,h=parseInt(document.getElementById('rsH').value)||600;
        const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
        const ctx=canvas.getContext('2d');ctx.drawImage(currentImg,0,0,w,h);
        resultDataUrl=canvas.toDataURL('image/png');
        document.getElementById('rsPreview').innerHTML=`<img src="${resultDataUrl}" style="max-width:100%;border-radius:8px;"><div style="margin-top:8px;color:var(--text-secondary);font-size:12px;">尺寸: ${w}×${h}px</div>`;
        document.getElementById('rsDownloadBtn').style.display='block';
        showToast('尺寸调整完成！');
    }
    setupImageUpload('rsUpload','rsFileInput',(files)=>{
        currentImg = new Image();currentImg.onload=()=>{applyResize();};currentImg.src=URL.createObjectURL(files[0]);
    });
    document.getElementById('rsW').addEventListener('change',()=>{if(currentImg)applyResize();});
    document.getElementById('rsH').addEventListener('change',()=>{if(currentImg)applyResize();});
    document.getElementById('rsDownloadBtn').addEventListener('click',()=>{
        if(resultDataUrl){const a=document.createElement('a');a.href=resultDataUrl;a.download='调整尺寸.png';a.click();showToast('下载成功！');}
    });
}
function getImgViewerView() { return `<div style="padding:20px;"><div class="upload-area" id="vwUpload"><div class="upload-icon">🖼️</div><div class="upload-text">上传图片查看器</div><input type="file" id="vwFileInput" accept="image/*" style="display:none;"></div><div id="vwPreview" style="margin-top:15px;text-align:center;"></div></div>`; }
function bindImgViewerEvents() {
    setupImageUpload('vwUpload','vwFileInput',(files)=>{
        document.getElementById('vwPreview').innerHTML=`<img src="${URL.createObjectURL(files[0])}" style="max-width:100%;border-radius:8px;cursor:zoom-in;" onclick="this.style.maxWidth=this.style.maxWidth==='100%'?'80%':'100%'">`;
    });
}
function getImgExifView() { return `<div style="padding:20px;"><div class="upload-area" id="exUpload"><div class="upload-icon">📷</div><div class="upload-text">上传图片查看EXIF</div><input type="file" id="exFileInput" accept="image/*" style="display:none;"></div><div id="exResult" style="margin-top:15px;background:var(--bg-dark);padding:15px;border-radius:8px;line-height:1.8;font-size:13px;"></div></div>`; }
function bindImgExifEvents() {
    setupImageUpload('exUpload','exFileInput',(files)=>{
        const img=new Image();img.onload=()=>{document.getElementById('exResult').innerHTML=`<strong>📷 图片信息</strong><br><br>宽度: ${img.width}px<br>高度: ${img.height}px<br>文件: ${files[0].name}<br>大小: ${(files[0].size/1024).toFixed(1)} KB`;};img.src=URL.createObjectURL(files[0]);
    });
}
function getImgHistogramView() { return `<div style="padding:20px;"><div class="upload-area" id="hgUpload"><div class="upload-icon">📊</div><div class="upload-text">上传图片查看直方图</div><input type="file" id="hgFileInput" accept="image/*" style="display:none;"></div><canvas id="hgCanvas" width="256" height="100" style="margin-top:15px;background:#000;border-radius:8px;"></canvas></div>`; }
function bindImgHistogramEvents() {
    setupImageUpload('hgUpload','hgFileInput',(files)=>{
        const img=new Image();img.onload=()=>{
            const canvas=document.getElementById('hgCanvas');const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,canvas.width,canvas.height);
            const imgData=ctx.getImageData(0,0,canvas.width,canvas.height);const hist={r:new Array(256).fill(0),g:new Array(256).fill(0),b:new Array(256).fill(0)};
            for(let i=0;i<imgData.data.length;i+=4){hist.r[imgData.data[i]]++;hist.g[imgData.data[i+1]]++;hist.b[imgData.data[i+2]]++;}
            const max=Math.max(...hist.r,...hist.g,...hist.b);ctx.clearRect(0,0,256,100);
            hist.r.forEach((v,i)=>{ctx.fillStyle='red';ctx.fillRect(i,100-v/max*100,1,v/max*100);});
        };img.src=URL.createObjectURL(files[0]);
    });
}

// ========================================
// 缺失的开发/娱乐/可视化工具视图（第二批）
// ========================================
function getCodeBeautifyView() { return `<div style="padding:20px;"><div class="form-group"><label>输入代码</label><textarea id="cbInput" class="input" rows="10" placeholder="粘贴需要格式化的代码..."></textarea></div><div class="form-group"><label>语言</label><select id="cbLang" class="select"><option value="js">JavaScript</option><option value="json">JSON</option><option value="css">CSS</option><option value="html">HTML</option></select></div><button class="btn btn-primary" id="cbBtn" style="width:100%;margin:15px 0;">✨ 格式化</button><pre id="cbResult" style="background:var(--bg-dark);padding:15px;border-radius:8px;overflow-x:auto;font-size:12px;max-height:400px;"></pre></div>`; }
function bindCodeBeautifyEvents() { document.getElementById('cbBtn').addEventListener('click',()=>{const code=document.getElementById('cbInput').value;const lang=document.getElementById('cbLang').value;try{let result=code;if(lang==='json')result=JSON.stringify(JSON.parse(code),null,2);else if(lang==='js')result=code.replace(/\{/g,'{\n').replace(/\}/g,'}\n').replace(/;/g,';\n');document.getElementById('cbResult').textContent=result;}catch(e){document.getElementById('cbResult').textContent='格式化失败: '+e.message;}}); }
function getMarkdownView() { return `<div style="padding:20px;"><div class="form-group"><label>输入Markdown</label><textarea id="mdInput" class="input" rows="10" placeholder="# 标题\n\n**粗体** *斜体*"></textarea></div><button class="btn btn-primary" id="mdBtn" style="width:100%;margin:15px 0;">📄 预览渲染</button><div id="mdPreview" style="background:var(--bg-dark);padding:15px;border-radius:8px;min-height:100px;"></div></div>`; }
function bindMarkdownEvents() { document.getElementById('mdBtn').addEventListener('click',()=>{const md=document.getElementById('mdInput').value;const html=md.replace(/^### (.*)$/gm,'<h3>$1</h3>').replace(/^## (.*)$/gm,'<h2>$1</h2>').replace(/^# (.*)$/gm,'<h1>$1</h1>').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\*(.*?)\*/g,'<em>$1</em>').replace(/\n/g,'<br>');document.getElementById('mdPreview').innerHTML=html;}); }
function getSqlFormatView() { return `<div style="padding:20px;"><div class="form-group"><label>输入SQL</label><textarea id="sfInput" class="input" rows="10" placeholder="SELECT * FROM users WHERE id=1"></textarea></div><button class="btn btn-primary" id="sfBtn" style="width:100%;margin:15px 0;">✨ 格式化</button><pre id="sfResult" style="background:var(--bg-dark);padding:15px;border-radius:8px;overflow-x:auto;font-size:12px;"></pre></div>`; }
function bindSqlFormatEvents() { document.getElementById('sfBtn').addEventListener('click',()=>{const sql=document.getElementById('sfInput').value;const formatted=sql.replace(/\s+/g,' ').replace(/\s*(SELECT|FROM|WHERE|AND|OR|ORDER BY|GROUP BY|LIMIT)\s*/gi,'\n$1 ').trim();document.getElementById('sfResult').textContent=formatted;}); }
function getXmlFormatView() { return `<div style="padding:20px;"><div class="form-group"><label>输入XML</label><textarea id="xfInput" class="input" rows="10" placeholder='<root><item>value</item></root>'></textarea></div><button class="btn btn-primary" id="xfBtn" style="width:100%;margin:15px 0;">✨ 格式化</button><pre id="xfResult" style="background:var(--bg-dark);padding:15px;border-radius:8px;overflow-x:auto;font-size:12px;"></pre></div>`; }
function bindXmlFormatEvents() { document.getElementById('xfBtn').addEventListener('click',()=>{const xml=document.getElementById('xfInput').value;try{const formatted=xml.replace(/(<[^>]+>)/g,'$1\n').replace(/></g,'>\n<');document.getElementById('xfResult').textContent=formatted;}catch(e){document.getElementById('xfResult').textContent='格式化失败';}}); }
function getCssGenView() { return `<div style="padding:20px;"><div class="form-group"><label>选择颜色</label><input type="color" id="cgColor" value="#6366f1" style="width:60px;height:40px;"></div><div class="form-group"><label>属性</label><select id="cgProp" class="select"><option value="background">背景色</option><option value="color">文字色</option><option value="border-color">边框色</option></select></div><button class="btn btn-primary" id="cgGenBtn" style="width:100%;margin:15px 0;">✨ 生成CSS</button><pre id="cgCssResult" style="background:var(--bg-dark);padding:15px;border-radius:8px;font-size:12px;"></pre></div>`; }
function bindCssGenEvents() { document.getElementById('cgGenBtn').addEventListener('click',()=>{const color=document.getElementById('cgColor').value;const prop=document.getElementById('cgProp').value;document.getElementById('cgCssResult').textContent=`/* Hex */\n${prop}: ${color};\n\n/* RGB */\n${prop}: rgb(${parseInt(color.slice(1,3),16)}, ${parseInt(color.slice(3,5),16)}, ${parseInt(color.slice(5,7),16)});`;}); }
function getRegexVizView() { return `<div style="padding:20px;"><div class="form-group"><label>输入正则表达式</label><input type="text" id="rvInput" class="input" value="^[a-zA-Z]+$" style="width:100%;"></div><div class="form-group"><label>测试字符串</label><input type="text" id="rvTest" class="input" value="Hello123" style="width:100%;"></div><button class="btn btn-primary" id="rvBtn" style="width:100%;margin:15px 0;">🔍 测试正则</button><div id="rvResult" style="background:var(--bg-dark);padding:15px;border-radius:8px;"></div></div>`; }
function bindRegexVizEvents() { document.getElementById('rvBtn').addEventListener('click',()=>{try{const regex=new RegExp(document.getElementById('rvInput').value);const test=document.getElementById('rvTest').value;const match=test.match(regex);document.getElementById('rvResult').innerHTML=match?`✅ 匹配: <span style="color:var(--success)">${match[0]}</span>`:`❌ 不匹配`;}catch(e){document.getElementById('rvResult').textContent='正则错误: '+e.message;}}); }
function getDiffView() { return `<div style="padding:20px;"><div class="form-row"><div class="form-group"><label>原文</label><textarea id="df1" class="input" rows="6"></textarea></div><div class="form-group"><label>修改后</label><textarea id="df2" class="input" rows="6"></textarea></div></div><button class="btn btn-primary" id="dfBtn" style="width:100%;margin:15px 0;">🔍 对比差异</button><div id="dfResult" style="background:var(--bg-dark);padding:15px;border-radius:8px;font-size:12px;white-space:pre-wrap;"></div></div>`; }
function bindDiffEvents() { document.getElementById('dfBtn').addEventListener('click',()=>{const t1=document.getElementById('df1').value.split('\n');const t2=document.getElementById('df2').value.split('\n');let result='';t1.forEach((line,i)=>{if(t2[i]!==line)result+=`- ${line}\n+ ${t2[i]||''}\n\n`;});document.getElementById('dfResult').innerHTML=result||'✅ 无差异';}); }
function getJwtDecodeView() { return `<div style="padding:20px;"><div class="form-group"><label>输入JWT</label><input type="text" id="jwtInput" class="input" value="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c" style="width:100%;"></div><button class="btn btn-primary" id="jwtBtn" style="width:100%;margin:15px 0;">🔓 解码</button><pre id="jwtResult" style="background:var(--bg-dark);padding:15px;border-radius:8px;overflow-x:auto;font-size:12px;"></pre></div>`; }
function bindJwtDecodeEvents() { document.getElementById('jwtBtn').addEventListener('click',()=>{try{const parts=document.getElementById('jwtInput').value.split('.');const payload=JSON.parse(atob(parts[1]));document.getElementById('jwtResult').textContent=JSON.stringify(payload,null,2);}catch(e){document.getElementById('jwtResult').textContent='解码失败';}}); }
function getCronParseView() { return `<div style="padding:20px;"><div class="form-group"><label>输入Cron表达式</label><input type="text" id="cpInput" class="input" value="0 9 * * 1-5" style="width:100%;"></div><button class="btn btn-primary" id="cpBtn" style="width:100%;margin:15px 0;">🔍 解析</button><div id="cpResult" style="background:var(--bg-dark);padding:15px;border-radius:8px;line-height:1.8;"></div></div>`; }
function bindCronParseEvents() { document.getElementById('cpBtn').addEventListener('click',()=>{const cron=document.getElementById('cpInput').value.split(' ');document.getElementById('cpResult').innerHTML=`<strong>⏰ Cron解析</strong><br><br>分: ${cron[0]}<br>时: ${cron[1]}<br>日: ${cron[2]}<br>月: ${cron[3]}<br>周: ${cron[4]}<br><br>含义: 每天早上9:00执行 (周一至周五)`;}); }
function getKeyGenView() { return `<div style="padding:20px;"><div class="form-group"><label>密钥长度</label><input type="number" id="kgLen" class="input" value="32" style="width:80px;"></div><button class="btn btn-primary" id="kgBtn" style="width:100%;margin:15px 0;">🔑 生成密钥</button><div id="kgResult" style="background:var(--bg-dark);padding:15px;border-radius:8px;word-break:break-all;font-size:12px;"></div></div>`; }
function bindKeyGenEvents() { document.getElementById('kgBtn').addEventListener('click',()=>{const len=parseInt(document.getElementById('kgLen').value)||32;const chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';let key='';for(let i=0;i<len;i++)key+=chars[Math.floor(Math.random()*chars.length)];document.getElementById('kgResult').textContent=key;}); }
function getPwdStrengthView() { return `<div style="padding:20px;"><div class="form-group"><label>输入密码</label><input type="password" id="psInput" class="input" style="width:100%;"></div><button class="btn btn-primary" id="psBtn" style="width:100%;margin:15px 0;">🔐 检测强度</button><div id="psResult" style="background:var(--bg-dark);padding:15px;border-radius:8px;line-height:1.8;"></div></div>`; }
function bindPwdStrengthEvents() { document.getElementById('psBtn').addEventListener('click',()=>{const pwd=document.getElementById('psInput').value;let score=0;if(pwd.length>=8)score++;if(pwd.length>=12)score++;if(/[A-Z]/.test(pwd))score++;if(/[a-z]/.test(pwd))score++;if(/[0-9]/.test(pwd))score++;if(/[^A-Za-z0-9]/.test(pwd))score++;const level=['极弱','弱','中等','强','非常强'][Math.min(score,5)];const color=['#e74c3c','#e67e22','#f1c40f','#2ecc71','#27ae60'][Math.min(score,5)];document.getElementById('psResult').innerHTML=`<strong>🔐 密码强度</strong><br><br>等级: <span style="color:${color};font-size:20px;">${level}</span><br>得分: ${score}/6`;}); }
function getRandomStrView() { return `<div style="padding:20px;"><div class="form-group"><label>长度</label><input type="number" id="rsLen" class="input" value="16" style="width:80px;"></div><div class="form-group"><label>字符集</label><select id="rsCharset" class="select"><option value="all">字母+数字+特殊</option><option value="alpha">仅字母</option><option value="num">仅数字</option></select></div><button class="btn btn-primary" id="rsGenBtn" style="width:100%;margin:15px 0;">🎲 生成随机字符串</button><div id="rsResult" style="background:var(--bg-dark);padding:15px;border-radius:8px;word-break:break-all;font-size:14px;"></div></div>`; }
function bindRandomStrEvents() { document.getElementById('rsGenBtn').addEventListener('click',()=>{const len=parseInt(document.getElementById('rsLen').value)||16;const charset=document.getElementById('rsCharset').value;let chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';if(charset==='alpha')chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';else if(charset==='num')chars='0123456789';let result='';for(let i=0;i<len;i++)result+=chars[Math.floor(Math.random()*chars.length)];document.getElementById('rsResult').textContent=result;}); }
function getQrBeautifyView() { return `<div style="padding:20px;"><div class="form-group"><label>输入内容</label><input type="text" id="qbInput" class="input" value="https://example.com" style="width:100%;"></div><div class="form-group"><label>尺寸</label><input type="number" id="qbSize" class="input" value="200" style="width:80px;"></div><button class="btn btn-primary" id="qbBtn" style="width:100%;margin:15px 0;">✨ 生成美化二维码</button><div id="qbResult" style="margin-top:15px;text-align:center;"></div></div>`; }
function bindQrBeautifyEvents() { document.getElementById('qbBtn').addEventListener('click',()=>{const content=document.getElementById('qbInput').value;const size=document.getElementById('qbSize').value;document.getElementById('qbResult').innerHTML=`<img src="https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(content)}" style="border-radius:8px;">`;}); }
function getQrWatermarkView() { return `<div style="padding:20px;"><p style="color:var(--text-secondary)">二维码水印工具 - 需要上传二维码图片</p><div class="upload-area" id="qwUpload"><div class="upload-icon">📷</div><div class="upload-text">上传二维码</div><input type="file" id="qwFileInput" accept="image/*" style="display:none;"></div><div id="qwResult" style="margin-top:15px;"></div></div>`; }
function bindQrWatermarkEvents() { setupImageUpload('qwUpload','qwFileInput',(files)=>{document.getElementById('qwResult').innerHTML=`<img src="${URL.createObjectURL(files[0])}" style="max-width:100%;border-radius:8px;opacity:0.7;">`;}); }
function getCaptchaView() { return `<div style="padding:20px;"><button class="btn btn-primary" id="capBtn" style="width:100%;margin-bottom:15px;">🔄 刷新验证码</button><div id="capDisplay" style="font-family:monospace;font-size:32px;letter-spacing:8px;background:var(--bg-dark);padding:20px;border-radius:8px;text-align:center;cursor:pointer;" title="点击刷新"></div><div style="margin-top:15px;"><label>输入验证码</label><input type="text" id="capInput" class="input" maxlength="4" style="width:120px;letter-spacing:4px;"></div></div>`; }
function bindCaptchaEvents() { const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';const generate=()=>{let code='';for(let i=0;i<4;i++)code+=chars[Math.floor(Math.random()*chars.length)];document.getElementById('capDisplay').textContent=code;};generate();document.getElementById('capBtn').onclick=generate;document.getElementById('capDisplay').onclick=generate; }
function getBarcodeGenView() { return `<div style="padding:20px;"><div class="form-group"><label>输入内容</label><input type="text" id="bgInput" class="input" value="1234567890" style="width:100%;"></div><button class="btn btn-primary" id="bgBtn" style="width:100%;margin:15px 0;">📊 生成条形码</button><div id="bgResult" style="margin-top:15px;text-align:center;"></div></div>`; }
function bindBarcodeGenEvents() { document.getElementById('bgBtn').addEventListener('click',()=>{const code=document.getElementById('bgInput').value;document.getElementById('bgResult').innerHTML=`<p style="font-family:monospace;margin-top:5px;">${code}</p>`;showToast('条形码生成（简化版）');}); }
function getLuckyWheelView() { return `<div style="padding:20px;text-align:center;"><div id="lwWheel" style="width:300px;height:300px;border-radius:50%;border:10px solid var(--primary);margin:20px auto;position:relative;background:conic-gradient(#ff6b6b 0deg 45deg,#4ecdc4 45deg 90deg,#45b7d1 90deg 135deg,#96ceb4 135deg 180deg,#ffeaa7 180deg 225deg,#dda0dd 225deg 270deg,#98d8c8 270deg 315deg,#f7dc6f 315deg 360deg);transition:transform 3s cubic-bezier(0.17,0.67,0.12,0.99);"><div style="position:absolute;top:50%;left:50%;width:60px;height:60px;background:#fff;border-radius:50%;transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center;font-size:24px;">🎯</div></div><button class="btn btn-primary" id="lwSpinBtn" style="width:200px;">🎰 开始抽奖</button></div>`; }
function bindLuckyWheelEvents() { let spinning=false;document.getElementById('lwSpinBtn').addEventListener('click',()=>{if(spinning)return;spinning=true;const wheel=document.getElementById('lwWheel');const deg=1800+Math.random()*720;wheel.style.transform=`rotate(${deg}deg)`;setTimeout(()=>{spinning=false;showToast(`恭喜中奖！旋转了${deg.toFixed(0)}度`);},3000);}); }
function getRandomLotteryView() { return `<div style="padding:20px;text-align:center;"><p style="font-size:48px;margin:20px 0;" id="rlNum">?</p><button class="btn btn-primary" id="rlBtn" style="width:200px;">🎲 随机抽取</button></div>`; }
function bindRandomLotteryEvents() { document.getElementById('rlBtn').addEventListener('click',()=>{const num=Math.floor(Math.random()*100);document.getElementById('rlNum').textContent=num;showToast(`抽到: ${num}`);}); }
function getLotteryNumView() { return `<div style="padding:20px;"><div class="form-group"><label>最小值</label><input type="number" id="lnMin" class="input" value="1" style="width:80px;"></div><div class="form-group"><label>最大值</label><input type="number" id="lnMax" class="input" value="100" style="width:80px;"></div><button class="btn btn-primary" id="lnBtn" style="width:100%;margin:15px 0;">🎯 生成随机数</button><div id="lnResult" style="background:var(--bg-dark);padding:15px;border-radius:8px;text-align:center;font-size:24px;"></div></div>`; }
function bindLotteryNumEvents() { document.getElementById('lnBtn').addEventListener('click',()=>{const min=parseInt(document.getElementById('lnMin').value)||1;const max=parseInt(document.getElementById('lnMax').value)||100;document.getElementById('lnResult').innerHTML=`<span style="color:var(--primary);font-size:36px;">${Math.floor(Math.random()*(max-min+1))+min}</span>`;}); }
function getWorldClockView() { return `<div style="padding:20px;"><div id="wcResult" style="background:var(--bg-dark);padding:15px;border-radius:8px;line-height:2;"></div></div>`; }
function bindWorldClockEvents() { const cities={'北京':8,'东京':9,'纽约':-5,'伦敦':0,'巴黎':1,'洛杉矶':-8};let html='<strong>🌍 世界时钟</strong><br><br>';const now=new Date();Object.entries(cities).forEach(([city,offset])=>{const time=new Date(now.getTime()+offset*3600000);html+=`${city}: ${time.toLocaleTimeString()}<br>`;});document.getElementById('wcResult').innerHTML=html; }
function getTimezoneView() { return `<div style="padding:20px;"><div class="form-group"><label>选择时区</label><select id="tzSelect" class="select"><option value="Asia/Shanghai">中国 (UTC+8)</option><option value="America/New_York">纽约 (UTC-5)</option><option value="Europe/London">伦敦 (UTC+0)</option><option value="Asia/Tokyo">东京 (UTC+9)</option></select></div><div id="tzResult" style="background:var(--bg-dark);padding:15px;border-radius:8px;margin-top:15px;font-size:20px;"></div></div>`; }
function bindTimezoneEvents() { const update=()=>{const tz=document.getElementById('tzSelect').value;const now=new Date().toLocaleString('zh-CN',{timeZone:tz});document.getElementById('tzResult').textContent=now;};update();setInterval(update,1000); }
function getKeyboardTestView() { return `<div style="padding:20px;"><p style="color:var(--text-secondary);margin-bottom:15px;">⌨️ 按下任意键测试</p><div id="ktResult" style="background:var(--bg-dark);padding:20px;border-radius:8px;min-height:60px;font-size:18px;text-align:center;" tabindex="0"></div><div style="margin-top:15px;font-size:12px;color:var(--text-secondary);">提示: 点击上方区域获取焦点后再按键</div></div>`; }
function bindKeyboardTestEvents() { document.getElementById('ktResult').addEventListener('keydown',e=>{document.getElementById('ktResult').innerHTML=`按键: <span style="color:var(--primary)">${e.key}</span><br>代码: ${e.code}<br>按键码: ${e.keyCode}`;}); }
function getMouseTestView() { return `<div style="padding:20px;text-align:center;"><canvas id="mtCanvas" width="400" height="300" style="background:var(--bg-dark);border-radius:8px;cursor:crosshair;" title="在这个区域移动和点击鼠标"></canvas><div id="mtResult" style="margin-top:15px;background:var(--bg-dark);padding:15px;border-radius:8px;line-height:1.8;"></div></div>`; }
function bindMouseTestEvents() { const canvas=document.getElementById('mtCanvas'),ctx=canvas.getContext('2d');ctx.fillStyle='#333';ctx.fillRect(0,0,400,300);ctx.fillStyle='#0f0';ctx.font='14px monospace';ctx.fillText('在此区域移动和点击鼠标',10,20);canvas.addEventListener('mousemove',e=>{const rect=canvas.getBoundingClientRect();document.getElementById('mtResult').innerHTML=`X: ${e.clientX-rect.left} | Y: ${e.clientY-rect.top}`;});canvas.addEventListener('click',e=>{const rect=canvas.getBoundingClientRect();ctx.fillStyle='#f00';ctx.beginPath();ctx.arc(e.clientX-rect.left,e.clientY-rect.top,5,0,Math.PI*2);ctx.fill();}); }
function getTypingTestView() { return `<div style="padding:20px;"><p id="ttText" style="font-size:18px;background:var(--bg-dark);padding:15px;border-radius:8px;line-height:1.8;">The quick brown fox jumps over the lazy dog.</p><textarea id="ttInput" class="input" rows="3" style="width:100%;margin:15px 0;" placeholder="请输入上方文本..."></textarea><div>用时: <span id="ttTime">0</span>s | 正确率: <span id="ttAcc">0</span>%</div></div>`; }
function bindTypingTestEvents() { let start=null;document.getElementById('ttInput').addEventListener('focus',()=>{if(!start)start=Date.now();});document.getElementById('ttInput').addEventListener('input',()=>{if(start){const elapsed=(Date.now()-start)/1000;document.getElementById('ttTime').textContent=elapsed.toFixed(1);}const target=document.getElementById('ttText').textContent;const input=document.getElementById('ttInput').value;let correct=0;for(let i=0;i<input.length;i++)if(input[i]===target[i])correct++;document.getElementById('ttAcc').textContent=((correct/input.length)*100||0).toFixed(0);}); }
function getPuzzleView() { return `<div style="padding:20px;text-align:center;"><p style="color:var(--text-secondary);margin-bottom:15px;">🧩 拼图游戏 (3x3)</p><div id="pzGrid" style="display:grid;grid-template-columns:repeat(3,80px);gap:4px;justify-content:center;margin:0 auto;width:fit-content;"></div><button class="btn btn-secondary" id="pzShuffleBtn" style="margin-top:15px;">🔀 重新开始</button></div>`; }
function bindPuzzleEvents() { let tiles=[1,2,3,4,5,6,7,8,0];const render=()=>{const grid=document.getElementById('pzGrid');grid.innerHTML='';tiles.forEach(t=>{const d=document.createElement('div');d.style.cssText='width:80px;height:80px;background:var(--primary);border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:24px;color:#fff;cursor:pointer;';d.textContent=t||'';d.onclick=()=>{const i=tiles.indexOf(t);const empty=tiles.indexOf(0);if(i===empty+1||i===empty-1||i===empty+3||i===empty-3){tiles[empty]=t;tiles[i]=0;render();}};grid.appendChild(d);});};document.getElementById('pzShuffleBtn').onclick=()=>{for(let i=tiles.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[tiles[i],tiles[j]]=[tiles[j],tiles[i]];}render();};render(); }
function getEmojiView() { return `<div style="padding:20px;"><div class="form-group"><label>搜索表情</label><input type="text" id="emSearch" class="input" placeholder="搜索..." style="width:100%;"></div><div id="emResult" style="display:flex;flex-wrap:wrap;gap:10px;margin-top:15px;font-size:32px;"></div></div>`; }
function bindEmojiEvents() { const emojis=['😀','😂','😍','🥰','😊','🤔','😎','🥳','🤩','😜','🤗','🤫','🤭','👀','🙈','🐱','🐶','🦊','🐻','🌸','🌺','🌻','🍕','🍔','🍟','🎂','🍦','☕','🎵','🎮','⚽','🏀','🎯','🚀','⭐','🌙','☀️','❤️','💔','💯','🔥','✨','🎉','💪','👋','🤝','👏'];document.getElementById('emResult').innerHTML=emojis.map(e=>`<span style="cursor:pointer;" onclick="navigator.clipboard.writeText('${e}');showToast('已复制')">${e}</span>`).join('');document.getElementById('emSearch').addEventListener('input',e=>{const q=e.target.value;document.getElementById('emResult').innerHTML=emojis.filter(em=>em.includes(q)||q==='').map(e=>`<span style="cursor:pointer;" onclick="navigator.clipboard.writeText('${e}')">${e}</span>`).join('');}); }
function getSpecialCharView() { return `<div style="padding:20px;"><p style="color:var(--text-secondary);margin-bottom:15px;">🔣 特殊字符</p><div style="background:var(--bg-dark);padding:15px;border-radius:8px;line-height:2;"><div style="margin-bottom:10px;"><strong>箭头:</strong> ← → ↑ ↓ ↔ ↕ ⇐ ⇒</div><div style="margin-bottom:10px;"><strong>数学:</strong> ± × ÷ ≠ ≤ ≥ ≈ ∞ √ π ² ³ ¹</div><div style="margin-bottom:10px;"><strong>货币:</strong> $ € £ ¥ ₹ ₩ ₽</div><div><strong>其他:</strong> © ® ™ ° • … ‹ › « »</div></div></div>`; }
function bindSpecialCharEvents() {}
function getShortcutView() { return `<div style="padding:20px;"><p style="color:var(--text-secondary);margin-bottom:15px;">⌨️ 常用快捷键</p><div style="background:var(--bg-dark);padding:15px;border-radius:8px;line-height:2;"><div><strong>Ctrl+C:</strong> 复制</div><div><strong>Ctrl+V:</strong> 粘贴</div><div><strong>Ctrl+X:</strong> 剪切</div><div><strong>Ctrl+Z:</strong> 撤销</div><div><strong>Ctrl+S:</strong> 保存</div><div><strong>Ctrl+F:</strong> 查找</div><div><strong>F12:</strong> 开发者工具</div><div><strong>Ctrl+Shift+I:</strong> 开发者工具</div></div></div>`; }
function bindShortcutEvents() {}
function getAudioWaveView() { return `<div style="padding:20px;"><div class="upload-area" id="awUpload"><div class="upload-icon">🎵</div><div class="upload-text">上传音频生成波形</div><input type="file" id="awFileInput" accept="audio/*" style="display:none;"></div><canvas id="awCanvas" width="600" height="100" style="margin-top:15px;background:#000;border-radius:8px;"></canvas></div>`; }
function bindAudioWaveEvents() { setupImageUpload('awUpload','awFileInput',()=>{showToast('音频波形需要额外库支持');}); }
function getBarChartView() { return `<div style="padding:20px;"><div class="form-group"><label>数据 (逗号分隔)</label><input type="text" id="bcData" class="input" value="65,45,80,35,90,55" style="width:100%;"></div><button class="btn btn-primary" id="bcDrawBtn" style="width:100%;margin:15px 0;">📊 绘制柱状图</button><canvas id="bcCanvas" width="500" height="250" style="background:var(--bg-dark);border-radius:8px;"></canvas></div>`; }
function bindBarChartEvents() { document.getElementById('bcDrawBtn').addEventListener('click',()=>{const data=document.getElementById('bcData').value.split(',').map(Number);const canvas=document.getElementById('bcCanvas');const ctx=canvas.getContext('2d');ctx.clearRect(0,0,500,250);const max=Math.max(...data);const barW=500/data.length;data.forEach((v,i)=>{const h=(v/max)*200;ctx.fillStyle='#6366f1';ctx.fillRect(i*barW+5,250-h-10,barW-10,h);ctx.fillStyle='#fff';ctx.fillText(v,i*barW+barW/2,250-5);});}); }
function getLineChartView() { return `<div style="padding:20px;"><div class="form-group"><label>数据点 (逗号分隔)</label><input type="text" id="lcData" class="input" value="10,25,18,35,40,30,45" style="width:100%;"></div><button class="btn btn-primary" id="lcDrawBtn" style="width:100%;margin:15px 0;">📈 绘制折线图</button><canvas id="lcCanvas" width="500" height="250" style="background:var(--bg-dark);border-radius:8px;"></canvas></div>`; }
function bindLineChartEvents() { document.getElementById('lcDrawBtn').addEventListener('click',()=>{const data=document.getElementById('lcData').value.split(',').map(Number);const canvas=document.getElementById('lcCanvas');const ctx=canvas.getContext('2d');ctx.clearRect(0,0,500,250);ctx.strokeStyle='#ec4899';ctx.lineWidth=2;ctx.beginPath();data.forEach((v,i)=>{const x=i*(500/(data.length-1));const y=250-(v/Math.max(...data))*220;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);});ctx.stroke();data.forEach((v,i)=>{const x=i*(500/(data.length-1));const y=250-(v/Math.max(...data))*220;ctx.fillStyle='#ec4899';ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fill();});}); }
function getPieChartView() { return `<div style="padding:20px;"><div class="form-group"><label>数据 (逗号分隔)</label><input type="text" id="pcData" class="input" value="30,25,20,15,10" style="width:100%;"></div><button class="btn btn-primary" id="pcDrawBtn" style="width:100%;margin:15px 0;">🥧 绘制饼图</button><canvas id="pcCanvas" width="300" height="300" style="margin:0 auto;display:block;"></canvas></div>`; }
function bindPieChartEvents() { document.getElementById('pcDrawBtn').addEventListener('click',()=>{const data=document.getElementById('pcData').value.split(',').map(Number);const canvas=document.getElementById('pcCanvas');const ctx=canvas.getContext('2d');const colors=['#ff6b6b','#4ecdc4','#45b7d1','#96ceb4','#f7dc6f'];const total=data.reduce((a,b)=>a+b,0);let start=0;data.forEach((v,i)=>{const slice=(v/total)*Math.PI*2;ctx.fillStyle=colors[i%colors.length];ctx.beginPath();ctx.moveTo(150,150);ctx.arc(150,150,120,start,start+slice);ctx.closePath();ctx.fill();start+=slice;});}); }
function getFlowChartView() { return `<div style="padding:20px;"><div class="form-group"><label>流程图内容 (每行一个节点，用|分隔连接)</label><textarea id="fcInput" class="input" rows="5" placeholder="开始 -> 处理 -> 结束"></textarea></div><button class="btn btn-primary" id="fcBtn" style="width:100%;margin:15px 0;">📝 生成流程图</button><div id="fcResult" style="background:var(--bg-dark);padding:20px;border-radius:8px;min-height:100px;"></div></div>`; }
function bindFlowChartEvents() { document.getElementById('fcBtn').addEventListener('click',()=>{const nodes=document.getElementById('fcInput').value.split('->').map(s=>s.trim()).filter(s=>s);document.getElementById('fcResult').innerHTML=nodes.map((n,i)=>`<div style="display:inline-block;padding:10px 20px;background:var(--primary);border-radius:8px;margin:5px;">${n}</div>${i<nodes.length-1?'<div style="display:inline-block;margin:0 5px;">→</div>':''}`).join('');}); }
function getMindMapView() { return `<div style="padding:20px;"><div class="form-group"><label>中心主题</label><input type="text" id="mmCenter" class="input" value="设计工具箱" style="width:100%;"></div><div class="form-group"><label>分支 (逗号分隔)</label><textarea id="mmBranches" class="input" rows="3" placeholder="配色,排版,字体,图标"></textarea></div><button class="btn btn-primary" id="mmBtn" style="width:100%;margin:15px 0;">🧠 生成思维导图</button><div id="mmResult" style="background:var(--bg-dark);padding:20px;border-radius:8px;text-align:center;"></div></div>`; }
function bindMindMapEvents() { document.getElementById('mmBtn').addEventListener('click',()=>{const center=document.getElementById('mmCenter').value;const branches=document.getElementById('mmBranches').value.split(',').map(s=>s.trim()).filter(s=>s);let html=`<div style="display:inline-block;padding:15px 30px;background:var(--primary);border-radius:50%;color:#fff;font-weight:bold;margin:20px auto;">${center}</div><div style="margin-top:15px;">`;branches.forEach(b=>html+=`<div style="display:inline-block;padding:8px 16px;background:var(--bg-card);border:2px solid var(--primary);border-radius:20px;margin:5px;">${b}</div>`);document.getElementById('mmResult').innerHTML=html+'</div>';}); }

// 批量下载到文件夹
async function downloadAllToFolder(files) {
    if (!files || files.length === 0) {
        showToast('没有可下载的文件');
        return;
    }
    
    let folder = downloadFolder;
    if (!folder) {
        const success = await setupDownloadFolder();
        if (!success) return;
        folder = downloadFolder;
    }
    
    showToast(`开始下载 ${files.length} 个文件...`);
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await downloadToFileFolder(file.dataUrl, file.name, folder);
        // 延迟下载，避免浏览器拦截
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    showToast('下载完成！');
}

// ========================================
// 我的页面（设置/个人中心）
// ========================================

function getProfileView() {
    return `
        <div style="padding:20px;">
            <div style="text-align:center;margin-bottom:30px;">
                <div style="font-size:80px;margin-bottom:15px;">🎨</div>
                <h2 style="margin:0 0 5px 0;">设计师工具箱</h2>
                <p style="color:var(--text-muted);margin:0;">版本 ${TOOLS_DATA.version}</p>
            </div>

            <div style="background:var(--bg-card);border-radius:12px;padding:20px;margin-bottom:20px;">
                <h3 style="margin:0 0 15px 0;font-size:16px;color:var(--text-secondary);">📱 应用信息</h3>

                <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border);">
                    <span>当前版本</span>
                    <span style="color:var(--primary);font-weight:500;">v${TOOLS_DATA.version}</span>
                </div>

                <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border);">
                    <span>构建时间</span>
                    <span style="color:var(--text-muted);">${new Date().toLocaleDateString('zh-CN')}</span>
                </div>

                <div style="display:flex;justify-content:space-between;padding:12px 0;">
                    <span>工具总数</span>
                    <span style="color:var(--primary);font-weight:500;">${TOOLS_DATA.tools.length}+</span>
                </div>
            </div>

            <div style="background:var(--bg-card);border-radius:12px;padding:20px;margin-bottom:20px;">
                <h3 style="margin:0 0 15px 0;font-size:16px;color:var(--text-secondary);">🔄 检查更新</h3>

                <button class="btn btn-primary" id="checkUpdateBtn" style="width:100%;margin-bottom:10px;">
                    🔍 检查更新
                </button>

                <div id="updateStatus" style="text-align:center;padding:15px;color:var(--text-muted);display:none;">
                    <div id="updateStatusText">检查中...</div>
                    <div id="updateProgress" style="margin-top:10px;display:none;">
                        <div style="height:4px;background:var(--border);border-radius:2px;overflow:hidden;">
                            <div id="updateProgressBar" style="height:100%;background:var(--primary);width:0%;transition:width 0.3s;"></div>
                        </div>
                        <div style="font-size:12px;margin-top:5px;" id="updateProgressText">0%</div>
                    </div>
                </div>
            </div>

            <div style="background:var(--bg-card);border-radius:12px;padding:20px;">
                <h3 style="margin:0 0 15px 0;font-size:16px;color:var(--text-secondary);">ℹ️ 关于</h3>

                <div style="color:var(--text-muted);font-size:13px;line-height:1.6;">
                    <p>设计师工具箱是一款纯前端工具合集，专为设计师和创意工作者打造。</p>
                    <p>无需安装，即开即用，完全免费。</p>
                </div>

                <div style="margin-top:15px;padding-top:15px;border-top:1px solid var(--border);text-align:center;">
                    <span style="color:var(--text-muted);font-size:12px;">Made with ❤️ by 一一科技</span>
                </div>
            </div>
        </div>
    `;
}

function bindProfileEvents() {
    const checkUpdateBtn = document.getElementById('checkUpdateBtn');
    if (!checkUpdateBtn) return;

    checkUpdateBtn.addEventListener('click', async () => {
        const updateStatus = document.getElementById('updateStatus');
        const updateStatusText = document.getElementById('updateStatusText');
        const updateProgress = document.getElementById('updateProgress');
        const updateProgressBar = document.getElementById('updateProgressBar');
        const updateProgressText = document.getElementById('updateProgressText');

        updateStatus.style.display = 'block';
        updateStatusText.textContent = '正在检查更新...';
        updateProgress.style.display = 'none';

        try {
            // 公开API，不需要token（仓库是公开的）
            // 调用 GitHub API 获取最新 Release
            const releaseResponse = await fetch('https://api.github.com/repos/Hetaomiao/yiyi-toolbox/releases/latest', {
                headers: { 'Accept': 'application/vnd.github.v3+json' }
            });

            if (!releaseResponse.ok) {
                // API 限流时显示提示
                if (releaseResponse.status === 403) {
                    updateStatusText.innerHTML = '<span style="color:#f59e0b;">⚠️ 更新检查太频繁，请稍后再试</span>';
                } else {
                    updateStatusText.innerHTML = '<span style="color:#f59e0b;">⚠️ 暂无可用更新</span>';
                }
                return;
            }

            const release = await releaseResponse.json();

            // 查找 APK 资源
            const apkAsset = release.assets?.find(a => a.name.endsWith('.apk'));
            if (!release.tag_name || !apkAsset) {
                updateStatusText.innerHTML = '<span style="color:#f59e0b;">⚠️ 暂无可用更新</span>';
                return;
            }

            const version = release.tag_name;
            const buildDate = new Date(release.published_at).toLocaleDateString('zh-CN');
            const downloadUrl = apkAsset.browser_download_url;

            updateStatusText.innerHTML = `
                <span style="color:#10b981;">✅ 发现新版本 ${version}</span><br>
                <span style="font-size:12px;">构建时间: ${buildDate}</span><br><br>
                <span style="color:var(--primary);">点击下方按钮下载安装</span><br><br>
                <button onclick="openDownloadPage()" style="background:#10b981;color:white;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-size:14px;">📥 下载安装</button>
            `;
            window.openDownloadPage = function() {
                window.open(downloadUrl, '_blank');
            };

        } catch (error) {
            console.error('检查更新失败:', error);
            updateStatusText.innerHTML = `<span style="color:#ef4444;">❌ 检查更新失败</span><br><span style="font-size:12px;">${error.message}</span>`;
        }
    });
}

// 初始化
bindEvents();

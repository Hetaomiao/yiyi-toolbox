// ========================================
// 设计师工具箱 - 工具数据
// ========================================

const TOOLS_DATA = {
    // 版本号
    version: '1.0.6',

    // 分类定义
    categories: [
        { id: 'image', name: '🖼️ 图片处理', icon: '🖼️', count: 26 },
        { id: 'color', name: '🎨 配色工具', icon: '🎨', count: 12 },
        { id: 'guide', name: '📍 导视设计', icon: '📍', count: 6 },
        { id: 'size', name: '📐 尺寸计算', icon: '📐', count: 10 },
        { id: 'text', name: '✏️ 文字字体', icon: '✏️', count: 8 },
        { id: 'code', name: '💻 代码工具', icon: '💻', count: 15 },
        { id: 'qrcode', name: '🔳 二维码', icon: '🔳', count: 5 },
        { id: 'security', name: '🔐 密码安全', icon: '🔐', count: 6 },
        { id: 'daily', name: '🗓️ 日常工具', icon: '🗓️', count: 15 },
        { id: 'dev', name: '🛠️ 开发工具', icon: '🛠️', count: 10 },
        { id: 'chart', name: '📊 图表生成', icon: '📊', count: 5 },
        { id: 'game', name: '🎮 趣味工具', icon: '🎮', count: 5 },
        { id: 'other', name: '📱 其他工具', icon: '📱', count: 10 },
        { id: 'me', name: '👤 我的', icon: '👤', count: 0 }
    ],

    // 工具列表
    tools: [
        // ==================== 图片处理区 ====================
        { id: 'img-compress', category: 'image', name: '图片压缩', icon: '🗜️', desc: '一键压缩图片体积' },
        { id: 'img-format', category: 'image', name: '格式转换', icon: '🔄', desc: 'PNG/JPG/WebP互转' },
        { id: 'img-crop', category: 'image', name: '图片裁剪', icon: '✂️', desc: '任意尺寸裁剪' },
        { id: 'img-mark', category: 'image', name: '图片标记', icon: '🖊️', desc: '标注箭头文字' },
        { id: 'img-watermark', category: 'image', name: '图片水印', icon: '💧', desc: '文字图片水印' },
        { id: 'img-grid9', category: 'image', name: '九宫格切割', icon: '🟦', desc: '朋友圈九宫格' },
        { id: 'img-merge', category: 'image', name: '图片拼接', icon: '➕', desc: '横竖长图拼接' },
        { id: 'img-adjust', category: 'image', name: '图片调色', icon: '🎚️', desc: '亮度对比度饱和度' },
        { id: 'img-blur', category: 'image', name: '图片模糊', icon: '🌫️', desc: '背景虚化效果' },
        { id: 'img-rotate', category: 'image', name: '图片翻转', icon: '🔃', desc: '旋转翻转图片' },
        { id: 'img-radius', category: 'image', name: '图片圆角', icon: '📐', desc: '添加圆角效果' },
        { id: 'img-border', category: 'image', name: '图片边框', icon: '🖼️', desc: '添加边框装饰' },
        { id: 'img-canon-watermark', category: 'image', name: '佳能水印', icon: '📷', desc: '添加佳能相机参数水印' },
        { id: 'img-picker', category: 'image', name: '屏幕取色', icon: '💉', desc: '吸取图片颜色' },
        { id: 'img-gif', category: 'image', name: 'GIF预览', icon: '🎞️', desc: 'GIF播放控制' },
        { id: 'img-invert', category: 'image', name: '图片反转色', icon: '🔄', desc: '颜色反转效果' },
        { id: 'img-monochrome', category: 'image', name: '图片单色', icon: '🎭', desc: '单色提取效果' },
        { id: 'img-mosaic', category: 'image', name: '马赛克', icon: '🔲', desc: '像素化模糊' },
        { id: 'img-oilpaint', category: 'image', name: '油画效果', icon: '🖼️', desc: '油画滤镜' },
        { id: 'img-magnifier', category: 'image', name: '放大镜', icon: '🔍', desc: '放大查看细节' },
        { id: 'img-trace', category: 'image', name: '临摹幕布', icon: '✏️', desc: '对着图片描线' },
        { id: 'img-scale', category: 'image', name: '等比缩放', icon: '📏', desc: '保持比例缩放' },
        { id: 'img-viewer', category: 'image', name: '图片查看器', icon: '🖼️', desc: '浏览图片文件' },
        { id: 'img-exif', category: 'image', name: 'EXIF查看', icon: '📷', desc: '读取图片信息' },
        { id: 'img-histogram', category: 'image', name: '直方图', icon: '📊', desc: '颜色分布统计' },
        { id: 'img-resize', category: 'image', name: '批量改尺寸', icon: '📐', desc: '批量调整大小' },

        // ==================== 配色工具 ====================
        { id: 'color-extract', category: 'color', name: '配色提取', icon: '🎨', desc: '从图片提取配色' },

        // ==================== 导视设计（新增核心工具）====================
        { id: 'viewdist-calc', category: 'guide', name: '视距字号换算', icon: '📏', desc: 'GB公式视距计算' },
        { id: 'braille-gen', category: 'guide', name: '盲文点位生成', icon: '🔵', desc: '无障碍盲文点位' },
        { id: 'structure-calc', category: 'guide', name: '结构速算', icon: '🏗️', desc: '标识结构计算' },
        { id: 'led-layout', category: 'guide', name: 'LED排布计算', icon: '💡', desc: '发光字LED排布' },
        { id: 'matting', category: 'guide', name: '一键抠图', icon: '✂️', desc: '纯色背景抠图' },
        { id: 'batch-img', category: 'guide', name: '批量图片处理', icon: '🖼️', desc: '批量缩放转换' },
        { id: 'color-convert', category: 'color', name: '色值转换', icon: '🔄', desc: 'HEX/RGB/HSL互转' },
        { id: 'color-gradient', category: 'color', name: '渐变生成', icon: '🌈', desc: 'CSS渐变代码' },
        { id: 'color-palette', category: 'color', name: '调色板', icon: '🎨', desc: '互补邻近色' },
        { id: 'color-contrast', category: 'color', name: '对比度检查', icon: '⚖️', desc: 'WCAG合规检测' },
        { id: 'color-blind', category: 'color', name: '色盲模拟', icon: '👁️', desc: '模拟色盲视角' },
        { id: 'color-random', category: 'color', name: '随机配色', icon: '🎲', desc: '随机生成配色' },
        { id: 'color-export', category: 'color', name: '配色导出', icon: '📤', desc: 'Sass/Less变量' },
        { id: 'color-wheel', category: 'color', name: '调色轮', icon: '🎡', desc: '色轮选色工具' },
        { id: 'color-pantone', category: 'color', name: '潘通色卡', icon: '🏷️', desc: '标准色卡查询' },
        { id: 'color-gradients', category: 'color', name: '渐变调色板', icon: '🌈', desc: '预设渐变集合' },
        { id: 'color-history', category: 'color', name: '颜色历史', icon: '📜', desc: '最近使用颜色' },

        // ==================== 尺寸计算 ====================
        { id: 'dpi-calc', category: 'size', name: 'DPI计算器', icon: '📏', desc: '像素物理尺寸换算' },
        { id: 'ratio-calc', category: 'size', name: '比例计算', icon: '⚖️', desc: '16:9/4:3比例' },
        { id: 'size-ref', category: 'size', name: '设计尺寸参照', icon: '📐', desc: '设备尺寸对照' },
        { id: 'spacing-calc', category: 'size', name: '间距计算', icon: '📐', desc: '8px网格系统' },
        { id: 'size-font-preview', category: 'size', name: '字号预览', icon: '🔤', desc: '各设备字号' },
        { id: 'px-convert', category: 'size', name: '单位转换', icon: '🔄', desc: 'px/em/rem/%' },
        { id: 'mm-px', category: 'size', name: 'mm/cm换算', icon: '📏', desc: '毫米像素互换' },
        { id: 'device-ref', category: 'size', name: '设备对照', icon: '📱', desc: 'iPhone全系尺寸' },
        { id: 'retina', category: 'size', name: 'Retina图', icon: '🖼️', desc: '@2x/@3x图' },
        { id: 'golden-ratio', category: 'size', name: '黄金比例', icon: 'φ', desc: '黄金分割计算' },

        // ==================== 文字字体 ====================
        { id: 'text-art', category: 'text', name: '艺术字', icon: '✨', desc: '特效字体生成' },
        { id: 'text-path', category: 'text', name: '路径文字', icon: '�弧', desc: '沿弧形排布' },
        { id: 'text-cloud', category: 'text', name: '文字云', icon: '☁️', desc: '词云图生成' },
        { id: 'font-preview', category: 'text', name: '字体预览', icon: '🔤', desc: '字体效果预览' },
        { id: 'font-weight', category: 'text', name: '字重对照', icon: '⚖️', desc: '字重级别参考' },
        { id: 'char-count', category: 'text', name: '字符统计', icon: '🔢', desc: '字数字符统计' },
        { id: 'keyword-extract', category: 'text', name: '关键词提取', icon: '🔑', desc: '文本关键词' },
        { id: 'sensitive-check', category: 'text', name: '敏感词检测', icon: '⚠️', desc: '检测敏感词' },

        // ==================== 代码工具 ====================
        { id: 'img-base64', category: 'code', name: '图片Base64', icon: '🖼️', desc: '图片转DataURI' },
        { id: 'json-format', category: 'code', name: 'JSON格式化', icon: '{ }', desc: '美化校验JSON' },
        { id: 'url-encode', category: 'code', name: 'URL编码', icon: '🔗', desc: 'URL参数编码' },
        { id: 'base64-encode', category: 'code', name: 'Base64编解码', icon: '🔤', desc: 'Base64转换' },
        { id: 'html-encode', category: 'code', name: 'HTML实体', icon: '⟨⟩', desc: 'HTML实体编码' },
        { id: 'regex-test', category: 'code', name: '正则测试', icon: '.*', desc: '正则表达式' },
        { id: 'css-gen', category: 'code', name: 'CSS生成', icon: '🎨', desc: '阴影圆角渐变' },
        { id: 'code-beautify', category: 'code', name: '代码美化', icon: '✨', desc: '格式化代码' },
        { id: 'markdown', category: 'code', name: 'Markdown预览', icon: '📝', desc: 'MD转HTML' },
        { id: 'sql-format', category: 'code', name: 'SQL格式化', icon: '🗃️', desc: 'SQL美化' },
        { id: 'xml-format', category: 'code', name: 'XML格式化', icon: '📄', desc: 'XML美化' },
        { id: 'regex-viz', category: 'code', name: '正则可视化', icon: '🔮', desc: '正则图形化' },
        { id: 'jwt-decode', category: 'code', name: 'JWT解码', icon: '🎫', desc: '解析JWT' },
        { id: 'cron-parse', category: 'code', name: 'Cron解析', icon: '⏰', desc: '定时任务' },
        { id: 'diff', category: 'code', name: '代码差异', icon: '⚖️', desc: '对比两段代码' },

        // ==================== 二维码 ====================
        { id: 'qr-gen', category: 'qrcode', name: '二维码生成', icon: '📮', desc: '普通二维码' },
        { id: 'qr-parse', category: 'qrcode', name: '二维码解析', icon: '📷', desc: '解析二维码' },
        { id: 'barcode-gen', category: 'qrcode', name: '条形码生成', icon: '📊', desc: 'Code128' },
        { id: 'captcha', category: 'qrcode', name: '验证码', icon: '🔐', desc: '图片验证码' },
        { id: 'qr-beautify', category: 'qrcode', name: '二维码美化', icon: '🎨', desc: 'Logo颜色' },

        // ==================== 密码安全 ====================
        { id: 'pwd-gen', category: 'security', name: '密码生成', icon: '🔑', desc: '随机强密码' },
        { id: 'pwd-strength', category: 'security', name: '密码强度', icon: '💪', desc: '安全度检测' },
        { id: 'uuid-gen', category: 'security', name: 'UUID生成', icon: '🎲', desc: '唯一ID' },
        { id: 'hash-gen', category: 'security', name: '哈希计算', icon: '#', desc: 'MD5/SHA' },
        { id: 'random-str', category: 'security', name: '随机字符串', icon: '🎲', desc: '自定义字符' },
        { id: 'key-gen', category: 'security', name: '密钥生成', icon: '🔐', desc: '加密密钥' },

        // ==================== 日常工具 ====================
        { id: 'pomodoro', category: 'daily', name: '番茄钟', icon: '🍅', desc: '专注计时' },
        { id: 'countdown', category: 'daily', name: '倒计时', icon: '⏳', desc: '重要事件' },
        { id: 'timer', category: 'daily', name: '计时器', icon: '⏱️', desc: '秒表计时' },
        { id: 'world-clock', category: 'daily', name: '世界时钟', icon: '🌍', desc: '多时区' },
        { id: 'timezone', category: 'daily', name: '时区转换', icon: '🔄', desc: '时区换算' },
        { id: 'date-calc', category: 'daily', name: '日期计算', icon: '📅', desc: '日期差天数' },
        { id: 'timestamp', category: 'daily', name: '时间戳', icon: '🕐', desc: '互转工具' },
        { id: 'random-pick', category: 'daily', name: '随机抽签', icon: '🎴', desc: '抽签选择' },
        { id: 'random-wheel', category: 'daily', name: '随机转盘', icon: '🎡', desc: '转盘抽奖' },
        { id: 'random-lottery', category: 'daily', name: '随机摇号', icon: '🎲', desc: '摇号抽奖' },
        { id: 'rps', category: 'daily', name: '石头剪刀布', icon: '✊', desc: '猜拳游戏' },
        { id: 'coin', category: 'daily', name: '抛硬币', icon: '🪙', desc: '正反面' },
        { id: 'dice', category: 'daily', name: '掷骰子', icon: '🎲', desc: '1-6随机' },
        { id: 'lucky-wheel', category: 'daily', name: '大转盘', icon: '🎰', desc: '幸运抽奖' },
        { id: 'lottery-num', category: 'daily', name: '彩票号码', icon: '🎫', desc: '随机号码' },

        // ==================== 开发工具 ====================
        { id: 'ua-parse', category: 'dev', name: 'UA解析', icon: '🌐', desc: 'UserAgent' },
        { id: 'browser-info', category: 'dev', name: '浏览器信息', icon: '🔍', desc: '浏览器检测' },
        { id: 'screen-size', category: 'dev', name: '屏幕尺寸', icon: '📺', desc: '分辨率检测' },
        { id: 'pixel-density', category: 'dev', name: '像素密度', icon: '📱', desc: 'DPI/PPI' },
        { id: 'zh-convert', category: 'dev', name: '繁简转换', icon: '繁', desc: '简体繁体' },
        { id: 'punctuation', category: 'dev', name: '标点转换', icon: '，。', desc: '全角半角' },
        { id: 'base-convert', category: 'dev', name: '进制转换', icon: '🔢', desc: '2/8/10/16' },
        { id: 'formula', category: 'dev', name: '物理公式', icon: '📐', desc: '公式计算' },
        { id: 'unpack', category: 'dev', name: '解压缩', icon: '📦', desc: '查看压缩包' },
        { id: 'hash-file', category: 'dev', name: '文件哈希', icon: '#', desc: 'MD5/SHA' },

        // ==================== 图表生成 ====================
        { id: 'mind-map', category: 'chart', name: '思维导图', icon: '🧠', desc: '简易导图' },
        { id: 'flow-chart', category: 'chart', name: '流程图', icon: '📊', desc: '流程图' },
        { id: 'bar-chart', category: 'chart', name: '柱状图', icon: '📊', desc: '柱形图生成' },
        { id: 'pie-chart', category: 'chart', name: '饼图', icon: '🥧', desc: '饼图生成' },
        { id: 'line-chart', category: 'chart', name: '折线图', icon: '📈', desc: '趋势图' },

        // ==================== 趣味工具 ====================
        { id: 'keyboard-test', category: 'game', name: '键盘测试', icon: '⌨️', desc: '测试键盘' },
        { id: 'mouse-test', category: 'game', name: '鼠标测试', icon: '🖱️', desc: '测试鼠标' },
        { id: 'color-game', category: 'game', name: '颜色认知', icon: '🎨', desc: '辨色游戏' },
        { id: 'typing-test', category: 'game', name: '打字速度', icon: '⌨️', desc: '测打字' },
        { id: 'puzzle', category: 'game', name: '拼图游戏', icon: '🧩', desc: '趣味拼图' },

        // ==================== 其他工具 ====================
        { id: 'qr-watermark', category: 'other', name: '二维码水印', icon: '📮', desc: '图片添二维码' },
        { id: 'unit-convert', category: 'other', name: '单位换算', icon: '🔄', desc: '长度重量' },
        { id: 'exchange-rate', category: 'other', name: '汇率计算', icon: '💱', desc: '货币换算' },
        { id: 'bmi-calc', category: 'other', name: 'BMI计算', icon: '⚖️', desc: '体质指数' },
        { id: 'shortcut', category: 'other', name: '快捷键', icon: '⌨️', desc: '常用快捷键' },
        { id: 'audio-wave', category: 'other', name: '音频波形', icon: '🎵', desc: '波形可视化' },
        { id: 'color-palette2', category: 'other', name: '调色板', icon: '🎨', desc: '颜色记录' },
        { id: 'color-mixer', category: 'other', name: '调色器', icon: '🎨', desc: '混合颜色' },
        { id: 'emoji', category: 'other', name: 'Emoji查询', icon: '😊', desc: '表情符号' },
        { id: 'special-char', category: 'other', name: '特殊字符', icon: '✱', desc: '特殊符号' }
    ]
};

// 工具函数
const ToolUtils = {
    // 根据分类获取工具
    getToolsByCategory: function(categoryId) {
        return TOOLS_DATA.tools.filter(t => t.category === categoryId);
    },

    // 根据ID获取工具
    getToolById: function(toolId) {
        return TOOLS_DATA.tools.find(t => t.id === toolId);
    },

    // 搜索工具
    searchTools: function(query) {
        const q = query.toLowerCase();
        return TOOLS_DATA.tools.filter(t => 
            t.name.toLowerCase().includes(q) || 
            t.desc.toLowerCase().includes(q)
        );
    },

    // 获取分类信息
    getCategoryById: function(categoryId) {
        return TOOLS_DATA.categories.find(c => c.id === categoryId);
    }
};

// 导出
window.TOOLS_DATA = TOOLS_DATA;
window.ToolUtils = ToolUtils;

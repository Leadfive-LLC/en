/**
 * HeatmapGenerator - クリック密度とスクロール到達率を可視化するヒートマップ生成機能
 * Canvas APIを使用してヒートマップを描画する
 */
class HeatmapGenerator {
  constructor(container) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.canvas = null;
    this.ctx = null;
    this.data = null;
    this.config = {
      radius: 20,
      blur: 15,
      maxOpacity: 0.6,
      gradient: {
        0.0: 'rgba(0, 0, 255, 0)',
        0.2: 'rgba(0, 0, 255, 0.2)',
        0.4: 'rgba(0, 255, 0, 0.4)',
        0.6: 'rgba(255, 255, 0, 0.6)',
        0.8: 'rgba(255, 128, 0, 0.8)',
        1.0: 'rgba(255, 0, 0, 1)'
      }
    };
    
    this.initialize();
  }

  /**
   * ヒートマップの初期化
   */
  initialize() {
    // キャンバスの作成
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'heatmap-canvas';
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '9999';
    this.ctx = this.canvas.getContext('2d');
    
    // ウィンドウサイズに合わせてキャンバスサイズを調整
    this.resizeCanvas();
    
    // リサイズイベントの登録
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  /**
   * キャンバスのリサイズ
   */
  resizeCanvas() {
    const width = document.documentElement.scrollWidth;
    const height = document.documentElement.scrollHeight;
    
    this.canvas.width = width;
    this.canvas.height = height;
    
    // ヒートマップデータがある場合は再描画
    if (this.data) {
      this.render();
    }
  }

  /**
   * クリックヒートマップの生成
   */
  generateClickHeatmap(timeRange = null) {
    // 分析データの取得
    const heatmapData = window.enAnalytics?.generateHeatmapData(timeRange) || { clicks: [] };
    this.data = heatmapData.clicks;
    
    // ヒートマップの描画
    this.render();
    
    // キャンバスをDOMに追加
    if (!document.body.contains(this.canvas)) {
      document.body.appendChild(this.canvas);
    }
  }

  /**
   * スクロールヒートマップの生成
   */
  generateScrollHeatmap(timeRange = null) {
    const heatmapData = window.enAnalytics?.generateHeatmapData(timeRange) || { scrollDepths: {} };
    
    // スクロール深度データを可視化用のポイントに変換
    const scrollPoints = [];
    const documentHeight = document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;
    
    Object.entries(heatmapData.scrollDepths).forEach(([depth, count]) => {
      const y = (documentHeight - viewportHeight) * (parseInt(depth) / 100) + viewportHeight / 2;
      
      // 横一列に分布させる
      for (let i = 0; i < count; i++) {
        scrollPoints.push({
          x: Math.random() * window.innerWidth,
          y: y,
          intensity: 1
        });
      }
    });
    
    this.data = scrollPoints;
    this.render();
    
    if (!document.body.contains(this.canvas)) {
      document.body.appendChild(this.canvas);
    }
  }

  /**
   * ヒートマップの描画
   */
  render() {
    // キャンバスをクリア
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    if (!this.data || this.data.length === 0) {
      return;
    }
    
    // 一時的なキャンバスを作成（グレースケール用）
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    // データポイントを描画
    this.data.forEach(point => {
      const intensity = point.intensity || 1;
      const radius = this.config.radius;
      
      // 放射状グラデーションを作成
      const gradient = tempCtx.createRadialGradient(
        point.x, point.y, 0,
        point.x, point.y, radius
      );
      
      gradient.addColorStop(0, `rgba(0, 0, 0, ${intensity})`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      tempCtx.fillStyle = gradient;
      tempCtx.fillRect(
        point.x - radius,
        point.y - radius,
        radius * 2,
        radius * 2
      );
    });
    
    // グレースケールデータを取得
    const imageData = tempCtx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    
    // カラーマップを適用
    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      
      if (alpha > 0) {
        const color = this.getColorForValue(alpha / 255);
        data[i] = color.r;
        data[i + 1] = color.g;
        data[i + 2] = color.b;
        data[i + 3] = alpha * this.config.maxOpacity;
      }
    }
    
    // 最終的な画像をメインキャンバスに描画
    this.ctx.putImageData(imageData, 0, 0);
  }

  /**
   * 値に対応する色を取得
   */
  getColorForValue(value) {
    const gradient = this.config.gradient;
    const keys = Object.keys(gradient).map(parseFloat).sort((a, b) => a - b);
    
    // 値に最も近い2つのキーを見つける
    let lowerKey = keys[0];
    let upperKey = keys[keys.length - 1];
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (value >= keys[i] && value <= keys[i + 1]) {
        lowerKey = keys[i];
        upperKey = keys[i + 1];
        break;
      }
    }
    
    // 色を補間
    const lowerColor = this.parseColor(gradient[lowerKey]);
    const upperColor = this.parseColor(gradient[upperKey]);
    
    const ratio = (value - lowerKey) / (upperKey - lowerKey);
    
    return {
      r: Math.round(lowerColor.r + (upperColor.r - lowerColor.r) * ratio),
      g: Math.round(lowerColor.g + (upperColor.g - lowerColor.g) * ratio),
      b: Math.round(lowerColor.b + (upperColor.b - lowerColor.b) * ratio)
    };
  }

  /**
   * RGBA文字列を解析
   */
  parseColor(colorString) {
    const match = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    return {
      r: parseInt(match[1]),
      g: parseInt(match[2]),
      b: parseInt(match[3])
    };
  }

  /**
   * ヒートマップを表示
   */
  show() {
    this.canvas.style.display = 'block';
  }

  /**
   * ヒートマップを非表示
   */
  hide() {
    this.canvas.style.display = 'none';
  }

  /**
   * ヒートマップを削除
   */
  destroy() {
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    window.removeEventListener('resize', () => this.resizeCanvas());
  }

  /**
   * ヒートマップデータをエクスポート
   */
  exportData() {
    return {
      type: 'heatmap',
      timestamp: Date.now(),
      dimensions: {
        width: this.canvas.width,
        height: this.canvas.height
      },
      data: this.data,
      config: this.config
    };
  }
}

/**
 * ヒートマップコントロールパネル
 */
class HeatmapControl {
  constructor() {
    this.heatmapGenerator = null;
    this.controlPanel = null;
    this.isVisible = false;
    
    this.createControlPanel();
  }

  /**
   * コントロールパネルの作成
   */
  createControlPanel() {
    // コントロールパネルのHTML
    const panelHTML = `
      <div id="heatmap-control" style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 10000;
        font-family: Arial, sans-serif;
        display: none;
      ">
        <h3 style="margin: 0 0 15px 0; font-size: 18px;">ヒートマップコントロール</h3>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-size: 14px;">表示タイプ:</label>
          <select id="heatmap-type" style="width: 100%; padding: 5px; border: 1px solid #ddd; border-radius: 4px;">
            <option value="click">クリックヒートマップ</option>
            <option value="scroll">スクロールヒートマップ</option>
          </select>
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-size: 14px;">期間:</label>
          <select id="heatmap-range" style="width: 100%; padding: 5px; border: 1px solid #ddd; border-radius: 4px;">
            <option value="all">全期間</option>
            <option value="today">今日</option>
            <option value="week">過去7日間</option>
            <option value="month">過去30日間</option>
          </select>
        </div>
        
        <div style="display: flex; gap: 10px;">
          <button id="heatmap-generate" style="
            flex: 1;
            padding: 8px 16px;
            background: #8B4513;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
          ">生成</button>
          
          <button id="heatmap-clear" style="
            flex: 1;
            padding: 8px 16px;
            background: #666;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
          ">クリア</button>
        </div>
        
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
          <button id="heatmap-close" style="
            width: 100%;
            padding: 8px 16px;
            background: #f5f5f5;
            color: #333;
            border: 1px solid #ddd;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
          ">閉じる</button>
        </div>
      </div>
      
      <button id="heatmap-toggle" style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        background: #8B4513;
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 9999;
        font-size: 24px;
      " title="ヒートマップコントロール">
        🔥
      </button>
    `;
    
    // DOMに追加
    const div = document.createElement('div');
    div.innerHTML = panelHTML;
    document.body.appendChild(div);
    
    this.controlPanel = document.getElementById('heatmap-control');
    
    // イベントリスナーの設定
    this.setupEventListeners();
  }

  /**
   * イベントリスナーの設定
   */
  setupEventListeners() {
    // トグルボタン
    document.getElementById('heatmap-toggle').addEventListener('click', () => {
      this.togglePanel();
    });
    
    // 閉じるボタン
    document.getElementById('heatmap-close').addEventListener('click', () => {
      this.hidePanel();
    });
    
    // 生成ボタン
    document.getElementById('heatmap-generate').addEventListener('click', () => {
      this.generateHeatmap();
    });
    
    // クリアボタン
    document.getElementById('heatmap-clear').addEventListener('click', () => {
      this.clearHeatmap();
    });
  }

  /**
   * パネルの表示切替
   */
  togglePanel() {
    this.isVisible = !this.isVisible;
    this.controlPanel.style.display = this.isVisible ? 'block' : 'none';
  }

  /**
   * パネルを非表示
   */
  hidePanel() {
    this.isVisible = false;
    this.controlPanel.style.display = 'none';
  }

  /**
   * ヒートマップの生成
   */
  generateHeatmap() {
    const type = document.getElementById('heatmap-type').value;
    const range = document.getElementById('heatmap-range').value;
    
    // 期間の計算
    let timeRange = null;
    if (range !== 'all') {
      const now = Date.now();
      const ranges = {
        today: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000
      };
      
      timeRange = {
        start: now - ranges[range],
        end: now
      };
    }
    
    // ヒートマップジェネレーターの初期化
    if (!this.heatmapGenerator) {
      this.heatmapGenerator = new HeatmapGenerator(document.body);
    }
    
    // ヒートマップの生成
    if (type === 'click') {
      this.heatmapGenerator.generateClickHeatmap(timeRange);
    } else if (type === 'scroll') {
      this.heatmapGenerator.generateScrollHeatmap(timeRange);
    }
    
    console.log(`${type}ヒートマップを生成しました (期間: ${range})`);
  }

  /**
   * ヒートマップのクリア
   */
  clearHeatmap() {
    if (this.heatmapGenerator) {
      this.heatmapGenerator.destroy();
      this.heatmapGenerator = null;
    }
    console.log('ヒートマップをクリアしました');
  }
}

// ヒートマップコントロールの初期化
document.addEventListener('DOMContentLoaded', () => {
  // 管理者モードの場合のみヒートマップコントロールを表示
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('admin') === 'true' || localStorage.getItem('en_admin_mode') === 'true') {
    window.heatmapControl = new HeatmapControl();
    console.log('ヒートマップコントロール初期化完了');
  }
});
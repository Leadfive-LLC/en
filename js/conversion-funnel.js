/**
 * ConversionFunnel - コンバージョンファネル分析機能
 * ユーザーの行動フローを追跡し、離脱ポイントを特定する
 */
class ConversionFunnel {
  constructor() {
    this.funnelSteps = [
      { id: 'landing', name: 'ランディングページ訪問', icon: '🏠' },
      { id: 'scroll50', name: 'ページを50%スクロール', icon: '📜' },
      { id: 'clickCTA', name: 'CTAボタンクリック', icon: '👆' },
      { id: 'formStart', name: 'フォーム入力開始', icon: '✏️' },
      { id: 'formSubmit', name: 'フォーム送信完了', icon: '✅' }
    ];
    
    this.dashboard = null;
    this.chart = null;
  }

  /**
   * ファネル分析ダッシュボードの作成
   */
  createDashboard() {
    // ダッシュボードHTML
    const dashboardHTML = `
      <div id="funnel-dashboard" style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border: 1px solid #ddd;
        border-radius: 12px;
        padding: 30px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        z-index: 10001;
        width: 90%;
        max-width: 800px;
        max-height: 90vh;
        overflow-y: auto;
        display: none;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 24px; color: #333;">コンバージョンファネル分析</h2>
          <button id="funnel-close" style="
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #666;
          ">×</button>
        </div>
        
        <div id="funnel-stats" style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-bottom: 30px;
        ">
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 32px; font-weight: bold; color: #8B4513;" id="total-sessions">0</div>
            <div style="font-size: 14px; color: #666;">総セッション数</div>
          </div>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 32px; font-weight: bold; color: #28a745;" id="conversion-rate">0%</div>
            <div style="font-size: 14px; color: #666;">コンバージョン率</div>
          </div>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 32px; font-weight: bold; color: #dc3545;" id="dropout-rate">0%</div>
            <div style="font-size: 14px; color: #666;">離脱率</div>
          </div>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 32px; font-weight: bold; color: #17a2b8;" id="avg-time">0分</div>
            <div style="font-size: 14px; color: #666;">平均滞在時間</div>
          </div>
        </div>
        
        <div id="funnel-chart" style="margin-bottom: 30px;">
          <!-- ファネルチャートがここに挿入される -->
        </div>
        
        <div id="funnel-details" style="margin-bottom: 20px;">
          <h3 style="font-size: 18px; margin-bottom: 15px;">ステップ別詳細</h3>
          <div id="step-details">
            <!-- ステップ詳細がここに挿入される -->
          </div>
        </div>
        
        <div id="funnel-recommendations" style="
          background: #f0f8ff;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #8B4513;
        ">
          <h3 style="font-size: 18px; margin-bottom: 10px; color: #8B4513;">改善提案</h3>
          <div id="recommendations-list">
            <!-- 改善提案がここに挿入される -->
          </div>
        </div>
      </div>
    `;
    
    // DOMに追加
    const div = document.createElement('div');
    div.innerHTML = dashboardHTML;
    document.body.appendChild(div);
    
    this.dashboard = document.getElementById('funnel-dashboard');
    
    // イベントリスナー設定
    document.getElementById('funnel-close').addEventListener('click', () => {
      this.hideDashboard();
    });
  }

  /**
   * ファネルデータの分析
   */
  analyzeFunnel() {
    const funnelData = window.enAnalytics?.getConversionFunnel() || {
      totalSessions: 0,
      steps: {
        landingPage: 0,
        scrolledPast50: 0,
        clickedCTA: 0,
        startedForm: 0,
        submittedForm: 0
      }
    };
    
    // 統計情報の更新
    this.updateStats(funnelData);
    
    // ファネルチャートの描画
    this.drawFunnelChart(funnelData);
    
    // ステップ詳細の表示
    this.showStepDetails(funnelData);
    
    // 改善提案の生成
    this.generateRecommendations(funnelData);
  }

  /**
   * 統計情報の更新
   */
  updateStats(data) {
    const totalSessions = data.totalSessions;
    const conversions = data.steps.submittedForm;
    const conversionRate = totalSessions > 0 ? (conversions / totalSessions * 100).toFixed(1) : 0;
    const dropoutRate = totalSessions > 0 ? ((totalSessions - conversions) / totalSessions * 100).toFixed(1) : 0;
    
    document.getElementById('total-sessions').textContent = totalSessions;
    document.getElementById('conversion-rate').textContent = conversionRate + '%';
    document.getElementById('dropout-rate').textContent = dropoutRate + '%';
    
    // 平均滞在時間の計算（仮の値）
    const avgTimeMinutes = Math.floor(Math.random() * 5 + 3);
    document.getElementById('avg-time').textContent = avgTimeMinutes + '分';
  }

  /**
   * ファネルチャートの描画
   */
  drawFunnelChart(data) {
    const chartContainer = document.getElementById('funnel-chart');
    
    const steps = [
      { name: 'ランディング', value: data.steps.landingPage, color: '#8B4513' },
      { name: '50%スクロール', value: data.steps.scrolledPast50, color: '#A0522D' },
      { name: 'CTAクリック', value: data.steps.clickedCTA, color: '#CD853F' },
      { name: 'フォーム開始', value: data.steps.startedForm, color: '#DEB887' },
      { name: 'フォーム送信', value: data.steps.submittedForm, color: '#F4A460' }
    ];
    
    let chartHTML = '<div style="position: relative;">';
    
    steps.forEach((step, index) => {
      const percentage = data.steps.landingPage > 0 ? (step.value / data.steps.landingPage * 100).toFixed(1) : 0;
      const width = 100 - (index * 15); // 段階的に幅を狭める
      
      chartHTML += `
        <div style="
          width: ${width}%;
          margin: 0 auto 10px;
          background: ${step.color};
          color: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          position: relative;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        " class="funnel-step" data-step="${index}">
          <div style="font-weight: bold; font-size: 16px;">${step.name}</div>
          <div style="font-size: 24px; margin: 5px 0;">${step.value}</div>
          <div style="font-size: 14px; opacity: 0.9;">${percentage}%</div>
          ${index < steps.length - 1 ? `
            <div style="
              position: absolute;
              bottom: -15px;
              left: 50%;
              transform: translateX(-50%);
              width: 0;
              height: 0;
              border-left: 20px solid transparent;
              border-right: 20px solid transparent;
              border-top: 15px solid ${step.color};
              z-index: 1;
            "></div>
          ` : ''}
        </div>
      `;
      
      // 離脱率の表示
      if (index < steps.length - 1) {
        const nextValue = steps[index + 1].value;
        const dropRate = step.value > 0 ? ((step.value - nextValue) / step.value * 100).toFixed(1) : 0;
        
        if (dropRate > 0) {
          chartHTML += `
            <div style="
              text-align: center;
              color: #dc3545;
              font-size: 14px;
              margin: 20px 0;
            ">
              <span style="
                background: #fff3cd;
                color: #856404;
                padding: 4px 12px;
                border-radius: 20px;
                border: 1px solid #ffeeba;
              ">離脱率: ${dropRate}%</span>
            </div>
          `;
        }
      }
    });
    
    chartHTML += '</div>';
    chartContainer.innerHTML = chartHTML;
  }

  /**
   * ステップ詳細の表示
   */
  showStepDetails(data) {
    const detailsContainer = document.getElementById('step-details');
    
    const stepAnalysis = [
      {
        step: 'ランディングページ',
        sessions: data.steps.landingPage,
        insights: this.getStepInsights('landing', data)
      },
      {
        step: '50%スクロール',
        sessions: data.steps.scrolledPast50,
        insights: this.getStepInsights('scroll', data)
      },
      {
        step: 'CTAクリック',
        sessions: data.steps.clickedCTA,
        insights: this.getStepInsights('cta', data)
      },
      {
        step: 'フォーム開始',
        sessions: data.steps.startedForm,
        insights: this.getStepInsights('form_start', data)
      },
      {
        step: 'フォーム送信',
        sessions: data.steps.submittedForm,
        insights: this.getStepInsights('form_submit', data)
      }
    ];
    
    let detailsHTML = '<div style="display: grid; gap: 15px;">';
    
    stepAnalysis.forEach(item => {
      detailsHTML += `
        <div style="
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border-left: 3px solid #8B4513;
        ">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong>${item.step}</strong>
            <span style="color: #666;">${item.sessions} セッション</span>
          </div>
          <div style="margin-top: 8px; font-size: 14px; color: #666;">
            ${item.insights}
          </div>
        </div>
      `;
    });
    
    detailsHTML += '</div>';
    detailsContainer.innerHTML = detailsHTML;
  }

  /**
   * ステップごとの洞察を取得
   */
  getStepInsights(step, data) {
    const insights = {
      landing: 'ユーザーが最初にページに到達した段階です。',
      scroll: 'コンテンツに興味を持ち、ページを読み進めています。',
      cta: 'アクションを起こそうとしている積極的なユーザーです。',
      form_start: '予約の意思があり、フォーム入力を開始しました。',
      form_submit: 'コンバージョンに成功した貴重なユーザーです。'
    };
    
    return insights[step] || '';
  }

  /**
   * 改善提案の生成
   */
  generateRecommendations(data) {
    const recommendations = [];
    const conversionRate = data.totalSessions > 0 ? data.steps.submittedForm / data.totalSessions : 0;
    
    // スクロール率が低い場合
    if (data.steps.landingPage > 0 && data.steps.scrolledPast50 / data.steps.landingPage < 0.5) {
      recommendations.push({
        priority: '高',
        issue: 'ファーストビューでの離脱率が高い',
        suggestion: 'ヒーローセクションのコピーとCTAをより魅力的にし、スクロールを促す要素を追加してください。'
      });
    }
    
    // CTAクリック率が低い場合
    if (data.steps.scrolledPast50 > 0 && data.steps.clickedCTA / data.steps.scrolledPast50 < 0.3) {
      recommendations.push({
        priority: '高',
        issue: 'CTAボタンのクリック率が低い',
        suggestion: 'CTAボタンをより目立たせ、価値提案を明確にしてください。複数のCTAを配置することも検討してください。'
      });
    }
    
    // フォーム開始率が低い場合
    if (data.steps.clickedCTA > 0 && data.steps.startedForm / data.steps.clickedCTA < 0.7) {
      recommendations.push({
        priority: '中',
        issue: 'フォームページでの離脱が多い',
        suggestion: 'フォームの項目数を減らし、必須項目を明確にしてください。プログレスバーの追加も効果的です。'
      });
    }
    
    // フォーム完了率が低い場合
    if (data.steps.startedForm > 0 && data.steps.submittedForm / data.steps.startedForm < 0.8) {
      recommendations.push({
        priority: '高',
        issue: 'フォーム入力中の離脱が多い',
        suggestion: 'フォームの入力補助機能を強化し、エラーメッセージを分かりやすくしてください。'
      });
    }
    
    // 全体的なコンバージョン率が低い場合
    if (conversionRate < 0.02) {
      recommendations.push({
        priority: '高',
        issue: '全体的なコンバージョン率が低い',
        suggestion: '信頼性を高める要素（お客様の声、実績、保証）を追加し、緊急性を訴求してください。'
      });
    }
    
    // 推奨事項の表示
    const recommendationsContainer = document.getElementById('recommendations-list');
    let recommendationsHTML = '<ul style="margin: 0; padding-left: 20px;">';
    
    recommendations.forEach(rec => {
      const priorityColor = rec.priority === '高' ? '#dc3545' : '#ffc107';
      recommendationsHTML += `
        <li style="margin-bottom: 15px;">
          <span style="
            background: ${priorityColor};
            color: white;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;
            margin-right: 8px;
          ">優先度: ${rec.priority}</span>
          <strong>${rec.issue}</strong>
          <div style="margin-top: 5px; color: #666; font-size: 14px;">
            ${rec.suggestion}
          </div>
        </li>
      `;
    });
    
    if (recommendations.length === 0) {
      recommendationsHTML += '<li>現在のところ、大きな改善点は見つかりませんでした。継続的にモニタリングを行ってください。</li>';
    }
    
    recommendationsHTML += '</ul>';
    recommendationsContainer.innerHTML = recommendationsHTML;
  }

  /**
   * ダッシュボードを表示
   */
  showDashboard() {
    if (!this.dashboard) {
      this.createDashboard();
    }
    
    this.dashboard.style.display = 'block';
    this.analyzeFunnel();
  }

  /**
   * ダッシュボードを非表示
   */
  hideDashboard() {
    if (this.dashboard) {
      this.dashboard.style.display = 'none';
    }
  }

  /**
   * データをCSV形式でエクスポート
   */
  exportToCSV() {
    const data = window.enAnalytics?.getConversionFunnel() || {};
    const csv = [
      ['ステップ', 'セッション数', '割合'],
      ['ランディングページ訪問', data.steps.landingPage, '100%'],
      ['50%スクロール', data.steps.scrolledPast50, (data.steps.scrolledPast50 / data.steps.landingPage * 100).toFixed(1) + '%'],
      ['CTAクリック', data.steps.clickedCTA, (data.steps.clickedCTA / data.steps.landingPage * 100).toFixed(1) + '%'],
      ['フォーム開始', data.steps.startedForm, (data.steps.startedForm / data.steps.landingPage * 100).toFixed(1) + '%'],
      ['フォーム送信', data.steps.submittedForm, (data.steps.submittedForm / data.steps.landingPage * 100).toFixed(1) + '%']
    ];
    
    const csvContent = csv.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `funnel_analysis_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// ファネル分析ボタンの追加
document.addEventListener('DOMContentLoaded', () => {
  // 管理者モードの場合のみファネル分析ボタンを表示
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('admin') === 'true' || localStorage.getItem('en_admin_mode') === 'true') {
    const funnelButton = document.createElement('button');
    funnelButton.id = 'funnel-button';
    funnelButton.style.cssText = `
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 60px;
      height: 60px;
      background: #28a745;
      color: white;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      z-index: 9999;
      font-size: 24px;
    `;
    funnelButton.title = 'ファネル分析';
    funnelButton.textContent = '📊';
    
    document.body.appendChild(funnelButton);
    
    // ファネル分析インスタンスの作成
    const conversionFunnel = new ConversionFunnel();
    
    // クリックイベント
    funnelButton.addEventListener('click', () => {
      conversionFunnel.showDashboard();
    });
    
    console.log('コンバージョンファネル分析機能初期化完了');
  }
});
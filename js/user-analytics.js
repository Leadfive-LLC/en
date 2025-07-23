/**
 * UserAnalytics - ユーザー行動追跡システム
 * ページビュー、クリック、スクロール、フォーム操作を追跡し、
 * セッションデータをローカルストレージに保存する
 */
class UserAnalytics {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.userId = this.getUserId();
    this.startTime = Date.now();
    this.interactions = [];
    this.conversionEvents = [];
    this.device = this.detectDevice();
    
    // セッションデータの初期化
    this.initializeSession();
    
    // イベントリスナーの設定
    this.setupEventListeners();
    
    // ページビューの追跡
    this.trackPageView();
  }

  /**
   * セッションIDの生成
   */
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * ユーザーIDの取得または生成
   */
  getUserId() {
    let userId = localStorage.getItem('en_user_id');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('en_user_id', userId);
    }
    return userId;
  }

  /**
   * デバイス情報の検出
   */
  detectDevice() {
    const userAgent = navigator.userAgent.toLowerCase();
    const screenWidth = window.innerWidth;
    
    let type = 'desktop';
    if (screenWidth <= 768) {
      type = 'mobile';
    } else if (screenWidth <= 1024) {
      type = 'tablet';
    }

    return {
      type: type,
      os: this.detectOS(userAgent),
      browser: this.detectBrowser(userAgent),
      screenWidth: screenWidth,
      screenHeight: window.innerHeight
    };
  }

  /**
   * OS検出
   */
  detectOS(userAgent) {
    if (userAgent.includes('windows')) return 'Windows';
    if (userAgent.includes('mac')) return 'MacOS';
    if (userAgent.includes('android')) return 'Android';
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'iOS';
    if (userAgent.includes('linux')) return 'Linux';
    return 'Unknown';
  }

  /**
   * ブラウザ検出
   */
  detectBrowser(userAgent) {
    if (userAgent.includes('chrome') && !userAgent.includes('edge')) return 'Chrome';
    if (userAgent.includes('safari') && !userAgent.includes('chrome')) return 'Safari';
    if (userAgent.includes('firefox')) return 'Firefox';
    if (userAgent.includes('edge')) return 'Edge';
    return 'Unknown';
  }

  /**
   * セッションの初期化
   */
  initializeSession() {
    const sessionData = {
      sessionId: this.sessionId,
      userId: this.userId,
      startTime: this.startTime,
      device: this.device,
      referrer: document.referrer,
      landingPage: window.location.href,
      interactions: [],
      conversionEvents: []
    };
    
    this.saveSessionData(sessionData);
  }

  /**
   * イベントリスナーの設定
   */
  setupEventListeners() {
    // クリックイベント
    document.addEventListener('click', (e) => this.trackClick(e));
    
    // スクロールイベント（デバウンス付き）
    let scrollTimer;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => this.trackScroll(), 100);
    });
    
    // フォーム操作イベント
    document.addEventListener('focus', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        this.trackFormInteraction(e.target, 'focus');
      }
    }, true);
    
    document.addEventListener('change', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
        this.trackFormInteraction(e.target, 'change');
      }
    }, true);
    
    // フォーム送信イベント
    document.addEventListener('submit', (e) => {
      this.trackFormSubmit(e);
    });
    
    // ページ離脱イベント
    window.addEventListener('beforeunload', () => {
      this.trackPageExit();
    });
  }

  /**
   * ページビューの追跡
   */
  trackPageView(pageData = {}) {
    const viewData = {
      type: 'pageview',
      timestamp: Date.now(),
      url: window.location.href,
      title: document.title,
      ...pageData
    };
    
    this.addInteraction(viewData);
  }

  /**
   * クリックの追跡
   */
  trackClick(event) {
    const target = event.target;
    const clickData = {
      type: 'click',
      timestamp: Date.now(),
      element: this.getElementSelector(target),
      text: target.textContent?.substring(0, 50) || '',
      position: {
        x: event.pageX,
        y: event.pageY,
        viewportX: event.clientX,
        viewportY: event.clientY
      },
      href: target.href || target.closest('a')?.href || null
    };
    
    // CTA（Call to Action）ボタンの識別
    if (target.matches('a[href="#reserve"], button.cta, .cta-button')) {
      clickData.isCTA = true;
    }
    
    // 電話番号リンクの識別
    if (target.matches('a[href^="tel:"]')) {
      clickData.isPhoneClick = true;
      this.trackConversion('phone_click', { phoneNumber: target.href });
    }
    
    this.addInteraction(clickData);
  }

  /**
   * スクロールの追跡
   */
  trackScroll() {
    const scrollData = {
      type: 'scroll',
      timestamp: Date.now(),
      depth: this.getScrollDepth(),
      position: {
        x: window.pageXOffset,
        y: window.pageYOffset
      },
      viewportHeight: window.innerHeight,
      documentHeight: document.documentElement.scrollHeight
    };
    
    this.addInteraction(scrollData);
  }

  /**
   * スクロール深度の計算
   */
  getScrollDepth() {
    const scrollTop = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollableHeight = documentHeight - windowHeight;
    
    if (scrollableHeight <= 0) return 100;
    
    const depth = Math.round((scrollTop / scrollableHeight) * 100);
    return Math.min(100, Math.max(0, depth));
  }

  /**
   * フォーム操作の追跡
   */
  trackFormInteraction(element, action) {
    const formData = {
      type: 'form_interaction',
      timestamp: Date.now(),
      action: action,
      fieldName: element.name || element.id || this.getElementSelector(element),
      fieldType: element.type || element.tagName.toLowerCase(),
      formId: element.form?.id || element.closest('form')?.id || null
    };
    
    this.addInteraction(formData);
  }

  /**
   * フォーム送信の追跡
   */
  trackFormSubmit(event) {
    const form = event.target;
    const submitData = {
      type: 'form_submit',
      timestamp: Date.now(),
      formId: form.id || this.getElementSelector(form),
      formAction: form.action,
      method: form.method
    };
    
    this.addInteraction(submitData);
    
    // 予約フォームの送信をコンバージョンとして記録
    if (form.id === 'reservation-form' || form.classList.contains('reservation-form')) {
      this.trackConversion('form_submit', {
        formType: 'reservation',
        formId: form.id
      });
    }
  }

  /**
   * コンバージョンイベントの追跡
   */
  trackConversion(type, data = {}) {
    const conversionData = {
      type: type,
      timestamp: Date.now(),
      data: data,
      sessionDuration: Date.now() - this.startTime,
      pageUrl: window.location.href
    };
    
    this.conversionEvents.push(conversionData);
    this.saveConversionEvent(conversionData);
  }

  /**
   * ページ離脱の追跡
   */
  trackPageExit() {
    const exitData = {
      type: 'page_exit',
      timestamp: Date.now(),
      sessionDuration: Date.now() - this.startTime,
      scrollDepth: this.getScrollDepth(),
      interactionCount: this.interactions.length
    };
    
    this.addInteraction(exitData);
    this.saveSessionData();
  }

  /**
   * 要素セレクタの取得
   */
  getElementSelector(element) {
    if (element.id) return `#${element.id}`;
    if (element.className) {
      const classes = element.className.split(' ').filter(c => c).join('.');
      if (classes) return `${element.tagName.toLowerCase()}.${classes}`;
    }
    return element.tagName.toLowerCase();
  }

  /**
   * インタラクションの追加
   */
  addInteraction(interaction) {
    this.interactions.push(interaction);
    
    // 100件ごとに保存（メモリ効率のため）
    if (this.interactions.length % 100 === 0) {
      this.saveSessionData();
    }
  }

  /**
   * セッションデータの保存
   */
  saveSessionData(data = null) {
    const sessionData = data || {
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now(),
      device: this.device,
      interactions: this.interactions,
      conversionEvents: this.conversionEvents
    };
    
    try {
      // 既存のセッションデータを取得
      const existingSessions = JSON.parse(localStorage.getItem('en_analytics_sessions') || '[]');
      
      // 現在のセッションを更新または追加
      const sessionIndex = existingSessions.findIndex(s => s.sessionId === this.sessionId);
      if (sessionIndex >= 0) {
        existingSessions[sessionIndex] = sessionData;
      } else {
        existingSessions.push(sessionData);
      }
      
      // 古いセッションを削除（最新10セッションのみ保持）
      if (existingSessions.length > 10) {
        existingSessions.splice(0, existingSessions.length - 10);
      }
      
      localStorage.setItem('en_analytics_sessions', JSON.stringify(existingSessions));
    } catch (e) {
      console.error('Failed to save session data:', e);
    }
  }

  /**
   * コンバージョンイベントの保存
   */
  saveConversionEvent(conversionData) {
    try {
      const conversions = JSON.parse(localStorage.getItem('en_conversions') || '[]');
      conversions.push(conversionData);
      
      // 最新50件のコンバージョンのみ保持
      if (conversions.length > 50) {
        conversions.splice(0, conversions.length - 50);
      }
      
      localStorage.setItem('en_conversions', JSON.stringify(conversions));
    } catch (e) {
      console.error('Failed to save conversion event:', e);
    }
  }

  /**
   * ヒートマップデータの生成
   */
  generateHeatmapData(timeRange = null) {
    const sessions = JSON.parse(localStorage.getItem('en_analytics_sessions') || '[]');
    const heatmapData = {
      clicks: [],
      scrollDepths: {},
      interactions: []
    };
    
    sessions.forEach(session => {
      if (timeRange && (session.timestamp < timeRange.start || session.timestamp > timeRange.end)) {
        return;
      }
      
      session.interactions?.forEach(interaction => {
        if (interaction.type === 'click') {
          heatmapData.clicks.push({
            x: interaction.position.x,
            y: interaction.position.y,
            timestamp: interaction.timestamp
          });
        } else if (interaction.type === 'scroll') {
          const depth = interaction.depth;
          heatmapData.scrollDepths[depth] = (heatmapData.scrollDepths[depth] || 0) + 1;
        }
        
        heatmapData.interactions.push(interaction);
      });
    });
    
    return heatmapData;
  }

  /**
   * コンバージョンファネルの取得
   */
  getConversionFunnel() {
    const sessions = JSON.parse(localStorage.getItem('en_analytics_sessions') || '[]');
    const funnel = {
      totalSessions: sessions.length,
      steps: {
        landingPage: 0,
        scrolledPast50: 0,
        clickedCTA: 0,
        startedForm: 0,
        submittedForm: 0
      }
    };
    
    sessions.forEach(session => {
      // ランディングページ訪問
      funnel.steps.landingPage++;
      
      // 各ステップのチェック
      let maxScrollDepth = 0;
      let clickedCTA = false;
      let startedForm = false;
      let submittedForm = false;
      
      session.interactions?.forEach(interaction => {
        if (interaction.type === 'scroll' && interaction.depth > maxScrollDepth) {
          maxScrollDepth = interaction.depth;
        }
        if (interaction.type === 'click' && interaction.isCTA) {
          clickedCTA = true;
        }
        if (interaction.type === 'form_interaction' && interaction.action === 'focus') {
          startedForm = true;
        }
        if (interaction.type === 'form_submit') {
          submittedForm = true;
        }
      });
      
      if (maxScrollDepth >= 50) funnel.steps.scrolledPast50++;
      if (clickedCTA) funnel.steps.clickedCTA++;
      if (startedForm) funnel.steps.startedForm++;
      if (submittedForm) funnel.steps.submittedForm++;
    });
    
    return funnel;
  }
}

// 分析システムの初期化
document.addEventListener('DOMContentLoaded', () => {
  window.enAnalytics = new UserAnalytics();
  console.log('建築工房en - ユーザー分析システム初期化完了');
});
/**
 * UrgencyScarcity - 緊急性・希少性メッセージングシステム
 * リアルタイム空き状況表示と限定性を伝える動的メッセージ
 */
class UrgencyScarcity {
  constructor() {
    // 仮の空き状況データ（実際はAPIから取得）
    this.availability = {
      currentMonth: {
        totalSlots: 6, // 7月26日と27日、各3組ずつ
        bookedSlots: 3,
        dates: [
          { date: '2025-07-26', slots: 3, booked: 1 },
          { date: '2025-07-27', slots: 3, booked: 2 }
        ]
      },
      recentBookings: [
        { time: '昨日', location: '堺市' }
      ],
      viewingNow: Math.floor(Math.random() * 3) + 2
    };
    
    this.messages = {
      urgency: [
        '今月の見学枠は残りわずか',
        '人気の時間帯から埋まっています',
        '週末の枠は特に人気です',
        '早めのご予約をおすすめします'
      ],
      scarcity: [
        '1日3組限定のプライベート見学会',
        '完全予約制で質の高いご案内',
        '月末限定の特別見学会',
        '少人数制でじっくりご相談'
      ],
      social: [
        '多くの方にご好評いただいています',
        '口コミで人気が広がっています',
        'リピーター様からのご紹介多数',
        '満足度98%の体験会'
      ]
    };
    
    this.elements = [];
  }

  /**
   * 緊急性・希少性要素の初期化
   */
  initialize() {
    // ヒーローセクションに要素を追加
    this.addHeroUrgency();
    
    // 予約フォームセクションに要素を追加
    this.addFormUrgency();
    
    // フローティングバナーを追加
    this.addFloatingBanner();
    
    // リアルタイム更新の開始
    this.startRealtimeUpdates();
  }

  /**
   * ヒーローセクションに緊急性要素を追加
   */
  addHeroUrgency() {
    const heroSection = document.querySelector('.hero-overlay')?.parentElement;
    if (!heroSection) return;
    
    // 空き状況バッジを追加
    const availabilityBadge = document.createElement('div');
    availabilityBadge.className = 'availability-badge';
    availabilityBadge.style.cssText = `
      position: absolute;
      top: 20px;
      right: 20px;
      background: rgba(255, 255, 255, 0.95);
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      z-index: 10;
      animation: pulse 2s infinite;
    `;
    
    availabilityBadge.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <div style="width: 10px; height: 10px; background: #dc3545; border-radius: 50%; animation: blink 1s infinite;"></div>
        <span style="font-weight: bold; color: #333;">
          今月残り<span id="available-slots" style="color: #dc3545; font-size: 1.2em;">${this.availability.currentMonth.totalSlots - this.availability.currentMonth.bookedSlots}</span>枠
        </span>
      </div>
      <div style="font-size: 12px; color: #666; margin-top: 4px;">
        現在<span id="viewing-now">${this.availability.viewingNow}</span>名が閲覧中
      </div>
    `;
    
    heroSection.appendChild(availabilityBadge);
    this.elements.push(availabilityBadge);
    
    // CSSアニメーションを追加
    this.addAnimationStyles();
  }

  /**
   * 予約フォームセクションに緊急性要素を追加
   */
  addFormUrgency() {
    const formSection = document.getElementById('reserve');
    if (!formSection) return;
    
    // カレンダー表示を追加
    const calendarWidget = document.createElement('div');
    calendarWidget.className = 'calendar-widget';
    calendarWidget.style.cssText = `
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 20px;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    `;
    
    calendarWidget.innerHTML = `
      <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #333;">
        <i class="ri-calendar-line" style="color: #8B4513;"></i> 今月の空き状況
      </h3>
      <div id="availability-calendar" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px;">
        ${this.generateCalendarHTML()}
      </div>
      <div style="margin-top: 15px; padding: 10px; background: #fff3cd; border-radius: 6px; border: 1px solid #ffeaa7;">
        <p style="font-size: 14px; color: #856404; margin: 0;">
          <i class="ri-information-line"></i> ${this.messages.urgency[Math.floor(Math.random() * this.messages.urgency.length)]}
        </p>
      </div>
    `;
    
    const formContainer = formSection.querySelector('.bg-white.rounded-lg');
    if (formContainer) {
      formContainer.insertBefore(calendarWidget, formContainer.firstChild);
    }
    
    // 最近の予約情報を追加
    this.addRecentBookings(formSection);
  }

  /**
   * カレンダーHTMLを生成
   */
  generateCalendarHTML() {
    let html = '';
    const today = new Date();
    const daysInMonth = 30;
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(today.getFullYear(), today.getMonth(), i);
      const dayOfWeek = date.getDay();
      const isPast = date < today;
      const dateInfo = this.availability.currentMonth.dates.find(d => {
        const dDate = new Date(d.date);
        return dDate.getDate() === i;
      });
      
      let statusClass = 'available';
      let statusText = '空きあり';
      
      if (isPast) {
        statusClass = 'past';
        statusText = '-';
      } else if (dateInfo) {
        const availableSlots = dateInfo.slots - dateInfo.booked;
        if (availableSlots === 0) {
          statusClass = 'fully-booked';
          statusText = '満席';
        } else if (availableSlots === 1) {
          statusClass = 'last-slot';
          statusText = '残1';
        } else {
          statusText = `残${availableSlots}`;
        }
      } else if (dayOfWeek === 0 || dayOfWeek === 6) {
        statusClass = 'weekend';
      }
      
      html += `
        <div class="calendar-day ${statusClass}" style="
          padding: 8px;
          text-align: center;
          border-radius: 6px;
          font-size: 14px;
          background: ${this.getStatusColor(statusClass)};
          color: ${this.getTextColor(statusClass)};
          cursor: ${isPast || statusClass === 'fully-booked' ? 'not-allowed' : 'pointer'};
        ">
          <div style="font-weight: bold;">${i}</div>
          <div style="font-size: 11px;">${statusText}</div>
        </div>
      `;
    }
    
    return html;
  }

  /**
   * ステータスに応じた背景色を取得
   */
  getStatusColor(status) {
    const colors = {
      'available': '#e8f5e9',
      'weekend': '#e3f2fd',
      'last-slot': '#fff3e0',
      'fully-booked': '#ffebee',
      'past': '#f5f5f5'
    };
    return colors[status] || '#ffffff';
  }

  /**
   * ステータスに応じたテキスト色を取得
   */
  getTextColor(status) {
    const colors = {
      'available': '#2e7d32',
      'weekend': '#1565c0',
      'last-slot': '#e65100',
      'fully-booked': '#c62828',
      'past': '#9e9e9e'
    };
    return colors[status] || '#333333';
  }

  /**
   * 最近の予約情報を追加
   */
  addRecentBookings(container) {
    const bookingsWidget = document.createElement('div');
    bookingsWidget.className = 'recent-bookings';
    bookingsWidget.style.cssText = `
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      margin-top: 20px;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    `;
    
    bookingsWidget.innerHTML = `
      <h4 style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #333;">
        <i class="ri-user-add-line" style="color: #28a745;"></i> 最近のご予約
      </h4>
      <div style="space-y-2;">
        ${this.availability.recentBookings.map(booking => `
          <div style="display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
            <i class="ri-map-pin-line" style="color: #666;"></i>
            <span style="font-size: 14px;">${booking.location}の方が${booking.time}に予約されました</span>
          </div>
        `).join('')}
      </div>
    `;
    
    container.appendChild(bookingsWidget);
    this.elements.push(bookingsWidget);
  }

  /**
   * フローティングバナーを追加
   */
  addFloatingBanner() {
    const floatingBanner = document.createElement('div');
    floatingBanner.id = 'floating-urgency-banner';
    floatingBanner.style.cssText = `
      position: fixed;
      bottom: -100px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%);
      color: white;
      padding: 15px 30px;
      border-radius: 50px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      z-index: 1000;
      transition: bottom 0.5s ease-out;
      max-width: 90%;
      text-align: center;
    `;
    
    floatingBanner.innerHTML = `
      <div style="display: flex; align-items: center; gap: 15px;">
        <i class="ri-time-line" style="font-size: 24px;"></i>
        <div>
          <div style="font-weight: bold; font-size: 16px;" id="urgency-message">
            ${this.messages.scarcity[0]}
          </div>
          <div style="font-size: 14px; opacity: 0.9;" id="scarcity-detail">
            今すぐ予約して、理想の家づくりを始めましょう
          </div>
        </div>
        <button onclick="document.getElementById('reserve').scrollIntoView({ behavior: 'smooth' })" style="
          background: white;
          color: #8B4513;
          border: none;
          padding: 8px 20px;
          border-radius: 25px;
          font-weight: bold;
          cursor: pointer;
          white-space: nowrap;
        ">予約する</button>
      </div>
    `;
    
    document.body.appendChild(floatingBanner);
    this.elements.push(floatingBanner);
    
    // スクロールで表示
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // 下にスクロールして、ページの30%以上進んだら表示
      if (scrollTop > lastScrollTop && scrollTop > windowHeight * 0.3) {
        floatingBanner.style.bottom = '20px';
      }
      
      // 上にスクロールまたは最下部に到達したら非表示
      if (scrollTop < lastScrollTop || scrollTop + windowHeight >= documentHeight - 100) {
        floatingBanner.style.bottom = '-100px';
      }
      
      lastScrollTop = scrollTop;
    });
  }

  /**
   * リアルタイム更新の開始
   */
  startRealtimeUpdates() {
    // 閲覧者数の更新
    setInterval(() => {
      const viewingNow = Math.floor(Math.random() * 5) + 3;
      const viewingElement = document.getElementById('viewing-now');
      if (viewingElement) {
        viewingElement.textContent = viewingNow;
      }
    }, 30000); // 30秒ごと
    
    // メッセージのローテーション
    let messageIndex = 0;
    setInterval(() => {
      const urgencyElement = document.getElementById('urgency-message');
      const scarcityElement = document.getElementById('scarcity-detail');
      
      if (urgencyElement && scarcityElement) {
        messageIndex = (messageIndex + 1) % this.messages.scarcity.length;
        urgencyElement.textContent = this.messages.scarcity[messageIndex];
        
        const detailMessages = [
          '今すぐ予約して、理想の家づくりを始めましょう',
          '次回開催は未定です。このチャンスをお見逃しなく',
          '人気の時間帯から埋まります。お早めに',
          '質問・相談も大歓迎。まずは体験会へ'
        ];
        scarcityElement.textContent = detailMessages[messageIndex];
      }
    }, 10000); // 10秒ごと
    
    // 仮の予約通知（デモ用）
    this.showRandomBookingNotification();
  }

  /**
   * ランダムな予約通知を表示（デモ用）
   */
  showRandomBookingNotification() {
    // 一度だけ表示するためのフラグをローカルストレージで管理
    const notificationShownKey = 'en_notification_shown_' + new Date().toDateString();
    if (localStorage.getItem(notificationShownKey)) {
      return; // 今日既に表示済みならスキップ
    }
    
    const showNotification = () => {
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: -400px;
        background: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        transition: right 0.5s ease-out;
        max-width: 350px;
        border-left: 4px solid #28a745;
      `;
      
      notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px;">
          <i class="ri-check-line" style="color: #28a745; font-size: 24px;"></i>
          <div>
            <div style="font-weight: bold; color: #333;">ご予約が入りました</div>
            <div style="font-size: 14px; color: #666; margin-top: 4px;">
              昨日、堺市のT様が体験会を予約されました
            </div>
            <div style="font-size: 12px; color: #999; margin-top: 2px;">残り枠わずかです</div>
          </div>
        </div>
      `;
      
      document.body.appendChild(notification);
      
      // アニメーション
      setTimeout(() => {
        notification.style.right = '20px';
      }, 100);
      
      setTimeout(() => {
        notification.style.right = '-400px';
        setTimeout(() => {
          notification.remove();
        }, 500);
      }, 5000);
      
      // 表示済みフラグを設定
      localStorage.setItem(notificationShownKey, 'true');
    };
    
    // 10秒後に一度だけ表示
    setTimeout(() => {
      showNotification();
    }, 10000);
  }

  /**
   * CSSアニメーションを追加
   */
  addAnimationStyles() {
    if (document.getElementById('urgency-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'urgency-styles';
    style.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
      }
      
      @keyframes blink {
        0%, 50%, 100% { opacity: 1; }
        25%, 75% { opacity: 0.3; }
      }
      
      .calendar-day {
        transition: all 0.3s ease;
      }
      
      .calendar-day:hover:not(.past):not(.fully-booked) {
        transform: scale(1.05);
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      }
      
      .availability-badge {
        animation: pulse 2s infinite;
      }
    `;
    
    document.head.appendChild(style);
  }
}

// 緊急性・希少性メッセージングの初期化
document.addEventListener('DOMContentLoaded', () => {
  const urgencyScarcity = new UrgencyScarcity();
  urgencyScarcity.initialize();
  console.log('緊急性・希少性メッセージングシステム初期化完了');
});
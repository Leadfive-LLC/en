/**
 * CalendarPicker - 7月の予約可能日を表示するカレンダーピッカー
 * 7月26日（土）と7月27日（日）のみ選択可能
 */
class CalendarPicker {
  constructor() {
    this.selectedDate = null;
    this.availableDates = ['2025-07-26', '2025-07-27'];
    this.init();
  }

  init() {
    // datetime-local inputを隠してカレンダーUIに置き換える
    const dateInputs = document.querySelectorAll('input[type="datetime-local"]');
    dateInputs.forEach((input, index) => {
      this.createCalendarUI(input, index);
    });
  }

  createCalendarUI(input, index) {
    // 元のinputを隠す
    input.style.display = 'none';
    
    // カレンダーコンテナを作成
    const container = document.createElement('div');
    container.className = 'calendar-container';
    container.style.position = 'relative';
    
    // 表示用のinput
    const displayInput = document.createElement('input');
    displayInput.type = 'text';
    displayInput.readOnly = true;
    displayInput.placeholder = '日付を選択してください';
    displayInput.className = input.className;
    displayInput.style.cursor = 'pointer';
    displayInput.id = `calendar-display-${index}`;
    
    // カレンダーポップアップ
    const calendarPopup = document.createElement('div');
    calendarPopup.className = 'calendar-popup';
    calendarPopup.style.cssText = `
      position: absolute;
      top: 100%;
      left: 0;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 16px;
      display: none;
      z-index: 1000;
      min-width: 320px;
    `;
    
    // カレンダーヘッダー
    const header = document.createElement('div');
    header.style.cssText = `
      text-align: center;
      font-weight: bold;
      margin-bottom: 12px;
      font-size: 18px;
    `;
    header.textContent = '2025年7月';
    
    // 曜日ヘッダー
    const weekHeader = document.createElement('div');
    weekHeader.style.cssText = `
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
      margin-bottom: 8px;
    `;
    const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
    weekDays.forEach(day => {
      const dayElement = document.createElement('div');
      dayElement.style.cssText = `
        text-align: center;
        font-weight: bold;
        font-size: 14px;
        color: #666;
      `;
      dayElement.textContent = day;
      weekHeader.appendChild(dayElement);
    });
    
    // カレンダーグリッド
    const calendarGrid = document.createElement('div');
    calendarGrid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
    `;
    
    // 2025年7月1日は火曜日（インデックス2）
    const firstDayOfWeek = 2;
    const daysInMonth = 31;
    
    // 空のセルを追加
    for (let i = 0; i < firstDayOfWeek; i++) {
      const emptyCell = document.createElement('div');
      calendarGrid.appendChild(emptyCell);
    }
    
    // 日付セルを追加
    for (let day = 1; day <= daysInMonth; day++) {
      const dateCell = document.createElement('div');
      const dateString = `2025-07-${day.toString().padStart(2, '0')}`;
      const isAvailable = this.availableDates.includes(dateString);
      
      dateCell.style.cssText = `
        text-align: center;
        padding: 8px 4px;
        border-radius: 4px;
        cursor: ${isAvailable ? 'pointer' : 'not-allowed'};
        background-color: ${isAvailable ? '#8B4513' : '#f0f0f0'};
        color: ${isAvailable ? 'white' : '#ccc'};
        font-weight: ${isAvailable ? 'bold' : 'normal'};
        transition: all 0.2s;
      `;
      
      dateCell.textContent = day;
      
      if (isAvailable) {
        dateCell.addEventListener('mouseover', () => {
          dateCell.style.opacity = '0.8';
        });
        dateCell.addEventListener('mouseout', () => {
          dateCell.style.opacity = '1';
        });
        dateCell.addEventListener('click', () => {
          this.selectDate(dateString, input, displayInput, calendarPopup);
        });
      }
      
      calendarGrid.appendChild(dateCell);
    }
    
    // 時間選択
    const timeSection = document.createElement('div');
    timeSection.style.cssText = `
      margin-top: 16px;
      border-top: 1px solid #eee;
      padding-top: 16px;
    `;
    
    const timeLabel = document.createElement('div');
    timeLabel.textContent = '時間を選択:';
    timeLabel.style.cssText = `
      font-weight: bold;
      margin-bottom: 8px;
    `;
    
    const timeGrid = document.createElement('div');
    timeGrid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(1, 1fr);
      gap: 8px;
    `;
    
    const timeSlots = [
      { start: '10:00', end: '12:00', label: '10:00〜12:00' },
      { start: '13:00', end: '15:00', label: '13:00〜15:00' },
      { start: '15:30', end: '17:30', label: '15:30〜17:30' }
    ];
    
    timeSlots.forEach(slot => {
      const timeButton = document.createElement('button');
      timeButton.type = 'button';
      timeButton.textContent = slot.label;
      timeButton.style.cssText = `
        padding: 12px 16px;
        border: 1px solid #8B4513;
        background: white;
        color: #8B4513;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 14px;
        width: 100%;
      `;
      
      timeButton.addEventListener('mouseover', () => {
        timeButton.style.backgroundColor = '#8B4513';
        timeButton.style.color = 'white';
      });
      
      timeButton.addEventListener('mouseout', () => {
        timeButton.style.backgroundColor = 'white';
        timeButton.style.color = '#8B4513';
      });
      
      timeButton.addEventListener('click', () => {
        if (this.selectedDate) {
          const dateTime = `${this.selectedDate}T${slot.start}`;
          input.value = dateTime;
          displayInput.value = `${this.formatDate(this.selectedDate)} ${slot.label}`;
          calendarPopup.style.display = 'none';
        }
      });
      
      timeGrid.appendChild(timeButton);
    });
    
    timeSection.appendChild(timeLabel);
    timeSection.appendChild(timeGrid);
    
    // 組み立て
    calendarPopup.appendChild(header);
    calendarPopup.appendChild(weekHeader);
    calendarPopup.appendChild(calendarGrid);
    calendarPopup.appendChild(timeSection);
    
    container.appendChild(displayInput);
    container.appendChild(calendarPopup);
    
    // inputの後に挿入
    input.parentNode.insertBefore(container, input.nextSibling);
    
    // クリックイベント
    displayInput.addEventListener('click', () => {
      calendarPopup.style.display = calendarPopup.style.display === 'block' ? 'none' : 'block';
    });
    
    // 外側クリックで閉じる
    document.addEventListener('click', (e) => {
      if (!container.contains(e.target)) {
        calendarPopup.style.display = 'none';
      }
    });
  }

  selectDate(dateString, input, displayInput, calendarPopup) {
    this.selectedDate = dateString;
    const formattedDate = this.formatDate(dateString);
    displayInput.value = `${formattedDate} - 時間を選択してください`;
  }

  formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${year}年${parseInt(month)}月${parseInt(day)}日`;
  }

  formatDateTime(dateTimeString) {
    const [date, time] = dateTimeString.split('T');
    const [year, month, day] = date.split('-');
    return `${year}年${parseInt(month)}月${parseInt(day)}日 ${time}`;
  }
}

// DOMContentLoadedで初期化
document.addEventListener('DOMContentLoaded', () => {
  new CalendarPicker();
});
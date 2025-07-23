/**
 * TestimonialsEnhanced - お客様の声セクションの強化
 * 写真付きの詳細な体験談、星評価、レビュー日付を表示
 */
class TestimonialsEnhanced {
  constructor() {
    this.testimonials = [
      {
        id: 1,
        name: '田中様ご家族',
        location: '大阪市在住',
        date: '2024年3月',
        rating: 5,
        photo: 'https://static.readdy.ai/image/bf416a288b961f02cea1a5d080fa38d4/customer1.jpg',
        title: '家族みんなが大満足の家になりました',
        content: '建築工房enさんには本当にお世話になりました。最初の相談から完成まで、私たちの要望を丁寧に聞いてくださり、想像以上の家が完成しました。特に無垢材の床は子供たちも裸足で走り回れて、本当に気持ちいいです。冬は暖かく、夏は涼しい。1年中快適に過ごせています。',
        highlights: ['無垢材の心地よさ', '年中快適な住環境', '子供に優しい設計'],
        projectDetails: {
          type: '新築一戸建て',
          area: '延床面積 120㎡',
          duration: '6ヶ月'
        }
      },
      {
        id: 2,
        name: '山本様ご夫婦',
        location: '堺市在住',
        date: '2024年1月',
        rating: 5,
        photo: 'https://static.readdy.ai/image/bf416a288b961f02cea1a5d080fa38d4/customer2.jpg',
        title: '理想以上の家が完成しました',
        content: '定年後の生活を考えて、バリアフリーで木の温もりを感じられる家を希望していました。設計段階から親身に相談に乗っていただき、細かい要望も全て実現してくださいました。特に、リビングの吹き抜けと大きな窓から見える庭の景色は最高です。友人にも自信を持って紹介できます。',
        highlights: ['バリアフリー設計', '木の温もり', '開放的な空間'],
        projectDetails: {
          type: '平屋建て',
          area: '延床面積 95㎡',
          duration: '5ヶ月'
        }
      },
      {
        id: 3,
        name: '佐藤様ご家族',
        location: '枚方市在住',
        date: '2023年12月',
        rating: 5,
        photo: 'https://static.readdy.ai/image/bf416a288b961f02cea1a5d080fa38d4/customer3.jpg',
        title: '伝統と現代が融合した理想の住まい',
        content: '和モダンな家を希望していましたが、建築工房enさんの提案は期待を大きく超えるものでした。伝統的な技術と現代的なデザインが見事に融合していて、来客者からも「素敵な家ですね」と褒められます。吉野杉の香りに包まれて、毎日が癒しの時間です。アフターサービスも充実していて安心です。',
        highlights: ['和モダンデザイン', '吉野杉の活用', '充実のアフターサービス'],
        projectDetails: {
          type: '二世帯住宅',
          area: '延床面積 180㎡',
          duration: '8ヶ月'
        }
      },
      {
        id: 4,
        name: '鈴木様ご夫婦',
        location: '豊中市在住',
        date: '2023年10月',
        rating: 5,
        photo: 'https://static.readdy.ai/image/bf416a288b961f02cea1a5d080fa38d4/customer4.jpg',
        title: 'リノベーションで生まれ変わった我が家',
        content: '築40年の実家をリノベーションしていただきました。思い出は残しつつ、現代的で快適な住まいに生まれ変わり感動しています。特に耐震補強と断熱性能の向上で、安心して暮らせるようになりました。古い柱や梁を活かしたデザインも素晴らしく、建築工房enさんの技術力の高さを実感しました。',
        highlights: ['思い出を活かしたリノベーション', '耐震・断熱性能向上', '古材の有効活用'],
        projectDetails: {
          type: 'フルリノベーション',
          area: '延床面積 110㎡',
          duration: '4ヶ月'
        }
      }
    ];
    
    this.currentIndex = 0;
    this.autoRotateInterval = null;
  }

  /**
   * お客様の声セクションを強化
   */
  enhanceTestimonialsSection() {
    const testimonialsSection = document.querySelector('#testimonials') || document.querySelector('.testimonials-section');
    if (!testimonialsSection) return;
    
    // 既存のコンテンツをクリア
    testimonialsSection.innerHTML = '';
    
    // 新しいコンテンツを作成
    const enhancedHTML = `
      <div class="container mx-auto px-4 py-16">
        <h2 class="section-title text-3xl font-bold text-center">お客様の声</h2>
        
        <!-- 統計情報 -->
        <div class="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div class="text-center">
            <div class="text-3xl font-bold text-primary">98%</div>
            <div class="text-sm text-gray-600">お客様満足度</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-primary">500+</div>
            <div class="text-sm text-gray-600">施工実績</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-primary">4.9</div>
            <div class="text-sm text-gray-600">平均評価</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-primary">95%</div>
            <div class="text-sm text-gray-600">紹介率</div>
          </div>
        </div>
        
        <!-- メインテスティモニアル -->
        <div class="mt-12 max-w-6xl mx-auto">
          <div id="testimonial-main" class="bg-white rounded-lg shadow-xl p-8">
            <!-- 動的コンテンツがここに挿入される -->
          </div>
        </div>
        
        <!-- テスティモニアルリスト -->
        <div class="mt-8 grid md:grid-cols-4 gap-4 max-w-6xl mx-auto">
          ${this.testimonials.map((testimonial, index) => `
            <div class="testimonial-card cursor-pointer p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow ${index === 0 ? 'ring-2 ring-primary' : ''}" data-index="${index}">
              <div class="flex items-center mb-2">
                <img src="${testimonial.photo}" alt="${testimonial.name}" class="w-12 h-12 rounded-full mr-3">
                <div>
                  <div class="font-bold text-sm">${testimonial.name}</div>
                  <div class="text-xs text-gray-600">${testimonial.location}</div>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex text-yellow-400 text-sm">
                  ${this.renderStars(testimonial.rating)}
                </div>
                <div class="text-xs text-gray-500">${testimonial.date}</div>
              </div>
            </div>
          `).join('')}
        </div>
        
        <!-- CTA -->
        <div class="mt-12 text-center">
          <p class="text-gray-600 mb-4">お客様の声をもっと見る</p>
          <a href="#" class="text-primary hover:underline">全てのレビューを見る（127件） →</a>
        </div>
      </div>
    `;
    
    testimonialsSection.innerHTML = enhancedHTML;
    
    // 最初のテスティモニアルを表示
    this.displayTestimonial(0);
    
    // イベントリスナーの設定
    this.setupEventListeners();
    
    // 自動ローテーションの開始
    this.startAutoRotate();
  }

  /**
   * テスティモニアルを表示
   */
  displayTestimonial(index) {
    const testimonial = this.testimonials[index];
    const mainContainer = document.getElementById('testimonial-main');
    
    const testimonialHTML = `
      <div class="grid md:grid-cols-2 gap-8">
        <div>
          <div class="flex items-center mb-4">
            <img src="${testimonial.photo}" alt="${testimonial.name}" class="w-20 h-20 rounded-full mr-4">
            <div>
              <h3 class="text-xl font-bold">${testimonial.name}</h3>
              <p class="text-gray-600">${testimonial.location}</p>
              <div class="flex items-center mt-1">
                <div class="flex text-yellow-400">
                  ${this.renderStars(testimonial.rating)}
                </div>
                <span class="ml-2 text-sm text-gray-500">${testimonial.date}</span>
              </div>
            </div>
          </div>
          
          <h4 class="text-lg font-bold mb-3">"${testimonial.title}"</h4>
          <p class="text-gray-700 leading-relaxed mb-4">${testimonial.content}</p>
          
          <div class="bg-gray-50 p-4 rounded-lg">
            <h5 class="font-bold text-sm mb-2">プロジェクト詳細</h5>
            <div class="grid grid-cols-3 gap-2 text-sm">
              <div>
                <span class="text-gray-600">種別:</span><br>
                <span class="font-medium">${testimonial.projectDetails.type}</span>
              </div>
              <div>
                <span class="text-gray-600">規模:</span><br>
                <span class="font-medium">${testimonial.projectDetails.area}</span>
              </div>
              <div>
                <span class="text-gray-600">工期:</span><br>
                <span class="font-medium">${testimonial.projectDetails.duration}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div class="mb-6">
            <h5 class="font-bold mb-3">特に満足した点</h5>
            <div class="space-y-2">
              ${testimonial.highlights.map(highlight => `
                <div class="flex items-center">
                  <span class="text-primary mr-2">✓</span>
                  <span>${highlight}</span>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="bg-primary bg-opacity-10 p-6 rounded-lg">
            <h5 class="font-bold mb-2">お客様からの評価</h5>
            <div class="space-y-3">
              <div>
                <div class="flex justify-between mb-1">
                  <span class="text-sm">設計・デザイン</span>
                  <span class="text-sm font-bold">5.0</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-primary h-2 rounded-full" style="width: 100%"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between mb-1">
                  <span class="text-sm">施工品質</span>
                  <span class="text-sm font-bold">5.0</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-primary h-2 rounded-full" style="width: 100%"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between mb-1">
                  <span class="text-sm">スタッフ対応</span>
                  <span class="text-sm font-bold">5.0</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-primary h-2 rounded-full" style="width: 100%"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between mb-1">
                  <span class="text-sm">コストパフォーマンス</span>
                  <span class="text-sm font-bold">4.8</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-primary h-2 rounded-full" style="width: 96%"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    mainContainer.innerHTML = testimonialHTML;
    
    // カードのアクティブ状態を更新
    this.updateActiveCard(index);
    this.currentIndex = index;
  }

  /**
   * 星評価をレンダリング
   */
  renderStars(rating) {
    let stars = '';
    for (let i = 0; i < 5; i++) {
      if (i < rating) {
        stars += '<i class="ri-star-fill"></i>';
      } else {
        stars += '<i class="ri-star-line"></i>';
      }
    }
    return stars;
  }

  /**
   * アクティブカードを更新
   */
  updateActiveCard(index) {
    const cards = document.querySelectorAll('.testimonial-card');
    cards.forEach((card, i) => {
      if (i === index) {
        card.classList.add('ring-2', 'ring-primary');
      } else {
        card.classList.remove('ring-2', 'ring-primary');
      }
    });
  }

  /**
   * イベントリスナーの設定
   */
  setupEventListeners() {
    const cards = document.querySelectorAll('.testimonial-card');
    cards.forEach((card, index) => {
      card.addEventListener('click', () => {
        this.displayTestimonial(index);
        this.stopAutoRotate();
        this.startAutoRotate();
      });
    });
  }

  /**
   * 自動ローテーションの開始
   */
  startAutoRotate() {
    this.stopAutoRotate();
    this.autoRotateInterval = setInterval(() => {
      const nextIndex = (this.currentIndex + 1) % this.testimonials.length;
      this.displayTestimonial(nextIndex);
    }, 5000);
  }

  /**
   * 自動ローテーションの停止
   */
  stopAutoRotate() {
    if (this.autoRotateInterval) {
      clearInterval(this.autoRotateInterval);
      this.autoRotateInterval = null;
    }
  }
}

// お客様の声セクションの強化を初期化
document.addEventListener('DOMContentLoaded', () => {
  const testimonialsEnhanced = new TestimonialsEnhanced();
  
  // 既存のお客様の声セクションがある場合は強化
  if (document.querySelector('#testimonials') || document.querySelector('.testimonials-section')) {
    testimonialsEnhanced.enhanceTestimonialsSection();
    console.log('お客様の声セクション強化完了');
  }
});
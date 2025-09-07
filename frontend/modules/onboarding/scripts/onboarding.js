// Компонент онбординга
class OnboardingComponent {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = CONFIG.GAME.SLIDES_COUNT;
        this.container = null;
    }

    // Рендер компонента
    async render() {
        this.container = document.querySelector('#app') || document.body;
        this.container.innerHTML = '';

        const onboardingHTML = this.getOnboardingHTML();
        this.container.innerHTML = onboardingHTML;

        this.bindEvents();
        this.loadSlide(this.currentSlide);
    }

    // Получение HTML структуры
    getOnboardingHTML() {
        return `
            <div class="onboarding-wrapper">
                <div class="onboarding-container" id="slide-container">
                    <!-- Слайды загружаются динамически -->
                </div>
                <div class="onboarding-dots">
                    ${this.generateDots()}
                </div>
            </div>
        `;
    }

    // Генерация точек навигации
    generateDots() {
        let dots = '';
        for (let i = 1; i <= this.totalSlides; i++) {
            dots += `<span class="dot ${i === 1 ? 'active' : ''}" data-slide="${i}"></span>`;
        }
        return dots;
    }

    // Привязка событий
    bindEvents() {
        // Клик по точкам навигации
        const dots = document.querySelectorAll('.dot');
        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                const slideNumber = parseInt(e.target.dataset.slide);
                this.goToSlide(slideNumber);
            });
        });

        // Свайп для мобильных устройств
        this.bindSwipeEvents();
    }

    // Привязка свайп событий
    bindSwipeEvents() {
        let startX = 0;
        let endX = 0;

        const container = document.getElementById('slide-container');

        container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });

        container.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            this.handleSwipe(startX, endX);
        });
    }

    // Обработка свайпа
    handleSwipe(startX, endX) {
        const threshold = 50;
        const diff = startX - endX;

        if (Math.abs(diff) > threshold) {
            if (diff > 0 && this.currentSlide < this.totalSlides) {
                // Свайп влево - следующий слайд
                this.nextSlide();
            } else if (diff < 0 && this.currentSlide > 1) {
                // Свайп вправо - предыдущий слайд
                this.prevSlide();
            }
        }
    }

    // Переход к следующему слайду
    nextSlide() {
        if (this.currentSlide < this.totalSlides) {
            this.currentSlide++;
            this.loadSlide(this.currentSlide);
        } else {
            // Переход к авторизации после последнего слайда
            router.navigate('/auth');
        }
    }

    // Переход к предыдущему слайду
    prevSlide() {
        if (this.currentSlide > 1) {
            this.currentSlide--;
            this.loadSlide(this.currentSlide);
        }
    }

    // Переход к конкретному слайду
    goToSlide(slideNumber) {
        if (slideNumber >= 1 && slideNumber <= this.totalSlides) {
            this.currentSlide = slideNumber;
            this.loadSlide(this.currentSlide);
        }
    }

    // Загрузка слайда
    loadSlide(slideNumber) {
        const container = document.getElementById('slide-container');
        const slideData = this.getSlideData(slideNumber);

        container.innerHTML = this.generateSlideHTML(slideData, slideNumber);
        this.updateDots(slideNumber);

        // Привязка событий для кнопок
        this.bindSlideEvents(slideNumber);
    }

    // Получение данных слайда
    getSlideData(slideNumber) {
        const slides = {
            1: {
                type: 'grid',
                images: ['province.jpg', 'hanami.jpg', 'rust.jpg', 'sandstone.jpg'],
                text: 'Играй на своих любимых картах и побеждай!'
            },
            2: {
                type: 'single',
                image: 'top-rating.jpg',
                text: 'Играй с киберспортсменами вместе, и прокачивай скилл!'
            },
            3: {
                type: 'single',
                image: 'lobby-screenshot.jpg',
                text: 'Наша система, сама создает лобби в игре, а так-же записывает всю игру'
            },
            4: {
                type: 'single',
                image: 'match-screenshot.jpg',
                text: 'Наши матчи проходят так-же как и на профессиональных турнирах!'
            },
            5: {
                type: 'single',
                image: 'start-game.jpg',
                text: 'Чтобы начать прокачивать свой скилл - регистрируйся скорее!'
            }
        };

        return slides[slideNumber] || slides[1];
    }

    // Генерация HTML слайда
    generateSlideHTML(slideData, slideNumber) {
        const isLastSlide = slideNumber === this.totalSlides;
        const buttonText = isLastSlide ? 'Начать игру!' : 'Дальше';
        const buttonClass = isLastSlide ? 'start-button' : 'next-button';

        let imagesHTML = '';

        if (slideData.type === 'grid') {
            imagesHTML = `
    <div class="screenshots-grid">
        ${slideData.images.map(img =>
                `<img src="modules/onboarding/assets/images/${img}" alt="${img}" class="map-screenshot">`
            ).join('')}
    </div>
`;
        } else {
            imagesHTML = `
    <img src="modules/onboarding/assets/images/${slideData.image}" alt="Screenshot" class="feature-screenshot">
`;
        }

        return `
            <div class="onboarding-slide">
                <div class="slide-content">
                    ${imagesHTML}
                    <p class="slide-text">${slideData.text}</p>
                </div>
                <button class="${buttonClass}" id="slide-button">${buttonText}</button>
            </div>
        `;
    }

    // Привязка событий слайда
    bindSlideEvents(slideNumber) {
        const button = document.getElementById('slide-button');
        if (button) {
            button.addEventListener('click', () => {
                if (slideNumber === this.totalSlides) {
                    router.navigate('/auth');
                } else {
                    this.nextSlide();
                }
            });
        }
    }

    // Обновление точек навигации
    updateDots(activeSlide) {
        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            if (index + 1 === activeSlide) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    // Уничтожение компонента
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Экспорт компонента
window.OnboardingComponent = OnboardingComponent;
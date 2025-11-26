// filter.js - Улучшенная версия с доступностью

class AccessibleFilter {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.options = {
            filterButtons: '.filter-btn',
            filterItems: '.project-card',
            activeClass: 'active',
            ...options
        };

        this.init();
    }

    init() {
        this.filterButtons = this.container.querySelectorAll(this.options.filterButtons);
        this.filterItems = this.container.querySelectorAll(this.options.filterItems);

        this.addEventListeners();
        this.setupAccessibility();
    }

    setupAccessibility() {
        // Добавить ARIA атрибуты кнопкам фильтра
        this.filterButtons.forEach((button, index) => {
            button.setAttribute('role', 'button');
            button.setAttribute('aria-pressed', 'false');
            button.setAttribute('tabindex', '0');

            if (button.classList.contains(this.options.activeClass)) {
                button.setAttribute('aria-pressed', 'true');
            }
        });

        // Добавить ARIA атрибуты элементам для фильтрации
        this.filterItems.forEach(item => {
            item.setAttribute('aria-hidden', 'false');
        });

        // Добавить live region для объявления изменений
        this.addLiveRegion();
    }

    addLiveRegion() {
        let liveRegion = this.container.querySelector('[aria-live]');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.setAttribute('aria-live', 'polite');
            liveRole = "status"
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'visually-hidden';
            this.container.appendChild(liveRegion);
        }
        this.liveRegion = liveRegion;
    }

    addEventListeners() {
        this.filterButtons.forEach(button => {
            // Клик
            button.addEventListener('click', () => this.handleFilter(button));

            // Клавиатура
            button.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    this.handleFilter(button);
                }
            });
        });
    }

    handleFilter(selectedButton) {
        const filterValue = selectedButton.getAttribute('data-filter') ||
            selectedButton.textContent.toLowerCase();

        // Обновить состояние кнопок
        this.updateButtonStates(selectedButton);

        // Применить фильтр
        this.applyFilter(filterValue);

        // Объявить изменения
        this.announceFilterChange(filterValue);
    }

    updateButtonStates(selectedButton) {
        this.filterButtons.forEach(button => {
            const isActive = button === selectedButton;
            button.classList.toggle(this.options.activeClass, isActive);
            button.setAttribute('aria-pressed', isActive.toString());
        });
    }

    applyFilter(filterValue) {
        let visibleCount = 0;

        this.filterItems.forEach(item => {
            const itemTech = item.getAttribute('data-tech') || '';
            const shouldShow = filterValue === 'all' || itemTech.includes(filterValue);

            item.style.display = shouldShow ? 'block' : 'none';
            item.setAttribute('aria-hidden', (!shouldShow).toString());

            if (shouldShow) visibleCount++;
        });

        this.visibleCount = visibleCount;
    }

    announceFilterChange(filterValue) {
        if (!this.liveRegion) return;

        const filterName = this.getFilterName(filterValue);
        const itemText = this.getItemsText(this.visibleCount);

        this.liveRegion.textContent = `Фильтр "${filterName}" применен. ${itemText}`;

        // Очистить сообщение через некоторое время
        setTimeout(() => {
            this.liveRegion.textContent = '';
        }, 3000);
    }

    getFilterName(filterValue) {
        const button = Array.from(this.filterButtons).find(btn =>
            (btn.getAttribute('data-filter') || btn.textContent.toLowerCase()) === filterValue
        );
        return button ? button.textContent.trim() : 'Все';
    }

    getItemsText(count) {
        if (count === 0) return 'Элементы не найдены';
        if (count === 1) return 'Показан 1 элемент';
        return `Показано ${count} элементов`;
    }
}

// Инициализация фильтров на странице
document.addEventListener('DOMContentLoaded', function () {
    const filterContainers = document.querySelectorAll('[data-filter-container]');
    filterContainers.forEach(container => {
        new AccessibleFilter(container.id);
    });
});

// Экспорт для использования
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibleFilter;
}
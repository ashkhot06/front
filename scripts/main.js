// main.js - Главный файл инициализации

import { openModal, closeModal } from './modal.js';
import FormValidator from './form-validation.js';
import AccessibleFilter from './filter.js';

class MainApp {
    constructor() {
        this.init();
    }

    init() {
        // Инициализация после загрузки DOM
        document.addEventListener('DOMContentLoaded', () => {
            this.setupAccessibility();
            this.initComponents();
            this.setupKeyboardNavigation();
            this.setupFocusManagement();
        });
    }

    setupAccessibility() {
        // Добавить skip link для навигации с клавиатуры
        this.addSkipLink();

        // Установить язык страницы
        document.documentElement.setAttribute('lang', 'ru');

        // Добавить основную landmark роль
        const main = document.querySelector('main');
        if (main && !main.getAttribute('role')) {
            main.setAttribute('role', 'main');
        }
    }

    addSkipLink() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link visually-hidden';
        skipLink.textContent = 'Перейти к основному содержимому';
        skipLink.setAttribute('aria-label', 'Пропустить навигацию и перейти к основному содержимому');

        document.body.insertBefore(skipLink, document.body.firstChild);

        // Добавить ID к основному контенту
        const mainContent = document.querySelector('main');
        if (mainContent && !mainContent.id) {
            mainContent.id = 'main-content';
        }
    }

    initComponents() {
        // Инициализация форм
        this.initForms();

        // Инициализация фильтров
        this.initFilters();

        // Инициализация модальных окон
        this.initModals();

        // Инициализация навигации
        this.initNavigation();
    }

    initForms() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            if (!form.id) {
                form.id = `form-${Math.random().toString(36).substr(2, 9)}`;
            }
            new FormValidator(form.id);
        });
    }

    initFilters() {
        const filterContainers = document.querySelectorAll('.filter-buttons');
        filterContainers.forEach((container, index) => {
            if (!container.id) {
                container.id = `filter-container-${index}`;
            }
            container.setAttribute('data-filter-container', 'true');
            new AccessibleFilter(container.id);
        });
    }

    initModals() {
        // Модальные окна уже инициализированы через modal.js
        // Добавляем обработчики для кнопок открытия модалок
        const modalTriggers = document.querySelectorAll('[data-modal-target]');
        modalTriggers.forEach(trigger => {
            trigger.addEventListener('click', () => {
                const modalId = trigger.getAttribute('data-modal-target');
                openModal(modalId);
            });

            // Добавить ARIA атрибуты
            trigger.setAttribute('aria-haspopup', 'dialog');
        });
    }

    initNavigation() {
        // Улучшение навигации
        const navLinks = document.querySelectorAll('.nav__link');
        navLinks.forEach((link, index) => {
            link.setAttribute('tabindex', '0');

            // Обработка клавиатуры для навигации
            link.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    link.click();
                }
            });
        });

        // Текущая страница
        const currentPage = window.location.pathname;
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.setAttribute('aria-current', 'page');
            }
        });
    }

    setupKeyboardNavigation() {
        // Глобальные обработчики клавиатуры
        document.addEventListener('keydown', (event) => {
            // Escape для закрытия модалок и очистки форм
            if (event.key === 'Escape') {
                this.handleEscapeKey();
            }

            // Tab для улучшенной навигации
            if (event.key === 'Tab') {
                this.handleTabKey(event);
            }
        });
    }

    handleEscapeKey() {
        // Закрыть активные модальные окна
        const openModals = document.querySelectorAll('.modal[style*="display: block"]');
        openModals.forEach(modal => {
            closeModal(modal.id);
        });

        // Очистить ошибки форм
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            const validator = form._validator;
            if (validator) {
                validator.clearAllErrors();
            }
        });
    }

    handleTabKey(event) {
        // Убедиться, что фокус остается в пределах модального окна если оно открыто
        const openModal = document.querySelector('.modal[style*="display: block"]');
        if (openModal) {
            const focusableElements = openModal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );

            if (focusableElements.length === 0) return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (event.shiftKey && document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            } else if (!event.shiftKey && document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    }

    setupFocusManagement() {
        // Сохранять фокус при переходе между страницами
        let lastFocusedElement = null;

        document.addEventListener('focusin', () => {
            lastFocusedElement = document.activeElement;
        });

        // Восстанавливать фокус при возврате на страницу
        window.addEventListener('pageshow', () => {
            if (lastFocusedElement && lastFocusedElement.isConnected) {
                lastFocusedElement.focus();
            }
        });
    }
}

// Инициализация приложения
new MainApp();

// Глобальные функции для использования в HTML
window.openModal = openModal;
window.closeModal = closeModal;

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MainApp;
}
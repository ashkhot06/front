// modal.js - Улучшенная версия с доступностью

let currentModal = null;
let previousActiveElement = null;

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    currentModal = modal;
    previousActiveElement = document.activeElement;

    // Показать модальное окно
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');

    // Добавить роль и свойства доступности
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    // Захватить фокус
    const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
        focusableElements[0].focus();
    } else {
        modal.focus();
    }

    // Скрыть фоновый контент от скринридеров
    document.querySelectorAll('body > *:not(.modal):not(.header):not(.footer)')
        .forEach(el => {
            if (!el.closest('.modal')) {
                el.setAttribute('aria-hidden', 'true');
            }
        });

    // Добавить обработчики
    addModalEventListeners(modal);
}

function closeModal(modalId) {
    const modal = modalId ? document.getElementById(modalId) : currentModal;
    if (!modal) return;

    // Скрыть модальное окно
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');

    // Убрать ARIA атрибуты
    modal.removeAttribute('role');
    modal.removeAttribute('aria-modal');

    // Вернуть видимость фоновому контенту
    document.querySelectorAll('[aria-hidden="true"]')
        .forEach(el => el.removeAttribute('aria-hidden'));

    // Вернуть фокус
    if (previousActiveElement) {
        previousActiveElement.focus();
    }

    // Убрать обработчики
    removeModalEventListeners(modal);

    currentModal = null;
    previousActiveElement = null;
}

function addModalEventListeners(modal) {
    // Обработчик Escape
    const escapeHandler = function (event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    };

    // Обработчик Tab для циклического фокуса
    const tabHandler = function (event) {
        if (event.key === 'Tab') {
            const focusableElements = modal.querySelectorAll(
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
    };

    // Сохранить ссылки на обработчики для последующего удаления
    modal._escapeHandler = escapeHandler;
    modal._tabHandler = tabHandler;

    document.addEventListener('keydown', escapeHandler);
    modal.addEventListener('keydown', tabHandler);
}

function removeModalEventListeners(modal) {
    if (modal._escapeHandler) {
        document.removeEventListener('keydown', modal._escapeHandler);
    }
    if (modal._tabHandler) {
        modal.removeEventListener('keydown', modal._tabHandler);
    }
}

// Закрытие по клику вне модального окна
document.addEventListener('click', function (event) {
    if (currentModal && event.target === currentModal) {
        closeModal();
    }
});

// Экспорт функций для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { openModal, closeModal };
}
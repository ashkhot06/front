// form-validation.js - Улучшенная версия с доступностью

class FormValidator {
    constructor(formId, options = {}) {
        this.form = document.getElementById(formId);
        if (!this.form) return;

        this.options = {
            errorClass: 'error',
            successClass: 'success',
            errorElementClass: 'error-message',
            ...options
        };

        this.init();
    }

    init() {
        // Добавить ARIA атрибуты форме
        this.form.setAttribute('novalidate', 'true');
        this.form.setAttribute('aria-label', 'Форма с валидацией');

        // Найти все поля для валидации
        this.fields = this.form.querySelectorAll('input, textarea, select');

        // Добавить обработчики
        this.addEventListeners();
    }

    addEventListeners() {
        // Валидация при вводе
        this.fields.forEach(field => {
            field.addEventListener('blur', () => this.validateField(field));
            field.addEventListener('input', () => this.clearFieldError(field));
        });

        // Валидация при отправке
        this.form.addEventListener('submit', (event) => this.handleSubmit(event));

        // Обработка клавиатуры
        this.form.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.clearAllErrors();
            }
        });
    }

    validateField(field) {
        this.clearFieldError(field);

        const errors = this.getFieldErrors(field);

        if (errors.length > 0) {
            this.showFieldError(field, errors[0]);
            return false;
        } else {
            this.showFieldSuccess(field);
            return true;
        }
    }

    getFieldErrors(field) {
        const errors = [];
        const value = field.value.trim();

        // Проверка обязательных полей
        if (field.hasAttribute('required') && !value) {
            errors.push(this.getRequiredMessage(field));
        }

        // Проверка email
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                errors.push('Пожалуйста, введите корректный email адрес');
            }
        }

        // Проверка минимальной длины
        if (field.hasAttribute('minlength') && value) {
            const minLength = parseInt(field.getAttribute('minlength'));
            if (value.length < minLength) {
                errors.push(`Минимальная длина: ${minLength} символов`);
            }
        }

        // Проверка максимальной длины
        if (field.hasAttribute('maxlength') && value) {
            const maxLength = parseInt(field.getAttribute('maxlength'));
            if (value.length > maxLength) {
                errors.push(`Максимальная длина: ${maxLength} символов`);
            }
        }

        return errors;
    }

    getRequiredMessage(field) {
        const label = this.getFieldLabel(field);
        return label ? `Поле "${label}" обязательно для заполнения` : 'Это поле обязательно для заполнения';
    }

    getFieldLabel(field) {
        const label = this.form.querySelector(`label[for="${field.id}"]`);
        return label ? label.textContent.replace('*', '').trim() : null;
    }

    showFieldError(field, message) {
        // Добавить класс ошибки
        field.classList.add(this.options.errorClass);
        field.classList.remove(this.options.successClass);

        // Добавить ARIA атрибуты
        field.setAttribute('aria-invalid', 'true');

        // Создать или обновить элемент с ошибкой
        let errorElement = field.parentNode.querySelector(`.${this.options.errorElementClass}`);
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = this.options.errorElementClass;
            errorElement.setAttribute('role', 'alert');
            errorElement.setAttribute('aria-live', 'polite');
            field.parentNode.appendChild(errorElement);
        }

        errorElement.textContent = message;
        errorElement.style.display = 'block';

        // Добавить описание ошибки
        const errorId = `error-${field.id}`;
        errorElement.id = errorId;
        field.setAttribute('aria-describedby', errorId);
    }

    showFieldSuccess(field) {
        field.classList.remove(this.options.errorClass);
        field.classList.add(this.options.successClass);
        field.setAttribute('aria-invalid', 'false');

        // Убрать сообщение об ошибке
        const errorElement = field.parentNode.querySelector(`.${this.options.errorElementClass}`);
        if (errorElement) {
            errorElement.style.display = 'none';
            field.removeAttribute('aria-describedby');
        }
    }

    clearFieldError(field) {
        field.classList.remove(this.options.errorClass);
        field.setAttribute('aria-invalid', 'false');

        const errorElement = field.parentNode.querySelector(`.${this.options.errorElementClass}`);
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    clearAllErrors() {
        this.fields.forEach(field => this.clearFieldError(field));
    }

    handleSubmit(event) {
        event.preventDefault();

        let isValid = true;
        const firstErrorField = null;

        // Валидировать все поля
        this.fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
                if (!firstErrorField) {
                    firstErrorField = field;
                }
            }
        });

        if (isValid) {
            this.submitForm();
        } else {
            // Прокрутить к первой ошибке
            if (firstErrorField) {
                firstErrorField.focus();
                firstErrorField.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }
    }

    submitForm() {
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        // Показать состояние загрузки
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';
        submitBtn.setAttribute('aria-label', 'Отправка формы...');

        // Симуляция отправки (заменить на реальный AJAX)
        setTimeout(() => {
            this.showSuccessMessage();

            // Восстановить кнопку
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                submitBtn.setAttribute('aria-label', 'Отправить форму');
                this.form.reset();
                this.clearAllErrors();
            }, 3000);
        }, 1500);
    }

    showSuccessMessage() {
        // Создать или найти элемент успешного сообщения
        let successElement = this.form.querySelector('.success-message');
        if (!successElement) {
            successElement = document.createElement('div');
            successElement.className = 'success-message';
            successElement.setAttribute('role', 'status');
            successElement.setAttribute('aria-live', 'polite');
            successElement.setAttribute('aria-atomic', 'true');
            this.form.appendChild(successElement);
        }

        successElement.textContent = 'Форма успешно отправлена!';
        successElement.style.display = 'block';

        // Автоматически скрыть через 5 секунд
        setTimeout(() => {
            successElement.style.display = 'none';
        }, 5000);
    }
}

// Инициализация всех форм на странице
document.addEventListener('DOMContentLoaded', function () {
    const forms = document.querySelectorAll('form[data-validate]');
    forms.forEach(form => {
        new FormValidator(form.id);
    });
});

// Экспорт для использования
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormValidator;
}
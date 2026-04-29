/**
 * Taxi Booking Plugin - Authentication Module
 * Handles login, registration, forgot password, and reset password functionality
 */
(function ($) {
    'use strict';

    // Phone input instance for registration
    var regPhoneIti = null;

    // Initialize phone input for registration form
    function initRegPhoneInput() {
        var phoneInput = document.querySelector('#reg-phone');
        if (phoneInput && window.intlTelInput) {
            regPhoneIti = window.intlTelInput(phoneInput, {
                initialCountry: 'auto',
                geoIpLookup: function (callback) {
                    fetch('https://ipwho.is/')
                        .then(function (res) { return res.json(); })
                        .then(function (data) { callback(data.country_code); })
                        .catch(function () { callback('ie'); });
                },
                nationalMode: true,
                autoPlaceholder: 'aggressive',
                formatOnDisplay: true,
                separateDialCode: false,
                customContainer: '',
                loadUtils: function () {
                    return import("https://cdn.jsdelivr.net/npm/intl-tel-input@25.11.2/build/js/utils.js");
                }
            });
            // Apply inline style for padding with !important
            if (phoneInput.closest('.input-with-icon')) {
                phoneInput.style.setProperty('padding-left', '80px', 'important');
            } else {
                phoneInput.style.setProperty('padding-left', '48px', 'important');
            }
        }
    }

    // Initialize authentication forms when document is ready
    $(document).ready(function () {
        initRegPhoneInput();
        initAuthForms();
        initAuthTabs();
    });

    // Initialize form handlers
    function initAuthForms() {
        // Login form handler
        $('#taxi-login-form').on('submit', function (e) {
            e.preventDefault();
            handleLoginSubmit();
        });

        // Alternative login button click
        $(document).on('click', '#login-submit-btn', function (e) {
            e.preventDefault();
            handleLoginSubmit();
        });

        // Register form handler
        $('#taxi-register-form').on('submit', function (e) {
            e.preventDefault();
            handleRegisterSubmit();
        });

        // Alternative register button click
        $(document).on('click', '#register-submit-btn', function (e) {
            e.preventDefault();
            handleRegisterSubmit();
        });

        // Forgot password form handler
        $('#taxi-forgot-password-form').on('submit', function (e) {
            e.preventDefault();
            handleForgotPasswordSubmit();
        });

        // Reset password form handler
        $('#taxi-reset-password-form').on('submit', function (e) {
            e.preventDefault();
            handleResetPasswordSubmit();
        });

        // Company/Private account type toggle
        $(document).on('change', 'input[name="reg_type"]', function () {
            var isCompany = $(this).val() === 'company';
            $('.company-only').toggle(isCompany);

            if (isCompany) {
                $('#reg-company-name, #reg-company-number, #reg-company-vat').attr('required', true);
            } else {
                $('#reg-company-name, #reg-company-number, #reg-company-vat').prop('required', false).val('');
            }
        });
    }

    // Initialize auth tabs (login/register toggle)
    function initAuthTabs() {
        $(document).on('click', '.auth-tab', function () {
            var tab = $(this).data('tab');
            $('.auth-tab').removeClass('active');
            $(this).addClass('active');
            $('.auth-content').hide();
            $('#auth-' + tab).show();
        });
    }

    // Handle login form submission
    function handleLoginSubmit() {
        var email = $('#login-email').val();
        var password = $('#login-password').val();
        var rememberMe = $('#remember-me').is(':checked');
        var redirectUrl = $('#login-redirect-url').val() || '/user-dashboard';

        // Clear previous errors
        $('.field-error').text('');
        $('#login-error').hide();

        // Validate fields
        if (!email) {
            $('#login-email-error').text('Email is required');
            return;
        }

        if (!password) {
            $('#login-password-error').text('Password is required');
            return;
        }

        // Show loading
        $('#form-loading').show();
        $('#login-submit-btn').prop('disabled', true);

        var nonceValue = $('#taxi_booking_nonce').val() || (typeof taxi_booking_ajax !== 'undefined' ? taxi_booking_ajax.nonce : '');

        $.ajax({
            url: taxi_booking_ajax.ajax_url,
            type: 'POST',
            dataType: 'json',
            data: {
                action: 'taxi_user_login',
                nonce: nonceValue,
                email: email,
                password: password,
                remember_me: rememberMe,
                redirect_url: redirectUrl
            },
            success: function (response) {
                $('#form-loading').hide();
                $('#login-submit-btn').prop('disabled', false);

                if (response.success) {
                    $('#login-success').show();
                    setTimeout(function () {
                        window.location.href = response.data.redirect_url || '/user-dashboard';
                    }, 1500);
                } else {
                    $('#login-error p').text(response.data.message || 'Login failed');
                    $('#login-error').show();
                }
            },
            error: function () {
                $('#form-loading').hide();
                $('#login-submit-btn').prop('disabled', false);
                $('#login-error p').text('Network error occurred. Please try again.');
                $('#login-error').show();
            }
        });
    }

    // Handle register form submission
    function handleRegisterSubmit() {
        // Get form data
        var formData = {
            first_name: $('#reg-first-name').val(),
            last_name: $('#reg-last-name').val(),
            email: $('#reg-email').val(),
            phone: regPhoneIti ? regPhoneIti.getNumber() : $('#reg-phone').val(),
            password: $('#reg-password').val(),
            password_confirmation: $('#reg-password-confirm').val() || $('#reg-password-confirmation').val(),
            reg_type: $('input[name="reg_type"]:checked').val() || 'private',
            agree_terms: $('#agree-terms').is(':checked'),
            redirect_url: $('#register-redirect-url').val() || '/user-dashboard'
        };

        // Add company fields if company account
        if (formData.reg_type === 'company') {
            formData.company_name = $('#reg-company-name').val() || $('#company-name').val();
            formData.company_number = $('#reg-company-number').val() || $('#company-number').val();
            formData.company_vat = $('#reg-company-vat').val() || $('#company-vat').val();
        }

        // Clear previous errors
        $('.field-error').text('');
        $('#register-error').hide();

        // Validate fields
        var isValid = true;

        if (!formData.first_name) {
            $('#reg-first-name-error').text('First name is required');
            isValid = false;
        }

        if (!formData.last_name) {
            $('#reg-last-name-error').text('Last name is required');
            isValid = false;
        }

        if (!formData.email) {
            $('#reg-email-error').text('Email is required');
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            $('#reg-email-error').text('Please enter a valid email address');
            isValid = false;
        }

        if (!formData.phone) {
            $('#reg-phone-error').text('Phone number is required');
            isValid = false;
        } else if (regPhoneIti && !regPhoneIti.isValidNumber()) {
            $('#reg-phone-error').text('Please enter a valid phone number');
            isValid = false;
        }

        if (!formData.password) {
            $('#reg-password-error').text('Password is required');
            isValid = false;
        } else if (formData.password.length < 8) {
            $('#reg-password-error').text('Password must be at least 8 characters');
            isValid = false;
        }

        if (formData.password !== formData.password_confirmation) {
            $('#reg-password-confirm-error').text('Passwords do not match');
            isValid = false;
        }

        if (!formData.agree_terms) {
            $('#agree-terms-error').text('You must agree to the terms and conditions');
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        // Show loading
        $('#form-loading').show();
        $('#register-submit-btn').prop('disabled', true);

        var nonceValue = $('#taxi_booking_nonce').val() || (typeof taxi_booking_ajax !== 'undefined' ? taxi_booking_ajax.nonce : '');

        $.ajax({
            url: taxi_booking_ajax.ajax_url,
            type: 'POST',
            dataType: 'json',
            data: $.extend({ action: 'taxi_user_register', nonce: nonceValue }, formData),
            success: function (response) {
                $('#form-loading').hide();
                $('#register-submit-btn').prop('disabled', false);

                if (response.success) {
                    $('#register-success').show();
                    setTimeout(function () {
                        window.location.href = response.data.redirect_url || '/user-dashboard';
                    }, 1500);
                } else {
                    $('#register-error p').text(response.data.message || 'Registration failed');
                    $('#register-error').show();
                }
            },
            error: function () {
                $('#form-loading').hide();
                $('#register-submit-btn').prop('disabled', false);
                $('#register-error p').text('Network error occurred. Please try again.');
                $('#register-error').show();
            }
        });
    }

    // Handle forgot password form submission
    function handleForgotPasswordSubmit() {
        var email = $('#forgot-email').val();
        var submitBtn = $('#forgot-submit-btn');
        var btnText = submitBtn.find('.btn-text');
        var btnLoading = submitBtn.find('.btn-loading');

        // Clear previous errors
        $('.field-error').text('');
        $('#forgot-error').hide();

        // Validate
        if (!email) {
            $('#forgot-email-error').text('Email is required');
            return;
        }

        // Show loading states
        $('#form-loading').show();
        submitBtn.prop('disabled', true);
        if (btnText.length) btnText.hide();
        if (btnLoading.length) btnLoading.show();

        var nonceValue = $('#taxi_booking_nonce').val() || (typeof taxi_booking_ajax !== 'undefined' ? taxi_booking_ajax.nonce : '');

        $.ajax({
            url: taxi_booking_ajax.ajax_url,
            type: 'POST',
            dataType: 'json',
            data: {
                action: 'taxi_forgot_password',
                nonce: nonceValue,
                email: email
            },
            success: function (response) {
                $('#form-loading').hide();
                submitBtn.prop('disabled', false);
                if (btnText.length) btnText.show();
                if (btnLoading.length) btnLoading.hide();

                if (response.success) {
                    $('#forgot-success').show();
                    $('.auth-card').hide();
                } else {
                    $('#forgot-error p').text(response.data.message || 'Failed to send reset link');
                    $('#forgot-error').show();
                }
            },
            error: function () {
                $('#form-loading').hide();
                submitBtn.prop('disabled', false);
                if (btnText.length) btnText.show();
                if (btnLoading.length) btnLoading.hide();
                $('#forgot-error p').text('Network error occurred. Please try again.');
                $('#forgot-error').show();
            }
        });
    }

    // Handle reset password form submission
    function handleResetPasswordSubmit() {
        var password = $('#reset-password').val();
        var passwordConfirm = $('#reset-password-confirmation').val();
        var email = $('#reset-email').val();
        var token = $('#reset-token').val();
        var redirectUrl = $('#reset-redirect-url').val() || '/login';
        var submitBtn = $('#reset-submit-btn');
        var btnText = submitBtn.find('.btn-text');
        var btnLoading = submitBtn.find('.btn-loading');

        // Clear previous errors
        $('.field-error').text('');
        $('#reset-error').hide();

        // Validate
        if (!password) {
            $('#reset-password-error').text('Password is required');
            return;
        }

        if (password.length < 8) {
            $('#reset-password-error').text('Password must be at least 8 characters');
            return;
        }

        if (password !== passwordConfirm) {
            $('#reset-password-confirmation-error').text('Passwords do not match');
            return;
        }

        // Show loading states
        $('#form-loading').show();
        submitBtn.prop('disabled', true);
        if (btnText.length) btnText.hide();
        if (btnLoading.length) btnLoading.show();

        var nonceValue = $('#taxi_booking_nonce').val() || (typeof taxi_booking_ajax !== 'undefined' ? taxi_booking_ajax.nonce : '');

        $.ajax({
            url: taxi_booking_ajax.ajax_url,
            type: 'POST',
            dataType: 'json',
            data: {
                action: 'taxi_reset_password',
                nonce: nonceValue,
                email: email,
                token: token,
                password: password,
                password_confirmation: passwordConfirm,
                redirect_url: redirectUrl
            },
            success: function (response) {
                $('#form-loading').hide();
                submitBtn.prop('disabled', false);
                if (btnText.length) btnText.show();
                if (btnLoading.length) btnLoading.hide();

                if (response.success) {
                    $('#reset-success').show();
                    setTimeout(function () {
                        window.location.href = response.data.redirect_url || '/login';
                    }, 2000);
                } else {
                    $('#reset-error p').text(response.data.message || 'Failed to reset password');
                    $('#reset-error').show();
                }
            },
            error: function () {
                $('#form-loading').hide();
                submitBtn.prop('disabled', false);
                if (btnText.length) btnText.show();
                if (btnLoading.length) btnLoading.hide();
                $('#reset-error p').text('Network error occurred. Please try again.');
                $('#reset-error').show();
            }
        });
    }

    // Expose functions for use in other modules (booking form auth)
    window.TaxiBookingAuth = {
        handleLogin: handleLoginSubmit,
        handleRegister: handleRegisterSubmit,
        handleForgotPassword: handleForgotPasswordSubmit,
        handleResetPassword: handleResetPasswordSubmit,
        getRegPhoneIti: function() { return regPhoneIti; }
    };

})(jQuery);

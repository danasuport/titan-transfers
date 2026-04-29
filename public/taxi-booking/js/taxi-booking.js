document.addEventListener("DOMContentLoaded", function () {
    const widget = document.querySelector(".taxi-booking-widget");
    if (widget && widget.parentElement) {
        widget.parentElement.classList.add("no-padding");
        widget.parentElement.parentElement.classList.add("no-padding");
    }
});

(function ($) {
    'use strict';

    // Safety check: ensure taxi_booking_ajax is defined
    if (typeof taxi_booking_ajax === 'undefined') {
        console.warn('Taxi Booking: taxi_booking_ajax is not defined. Scripts may not have loaded correctly.');
        return;
    }

    // TBKState stub - returns empty data, used by legacy code paths
    // State is now managed via URL parameters and currentBookingData
    var TBKState = {
        get: function() { return Promise.resolve({ data: { taxi_booking_payload: {} } }); },
        put: function() { return Promise.resolve(); },
        clear: function() { return Promise.resolve(); }
    };

    // URL Parameter helpers for booking state
    var TBKParams = (function() {
        // Get all URL parameters as an object
        function getAll() {
            var params = {};
            var searchParams = new URLSearchParams(window.location.search);
            searchParams.forEach(function(value, key) {
                params[key] = value;
            });
            return params;
        }

        // Get a single URL parameter
        function get(key, defaultVal) {
            var params = new URLSearchParams(window.location.search);
            return params.get(key) || defaultVal || '';
        }

        // Build URL with booking parameters (handles locale prefix)
        function buildUrl(baseUrl, params) {
            // Get locale from hidden input field
            var locale = $('#booking-locale').val() || '';
            var urlPath = baseUrl;

            // Add locale prefix if locale is not 'en' and not empty
            if (locale && locale !== 'en') {
                // Remove leading slash if present, then add locale prefix
                urlPath = '/' + locale + (baseUrl.startsWith('/') ? baseUrl : '/' + baseUrl);
            }

            var url = new URL(urlPath, window.location.origin);
            Object.keys(params).forEach(function(key) {
                if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
                    url.searchParams.set(key, params[key]);
                }
            });
            return url.toString();
        }

        // Collect booking data from Step 1 form
        function collectStep1Data() {
            var bookingType = $('#booking-type').val() || 'transfer';
            var data = {
                type: bookingType,
                step: 2
            };

            if (bookingType === 'by-hour') {
                data.pickup = $('#byhour-pickup-address').val() || '';
                data.pickup_pid = $('#byhour-pickup-address').data('place_id') || '';
                data.date = $('#byhour-date').val() || '';
                data.time = $('#byhour-time').val() || '';
                data.pax = $('#byhour-passengers').val() || '1';
                data.lug = $('#byhour-luggage').val() || '0';
                data.dur = $('#byhour-duration').val() || '1';
            } else {
                data.pickup = $('#pickup-address').val() || '';
                data.pickup_pid = $('#pickup-address').data('place_id') || '';
                data.dest = $('#destination-address').val() || '';
                data.dest_pid = $('#destination-address').data('place_id') || '';
                data.date = $('#pickup-date').val() || '';
                data.time = $('#pickup-time').val() || '';
                data.pax = $('#passengers').val() || '1';
                data.lug = $('#luggage').val() || '0';

                if ($('#return-booking').is(':checked')) {
                    data.ret = '1';
                    data.ret_pickup = $('#return-pickup-address').val() || '';
                    data.ret_pickup_pid = $('#return-pickup-address').data('place_id') || '';
                    data.ret_dest = $('#return-destination-address').val() || '';
                    data.ret_dest_pid = $('#return-destination-address').data('place_id') || '';
                    data.ret_date = $('#return-date').val() || '';
                    data.ret_time = $('#return-time').val() || '';
                }
            }

            return data;
        }

        // Populate Step 1 form from URL parameters
        function hydrateStep1Form() {
            var params = getAll();
            var bookingType = params.type || 'transfer';

            if (bookingType === 'by-hour') {
                $('.booking-type-tab').removeClass('active');
                $('.booking-type-tab[data-type="by-hour"]').addClass('active');
                $('#booking-type').val('by-hour');
                $('#transfer-fields').hide();
                $('#by-hour-fields').show();

                if (params.pickup) $('#byhour-pickup-address').val(params.pickup);
                if (params.pickup_pid) $('#byhour-pickup-address').data('place_id', params.pickup_pid);
                if (params.date) $('#byhour-date').val(params.date);
                if (params.time) $('#byhour-time').val(params.time);
                if (params.pax) $('#byhour-passengers').val(params.pax);
                if (params.lug) $('#byhour-luggage').val(params.lug);
                if (params.dur) $('#byhour-duration').val(params.dur);
            } else {
                $('.booking-type-tab').removeClass('active');
                $('.booking-type-tab[data-type="transfer"]').addClass('active');
                $('#booking-type').val('transfer');
                $('#transfer-fields').show();
                $('#by-hour-fields').hide();

                if (params.pickup) $('#pickup-address').val(params.pickup);
                if (params.pickup_pid) $('#pickup-address').data('place_id', params.pickup_pid);
                if (params.dest) $('#destination-address').val(params.dest);
                if (params.dest_pid) $('#destination-address').data('place_id', params.dest_pid);
                if (params.date) $('#pickup-date').val(params.date);
                if (params.time) $('#pickup-time').val(params.time);
                if (params.pax) $('#passengers').val(params.pax);
                if (params.lug) $('#luggage').val(params.lug);

                if (params.ret === '1') {
                    $('#return-booking').prop('checked', true);
                    $('#return-booking-fields').show();
                    if (params.ret_pickup) $('#return-pickup-address').val(params.ret_pickup);
                    if (params.ret_pickup_pid) $('#return-pickup-address').data('place_id', params.ret_pickup_pid);
                    if (params.ret_dest) $('#return-destination-address').val(params.ret_dest);
                    if (params.ret_dest_pid) $('#return-destination-address').data('place_id', params.ret_dest_pid);
                    if (params.ret_date) $('#return-date').val(params.ret_date);
                    if (params.ret_time) $('#return-time').val(params.ret_time);
                }
            }

            // Update display fields
            updatePassengerLuggageDisplay();
        }

        // Get booking data from URL params for API calls
        function getBookingData() {
            var params = getAll();
            return {
                type: params.type || 'transfer',
                pickup: params.pickup || '',
                pickup_pid: params.pickup_pid || '',
                dest: params.dest || '',
                dest_pid: params.dest_pid || '',
                date: params.date || '',
                time: params.time || '',
                pax: params.pax || '1',
                lug: params.lug || '0',
                dur: params.dur || '1',
                ret: params.ret === '1',
                ret_pickup: params.ret_pickup || '',
                ret_pickup_pid: params.ret_pickup_pid || '',
                ret_dest: params.ret_dest || '',
                ret_dest_pid: params.ret_dest_pid || '',
                ret_date: params.ret_date || '',
                ret_time: params.ret_time || '',
                v1: params.v1 || '',
                v2: params.v2 || '',
                cur: params.cur || '',
                cur_sym: params.cur_sym || '€',
                cur_rate: params.cur_rate || '1'
            };
        }

        return {
            getAll: getAll,
            get: get,
            buildUrl: buildUrl,
            collectStep1Data: collectStep1Data,
            hydrateStep1Form: hydrateStep1Form,
            getBookingData: getBookingData
        };
    })();

    // Helper to update passenger/luggage display fields
    function updatePassengerLuggageDisplay() {
        var passengerLabel = ($('#passengers').val() === '1')
            ? (taxi_booking_ajax.strings.passenger || 'Passenger')
            : (taxi_booking_ajax.strings.passengers || 'Passengers');
        var luggageLabel = ($('#luggage').val() === '1')
            ? (taxi_booking_ajax.strings.suitcase || 'Bag')
            : (taxi_booking_ajax.strings.suitcases || 'Bags');
        $('#passengers-display').val($('#passengers').val() + ' ' + passengerLabel);
        $('#luggage-display').val($('#luggage').val() + ' ' + luggageLabel);
        updateNumberButtonStates('passengers');
        updateNumberButtonStates('luggage');

        // Also update by-hour fields if present
        var byhourPassengerLabel = ($('#byhour-passengers').val() === '1')
            ? (taxi_booking_ajax.strings.passenger || 'Passenger')
            : (taxi_booking_ajax.strings.passengers || 'Passengers');
        var byhourLuggageLabel = ($('#byhour-luggage').val() === '1')
            ? (taxi_booking_ajax.strings.suitcase || 'Bag')
            : (taxi_booking_ajax.strings.suitcases || 'Bags');
        $('#byhour-passengers-display').val($('#byhour-passengers').val() + ' ' + byhourPassengerLabel);
        $('#byhour-luggage-display').val($('#byhour-luggage').val() + ' ' + byhourLuggageLabel);
        updateNumberButtonStates('byhour-passengers');
        updateNumberButtonStates('byhour-luggage');
    }

    // Store for current API response data (for use within the same page session)
    var currentBookingData = {
        route1: null,
        route2: null,
        currencies: [],
        config: {},
        additional_items: [],
        paymentButtons: []
    };

    $('#form-loading').css('display', 'flex');

    let searchTimeout;
    let currentSuggestions = {};

    var boPhoneIti;
    var customerPhoneIti;
    var regPhoneIti;
    var currentStep = 1, routeMaps = { outbound: null, return: null };
    var tbkSeatDebounce;

    // Initialize when document is ready
    $(document).ready(function () {
        initPhoneInputs();
        initBookForElse();
        initTaxiBooking();
        initBookingTypeTabs();

        // Fallback: ensure widget is visible after 500ms even if setStep wasn't called
        setTimeout(function () {
            $('.taxi-booking-widget').each(function () {
                if (!$(this).hasClass('loaded')) {
                    $(this).addClass('loaded');
                }
            });
        }, 500);
    });

    // Booking Type Tabs (Transfer / By Hour)
    function initBookingTypeTabs() {
        $('.booking-type-tab').on('click', function () {
            var type = $(this).data('type');

            // Update active tab
            $('.booking-type-tab').removeClass('active');
            $(this).addClass('active');

            // Update hidden input
            $('#booking-type').val(type);

            // Show/hide appropriate fields
            if (type === 'transfer') {
                $('#transfer-fields').show();
                $('#by-hour-fields').hide();
            } else {
                $('#transfer-fields').hide();
                $('#by-hour-fields').show();
                initByHourFields();
            }
        });
    }

    var byHourFieldsInitialized = false;
    function initByHourFields() {
        if (byHourFieldsInitialized) return;
        byHourFieldsInitialized = true;

        // Initialize flatpickr for By Hour date
        if ($('#byhour-date').length && typeof flatpickr !== 'undefined') {
            flatpickr('#byhour-date', {
                dateFormat: 'd/m/Y',
                minDate: 'today',
                disableMobile: true
            });
        }

        // Initialize flatpickr for By Hour time
        if ($('#byhour-time').length && typeof flatpickr !== 'undefined') {
            flatpickr('#byhour-time', {
                enableTime: true,
                noCalendar: true,
                dateFormat: 'H:i',
                time_24hr: true,
                disableMobile: true
            });
        }

        // Initialize autocomplete for By Hour pickup address
        initByHourAutocomplete();
    }

    var byHourSearchDebounce = null;
    function initByHourAutocomplete() {
        var $input = $('#byhour-pickup-address');
        var $suggestions = $('#byhour-pickup-suggestions');

        if (!$input.length) return;

        $input.on('input', function () {
            var query = $(this).val();

            // Clear previous debounce timer
            if (byHourSearchDebounce) {
                clearTimeout(byHourSearchDebounce);
            }

            if (query.length < 3) {
                $suggestions.hide().empty();
                return;
            }

            // Debounce: wait 400ms before searching
            byHourSearchDebounce = setTimeout(function () {
                searchAddresses(query, $input, $suggestions, 'byhour-pickup');
            }, 400);
        });

        // Handle location target button
        $('#by-hour-fields .location-target').on('click', function () {
            getCurrentLocation($input);
        });
    }

    // on document full load hide loader
    $(document).on('readystatechange', function () {
        var step = $('#taxi-booking-widget').data('step');

        if (document.readyState === 'complete' && step != 2 && step != 3) {
            $('#form-loading').hide();
        }
    });

    function initTaxiBooking() {
        var step = $('#taxi-booking-widget').data('step');

        

        // Hide taxi-steps if there's no step parameter in URL
        if (!step) {
            $('.taxi-steps').hide();
        }

        // Fetch initial config
        if (String(step) === '0' || String(step) === '1') {
            fetchInitConfig();
        }

        if (String(step) === '1') {
            // Hydrate form from URL params instead of session
            TBKParams.hydrateStep1Form();
            setStep(1);
            // Track form start for Google Ads
            if (window.TaxiBookingGoogleAds && taxi_booking_ajax.google_ads.enabled) {
                window.TaxiBookingGoogleAds.trackFormStart();
            }
        }
        if (step == 2) {
            fetchInitConfig();
            // Show loading until step 2 UI is ready
            $('#form-loading').css('display', 'flex');
            buildStep2FromUrlParams();
        }
        if (step == 3) {
            // Show loading until step 3 UI is ready
            $('#form-loading').css('display', 'flex');
            buildStep3FromUrlParams();
        }

        if (step === 'success') {
            // Success page - booking ID is passed in URL
            var bookingId = TBKParams.get('bid');
            var paymentMethod = TBKParams.get('pm');

            if (bookingId) {
                $('#booking-success').show();
                $('#booking-id').text(bookingId);
                $('#step-1-fields,#step-2-vehicles,#step-3-details,.taxi-steps-nav').hide();

                if (paymentMethod && paymentMethod.toLowerCase() === 'stripe') {
                    $('#succcess-heading').hide();
                    // For Stripe, we need to fetch the payment form
                    fetchStripePaymentForm(bookingId);
                } else {
                    $('#succcess-heading').show();
                }
            } else {
                // No booking ID, redirect to start
                window.location.href = window.location.protocol + "//" + window.location.host + window.location.pathname;
            }
        }

        // Check for payment thank you step
        if (step === 'paymentThankYou' || getUrlParameter('finishType') === 'paymentThankYou') {
            handlePaymentThankYou();
        }

        initDateTimePickers();
        initLocationAutocomplete();

        $('#return-booking').on('change', function () {
            if ($(this).is(':checked')) {
                $('#return-booking-fields').slideDown();
                $('#return-pickup-address').val($('#destination-address').val());
                if ($('#destination-address').data('place_id')) {
                    $('#return-pickup-address').data('place_id', $('#destination-address').data('place_id'));
                } else {
                    $('#return-pickup-address').removeData('place_id');
                }
                $('#return-destination-address').val($('#pickup-address').val());
                if ($('#pickup-address').data('place_id')) {
                    $('#return-destination-address').data('place_id', $('#pickup-address').data('place_id'));
                } else {
                    $('#return-destination-address').removeData('place_id');
                }
            } else {
                $('#return-booking-fields').slideUp();
                clearFieldError('return-pickup-address');
                clearFieldError('return-destination-address');
                clearFieldError('return-date');
                clearFieldError('return-time');
            }
        });

        $(document).on('click', '.swap-return-location', function () {
            var tempAddress = $('#return-pickup-address').val();
            var tempLat = $('#return-pickup-lat').val();
            var tempLng = $('#return-pickup-lng').val();

            $('#return-pickup-address').val($('#return-destination-address').val());
            if ($('#return-destination-address').data('place_id')) {
                $('#return-pickup-address').data('place_id', $('#return-destination-address').data('place_id'));
            } else {
                $('#return-pickup-address').removeData('place_id');
            }

            $('#return-destination-address').val(tempAddress);
            if ($('#return-pickup-address').data('place_id')) {
                $('#return-destination-address').data('place_id', $('#return-pickup-address').data('place_id'));
            } else {
                $('#return-destination-address').removeData('place_id');
            }

            clearFieldError('return-pickup-address');
            clearFieldError('return-destination-address');
        });

        $('#calculate-price-btn').on('click', function () {
            if (validateBookingFields()) {
                calculatePrice();
            }
        });

        // By Hour Calculate Price button
        $('#byhour-calculate-price-btn').on('click', function () {
            if (validateByHourFields()) {
                calculateHourlyPrice();
            }
        });

        $('#confirm-booking-btn').on('click', function (e) {
            e.preventDefault();
            if (validateAllFields()) {
                createBooking();
            } else {
                $('html, body').animate({ scrollTop: ($('.field-error').first().offset().top - 100) }, 500);
            }
        });

        $('.location-target').on('click', function () {
            var input = $(this).siblings('.location-input');
            getCurrentLocation(input);
        });

        $('.taxi-form-control').on('input change', function () {
            clearFieldError($(this).attr('id'));
        });

        $(document).on('click', '.route-map-toggle', function (e) {
            e.preventDefault();
            var target = $(this).data('target');
            $(target).toggle();
            var vis = $(target).is(':visible');
            $(this).find('.route-map-toggle-text').text(vis ? taxi_booking_ajax.strings.hide_map : taxi_booking_ajax.strings.show_map);
            var key = target.indexOf('return') > -1 ? 'return' : 'outbound';
            if (vis && routeMaps[key] && routeMaps[key].map) { google.maps.event.trigger(routeMaps[key].map, 'resize') }
        });
    }

    function fetchInitConfig() {
        $.ajax({
            url: taxi_booking_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'taxi_init_v1',
                nonce: taxi_booking_ajax.nonce
            },
            success: function (response) {
                if (response.success && response.data) {
                    var data = response.data;

                    // Handle nested data.data structure if present
                    if (data.data && typeof data.data === 'object') {
                        data = data.data;
                    }

                    // If data has a config key, use that. Otherwise use data as config.
                    var newConfig = data.config ? data.config : data;

                    // Update By Hour duration dropdown based on service config
                    var services = data.services || newConfig.services || [];
                    updateByHourDurationOptions(services);

                    // Store config in currentBookingData (no TBKState)
                    currentBookingData.config = newConfig;
                }
            }
        });
    }

    function updateByHourDurationOptions(services) {
        if (!services || !Array.isArray(services) || services.length === 0) {
            return;
        }

        // Find the By Hour service (id: 7 or hide_location: 1)
        var byHourService = null;
        for (var i = 0; i < services.length; i++) {
            var svc = services[i];
            // Use parseInt to handle both string "7" and number 7
            if (parseInt(svc.id) === 7 || parseInt(svc.hide_location) === 1) {
                byHourService = svc;
                break;
            }
        }

        if (!byHourService) return;

        var minDuration = parseInt(byHourService.duration_min) || 1;
        var maxDuration = parseInt(byHourService.duration_max) || 24;

        // Ensure min is at least 1
        if (minDuration < 1) minDuration = 1;
        if (maxDuration < minDuration) maxDuration = minDuration;

        var $dropdown = $('#byhour-duration');
        if ($dropdown.length === 0) return;

        // Get current value to preserve selection
        var currentVal = parseInt($dropdown.val()) || minDuration;

        // Clear and rebuild options
        $dropdown.empty();
        for (var h = minDuration; h <= maxDuration; h++) {
            var label = h === 1 ? h + ' Hour' : h + ' Hours';
            $dropdown.append('<option value="' + h + '">' + label + '</option>');
        }

        // Restore selection if within range, otherwise use min
        if (currentVal >= minDuration && currentVal <= maxDuration) {
            $dropdown.val(currentVal);
        } else {
            $dropdown.val(minDuration);
        }
    }

    function setStep(n) {
        currentStep = n;
        $('.taxi-steps-nav li').removeClass('active');
        $('.taxi-steps-nav li[data-step="' + n + '"]').addClass('active');
        $('#step-1-fields,#step-2-vehicles,#step-3-details').hide();

        // Show taxi-steps navigation on all steps
        if (n === 1) {
            $('#step-1-fields').show();
            $('.taxi-steps').show();
        }
        if (n === 2) {
            $('#step-2-vehicles').show();
            $('.taxi-steps').show();
        }
        if (n === 3) {
            $('#step-3-details').show();
            $('.taxi-steps').show();
        }

        updateUrlParam('step', n);

        // Add loaded class to prevent flash on page load
        setTimeout(function () {
            $('.taxi-booking-widget').addClass('loaded');
        }, 50);
    }

    var selectedOutboundId = null, selectedOutboundTotal = 0, selectedReturnId = null, selectedReturnTotal = 0;

    // Check if this is a return booking using URL params (synchronous)
    function isReturnBookingSync() {
        var params = TBKParams.getBookingData();
        return params.ret === true;
    }

    // Legacy async version for backward compatibility (but now uses URL params)
    function isReturnBooking() {
        return Promise.resolve(isReturnBookingSync());
    }

    function updateProceedState() {
        var needReturn = isReturnBookingSync();
        var ok = !!selectedOutboundId && (!needReturn ? true : !!selectedReturnId);
        $('#proceed-step-3').prop('disabled', !ok);
        var sum = 0;
        if (selectedOutboundTotal) sum += selectedOutboundTotal;
        if (needReturn && selectedReturnTotal) sum += selectedReturnTotal;
        if (selectedOutboundId && (!needReturn || selectedReturnId)) {
            $('#step2-total-amount').text(formatAmount(sum));
            $('#step2-total').show();
        } else {
            $('#step2-total').hide();
        }
    }

    function formatAmount(a) { var num = parseFloat(a || 0); return num.toFixed(2) }

    function embedMap(id, start, end, waypoints, status, config) {

        if (!window.google || !google.maps) return;
        if (status == 'NOT_FOUND') return false;

        // Default config
        var defaults = {
            booking_map_zoom: 10,
            booking_map_draggable: 1,
            booking_map_zoomcontrol: 1,
            booking_map_scrollwheel: 0,
            google_region_code: taxi_booking_ajax.language === 'en' ? 'gb' : 'es',
            quote_avoid_highways: 0,
            quote_avoid_tolls: 0,
            quote_avoid_ferries: 0,
            quote_enable_shortest_route: 0
        };

        // Merge defaults with passed config
        config = $.extend({}, defaults, config || {});


        var directionsDisplay = new google.maps.DirectionsRenderer();
        var directionsService = new google.maps.DirectionsService();
        var map = new google.maps.Map(document.getElementById(id), {
            zoom: parseInt(config.booking_map_zoom),
            draggable: parseInt(config.booking_map_draggable),
            zoomControl: parseInt(config.booking_map_zoomcontrol),
            scrollwheel: parseInt(config.booking_map_scrollwheel),
            center: new google.maps.LatLng(51.5073509, -0.1277583)
        });
        directionsDisplay.setMap(map);

        var request = {
            origin: start,
            destination: end,
            provideRouteAlternatives: true,
            unitSystem: google.maps.UnitSystem.METRIC,
            travelMode: google.maps.TravelMode.DRIVING
        };

        if (config.google_region_code) {
            request.region = config.google_region_code;
        }

        if (config.quote_avoid_highways > 0) request.avoidHighways = true;
        if (config.quote_avoid_tolls > 0) request.avoidTolls = true;
        if (config.quote_avoid_ferries > 0) request.avoidFerries = true;

        var tempWaypoints = [];
        if (waypoints && Array.isArray(waypoints)) {
            $.each(waypoints, function (key, value) {
                tempWaypoints.push({
                    location: value,
                    stopover: true
                });
            });
        }

        if (tempWaypoints.length > 0) {
            request.waypoints = tempWaypoints;
            request.optimizeWaypoints = true;
        }

        directionsService.route(request, function (response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                var routeIndex = 0;
                var routeMinDistance = 0;
                var routeMinDuration = 0;

                if (response.routes.length > 0 && config.quote_enable_shortest_route > 0) {
                    for (var i = 0; i < response.routes.length; i++) {
                        var route = response.routes[i];
                        var distance = 0;
                        var duration = 0;
                        for (var j = 0; j < route.legs.length; j++) {
                            distance += route.legs[j].distance.value;
                            duration += route.legs[j].duration.value;
                        }
                        if ((routeMinDistance >= distance || routeMinDistance == 0) && config.quote_enable_shortest_route == 1) {
                            routeMinDistance = distance;
                            routeIndex = i;
                        }
                        if ((routeMinDuration >= duration || routeMinDuration == 0) && config.quote_enable_shortest_route == 2) {
                            routeMinDuration = duration;
                            routeIndex = i;
                        }
                    }
                }

                var route = response.routes[routeIndex];
                google.maps.event.trigger(document.getElementById(id), 'resize');

                response.routes = [];
                response.routes[0] = route;
                directionsDisplay.setDirections(response);
            }
        });
    }

    $('.taxi-steps-nav').on('click', 'li', function () {
        var s = parseInt($(this).data('step'), 10);
        // Only allow navigation to steps we've already visited
        if (s > currentStep) return;

        if (s === 1) {
            // Go back to step 1 - hydrate form from URL params
            TBKParams.hydrateStep1Form();
            setStep(1);
            return;
        }
        if (s === 2 && currentStep >= 2) {
            // Go back to step 2 - rebuild from URL params
            $('#form-loading').css('display', 'flex');
            buildStep2FromUrlParams();
            return;
        }
        if (s === 3 && currentStep >= 3) {
            setStep(3);
        }
    });

    function updateUrlParam(key, val) {
        var url = new URL(window.location.href);
        url.searchParams.set(key, String(val));
        history.replaceState({}, '', url.toString());
    }

    function toDMY(v) {
        if (!v) return '';
        if (v.indexOf('/') > -1) return v;
        var p = v.split('-');
        if (p.length === 3) return [p[2], p[1], p[0]].join('/');
        return v;
    }

    function buildStep2FromUrlParams() {
        var params = TBKParams.getBookingData();

        // Show loading
        $('#form-loading').css('display', 'flex');

        // Get timezone
        var timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // Prepare API data based on booking type
        var apiData = {
            action: 'taxi_calculate_price',
            nonce: taxi_booking_ajax.nonce,
            pickup_address: params.pickup,
            destination_address: params.type === 'by-hour' ? params.pickup : params.dest,
            pickup_date: params.date,
            pickup_time: params.time,
            timezone: timezone,
            passengers: params.pax,
            luggage: params.lug,
            pickup_place_id: params.pickup_pid,
            destination_place_id: params.type === 'by-hour' ? params.pickup_pid : params.dest_pid,
            return_booking: params.ret
        };

        // Add by-hour specific params
        if (params.type === 'by-hour') {
            apiData.service_id = 7;
            apiData.service_duration = parseInt(params.dur) || 1;
        }

        // Add return booking params
        if (params.ret) {
            apiData.return_pickup_address = params.ret_pickup;
            apiData.return_destination_address = params.ret_dest;
            apiData.return_date = params.ret_date;
            apiData.return_time = params.ret_time;
            apiData.return_pickup_place_id = params.ret_pickup_pid;
            apiData.return_destination_place_id = params.ret_dest_pid;
        }

        $.ajax({
            url: taxi_booking_ajax.ajax_url,
            type: 'POST',
            data: apiData,
            success: function(response) {
                $('#form-loading').hide();

                var payload = response && response.data ? response.data : null;

                if (!payload || payload.success !== true) {
                    $('#booking-error').html('<p>' + (payload && payload.message ? payload.message : taxi_booking_ajax.strings.error) + '</p>').show();
                    return;
                }

                // Store API response in currentBookingData for use in this page session
                currentBookingData.route1 = payload.booking ? payload.booking.route1 : null;
                currentBookingData.route2 = payload.booking ? payload.booking.route2 : null;
                currentBookingData.currencies = payload.currencies || [];
                currentBookingData.config = payload.config || {};
                currentBookingData.additional_items = payload.additional_items || [];

                // Add booking type info
                currentBookingData.bookingType = params.type;
                currentBookingData.passengers = params.pax;
                currentBookingData.luggage = params.lug;
                currentBookingData.pickupDate = params.date;
                currentBookingData.pickupTime = params.time;
                currentBookingData.returnDate = params.ret_date;
                currentBookingData.returnTime = params.ret_time;
                currentBookingData.isReturn = params.ret;
                currentBookingData.duration = params.dur;

                // Render Step 2 UI
                renderStep2UI(payload, params);
            },
            error: function() {
                $('#form-loading').hide();
                $('#booking-error').html('<p>' + taxi_booking_ajax.strings.error + '</p>').show();
            }
        });
    }

    // Render Step 2 UI from API response
    function renderStep2UI(payload, params) {
        var route1 = payload.booking ? payload.booking.route1 : null;
        var route2 = payload.booking ? payload.booking.route2 : null;
        var showReturn = params.ret && route2;

        if (!route1) {
            $('#booking-error').html('<p>' + taxi_booking_ajax.strings.error + '</p>').show();
            return;
        }

        // Populate currency selector
        var currencies = payload.currencies || [];
        if (Array.isArray(currencies) && currencies.length > 0) {
            var currencyOptions = '';
            var selectedCurrency = currencies[0].code;

            currencies.forEach(function(currency) {
                var selected = currency.code === selectedCurrency ? 'selected' : '';
                currencyOptions += '<option value="' + currency.code + '" data-symbol="' + escapeHtml(currency.symbol) + '" data-rate="' + currency.conversion_rate + '" ' + selected + '>' +
                    escapeHtml(currency.name) + ' (' + escapeHtml(currency.symbol) + ')' +
                    '</option>';
            });
            $('#currency-select').html(currencyOptions);
            $('#currency-selector-wrap').show();

            // Store default currency info
            currentBookingData.selectedCurrency = selectedCurrency;
            currentBookingData.selectedCurrencySymbol = currencies[0].symbol;
            currentBookingData.selectedCurrencyRate = parseFloat(currencies[0].conversion_rate) || 1.0;
        } else {
            $('#currency-selector-wrap').hide();
        }

        // Show/hide return tabs
        if (showReturn) {
            $('#step2-tabs').show();
        } else {
            $('#step2-tabs').hide();
        }

        // Render outbound vehicles
        var vehicles1 = Array.isArray(route1.vehicleButtons) ? route1.vehicleButtons : [];
        renderVehicles(vehicles1, { selected_currency_symbol: currentBookingData.selectedCurrencySymbol || '€', selected_currency_rate: currentBookingData.selectedCurrencyRate || 1.0 }, '#vehicle-list-outbound', params.v1 || null);
        $('#route-meta-outbound').html(route1.stepsText || '');

        // Pre-select vehicle if v1 is in URL params
        if (params.v1) {
            selectedOutboundId = params.v1;
            var selectedVehicle = vehicles1.find(function(v) { return String(v.id) === String(params.v1); });
            if (selectedVehicle) {
                selectedOutboundTotal = parseFloat(selectedVehicle.total || 0) * (currentBookingData.selectedCurrencyRate || 1.0);
            }
        }

        // Render map for outbound
        if (route1.address) {
            var mapConfig = payload.config || {};
            setTimeout(function() {
                embedMap('taxi-route-map-outbound', route1.address.start, route1.address.end, route1.waypoints || [], 'OK', mapConfig);
            }, 100);
        }
        $('#route-map-section-outbound').show();
        $('.route-map-toggle[data-target="#route-map-section-outbound"] .route-map-toggle-text').text(taxi_booking_ajax.strings.hide_map);

        // Render return route if applicable
        if (showReturn) {
            var vehicles2 = Array.isArray(route2.vehicleButtons) ? route2.vehicleButtons : [];
            renderVehicles(vehicles2, { selected_currency_symbol: currentBookingData.selectedCurrencySymbol || '€', selected_currency_rate: currentBookingData.selectedCurrencyRate || 1.0 }, '#vehicle-list-return', params.v2 || null);
            $('#route-meta-return').html(route2.stepsText || '');

            // Pre-select return vehicle if v2 is in URL params
            if (params.v2) {
                selectedReturnId = params.v2;
                var selectedVehicle2 = vehicles2.find(function(v) { return String(v.id) === String(params.v2); });
                if (selectedVehicle2) {
                    selectedReturnTotal = parseFloat(selectedVehicle2.total || 0) * (currentBookingData.selectedCurrencyRate || 1.0);
                }
            }

            if (route2.address) {
                var mapConfig = payload.config || {};
                setTimeout(function() {
                    embedMap('taxi-route-map-return', route2.address.start, route2.address.end, route2.waypoints || [], 'OK', mapConfig);
                }, 100);
            }
            $('#route-map-section-return').show();
            $('.route-map-toggle[data-target="#route-map-section-return"] .route-map-toggle-text').text(taxi_booking_ajax.strings.hide_map);
        }

        positionProceedButton();
        updateProceedStateFromParams();

        // Hide loading and show step 2
        $('#form-loading').hide();
        setStep(2);
    }

    // Update proceed button state using URL params approach
    function updateProceedStateFromParams() {
        var params = TBKParams.getBookingData();
        var needReturn = params.ret;
        var ok = !!selectedOutboundId && (!needReturn ? true : !!selectedReturnId);
        $('#proceed-step-3').prop('disabled', !ok);

        var sum = 0;
        if (selectedOutboundTotal) sum += selectedOutboundTotal;
        if (needReturn && selectedReturnTotal) sum += selectedReturnTotal;

        if (selectedOutboundId && (!needReturn || selectedReturnId)) {
            $('#step2-total-amount').text(formatAmount(sum));
            $('#step2-total').show();
        } else {
            $('#step2-total').hide();
        }
    }

    // New function: Build Step 3 using URL parameters (replaces buildStep3FromSession)
    function buildStep3FromUrlParams() {

        var params = TBKParams.getBookingData();

        // Set global vehicle IDs from URL params for use in getQuotePrice()
        if (params.v1) {
            selectedOutboundId = params.v1;
        }
        if (params.v2) {
            selectedReturnId = params.v2;
        }

        // Show loading
        $('#form-loading').css('display', 'flex');

        // Get timezone
        // var timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // Prepare quote request data
        var passengers = parseInt(params.pax) || 1;
        var luggage = parseInt(params.lug) || 0;
        var needReturn = params.ret;

        var booking = {
            scheduledRouteId: 0,
            serviceId: params.type === 'by-hour' ? 7 : 0,
            serviceDuration: params.type === 'by-hour' ? (parseInt(params.dur) || 1) : 0,
            preferred: {
                passengers: passengers,
                luggage: luggage,
                handLuggage: 0
            },
            routeReturn: needReturn ? 2 : 0,
            payment: 0,
            discountCode: '',
            route1: {
                address: {
                    start: params.pickup,
                    end: params.type === 'by-hour' ? params.pickup : params.dest,
                    startPlaceId: params.pickup_pid,
                    endPlaceId: params.type === 'by-hour' ? params.pickup_pid : params.dest_pid
                },
                date: params.date,
                time: params.time,
                passengers: passengers,
                childSeats: 0,
                babySeats: 0,
                infantSeats: 0,
                waitingTime: '',
                meetAndGreet: 0,
                vehicle: [{ id: parseInt(params.v1), amount: 1 }],
                items: []
            },
            route2: needReturn ? {
                address: {
                    start: params.ret_pickup,
                    end: params.ret_dest,
                    startPlaceId: params.ret_pickup_pid,
                    endPlaceId: params.ret_dest_pid
                },
                date: params.ret_date,
                time: params.ret_time,
                passengers: passengers,
                childSeats: 0,
                babySeats: 0,
                infantSeats: 0,
                waitingTime: '',
                meetAndGreet: 0,
                vehicle: [{ id: parseInt(params.v2 || params.v1), amount: 1 }],
                items: []
            } : {
                address: { start: '', end: '', startPlaceId: '', endPlaceId: '' },
                date: '',
                waitingTime: '',
                meetAndGreet: 0
            }
        };

        $.ajax({
            url: taxi_booking_ajax.ajax_url,
            type: 'POST',
            dataType: 'json',
            data: {
                action: 'taxi_request_quote',
                nonce: taxi_booking_ajax.nonce,
                booking: booking,
                task: 'quote',
                apiType: 'frontend'
            },
            success: function(res) {
                $('#form-loading').hide();
                

                if (!res || !res.success || !res.data) {
                    $('#booking-error').html('<p>' + taxi_booking_ajax.strings.error + '</p>').show();
                    return;
                }

                // Store quote response in currentBookingData
                currentBookingData.quoteResponse = res.data;
                currentBookingData.route1 = res.data.booking ? res.data.booking.route1 : null;
                currentBookingData.route2 = res.data.booking ? res.data.booking.route2 : null;
                currentBookingData.additional_items = res.data.additional_items || [];
                currentBookingData.paymentButtons = (res.data.booking && res.data.booking.paymentButtons) ? res.data.booking.paymentButtons : [];

                // Store booking params
                currentBookingData.bookingType = params.type;
                currentBookingData.passengers = params.pax;
                currentBookingData.luggage = params.lug;
                currentBookingData.pickupDate = params.date;
                currentBookingData.pickupTime = params.time;
                currentBookingData.returnDate = params.ret_date;
                currentBookingData.returnTime = params.ret_time;
                currentBookingData.isReturn = params.ret;
                currentBookingData.duration = params.dur;
                currentBookingData.selectedVehicleId = params.v1;
                currentBookingData.selectedVehicleIdR2 = params.v2;
                
                // Render Step 3 UI
                renderStep3UI(res.data, params);
            },
            error: function() {
                $('#form-loading').hide();
                $('#booking-error').html('<p>' + taxi_booking_ajax.strings.error + '</p>').show();
            }
        });
    }

    // Render Step 3 UI from quote response
    function renderStep3UI(quoteData, params) {
        var b = quoteData.booking || {};
        var r1 = b.route1 || {};
        var r2 = b.route2 || null;
        var needReturn = params.ret && !!r2;

        var isAirport_r1_1 = r1.isAirport;
        var isAirport_r1_2 = r1.isAirport2;
        var isAirport_r2_1 = r2 ? r2.isAirport : false;
        var isAirport_r2_2 = r2 ? r2.isAirport2 : false;

        // Get vehicle names from vehicle buttons
        var vname1 = '', vname2 = '';
        var vehicles1 = Array.isArray(r1.vehicleButtons) ? r1.vehicleButtons : [];
        var vehicles2 = needReturn && r2 && Array.isArray(r2.vehicleButtons) ? r2.vehicleButtons : [];

        var selectedV1 = vehicles1.find(function(v) { return String(v.id) === String(params.v1); });
        var selectedV2 = needReturn ? vehicles2.find(function(v) { return String(v.id) === String(params.v2 || params.v1); }) : null;

        if (selectedV1) vname1 = selectedV1.name || '';
        if (selectedV2) vname2 = selectedV2.name || '';

        // Store selected vehicle totals
        if (selectedV1) {
            currentBookingData.selectedVehicleTotal = parseFloat(selectedV1.total || 0);
        }
        if (selectedV2) {
            currentBookingData.selectedVehicleTotalR2 = parseFloat(selectedV2.total || 0);
        }

        // Build outbound summary
        var s1Parts = [];
        s1Parts.push(row(tr('date', 'Date'), toDMY(params.date || '')));
        s1Parts.push(row(tr('time', 'Time'), params.time || ''));
        s1Parts.push(row(tr('vehicle', 'Vehicle'), vname1 || ''));
        s1Parts.push(row(tr('pickup_from', 'Pick-up from'), safeAddr((r1.address && r1.address.start) || params.pickup || '')));
        if (isAirport_r1_1) s1Parts.push(rowInput(tr('landing_flight_id_number', 'Landing flight id number'), 'flight-r1-1'));
        s1Parts.push(row(tr('dropoff_to', 'Dropoff to'), safeAddr((r1.address && r1.address.end) || params.dest || '')));
        if (isAirport_r1_2) s1Parts.push(rowInput(tr('departure_flight_id_number', 'Departure flight id number'), 'flight-r1-2'));
        $('#summary-outbound').html(s1Parts.join(''));

        // Build return summary if needed
        if (needReturn) {
            $('#card-return').show();
            var s2Parts = [];
            s2Parts.push(row(tr('date', 'Date'), toDMY(params.ret_date || '')));
            s2Parts.push(row(tr('time', 'Time'), params.ret_time || ''));
            s2Parts.push(row(tr('vehicle', 'Vehicle'), vname2 || ''));
            s2Parts.push(row(tr('pickup_from', 'Pick-up from'), safeAddr((r2.address && r2.address.start) || params.ret_pickup || '')));
            if (isAirport_r2_1) s2Parts.push(rowInput(tr('landing_flight_id_number', 'Landing flight id number'), 'flight-r2-1'));
            s2Parts.push(row(tr('dropoff_to', 'Dropoff to'), safeAddr((r2.address && r2.address.end) || params.ret_dest || '')));
            if (isAirport_r2_2) s2Parts.push(rowInput(tr('departure_flight_id_number', 'Departure flight id number'), 'flight-r2-2'));
            $('#summary-return').html(s2Parts.join(''));
        } else {
            $('#card-return').hide();
        }

        // Display discount message if present (discount fields are inside booking object)
        if (b.discountMessage) {
            $('#discount-code').val(b.discountCode || '');
            $('#discount-message').html(b.discountMessage).css('display', 'block').show();
            // Add class 'success' or 'error' based on discountStatus
            if (b.discountStatus == 0) {
                $('#discount-message').addClass('error').removeClass('success');
            } else {
                $('#discount-message').addClass('success').removeClass('error');
            }
        } else {
            $('#discount-code').val('');
            $('#discount-message').hide().html('').removeClass('success error');
        }

        // Render additional items
        var additionalItems = quoteData.additional_items || [];
        renderAdditionalItems(additionalItems, '#card-outbound .additional-items-list', 'route1', []);
        if (needReturn) {
            renderAdditionalItems(additionalItems, '#card-return .additional-items-list', 'route2', []);
        }
        

        // Get currency from URL params or use defaults
        var selectedCurrencyCode = params.cur || 'EUR';
        var currencySymbol = params.cur_sym || '€';
        var conversionRate = parseFloat(params.cur_rate) || 1.0;

        // Store currency in currentBookingData
        currentBookingData.selectedCurrency = selectedCurrencyCode;
        currentBookingData.selectedCurrencySymbol = currencySymbol;
        currentBookingData.selectedCurrencyRate = conversionRate;

        // Render price breakdown
        renderInboundReturnBreakdownFromSession(b, conversionRate, currencySymbol);

        // Update total (check root level first, then booking level)
        var grand = b.totalPriceWithDiscount || b.totalPrice || 0;
        var convertedGrand = grand * conversionRate;
        $('#step3-total-amount').text(formatAmount(convertedGrand));
        $('#pay-card-total').text(currencySymbol + formatAmount(convertedGrand));
        $('.currency').text(currencySymbol);

        // console.log(quoteData.paymentButtons, b.paymentButtons);
        // return;
        

        // Render payment buttons (check root level first)
        renderPaymentButtons(b.paymentButtons, conversionRate, currencySymbol);

        // Hide More Options for hourly bookings
        if (params.type === 'by-hour') {
            $('.summary-more').hide();
            $('.options-panel').hide();
            $('#card-outbound .summary-title').text('Per Hour Booking');
        } else {
            $('#card-outbound .summary-title').text('Outbound');
        }
        // Hide loading and show step 3
        $('#form-loading').hide();
        setStep(3);
    }

    function tr(k, d) { return (taxi_booking_ajax && taxi_booking_ajax.strings && taxi_booking_ajax.strings[k]) || d || k }
    function row(k, v) { return '<div class="summary-row"><div class="summary-key">' + escapeHtml(k) + ':</div><div class="summary-val">' + escapeHtml(v || '') + '</div></div>' }
    function safeAddr(s) { return escapeHtml(String(s || '')) }

    function rowInput(label, id) {
        return '<div class="summary-row d-flex"><div class="summary-key label">' + escapeHtml(label) + '</div><div class="summary-value ml-auto"><input type="text" id="' + id + '" class="tbk-input flight-input taxi-form-control" placeholder="eg. BA 222"></div></div>';
    }

    function bindFlightInputs() {
        // Flight input values are collected directly from DOM when createBooking is called
        // No need to persist to state - just bind handlers for validation if needed
        $('#flight-r1-1,#flight-r1-2,#flight-r2-1,#flight-r2-2').off('input change').on('input change', function() {
        });
    }

    function renderPaymentButtons(btns, conversionRate, currencySymbol) {
        conversionRate = conversionRate || 1.0;
        currencySymbol = currencySymbol || '€';
        

        var html = '';
        btns.forEach(function (b) {
            if (b.hidden && parseInt(b.hidden) === 1) return;
            var cls = 'pay-btn pay-' + b.name.toLowerCase().replace(/\s+/g, '-');
            var baseTotal = parseFloat(b.totalWithCharge || b.total) || 0;
            var convertedTotal = (baseTotal * conversionRate).toFixed(2);
            var imageHtml = b.image && b.image !== '' ? '<img src="' + escapeHtml(b.image) + '" alt="' + escapeHtml(b.name) + '" class="pay-image">' : '';
            html += '<button type="button" class="' + cls + '" data-id="' + b.id + '">' +
                imageHtml +
                '<span class="pay-total">' + escapeHtml(currencySymbol) + convertedTotal + '</span>' +
                '<span class="pay-label">' + escapeHtml(b.name) + '</span>' +
                '</button>';
        });
        $('#payment-buttons').html(html);
    }

    function renderAdditionalItems(items, containerSelector, routePrefix, selectedItems) {
        // console.log('Rendering items for', routePrefix, items, 'with selections:', selectedItems);

        if (!items || typeof items !== 'object') {
            $(containerSelector).html('');
            return;
        }

        // Create a map of selected items for easy lookup
        var selectedMap = {};
        if (selectedItems && Array.isArray(selectedItems)) {
            selectedItems.forEach(function (item) {
                selectedMap[item.id] = item;
            });
        }

        var html = '';
        // Handle both array and object formats
        var itemsArray = Array.isArray(items) ? items : Object.values(items);
        itemsArray.forEach(function (item) {

            var label = escapeHtml(item.label || '');
            var price = parseFloat(item.price || 0).toFixed(2);
            var type = item.type;
            var itemId = item.id;
            // Add route prefix to make IDs unique for outbound/return
            var uniqueId = routePrefix + '_' + itemId;

            // Get user's previous selection for this item
            var userSelection = selectedMap[itemId];


            html += `<div class="extra-item" style="margin-bottom: 15px;">`;

            // Render based on type
            if (type === 'custom') {
                // Custom select dropdown
                var selectedValue = userSelection ? (userSelection.custom || '') : '';
                html += `
                <label class="option-label" style="display: block; margin-bottom: 5px;">
                    ${label} ${item.price > 0 ? `(€${price})` : ''}
                </label>
                <select
                    id="extra_${uniqueId}"
                    class="extra-select"
                    data-item-id="${itemId}"
                    data-route="${routePrefix}"
                    data-price="${item.price}"
                    style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
                >
                    <option value="">Select an option</option>
            `;

                item.options.forEach(function (option) {
                    var selected = selectedValue === option ? 'selected' : '';
                    html += `<option value="${escapeHtml(option)}" ${selected}>${escapeHtml(option)}</option>`;
                });

                html += `</select>`;

            } else if (type === 'amount') {
                var maxAmount = parseInt(item.amount || 1);

                // ALWAYS use sessionStorage as source of truth for checkbox state
                var checkboxKey = 'tbk_checkbox_' + routePrefix + '_' + itemId;
                var dropdownKey = 'tbk_dropdown_' + routePrefix + '_' + itemId;
                var storedCheckbox = sessionStorage.getItem(checkboxKey);
                var storedDropdown = sessionStorage.getItem(dropdownKey);

                var selectedAmount;
                if (storedCheckbox === 'checked') {
                    // Checkbox is checked in sessionStorage
                    selectedAmount = storedDropdown || '1';
                } else {
                    // Checkbox is unchecked or not set in sessionStorage
                    selectedAmount = '0';
                }

                var isChecked = selectedAmount !== '0' && selectedAmount !== '' ? 'checked' : '';
                var dropdownVisible = isChecked ? 'flex' : 'none';

                // Always show checkbox for amount type items
                html += `
                <div class="extra-amount-wrapper" data-unique-id="${uniqueId}">
                    <div style="display: flex; align-items: center;">
                        <input
                            type="checkbox"
                            id="extra_checkbox_${uniqueId}"
                            class="extra-toggle-checkbox option-checkbox"
                            data-unique-id="${uniqueId}"
                            data-item-id="${itemId}"
                            data-route="${routePrefix}"
                            data-price="${item.price}"
                            ${isChecked}
                        >
                        <label
                            for="extra_checkbox_${uniqueId}"
                            class="option-label"
                            style="margin: 0;"
                        >
                            ${label} (€${price})
                        </label>
                `;

                // If maxAmount > 1, show quantity dropdown
                if (maxAmount > 1) {
                    html += `
                        <select
                            id="extra_${uniqueId}"
                            class="extra-amount-select extra-select extra-quantity-dropdown"
                            data-item-id="${itemId}"
                            data-route="${routePrefix}"
                            data-price="${item.price}"
                            style="padding: 8px; border: 1px solid #ddd; border-radius: 4px; min-width: 90px; margin-left: 20px; display: ${dropdownVisible};"
                        >
                            <option value="0">Select quantity</option>
                    `;

                    // Generate options from 1 to maxAmount
                    for (var i = 1; i <= maxAmount; i++) {
                        var selected = selectedAmount === String(i) ? 'selected' : '';
                        html += `<option value="${i}" ${selected}>${i}</option>`;
                    }

                    html += `</select>`;
                }

                html += `
                    </div>
                </div>
                `;

            } else if (type === 'input') {
                // Regular text input
                var inputValue = userSelection ? (userSelection.custom || '') : '';
                html += `
                <label class="option-label" style="display: block; margin-bottom: 5px;">
                    ${label} ${item.price > 0 ? `(€${price})` : ''}
                </label>
                <input
                    type="text"
                    id="extra_${uniqueId}"
                    class="extra-input"
                    data-item-id="${itemId}"
                    data-route="${routePrefix}"
                    data-price="${item.price}"
                    placeholder="${escapeHtml(item.params.placeholder || '')}"
                    value="${escapeHtml(inputValue)}"
                    style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
                >
            `;

            } else if (type === 'address') {
                // Address textarea
                var textValue = userSelection ? (userSelection.custom || '') : '';
                html += `
                <label class="option-label" style="display: block; margin-bottom: 5px;">
                    ${label} ${item.price > 0 ? `(€${price})` : ''}
                </label>
                <textarea
                    id="extra_${uniqueId}"
                    class="extra-address"
                    data-item-id="${itemId}"
                    data-route="${routePrefix}"
                    data-price="${item.price}"
                    placeholder="${escapeHtml(item.params.placeholder || '')}"
                    rows="3"
                    style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; resize: vertical;"
                >${escapeHtml(textValue)}</textarea>
            `;
            }

            html += `</div>`;
        });

        $(containerSelector).html(html);
    }


    // Proceed to Step 3 - redirect with URL params including vehicle selection
    $('#proceed-step-3').off('click').on('click', function () {
        var $btn = $(this);
        var params = TBKParams.getBookingData();
        var needReturn = params.ret;

        // Validate vehicle selection
        if (!selectedOutboundId || (needReturn && !selectedReturnId)) {
            $btn.prop('disabled', false);
            return;
        }

        // Build URL params for step 3, including vehicle IDs and currency
        var urlParams = TBKParams.getAll();
        urlParams.step = 3;
        urlParams.v1 = selectedOutboundId;
        if (needReturn && selectedReturnId) {
            urlParams.v2 = selectedReturnId;
        }

        // Add selected currency to URL params
        if (currentBookingData.selectedCurrency) {
            urlParams.cur = currentBookingData.selectedCurrency;
            urlParams.cur_sym = currentBookingData.selectedCurrencySymbol || '€';
            urlParams.cur_rate = currentBookingData.selectedCurrencyRate || 1;
        }

        // Redirect to Step 3 with all parameters
        var redirectUrl = TBKParams.buildUrl('/booking', urlParams);
        window.location.href = redirectUrl;
    });

    // Handle step 3 for hourly bookings
    function proceedStep3Hourly($btn, payload) {
        if (!selectedOutboundId) {
            $btn.prop('disabled', false);
            hideFormLoading();
            return;
        }

        var b = payload.booking || {};
        var r1 = b.route1 || {};
        var pref = b.preferred || {};
        var passengers = payload.passengers != null ? parseInt(payload.passengers) : (pref.passengers != null ? parseInt(pref.passengers) : 1);
        var luggage = payload.luggage != null ? parseInt(payload.luggage) : (pref.luggage != null ? parseInt(pref.luggage) : 0);

        // Save selected vehicle ID
        payload.selected_vehicle_id = selectedOutboundId;
        delete payload.selected_vehicle_id_r2;

        TBKState.put({ taxi_booking_payload: payload }).then(function () {
            var booking = {
                serviceId: 7,
                serviceDuration: parseInt(payload.byhour_duration || b.serviceDuration || 1),
                preferred: {
                    passengers: isNaN(passengers) ? 1 : passengers,
                    luggage: isNaN(luggage) ? 0 : luggage
                },
                route1: {
                    address: {
                        start: (r1.address && r1.address.start) || '',
                        startPlaceId: (r1.address && r1.address.startPlaceId) || ''
                    },
                    date: payload.pickup_date || r1.date || '',
                    time: payload.pickup_time || r1.time || '',
                    vehicle: [{ id: parseInt(selectedOutboundId), amount: 1 }]
                }
            };

            $.ajax({
                url: taxi_booking_ajax.ajax_url,
                type: 'POST',
                dataType: 'json',
                data: {
                    action: 'taxi_request_quote',
                    nonce: taxi_booking_ajax.nonce,
                    booking: booking,
                    task: 'quote',
                    apiType: 'frontend'
                },
                success: function (res) {
                    hideFormLoading();
                    $btn.prop('disabled', false);

                    if (!res || !res.success || !res.data) {
                        $('#booking-error').html('<p>' + taxi_booking_ajax.strings.error + '</p>').show();
                        return;
                    }

                    payload.selected_vehicle_total = selectedOutboundTotal || 0;
                    payload.quote_response = res.data;

                    TBKState.put({ taxi_booking_payload: payload }).then(function () {
                        window.location.href = TBKParams.buildUrl('/booking', { step: 3 });
                    });
                },
                error: function () {
                    hideFormLoading();
                    $btn.prop('disabled', false);
                    $('#booking-error').html('<p>' + taxi_booking_ajax.strings.error + '</p>').show();
                }
            });
        });
    }

    function getQuotePrice() {
        // Use currentBookingData and URL params instead of TBKState
        var params = TBKParams.getBookingData();
        var needReturn = params.ret;
        var p = currentBookingData || {};
        var b = p.booking || {};
        // Check both quote_response and quoteResponse (different naming conventions used)
        var quoteResp = p.quote_response || p.quoteResponse || {};
        var q = quoteResp.booking ? quoteResp.booking : {};

        showFormLoading();

        // Get vehicle IDs from multiple sources - URL params, global vars, currentBookingData, or DOM
        var currentSelectedOutboundId = selectedOutboundId || params.v1 || p.selectedVehicleId || $('.vehicle-card.outbound.selected').data('id') || null;
        var currentSelectedReturnId = selectedReturnId || params.v2 || p.selectedVehicleIdR2 || $('.vehicle-card.return.selected').data('id') || null;

        if (!currentSelectedOutboundId || (needReturn && !currentSelectedReturnId)) {
            hideFormLoading();
            console.log('getQuotePrice: Missing vehicle ID - outbound:', currentSelectedOutboundId, 'return:', currentSelectedReturnId, 'needReturn:', needReturn);
            return;
        }

        var pref = b.preferred || {};
        var r1 = q.route1 || p.route1 || {};
        var r2 = q.route2 || p.route2 || {};

        var r1Date = params.date || '';
        var r1Time = params.time || '';
        var r2Date = needReturn ? (params.ret_date || '') : '';
        var r2Time = needReturn ? (params.ret_time || '') : '';

        var passengers = parseInt(params.pax) || 1;
        var luggage = parseInt(params.lug) || 0;

        var route1Items = collectAdditionalItemsFromDOM('#card-outbound .additional-items-list');
        var route2Items = needReturn ? collectAdditionalItemsFromDOM('#card-return .additional-items-list') : [];

        // Collect child seats from DOM
        var r1ChildSeats = parseInt($('#card-outbound .seat-child').val() || 0);
        var r1BabySeats = parseInt($('#card-outbound .seat-booster').val() || 0);
        var r1InfantSeats = parseInt($('#card-outbound .seat-infant').val() || 0);

        var r2ChildSeats = parseInt($('#card-return .seat-child').val() || 0);
        var r2BabySeats = parseInt($('#card-return .seat-booster').val() || 0);
        var r2InfantSeats = parseInt($('#card-return .seat-infant').val() || 0);

        var booking = {
            scheduledRouteId: parseInt(b.scheduledRouteId || 0),
            serviceId: parseInt(b.serviceId || 0),
            serviceDuration: parseInt(b.serviceDuration || 0),
            preferred: {
                passengers: passengers,
                luggage: luggage,
                handLuggage: parseInt(pref.handLuggage || 0)
            },
            routeReturn: needReturn ? 2 : 0,
            payment: 0,
            discountCode: b.discountCode || $('#discount-code').val() || '',
            route1: {
                address: {
                    start: params.pickup || (r1.address && r1.address.start) || '',
                    end: params.dest || (r1.address && r1.address.end) || '',
                    startPlaceId: params.pickup_pid || (r1.address && r1.address.startPlaceId) || '',
                    endPlaceId: params.dest_pid || (r1.address && r1.address.endPlaceId) || ''
                },
                date: r1Date,
                time: r1Time,
                passengers: passengers,
                childSeats: r1ChildSeats,
                babySeats: r1BabySeats,
                infantSeats: r1InfantSeats,
                waitingTime: r1.waitingTime || '',
                meetAndGreet: parseInt(r1.meetAndGreet || 0),
                vehicle: [{ id: parseInt(currentSelectedOutboundId), amount: 1 }],
                items: route1Items || []
            },
            route2: needReturn ? {
                address: {
                    start: params.ret_pickup || (r2.address && r2.address.start) || '',
                    end: params.ret_dest || (r2.address && r2.address.end) || '',
                    startPlaceId: params.ret_pickup_pid || (r2.address && r2.address.startPlaceId) || '',
                    endPlaceId: params.ret_dest_pid || (r2.address && r2.address.endPlaceId) || ''
                },
                date: r2Date,
                time: r2Time,
                passengers: passengers,
                childSeats: r2ChildSeats,
                babySeats: r2BabySeats,
                infantSeats: r2InfantSeats,
                waitingTime: r2.waitingTime || '',
                meetAndGreet: parseInt(r2.meetAndGreet || 0),
                vehicle: [{ id: parseInt(currentSelectedReturnId), amount: 1 }],
                items: route2Items || []
            } : {
                address: { start: '', end: '', startPlaceId: '', endPlaceId: '' },
                date: '',
                time: '',
                waitingTime: '',
                meetAndGreet: 0
            }
        };

        $.ajax({
            url: taxi_booking_ajax.ajax_url,
            type: 'POST',
            dataType: 'json',
            data: {
                action: 'taxi_request_quote',
                nonce: taxi_booking_ajax.nonce,
                booking: booking,
                task: 'quote',
                apiType: 'frontend'
            },
            success: function (res) {
                hideFormLoading();
                $('#proceed-step-3').prop('disabled', false);
                // console.log('getQuotePrice success:', res);
                if (!res || !res.success || !res.data) {
                    // console.log('getQuotePrice: Invalid response');
                    $('#booking-error').html('<p>' + taxi_booking_ajax.strings.error + '</p>').show();
                    return;
                }

                // Update currentBookingData with new quote response
                currentBookingData.quote_response = res.data;
                currentBookingData.selected_vehicle_id = currentSelectedOutboundId;
                currentBookingData.selected_vehicle_total = selectedOutboundTotal || 0;

                if (needReturn) {
                    currentBookingData.selected_vehicle_id_r2 = currentSelectedReturnId;
                    currentBookingData.selected_vehicle_total_r2 = selectedReturnTotal || 0;
                }

                // Ensure booking objects exist
                if (!currentBookingData.quote_response.booking) currentBookingData.quote_response.booking = {};
                if (!currentBookingData.quote_response.booking.route1) currentBookingData.quote_response.booking.route1 = {};
                if (!currentBookingData.booking) currentBookingData.booking = {};
                if (!currentBookingData.booking.route1) currentBookingData.booking.route1 = {};

                // Restore user's selected items after API response
                currentBookingData.quote_response.booking.route1.items = route1Items;
                currentBookingData.booking.route1.items = route1Items;

                if (needReturn) {
                    if (!currentBookingData.quote_response.booking.route2) currentBookingData.quote_response.booking.route2 = {};
                    if (!currentBookingData.booking.route2) currentBookingData.booking.route2 = {};
                    currentBookingData.quote_response.booking.route2.items = route2Items;
                    currentBookingData.booking.route2.items = route2Items;
                }

                // Update step 3 price display
                updateStep3PriceDisplay(res.data);
            },
            error: function () {
                hideFormLoading();
                $('#proceed-step-3').prop('disabled', false);
                $('#booking-error').html('<p>' + taxi_booking_ajax.strings.error + '</p>').show();
            }
        });
    }

    // Helper to update step 3 price display after quote refresh
    function updateStep3PriceDisplay(quoteData) {
        if (!quoteData || !quoteData.booking) return;

        var b = quoteData.booking || {};

        // Get currency info
        var conversionRate = currentBookingData.selectedCurrencyRate || 1.0;
        var currencySymbol = currentBookingData.selectedCurrencySymbol || '€';

        // Re-render the fare breakdown
        renderInboundReturnBreakdownFromSession(b, conversionRate, currencySymbol);

        // Update grand total
        var grand = b.totalPriceWithDiscount || b.totalPrice || 0;
        var convertedGrand = grand * conversionRate;
        $('#step3-total-amount').text(formatAmount(convertedGrand));
        $('#pay-card-total').text(currencySymbol + formatAmount(convertedGrand));

        // Display discount message (discount fields are inside booking object)
        if (b.discountMessage) {
            $('#discount-code').val(b.discountCode || '');
            $('#discount-message').html(b.discountMessage).css('display', 'block').show();
            // Add class 'success' or 'error' based on discountStatus
            if (b.discountStatus == 0) {
                $('#discount-message').addClass('error').removeClass('success');
            } else {
                $('#discount-message').addClass('success').removeClass('error');
            }
        } else {
            $('#discount-message').hide().html('').removeClass('success error');
        }

        // Update payment buttons if present
        if (quoteData.paymentButtons || b.paymentButtons) {
            renderPaymentButtons(quoteData.paymentButtons || b.paymentButtons, conversionRate, currencySymbol);
        }
    }

    $(document).on('click', '.auth-tab', function () {
        $('.auth-tab').removeClass('active');
        $(this).addClass('active');
        var tab = $(this).data('tab');
        $('.auth-body').hide();
        $('.auth-body[data-pane="' + tab + '"]').show();
        var $wrap = $('#step-3-details');
        if (tab === 'guest') {
            // Remove keep-width to restore visibility, but respect original display state
            $wrap.find('.step3-item').removeClass('keep-width').each(function () {
                // Skip showing the return card if it was originally hidden (non-return bookings)
                if ($(this).attr('id') === 'card-return' && $(this).css('display') === 'none') {
                    return; // Skip this element
                }
                $(this).show();
            });
        } else {
            $wrap.find('.step3-item').not('.auth-card').addClass('keep-width');
            $wrap.find('.auth-card').removeClass('keep-width').show();
        }
    });

    $(document).on('change', '.summary-more .more-toggle', function () {
        var $card = $(this).closest('.summary-card'); $card.find('.options-panel').slideToggle(150)
    });

    $(document).on('change', '.options-panel .require-child-seat', function () {
        var $p = $(this).closest('.options-panel'); if ($(this).is(':checked')) { $p.find('.child-seat-rows').slideDown(120) } else { $p.find('.child-seat-rows').slideUp(120); $p.find('.seat-input').val(0) }
        persistSeatExtrasFromDOM(false)
    });

    $(document).on('input', '.seat-input', function () { persistSeatExtrasFromDOM() });
    $('#notes-outbound, #notes-return').blur(function () {
        persistSeatExtrasFromDOM(false);
    });

    // Event handlers for additional items
    $(document).on('change', '.extra-select', function () {
        persistSeatExtrasFromDOM();
    });

    $(document).on('change', '.extra-checkbox', function () {
        persistSeatExtrasFromDOM();
    });

    // Handler for toggle checkbox (amount type items)
    $(document).on('change', '.extra-toggle-checkbox', function () {
        var uniqueId = $(this).data('unique-id');
        var itemId = $(this).data('item-id');
        var route = $(this).data('route');
        var isChecked = $(this).is(':checked');
        var $dropdown = $('#extra_' + uniqueId);

        // Save checkbox state to sessionStorage
        var storageKey = 'tbk_checkbox_' + route + '_' + itemId;
        if (isChecked) {
            sessionStorage.setItem(storageKey, 'checked');
        } else {
            sessionStorage.removeItem(storageKey);
        }

        // If there's a dropdown (maxAmount > 1)
        if ($dropdown.length > 0) {
            if (isChecked) {
                // Show the dropdown
                $dropdown.css('display', 'flex');
                // Set default value to 1 if not already set
                if ($dropdown.val() === '0' || $dropdown.val() === '') {
                    $dropdown.val('1');
                }
                // Save dropdown value to sessionStorage
                sessionStorage.setItem('tbk_dropdown_' + route + '_' + itemId, '1');
            } else {
                // Hide the dropdown and reset to 0
                $dropdown.css('display', 'none');
                $dropdown.val('0');
                // Remove dropdown value from sessionStorage
                sessionStorage.removeItem('tbk_dropdown_' + route + '_' + itemId);
            }
        }
        // Refresh quote to update prices
        persistSeatExtrasFromDOM();
    });

    // Handler for dropdown quantity change
    $(document).on('change', '.extra-amount-select', function () {
        var itemId = $(this).data('item-id');
        var route = $(this).data('route');
        var value = $(this).val();

        // Save dropdown value to sessionStorage
        if (value && value !== '0') {
            sessionStorage.setItem('tbk_dropdown_' + route + '_' + itemId, value);
        } else {
            sessionStorage.removeItem('tbk_dropdown_' + route + '_' + itemId);
        }

        // Refresh quote to update prices
        persistSeatExtrasFromDOM();
    });

    // For text inputs and textareas, only trigger on blur (focus out)
    $(document).on('blur', '.extra-input', function () {
        persistSeatExtrasFromDOM();
    });

    $(document).on('blur', '.extra-address', function () {
        persistSeatExtrasFromDOM();
    });

    // Event handlers for customer details (persist on blur to avoid too many calls)
    $('#customer-name, #customer-email, #customer-phone').on('blur', function () {
        persistSeatExtrasFromDOM(false);
    });

    $('input[name="payment_method"]').on('change', function () {
        persistSeatExtrasFromDOM(false);
    });

    $('#accept-terms').on('change', function () {
        persistSeatExtrasFromDOM(false);
    });

    // Event handlers for "Book for someone else"
    $('#book-for-someone').on('change', function () {
        persistSeatExtrasFromDOM(false);
    });

    $('#bo-name, #bo-email, #bo-phone').on('blur', function () {
        persistSeatExtrasFromDOM(false);
    });

    // on focus out discount-code field
    $('#apply-discount-btn').on('click', function () {
        var code = $('#discount-code').val() || '';
        // Store discount code in currentBookingData and refresh quote
        if (!currentBookingData.booking) currentBookingData.booking = {};
        currentBookingData.booking.discountCode = code;
        getQuotePrice();
    });

    // Function to collect additional items data from DOM for a specific container
    function collectAdditionalItemsFromDOM(containerSelector) {
        var items = [];
        var seenIds = {}; // Track IDs to prevent duplicates

        // Collect data from extra items in the specified container
        $(containerSelector).find('.extra-item').each(function () {
            var $item = $(this);

            // Check if this is a toggle checkbox with dropdown (maxAmount > 1)
            var $toggleCheckbox = $item.find('.extra-toggle-checkbox');
            var $dropdown = $item.find('.extra-amount-select');

            var $input;
            if ($toggleCheckbox.length > 0 && $dropdown.length > 0) {
                // Has toggle checkbox with dropdown - use dropdown for data
                $input = $dropdown;
            } else if ($toggleCheckbox.length > 0 && $dropdown.length === 0) {
                // Has toggle checkbox but no dropdown (maxAmount === 1) - use checkbox for data
                $input = $toggleCheckbox;
            } else {
                // Regular inputs
                $input = $item.find('.extra-select, .extra-checkbox, .extra-input, .extra-address');
            }

            if ($input.length === 0) return;

            var itemId = $input.data('item-id');

            // Skip if we've already seen this ID (prevent duplicates)
            if (seenIds[itemId]) {
                console.warn('Duplicate item ID detected and skipped:', itemId);
                return;
            }

            var type = '';
            var amount = '0';
            var custom = null;
            var shouldInclude = false;

            if ($input.hasClass('extra-amount-select')) {
                // Amount dropdown (for items with amount > 1)
                type = 'amount';
                amount = $input.val() || '0';
                custom = null;
                // Only include if a quantity > 0 is selected
                shouldInclude = (amount && amount !== '0');
            } else if ($input.hasClass('extra-toggle-checkbox')) {
                // Toggle checkbox (for amount type items with maxAmount === 1)
                type = 'amount';
                amount = $input.is(':checked') ? '1' : '0';
                custom = null;
                // Only include if checkbox is checked
                shouldInclude = $input.is(':checked');
            } else if ($input.hasClass('extra-select')) {
                // Custom select dropdown
                type = 'custom';
                custom = $input.val() || '';
                amount = '0';
                // Only include if a value is selected
                shouldInclude = (custom && custom !== '');
            } else if ($input.hasClass('extra-checkbox')) {
                // Regular checkbox (old style - kept for compatibility)
                type = 'amount';
                amount = $input.is(':checked') ? '1' : '0';
                custom = null;
                // Only include if checkbox is checked
                shouldInclude = $input.is(':checked');
            } else if ($input.hasClass('extra-input')) {
                type = 'input';
                custom = $input.val() || '';
                amount = '0';
                // Only include if input has value (trim to handle whitespace)
                shouldInclude = (custom && custom.trim() !== '');
            } else if ($input.hasClass('extra-address')) {
                type = 'address';
                custom = $input.val() || '';
                amount = '0';
                // Only include if textarea has value (trim to handle whitespace/newlines)
                shouldInclude = (custom && custom.trim() !== '');
            }

            // Only add to items array if there's actual data
            if (shouldInclude) {
                seenIds[itemId] = true; // Mark this ID as seen
                items.push({
                    id: itemId,
                    amount: amount,
                    custom: custom,
                    type: type
                });
            }
        });

        return items;
    }

    function persistSeatExtrasFromDOM(updatePrice) {
        if (typeof updatePrice === 'undefined') updatePrice = true;

        // Use currentBookingData instead of TBKState
        var p = currentBookingData || {};
        // Check both quote_response and quoteResponse (different naming conventions used)
        var quoteResp = p.quote_response || p.quoteResponse;

        if (!p.booking) p.booking = {};
        if (!p.booking.route1) p.booking.route1 = {};
        var ob = $('#card-outbound');
        p.booking.route1.childSeats = parseInt(ob.find('.seat-booster').val() || 0);
        p.booking.route1.babySeats = parseInt(ob.find('.seat-child').val() || 0);
        p.booking.route1.infantSeats = parseInt(ob.find('.seat-infant').val() || 0);
        p.booking.route1.notes = $('#notes-outbound').val() || '';

        // Collect additional items for route1 (outbound)
        var route1Items = collectAdditionalItemsFromDOM('#card-outbound .additional-items-list');
        p.booking.route1.items = route1Items;
        if (quoteResp && quoteResp.booking && quoteResp.booking.route1) {
            quoteResp.booking.route1.items = route1Items;
        }

        var rb = $('#card-return');
        if (rb.length && rb.is(':visible')) {
            if (!p.booking.route2) p.booking.route2 = {};
            p.booking.route2.childSeats = parseInt(rb.find('.seat-booster').val() || 0);
            p.booking.route2.babySeats = parseInt(rb.find('.seat-child').val() || 0);
            p.booking.route2.infantSeats = parseInt(rb.find('.seat-infant').val() || 0);
            p.booking.route2.notes = $('#notes-return').val() || '';

            // Collect additional items for route2 (return)
            var route2Items = collectAdditionalItemsFromDOM('#card-return .additional-items-list');
            p.booking.route2.items = route2Items;
            if (quoteResp && quoteResp.booking && quoteResp.booking.route2) {
                quoteResp.booking.route2.items = route2Items;
            }
        }

        var step3Data = {};
        step3Data['name'] = $('#customer-name').val() || '';
        step3Data['email'] = $('#customer-email').val() || '';
        step3Data['phone'] = $('#customer-phone').val() || '';
        // Save full phone number with country code if intl-tel-input is initialized
        if (customerPhoneIti) {
            step3Data['phone_full'] = customerPhoneIti.getNumber();
            step3Data['phone_country'] = customerPhoneIti.getSelectedCountryData().iso2;
        }
        step3Data['payment_method'] = $('input[name="payment_method"]:checked').val() || '';
        step3Data['terms'] = $('#accept-terms').is(':checked');

        // Save "Book for someone else" data
        var bookForElse = $('#book-for-someone').is(':checked');
        step3Data['book_for_else'] = bookForElse;
        if (bookForElse) {
            step3Data['bo_name'] = $('#bo-name').val() || '';
            step3Data['bo_email'] = $('#bo-email').val() || '';
            step3Data['bo_phone'] = $('#bo-phone').val() || '';
            if (boPhoneIti) {
                step3Data['bo_phone_full'] = boPhoneIti.getNumber();
                step3Data['bo_phone_country'] = boPhoneIti.getSelectedCountryData().iso2;
            }
        }

        p.step3 = step3Data;
        currentBookingData = p;

        if (updatePrice !== false) {
            getQuotePrice();
        }
    }

    function renderRouteBreakdown(route, cardSelector, totalPrice, conversionRate, currencySymbol) {
        conversionRate = conversionRate || 1.0;
        currencySymbol = currencySymbol || '€';

        // Get extraChargesList from currentBookingData
        var quoteResp = currentBookingData.quote_response || currentBookingData.quoteResponse || {};
        var quoteBooking = quoteResp.booking || {};
        var routeData = quoteBooking[route] || {};
        var arr = routeData.extraChargesList || [];


        var $card = $(cardSelector);
        if (!$card.length) return;

        var rows = '';
        arr.forEach(function (it) {
            if (parseInt(it.visible || 0) !== 1) return;
            var lineTotal = parseFloat(it.total || 0) || 0;
            var convertedLineTotal = lineTotal * conversionRate;
            rows += `
            <div class="fare-row">
                <span class="fare-name">${escapeHtml(it.name || it.type || '')}${it.amount ? ' ×' + parseInt(it.amount) : ''}:</span>
                <span class="fare-price">${escapeHtml(currencySymbol)}${formatAmount(convertedLineTotal)}</span>
            </div>
        `;
        });

        var convertedTotalPrice = totalPrice * conversionRate;

        var html = `
        <div class="fare-breakdown">
            ${rows}
            <div class="fare-total">
                <span class="fare-name">Total:</span>
                <span class="fare-price">${escapeHtml(currencySymbol)}${formatAmount(convertedTotalPrice)}</span>
            </div>
        </div>
    `;

        if ($card.find('.fare-breakdown').length) {
            $card.find('.fare-breakdown').replaceWith(html);
        } else {
            $card.append(html);
        }
    }

    function renderInboundReturnBreakdownFromSession(b, conversionRate, currencySymbol) {
        if (b.route1) renderRouteBreakdown('route1', '#summary-outbound', b.route1.totalPrice, conversionRate, currencySymbol);
        if (b.route2) renderRouteBreakdown('route2', '#summary-return', b.route2.totalPrice, conversionRate, currencySymbol);
    }

    function renderVehicles(vehicles, payload, targetSelector, selectedId) {
        var html = '';
        // Get currency symbol and conversion rate from payload
        var currencySymbol = payload.selected_currency_symbol || '€';
        var conversionRate = parseFloat(payload.selected_currency_rate) || 1.0;

        vehicles.forEach(function (v) {
            // Vehicle data from API is ALWAYS in base currency (Euro)
            var baseTotal = parseFloat(v.total || 0);
            var convertedTotal = baseTotal * conversionRate;

            var pax = v.max_passengers || 0;
            var lug = v.max_luggage || 0;
            if (pax < (payload.passengers || 0) || lug < (payload.luggage || 0) || baseTotal == 0) return;
            var img = v.image_path || v.image || v.photo || '';
            if (!img) { img = taxi_booking_ajax.assets_placeholder || '' }

            // Check if vehicle is disabled
            var isDisabled = parseInt(v.disabled) === 1 && payload.booking_type == 'by-hour';
            var disabledReason = v.disabled_reason || '';

            var selClass = selectedId && String(selectedId) === String(v.id) && !isDisabled ? ' selected' : '';
            var disabledClass = isDisabled ? ' vehicle-disabled' : '';
            var disabledAttr = isDisabled ? ' data-disabled="1" title="' + escapeHtml(disabledReason) + '"' : '';

            // Store base currency in data-total, converted currency in data-display
            html += '<div class="vehicle-card' + selClass + disabledClass + '" data-id="' + v.id + '" data-total="' + baseTotal.toFixed(2) + '" data-display="' + convertedTotal.toFixed(2) + '"' + disabledAttr + '>' +
                '<div class="vehicle-left">' +
                '<img class="vehicle-thumb" src="' + img + '" alt="' + escapeHtml(v.name || '') + '">' +
                '<div class="vehicle-info">' +
                '<div class="vehicle-name">' + escapeHtml(v.name || '') + '</div>' +
                '<div class="vehicle-meta"><span><i class="fas fa-user"></i> x' + pax + '</span><span><i class="fas fa-suitcase"></i> x' + lug + '</span></div>' +
                (isDisabled ? '<div class="vehicle-disabled-reason">' + escapeHtml(disabledReason) + '</div>' : '') +
                '</div>' +
                '</div>' +
                '<div class="vehicle-price">' + escapeHtml(currencySymbol) + convertedTotal.toFixed(2) + '</div>' +
                '</div>';
        });
        $(targetSelector).html(html || '<div class="no-suggestions">' + taxi_booking_ajax.strings.no_results + '</div>');
    }

    function initDateTimePickers() {
        $('#pickup-date').flatpickr({
            dateFormat: 'd/m/Y',
            // minDate: 'yesterday',
            minDate: 'today',
            disableMobile: false,
            // defaultDate: 'today',
            locale: {
                ...(
                    taxi_booking_ajax.language === 'es'
                        ? flatpickr.l10ns.es
                        : flatpickr.l10ns.en
                ),
                firstDayOfWeek: 1
            },
            onChange: function (selectedDates, dateStr) {
                clearFieldError('pickup-date');
            }
        });

        $('#pickup-time').flatpickr({
            enableTime: true,
            noCalendar: true,
            dateFormat: 'H:i',
            time_24hr: true,
            disableMobile: false,
            // defaultDate: '12:00',
            onChange: function () {
                clearFieldError('pickup-time');
            }
        });

        $('#return-date').flatpickr({
            dateFormat: 'd/m/Y',
            minDate: 'today',
            disableMobile: false,
            // defaultDate: 'today',
            locale: {
                ...(
                    taxi_booking_ajax.language === 'es'
                        ? flatpickr.l10ns.es
                        : flatpickr.l10ns.en
                ),
                firstDayOfWeek: 1
            },
            onChange: function () {
                clearFieldError('return-date');
            }
        });

        $('#return-time').flatpickr({
            enableTime: true,
            noCalendar: true,
            dateFormat: 'H:i',
            time_24hr: true,
            disableMobile: false,
            // defaultDate: '12:00',
            onChange: function () {
                clearFieldError('return-time');
            }
        });
    }

    function initLocationAutocomplete() {
        $('.location-input').on('input', function () {
            var input = $(this);
            var query = input.val();
            var suggestionsDiv = input.closest('.taxi-form-group').find('.location-suggestions');
            var locationType = (input.attr('id') === 'pickup-address') ? 'from' : 'to';

            clearTimeout(searchTimeout);

            if (query.length < 3) {
                suggestionsDiv.hide().empty();
                return;
            }

            suggestionsDiv.html('<div class="suggestion-loading">' + taxi_booking_ajax.strings.searching + '</div>').show();

            searchTimeout = setTimeout(function () {
                searchAddresses(query, input, suggestionsDiv, locationType);
            }, 300);
        });

        $(document).on('click', function (e) {
            if (!$(e.target).closest('.taxi-form-group').length) {
                $('.location-suggestions').hide();
            }
        });

        $(document).on('click', '.suggestion-item', function () {
            var suggestion = $(this);
            var input = suggestion.closest('.taxi-form-group').find('.location-input');
            var address = suggestion.data('address');

            input.val(address);

            if (suggestion.data('place_id')) {
                input.data('place_id', suggestion.data('place_id'));
                if (suggestion.data('cat_id')) {
                    input.data('cat_id', suggestion.data('cat_id'));
                }
                if (suggestion.data('cat_type')) {
                    input.data('cat_type', suggestion.data('cat_type'));
                }
            } else {
                input.removeData('place_id');
                input.removeData('cat_id');
                input.removeData('cat_type');
            }

            clearFieldError(input.attr('id'));
            suggestion.closest('.location-suggestions').hide();
        });
    }

    function searchAddresses(query, input, suggestionsDiv, locationType) {
        $.ajax({
            url: taxi_booking_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'taxi_search_address',
                nonce: taxi_booking_ajax.nonce,
                query: query,
                searchType: locationType
            },
            success: function (response) {
                if (response.success && response.data && response.data.length > 0) {
                    var html = '';
                    response.data.forEach(function (item) {
                        html += '<div class="suggestion-item" data-place_id="' + item.place_id + '" data-address="' + item.name + '" data-cat_id="' + item.cat_id + '" data-cat_type="' + item.cat_type + '">' +
                            item.cat_icon + item.name + '</div>';
                    });
                    suggestionsDiv.html(html).show();
                } else {
                    suggestionsDiv.html('<div class="no-suggestions">' + taxi_booking_ajax.strings.no_results + '</div>').show();
                }
            },
            error: function () {
                suggestionsDiv.html('<div class="no-suggestions">' + taxi_booking_ajax.strings.error + '</div>').show();
            }
        });
    }

    function requestPosition(input, attempt) {
        if (!navigator.geolocation) { ipFallback(input); return; }
        var opts = attempt === 1 ? { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 } : { enableHighAccuracy: false, timeout: 20000, maximumAge: 120000 };
        navigator.geolocation.getCurrentPosition(function (pos) {
            var lat = pos.coords.latitude, lng = pos.coords.longitude;
            $.ajax({
                url: taxi_booking_ajax.ajax_url,
                type: 'POST',
                data: { action: 'taxi_reverse_geocode', nonce: taxi_booking_ajax.nonce, lat: lat, lng: lng },
                success: function (r) {
                    if (r.success && r.data) {
                        input.val(r.data.address || (lat + ', ' + lng));
                        if (input.attr('id') === 'pickup-address') { $('#pickup-lat').val(lat); $('#pickup-lng').val(lng); }
                        else { $('#destination-lat').val(lat); $('#destination-lng').val(lng); }
                        clearFieldError(input.attr('id'));
                    } else {
                        input.val('');
                        showFieldError(input.attr('id'), taxi_booking_ajax.strings.location_error);
                    }
                },
                error: function () {
                    input.val('');
                    showFieldError(input.attr('id'), taxi_booking_ajax.strings.location_error);
                }
            });
        }, function (err) {
            if ((err.code === err.POSITION_UNAVAILABLE || err.code === err.TIMEOUT) && attempt < 3) {
                setTimeout(function () { requestPosition(input, attempt + 1); }, attempt * 1500);
            } else {
                ipFallback(input);
            }
        }, opts);
    }

    function getCurrentLocation(input) {
        if (!window.isSecureContext) { showFieldError(input.attr('id'), 'Secure connection required to access location'); return; }
        input.val(taxi_booking_ajax.strings.loading);
        requestPosition(input, 1);
    }

    function ipFallback(input) {
        $.ajax({
            url: taxi_booking_ajax.ajax_url,
            type: 'POST',
            data: { action: 'taxi_ip_geolocate', nonce: taxi_booking_ajax.nonce },
            success: function (res) {
                if (res.success && res.data) {
                    input.val(res.data.address || (res.data.lat + ', ' + res.data.lng));
                    if (input.attr('id') === 'pickup-address') { $('#pickup-lat').val(res.data.lat); $('#pickup-lng').val(res.data.lng); }
                    else { $('#destination-lat').val(res.data.lat); $('#destination-lng').val(res.data.lng); }
                    clearFieldError(input.attr('id'));
                } else {
                    showFieldError(input.attr('id'), 'Position update is unavailable');
                }
            },
            error: function () {
                showFieldError(input.attr('id'), 'Position update is unavailable');
            }
        });
    }

    function validateBookingFields() {
        var isValid = true;

        if (!$('#pickup-address').val()) {
            showFieldError('pickup-address', taxi_booking_ajax.strings.field_required);
            isValid = false;
        }

        if (!$('#destination-address').val()) {
            showFieldError('destination-address', taxi_booking_ajax.strings.field_required);
            isValid = false;
        }

        if (!$('#pickup-date').val()) {
            showFieldError('pickup-date', taxi_booking_ajax.strings.field_required);
            isValid = false;
        }

        if (!$('#pickup-time').val()) {
            showFieldError('pickup-time', taxi_booking_ajax.strings.field_required);
            isValid = false;
        }

        if ($('#return-booking').is(':checked')) {
            if (!$('#return-date').val()) {
                showFieldError('return-date', taxi_booking_ajax.strings.field_required);
                isValid = false;
            }
            if (!$('#return-time').val()) {
                showFieldError('return-time', taxi_booking_ajax.strings.field_required);
                isValid = false;
            }
        }

        return isValid;
    }

    function validateByHourFields() {
        var isValid = true;

        if (!$('#byhour-pickup-address').val()) {
            showFieldError('byhour-pickup-address', taxi_booking_ajax.strings.field_required);
            isValid = false;
        }

        if (!$('#byhour-duration').val()) {
            showFieldError('byhour-duration', taxi_booking_ajax.strings.field_required);
            isValid = false;
        }

        if (!$('#byhour-date').val()) {
            showFieldError('byhour-date', taxi_booking_ajax.strings.field_required);
            isValid = false;
        }

        if (!$('#byhour-time').val()) {
            showFieldError('byhour-time', taxi_booking_ajax.strings.field_required);
            isValid = false;
        }

        return isValid;
    }

    function validateAllFields() {
        var isValid = true;

        if (!$('#customer-name').val()) {
            showFieldError('customer-name', taxi_booking_ajax.strings.field_required);
            isValid = false;
        }

        var email = $('#customer-email').val();
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            showFieldError('customer-email', taxi_booking_ajax.strings.field_required);
            isValid = false;
        } else if (!emailRegex.test(email)) {
            showFieldError('customer-email', taxi_booking_ajax.strings.invalid_email);
            isValid = false;
        }

        var phone = $('#customer-phone').val();
        if (!phone) {
            showFieldError('customer-phone', taxi_booking_ajax.strings.field_required);
            isValid = false;
        } else if (customerPhoneIti && !customerPhoneIti.isValidNumber()) {
            showFieldError('customer-phone', taxi_booking_ajax.strings.invalid_phone || 'Please enter a valid phone number');
            isValid = false;
        }

        return isValid;
    }

    function showFieldError(fieldId, message) {
        $('#' + fieldId).addClass('error');
        $('#' + fieldId + '-error').text(message).show();
    }

    function clearFieldError(fieldId) {
        $('#' + fieldId).removeClass('error');
        $('#' + fieldId + '-error').text('').hide();
    }

    function calculatePrice() {
        $('#form-loading').css('display', 'flex');
        $('#booking-error').hide();
        $('#calculate-price-btn').prop('disabled', true);

        var pickup_cat_id = $('#pickup-address').data('cat_id') || '';
        var destination_cat_id = $('#destination-address').data('cat_id') || '';
        var return_pickup_cat_id = $('#return-pickup-address').data('cat_id') || '';
        var return_destination_cat_id = $('#return-destination-address').data('cat_id') || '';

        var pickup_cat_type = $('#pickup-address').data('cat_type') || '';
        var destination_cat_type = $('#destination-address').data('cat_type') || '';
        var return_pickup_cat_type = $('#return-pickup-address').data('cat_type') || '';
        var return_destination_cat_type = $('#return-destination-address').data('cat_type') || '';

        // Get timezone
        var timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        var data = {
            action: 'taxi_calculate_price',
            nonce: taxi_booking_ajax.nonce,
            pickup_address: $('#pickup-address').val(),
            destination_address: $('#destination-address').val(),
            pickup_date: $('#pickup-date').val(),
            pickup_time: $('#pickup-time').val(),
            timezone: timezone,
            return_booking: $('#return-booking').is(':checked'),
            return_pickup_address: $('#return-pickup-address').val(),
            return_pickup_lat: $('#return-pickup-lat').val(),
            return_pickup_lng: $('#return-pickup-lng').val(),
            return_destination_address: $('#return-destination-address').val(),
            return_destination_lat: $('#return-destination-lat').val(),
            return_destination_lng: $('#return-destination-lng').val(),
            return_date: $('#return-date').val(),
            return_time: $('#return-time').val(),
            passengers: $('#passengers').val(),
            luggage: $('#luggage').val(),
            pickup_place_id: $('#pickup-address').data('place_id') || '',
            destination_place_id: $('#destination-address').data('place_id') || '',
            return_pickup_place_id: $('#return-pickup-address').data('place_id') || '',
            return_destination_place_id: $('#return-destination-address').data('place_id') || '',
        };

        $.ajax({
            url: taxi_booking_ajax.ajax_url,
            type: 'POST',
            data: data,
            success: function (response) {
                $('#form-loading').hide();
                $('#calculate-price-btn').prop('disabled', false);
                var payload = response && response.data ? response.data : null;

                if (typeof payload.message === 'string' && payload.message.trim() !== '') {
                    // show message
                    $('#booking-error').html('<p>' + payload.message + '</p>').show()
                    return
                }

                if (payload && payload.booking) {
                    if (payload.booking.route1 && payload.booking.route1.address) {
                        payload.booking.route1.category = {
                            'start': pickup_cat_id,
                            'end': destination_cat_id,
                            'type': {
                                'start': pickup_cat_type,
                                'end': destination_cat_type
                            }
                        }
                    }
                    if (payload.booking.route2 && payload.booking.route2.address) {
                        payload.booking.route2.category = {
                            'start': return_pickup_cat_id,
                            'end': return_destination_cat_id,
                            'type': {
                                'start': return_pickup_cat_type,
                                'end': return_destination_cat_type
                            }
                        }
                    }
                }
                if (!payload || payload.success !== true) { $('#booking-error').html('<p>' + taxi_booking_ajax.strings.error + '</p>').show(); return }

                // Track price calculation for Google Ads
                if (window.TaxiBookingGoogleAds && taxi_booking_ajax.google_ads.enabled && payload.booking && payload.booking.route1) {
                    var route = payload.booking.route1;
                    var vehicles = Array.isArray(route.vehicleButtons) ? route.vehicleButtons : [];
                    if (vehicles.length > 0) {
                        var avgPrice = vehicles.reduce(function (sum, v) { return sum + (parseFloat(v.total) || 0); }, 0) / vehicles.length;
                        window.TaxiBookingGoogleAds.trackPriceCalculation(avgPrice, taxi_booking_ajax.currency);
                    }
                }
                if (Array.isArray(payload.message_r1) && payload.message_r1.length > 0) { var m1 = payload.message_r1.map(function (s) { return escapeHtml(String(s)) }).join('<br>'); $('#booking-error').html('<p>' + m1 + '</p>').show(); return }
                if (Array.isArray(payload.message) && payload.message.length > 0) { var m2 = payload.message.map(function (s) { return escapeHtml(String(s)) }).join('<br>'); $('#booking-error').html('<p>' + m2 + '</p>').show(); return }
                if (payload.booking && payload.booking.route1) {
                    var route = payload.booking.route1;
                    var vehicles = Array.isArray(route.vehicleButtons) ? route.vehicleButtons : [];
                    var dist = route.distance || 0;
                    var dur = route.duration || 0;
                    var sLat = route.address && route.address.start_lat ? parseFloat(route.address.start_lat) : null;
                    var sLng = route.address && route.address.start_lng ? parseFloat(route.address.start_lng) : null;
                    var eLat = route.address && route.address.end_lat ? parseFloat(route.address.end_lat) : null;
                    var eLng = route.address && route.address.end_lng ? parseFloat(route.address.end_lng) : null;
                    $('#route-map-toggle-text').text(taxi_booking_ajax.strings.hide_map);

                    // Use embedMap instead of drawRoute
                    if (sLat && sLng && eLat && eLng) {
                        var start = new google.maps.LatLng(sLat, sLng);
                        var end = new google.maps.LatLng(eLat, eLng);
                        var waypoints = []; // Extract waypoints if available in route
                        if (route.waypoints && Array.isArray(route.waypoints)) {
                            waypoints = route.waypoints;
                        }

                        // Pass config from API response
                        var mapConfig = payload.config || {};

                        setTimeout(function () {
                            embedMap('taxi-route-map', start, end, waypoints, 'OK', mapConfig);
                        }, 100);
                    }
                    $('#route-meta').html('<div class="route-line"><span>' + taxi_booking_ajax.strings.distance + ': ' + formatAmount(dist) + ' km</span><span> • </span><span>' + taxi_booking_ajax.strings.duration + ': ' + dur + ' min</span></div>');
                    if (vehicles.length === 0) { $('#vehicle-list').html('<div class="no-suggestions">' + taxi_booking_ajax.strings.no_results + '</div>'); setStep(2); return }
                    var html = '';
                    vehicles.forEach(function (v) {
                        var total = v.display || v.total || 0;
                        var pax = v.max_passengers || 0;
                        var lug = v.max_luggage || 0;
                        var img = v.image || v.photo || '';
                        if (!img) { img = taxi_booking_ajax.assets_placeholder || '' }
                        html += '<div class="vehicle-card" data-id="' + v.id + '" data-total="' + total + '">' +
                            '<div class="vehicle-left">' +
                            '<img class="vehicle-thumb" src="' + img + '" alt="' + escapeHtml(v.name || '') + '">' +
                            '<div class="vehicle-info">' +
                            '<div class="vehicle-name">' + escapeHtml(v.name || '') + '</div>' +
                            '<div class="vehicle-meta"><span><i class="fas fa-user"></i> x' + pax + '</span><span><i class="fas fa-suitcase"></i> x' + lug + '</span></div>' +
                            '</div>' +
                            '</div>' +
                            '<div class="vehicle-price">€' + (parseFloat(total) || 0).toFixed(2) + '</div>' +
                            '</div>';
                    });
                    $('#vehicle-list').html(html);
                    $('#selected-vehicle-id').val('');
                    $('#selected-vehicle-total').val('');
                    $('#proceed-step-3').prop('disabled', true);
                    if (payload.booking && payload.booking.route1) {
                        // Redirect to Step 2 with URL parameters (no TBKState)
                        var urlParams = TBKParams.collectStep1Data();
                        var redirectUrl = TBKParams.buildUrl('/booking', urlParams);
                        window.location.href = redirectUrl;
                        return;
                    }
                } else {
                    $('#booking-error').html('<p>' + taxi_booking_ajax.strings.error + '</p>').show()
                }
            },
            error: function (xhr, status, error) {
                $('#form-loading').hide();
                $('#calculate-price-btn').prop('disabled', false);
                $('#booking-error').html('<p>' + taxi_booking_ajax.strings.error + '</p>').show();
            }
        });
    }

    function calculateHourlyPrice() {
        $('#form-loading').css('display', 'flex');
        $('#booking-error').hide();
        $('#byhour-calculate-price-btn').prop('disabled', true);

        var pickup_cat_id = $('#byhour-pickup-address').data('cat_id') || '';
        var pickup_cat_type = $('#byhour-pickup-address').data('cat_type') || '';

        // Get timezone
        var timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        var booking = {
            serviceId: 7,
            serviceDuration: parseInt($('#byhour-duration').val()) || 1,
            preferred: {
                passengers: parseInt($('#byhour-passengers').val()) || 1,
                luggage: parseInt($('#byhour-luggage').val()) || 0
            },
            route1: {
                address: {
                    start: $('#byhour-pickup-address').val(),
                    startPlaceId: $('#byhour-pickup-address').data('place_id') || ''
                },
                date: $('#byhour-date').val(),
                time: $('#byhour-time').val(),
                category: {
                    start: pickup_cat_id,
                    type: {
                        start: pickup_cat_type
                    }
                }
            }
        };

        var data = {
            action: 'taxi_calculate_price',
            nonce: taxi_booking_ajax.nonce,
            pickup_address: $('#byhour-pickup-address').val(),
            destination_address: $('#byhour-pickup-address').val(),
            pickup_date: $('#byhour-date').val(),
            pickup_time: $('#byhour-time').val(),
            passengers: parseInt($('#byhour-passengers').val()) || 1,
            luggage: parseInt($('#byhour-luggage').val()) || 0,
            pickup_place_id: $('#byhour-pickup-address').data('place_id') || '',
            destination_place_id: $('#byhour-pickup-address').data('place_id') || '',
            service_id: 7,
            service_duration: parseInt($('#byhour-duration').val()) || 1
        };

        $.ajax({
            url: taxi_booking_ajax.ajax_url,
            type: 'POST',
            data: data,
            success: function (response) {
                $('#form-loading').hide();
                $('#byhour-calculate-price-btn').prop('disabled', false);

                var payload = response && response.data ? response.data : null;

                if (!payload || payload.success !== true) {
                    var msg = (payload && payload.message) ? payload.message : taxi_booking_ajax.strings.error;
                    $('#booking-error').html('<p>' + msg + '</p>').show();
                    return;
                }

                // Store booking type
                payload.booking_type = 'by-hour';
                payload.byhour_duration = parseInt($('#byhour-duration').val()) || 1;
                payload.passengers = parseInt($('#byhour-passengers').val()) || 1;
                payload.luggage = parseInt($('#byhour-luggage').val()) || 0;
                payload.pickup_date = $('#byhour-date').val();
                payload.pickup_time = $('#byhour-time').val();

                if (payload.booking && payload.booking.route1) {
                    // Redirect to Step 2 with URL parameters (no TBKState)
                    var urlParams = TBKParams.collectStep1Data();
                    var redirectUrl = TBKParams.buildUrl('/booking', urlParams);
                    window.location.href = redirectUrl;
                } else {
                    $('#booking-error').html('<p>' + taxi_booking_ajax.strings.error + '</p>').show();
                }
            },
            error: function () {
                $('#form-loading').hide();
                $('#byhour-calculate-price-btn').prop('disabled', false);
                $('#booking-error').html('<p>' + taxi_booking_ajax.strings.error + '</p>').show();
            }
        });
    }

    // Create booking using URL params and currentBookingData (no TBKState)
    function createBooking() {
        $('#form-loading').css('display', 'flex');
        $('#booking-error').hide();
        $('#booking-success').hide();
        $('#confirm-booking-btn').prop('disabled', true);

        // Get URL params and currentBookingData
        var params = TBKParams.getBookingData();
        var isReturn = params.ret;

        // Customer info from form
        var customer_name = $('#customer-name').val();
        var customer_phone = customerPhoneIti ? customerPhoneIti.getNumber() : $('#customer-phone').val();
        var customer_email = $('#customer-email').val();
        var lead_name = $('#bo-name').val();
        var lead_phone = boPhoneIti ? boPhoneIti.getNumber() : $('#bo-phone').val();
        var lead_email = $('#bo-email').val();

        // Get booking data from currentBookingData (populated in buildStep3FromUrlParams)
        var passengers = parseInt(params.pax) || 1;
        var luggage = parseInt(params.lug) || 0;
        var r1Date = params.date || '';
        var r1Time = params.time || '';
        var r2Date = isReturn ? (params.ret_date || '') : '';
        var r2Time = isReturn ? (params.ret_time || '') : '';
        var route1DateTime = (r1Date && r1Time) ? (r1Date + ' ' + r1Time) : '';
        var route2DateTime = (r2Date && r2Time) ? (r2Date + ' ' + r2Time) : '';
        var v1 = params.v1 || '';
        var v2 = params.v2 || v1;

        var selected_vehicle_total = parseFloat(currentBookingData.selectedVehicleTotal || 0) || 0;
        var selected_vehicle_total_r2 = parseFloat(currentBookingData.selectedVehicleTotalR2 || 0) || selected_vehicle_total;

        // Child seats from form
        var r1Booster = parseInt($('#card-outbound .seat-booster').val() || 0, 10);
        var r1Child = parseInt($('#card-outbound .seat-child').val() || 0, 10);
        var r1Infant = parseInt($('#card-outbound .seat-infant').val() || 0, 10);
        var r2Booster = parseInt($('#card-return .seat-booster').val() || 0, 10);
        var r2Child = parseInt($('#card-return .seat-child').val() || 0, 10);
        var r2Infant = parseInt($('#card-return .seat-infant').val() || 0, 10);

        var totalTxt = $('#step3-total-amount').text() || '0';
        var total = parseFloat(String(totalTxt).replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;

        // Build booking object from quote response (check both naming conventions)
        // Prefer quote_response (updated by getQuotePrice after applying discount) over quoteResponse (initial load)
        var quoteResponse = currentBookingData.quote_response || currentBookingData.quoteResponse || {};
        var bookingObj = quoteResponse.booking ? JSON.parse(JSON.stringify(quoteResponse.booking)) : {};

        // Add serviceId and serviceDuration for hourly bookings
        if (params.type === 'by-hour') {
            bookingObj.serviceId = 7;
            bookingObj.serviceDuration = parseInt(params.dur) || 1;
        }

        // Add routeReturn if return booking
        if (isReturn && bookingObj) {
            bookingObj.routeReturn = 1;
        }

        // Discount fields (discountId, discountStatus, discountCode, etc.) are included
        // in bookingObj from the deep copy of quoteResponse.booking above
        // console.log('createBooking - bookingObj discountId:', bookingObj.discountId, 'discountStatus:', bookingObj.discountStatus);

        // Set vehicle info
        if (bookingObj && bookingObj.route1) {
            bookingObj.route1.vehicle = { id: v1 || '', amount: selected_vehicle_total || 0 };
        }

        if (isReturn && bookingObj && bookingObj.route2) {
            bookingObj.route2.vehicle = { id: v2 || '', amount: selected_vehicle_total_r2 || 0 };
        }

        // Collect additional items from DOM
        var route1Items = collectAdditionalItemsFromDOM('#card-outbound .additional-items-list');
        var route2Items = isReturn ? collectAdditionalItemsFromDOM('#card-return .additional-items-list') : [];

        // Flight numbers from form
        if (bookingObj && bookingObj.route1) {
            var lt = $('#flight-r1-1').val() || '';
            if (lt && lt.trim() !== '') {
                bookingObj.route1.flightNumber = lt.trim();
            }
            var df = $('#flight-r1-2').val() || '';
            if (df && df.trim() !== '') {
                bookingObj.route1.departureFlightNumber = df.trim();
            }
            // Child seats mapping: .seat-booster=childSeats, .seat-child=babySeats, .seat-infant=infantSeats
            bookingObj.route1.childSeats = r1Booster;
            bookingObj.route1.babySeats = r1Child;
            bookingObj.route1.infantSeats = r1Infant;
            // Attach additional items
            bookingObj.route1.items = route1Items;

        }

        if (isReturn && bookingObj && bookingObj.route2) {
            var af = $('#flight-r2-1').val() || '';
            if (af && af.trim() !== '') {
                bookingObj.route2.flightNumber = af.trim();
            }
            var lt2 = $('#flight-r2-2').val() || '';
            if (lt2 && lt2.trim() !== '') {
                bookingObj.route2.departureFlightNumber = lt2.trim();
            }
            // Child seats mapping: .seat-booster=childSeats, .seat-child=babySeats, .seat-infant=infantSeats
            bookingObj.route2.childSeats = r2Booster;
            bookingObj.route2.babySeats = r2Child;
            bookingObj.route2.infantSeats = r2Infant;
            // Attach additional items
            bookingObj.route2.items = route2Items;
        }

        // Build encoded price data from quote response
        var quoteResp = currentBookingData.quote_response || currentBookingData.quoteResponse || {};
        var quoteBooking = quoteResp.booking || {};
        var quoteR1 = quoteBooking.route1 || {};
        var quoteR2 = quoteBooking.route2 || {};

        var priceData = {
            route1: {
                extraChargesList: quoteR1.extraChargesList || [],
                extraChargesPrice: quoteR1.extraChargesPrice || 0,
                totalPrice: quoteR1.totalPrice || 0
            },
            route2: isReturn ? {
                extraChargesList: quoteR2.extraChargesList || [],
                extraChargesPrice: quoteR2.extraChargesPrice || 0,
                totalPrice: quoteR2.totalPrice || 0
            } : null,
            totalPrice: quoteBooking.totalPrice || 0,
            totalPriceWithDiscount: quoteBooking.totalPriceWithDiscount || quoteBooking.totalPrice || 0
        };

        // Encode price data as base64
        var hashData = btoa(JSON.stringify(priceData));

        // Get timezone
        var timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // Get selected currency information (from currentBookingData if available)
        var selectedCurrency = currentBookingData.selectedCurrency || taxi_booking_ajax.currency || null;
        var selectedCurrencySymbol = currentBookingData.selectedCurrencySymbol || null;
        var selectedCurrencyRate = currentBookingData.selectedCurrencyRate || null;

        var data = {
            action: 'taxi_create_booking',
            nonce: taxi_booking_ajax.nonce,
            task: 'quote',
            booking: bookingObj,
            notes_outbound: $('#notes-outbound').val() || '',
            notes_return: $('#notes-return').val() || '',
            payment_method: $('#payment-method').val() || '',
            customer: {
                name: customer_name || '',
                email: customer_email || '',
                phone: customer_phone || '',
                lead_name: lead_name || '',
                lead_email: lead_email || '',
                lead_phone: lead_phone || ''
            },
            currency: selectedCurrency,
            currency_symbol: selectedCurrencySymbol,
            currency_rate: selectedCurrencyRate,
            dates: { route1: route1DateTime || '', route2: route2DateTime || '' },
            passengers: passengers,
            luggage: luggage,
            timezone: timezone,
            hash_data: hashData
        };

        $.ajax({
            url: taxi_booking_ajax.ajax_url,
            type: 'POST',
            data: data,
            success: function (response) {
                $('#form-loading').hide();
                $('#confirm-booking-btn').prop('disabled', false);
                if (response.success) {
                    $('#success-html').html(response.data.html);
                    $('#booking-success').show();
                    if (response.data && response.data.payment_method != "Stripe") {
                        $('#success-heading').show();
                    }
                    $('#step-1-fields,#step-2-vehicles,#step-3-details,.taxi-steps-nav').hide();
                    $('html,body').animate({ scrollTop: $('#booking-success').offset().top - 100 }, 500);

                    // Update URL with booking ID and payment method
                    var successParams = {
                        step: 'success',
                        bid: response.data.booking_id || '',
                        pm: response.data.payment_method || ''
                    };
                    var newUrl = TBKParams.buildUrl(window.location.pathname, successParams);
                    window.history.pushState({ path: newUrl }, '', newUrl);

                    var paymentMethod = response.data.payment_method || '';
                    if (window.TaxiBookingGoogleAds && taxi_booking_ajax.google_ads.enabled && response.data && paymentMethod !== 'Stripe') {
                        var customerData = {
                            email: customer_email,
                            phone: customer_phone
                        };
                        window.TaxiBookingGoogleAds.trackConversion(
                            response.data.booking_id || 'unknown',
                            total,
                            taxi_booking_ajax.currency,
                            customerData
                        );
                    }

                    // Handle Stripe payment if needed
                    if (paymentMethod.toLowerCase() === 'stripe' && response.data.html) {
                        $('#succcess-heading').hide();
                        var html = response.data.html;
                        var containsStripe = /https?:\/\/js\.stripe\.com\/v3\/?/.test(html);
                        var ensure = Promise.resolve();
                        if (typeof Stripe === 'undefined' && !containsStripe) {
                            ensure = loadScriptOnce('https://js.stripe.com/v3/');
                        }
                        ensure.then(function () {
                            return renderHtmlWithScripts(html, '#payment-placeholder');
                        });
                    }
                } else {
                    if (response.data && response.data.errors) {
                        handleServerErrors(response.data.errors);
                    } else {
                        $('#booking-error').html('<p>' + (response.data && response.data.message ? response.data.message : taxi_booking_ajax.strings.booking_error) + '</p>').show();
                    }
                }
            },
            error: function () {
                $('#form-loading').hide();
                $('#confirm-booking-btn').prop('disabled', false);
                $('#booking-error').html('<p>' + taxi_booking_ajax.strings.booking_error + '</p>').show();
            }
        });
    }

    function handleServerErrors(errors) {
        $('.field-error').text('').hide();
        $('.taxi-form-control').removeClass('error');

        for (var field in errors) {
            if (errors.hasOwnProperty(field)) {
                var fieldId = field.replace(/_/g, '-');
                var message = Array.isArray(errors[field]) ? errors[field][0] : errors[field];
                showFieldError(fieldId, message);
            }
        }

        if (errors.general) {
            $('#booking-error').html('<p>' + errors.general + '</p>').show();
        }

        var firstError = $('.taxi-form-control.error').first();
        if (firstError.length) {
            $('html, body').animate({
                scrollTop: firstError.offset().top - 100
            }, 500);
        }
    }

    function positionProceedButton() {
        var $pane = $('#step-2-vehicles .tab-pane:visible');
        if (!$pane.length) { $pane = $('#tab-outbound'); }
        $('#proceed-wrap').insertAfter($pane.find('.vehicle-list'));
    }

    function escapeHtml(text) {
        var map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function (m) { return map[m]; });
    }

    function showFormLoading() { var $o = $('#form-loading'); if ($o.length) { $o.css('display', 'flex') } else { $('#form-loading').css('display', 'flex') } }
    function hideFormLoading() { var $o = $('#form-loading'); if ($o.length) { $o.hide() } else { $('#form-loading').hide() } }

    // Initialize all phone input fields with intl-tel-input
    function initPhoneInputs() {
        if (!window.intlTelInput) return;

        // Initialize customer phone (step 3 - guest booking)
        var customerPhoneInput = document.querySelector('#customer-phone');
        if (customerPhoneInput && !customerPhoneIti) {
            customerPhoneIti = window.intlTelInput(customerPhoneInput, {
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
            customerPhoneInput.style.setProperty('padding-left', '48px', 'important');
        }

        // Registration phone is initialized by taxi-booking-auth.js
        // Only initialize here if auth.js hasn't done it (check via window.TaxiBookingAuth)
        var regPhoneInput = document.querySelector('#reg-phone');
        if (regPhoneInput && !regPhoneIti && !(window.TaxiBookingAuth && window.TaxiBookingAuth.getRegPhoneIti())) {
            regPhoneIti = window.intlTelInput(regPhoneInput, {
                initialCountry: 'auto',
                geoIpLookup: function (callback) {
                    fetch('https://ipwho.is/')
                        .then(function (res) { return res.json(); })
                        .then(function (data) { callback(data.country_code); })
                        .catch(function () { callback('ie'); });
                },
                nationalMode: true,
                formatOnDisplay: true,
                separateDialCode: false,
                strictMode: false,
                utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@25.11.2/build/js/utils.js'
            });
            // Apply inline style for padding with !important
            if (regPhoneInput.closest('.input-with-icon')) {
                regPhoneInput.style.setProperty('padding-left', '80px', 'important');
            } else {
                regPhoneInput.style.setProperty('padding-left', '48px', 'important');
            }
        } else if (window.TaxiBookingAuth && window.TaxiBookingAuth.getRegPhoneIti()) {
            // Use the instance from auth.js
            regPhoneIti = window.TaxiBookingAuth.getRegPhoneIti();
        }
    }

    function initBookForElse() {
        var $cb = $('#book-for-someone');
        var $box = $('#someone-else-fields');
        $cb.on('change', function () {
            if (this.checked) {
                $box.stop(true, true).slideDown(120);
                $('#bo-name,#bo-phone,#bo-email').attr('required', 'required');
                initElsePhone();
            } else {
                $box.stop(true, true).slideUp(120);
                $('#bo-name,#bo-phone,#bo-email').removeAttr('required').val('');
                if (boPhoneIti && boPhoneIti.destroy) boPhoneIti.destroy();
                boPhoneIti = null;
            }
        });
    }

    function initElsePhone() {
        if (boPhoneIti) return;
        var input = document.querySelector('#bo-phone');
        if (!input || !window.intlTelInput) return;
        boPhoneIti = window.intlTelInput(input, {
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
        input.style.setProperty('padding-left', '48px', 'important');
    }

    window.tbkBuildStep2Payload = function (payload) {
        var checked = $('#book-for-else').is(':checked');
        payload.booking = payload.booking || {};
        payload.booking.for_someone_else = checked ? 1 : 0;
        if (checked) {
            var phone = $('#bo-phone').val();
            if (boPhoneIti && boPhoneIti.getNumber) phone = boPhoneIti.getNumber();
            payload.booking.someone_else = {
                name: $('#bo-name').val(),
                phone: phone,
                email: $('#bo-email').val()
            };
        } else {
            delete payload.booking.someone_else;
        }
        return payload;
    };

    $('.number-btn').on('click', function () {
        var btn = $(this);
        var target = btn.data('target');
        var input = $('#' + target);
        var display = $('#' + target + '-display');
        var currentVal = parseInt(input.val()) || 0;
        var min = parseInt(input.attr('min')) || 0;
        var max = parseInt(input.attr('max')) || 999;

        if (btn.hasClass('plus')) {
            if (currentVal < max) {
                currentVal++;
                input.val(currentVal);
            }
        } else if (btn.hasClass('minus')) {
            if (currentVal > min) {
                currentVal--;
                input.val(currentVal);
            }
        }

        if (target === 'passengers' || target === 'byhour-passengers') {
            var pLabel = currentVal === 1
                ? (taxi_booking_ajax.strings.passenger || 'Passenger')
                : (taxi_booking_ajax.strings.passengers || 'Passengers');
            display.val(currentVal + ' ' + pLabel);
        } else if (target === 'luggage' || target === 'byhour-luggage') {
            var lLabel = currentVal === 1
                ? (taxi_booking_ajax.strings.suitcase || 'Bag')
                : (taxi_booking_ajax.strings.suitcases || 'Bags');
            display.val(currentVal + ' ' + lLabel);
        }

        updateNumberButtonStates(target);
        clearFieldError(target);
    });

    function updateNumberButtonStates(target) {
        var input = $('#' + target);
        var currentVal = parseInt(input.val()) || 0;
        var min = parseInt(input.attr('min')) || 0;
        var max = parseInt(input.attr('max')) || 999;

        $('.number-btn.minus[data-target="' + target + '"]').prop('disabled', currentVal <= min);
        $('.number-btn.plus[data-target="' + target + '"]').prop('disabled', currentVal >= max);
    }

    $(document).ready(function () {
        updateNumberButtonStates('passengers');
        updateNumberButtonStates('luggage');
        updateNumberButtonStates('byhour-passengers');
        updateNumberButtonStates('byhour-luggage');
    });

    $(document).on('click', '.vehicle-card', function () {
        var $card = $(this);

        // Prevent selecting disabled vehicles
        if ($card.hasClass('vehicle-disabled') || $card.data('disabled') === 1) {
            return;
        }

        var $pane = $card.closest('.tab-pane');
        $pane.find('.vehicle-card').removeClass('selected');
        $card.addClass('selected');
        var id = $card.data('id');
        var displayTotal = parseFloat($card.data('display') || $card.data('total') || 0); // Converted currency for display
        var vehicleName = $card.find('.vehicle-name').text() || 'Unknown Vehicle';

        if ($pane.attr('id') === 'tab-return') {
            selectedReturnId = id;
            selectedReturnTotal = displayTotal;
        } else {
            selectedOutboundId = id;
            selectedOutboundTotal = displayTotal;
        }

        // Don't save total to hidden fields - we calculate it from vehicle ID
        $('#selected-vehicle-id').val(id);
        $('#calculated-price').text(formatAmount(displayTotal));
        $('#calculated-price').data('price', displayTotal);
        updateProceedState();

        // Track vehicle selection for Google Ads
        if (window.TaxiBookingGoogleAds && taxi_booking_ajax.google_ads.enabled) {
            window.TaxiBookingGoogleAds.trackVehicleSelection(vehicleName, total, taxi_booking_ajax.currency);
        }
    });

    $(document).on('click', '.pay-btn', function () {
        $('#payment-method').val($(this).data('id'));
        $('#confirm-booking-btn').trigger('click');
    });

    $(document).on('click', '#step2-tabs .tab-nav li', function () {
        $('#step2-tabs .tab-nav li').removeClass('active');
        $(this).addClass('active');
        var tab = $(this).data('tab');
        if (tab === 'outbound') { $('#tab-return').hide(); $('#tab-outbound').show(); }
        else { $('#tab-outbound').hide(); $('#tab-return').show(); }
        positionProceedButton();
        updateProceedState();
    });

    // Handle currency selection change
    $(document).on('change', '#currency-select', function () {
        var selectedCode = $(this).val();
        var selectedOption = $(this).find('option:selected');
        var symbol = selectedOption.data('symbol') || '€';
        var conversionRate = parseFloat(selectedOption.data('rate')) || 1.0;

        // Update currentBookingData with selected currency
        currentBookingData.selectedCurrency = selectedCode;
        currentBookingData.selectedCurrencySymbol = symbol;
        currentBookingData.selectedCurrencyRate = conversionRate;

        // Update currency symbols on the page
        $('.currency').text(symbol);

        // Update all vehicle card prices
        $('.vehicle-card').each(function () {
            var $card = $(this);
            var basePrice = parseFloat($card.data('total') || 0);
            var convertedPrice = basePrice * conversionRate;
            $card.find('.vehicle-price').text(symbol + formatAmount(convertedPrice));
            $card.data('display', convertedPrice);
        });

        // Recalculate selected totals
        var $selectedOutbound = $('#vehicle-list-outbound .vehicle-card.selected');
        var $selectedReturn = $('#vehicle-list-return .vehicle-card.selected');

        if ($selectedOutbound.length) {
            selectedOutboundTotal = parseFloat($selectedOutbound.data('display') || 0);
        }
        if ($selectedReturn.length) {
            selectedReturnTotal = parseFloat($selectedReturn.data('display') || 0);
        }

        updateProceedState();
    });

    $(document).on('click', '#login-submit', function () {
        var email = $('#login-email').val().trim();
        var password = $('#login-password').val();
        if (!email || !password) { return }
        var payload = { email: email, password: password };
        $(document).trigger('taxi_login_submit', [payload]);
    });

    $(document).on('change', 'input[name="reg_type"]', function () {
        var type = $('input[name="reg_type"]:checked').val();
        if (type === 'company') {
            $('.company-only').show();
            $('#reg-company-name,#reg-company-number,#reg-company-vat').attr('required', true);
        } else {
            $('.company-only').hide();
            $('#reg-company-name,#reg-company-number,#reg-company-vat').prop('required', false);
        }
    });

    $(document).on('click', '#register-submit', function () {
        var payload = {
            type: $('input[name="reg_type"]:checked').val(),
            first_name: $.trim($('#reg-first-name').val()),
            last_name: $.trim($('#reg-last-name').val()),
            email: $.trim($('#reg-email').val()),
            password: $('#reg-password').val(),
            password_confirmation: $('#reg-password-confirm').val(),
            company_name: $.trim($('#reg-company-name').val()) || null,
            company_number: $.trim($('#reg-company-number').val()) || null,
            company_vat: $.trim($('#reg-company-vat').val()) || null
        };
        $(document).trigger('taxi_register_submit', [payload]);
    });

    // Fetch Stripe payment form for a booking (when reloading success page)
    function fetchStripePaymentForm(bookingId) {
        // For Stripe payments that were initiated but user reloaded the page,
        // we would need to fetch the payment form from the server.
        // However, this typically requires the booking to be in a specific state.
        // For now, show a message that the user should contact support.
        $('#success-html').html('<p>Your booking #' + escapeHtml(bookingId) + ' has been created. If you need to complete payment, please contact support.</p>');
    }

    function loadScriptOnce(url) {
        return new Promise(function (resolve, reject) {
            var exist = document.querySelector('script[src="' + url + '"]');
            if (exist && exist.getAttribute('data-loaded') === 'true') { resolve(); return; }
            if (exist) { exist.addEventListener('load', function () { exist.setAttribute('data-loaded', 'true'); resolve() }); exist.addEventListener('error', reject); return; }
            var s = document.createElement('script');
            s.src = url;
            s.async = false;
            s.onload = function () { s.setAttribute('data-loaded', 'true'); resolve() };
            s.onerror = reject;
            document.head.appendChild(s);
        });
    }
    function renderHtmlWithScripts(html, mountSelector) {
        return new Promise(function (resolve) {
            var mount = document.querySelector(mountSelector || 'body');
            if (!mount) { resolve(); return; }
            var wrapper = document.createElement('div');
            wrapper.innerHTML = html;
            var scripts = [].slice.call(wrapper.querySelectorAll('script'));
            scripts.forEach(function (sc) { sc.parentNode.removeChild(sc) });
            mount.innerHTML = wrapper.innerHTML;
            if (window.jQuery && !window.$) window.$ = window.jQuery;
            (function run(i) {
                if (i >= scripts.length) { resolve(); return; }
                var old = scripts[i];
                if (old.src) {
                    loadScriptOnce(old.src).then(function () { run(i + 1) }).catch(function () { run(i + 1) });
                } else {
                    var s = document.createElement('script');
                    s.text = old.text || old.textContent || '';
                    document.body.appendChild(s);
                    run(i + 1);
                }
            })(0);
        });
    }


    // Utility function to get URL parameters
    function getUrlParameter(name) {
        name = name.replace(/[\[\]]/g, '\\$&');
        var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
        var results = regex.exec(window.location.href);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }

    // Handle payment thank you step
    function handlePaymentThankYou() {
        $('#form-loading').css('display', 'flex');

        // Extract parameters from URL
        var bookingId = getUrlParameter('bID');
        var transactionId = getUrlParameter('tID');
        var sessionId = getUrlParameter('session_id');

        // if (!bookingId) {
        //     $('#form-loading').hide();
        //     $('#booking-error').html('<p>Missing booking ID parameter</p>').show();
        //     return;
        // }

        // Hide all other sections
        $('#step-1-fields,#step-2-vehicles,#step-3-details,.taxi-steps-nav').hide();

        // Make AJAX request to fetch payment thank you data
        $.ajax({
            url: taxi_booking_ajax.ajax_url,
            type: 'POST',
            dataType: 'json',
            data: {
                action: 'taxi_get_payment_thank_you',
                nonce: taxi_booking_ajax.nonce,
                booking_id: bookingId,
                transaction_id: transactionId,
                session_id: sessionId
            },
            success: function (response) {
                if (response.success && response.data) {
                    // Show payment thank you section
                    $('#booking-success').show();
                    $('#booking-id').text(response.data.booking_id || bookingId);
                    $('#success-html').html(response.data.html || '<p>Payment completed successfully!</p>');

                    // show or hide success heading based on payment method
                    $('#succcess-heading').show();

                    // Track conversion for Google Ads if we have the data
                    if (taxi_booking_ajax.google_ads.enabled && response.data) {

                        console.log('[Google Ads Debug] Payment Thank You Data:', response.data);

                        var customerData = {
                            email: response.data.customer_email || '',
                            phone: response.data.customer_phone || ''
                        };
                        var bookingValue = parseFloat(response.data.payment_value || response.data.amount || 0);
                        var currency = response.data.currency || taxi_booking_ajax.currency;

                        console.log('[Google Ads Debug] Prepared Conversion Data:', {
                            bookingId: bookingId,
                            value: bookingValue,
                            currency: currency,
                            customerData: customerData
                        });

                        if (bookingValue > 0) {
                            // Retry mechanism for Google Ads tracking
                            var maxRetries = 10;
                            var retryCount = 0;
                            var trackInterval = setInterval(function () {
                                if (window.TaxiBookingGoogleAds && typeof window.TaxiBookingGoogleAds.trackConversion === 'function') {
                                    clearInterval(trackInterval);
                                    console.log('[Google Ads Debug] TaxiBookingGoogleAds found, tracking conversion...');
                                    window.TaxiBookingGoogleAds.trackConversion(
                                        bookingId,
                                        bookingValue,
                                        currency,
                                        customerData
                                    );
                                } else {
                                    retryCount++;
                                    console.log('[Google Ads Debug] TaxiBookingGoogleAds not found, retrying... (' + retryCount + '/' + maxRetries + ')');
                                    if (retryCount >= maxRetries) {
                                        clearInterval(trackInterval);
                                        console.error('[Google Ads Debug] Failed to track conversion: TaxiBookingGoogleAds not available after retries');
                                    }
                                }
                            }, 500); // Check every 500ms
                        } else {
                            console.warn('[Google Ads Debug] Booking value is 0, skipping conversion tracking');
                        }
                    }

                    // Store payment thank you data with expiry (2 hours)
                    var successData = response.data || {};
                    var expiry = Date.now() + 2 * 60 * 60 * 1000;
                    TBKState.put({
                        taxi_booking_payment_thank_you: {
                            ...successData,
                            _expiry: expiry,
                            _type: 'payment_thank_you'
                        }
                    });

                } else {
                    $('#booking-error').html('<p>' + (response.data && response.data.message ? response.data.message : 'Unable to load payment confirmation') + '</p>').show();
                }

                $('#form-loading').hide();

            },
            error: function () {
                $('#form-loading').hide();
                $('#booking-error').html('<p>Error loading payment confirmation. Please try again.</p>').show();
            }
        });
    }

    // Initialize booking form auth tabs when document is ready
    $(document).ready(function () {
        initBookingFormAuthTabs();
    });

    // Handle authentication tabs in booking form (step 3)
    function initBookingFormAuthTabs() {
        // Handle inline login form in booking form
        $(document).on('click', '#login-submit', function (e) {
            e.preventDefault();
            handleBookingFormLogin();
        });

        // Handle inline register form in booking form
        $(document).on('click', '#register-submit', function (e) {
            e.preventDefault();
            handleBookingFormRegister();
        });

        // Company/Private account type toggle in booking form
        $(document).on('change', 'input[name="reg_type"]', function () {
            const isCompany = $(this).val() === 'company';
            $('.company-only').toggle(isCompany);

            // Clear company fields if switching to private
            if (!isCompany) {
                $('.company-only input').val('');
            }
        });
    }

    function handleBookingFormLogin() {
        const email = $('#login-email').val();
        const password = $('#login-password').val();

        // Clear previous errors
        $('.field-error').text('');
        $('#booking-error').hide();

        // Validate fields
        if (!email) {
            showBookingError('Email is required');
            return;
        }

        if (!password) {
            showBookingError('Password is required');
            return;
        }

        // Show loading
        $('#form-loading').show();
        $('#login-submit').prop('disabled', true);

        $.ajax({
            url: taxi_booking_ajax.ajax_url,
            type: 'POST',
            dataType: 'json',
            data: {
                action: 'taxi_user_login',
                nonce: $('#taxi_booking_nonce').val(),
                email: email,
                password: password,
                remember_me: false
            },
            success: function (response) {
                $('#form-loading').hide();
                $('#login-submit').prop('disabled', false);

                if (response.success) {
                    // Login successful - update UI to show logged in state

                    // Update the guest form with user data
                    if (response.data.user) {
                        const user = response.data.user;
                        $('#customer-name').val(user.name);
                        $('#customer-email').val(user.email);
                        if (user.phone) {
                            $('#customer-phone').val(user.phone);
                        }
                    }

                    // Switch back to guest tab but with pre-filled data
                    $('.auth-tab[data-tab="guest"]').click();

                    // Hide auth tabs after successful login
                    $('.auth-tabs').hide();

                    // Show success alert after taxi-steps
                    showAuthSuccessAlert('Login successful! You are now logged in.');

                } else {
                    showBookingError(response.data.message || 'Login failed');
                }
            },
            error: function () {
                $('#form-loading').hide();
                $('#login-submit').prop('disabled', false);
                showBookingError('Network error occurred. Please try again.');
            }
        });
    }

    function handleBookingFormRegister() {
        // Get form data
        const formData = {
            first_name: $('#reg-first-name').val(),
            last_name: $('#reg-last-name').val(),
            email: $('#reg-email').val(),
            phone: regPhoneIti ? regPhoneIti.getNumber() : $('#reg-phone').val(),
            password: $('#reg-password').val(),
            password_confirmation: $('#reg-password-confirm').val(),
            reg_type: $('input[name="reg_type"]:checked').val(),
            agree_terms: true // Assume agreed for booking context
        };

        // Add company fields if company account
        if (formData.reg_type === 'company') {
            formData.company_name = $('#reg-company-name').val();
            formData.company_number = $('#reg-company-number').val();
            formData.company_vat = $('#reg-company-vat').val();
        }

        // Clear previous errors
        $('.field-error').text('');
        $('#booking-error').hide();

        // Validate fields
        let isValid = true;

        if (!formData.first_name) {
            showBookingError('First name is required');
            isValid = false;
        }

        if (!formData.last_name) {
            showBookingError('Last name is required');
            isValid = false;
        }

        if (!formData.email) {
            showBookingError('Email is required');
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            showBookingError('Please enter a valid email address');
            isValid = false;
        }

        if (!formData.phone) {
            showBookingError('Phone number is required');
            isValid = false;
        }

        if (!formData.password) {
            showBookingError('Password is required');
            isValid = false;
        } else if (formData.password.length < 8) {
            showBookingError('Password must be at least 8 characters');
            isValid = false;
        }

        if (formData.password !== formData.password_confirmation) {
            showBookingError('Passwords do not match');
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        // Show loading
        $('#form-loading').show();
        $('#register-submit').prop('disabled', true);

        $.ajax({
            url: taxi_booking_ajax.ajax_url,
            type: 'POST',
            dataType: 'json',
            data: {
                action: 'taxi_user_register',
                nonce: $('#taxi_booking_nonce').val(),
                ...formData
            },
            success: function (response) {
                $('#form-loading').hide();
                $('#register-submit').prop('disabled', false);

                if (response.success) {


                    // Update the guest form with user data
                    if (response.data.user) {
                        const user = response.data.user;

                        // Handle different name formats
                        let fullName = '';
                        if (user.name) {
                            fullName = user.name;
                        } else if (user.first_name || user.last_name) {
                            fullName = ((user.first_name || '') + ' ' + (user.last_name || '')).trim();
                        }

                        if (fullName) {
                            $('#customer-name').val(fullName);
                        }

                        if (user.email) {
                            $('#customer-email').val(user.email);
                        }

                        if (user.phone) {
                            $('#customer-phone').val(user.phone);
                        }
                    }

                    // Switch back to guest tab but with pre-filled data
                    $('.auth-tab[data-tab="guest"]').click();

                    // Hide auth tabs after successful registration
                    $('.auth-tabs').hide();

                    // Show success alert after taxi-steps
                    showAuthSuccessAlert('Registration successful! You are now logged in.');

                } else {
                    showBookingError(response.data.message || 'Registration failed');
                }
            },
            error: function () {
                $('#form-loading').hide();
                $('#register-submit').prop('disabled', false);
                showBookingError('Network error occurred. Please try again.');
            }
        });
    }

    function showBookingError(message) {
        $('#booking-success').hide();
        $('#booking-error').show().find('p').text(message);
        setTimeout(() => {
            $('#booking-error').hide();
        }, 5000);
    }

    function showAuthSuccessAlert(message) {
        // Remove any existing auth success alert
        $('#auth-success-alert').remove();

        // Create new alert element
        var alertHtml = '<div id="auth-success-alert" style="background: #d4edda; color: #155724; padding: 12px 20px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #c3e6cb; display: flex; align-items: center; gap: 10px; animation: slideDown 0.3s ease-out;">' +
            '<i class="fas fa-check-circle" style="color: #28a745; font-size: 18px;"></i>' +
            '<span>' + message + '</span>' +
            '</div>';

        // Insert inside taxi-booking-form, after taxi-steps
        if ($('#taxi-booking-form .taxi-steps').length > 0) {
            $('#taxi-booking-form .taxi-steps').after(alertHtml);
        } else if ($('#taxi-booking-form').length > 0) {
            // Fallback: insert at the top of taxi-booking-form
            $('#taxi-booking-form').prepend(alertHtml);
        } else {
            // Last fallback: insert at the top of step-3-details
            $('#step-3-details').prepend(alertHtml);
        }

        // Auto-hide after 4 seconds
        setTimeout(function () {
            $('#auth-success-alert').fadeOut(300, function () {
                $(this).remove();
            });
        }, 4000);

        // Scroll to the alert
        $('html, body').animate({
            scrollTop: $('#auth-success-alert').offset().top - 100
        }, 500);
    }

})(jQuery);
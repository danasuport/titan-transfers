/**
 * Taxi Booking Plugin - Dashboard Module
 * Handles user dashboard functionality including bookings list, details, and cancellation
 */
(function ($) {
    'use strict';

    // Current booking data for tracking/printing
    var currentBookingId = null;
    var currentBookingData = null;
    var currentCancelBookingId = null;

    // Initialize dashboard when document is ready
    $(document).ready(function () {
        if ($('#taxi-dashboard-widget').length === 0) {
            return; // Not on dashboard page
        }

        initDashboard();
    });

    function initDashboard() {
        // Check if user is logged in (set by PHP)
        if (typeof taxiDashboardConfig === 'undefined' || !taxiDashboardConfig.isLoggedIn) {
            return;
        }

        // Load bookings on page load
        loadUserBookings();

        // Initialize tab navigation
        initTabNavigation();

        // Initialize mobile menu
        initMobileMenu();

        // Initialize user menu dropdown
        initUserMenu();

        // Initialize cancel modal
        initCancelModal();

        // Initialize logout handlers
        initLogoutHandlers();

        // Mark widget as loaded
        setTimeout(function () {
            if (!$('.taxi-booking-widget').hasClass('loaded')) {
                $('.taxi-booking-widget').addClass('loaded');
            }
        }, 500);
    }

    function initTabNavigation() {
        // Sidebar navigation
        $(document).on('click', '.sidebar-nav a[data-tab]', function (e) {
            e.preventDefault();

            var targetTab = $(this).data('tab');

            // Update active tab in sidebar
            $('.sidebar-nav a').removeClass('active');
            $(this).addClass('active');

            // Update mobile header title
            var tabText = $(this).text().trim();
            $('.mobile-header-title span').text(tabText);

            // Show correct content
            $('.dashboard-tab').hide();
            $('#' + targetTab + '-tab').show();

            // Update content title
            var titles = {
                'bookings': taxiDashboardConfig.strings.yourTrips || 'Your trips',
                'new-trip': taxiDashboardConfig.strings.newTrip || 'New trip',
                'profile': taxiDashboardConfig.strings.settings || 'Settings'
            };
            $('.content-title').text(titles[targetTab] || titles['bookings']);

            // Close mobile sidebar
            if ($(window).width() <= 768) {
                $('#dashboard-sidebar').removeClass('mobile-open');
                $('#mobile-overlay').removeClass('show');
                $('#mobile-menu-toggle i').removeClass('fa-times').addClass('fa-bars');
            }
        });

        // Header dropdown navigation
        $(document).on('click', '.user-dropdown a[data-tab]', function (e) {
            e.preventDefault();

            var targetTab = $(this).data('tab');

            // Update sidebar active state
            $('.sidebar-nav a').removeClass('active');
            $('.sidebar-nav a[data-tab="' + targetTab + '"]').addClass('active');

            // Show correct content
            $('.dashboard-tab').hide();
            $('#' + targetTab + '-tab').show();

            // Update content title
            var titles = {
                'bookings': taxiDashboardConfig.strings.yourTrips || 'Your trips',
                'new-trip': taxiDashboardConfig.strings.newTrip || 'New trip',
                'profile': taxiDashboardConfig.strings.settings || 'Settings'
            };
            $('.content-title').text(titles[targetTab] || titles['bookings']);

            // Close dropdown
            $('#user-dropdown').removeClass('show');
        });
    }

    function initMobileMenu() {
        // Mobile menu toggle
        $(document).on('click', '#mobile-menu-toggle', function (e) {
            e.stopPropagation();

            var sidebar = $('#dashboard-sidebar');
            var overlay = $('#mobile-overlay');
            var icon = $(this).find('i');

            sidebar.toggleClass('mobile-open');
            overlay.toggleClass('show');

            if (sidebar.hasClass('mobile-open')) {
                icon.removeClass('fa-bars').addClass('fa-times');
            } else {
                icon.removeClass('fa-times').addClass('fa-bars');
            }
        });

        // Close mobile menu when clicking overlay
        $(document).on('click', '#mobile-overlay', function () {
            $('#dashboard-sidebar').removeClass('mobile-open');
            $('#mobile-overlay').removeClass('show');
            $('#mobile-menu-toggle i').removeClass('fa-times').addClass('fa-bars');
        });

        // Mobile user avatar click - logout
        $(document).on('click', '.mobile-user-avatar', function (e) {
            e.preventDefault();
            if (confirm(taxiDashboardConfig.strings.confirmLogout || 'Are you sure you want to logout?')) {
                logout();
            }
        });
    }

    function initUserMenu() {
        // User menu toggle
        $(document).on('click', '#user-menu-toggle', function (e) {
            e.stopPropagation();
            $('#user-dropdown').toggleClass('show');
        });

        // Close dropdown when clicking outside
        $(document).on('click', function () {
            $('#user-dropdown').removeClass('show');
        });
    }

    function initCancelModal() {
        // Close modal
        $(document).on('click', '#cancel-modal-close', function () {
            $('#cancel-modal').hide();
            currentCancelBookingId = null;
        });

        // Confirm cancel
        $(document).on('click', '#cancel-modal-confirm', function () {
            if (currentCancelBookingId) {
                var reason = $('#cancel-reason').val() || '';
                cancelBooking(currentCancelBookingId, reason);
            }
        });

        // Close modal when clicking outside
        $(document).on('click', '#cancel-modal', function (e) {
            if (e.target === this) {
                $(this).hide();
                currentCancelBookingId = null;
            }
        });
    }

    function initLogoutHandlers() {
        $(document).on('click', '#sidebar-logout-btn, #header-logout-btn', function (e) {
            e.preventDefault();
            if (confirm(taxiDashboardConfig.strings.confirmLogout || 'Are you sure you want to logout?')) {
                logout();
            }
        });
    }

    function loadUserBookings() {
        var $loadingContainer = $('.loading-bookings');
        var $bookingsList = $('#bookings-list');

        $loadingContainer.show();

        $.ajax({
            url: taxiDashboardConfig.ajaxUrl,
            type: 'POST',
            dataType: 'json',
            data: {
                action: 'taxi_get_user_bookings',
                nonce: $('#taxi_booking_nonce').val()
            },
            success: function (response) {
                $loadingContainer.hide();

                if (response.success) {
                    displayBookings(response.data);
                } else {
                    // Check if empty bookings
                    var isEmptyBookings = response.data &&
                        response.data.message &&
                        typeof response.data.message === 'object' &&
                        Array.isArray(response.data.message.error) &&
                        response.data.message.error.length === 0;

                    if (isEmptyBookings) {
                        displayBookings(null);
                    } else {
                        showError(response.data ? response.data.message : (taxiDashboardConfig.strings.failedToLoad || 'Failed to load bookings'));
                    }
                }
            },
            error: function () {
                $loadingContainer.hide();
                showError(taxiDashboardConfig.strings.networkError || 'Network error occurred');
            }
        });
    }

    function displayBookings(bookings) {
        var $bookingsList = $('#bookings-list');

        if (!bookings || Object.keys(bookings).length === 0) {
            $bookingsList.html(
                '<div class="empty-state">' +
                '<i class="fas fa-calendar-times"></i>' +
                '<h3>' + (taxiDashboardConfig.strings.noBookings || 'No bookings yet') + '</h3>' +
                '<p>' + (taxiDashboardConfig.strings.noBookingsDesc || "You haven't made any bookings yet.") + '</p>' +
                '</div>'
            );
            return;
        }

        var html = '';
        var bookingsArray = Array.isArray(bookings) ? bookings : Object.values(bookings);

        bookingsArray.forEach(function (booking) {
            // Extract status
            var statusMatch = booking.status.match(/style="background:(#[0-9a-f]+);">([^<]+)</i);
            var statusText = statusMatch ? statusMatch[2].trim() : 'Unknown';
            var statusColor = statusMatch ? statusMatch[1] : '#999';
            var canCancel = booking.buttonCancel === 1;

            html += '<div class="booking-card">';
            html += '<div class="booking-price">' + booking.price + '</div>';
            html += '<div class="booking-status" style="background: ' + statusColor + '; color: white;">' + statusText + '</div>';
            html += '<div style="margin-bottom: 12px; color: #666; font-size: 13px;"><strong>Ref:</strong> ' + booking.refNumber + '</div>';
            html += '<div class="booking-locations">';
            html += '<div class="booking-location"><i class="fas fa-circle location-icon pickup"></i><span class="location-text">' + booking.from + '</span></div>';
            if (booking.waypoints) {
                html += '<div class="booking-location"><i class="fas fa-map-pin location-icon" style="color: #ffc107;"></i><span class="location-text">' + booking.waypoints + '</span></div>';
            }
            html += '<div class="booking-location"><i class="fas fa-map-marker-alt location-icon destination"></i><span class="location-text">' + booking.to + '</span></div>';
            html += '</div>';
            html += '<div class="booking-datetime"><i class="fas fa-calendar-alt"></i><span>' + booking.date + '</span></div>';

            if (booking.contact_name) {
                html += '<div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #f0f0f0; font-size: 14px; color: #666;">';
                html += '<div style="margin-bottom: 4px;"><i class="fas fa-user" style="width: 16px;"></i> ' + booking.contact_name + '</div>';
                if (booking.contact_mobile) {
                    html += '<div><i class="fas fa-phone" style="width: 16px;"></i> ' + booking.contact_mobile + '</div>';
                }
                html += '</div>';
            }

            html += '<div class="booking-actions" style="margin-top: 15px; display: flex; justify-content: flex-end; align-items: center; gap: 10px;">';
            html += '<button type="button" class="btn-view-details" data-id="' + booking.id + '"><i class="fas fa-eye"></i> View Details</button>';
            if (canCancel) {
                html += '<button type="button" class="btn-cancel" data-id="' + booking.id + '"><i class="fas fa-times"></i> Cancel</button>';
            }
            html += '</div>';
            html += '</div>';
        });

        $bookingsList.html(html);
    }

    // View booking details
    $(document).on('click', '.btn-view-details', function () {
        var bookingId = $(this).data('id');
        viewBookingDetails(bookingId);
    });

    // Show cancel modal
    $(document).on('click', '.btn-cancel', function () {
        var bookingId = $(this).data('id');
        showCancelModal(bookingId);
    });

    function viewBookingDetails(bookingId) {
        // Hide all tabs
        $('.dashboard-tab').hide();

        // Show booking details tab
        $('#booking-details-tab').show();

        // Update content title
        $('.content-title').text(taxiDashboardConfig.strings.bookingDetails || 'Booking Details');

        // Load booking details
        loadBookingDetails(bookingId);
    }

    function loadBookingDetails(bookingId) {
        var $detailsContent = $('#booking-details-content');

        $detailsContent.html(
            '<div class="loading-bookings">' +
            '<div class="taxi-spinner"></div>' +
            '<p>' + (taxiDashboardConfig.strings.loadingDetails || 'Loading booking details...') + '</p>' +
            '</div>'
        );

        $.ajax({
            url: taxiDashboardConfig.ajaxUrl,
            type: 'POST',
            dataType: 'json',
            data: {
                action: 'taxi_get_booking_details',
                nonce: $('#taxi_booking_nonce').val(),
                booking_id: bookingId
            },
            success: function (response) {
                if (response.success) {
                    displayBookingDetails(response.data);
                } else {
                    showError(response.data ? response.data.message : (taxiDashboardConfig.strings.failedToLoadDetails || 'Failed to load booking details'));
                    goBackToBookings();
                }
            },
            error: function () {
                showError(taxiDashboardConfig.strings.networkError || 'Network error occurred');
                goBackToBookings();
            }
        });
    }

    function displayBookingDetails(booking) {
        currentBookingId = booking.id;
        currentBookingData = booking;

        var $detailsContent = $('#booking-details-content');

        // Extract status
        var statusMatch = booking.status.match(/style="background:(#[0-9a-f]+);">([^<]+)</i);
        var statusText = statusMatch ? statusMatch[2].trim() : 'Unknown';
        var statusColor = statusMatch ? statusMatch[1] : '#999';

        var html = '';

        // Back button
        html += '<div style="margin-bottom: 20px;">';
        html += '<button type="button" class="btn-back" id="go-back-btn"><i class="fas fa-arrow-left"></i> Go back</button>';
        html += '</div>';

        // Transfer Details
        html += '<div class="details-section">';
        html += '<h3>' + (taxiDashboardConfig.strings.transferDetails || 'Transfer Details') + '</h3>';
        html += buildDetailRow(taxiDashboardConfig.strings.pickup || 'Pick-up:', booking.from);
        html += buildDetailRow(taxiDashboardConfig.strings.dateTime || 'Date & Time:', booking.date);
        html += buildDetailRow(taxiDashboardConfig.strings.dropoff || 'Dropoff:', booking.to);
        if (booking.waypoints) {
            html += buildDetailRow(taxiDashboardConfig.strings.via || 'Via:', booking.waypoints);
        }
        if (booking.vehicle) {
            html += buildDetailRow(taxiDashboardConfig.strings.vehicle || 'Vehicle:', booking.vehicle);
        }
        if (booking.passengers) {
            html += buildDetailRow(taxiDashboardConfig.strings.passengers || 'Passengers:', booking.passengers);
        }
        if (booking.luggage) {
            html += buildDetailRow(taxiDashboardConfig.strings.suitcases || 'Suitcases:', booking.luggage);
        }
        html += '</div>';

        // Flight Information
        if (booking.flightNumber || booking.departureFlightNumber) {
            html += '<div class="details-section">';
            html += '<h3>' + (taxiDashboardConfig.strings.flightInfo || 'Flight Information') + '</h3>';
            if (booking.flightNumber) {
                html += buildDetailRow(taxiDashboardConfig.strings.arrivalFlight || 'Arrival Flight Number:', booking.flightNumber);
            }
            if (booking.departureFlightNumber) {
                html += buildDetailRow(taxiDashboardConfig.strings.departureFlight || 'Departure Flight Number:', booking.departureFlightNumber);
            }
            html += '</div>';
        }

        // Contact Details
        if (booking.contactName || booking.contactMobile || booking.contactEmail) {
            html += '<div class="details-section">';
            html += '<h3>' + (taxiDashboardConfig.strings.yourDetails || 'Your Details') + '</h3>';
            if (booking.contactName) {
                html += buildDetailRow(taxiDashboardConfig.strings.fullName || 'Full name:', booking.contactName);
            }
            if (booking.contactMobile) {
                html += buildDetailRow(taxiDashboardConfig.strings.phone || 'Phone number:', booking.contactMobile);
            }
            if (booking.contactEmail) {
                html += buildDetailRow(taxiDashboardConfig.strings.email || 'Email:', booking.contactEmail);
            }
            html += '</div>';
        }

        // Reservation Details
        html += '<div class="details-section">';
        html += '<h3>' + (taxiDashboardConfig.strings.reservationDetails || 'Reservation Details') + '</h3>';
        html += buildDetailRow(taxiDashboardConfig.strings.refId || 'Ref ID:', booking.refNumber);
        html += buildDetailRow(taxiDashboardConfig.strings.bookingDate || 'Booking date:', booking.createdDate);
        html += '<div class="detail-row"><div class="detail-label">' + (taxiDashboardConfig.strings.status || 'Status:') + '</div>';
        html += '<div class="detail-value"><span style="background: ' + statusColor + '; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 500;">' + statusText + '</span></div></div>';
        html += '</div>';

        // Payment Section
        html += '<div class="details-section">';
        html += '<div class="detail-row">';
        html += '<div class="detail-label" style="font-size: 16px; font-weight: 600;">' + (taxiDashboardConfig.strings.total || 'Total:') + '</div>';
        html += '<div class="detail-value" style="font-size: 18px; font-weight: 600; color: var(--taxi-primary-color);">' + (booking.total || booking.totalPrice) + '</div>';
        html += '</div>';
        html += '</div>';

        // Action Buttons
        html += '<div style="margin-top: 20px; display: flex; gap: 15px; flex-wrap: wrap; align-items: flex-start;">';
        html += '<button type="button" class="btn-back" id="go-back-btn-2"><i class="fas fa-arrow-left"></i> Go back</button>';
        html += '<button type="button" class="btn-action-primary" id="print-booking-btn"><i class="fas fa-print"></i> Print</button>';
        html += '<button type="button" class="btn-action-primary" id="tracking-history-btn"><i class="fas fa-history"></i> Tracking history</button>';
        if (booking.buttonCancel === 1) {
            html += '<button type="button" class="btn-cancel" id="cancel-booking-btn" data-id="' + booking.id + '"><i class="fas fa-times"></i> Cancel Booking</button>';
        }
        html += '</div>';

        $detailsContent.html(html);
    }

    function buildDetailRow(label, value) {
        return '<div class="detail-row"><div class="detail-label">' + label + '</div><div class="detail-value">' + (value || '-') + '</div></div>';
    }

    // Go back to bookings
    $(document).on('click', '#go-back-btn, #go-back-btn-2', function () {
        goBackToBookings();
    });

    function goBackToBookings() {
        $('.dashboard-tab').hide();
        $('#bookings-tab').show();
        $('.content-title').text(taxiDashboardConfig.strings.yourTrips || 'Your trips');
        $('.sidebar-nav a').removeClass('active');
        $('.sidebar-nav a[data-tab="bookings"]').addClass('active');
        loadUserBookings();
    }

    // Print booking
    $(document).on('click', '#print-booking-btn', function () {
        printBooking();
    });

    function printBooking() {
        if (!currentBookingData) return;

        var booking = currentBookingData;
        var html = '<!DOCTYPE html><html><head>';
        html += '<title>Booking Receipt - ' + booking.refNumber + '</title>';
        html += '<style>';
        html += '* { margin: 0; padding: 0; box-sizing: border-box; }';
        html += 'body { font-family: "Courier New", monospace; padding: 20px; max-width: 400px; margin: 0 auto; }';
        html += '.receipt-header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 15px; margin-bottom: 15px; }';
        html += '.receipt-header h1 { font-size: 24px; margin-bottom: 5px; }';
        html += '.receipt-section { margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px dashed #ccc; }';
        html += '.receipt-row { display: flex; justify-content: space-between; margin: 5px 0; font-size: 14px; }';
        html += '.receipt-row .label { font-weight: bold; }';
        html += '.receipt-total { font-size: 18px; font-weight: bold; margin-top: 10px; }';
        html += '.receipt-footer { text-align: center; margin-top: 15px; font-size: 12px; }';
        html += '</style></head><body>';

        html += '<div class="receipt-header"><h1>TAXI BOOKING</h1><p>Receipt</p><p>Ref: ' + booking.refNumber + '</p></div>';
        html += '<div class="receipt-section"><h3>Journey Details</h3>';
        html += '<div class="receipt-row"><span class="label">From:</span><span>' + booking.from + '</span></div>';
        html += '<div class="receipt-row"><span class="label">To:</span><span>' + booking.to + '</span></div>';
        html += '<div class="receipt-row"><span class="label">Date:</span><span>' + booking.date + '</span></div></div>';
        html += '<div class="receipt-section"><div class="receipt-row receipt-total"><span class="label">Total:</span><span>' + (booking.total || booking.totalPrice) + '</span></div></div>';
        html += '<div class="receipt-footer"><p>Thank you for your booking!</p><p>Printed: ' + new Date().toLocaleString() + '</p></div>';
        html += '<script>window.onload = function() { window.print(); }<\/script></body></html>';

        var printWindow = window.open('', '_blank');
        printWindow.document.write(html);
        printWindow.document.close();
    }

    // Tracking history
    $(document).on('click', '#tracking-history-btn', function () {
        showTrackingHistory();
    });

    function showTrackingHistory() {
        if (!currentBookingId) {
            showError('No booking selected');
            return;
        }

        // Show loading
        var $loading = $('<div id="tracking-loading" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10000;"><div class="loading-bookings"><div class="taxi-spinner"></div><p>Loading tracking history...</p></div></div>');
        $('body').append($loading);

        $.ajax({
            url: taxiDashboardConfig.ajaxUrl,
            type: 'POST',
            dataType: 'json',
            data: {
                action: 'taxi_get_booking_tracking',
                nonce: $('#taxi_booking_nonce').val(),
                booking_id: currentBookingId
            },
            success: function (response) {
                $('#tracking-loading').remove();

                if ((response.success === false || response.status === false) && response.message) {
                    showError(response.message);
                    return;
                }

                displayTrackingHistory(response);
            },
            error: function () {
                $('#tracking-loading').remove();
                showError(taxiDashboardConfig.strings.networkError || 'Network error occurred');
            }
        });
    }

    function displayTrackingHistory(trackingData) {
        var modalHtml = '<div id="tracking-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;">';
        modalHtml += '<div style="background: white; border-radius: 8px; width: 100%; max-width: 1200px; height: 90vh; display: flex; flex-direction: column;">';
        modalHtml += '<div style="display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #e0e0e0;">';
        modalHtml += '<h3 style="margin: 0;">Tracking History</h3>';
        modalHtml += '<button id="close-tracking-modal" style="background: none; border: none; font-size: 28px; cursor: pointer; color: #666;">&times;</button>';
        modalHtml += '</div>';
        modalHtml += '<div style="flex: 1; display: flex; flex-direction: column;">';
        modalHtml += '<div id="tracking-map" style="flex: 1; min-height: 400px;"></div>';
        modalHtml += '<div id="tracking-statuses" style="padding: 20px; max-height: 200px; overflow-y: auto; border-top: 1px solid #e0e0e0;">';
        modalHtml += '<h4 style="margin: 0 0 15px 0;">Status History</h4>';
        modalHtml += '<div id="status-list"></div>';
        modalHtml += '</div></div></div></div>';

        $('body').append(modalHtml);

        // Initialize map
        if (window.google && window.google.maps) {
            initTrackingMap(trackingData);
        } else {
            var script = document.createElement('script');
            script.src = 'https://maps.googleapis.com/maps/api/js?key=' + taxiDashboardConfig.googleMapsKey;
            script.onload = function () {
                initTrackingMap(trackingData);
            };
            document.head.appendChild(script);
        }

        // Display status history
        displayStatusHistory(trackingData.statuses || []);
    }

    function initTrackingMap(trackingData) {
        var mapElement = document.getElementById('tracking-map');
        if (!mapElement || !trackingData.origin || !trackingData.destination) return;

        var origin = trackingData.origin;
        var destination = trackingData.destination;
        var centerLat = (origin.lat + destination.lat) / 2;
        var centerLng = (origin.lng + destination.lng) / 2;

        var map = new google.maps.Map(mapElement, {
            center: { lat: centerLat, lng: centerLng },
            zoom: 11
        });

        // Origin marker
        new google.maps.Marker({
            position: { lat: origin.lat, lng: origin.lng },
            map: map,
            title: 'Pickup Location',
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#28a745',
                fillOpacity: 1,
                strokeColor: '#fff',
                strokeWeight: 2
            }
        });

        // Destination marker
        new google.maps.Marker({
            position: { lat: destination.lat, lng: destination.lng },
            map: map,
            title: 'Dropoff Location',
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#dc3545',
                fillOpacity: 1,
                strokeColor: '#fff',
                strokeWeight: 2
            }
        });

        // Route line
        new google.maps.Polyline({
            path: [
                { lat: origin.lat, lng: origin.lng },
                { lat: destination.lat, lng: destination.lng }
            ],
            geodesic: true,
            strokeColor: '#007bff',
            strokeOpacity: 0.8,
            strokeWeight: 3,
            map: map
        });

        // Fit bounds
        var bounds = new google.maps.LatLngBounds();
        bounds.extend({ lat: origin.lat, lng: origin.lng });
        bounds.extend({ lat: destination.lat, lng: destination.lng });
        map.fitBounds(bounds);
    }

    function displayStatusHistory(statuses) {
        var $statusList = $('#status-list');

        if (!statuses || statuses.length === 0) {
            $statusList.html('<p style="color: #666; margin: 0;">No status updates available.</p>');
            return;
        }

        var html = '';
        statuses.forEach(function (status, index) {
            html += '<div style="padding: 12px; background: ' + (index === 0 ? '#f8f9fa' : 'white') + '; border-radius: 4px; margin-bottom: 8px; border-left: 3px solid var(--taxi-primary-color);">';
            html += '<div style="font-weight: 600; color: #333; margin-bottom: 4px;">' + (status.status || status.title || 'Status Update') + '</div>';
            if (status.time || status.datetime) {
                html += '<div style="font-size: 13px; color: #666;">' + (status.time || status.datetime) + '</div>';
            }
            html += '</div>';
        });

        $statusList.html(html);
    }

    // Close tracking modal
    $(document).on('click', '#close-tracking-modal, #tracking-modal', function (e) {
        if (e.target === this || e.target.id === 'close-tracking-modal') {
            $('#tracking-modal').remove();
        }
    });

    // Cancel booking
    $(document).on('click', '#cancel-booking-btn', function () {
        var bookingId = $(this).data('id');
        showCancelModal(bookingId);
    });

    function showCancelModal(bookingId) {
        currentCancelBookingId = bookingId;
        $('#cancel-reason').val('');
        $('#cancel-modal').show();
    }

    function cancelBooking(bookingId, reason) {
        var $confirmBtn = $('#cancel-modal-confirm');
        $confirmBtn.prop('disabled', true).text(taxiDashboardConfig.strings.cancelling || 'Cancelling...');

        $.ajax({
            url: taxiDashboardConfig.ajaxUrl,
            type: 'POST',
            dataType: 'json',
            data: {
                action: 'taxi_cancel_user_booking',
                nonce: $('#taxi_booking_nonce').val(),
                booking_id: bookingId,
                reason: reason
            },
            success: function (response) {
                $('#cancel-modal').hide();
                $confirmBtn.prop('disabled', false).text(taxiDashboardConfig.strings.cancelBooking || 'Cancel Booking');

                if (response.success) {
                    showSuccess(response.data ? response.data.message : (taxiDashboardConfig.strings.bookingCancelled || 'Booking cancelled successfully'));
                    loadUserBookings();
                } else {
                    showError(response.data ? response.data.message : (taxiDashboardConfig.strings.cancelFailed || 'Failed to cancel booking'));
                }
            },
            error: function () {
                $('#cancel-modal').hide();
                $confirmBtn.prop('disabled', false).text(taxiDashboardConfig.strings.cancelBooking || 'Cancel Booking');
                showError(taxiDashboardConfig.strings.networkError || 'Network error occurred');
            }
        });
    }

    function logout() {
        $.ajax({
            url: taxiDashboardConfig.ajaxUrl,
            type: 'POST',
            dataType: 'json',
            data: {
                action: 'taxi_user_logout',
                nonce: $('#taxi_booking_nonce').val()
            },
            success: function (response) {
                if (response.success) {
                    window.location.reload();
                } else {
                    showError(taxiDashboardConfig.strings.logoutFailed || 'Logout failed');
                }
            },
            error: function () {
                showError(taxiDashboardConfig.strings.networkError || 'Network error occurred');
            }
        });
    }

    function showSuccess(message) {
        var $successDiv = $('#dashboard-success');
        $successDiv.find('p').html(message);
        $successDiv.show();
        setTimeout(function () {
            $successDiv.hide();
        }, 5000);
    }

    function showError(message) {
        var $errorDiv = $('#dashboard-error');
        $errorDiv.find('p').text(message);
        $errorDiv.show();
        setTimeout(function () {
            $errorDiv.hide();
        }, 5000);
    }

    // Expose functions globally for inline handlers (backward compatibility)
    window.TaxiBookingDashboard = {
        loadUserBookings: loadUserBookings,
        viewBookingDetails: viewBookingDetails,
        goBackToBookings: goBackToBookings,
        showCancelModal: showCancelModal,
        printBooking: printBooking,
        showTrackingHistory: showTrackingHistory
    };

})(jQuery);

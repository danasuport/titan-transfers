<?php
/**
 * Plugin Name: Titan Booking Embed
 * Description: Renders /booking/ as a chrome-less embed when ?embed=1 is
 *              present, plus loads iframe-resizer's contentWindow script
 *              so the parent (Next.js on titantransfers.com) can auto-fit
 *              the iframe height. Drop this file into wp-content/mu-plugins/.
 * Author:      KM Adisseny
 * Version:     4.0.1
 */

if (!defined('ABSPATH')) exit;

/**
 * True when the current request is the embed flavour of /booking/.
 *
 * Two signals:
 *  - ?embed=1 in the URL (the parent iframe always sets this on the first load).
 *  - Sec-Fetch-Dest: iframe header (browsers send it on every iframe request,
 *    so step 2 / step 3 navigations inside the plugin stay chrome-less even
 *    if the plugin redirects with location.href and drops the query string).
 */
function titan_booking_is_embed() {
    if (isset($_GET['embed']) && $_GET['embed'] === '1') return true;
    if (isset($_SERVER['HTTP_SEC_FETCH_DEST']) && $_SERVER['HTTP_SEC_FETCH_DEST'] === 'iframe') return true;
    return false;
}

/**
 * Strip the WordPress admin bar from the embedded view.
 */
add_action('init', function () {
    if (titan_booking_is_embed()) {
        add_filter('show_admin_bar', '__return_false');
    }
}, 1);

/**
 * Load a custom, minimal page template when ?embed=1 is on. The template
 * lives inside this MU-plugin so we don't need to touch the active theme.
 */
add_filter('template_include', function ($template) {
    if (titan_booking_is_embed() && is_page()) {
        $custom = __DIR__ . '/templates/embed-page.php';
        if (file_exists($custom)) {
            return $custom;
        }
    }
    return $template;
});

/**
 * Inject iframe-resizer's contentWindow script in the embed view so the
 * parent can resize the iframe to fit the booking widget's actual height.
 * Also a tiny CSS reset to nuke any inherited spacing from the theme.
 */
add_action('wp_head', function () {
    if (!titan_booking_is_embed()) return;
    ?>
    <style id="titan-embed-reset">
        html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #F8FAF0 !important;
            min-height: 0 !important;
        }
        body.titan-embed { background: #F8FAF0 !important; padding: 0 !important; }

        /* Theme chrome — broad selectors so step 2/3 of the plugin stay clean
           even if the navigation drops ?embed=1. The booking widget itself
           is rendered by the [taxi_booking] shortcode, never by the theme. */
        body.titan-embed #wpadminbar,
        body.titan-embed header,
        body.titan-embed footer,
        body.titan-embed .site-header,
        body.titan-embed .site-footer,
        body.titan-embed .header,
        body.titan-embed .footer,
        body.titan-embed .main-header,
        body.titan-embed .main-footer,
        body.titan-embed #header,
        body.titan-embed #footer,
        body.titan-embed #masthead,
        body.titan-embed #colophon,
        body.titan-embed .top-bar,
        body.titan-embed .navbar,
        body.titan-embed nav.main-navigation,
        body.titan-embed .main-navigation,
        body.titan-embed .breadcrumbs,
        body.titan-embed .breadcrumb,
        body.titan-embed aside,
        body.titan-embed .sidebar,
        body.titan-embed #sidebar,
        body.titan-embed .widget-area,
        body.titan-embed .site-branding,
        body.titan-embed .menu-toggle,
        body.titan-embed .vc_row.top-bar,
        body.titan-embed .menu-main-menu-container { display: none !important; }

        /* Cookie banners — every common WP plugin we might bump into.
           The Next.js parent already shows its own consent banner. */
        body.titan-embed #cookie-notice,
        body.titan-embed .cookie-notice-container,
        body.titan-embed #cookie-law-info-bar,
        body.titan-embed .cli-bar-container,
        body.titan-embed .cli-modal,
        body.titan-embed #catapult-cookie-bar,
        body.titan-embed .moove-gdpr-info-bar-container,
        body.titan-embed .moove-gdpr-cookie-modal,
        body.titan-embed .gdpr-bar,
        body.titan-embed .cc-window,
        body.titan-embed .cc-banner,
        body.titan-embed .cc-revoke,
        body.titan-embed .cmplz-cookiebanner,
        body.titan-embed #cmplz-cookiebanner-container,
        body.titan-embed .borlabs-cookie-box,
        body.titan-embed #BorlabsCookieBox,
        body.titan-embed .iubenda-cs-container,
        body.titan-embed [id^="CybotCookiebot"],
        body.titan-embed .cookie-bar,
        body.titan-embed .cookie-banner,
        body.titan-embed [class*="cookie-consent"],
        body.titan-embed [id*="cookie-consent"] { display: none !important; visibility: hidden !important; }

        /* Hide the floating WhatsApp button — the Next.js parent already
           shows its own Help button, so two floating CTAs would compete. */
        body.titan-embed [class*="whatsapp" i],
        body.titan-embed [id*="whatsapp" i],
        body.titan-embed .wa-float,
        body.titan-embed .wa-button,
        body.titan-embed .ht-ctc,
        body.titan-embed .click-to-chat,
        body.titan-embed .wpfront-whatsapp,
        body.titan-embed .floating-whatsapp,
        body.titan-embed .joinchat,
        body.titan-embed #joinchat { display: none !important; visibility: hidden !important; }

        /* Booking widget polish */
        body.titan-embed .taxi-booking-widget { margin: 0 auto !important; box-shadow: none !important; border: none !important; }
        body.titan-embed .taxi-booking-header { background: #8BAA1D !important; }
        body.titan-embed .taxi-booking-header h2,
        body.titan-embed .taxi-booking-header * { color: #ffffff !important; }
        body.titan-embed .taxi-btn-primary,
        body.titan-embed .taxi-btn-success,
        body.titan-embed .booking-type-tab.active { background: #8BAA1D !important; border-color: #8BAA1D !important; color: #ffffff !important; }
        body.titan-embed .taxi-btn-primary:hover:not(:disabled),
        body.titan-embed .taxi-btn-success:hover:not(:disabled) { background: #6B8313 !important; border-color: #6B8313 !important; }
        body.titan-embed .taxi-form-control:focus { border-color: #8BAA1D !important; box-shadow: 0 0 0 3px rgba(139,170,29,0.15) !important; }
        body.titan-embed .location-icon,
        body.titan-embed .date-icon,
        body.titan-embed .time-icon,
        body.titan-embed .input-icon { color: #6B8313 !important; }
    </style>
    <script>
    /* Notify the parent (Next.js on titantransfers.com) of our document
       height, so it can resize the iframe to fit the content with no
       inner scrollbars. Sent on initial load + on every DOM/size change. */
    (function () {
        function send() {
            var doc = document.documentElement;
            var body = document.body;
            var h = Math.max(
                body ? body.scrollHeight : 0,
                body ? body.offsetHeight : 0,
                doc.scrollHeight,
                doc.offsetHeight,
                doc.clientHeight
            );
            try { parent.postMessage({ type: 'titanBookingHeight', height: h }, '*'); } catch (e) {}
        }
        var t;
        function debounce() { clearTimeout(t); t = setTimeout(send, 60); }
        function start() {
            send();
            window.addEventListener('resize', debounce);
            window.addEventListener('load', debounce);
            // Watch any layout shift (step changes, expand/collapse, etc.)
            if (window.ResizeObserver) {
                try { new ResizeObserver(debounce).observe(document.body); } catch (e) {}
            }
            if (window.MutationObserver) {
                try {
                    new MutationObserver(debounce).observe(document.body, {
                        childList: true, subtree: true, attributes: true, characterData: true
                    });
                } catch (e) {}
            }
            // Belt + braces: poll every 500ms in case observers miss a change.
            setInterval(send, 500);
        }
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', start);
        } else {
            start();
        }
    })();
    </script>
    <?php
});

/**
 * Mark the body so our CSS scope is tight.
 */
add_filter('body_class', function ($classes) {
    if (titan_booking_is_embed()) {
        $classes[] = 'titan-embed';
    }
    return $classes;
});

/**
 * Prefill the booking widget's step-1 inputs from the URL params posted by
 * the Next.js home/blog form. The plugin itself only consumes ?bid and
 * ?pm, so we wait for it to render and then inject values + dispatch
 * change events the plugin's own listeners pick up.
 *
 * Auto-clicks #calculate-price-btn when every required field is present
 * so the user lands directly on step 2 (matching the previous ETO embed UX).
 *
 * Robustness: waits 1200ms after prefill before clicking (lets the plugin
 * settle its address autocomplete listeners), verifies the button isn't
 * disabled, and retries up to 3 times if step 1 is still visible after 2.5s.
 */
add_action('wp_footer', function () {
    if (!titan_booking_is_embed()) return;
    ?>
    <script>
    (function () {
        function log() {
            try { console.log.apply(console, ['[titan-prefill]'].concat([].slice.call(arguments))); } catch (e) {}
        }
        function getParams() {
            var sp = new URLSearchParams(window.location.search);
            var keys = ['pickup','dest','pickup_lat','pickup_lng','dest_lat','dest_lng','pickup_pid','dest_pid','date','time','pax','lug','mode','hours','return'];
            var out = {};
            keys.forEach(function (k) { var v = sp.get(k); if (v) out[k] = v; });
            return out;
        }
        var params = getParams();
        var hasParams = !!(params.pickup || params.dest || params.date);
        if (!hasParams) return; // manual flow — nothing to do

        // After a successful step 1 submit the plugin redirects to /booking/
        // ?type=transfer&step=2&pickup=...&dest=... — that URL still carries
        // pickup/dest/date, so without this guard we'd re-run the prefill,
        // re-click submit, and trigger an infinite step-2 reload loop.
        var sp = new URLSearchParams(window.location.search);
        var step = sp.get('step');
        if (step && step !== '1') {
            log('on step', step, '— skipping prefill (already past step 1)');
            return;
        }

        function setVal(sel, val, fire) {
            var el = document.querySelector(sel);
            if (!el) { log('setVal: selector NOT FOUND', sel); return false; }
            if (val == null) return false;
            el.value = val;
            if (fire) {
                // Fire both input and change — some plugins listen to input,
                // others to change. Bubbling so jQuery delegated handlers see it.
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }
            return true;
        }

        // The WP taxi plugin doesn't use Google Places. It has its own
        // backend endpoint `taxi_search_address` that returns place_ids
        // tied to its internal locations DB (with cat_id and cat_type
        // for routing to the right ratecard). The submit AJAX validates
        // place_id against THAT db, so a Google Places place_id makes the
        // server return "Server Error". We have to look up the address
        // through the plugin's own endpoint and use the result.
        function lookupPluginPlace(query, type, cb) {
            if (!window.jQuery || !window.taxi_booking_ajax) {
                log('lookupPluginPlace: jQuery or taxi_booking_ajax missing');
                return cb(null);
            }
            window.jQuery.ajax({
                url: window.taxi_booking_ajax.ajax_url,
                type: 'POST',
                data: {
                    action: 'taxi_search_address',
                    nonce: window.taxi_booking_ajax.nonce,
                    query: query,
                    searchType: type
                },
                success: function (resp) {
                    if (resp && resp.success && resp.data && resp.data.length > 0) {
                        log('lookupPluginPlace', type, query, '→', resp.data[0].name, resp.data[0].place_id);
                        cb(resp.data[0]);
                    } else {
                        log('lookupPluginPlace', type, query, '→ no results');
                        cb(null);
                    }
                },
                error: function (xhr) { log('lookupPluginPlace failed', xhr && xhr.status); cb(null); }
            });
        }

        // Apply a plugin-place result to the input: address text + place_id
        // + cat_id + cat_type as jQuery data attrs (mirroring what the
        // suggestion-click handler does in taxi-booking.js).
        function applyPluginPlace(sel, place) {
            if (!place || !window.jQuery) return false;
            var $el = window.jQuery(sel);
            if (!$el.length) { log('applyPluginPlace: selector NOT FOUND', sel); return false; }
            $el.val(place.name || '');
            if (place.place_id) $el.data('place_id', place.place_id);
            if (place.cat_id) $el.data('cat_id', place.cat_id);
            if (place.cat_type) $el.data('cat_type', place.cat_type);
            log('applyPluginPlace', sel, place.place_id, place.cat_id, place.cat_type);
            return true;
        }

        // Wait for the flatpickr global to load — the WP plugin pulls it
        // from a CDN with no integrity hint, so it can land 1–2s after our
        // script runs. Without it, the tab-click handler's
        // initByHourFields() bails on `typeof flatpickr === 'undefined'`
        // and the date/time inputs stay as raw text inputs (no formatter).
        function whenFlatpickrLoaded(cb) {
            var attempts = 0;
            (function tick() {
                if (typeof window.flatpickr !== 'undefined') return cb();
                if (attempts++ > 100) { log('flatpickr lib NEVER loaded after 10s'); return cb(); }
                setTimeout(tick, 100);
            })();
        }

        // Date/time inputs need flatpickr with format d/m/Y / H:i. The
        // plugin only initialises flatpickr on by-hour fields after a
        // genuine user click on the tab — our programmatic .click() doesn't
        // reliably trigger its $(...).on('click') handler. So we bring our
        // own flatpickr init using the SAME config as the plugin.
        // Configs lifted directly from taxi-booking.js (lines 290 + 299).
        function ensureFlatpickr(sel) {
            var el = document.querySelector(sel);
            if (!el) return null;
            if (el._flatpickr) return el; // already initialised by plugin
            if (typeof window.flatpickr !== 'function') return null;
            try {
                var isTime = /(time)$/i.test(sel);
                if (isTime) {
                    window.flatpickr(el, {
                        enableTime: true,
                        noCalendar: true,
                        dateFormat: 'H:i',
                        time_24hr: true,
                        disableMobile: true
                    });
                } else {
                    window.flatpickr(el, {
                        dateFormat: 'd/m/Y',
                        minDate: 'today',
                        disableMobile: true
                    });
                }
                log('ensureFlatpickr: initialised', sel);
            } catch (e) { log('ensureFlatpickr threw on', sel, e); }
            return el;
        }

        function setFlatpickr(sel, val, cb) {
            cb = cb || function () {};
            if (val == null || val === '') return cb(false);
            var attempts = 0;
            (function tryIt() {
                var el = ensureFlatpickr(sel);
                if (!el) {
                    if (attempts++ > 60) { log('setFlatpickr: selector NEVER appeared', sel); return cb(false); }
                    return setTimeout(tryIt, 100);
                }
                if (!el._flatpickr || typeof el._flatpickr.setDate !== 'function') {
                    if (attempts++ > 60) {
                        log('setFlatpickr: flatpickr NEVER initialised on', sel, '— falling back to raw value (server will likely reject)');
                        el.value = val;
                        el.dispatchEvent(new Event('change', { bubbles: true }));
                        return cb(false);
                    }
                    return setTimeout(tryIt, 100);
                }
                try {
                    el._flatpickr.setDate(val, true);
                    log('setFlatpickr', sel, '→ value=', el.value);
                    cb(true);
                } catch (e) {
                    log('setFlatpickr threw', sel, e);
                    cb(false);
                }
            })();
        }

        // The duration <select> in by-hour mode is populated asynchronously
        // from a server-side API config call. Poll until the select actually
        // has options before we try to assign a value (otherwise the assign
        // is silently dropped because the option doesn't exist yet).
        function setDurationWhenReady(hours, onDone) {
            var attempts = 0;
            (function tick() {
                var sel = document.querySelector('#byhour-duration');
                if (!sel) {
                    if (attempts++ > 60) { log('byhour-duration NOT FOUND after polling'); onDone(false); return; }
                    setTimeout(tick, 200); return;
                }
                // sel.options[0] is the placeholder "<option value=''>Duration</option>"
                var realOptions = Array.from(sel.options).filter(function (o) { return o.value !== '' });
                if (realOptions.length === 0) {
                    if (attempts++ > 60) { log('byhour-duration has no options after polling'); onDone(false); return; }
                    setTimeout(tick, 200); return;
                }
                var target = String(parseInt(hours, 10));
                var match = realOptions.find(function (o) { return o.value === target });
                if (!match) {
                    // Fallback: closest numeric option (or the first one).
                    var nums = realOptions.map(function (o) { return parseInt(o.value, 10) }).filter(function (n) { return !isNaN(n) }).sort(function (a, b) { return a - b });
                    var want = parseInt(hours, 10);
                    var closest = nums.reduce(function (best, n) {
                        return Math.abs(n - want) < Math.abs(best - want) ? n : best;
                    }, nums[0]);
                    sel.value = String(closest);
                    log('byhour-duration: requested', target, 'not in options', nums, '— using closest', closest);
                } else {
                    sel.value = match.value;
                    log('byhour-duration set to', match.value);
                }
                sel.dispatchEvent(new Event('change', { bubbles: true }));
                onDone(true);
            })();
        }
        function setNumber(name, val) {
            var n = parseInt(val, 10); if (isNaN(n)) return;
            var hidden = document.querySelector('#' + name);
            var display = document.querySelector('#' + name + '-display');
            if (hidden) { hidden.value = String(n); hidden.dispatchEvent(new Event('change', { bubbles: true })); }
            if (display) {
                var label = name === 'passengers'
                    ? (n === 1 ? 'Passenger' : 'Passengers')
                    : (n === 1 ? 'Bag' : 'Bag(s)');
                display.value = n + ' ' + label;
            }
        }
        function tryClick(btnSelector, attempt) {
            var btn = document.querySelector(btnSelector);
            if (!btn) {
                if (attempt < 5) {
                    log('button', btnSelector, 'not yet rendered, retry', attempt);
                    setTimeout(function () { tryClick(btnSelector, attempt + 1); }, 500);
                }
                return;
            }
            if (btn.disabled) {
                if (attempt < 6) {
                    log('button', btnSelector, 'disabled, retry', attempt);
                    setTimeout(function () { tryClick(btnSelector, attempt + 1); }, 500);
                }
                return;
            }
            log('clicking', btnSelector, '(attempt ' + attempt + ')');
            btn.click();
            // If step 1 is still visible 2.5s later, retry up to 3 times total.
            setTimeout(function () {
                var stillThere = document.querySelector(btnSelector);
                if (stillThere && stillThere.offsetParent !== null && attempt < 3) {
                    log('step 1 still visible, retry click', attempt + 1);
                    tryClick(btnSelector, attempt + 1);
                } else if (!stillThere || stillThere.offsetParent === null) {
                    log('advanced past step 1');
                }
            }, 2500);
        }

        // Hourly mode uses inputs prefixed "byhour-". The duration field is
        // a <select> populated async; date/time use flatpickr; place_id +
        // cat_id + cat_type must come from the plugin's own taxi_search_address
        // endpoint (Google Places ids don't work — server returns "Server Error").
        function applyHourly() {
            var tab = document.querySelector('.booking-type-tab[data-type="by-hour"]');
            if (!tab) { log('by-hour tab NOT FOUND'); return; }
            whenFlatpickrLoaded(function () {
                log('flatpickr lib ready, switching to by-hour mode');

                // The plugin's tab handler updates several pieces of state
                // and our DOM .click() doesn't reliably trigger it. Replicate
                // ALL of it manually so collectStep1Data() later sees
                // #booking-type === "by-hour" and builds the right redirect
                // URL after a successful submit:
                //   - mark the tab active
                //   - update the hidden #booking-type input
                //   - show the by-hour fields, hide the transfer fields
                if (window.jQuery) {
                    window.jQuery('.booking-type-tab').removeClass('active');
                    window.jQuery(tab).addClass('active');
                    window.jQuery('#booking-type').val('by-hour');
                    window.jQuery('#transfer-fields').hide();
                    window.jQuery('#by-hour-fields').show();
                    log('booking-type set to by-hour, fields swapped');
                }
                // Also dispatch a real click event in case the plugin has
                // listeners we don't know about (suggestion close, focus, etc.).
                try {
                    if (window.jQuery) window.jQuery(tab).trigger('click');
                    else tab.click();
                } catch (e) { log('tab click trigger threw', e); }

                applyHourlyAfterTab();
            });
        }

        function applyHourlyAfterTab() {

            setTimeout(function () {
                // Resolve pickup address via the plugin's own search endpoint
                // BEFORE filling the form. We use the first matching result —
                // its place_id / cat_id / cat_type are what the calculate-price
                // AJAX needs.
                lookupPluginPlace(params.pickup || '', 'from', function (place) {
                    if (place) {
                        applyPluginPlace('#byhour-pickup-address', place);
                    } else {
                        log('no plugin match for pickup, falling back to URL params');
                        setVal('#byhour-pickup-address', params.pickup, false);
                        if (params.pickup_pid) setPlaceId('#byhour-pickup-address', params.pickup_pid);
                    }
                    // Lat/lng aren't strictly required by the AJAX payload (the
                    // plugin's server resolves via place_id) but set them anyway
                    // so any validators that read them are happy.
                    setVal('#byhour-pickup-lat', params.pickup_lat || '', false);
                    setVal('#byhour-pickup-lng', params.pickup_lng || '', false);

                    document.querySelectorAll('#byhour-pickup-suggestions, .location-suggestions').forEach(function (el) {
                        el.style.display = 'none';
                        el.innerHTML = '';
                    });

                    // Serialise the async flatpickr calls, then continue with
                    // the rest of the prefill once both date and time are set.
                    setFlatpickr('#byhour-date', params.date || '', function () {
                        setFlatpickr('#byhour-time', params.time || '', function () {
                            continueHourlyPrefill();
                        });
                    });
                });
            }, 700);
        }

        function continueHourlyPrefill() {
            if (params.pax) {
                var paxN = parseInt(params.pax, 10);
                if (!isNaN(paxN)) {
                    var hidden = document.querySelector('#byhour-passengers');
                    var disp = document.querySelector('#byhour-passengers-display');
                    if (hidden) { hidden.value = String(paxN); hidden.dispatchEvent(new Event('change', { bubbles: true })); }
                    if (disp) disp.value = paxN + ' ' + (paxN === 1 ? 'Passenger' : 'Passengers');
                }
            }
            if (params.lug) {
                var lugN = parseInt(params.lug, 10);
                if (!isNaN(lugN)) {
                    var hidden2 = document.querySelector('#byhour-luggage');
                    var disp2 = document.querySelector('#byhour-luggage-display');
                    if (hidden2) { hidden2.value = String(lugN); hidden2.dispatchEvent(new Event('change', { bubbles: true })); }
                    if (disp2) disp2.value = lugN + ' ' + (lugN === 1 ? 'Bag' : 'Bag(s)');
                }
            }

            setDurationWhenReady(params.hours || '3', function (durationOk) {
                var $byhour = window.jQuery && window.jQuery('#byhour-pickup-address');
                var snapshot = {
                    pickup: (document.querySelector('#byhour-pickup-address') || {}).value,
                    place_id: $byhour ? $byhour.data('place_id') : null,
                    cat_id: $byhour ? $byhour.data('cat_id') : null,
                    date: (document.querySelector('#byhour-date') || {}).value,
                    time: (document.querySelector('#byhour-time') || {}).value,
                    duration: (document.querySelector('#byhour-duration') || {}).value,
                };
                log('hourly snapshot', snapshot, 'durationOk=', durationOk);
                var ready = !!(snapshot.pickup && snapshot.place_id
                    && snapshot.date && snapshot.time && snapshot.duration);
                log('hourly ready=', ready);
                if (!ready) {
                    log('NOT clicking. Missing:',
                        Object.keys(snapshot).filter(function (k) { return !snapshot[k] }));
                    return;
                }
                if (window.__titanAutoCalc) return;
                window.__titanAutoCalc = true;
                setTimeout(function () { tryClick('#byhour-calculate-price-btn', 1); }, 800);
            });
        }

        function applyTransfer() {
            // Wait for flatpickr lib (loaded async from CDN) so the date/time
            // pickers are usable when we set them.
            whenFlatpickrLoaded(applyTransferAfterFlatpickr);
        }

        function applyTransferAfterFlatpickr() {
            log('flatpickr lib ready, transfer prefill');
            // Resolve both addresses via plugin's own endpoint, in parallel,
            // then fill the form once both are back.
            var pickupResolved = false, destResolved = false;
            var pickupPlace = null, destPlace = null;

            function maybeFill() {
                if (!pickupResolved || !destResolved) return;

                if (pickupPlace) {
                    applyPluginPlace('#pickup-address', pickupPlace);
                } else {
                    log('no plugin match for pickup');
                    setVal('#pickup-address', params.pickup, false);
                    if (params.pickup_pid) setPlaceId('#pickup-address', params.pickup_pid);
                }
                setVal('#pickup-lat', params.pickup_lat || '', false);
                setVal('#pickup-lng', params.pickup_lng || '', false);

                if (destPlace) {
                    applyPluginPlace('#destination-address', destPlace);
                } else {
                    log('no plugin match for destination');
                    setVal('#destination-address', params.dest, false);
                    if (params.dest_pid) setPlaceId('#destination-address', params.dest_pid);
                }
                setVal('#destination-lat', params.dest_lat || '', false);
                setVal('#destination-lng', params.dest_lng || '', false);

                document.querySelectorAll('#pickup-suggestions, #destination-suggestions, .location-suggestions').forEach(function (el) {
                    el.style.display = 'none';
                    el.innerHTML = '';
                });
                if (params.pax) setNumber('passengers', params.pax);
                if (params.lug) setNumber('luggage', params.lug);

                // Wait for both flatpickr instances (date + time) before
                // reading the snapshot — value isn't formatted until then,
                // and the server rejects ISO dates with "Server Error".
                setFlatpickr('#pickup-date', params.date || '', function () {
                    setFlatpickr('#pickup-time', params.time || '', function () {
                        var $pickup = window.jQuery && window.jQuery('#pickup-address');
                        var $dest = window.jQuery && window.jQuery('#destination-address');
                        var snapshot = {
                            pickup: (document.querySelector('#pickup-address') || {}).value,
                            pickup_pid: $pickup ? $pickup.data('place_id') : null,
                            dest: (document.querySelector('#destination-address') || {}).value,
                            dest_pid: $dest ? $dest.data('place_id') : null,
                            date: (document.querySelector('#pickup-date') || {}).value,
                            time: (document.querySelector('#pickup-time') || {}).value,
                        };
                        log('transfer snapshot', snapshot);
                        var ready = !!(snapshot.pickup && snapshot.pickup_pid
                            && snapshot.dest && snapshot.dest_pid
                            && snapshot.date && snapshot.time);
                        log('transfer ready=', ready);
                        if (!ready) {
                            log('NOT clicking. Missing:',
                                Object.keys(snapshot).filter(function (k) { return !snapshot[k] }));
                            return;
                        }
                        if (window.__titanAutoCalc) return;
                        window.__titanAutoCalc = true;
                        setTimeout(function () { tryClick('#calculate-price-btn', 1); }, 1200);
                    });
                });
            }

            lookupPluginPlace(params.pickup || '', 'from', function (place) {
                pickupPlace = place; pickupResolved = true; maybeFill();
            });
            lookupPluginPlace(params.dest || '', 'to', function (place) {
                destPlace = place; destResolved = true; maybeFill();
            });
        }

        function applyAndAdvance() {
            if (params.mode === 'hourly') applyHourly();
            else applyTransfer();
        }

        function tick(attempts) {
            if (document.querySelector('#pickup-address') && window.jQuery) {
                applyAndAdvance();
                return;
            }
            if (attempts > 60) {
                log('gave up waiting for plugin to mount');
                return;
            }
            setTimeout(function () { tick(attempts + 1); }, 100);
        }
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function () { tick(0); });
        } else {
            tick(0);
        }
    })();
    </script>
    <?php
});

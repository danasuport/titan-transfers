<?php
/**
 * Plugin Name: Titan Booking Embed
 * Description: Renders /booking/ as a chrome-less embed when ?embed=1 is
 *              present, plus loads iframe-resizer's contentWindow script
 *              so the parent (Next.js on titantransfers.com) can auto-fit
 *              the iframe height. Drop this file into wp-content/mu-plugins/.
 * Author:      KM Adisseny
 * Version:     3.3.0
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
    /* Unconditional version log so we can verify which build is loaded
       just by opening the iframe's console. If you don't see this exact
       line on /booking/, the server still has an old MU-plugin file. */
    console.log('[titan-prefill] script loaded, version 3.3.0');
    (function () {
        function log() {
            try { console.log.apply(console, ['[titan-prefill]'].concat([].slice.call(arguments))); } catch (e) {}
        }
        function getParams() {
            var sp = new URLSearchParams(window.location.search);
            var keys = ['pickup','dest','pickup_lat','pickup_lng','dest_lat','dest_lng','date','time','pax','lug','mode','hours','return'];
            var out = {};
            keys.forEach(function (k) { var v = sp.get(k); if (v) out[k] = v; });
            return out;
        }
        var params = getParams();
        if (!params.pickup && !params.dest && !params.date) {
            log('no params, skip');
            return;
        }
        log('params', params);

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

        // Date/time inputs are wired to flatpickr — setting el.value directly
        // does NOT update flatpickr's internal model, so the form thinks the
        // field is still empty. Use the instance's setDate() instead.
        function setFlatpickr(sel, val) {
            var el = document.querySelector(sel);
            if (!el) { log('setFlatpickr: selector NOT FOUND', sel); return false; }
            if (val == null || val === '') return false;
            if (el._flatpickr && typeof el._flatpickr.setDate === 'function') {
                try {
                    el._flatpickr.setDate(val, true); // true = trigger change
                    return true;
                } catch (e) { log('flatpickr.setDate threw on', sel, e); }
            }
            // Fallback (no flatpickr instance found yet) — set value + change.
            el.value = val;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
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

        // Hourly mode uses a separate set of inputs prefixed "byhour-".
        // The duration field is a <select> populated async via API config;
        // date/time inputs are wired to flatpickr and need its API to take
        // a value. The submit button is #byhour-calculate-price-btn.
        function applyHourly() {
            var tab = document.querySelector('.booking-type-tab[data-type="by-hour"]');
            if (!tab) {
                log('by-hour tab NOT FOUND. Tabs:',
                    Array.from(document.querySelectorAll('.booking-type-tab')).map(function (t) { return t.getAttribute('data-type') }));
                return;
            }
            log('clicking by-hour tab');
            tab.click();

            // Give the plugin time to show #by-hour-fields, init flatpickr
            // on its date/time inputs, and kick off the API call that
            // populates #byhour-duration's options.
            setTimeout(function () {
                if (params.pickup) {
                    setVal('#byhour-pickup-address', params.pickup, false);
                    setVal('#byhour-pickup-lat', params.pickup_lat || '', false);
                    setVal('#byhour-pickup-lng', params.pickup_lng || '', false);
                }
                document.querySelectorAll('#byhour-pickup-suggestions, .location-suggestions').forEach(function (el) {
                    el.style.display = 'none';
                    el.innerHTML = '';
                });
                if (params.date) setFlatpickr('#byhour-date', params.date);
                if (params.time) setFlatpickr('#byhour-time', params.time);
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

                // Duration select needs to wait for its options to load.
                setDurationWhenReady(params.hours || '3', function (durationOk) {
                    var snapshot = {
                        pickup: (document.querySelector('#byhour-pickup-address') || {}).value,
                        pickup_lat: (document.querySelector('#byhour-pickup-lat') || {}).value,
                        pickup_lng: (document.querySelector('#byhour-pickup-lng') || {}).value,
                        date: (document.querySelector('#byhour-date') || {}).value,
                        time: (document.querySelector('#byhour-time') || {}).value,
                        duration: (document.querySelector('#byhour-duration') || {}).value,
                    };
                    log('hourly form snapshot', snapshot, 'durationOk=', durationOk);
                    var ready = !!(snapshot.pickup && snapshot.pickup_lat && snapshot.pickup_lng
                        && snapshot.date && snapshot.time && snapshot.duration);
                    log('hourly ready=', ready);
                    if (!ready) {
                        log('NOT clicking — would trigger Server Error. Missing:',
                            Object.keys(snapshot).filter(function (k) { return !snapshot[k] }));
                        return;
                    }
                    if (window.__titanAutoCalc) return;
                    window.__titanAutoCalc = true;
                    setTimeout(function () { tryClick('#byhour-calculate-price-btn', 1); }, 800);
                });
            }, 700);
        }

        function applyTransfer() {
            // Silent prefill on visible address inputs to avoid the plugin's
            // own autocomplete kicking in. Only the hidden lat/lng need to
            // exist for calculatePrice() to consider the address validated.
            if (params.pickup) {
                setVal('#pickup-address', params.pickup, false);
                setVal('#pickup-lat', params.pickup_lat || '', false);
                setVal('#pickup-lng', params.pickup_lng || '', false);
            }
            if (params.dest) {
                setVal('#destination-address', params.dest, false);
                setVal('#destination-lat', params.dest_lat || '', false);
                setVal('#destination-lng', params.dest_lng || '', false);
            }
            // Force-close any suggestion dropdown the plugin might have opened.
            document.querySelectorAll('#pickup-suggestions, #destination-suggestions, .location-suggestions').forEach(function (el) {
                el.style.display = 'none';
                el.innerHTML = '';
            });
            // Date/time use flatpickr too — same fix as hourly.
            if (params.date) setFlatpickr('#pickup-date', params.date);
            if (params.time) setFlatpickr('#pickup-time', params.time);
            if (params.pax) setNumber('passengers', params.pax);
            if (params.lug) setNumber('luggage', params.lug);

            var snapshot = {
                pickup: (document.querySelector('#pickup-address') || {}).value,
                pickup_lat: (document.querySelector('#pickup-lat') || {}).value,
                pickup_lng: (document.querySelector('#pickup-lng') || {}).value,
                dest: (document.querySelector('#destination-address') || {}).value,
                dest_lat: (document.querySelector('#destination-lat') || {}).value,
                dest_lng: (document.querySelector('#destination-lng') || {}).value,
                date: (document.querySelector('#pickup-date') || {}).value,
                time: (document.querySelector('#pickup-time') || {}).value,
            };
            log('transfer form snapshot', snapshot);
            var ready = !!(snapshot.pickup && snapshot.pickup_lat && snapshot.pickup_lng
                && snapshot.dest && snapshot.dest_lat && snapshot.dest_lng
                && snapshot.date && snapshot.time);
            log('transfer ready=', ready);
            if (!ready) {
                log('NOT clicking — missing:',
                    Object.keys(snapshot).filter(function (k) { return !snapshot[k] }));
                return;
            }
            if (!window.__titanAutoCalc) {
                window.__titanAutoCalc = true;
                setTimeout(function () { tryClick('#calculate-price-btn', 1); }, 1200);
            }
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

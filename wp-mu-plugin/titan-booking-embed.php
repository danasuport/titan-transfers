<?php
/**
 * Plugin Name: Titan Booking Embed
 * Description: Renders /booking/ as a chrome-less embed when ?embed=1 is
 *              present, plus loads iframe-resizer's contentWindow script
 *              so the parent (Next.js on titantransfers.com) can auto-fit
 *              the iframe height. Drop this file into wp-content/mu-plugins/.
 * Author:      KM Adisseny
 * Version:     3.8.0
 */

if (!defined('ABSPATH')) exit;

/**
 * Server-side debug log — captures the calculate-price AJAX payload from
 * BOTH manual and programmatic flows so we can diff them. Writes to a
 * file in wp-content/uploads/ that we can read with curl from outside.
 *
 * Endpoint: POST /wp-admin/admin-ajax.php?action=titan_debug_log
 * Payload:  message=<string>
 *
 * Reachable URL of the log:
 *   https://wp.titantransfers.com/wp-content/uploads/titan-debug.log
 *
 * To clear the log: just upload a fresh empty file with the same name
 * via SiteGround File Manager.
 */
add_action('wp_ajax_titan_debug_log', 'titan_debug_log_handler');
add_action('wp_ajax_nopriv_titan_debug_log', 'titan_debug_log_handler');
function titan_debug_log_handler() {
    $upload_dir = wp_upload_dir();
    $log_file = trailingslashit($upload_dir['basedir']) . 'titan-debug.log';
    $msg = isset($_POST['message']) ? wp_unslash($_POST['message']) : '';
    if ($msg) {
        $line = '[' . date('Y-m-d H:i:s') . '] ' . substr($msg, 0, 8000) . "\n";
        @file_put_contents($log_file, $line, FILE_APPEND | LOCK_EX);
    }
    wp_send_json_success();
}

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
    console.log('[titan-prefill] script loaded, version 3.8.0');
    (function () {
        // ON-PAGE DEBUG OVERLAY — shows the prefill steps directly in the
        // booking widget so the user can read what's happening without
        // having to open DevTools (which is awkward in a cross-origin iframe).
        var __debugLines = [];
        function showDebug(message) {
            __debugLines.push(message);
            var box = document.getElementById('titan-debug-overlay');
            if (!box) {
                box = document.createElement('div');
                box.id = 'titan-debug-overlay';
                box.style.cssText = 'position:fixed;bottom:8px;left:8px;right:8px;max-height:45vh;overflow:auto;background:#1a1a1a;color:#fff;font:11px/1.4 monospace;padding:8px 10px;border-radius:6px;z-index:99999;box-shadow:0 4px 16px rgba(0,0,0,0.4);white-space:pre-wrap;';
                box.innerHTML = '<div style="font-weight:bold;color:#8BAA1D;margin-bottom:4px;display:flex;justify-content:space-between;"><span>TITAN DEBUG (v3.4.0)</span><span style="cursor:pointer;color:#999;" onclick="this.parentElement.parentElement.remove()">×</span></div><div id="titan-debug-content"></div>';
                document.body.appendChild(box);
            }
            var content = document.getElementById('titan-debug-content');
            if (content) content.textContent = __debugLines.join('\n');
        }
        function log() {
            var args = [].slice.call(arguments);
            try { console.log.apply(console, ['[titan-prefill]'].concat(args)); } catch (e) {}
            try {
                var line = args.map(function (a) {
                    if (typeof a === 'object') { try { return JSON.stringify(a); } catch (e) { return String(a); } }
                    return String(a);
                }).join(' ');
                showDebug(line);
            } catch (e) {}
        }

        // Persist a message to wp-content/uploads/titan-debug.log via the
        // server endpoint, so it survives page navigation. Used to capture
        // the calculate-price AJAX payload + response in BOTH the manual
        // and programmatic flows for side-by-side comparison.
        function sendToServerLog(message) {
            try {
                if (!window.taxi_booking_ajax) return;
                var body = new URLSearchParams();
                body.set('action', 'titan_debug_log');
                body.set('message', message);
                fetch(window.taxi_booking_ajax.ajax_url, {
                    method: 'POST',
                    body: body,
                    keepalive: true, // survive page navigation
                });
            } catch (e) {}
        }
        function getParams() {
            var sp = new URLSearchParams(window.location.search);
            var keys = ['pickup','dest','pickup_lat','pickup_lng','dest_lat','dest_lng','pickup_pid','dest_pid','date','time','pax','lug','mode','hours','return'];
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

        // Hourly mode uses inputs prefixed "byhour-". The duration field is
        // a <select> populated async; date/time use flatpickr; place_id +
        // cat_id + cat_type must come from the plugin's own taxi_search_address
        // endpoint (Google Places ids don't work — server returns "Server Error").
        function applyHourly() {
            var tab = document.querySelector('.booking-type-tab[data-type="by-hour"]');
            if (!tab) { log('by-hour tab NOT FOUND'); return; }
            log('clicking by-hour tab');
            tab.click();

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
                });
            }, 700);
        }

        function applyTransfer() {
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
                if (params.date) setFlatpickr('#pickup-date', params.date);
                if (params.time) setFlatpickr('#pickup-time', params.time);
                if (params.pax) setNumber('passengers', params.pax);
                if (params.lug) setNumber('luggage', params.lug);

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
        // Intercept the WP plugin's AJAX call so we can show the user the
        // exact payload sent and the server's response — debugging "Server
        // Error" is impossible without this.
        function patchAjaxForLogging() {
            if (!window.jQuery || !window.jQuery.ajax || window.__titanAjaxPatched) return;
            window.__titanAjaxPatched = true;
            var origAjax = window.jQuery.ajax;
            window.jQuery.ajax = function (opts) {
                try {
                    var data = (opts && opts.data) || {};
                    var action = (typeof data === 'string')
                        ? new URLSearchParams(data).get('action')
                        : data.action;
                    if (action === 'taxi_calculate_price' || action === 'taxi_byhour_calculate_price' || (typeof action === 'string' && action.indexOf('taxi_') === 0)) {
                        var payload = (typeof data === 'string')
                            ? Object.fromEntries(new URLSearchParams(data))
                            : data;
                        log('AJAX REQUEST →', action, payload);

                        // Mark whether this came from auto-calc (URL params)
                        // or a manual user click — for diffing later.
                        var source = window.__titanAutoCalc ? 'AUTO' : 'MANUAL';
                        if (action === 'taxi_calculate_price') {
                            sendToServerLog(source + ' REQUEST: ' + JSON.stringify(payload));
                        }

                        // Wrap success/error to capture what comes back.
                        var origSuccess = opts.success;
                        var origError = opts.error;
                        opts.success = function (resp) {
                            try {
                                var respStr = typeof resp === 'object' ? JSON.stringify(resp).slice(0, 500) : String(resp).slice(0, 500);
                                log('AJAX RESPONSE ←', respStr);
                                if (action === 'taxi_calculate_price') {
                                    sendToServerLog(source + ' RESPONSE: ' + respStr);
                                }
                            } catch (e) {}
                            if (origSuccess) return origSuccess.apply(this, arguments);
                        };
                        opts.error = function (xhr, status, err) {
                            try {
                                log('AJAX ERROR ←', 'status=' + (xhr ? xhr.status : '?'), 'statusText=' + (xhr ? xhr.statusText : '?'), 'err=' + (err || '?'));
                                if (xhr && xhr.responseText) log('responseText:', String(xhr.responseText).slice(0, 800));
                            } catch (e) {}
                            if (origError) return origError.apply(this, arguments);
                        };
                    }
                } catch (e) { log('ajax patch error', e); }
                return origAjax.apply(this, arguments);
            };
            log('jQuery.ajax patched for logging');
        }

        function tick(attempts) {
            if (document.querySelector('#pickup-address') && window.jQuery) {
                patchAjaxForLogging();
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

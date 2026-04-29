<?php
/**
 * Plugin Name: Titan Booking Embed
 * Description: Renders /booking/ as a chrome-less embed when ?embed=1 is
 *              present, plus loads iframe-resizer's contentWindow script
 *              so the parent (Next.js on titantransfers.com) can auto-fit
 *              the iframe height. Drop this file into wp-content/mu-plugins/.
 * Author:      KM Adisseny
 * Version:     1.0.0
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
            background: #ffffff !important;
            min-height: 0 !important;
        }
        body.titan-embed { background: #ffffff !important; padding: 0 !important; }

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
 */
add_action('wp_footer', function () {
    if (!titan_booking_is_embed()) return;
    ?>
    <script>
    (function () {
        function getParams() {
            var sp = new URLSearchParams(window.location.search);
            var keys = ['pickup','dest','pickup_lat','pickup_lng','dest_lat','dest_lng','date','time','pax','lug'];
            var out = {};
            keys.forEach(function (k) { var v = sp.get(k); if (v) out[k] = v; });
            return out;
        }
        var params = getParams();
        if (!params.pickup && !params.dest && !params.date) return;

        function setVal(sel, val, fire) {
            var el = document.querySelector(sel);
            if (!el || val == null) return;
            el.value = val;
            if (fire) {
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }
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
        function applyAndAdvance() {
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
            if (params.date) setVal('#pickup-date', params.date, true);
            if (params.time) setVal('#pickup-time', params.time, true);
            if (params.pax) setNumber('passengers', params.pax);
            if (params.lug) setNumber('luggage', params.lug);

            var ready = params.pickup && params.dest
                && params.pickup_lat && params.pickup_lng
                && params.dest_lat && params.dest_lng
                && params.date && params.time;
            if (ready && !window.__titanAutoCalc) {
                window.__titanAutoCalc = true;
                setTimeout(function () {
                    var btn = document.querySelector('#calculate-price-btn');
                    if (btn && !btn.disabled) btn.click();
                }, 350);
            }
        }
        function tick(attempts) {
            if (document.querySelector('#pickup-address') && window.jQuery) {
                applyAndAdvance();
                return;
            }
            if (attempts > 60) return;
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

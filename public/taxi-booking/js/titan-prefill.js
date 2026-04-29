/* ──────────────────────────────────────────────────────────────────────
   Titan Transfers — booking widget prefill bridge

   When the user submits the home/blog booking form we navigate to
       /booking/?pickup=...&dest=...&pickup_lat=...&pickup_lng=
                &dest_lat=...&dest_lng=...&date=YYYY-MM-DD&time=HH:MM
                &pax=N&lug=N

   The Taxi Booking Plugin's step-1 form does not natively consume those
   params (it only reads bid/pm). This script waits for the plugin to be
   live in the DOM, then writes the values into the right inputs and
   fires the events the plugin listens to so its internal validation,
   step-2 transition and proceed button all consider the field "valid".

   Runs once per page load. No-op if the relevant params aren't present
   (so refreshing /booking/ without query string is unaffected).
   ────────────────────────────────────────────────────────────────── */
(function () {
  if (typeof window === 'undefined') return

  function getParams() {
    var sp = new URLSearchParams(window.location.search)
    var out = {}
    var keys = ['pickup', 'dest', 'pickup_lat', 'pickup_lng', 'dest_lat', 'dest_lng', 'date', 'time', 'pax', 'lug', 'step']
    for (var i = 0; i < keys.length; i++) {
      var v = sp.get(keys[i])
      if (v) out[keys[i]] = v
    }
    return out
  }

  var params = getParams()
  // If the URL only carries plugin-native params (bid/pm/step) and none of
  // ours, there's nothing to prefill.
  if (!params.pickup && !params.dest && !params.date) return

  function setVal(selector, value, fireChange) {
    var el = document.querySelector(selector)
    if (!el || value == null) return
    el.value = value
    if (fireChange) {
      el.dispatchEvent(new Event('input', { bubbles: true }))
      el.dispatchEvent(new Event('change', { bubbles: true }))
    }
  }

  function setNumber(targetName, value) {
    var n = parseInt(value, 10)
    if (isNaN(n)) return
    var hidden = document.querySelector('#' + targetName)
    var display = document.querySelector('#' + targetName + '-display')
    if (hidden) {
      hidden.value = String(n)
      hidden.dispatchEvent(new Event('change', { bubbles: true }))
    }
    if (display) {
      // Mirror the plugin's display format: "N Passenger" / "N Bag"
      var label = targetName === 'passengers'
        ? (n === 1 ? 'Passenger' : 'Passengers')
        : (n === 1 ? 'Bag' : 'Bag(s)')
      display.value = n + ' ' + label
    }
  }

  function applyPrefill() {
    // Pickup / destination addresses + lat/lng (the plugin uses lat/lng to
    // mark the address as "validated" so calculatePrice will accept it).
    if (params.pickup) {
      setVal('#pickup-address', params.pickup, true)
      setVal('#pickup-lat', params.pickup_lat || '', false)
      setVal('#pickup-lng', params.pickup_lng || '', false)
    }
    if (params.dest) {
      setVal('#destination-address', params.dest, true)
      setVal('#destination-lat', params.dest_lat || '', false)
      setVal('#destination-lng', params.dest_lng || '', false)
    }

    // Date / time. The plugin uses Flatpickr; setting the input value and
    // dispatching change is enough for calculatePrice() to read it.
    if (params.date) setVal('#pickup-date', params.date, true)
    if (params.time) setVal('#pickup-time', params.time, true)

    // Passengers / luggage are number-stepper widgets (hidden + display).
    if (params.pax) setNumber('passengers', params.pax)
    if (params.lug) setNumber('luggage', params.lug)

    // If the URL carries everything the plugin needs to price (origin +
    // destination with coords + date + time), auto-advance to step 2 so
    // the user lands directly on the vehicle list. Mirrors the behaviour
    // of the previous ETO embed.
    var hasFullState = params.pickup && params.dest
      && params.pickup_lat && params.pickup_lng
      && params.dest_lat && params.dest_lng
      && params.date && params.time
    if (hasFullState && !window.__titanAutoCalcFired) {
      window.__titanAutoCalcFired = true
      // Wait a tick so the plugin has bound its click handler on
      // #calculate-price-btn before we click it programmatically.
      setTimeout(function () {
        var btn = document.querySelector('#calculate-price-btn')
        if (btn && !btn.disabled) btn.click()
      }, 350)
    }
  }

  // The plugin boots inside jQuery's $(document).ready and creates its
  // Flatpickr/intl-tel/etc instances afterwards. We wait until the
  // pickup field is in the DOM AND the plugin has had a tick to bind
  // its handlers, then prefill.
  var attempts = 0
  function tryApply() {
    attempts++
    var ready = document.querySelector('#pickup-address') && (window.jQuery || attempts > 30)
    if (ready) {
      try { applyPrefill() } catch (e) { /* swallow — prefill is best-effort */ }
      return
    }
    if (attempts < 60) setTimeout(tryApply, 100)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(tryApply, 50) })
  } else {
    setTimeout(tryApply, 50)
  }
})()

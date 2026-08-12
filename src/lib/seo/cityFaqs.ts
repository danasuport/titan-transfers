import { pick } from '@/lib/i18n/pick'
import type { Locale } from '@/lib/i18n/config'
import { formatDuration } from '@/lib/utils/formatters'

/**
 * FAQs for a city page, built from that city's real data — the price we
 * actually charge from its main airport, the real drive time, the real list of
 * airports we serve it from.
 *
 * The previous set was the same four questions on all 1,111 city pages with
 * only the name swapped, which is exactly the "scaled content" pattern that
 * leaves a page at position 20 with impressions and no clicks. A question like
 * "how much is a taxi from Barcelona airport to the centre?" is also the query
 * people actually type, and answering it with a real figure is something a
 * competitor's template can't copy.
 *
 * Every data-driven entry is dropped when its data is missing — a FAQ is never
 * rendered with a placeholder or an invented number.
 */

export interface CityFaqInput {
  cityTitle: string
  locale: Locale
  /** Airports we serve this city from, already translated for the locale. */
  airportNames: string[]
  /** The cheapest airport→city route we sell, when the sheet has a price. */
  mainRoute?: {
    airportName: string
    price?: string | null
    durationMinutes?: number | null
    distanceKm?: number | null
  } | null
}

export interface CityFaq {
  question: string
  answer: string
}

export function buildCityFaqs({ cityTitle, locale, airportNames, mainRoute }: CityFaqInput): CityFaq[] {
  const faqs: CityFaq[] = []

  // French and Italian elide the article before a vowel: "de l'Aéroport", not
  // "de Aéroport". Airport names in Sanity nearly always start with the common
  // noun ("Aéroport de …"), so without this every city page reads as broken
  // grammar to a native speaker.
  const air = mainRoute?.airportName || ''
  const frAir = /^[aeiouyàâéèêîôûh]/i.test(air) ? `l'${air}` : air
  const itAir = /^[aeiouàèéìòù]/i.test(air) ? `ll'${air}` : ` ${air}`

  // 1. Price from the main airport — the highest-intent question there is.
  if (mainRoute?.price) {
    faqs.push(
      pick(locale, {
        en: {
          question: `How much is a private transfer from ${mainRoute.airportName} to ${cityTitle}?`,
          answer: `A private transfer from ${mainRoute.airportName} to ${cityTitle} starts at ${mainRoute.price} for the whole vehicle, not per person. The price is fixed when you book and includes meet & greet and flight tracking, with no hidden charges and nothing extra to pay to the driver.`,
        },
        es: {
          question: `¿Cuánto cuesta un traslado privado del ${mainRoute.airportName} a ${cityTitle}?`,
          answer: `Un traslado privado del ${mainRoute.airportName} a ${cityTitle} cuesta desde ${mainRoute.price} por vehículo completo, no por persona. El precio se cierra al reservar e incluye recogida con cartel y seguimiento del vuelo, sin cargos ocultos ni nada más que pagar al conductor.`,
        },
        it: {
          question: `Quanto costa un transfer privato da${itAir} a ${cityTitle}?`,
          answer: `Un transfer privato da${itAir} a ${cityTitle} parte da ${mainRoute.price} per veicolo, non a persona. Il prezzo è fisso al momento della prenotazione e include accoglienza con cartello e monitoraggio del volo, senza costi nascosti né nulla da pagare in più all'autista.`,
        },
        de: {
          question: `Was kostet ein privater Transfer von ${mainRoute.airportName} nach ${cityTitle}?`,
          answer: `Ein privater Transfer von ${mainRoute.airportName} nach ${cityTitle} kostet ab ${mainRoute.price} für das gesamte Fahrzeug, nicht pro Person. Der Preis steht bei der Buchung fest und umfasst Empfang mit Namensschild und Flugverfolgung, ohne versteckte Kosten und ohne Zusatzzahlung an den Fahrer.`,
        },
        fr: {
          question: `Combien coûte un transfert privé de ${frAir} à ${cityTitle} ?`,
          answer: `Un transfert privé de ${frAir} à ${cityTitle} coûte à partir de ${mainRoute.price} pour le véhicule entier, pas par personne. Le prix est fixé à la réservation et comprend l'accueil avec pancarte et le suivi du vol, sans frais cachés ni rien à payer de plus au chauffeur.`,
        },
        ar: {
          question: `كم تكلفة النقل الخاص من ${mainRoute.airportName} إلى ${cityTitle}؟`,
          answer: `يبدأ النقل الخاص من ${mainRoute.airportName} إلى ${cityTitle} من ${mainRoute.price} للمركبة كاملة، وليس لكل شخص. السعر ثابت عند الحجز ويشمل الاستقبال بلافتة وتتبع الرحلة، بدون رسوم خفية ولا مبالغ إضافية تُدفع للسائق.`,
        },
      })
    )
  }

  // 2. Journey time — the second thing people check before booking.
  if (mainRoute?.durationMinutes) {
    const time = formatDuration(mainRoute.durationMinutes)
    const dist = mainRoute.distanceKm ? ` (${mainRoute.distanceKm} km)` : ''
    faqs.push(
      pick(locale, {
        en: {
          question: `How long does it take to get from ${mainRoute.airportName} to ${cityTitle}?`,
          answer: `The drive takes about ${time}${dist} in normal traffic. Your driver tracks your flight, so a delay doesn't cost you the transfer — pickup is adjusted to your real landing time.`,
        },
        es: {
          question: `¿Cuánto se tarda del ${mainRoute.airportName} a ${cityTitle}?`,
          answer: `El trayecto dura unos ${time}${dist} con tráfico normal. Tu conductor sigue el estado del vuelo, así que un retraso no te hace perder el traslado: la recogida se ajusta a la hora real de aterrizaje.`,
        },
        it: {
          question: `Quanto tempo ci vuole da${itAir} a ${cityTitle}?`,
          answer: `Il tragitto dura circa ${time}${dist} con traffico normale. L'autista monitora il volo, quindi un ritardo non ti fa perdere il transfer: il ritiro si adatta all'orario reale di atterraggio.`,
        },
        de: {
          question: `Wie lange dauert die Fahrt von ${mainRoute.airportName} nach ${cityTitle}?`,
          answer: `Die Fahrt dauert etwa ${time}${dist} bei normalem Verkehr. Ihr Fahrer verfolgt Ihren Flug, sodass eine Verspätung den Transfer nicht kostet — die Abholung richtet sich nach der tatsächlichen Landezeit.`,
        },
        fr: {
          question: `Combien de temps faut-il de ${frAir} à ${cityTitle} ?`,
          answer: `Le trajet dure environ ${time}${dist} avec une circulation normale. Votre chauffeur suit votre vol : un retard ne vous fait pas perdre le transfert, la prise en charge s'adapte à l'heure réelle d'atterrissage.`,
        },
        ar: {
          question: `كم تستغرق الرحلة من ${mainRoute.airportName} إلى ${cityTitle}؟`,
          answer: `تستغرق الرحلة حوالي ${time}${dist} في حركة المرور العادية. يتابع السائق رحلتك، لذا فإن التأخير لا يفقدك الحجز — يتم تعديل موعد الاستقبال حسب وقت الهبوط الفعلي.`,
        },
      })
    )
  }

  // 3. Which airports we cover — a real list, different on every city page.
  if (airportNames.length) {
    const list = airportNames.slice(0, 4).join(', ')
    faqs.push(
      pick(locale, {
        en: {
          question: `Which airports do you cover for transfers to ${cityTitle}?`,
          answer: `We run private transfers to ${cityTitle} from ${list}. We also cover ports, train stations and hotels — if your pickup point isn't listed, ask us for a quote.`,
        },
        es: {
          question: `¿Desde qué aeropuertos hacéis traslados a ${cityTitle}?`,
          answer: `Hacemos traslados privados a ${cityTitle} desde ${list}. También cubrimos puertos, estaciones de tren y hoteles: si tu punto de recogida no aparece, pídenos presupuesto.`,
        },
        it: {
          question: `Da quali aeroporti effettuate transfer verso ${cityTitle}?`,
          answer: `Effettuiamo transfer privati verso ${cityTitle} da ${list}. Copriamo anche porti, stazioni ferroviarie e hotel: se il tuo punto di ritiro non è indicato, chiedici un preventivo.`,
        },
        de: {
          question: `Von welchen Flughäfen bieten Sie Transfers nach ${cityTitle} an?`,
          answer: `Wir fahren private Transfers nach ${cityTitle} ab ${list}. Wir bedienen auch Häfen, Bahnhöfe und Hotels — wenn Ihr Abholort nicht aufgeführt ist, fragen Sie uns nach einem Angebot.`,
        },
        fr: {
          question: `Depuis quels aéroports proposez-vous des transferts vers ${cityTitle} ?`,
          answer: `Nous assurons des transferts privés vers ${cityTitle} depuis ${list}. Nous couvrons aussi les ports, les gares et les hôtels : si votre point de prise en charge n'est pas listé, demandez-nous un devis.`,
        },
        ar: {
          question: `من أي مطارات توفرون النقل إلى ${cityTitle}؟`,
          answer: `نوفر نقلاً خاصاً إلى ${cityTitle} من ${list}. كما نغطي الموانئ ومحطات القطار والفنادق — إذا لم تكن نقطة الاستلام مدرجة، اطلب منا عرض سعر.`,
        },
      })
    )
  }

  // 4-5. Service questions. Generic by nature, but concrete: they answer what a
  // traveller actually worries about (a delayed flight, a return leg).
  faqs.push(
    pick(locale, {
      en: {
        question: `What happens if my flight is delayed?`,
        answer: `Nothing on your side. We monitor the flight number you give us in real time and move the pickup to your actual arrival time. You can also cancel free of charge up to 24 hours before pickup.`,
      },
      es: {
        question: `¿Qué pasa si mi vuelo se retrasa?`,
        answer: `Nada por tu parte. Monitorizamos en tiempo real el número de vuelo que nos indicas y movemos la recogida a tu hora real de llegada. Además puedes cancelar gratis hasta 24 horas antes.`,
      },
      it: {
        question: `Cosa succede se il mio volo è in ritardo?`,
        answer: `Nulla da parte tua. Monitoriamo in tempo reale il numero di volo che ci indichi e spostiamo il ritiro all'orario reale di arrivo. Puoi anche cancellare gratuitamente fino a 24 ore prima.`,
      },
      de: {
        question: `Was passiert, wenn mein Flug Verspätung hat?`,
        answer: `Für Sie nichts. Wir verfolgen die angegebene Flugnummer in Echtzeit und verlegen die Abholung auf Ihre tatsächliche Ankunftszeit. Zudem können Sie bis 24 Stunden vorher kostenlos stornieren.`,
      },
      fr: {
        question: `Que se passe-t-il si mon vol est retardé ?`,
        answer: `Rien de votre côté. Nous suivons en temps réel le numéro de vol que vous nous indiquez et décalons la prise en charge à votre heure d'arrivée réelle. Vous pouvez aussi annuler gratuitement jusqu'à 24 heures avant.`,
      },
      ar: {
        question: `ماذا يحدث إذا تأخرت رحلتي؟`,
        answer: `لا شيء من جانبك. نتابع رقم الرحلة الذي تزودنا به في الوقت الفعلي وننقل موعد الاستقبال إلى وقت وصولك الفعلي. كما يمكنك الإلغاء مجاناً حتى 24 ساعة قبل الموعد.`,
      },
    })
  )

  faqs.push(
    pick(locale, {
      en: {
        question: `Can I book a return transfer as well?`,
        answer: `Yes. Book one-way or return in the same booking — the return leg is priced the same way, with the same fixed price and the same vehicle class.`,
      },
      es: {
        question: `¿Puedo reservar también la vuelta?`,
        answer: `Sí. Puedes reservar solo ida o ida y vuelta en la misma reserva: el trayecto de vuelta se calcula igual, con el mismo precio cerrado y la misma categoría de vehículo.`,
      },
      it: {
        question: `Posso prenotare anche il ritorno?`,
        answer: `Sì. Puoi prenotare solo andata o andata e ritorno nella stessa prenotazione: il ritorno ha lo stesso prezzo fisso e la stessa categoria di veicolo.`,
      },
      de: {
        question: `Kann ich auch die Rückfahrt buchen?`,
        answer: `Ja. Buchen Sie Hin- oder Hin- und Rückfahrt in einem Vorgang — die Rückfahrt wird genauso berechnet, zum selben Festpreis und in derselben Fahrzeugklasse.`,
      },
      fr: {
        question: `Puis-je réserver aussi le retour ?`,
        answer: `Oui. Réservez un aller simple ou un aller-retour dans la même réservation : le retour est calculé de la même façon, au même prix fixe et dans la même catégorie de véhicule.`,
      },
      ar: {
        question: `هل يمكنني حجز رحلة العودة أيضاً؟`,
        answer: `نعم. احجز ذهاباً فقط أو ذهاباً وعودة في الحجز نفسه — تُحتسب رحلة العودة بالطريقة نفسها، بالسعر الثابت نفسه وفئة المركبة نفسها.`,
      },
    })
  )

  return faqs
}

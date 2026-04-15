const PRICES = { comun: 1200, premium: 1300 };
const MINIMUMS = { comun: 25000, premium: 30000 };
const TOTAL_MULTIPLIER = 0.88;
const GARAGE = "General Paz 431, San Isidro, Buenos Aires, Argentina";
const STEP_ORDER = [
  "step-route",
  "step-options",
  "step-passenger",
  "step-extras",
  "step-result",
];

let lang = "es",
  currency = "ARS",
  usdRate = null;
let mapsOk = false,
  routeData = null,
  vehicle = null;
let acSessions = {},
  dirRenderer = null,
  lastTotalARS = 0,
  lastMinimumApplied = false,
  lastQuoteBreakdown = null;
const QUICK_LOCATIONS = [
  {
    label: "Aeroparque Newbery",
    value: "Aeroparque Jorge Newbery, Buenos Aires",
  },
  {
    label: "Aeropuerto Ezeiza",
    value: "Aeropuerto Internacional Ezeiza, Buenos Aires",
  },
  { label: "Buquebus", value: "Buquebus Puerto Madero, Buenos Aires" },
  {
    label: "Colonia Express",
    value: "Colonia Express Puerto Madero, Buenos Aires",
  },
];
const extrasSelected = new Set();

const T = {
  es: {
    brandName: "Traslados",
    brandTag: "Cotización",
    setupEye: "Configuración",
    setupTitle: "Activar Google Maps",
    setupSub:
      "Ingresá tu API key para habilitar el cálculo de rutas y el mapa interactivo.",
    apiKeyLabel: "Google Maps API Key",
    apiHint: "Requeridas: Maps JavaScript API · Directions API · Places API",
    btnContinue: "Continuar",
    loadingMaps: "Conectando con Google Maps...",
    step1: "Ruta",
    step2: "Vehículo",
    step3: "Datos",
    step4: "Extras",
    step5: "Cotización",
    btnDevFill: "Cargar demo",
    routeCardLabel: "Detalle del viaje",
    originLabel: "Punto de origen",
    destLabel: "Punto de destino",
    swapRouteBtn: "Intercambiar",
    originPH: "Ej: Nordelta, Tigre",
    destPH: "Ej: Aeropuerto Internacional Ezeiza",
    btnCalcRoute: "Calcular ruta",
    loadingRoute: "Calculando ruta...",
    vehicleCardLabel: "Seleccioná el vehículo",
    comunName: "Común",
    premiumName: "Premium",
    comunLuggage: "2 valijas de 23 kg<br>2 carry-on",
    premiumLuggage: "3 valijas de 23 kg<br>2 carry-on",
    scaleMsg: "Balanza a bordo",
    scaleNote:
      "No te preocupes antes de despachar — contamos con balanza a bordo para verificar el peso de tu equipaje sin inconvenientes.",
    paxCardLabel: "Pasajeros y equipaje",
    paxLabel: "Pasajeros",
    paxMax: "Máximo 4 personas",
    luggageLabel: "Valijas totales",
    luggageNote: "Cantidad de valijas",
    btnBack: "Volver",
    passengerCardLabel: "Datos del pasajero",
    firstNameLabel: "Nombre",
    firstNamePH: "Ej: Juan",
    lastNameLabel: "Apellido",
    lastNamePH: "Ej: García",
    emailLabel: "Email",
    emailPH: "Ej: juan@email.com",
    phoneLabel: "Teléfono",
    flightLabel: 'Número de vuelo <span class="optional-tag">(opcional)</span>',
    optional: "opcional",
    flightPH: "Ej: AR 1234",
    flightHint: "Ingresá tu número de vuelo para coordinar mejor la recogida.",
    scheduleCardLabel: "Horarios",
    tripDateLabel: "Fecha del viaje",
    tripDateHint: "Fecha en la que se realiza el traslado.",
    pickupTimeLabel:
      'Hora de recogida <span class="optional-tag">(opcional)</span>',
    pickupTimeHint:
      "Hora en que necesitás que el vehículo esté en el punto de origen.",
    arrivalTimeLabel:
      'Hora límite en destino <span class="optional-tag">(opcional)</span>',
    arrivalTimeHint: "Si tenés un horario límite para llegar, indicalo aquí.",
    btnViewQuote: "Ver cotización",
    extrasCardLabel: "Servicios adicionales",
    extrasNote:
      "Todos opcionales — con costo adicional (consultar aparte). Nos ayudan a preparar mejor tu viaje.",
    exAgua: "Agua mineral",
    exSnacks: "Snacks",
    exConv: "Conversación",
    convYes: "Sí, con gusto",
    convNo: "Prefiero silencio",
    exMusica: "Música",
    musicSoft: "Tranquila / ambiental",
    musicPop: "Pop / variado",
    musicNone: "Sin música",
    exTemp: "Temperatura",
    tempCold: "Frío (A/C)",
    tempNormal: "Normal",
    tempWarm: "Calefacción",
    exParada: "Parada en ruta",
    paradaPH: "Indicá dónde querés parar",
    exCargador: "Cargador",
    chargerUSBC: "USB-C",
    chargerIphone: "iPhone (Lightning)",
    chargerMicro: "Micro USB",
    exBebe: "Viaja con bebé / niño pequeño",
    exBebeNote:
      "Se coordina la sillita infantil con anticipación. Confirmaremos disponibilidad.",
    commentsLabel: "Comentarios adicionales",
    commentsPH: "Alguna indicación especial para el chofer...",
    metricDist: "Distancia",
    metricKm: "kilómetros",
    metricPax: "Pasajeros",
    metricPersons: "personas",
    metricLuggage: "Equipaje",
    metricSuitcases: "valijas",
    durationLabel: "Duración estimada",
    durationNote: "Sin tráfico · origen a destino",
    totalLabel: "Total estimado",
    minimumFareNote: "Tarifa mínima por viaje",
    fareBreakdownTitle: "Desglose del precio",
    farePickup: "Costo por recogida",
    fareTrip: "Costo del viaje",
    fareMinimumExtra: "Tarifa adicional por viaje mínimo",
    fareTotal: "Total",
    disclaimer:
      "<strong>Este precio es un estimado.</strong> No incluye peajes ni tiempo de espera — ambos se cotizan de forma separada con el operador. El precio final se confirma al momento de la reserva.",
    btnModify: "Modificar",
    btnSubmit: "Enviar solicitud al equipo de ventas",
    btnNewQuote: "Nueva cotización",
    errRequired: "Campo requerido",
    errEmail: "Email inválido",
    summaryPassenger: "Pasajero",
    summaryOrigin: "Origen",
    summaryDestination: "Destino",
    summaryEmail: "Email",
    summaryPhone: "Teléfono",
    summaryTripDate: "Fecha del viaje",
    summaryPickup: "Hora de recogida",
    summaryArrival: "Hora límite en destino",
    summaryFlight: "Número de vuelo",
    summaryExtras: "Servicios solicitados",
    summaryComments: "Comentarios",
    currencyARS: "Pesos argentinos · ARS",
    currencyUSD: "Dólares estadounidenses · USD",
    rateLabel: "Tipo de cambio (compra oficial)",
    confirmTitle: "¡Solicitud enviada!",
    confirmSub:
      "Tu solicitud fue recibida por el equipo de ventas. Te contactaremos en menos de 24 horas para confirmar los detalles de tu traslado.",
    refLabel: "Número de referencia",
    apiMissing:
      "Falta configurar la API key de Google Maps para activar el cotizador.",
    mapsLoadError:
      "No se pudo cargar Google Maps. Verificá la key y que las APIs estén habilitadas.",
    mapsTimeoutError:
      "Tiempo de espera agotado. Verificá tu API key y las APIs habilitadas.",
    routePickupError: "Error en tramo desde la base",
    routeCalcError: "No se pudo calcular la ruta",
    formMissing: "Completá la ruta y el vehículo antes de enviar.",
    submitError: "No se pudo enviar el formulario. Intentá nuevamente.",
  },
  en: {
    brandName: "Transfers",
    brandTag: "Quote",
    setupEye: "Setup",
    setupTitle: "Activate Google Maps",
    setupSub:
      "Enter your API key to enable route calculation and the interactive map.",
    apiKeyLabel: "Google Maps API Key",
    apiHint: "Required: Maps JavaScript API · Directions API · Places API",
    btnContinue: "Continue",
    loadingMaps: "Connecting to Google Maps...",
    step1: "Route",
    step2: "Vehicle",
    step3: "Details",
    step4: "Extras",
    step5: "Quote",
    btnDevFill: "Load demo",
    routeCardLabel: "Trip details",
    originLabel: "Pickup location",
    destLabel: "Drop-off location",
    swapRouteBtn: "Swap",
    originPH: "E.g.: Nordelta, Tigre",
    destPH: "E.g.: Ezeiza International Airport",
    btnCalcRoute: "Calculate route",
    loadingRoute: "Calculating route...",
    vehicleCardLabel: "Select vehicle",
    comunName: "Standard",
    premiumName: "Premium",
    comunLuggage: "2 x 23 kg bags<br>2 carry-ons",
    premiumLuggage: "3 x 23 kg bags<br>2 carry-ons",
    scaleMsg: "Scale on board",
    scaleNote:
      "Don't worry before checking in — we have a scale on board to verify your luggage weight if needed.",
    paxCardLabel: "Passengers & luggage",
    paxLabel: "Passengers",
    paxMax: "Maximum 4 people",
    luggageLabel: "Total bags",
    luggageNote: "Number of bags",
    btnBack: "Back",
    passengerCardLabel: "Passenger details",
    firstNameLabel: "First name",
    firstNamePH: "E.g.: John",
    lastNameLabel: "Last name",
    lastNamePH: "E.g.: Smith",
    emailLabel: "Email",
    emailPH: "E.g.: john@email.com",
    phoneLabel: "Phone",
    flightLabel: 'Flight number <span class="optional-tag">(optional)</span>',
    optional: "optional",
    flightPH: "E.g.: AR 1234",
    flightHint: "Enter your flight number to better coordinate your pickup.",
    scheduleCardLabel: "Schedule",
    tripDateLabel: "Trip date",
    tripDateHint: "Date of the transfer.",
    pickupTimeLabel: 'Pickup time <span class="optional-tag">(optional)</span>',
    pickupTimeHint: "Time you need the vehicle to be at the pickup location.",
    arrivalTimeLabel:
      'Latest arrival time <span class="optional-tag">(optional)</span>',
    arrivalTimeHint:
      "If you have a deadline to arrive at your destination, enter it here.",
    btnViewQuote: "View quote",
    extrasCardLabel: "Additional services",
    extrasNote:
      "All optional — extra cost (ask separately). They help us prepare your trip better.",
    exAgua: "Mineral water",
    exSnacks: "Snacks",
    exConv: "Conversation",
    convYes: "Happy to chat",
    convNo: "Prefer silence",
    exMusica: "Music",
    musicSoft: "Soft / ambient",
    musicPop: "Pop / mixed",
    musicNone: "No music",
    exTemp: "Temperature",
    tempCold: "Cold (A/C)",
    tempNormal: "Normal",
    tempWarm: "Heating",
    exParada: "Stop en route",
    paradaPH: "Where would you like to stop?",
    exCargador: "Charger",
    chargerUSBC: "USB-C",
    chargerIphone: "iPhone (Lightning)",
    chargerMicro: "Micro USB",
    exBebe: "Travelling with a baby / toddler",
    exBebeNote:
      "We'll arrange a child seat in advance. We'll confirm availability.",
    commentsLabel: "Additional comments",
    commentsPH: "Any special instructions for the driver...",
    metricDist: "Distance",
    metricKm: "kilometers",
    metricPax: "Passengers",
    metricPersons: "people",
    metricLuggage: "Luggage",
    metricSuitcases: "bags",
    durationLabel: "Estimated duration",
    durationNote: "Without traffic · origin to destination",
    totalLabel: "Estimated total",
    minimumFareNote: "Minimum fare per trip",
    fareBreakdownTitle: "Price breakdown",
    farePickup: "Pickup cost",
    fareTrip: "Trip cost",
    fareMinimumExtra: "Additional minimum fare",
    fareTotal: "Total",
    disclaimer:
      "<strong>This price is an estimate.</strong> It does not include tolls or waiting time — both are quoted separately with the operator. The final price is confirmed at the time of booking.",
    btnModify: "Modify",
    btnSubmit: "Send request to sales team",
    btnNewQuote: "New quote",
    errRequired: "Required field",
    errEmail: "Invalid email",
    summaryPassenger: "Passenger",
    summaryOrigin: "Origin",
    summaryDestination: "Destination",
    summaryEmail: "Email",
    summaryPhone: "Phone",
    summaryTripDate: "Trip date",
    summaryPickup: "Pickup time",
    summaryArrival: "Latest arrival",
    summaryFlight: "Flight number",
    summaryExtras: "Requested services",
    summaryComments: "Comments",
    currencyARS: "Argentine pesos · ARS",
    currencyUSD: "US dollars · USD",
    rateLabel: "Exchange rate (official buy)",
    confirmTitle: "Request sent!",
    confirmSub:
      "Your request has been received by the sales team. We will contact you within 24 hours to confirm your transfer details.",
    refLabel: "Reference number",
    apiMissing:
      "Google Maps API key is missing. Configure it to enable the quote form.",
    mapsLoadError:
      "Google Maps could not be loaded. Check the API key and enabled APIs.",
    mapsTimeoutError:
      "Timeout while loading Google Maps. Check the API key and enabled APIs.",
    routePickupError: "Base leg error",
    routeCalcError: "Route could not be calculated",
    formMissing: "Complete the route and vehicle selection before submitting.",
    submitError: "The form could not be sent. Please try again.",
  },
};

T.it = {
  ...T.en,
  brandName: "Transfer",
  brandTag: "Preventivo",
  setupEye: "Configurazione",
  step3: "Dati",
  routeCardLabel: "Dettagli del viaggio",
  originLabel: "Luogo di partenza",
  destLabel: "Destinazione",
  btnCalcRoute: "Calcola percorso",
  loadingRoute: "Calcolo percorso...",
  passengerCardLabel: "Dati passeggero",
  tripDateLabel: "Data del viaggio",
  pickupTimeLabel: 'Orario di ritiro <span class="optional-tag">(opzionale)</span>',
  arrivalTimeLabel:
    'Orario massimo di arrivo <span class="optional-tag">(opzionale)</span>',
  btnViewQuote: "Vedi preventivo",
  extrasCardLabel: "Servizi aggiuntivi",
  commentsLabel: "Commenti aggiuntivi",
  durationLabel: "Durata stimata",
  totalLabel: "Totale stimato",
  fareBreakdownTitle: "Dettaglio del prezzo",
  farePickup: "Costo di prelievo",
  fareTrip: "Costo del viaggio",
  fareMinimumExtra: "Supplemento tariffa minima",
  btnSubmit: "Invia richiesta al team vendite",
  confirmTitle: "Richiesta inviata!",
  confirmSub:
    "La tua richiesta e stata ricevuta. Ti contatteremo entro 24 ore per confermare i dettagli del transfer.",
  submitError: "Non e stato possibile inviare il modulo. Riprova.",
};

T.pt = {
  ...T.en,
  brandName: "Traslados",
  brandTag: "Orcamento",
  setupEye: "Configuracao",
  step3: "Dados",
  routeCardLabel: "Detalhes da viagem",
  originLabel: "Origem",
  destLabel: "Destino",
  btnCalcRoute: "Calcular rota",
  loadingRoute: "Calculando rota...",
  passengerCardLabel: "Dados do passageiro",
  tripDateLabel: "Data da viagem",
  pickupTimeLabel: 'Horario de embarque <span class="optional-tag">(opcional)</span>',
  arrivalTimeLabel:
    'Horario limite de chegada <span class="optional-tag">(opcional)</span>',
  btnViewQuote: "Ver orcamento",
  extrasCardLabel: "Servicos adicionais",
  commentsLabel: "Comentarios adicionais",
  durationLabel: "Duracao estimada",
  totalLabel: "Total estimado",
  fareBreakdownTitle: "Detalhamento de preco",
  farePickup: "Custo de recolhimento",
  fareTrip: "Custo da viagem",
  fareMinimumExtra: "Adicional de tarifa minima",
  btnSubmit: "Enviar solicitacao para a equipe comercial",
  confirmTitle: "Solicitacao enviada!",
  confirmSub:
    "Recebemos sua solicitacao. Entraremos em contato em ate 24 horas para confirmar os detalhes do traslado.",
  submitError: "Nao foi possivel enviar o formulario. Tente novamente.",
};

T.de = {
  ...T.en,
  brandName: "Transfers",
  brandTag: "Angebot",
  setupEye: "Einrichtung",
  step3: "Daten",
  routeCardLabel: "Fahrtdetails",
  originLabel: "Abholort",
  destLabel: "Zielort",
  btnCalcRoute: "Route berechnen",
  loadingRoute: "Route wird berechnet...",
  passengerCardLabel: "Passagierdaten",
  tripDateLabel: "Fahrtdatum",
  pickupTimeLabel: 'Abholzeit <span class="optional-tag">(optional)</span>',
  arrivalTimeLabel:
    'Spaeteste Ankunftszeit <span class="optional-tag">(optional)</span>',
  btnViewQuote: "Angebot anzeigen",
  extrasCardLabel: "Zusaetzliche Services",
  commentsLabel: "Zusaetzliche Kommentare",
  durationLabel: "Geschaetzte Dauer",
  totalLabel: "Geschaetzter Gesamtpreis",
  fareBreakdownTitle: "Preisaufschluesselung",
  farePickup: "Abholkosten",
  fareTrip: "Fahrtkosten",
  fareMinimumExtra: "Zuschlag Mindesttarif",
  btnSubmit: "Anfrage an das Vertriebsteam senden",
  confirmTitle: "Anfrage gesendet!",
  confirmSub:
    "Ihre Anfrage wurde empfangen. Wir kontaktieren Sie innerhalb von 24 Stunden, um die Transferdetails zu bestaetigen.",
  submitError: "Das Formular konnte nicht gesendet werden. Bitte erneut versuchen.",
};

const PATH_BY_LANG = {
  es: "/",
  en: "/english.html",
  it: "/italiano.html",
  pt: "/portugues.html",
  de: "/german.html",
};

const LOCALE_BY_LANG = {
  es: "es-AR",
  en: "en-US",
  it: "it-IT",
  pt: "pt-BR",
  de: "de-DE",
};

function detectPathLang(pathname) {
  const normalized = (pathname || "").toLowerCase();
  if (normalized.includes("english")) return "en";
  if (normalized.includes("italiano")) return "it";
  if (normalized.includes("portugues")) return "pt";
  if (normalized.includes("german")) return "de";
  return "es";
}

function setLang(l) {
  const currentPathLang = detectPathLang(window.location.pathname || "");
  if (l !== currentPathLang) {
    const target = PATH_BY_LANG[l] || PATH_BY_LANG.es;
    window.location.href = `${target}${window.location.search || ""}`;
    return;
  }

  lang = T[l] ? l : "es";
  const esBtn = document.getElementById("lang-es");
  const enBtn = document.getElementById("lang-en");
  if (esBtn && enBtn) {
    esBtn.classList.toggle("active", l === "es");
    enBtn.classList.toggle("active", l === "en");
  }
  document.documentElement.lang = l;
  const langInput = document.getElementById("lang-input");
  if (langInput) langInput.value = l;
  applyTranslations();
}

function applyTranslations() {
  const t = T[lang];
  document.querySelectorAll("[data-t]").forEach((el) => {
    const k = el.getAttribute("data-t");
    if (t[k] !== undefined) el.innerHTML = t[k];
  });
  document.querySelectorAll("[data-t-placeholder]").forEach((el) => {
    const k = el.getAttribute("data-t-placeholder");
    if (t[k] !== undefined) el.placeholder = t[k];
  });
  document.querySelectorAll("[data-t-opt]").forEach((el) => {
    const k = el.getAttribute("data-t-opt");
    if (t[k] !== undefined) el.textContent = t[k];
  });
  if (routeData && lastTotalARS > 0) renderQuoteSummary();
  if (lastTotalARS > 0) renderTotal(lastTotalARS);
}

function isDevMode() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("dev") === "1") return true;
  const { protocol, hostname } = window.location;
  return (
    protocol === "file:" ||
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]"
  );
}

function getNextDateISO(daysAhead = 1) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function setFieldValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}

function clearPassengerErrors() {
  ["p-nombre", "p-apellido", "p-email", "p-tel", "p-fecha"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("error");
  });
  ["err-nombre", "err-apellido", "err-email", "err-tel", "err-fecha"].forEach(
    (id) => {
      const el = document.getElementById(id);
      if (el) el.classList.remove("visible");
    },
  );
}

function clearExtrasSelection() {
  const ids = [
    "agua",
    "snacks",
    "conv",
    "musica",
    "temp",
    "parada",
    "cargador",
    "bebe",
  ];
  extrasSelected.clear();
  ids.forEach((id) => {
    const card = document.getElementById(`ex-${id}`);
    if (card) card.classList.remove("selected");
    if (id === "parada" && card) {
      const sub = card.querySelector(".extra-sub");
      if (sub) sub.style.display = "none";
    }
  });
}

function isPassengerDataComplete() {
  const checks = [
    (document.getElementById("p-nombre")?.value || "").trim().length > 0,
    (document.getElementById("p-apellido")?.value || "").trim().length > 0,
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      (document.getElementById("p-email")?.value || "").trim(),
    ),
    (document.getElementById("p-tel")?.value || "").trim().length > 4,
    (document.getElementById("p-fecha")?.value || "").trim().length > 0,
  ];
  return checks.every(Boolean);
}

function getActiveStepId() {
  return document.querySelector(".step.active")?.id || STEP_ORDER[0];
}

function getMaxReachableStepIndex() {
  if (!routeData) return 0;
  if (!vehicle) return 1;
  if (!isPassengerDataComplete()) return 2;
  return 4;
}

function updateProgressNavigation() {
  const activeStepId = getActiveStepId();
  const activeIndex = STEP_ORDER.indexOf(activeStepId);
  const maxReachableIndex = Math.max(getMaxReachableStepIndex(), activeIndex);

  document.querySelectorAll(".prog-step").forEach((step) => {
    const targetStepId = step.dataset.targetStep;
    const targetIndex = STEP_ORDER.indexOf(targetStepId);
    const canJump = targetIndex !== -1 && targetIndex <= maxReachableIndex;
    const isCurrent = targetStepId === activeStepId;
    const isClickable = canJump && !isCurrent;

    step.classList.toggle("is-clickable", isClickable);
    step.setAttribute("tabindex", isClickable ? "0" : "-1");
    step.setAttribute("role", isClickable ? "button" : "presentation");
    step.setAttribute("aria-disabled", isClickable ? "false" : "true");
    if (isCurrent) {
      step.setAttribute("aria-current", "step");
    } else {
      step.removeAttribute("aria-current");
    }
  });
}

function navigateToStep(stepId) {
  const targetIndex = STEP_ORDER.indexOf(stepId);
  const activeIndex = STEP_ORDER.indexOf(getActiveStepId());
  const maxReachableIndex = Math.max(getMaxReachableStepIndex(), activeIndex);

  if (targetIndex === -1 || targetIndex > maxReachableIndex) return;
  if (stepId === "step-result") buildQuote();
  showStep(stepId);
}

function initProgressNavigation() {
  document.querySelectorAll(".step .progress-bar").forEach((bar) => {
    bar.querySelectorAll(".prog-step").forEach((step, index) => {
      step.dataset.targetStep = STEP_ORDER[index] || "";
      if (step.dataset.navBound === "1") return;
      step.dataset.navBound = "1";
      step.addEventListener("click", () => {
        navigateToStep(step.dataset.targetStep);
      });
      step.addEventListener("keydown", (evt) => {
        if (evt.key !== "Enter" && evt.key !== " ") return;
        evt.preventDefault();
        navigateToStep(step.dataset.targetStep);
      });
    });
  });
  updateProgressNavigation();
}

function showStep(stepId) {
  document
    .querySelectorAll(".step")
    .forEach((el) => el.classList.remove("active"));
  const step = document.getElementById(stepId);
  if (step) step.classList.add("active");
  updateProgressNavigation();
  scrollToFormStart();
}

function scrollToFormStart() {
  const anchor =
    document.getElementById("cotizar") ||
    document.getElementById("quote-form") ||
    document.querySelector(".row-form");
  if (!anchor) return;
  const top = Math.max(0, window.scrollY + anchor.getBoundingClientRect().top - 12);
  window.scrollTo({ top, behavior: "smooth" });
}

function setCurrency(c) {
  currency = c;
  const arsBtn = document.getElementById("cur-ars");
  const usdBtn = document.getElementById("cur-usd");
  if (arsBtn && usdBtn) {
    arsBtn.classList.toggle("active", c === "ARS");
    usdBtn.classList.toggle("active", c === "USD");
  }
  const currencyInput = document.getElementById("currency-input");
  if (currencyInput) currencyInput.value = c;
  if (c === "USD" && !usdRate) fetchRate();
  if (lastTotalARS > 0) renderTotal(lastTotalARS);
}

async function fetchRate() {
  try {
    const res = await fetch("https://dolarapi.com/v1/dolares/oficial");
    const d = await res.json();
    if (d && d.compra) {
      usdRate = d.compra;
      renderTotal(lastTotalARS);
      return;
    }
  } catch (_) {}
  try {
    const res2 = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
    const d2 = await res2.json();
    if (d2 && d2.rates && d2.rates.ARS) {
      usdRate = d2.rates.ARS;
      renderTotal(lastTotalARS);
    }
  } catch (_) {}
}

function renderTotal(totalARS) {
  lastTotalARS = totalARS;
  const t = T[lang];
  const rateEl = document.getElementById("total-rate");
  const valEl = document.getElementById("total-value");
  const curEl = document.getElementById("total-currency");
  const minimumNoteEl = document.getElementById("total-minimum-note");
  const totalArsInput = document.getElementById("total-ars-input");
  const totalUsdInput = document.getElementById("total-usd-input");
  if (totalArsInput) totalArsInput.value = totalARS;
  if (currency === "USD" && usdRate) {
    const usd = (totalARS / usdRate).toFixed(2);
    if (valEl)
      valEl.textContent =
        "U$D " +
        Number(usd).toLocaleString("en-US", { minimumFractionDigits: 2 });
    if (curEl) curEl.textContent = t.currencyUSD;
    if (rateEl) {
      rateEl.style.display = "block";
      rateEl.textContent = `${t.rateLabel}: $${usdRate.toLocaleString("es-AR")}`;
    }
    if (totalUsdInput) totalUsdInput.value = usd;
  } else if (currency === "USD" && !usdRate) {
    if (valEl) valEl.textContent = "...";
    if (curEl) curEl.textContent = t.currencyUSD;
    if (rateEl) {
      rateEl.style.display = "block";
      rateEl.textContent = "Obteniendo tipo de cambio...";
    }
    if (totalUsdInput) totalUsdInput.value = "";
  } else {
    if (valEl) valEl.textContent = "$" + totalARS.toLocaleString("es-AR");
    if (curEl) curEl.textContent = t.currencyARS;
    if (rateEl) rateEl.style.display = "none";
    if (totalUsdInput) totalUsdInput.value = "";
  }
  if (minimumNoteEl) {
    if (lastMinimumApplied) {
      minimumNoteEl.textContent = t.minimumFareNote;
      minimumNoteEl.style.display = "block";
    } else {
      minimumNoteEl.style.display = "none";
    }
  }
}

function loadMaps(key) {
  const t = T[lang];
  if (!key || key.includes("REEMPLAZAR")) {
    showErr("route-error", t.apiMissing);
    return;
  }
  if (window.google && window.google.maps) {
    mapsOk = true;
    bindAutocomplete();
    return;
  }
  window.__mapsReady = function () {
    mapsOk = true;
    bindAutocomplete();
  };
  const s = document.createElement("script");
  s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&callback=__mapsReady&loading=async`;
  s.onerror = () => {
    showErr("route-error", t.mapsLoadError);
  };
  document.head.appendChild(s);
  setTimeout(() => {
    if (!mapsOk) showErr("route-error", t.mapsTimeoutError);
  }, 12000);
}

function bindAutocomplete() {
  const originInput = document.getElementById("origin-input");
  const destInput = document.getElementById("dest-input");
  if (!originInput || !destInput) {
    return;
  }
  originInput.addEventListener("input", () => {
    resetRouteCalculation();
    doAC("origin");
    checkReady();
  });
  destInput.addEventListener("input", () => {
    resetRouteCalculation();
    doAC("dest");
    checkReady();
  });
  checkReady();
}

function applyQuickLocation(field, value) {
  const input = document.getElementById(`${field}-input`);
  if (!input) return;
  input.value = value;
  const list = document.getElementById(`${field}-list`);
  if (list) list.style.display = "none";
  acSessions[field] = null;
  resetRouteCalculation();
  checkReady();
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

function initQuickLocationChips() {
  ["origin", "dest"].forEach((field) => {
    const input = document.getElementById(`${field}-input`);
    if (!input) return;
    const fieldGroup = input.closest(".field-group");
    if (!fieldGroup || fieldGroup.querySelector(".quick-locations")) return;
    const wrap = document.createElement("div");
    wrap.className = "quick-locations";
    QUICK_LOCATIONS.forEach((location) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "quick-location-chip";
      chip.textContent = location.label;
      chip.addEventListener("click", () =>
        applyQuickLocation(field, location.value),
      );
      wrap.appendChild(chip);
    });
    fieldGroup.appendChild(wrap);
  });
}

function doAC(field) {
  const input = document.getElementById(`${field}-input`);
  const list = document.getElementById(`${field}-list`);
  if (!input || !list || !window.google) {
    return;
  }
  const val = input.value.trim();
  if (val.length < 3) {
    list.style.display = "none";
    return;
  }
  if (!acSessions[field])
    acSessions[field] = new google.maps.places.AutocompleteSessionToken();
  new google.maps.places.AutocompleteService().getPlacePredictions(
    {
      input: val,
      sessionToken: acSessions[field],
      componentRestrictions: { country: ["ar", "uy"] },
    },
    (preds, status) => {
      if (status !== "OK" || !preds) {
        list.style.display = "none";
        return;
      }
      list.innerHTML = "";
      preds.slice(0, 4).forEach((p) => {
        const el = document.createElement("div");
        el.className = "pac-item";
        el.innerHTML = `<span class="pac-dot"></span>${p.description}`;
        el.onclick = () => {
          input.value = p.description;
          list.style.display = "none";
          acSessions[field] = null;
          checkReady();
        };
        list.appendChild(el);
      });
      list.style.display = "block";
    },
  );
}

function checkReady() {
  const o = document.getElementById("origin-input");
  const d = document.getElementById("dest-input");
  const btn = document.getElementById("btn-route");
  if (!o || !d || !btn) {
    return;
  }
  btn.disabled = !(o.value.trim().length > 3 && d.value.trim().length > 3);
}

function resetRouteCalculation() {
  routeData = null;
  const err = document.getElementById("route-error");
  if (err) err.style.display = "none";
  updateProgressNavigation();
}

function swapRouteInputs() {
  const originInput = document.getElementById("origin-input");
  const destInput = document.getElementById("dest-input");
  if (!originInput || !destInput) return;

  const originValue = originInput.value;
  originInput.value = destInput.value;
  destInput.value = originValue;

  ["origin-list", "dest-list"].forEach((id) => {
    const list = document.getElementById(id);
    if (list) list.style.display = "none";
  });
  acSessions.origin = null;
  acSessions.dest = null;
  resetRouteCalculation();
  checkReady();
}

function calcRoute() {
  if (!mapsOk) {
    return;
  }
  const t = T[lang];
  const origin = (document.getElementById("origin-input") || {}).value?.trim();
  const dest = (document.getElementById("dest-input") || {}).value?.trim();
  const loading = document.getElementById("route-loading");
  const err = document.getElementById("route-error");
  const btn = document.getElementById("btn-route");
  if (loading) loading.classList.add("visible");
  if (err) err.style.display = "none";
  if (btn) btn.disabled = true;
  const svc = new google.maps.DirectionsService();
  let legBaseToOrigin = null,
    legTrip = null,
    legBaseToDest = null,
    resultTrip = null,
    done = 0,
    errored = false;
  function finish() {
    if (loading) loading.classList.remove("visible");
    if (btn) btn.disabled = false;
    const kmBaseToOrigin = +(legBaseToOrigin.distance.value / 1000).toFixed(2);
    const kmBaseToDest = +(legBaseToDest.distance.value / 1000).toFixed(2);
    routeData = {
      result: resultTrip,
      kmDead: Math.max(kmBaseToOrigin, kmBaseToDest),
      kmTrip: +(legTrip.distance.value / 1000).toFixed(2),
      durationTrip: legTrip.duration.text,
      kmBaseOrigin: kmBaseToOrigin,
      kmBaseDest: kmBaseToDest,
      baseLocation:
        typeof legBaseToOrigin.start_location?.toJSON === "function"
          ? legBaseToOrigin.start_location.toJSON()
          : null,
      originRaw: origin,
      destRaw: dest,
    };
    goTo("step-route", "step-options");
  }
  svc.route(
    {
      origin: GARAGE,
      destination: origin,
      travelMode: google.maps.TravelMode.DRIVING,
    },
    (r, s) => {
      if (errored) return;
      if (s !== "OK") {
        errored = true;
        if (loading) loading.classList.remove("visible");
        if (btn) btn.disabled = false;
        showErr("route-error", `${t.routePickupError} (${s}).`);
        return;
      }
      legBaseToOrigin = r.routes[0].legs[0];
      done++;
      if (done === 3) finish();
    },
  );
  svc.route(
    { origin, destination: dest, travelMode: google.maps.TravelMode.DRIVING },
    (r, s) => {
      if (errored) return;
      if (s !== "OK") {
        errored = true;
        if (loading) loading.classList.remove("visible");
        if (btn) btn.disabled = false;
        showErr("route-error", `${t.routeCalcError} (${s}).`);
        return;
      }
      legTrip = r.routes[0].legs[0];
      resultTrip = r;
      done++;
      if (done === 3) finish();
    },
  );
  svc.route(
    {
      origin: GARAGE,
      destination: dest,
      travelMode: google.maps.TravelMode.DRIVING,
    },
    (r, s) => {
      if (errored) return;
      if (s !== "OK") {
        errored = true;
        if (loading) loading.classList.remove("visible");
        if (btn) btn.disabled = false;
        showErr("route-error", `${t.routePickupError} (${s}).`);
        return;
      }
      legBaseToDest = r.routes[0].legs[0];
      done++;
      if (done === 3) finish();
    },
  );
}

function selectVehicle(type) {
  vehicle = type;
  const comun = document.getElementById("vc-comun");
  const prem = document.getElementById("vc-premium");
  const btn = document.getElementById("btn-quote");
  if (comun) comun.classList.toggle("selected", type === "comun");
  if (prem) prem.classList.toggle("selected", type === "premium");
  if (btn) btn.disabled = false;
  const vehicleInput = document.getElementById("vehicle-input");
  if (vehicleInput) vehicleInput.value = type;
  updateProgressNavigation();
}

function toggleExtra(id) {
  const card = document.getElementById(`ex-${id}`);
  const isOn = extrasSelected.has(id);
  if (isOn) {
    extrasSelected.delete(id);
    if (card) card.classList.remove("selected");
  } else {
    extrasSelected.add(id);
    if (card) card.classList.add("selected");
  }
  if (id === "parada" && card) {
    const sub = card.querySelector(".extra-sub");
    if (sub) sub.style.display = extrasSelected.has(id) ? "block" : "none";
  }
}

function validatePassengerFields() {
  const t = T[lang];
  const fields = [
    { id: "p-nombre", err: "err-nombre", check: (v) => v.length > 0 },
    { id: "p-apellido", err: "err-apellido", check: (v) => v.length > 0 },
    {
      id: "p-email",
      err: "err-email",
      check: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    },
    { id: "p-tel", err: "err-tel", check: (v) => v.length > 4 },
    { id: "p-fecha", err: "err-fecha", check: (v) => v.length > 0 },
  ];
  let valid = true;
  fields.forEach((f) => {
    const el = document.getElementById(f.id);
    const errEl = document.getElementById(f.err);
    if (!el || !errEl) {
      return;
    }
    const ok = f.check(el.value.trim());
    el.classList.toggle("error", !ok);
    errEl.textContent = f.id === "p-email" ? t.errEmail : t.errRequired;
    errEl.classList.toggle("visible", !ok);
    if (!ok) valid = false;
  });
  return valid;
}

function submitPassenger() {
  if (!validatePassengerFields()) return;
  goTo("step-passenger", "step-extras");
}

function getExtrasSummary() {
  const t = T[lang];
  if (extrasSelected.size === 0) return "";
  const extraMap = {
    agua: t.exAgua,
    snacks: t.exSnacks,
    conv: `${t.exConv}: ${getSelectText("sel-conv")}`,
    musica: `${t.exMusica}: ${getSelectText("sel-musica")}`,
    temp: `${t.exTemp}: ${getSelectText("sel-temp")}`,
    parada: `${t.exParada}: ${document.getElementById("txt-parada")?.value || "—"}`,
    cargador: `${t.exCargador}: ${getSelectText("sel-cargador")}`,
    bebe: t.exBebe,
  };
  return [...extrasSelected].map((k) => extraMap[k] || k).join(" · ");
}

function getSelectText(id) {
  const el = document.getElementById(id);
  if (!el) return "";
  return el.options[el.selectedIndex]?.text || "";
}

function formatTripDateForDisplay(dateStr) {
  if (!dateStr) return "";
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  const locale = LOCALE_BY_LANG[lang] || "en-US";
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function formatTripDateForRef(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return "";
  const y = parts[0];
  const m = parseInt(parts[1], 10) - 1;
  const d = parts[2];
  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  if (m < 0 || m > 11) return "";
  return `${d}${months[m]}${y.slice(-2)}`;
}

function roundUpToNext500(value) {
  return Math.ceil(value / 500) * 500;
}

function formatARSAmount(value) {
  const locale = LOCALE_BY_LANG[lang] || "en-US";
  return "$" + Math.round(value).toLocaleString(locale);
}

function calculateQuoteBreakdown() {
  if (!vehicle || !routeData) {
    lastMinimumApplied = false;
    lastQuoteBreakdown = null;
    return null;
  }
  const rate = PRICES[vehicle];
  const minimum = MINIMUMS[vehicle] || 0;
  const { kmDead, kmTrip } = routeData;
  const pickupCost = Math.round((kmDead * rate) / 4);
  const tripCost = Math.round(kmTrip * rate);
  const baseTotal = tripCost + pickupCost;
  const adjustedTotal = Math.round(baseTotal * TOTAL_MULTIPLIER);
  const minimumExtra = Math.max(0, minimum - adjustedTotal);
  const total = roundUpToNext500(Math.max(adjustedTotal, minimum));
  lastMinimumApplied = adjustedTotal < minimum;
  lastQuoteBreakdown = {
    pickupCost,
    tripCost,
    minimumExtra,
    total,
  };
  return lastQuoteBreakdown;
}

function calculateQuoteTotalARS() {
  const breakdown = calculateQuoteBreakdown();
  return breakdown ? breakdown.total : 0;
}

function renderQuoteSummary() {
  if (!routeData) return;
  const t = T[lang];
  const pax = parseInt(document.getElementById("pax-input")?.value, 10) || 1;
  const luggage =
    parseInt(document.getElementById("luggage-input")?.value, 10) || 0;
  const { kmTrip, durationTrip } = routeData;

  const rKm = document.getElementById("r-km");
  const rTime = document.getElementById("r-time");
  const rPax = document.getElementById("r-pax");
  const rLuggage = document.getElementById("r-luggage");
  if (rKm) rKm.textContent = kmTrip.toFixed(1);
  if (rTime) rTime.textContent = durationTrip;
  if (rPax) rPax.textContent = pax;
  if (rLuggage) rLuggage.textContent = luggage;

  const nombre = document.getElementById("p-nombre")?.value.trim() || "";
  const apellido = document.getElementById("p-apellido")?.value.trim() || "";
  const email = document.getElementById("p-email")?.value.trim() || "";
  const tel = document.getElementById("p-tel")?.value.trim() || "";
  const vuelo = document.getElementById("p-vuelo")?.value.trim() || "";
  const fecha = document.getElementById("p-fecha")?.value || "";
  const recogida = document.getElementById("p-hora-recogida")?.value || "";
  const destino = document.getElementById("p-hora-destino")?.value || "";
  const origenViaje = routeData.originRaw || "";
  const destinoViaje = routeData.destRaw || "";

  let rows = `
    <div class="result-detail-row"><span class="result-detail-label">${t.summaryPassenger}</span><span class="result-detail-value">${nombre} ${apellido}</span></div>
    <div class="result-detail-row"><span class="result-detail-label">${t.summaryOrigin}</span><span class="result-detail-value">${origenViaje}</span></div>
    <div class="result-detail-row"><span class="result-detail-label">${t.summaryDestination}</span><span class="result-detail-value">${destinoViaje}</span></div>
    <div class="result-detail-row"><span class="result-detail-label">${t.summaryEmail}</span><span class="result-detail-value">${email}</span></div>
    <div class="result-detail-row"><span class="result-detail-label">${t.summaryPhone}</span><span class="result-detail-value">${tel}</span></div>
    <div class="result-detail-row"><span class="result-detail-label">${t.summaryTripDate}</span><span class="result-detail-value">${formatTripDateForDisplay(fecha)}</span></div>
    <div class="result-detail-row"><span class="result-detail-label">${t.summaryPickup}</span><span class="result-detail-value">${recogida}</span></div>`;
  if (destino)
    rows += `<div class="result-detail-row"><span class="result-detail-label">${t.summaryArrival}</span><span class="result-detail-value">${destino}</span></div>`;
  if (vuelo)
    rows += `<div class="result-detail-row"><span class="result-detail-label">${t.summaryFlight}</span><span class="result-detail-value">${vuelo}</span></div>`;
  const passengerSummary = document.getElementById("passenger-summary");
  if (passengerSummary) passengerSummary.innerHTML = rows;

  const extrasEl = document.getElementById("extras-summary");
  const extrasSummary = getExtrasSummary();
  const comments = document.getElementById("txt-comments")?.value.trim() || "";
  if (extrasSummary || comments) {
    let erows = "";
    if (extrasSummary) {
      erows += `<div class="result-detail-row"><span class="result-detail-label">${t.summaryExtras}</span><span class="result-detail-value" style="font-size:12px;">${extrasSummary}</span></div>`;
    }
    if (comments) {
      erows += `<div class="result-detail-row"><span class="result-detail-label">${t.summaryComments}</span><span class="result-detail-value" style="font-size:12px;">${comments}</span></div>`;
    }
    if (extrasEl) {
      extrasEl.innerHTML = erows;
      extrasEl.style.display = "block";
    }
  } else if (extrasEl) {
    extrasEl.style.display = "none";
  }

  const fareEl = document.getElementById("fare-breakdown-summary");
  const breakdown = lastQuoteBreakdown || calculateQuoteBreakdown();
  if (fareEl && breakdown) {
    fareEl.innerHTML = `
      <div class="result-detail-row"><span class="result-detail-label">${t.farePickup}</span><span class="result-detail-value">${formatARSAmount(breakdown.pickupCost)}</span></div>
      <div class="result-detail-row"><span class="result-detail-label">${t.fareTrip}</span><span class="result-detail-value">${formatARSAmount(breakdown.tripCost)}</span></div>
      ${
        breakdown.minimumExtra > 0
          ? `<div class="result-detail-row"><span class="result-detail-label">${t.fareMinimumExtra}</span><span class="result-detail-value">${formatARSAmount(breakdown.minimumExtra)}</span></div>`
          : ""
      }
      <div class="result-detail-row"><span class="result-detail-label">${t.fareTotal}</span><span class="result-detail-value">${formatARSAmount(breakdown.total)}</span></div>
    `;
  }
}

function buildQuote() {
  if (!vehicle || !routeData) return;
  const { kmTrip, durationTrip } = routeData;
  const totalARS = calculateQuoteTotalARS();

  renderQuoteSummary();

  if (currency === "USD" && !usdRate) fetchRate();
  renderTotal(totalARS);

  const distanceInput = document.getElementById("distance-input");
  const durationInput = document.getElementById("duration-input");
  if (distanceInput) distanceInput.value = kmTrip.toFixed(1);
  if (durationInput) durationInput.value = durationTrip;

  setTimeout(() => {
    const mapEl = document.getElementById("map");
    if (!mapEl || !window.google) return;
    const gmap = new google.maps.Map(mapEl, {
      zoom: 10,
      center: { lat: -34.48, lng: -58.72 },
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        { featureType: "poi", stylers: [{ visibility: "off" }] },
        { featureType: "transit", stylers: [{ visibility: "off" }] },
      ],
    });
    dirRenderer = new google.maps.DirectionsRenderer({
      polylineOptions: {
        strokeColor: "#1A3A5C",
        strokeWeight: 5,
        strokeOpacity: 0.88,
      },
    });
    dirRenderer.setMap(gmap);
    if (routeData.result) dirRenderer.setDirections(routeData.result);

    if (routeData.baseLocation?.lat && routeData.baseLocation?.lng) {
      new google.maps.Marker({
        map: gmap,
        position: routeData.baseLocation,
        title: "Rufo Transfers Base",
        icon: {
          url: "/public/imgs/logo.jpeg",
          scaledSize: new google.maps.Size(44, 44),
        },
      });
    }
  }, 120);
}

function loadDevDemo() {
  if (!isDevMode()) return;
  const demo = {
    origin: "Sofitel Cardales, Buenos Aires",
    destination: "Aeropuerto Ezeiza, Buenos Aires",
    kmDead: 14.8,
    kmBaseOrigin: 14.8,
    kmBaseDest: 44.2,
    kmTrip: 52.4,
    durationTrip: lang === "es" ? "1 h 05 min" : "1 hr 05 min",
    firstName: "Juan",
    lastName: "Pérez",
    email: "juan@example.com",
    phone: "+54 11 1234-5678",
    flight: "AR 1234",
    tripDate: getNextDateISO(1),
    pickupTime: "08:30",
    arrivalTime: "09:45",
    pax: "2",
    luggage: "2",
    comments:
      lang === "es"
        ? "Dato de prueba para revisar la experiencia completa del cotizador."
        : "Sample data to review the full quote experience.",
  };

  setFieldValue("origin-input", demo.origin);
  setFieldValue("dest-input", demo.destination);
  routeData = {
    result: null,
    kmDead: demo.kmDead,
    kmBaseOrigin: demo.kmBaseOrigin,
    kmBaseDest: demo.kmBaseDest,
    baseLocation: { lat: -34.4743, lng: -58.5138 },
    kmTrip: demo.kmTrip,
    durationTrip: demo.durationTrip,
    originRaw: demo.origin,
    destRaw: demo.destination,
  };

  selectVehicle("comun");
  setFieldValue("pax-input", demo.pax);
  setFieldValue("luggage-input", demo.luggage);
  setFieldValue("p-nombre", demo.firstName);
  setFieldValue("p-apellido", demo.lastName);
  setFieldValue("p-email", demo.email);
  setFieldValue("p-tel", demo.phone);
  setFieldValue("p-vuelo", demo.flight);
  setFieldValue("p-fecha", demo.tripDate);
  setFieldValue("p-hora-recogida", demo.pickupTime);
  setFieldValue("p-hora-destino", demo.arrivalTime);
  setFieldValue("txt-comments", demo.comments);
  clearPassengerErrors();
  clearExtrasSelection();
  checkReady();
  buildQuote();
  showStep("step-result");
}

async function submitQuote(evt) {
  const extrasInput = document.getElementById("extras-input");
  if (extrasInput) extrasInput.value = getExtrasSummary();

  if (evt) evt.preventDefault();

  if (!validatePassengerFields()) {
    goTo("step-result", "step-passenger");
    return;
  }

  if (!routeData || !vehicle) {
    showErr("route-error", T[lang].formMissing);
    goTo("step-result", "step-route");
    return;
  }

  const apellido = (document.getElementById("p-apellido")?.value || "")
    .trim()
    .toUpperCase();
  const origin =
    (routeData && routeData.originRaw) ||
    document.getElementById("origin-input")?.value ||
    "";
  const dest =
    (routeData && routeData.destRaw) ||
    document.getElementById("dest-input")?.value ||
    "";
  const ori3 = origin
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, "")
    .substring(0, 3)
    .toUpperCase();
  const dst3 = dest
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, "")
    .substring(0, 3)
    .toUpperCase();
  const fecha = document.getElementById("p-fecha")?.value || "";
  const dateStr =
    formatTripDateForRef(fecha) ||
    (() => {
      const now = new Date();
      const months = [
        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MAY",
        "JUN",
        "JUL",
        "AUG",
        "SEP",
        "OCT",
        "NOV",
        "DEC",
      ];
      return (
        String(now.getDate()).padStart(2, "0") +
        months[now.getMonth()] +
        String(now.getFullYear()).slice(2)
      );
    })();
  const ref = `${apellido}-${ori3}${dst3}-${dateStr}`;
  const refInput = document.getElementById("ref-input");
  if (refInput) refInput.value = ref;
  const refLabel = document.getElementById("ref-number");
  if (refLabel) refLabel.textContent = ref;

  const form =
    evt && evt.target ? evt.target : document.getElementById("cotizador-form");
  if (!form) {
    goTo("step-result", "step-confirm");
    return;
  }
  ensureFormStartedAt(form);
  try {
    const action = form.getAttribute("action") || "/";
    const payload = new URLSearchParams(new FormData(form));
    const res = await fetch(action, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: payload.toString(),
    });
    const raw = await res.text();
    let serverMessage = "";
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.message === "string") {
          serverMessage = parsed.message.trim();
        } else {
          serverMessage = raw.trim();
        }
      } catch (_) {
        serverMessage = raw.trim();
      }
    }
    if (!res.ok) {
      const fallback = T[lang].submitError;
      const detail = serverMessage || `HTTP ${res.status}`;
      throw new Error(`${fallback} (${detail})`);
    }
    goTo("step-result", "step-confirm");
  } catch (err) {
    const msg = err && err.message ? err.message : T[lang].submitError;
    showErr("route-error", msg);
  }
}

function goTo(from, to) {
  const fromEl = document.getElementById(from);
  const toEl = document.getElementById(to);
  if (fromEl) fromEl.classList.remove("active");
  if (toEl) toEl.classList.add("active");
  updateProgressNavigation();
  scrollToFormStart();
}

function showErr(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.style.display = "block";
}

function ensureFormStartedAt(form) {
  if (!form) return;
  const field = form.querySelector("#form-started-at");
  if (!field) return;
  if (!field.value) field.value = String(Date.now());
}

document.addEventListener("click", (e) => {
  ["origin-list", "dest-list"].forEach((id) => {
    const el = document.getElementById(id);
    const inp = id === "origin-list" ? "origin-input" : "dest-input";
    if (el && !el.contains(e.target) && e.target.id !== inp)
      el.style.display = "none";
  });
});

function initCotizador() {
  const root = document.querySelector(".cotizador");
  if (!root) return;
  const form = document.getElementById("cotizador-form");
  if (form) {
    ensureFormStartedAt(form);
    form.addEventListener("submit", submitQuote);
    form.addEventListener("input", updateProgressNavigation);
    form.addEventListener("change", updateProgressNavigation);
  }
  initProgressNavigation();
  const langInput = document.getElementById("lang-input");
  const initialLang =
    langInput && T[langInput.value] ? langInput.value : detectPathLang(window.location.pathname || "");
  setLang(initialLang);
  setCurrency("ARS");
  const devBtn = document.getElementById("btn-dev-fill");
  if (devBtn && isDevMode()) devBtn.style.display = "";
  initQuickLocationChips();
  const mapsKey = root.dataset.mapsKey || "";
  loadMaps(mapsKey);
  const params = new URLSearchParams(window.location.search);
  if (isDevMode() && params.get("demo") === "1") loadDevDemo();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCotizador);
} else {
  initCotizador();
}

window.setLang = setLang;
window.setCurrency = setCurrency;
window.calcRoute = calcRoute;
window.swapRouteInputs = swapRouteInputs;
window.loadDevDemo = loadDevDemo;
window.selectVehicle = selectVehicle;
window.submitPassenger = submitPassenger;
window.toggleExtra = toggleExtra;
window.buildQuote = buildQuote;
window.goTo = goTo;

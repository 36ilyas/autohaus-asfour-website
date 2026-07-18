/* Fahrzeugsuche + Detailansicht. Wird von beiden Entwürfen unverändert genutzt –
   das Aussehen steuern ausschließlich die Theme-Stylesheets. */

(function () {
  'use strict';

  const nf = new Intl.NumberFormat('de-DE');
  const eur = (n) => nf.format(n) + ' €';
  const km = (n) => nf.format(n) + ' km';

  const TAX_LABEL = {
    ausweisbar: 'inkl. 19 % MwSt., ausweisbar',
    differenz: 'Differenzbesteuert gem. § 25a UStG'
  };

  /* Monatliche Rate als echte Annuität – nicht Kaufpreis geteilt durch Laufzeit. */
  function rate(price) {
    const darlehen = price * (1 - FINANZIERUNG.anzahlungAnteil);
    const i = FINANZIERUNG.zinsEff / 12;
    const n = FINANZIERUNG.laufzeit;
    return Math.round((darlehen * i) / (1 - Math.pow(1 + i, -n)));
  }

  const bounds = {
    priceMax: Math.ceil(Math.max(...FAHRZEUGE.map(c => c.price)) / 1000) * 1000,
    priceMin: Math.floor(Math.min(...FAHRZEUGE.map(c => c.price)) / 1000) * 1000,
    kmMax: Math.ceil(Math.max(...FAHRZEUGE.map(c => c.km)) / 5000) * 5000,
    yearMin: Math.min(...FAHRZEUGE.map(c => c.year)),
    yearMax: Math.max(...FAHRZEUGE.map(c => c.year))
  };

  const SORTS = {
    'Preis aufsteigend': (a, b) => a.price - b.price,
    'Preis absteigend': (a, b) => b.price - a.price,
    'Neueste zuerst': (a, b) => b.year - a.year,
    'Kilometer aufsteigend': (a, b) => a.km - b.km
  };

  const defaults = () => ({
    marke: 'Alle', kraftstoff: 'Alle', getriebe: 'Alle',
    maxPreis: bounds.priceMax, maxKm: bounds.kmMax,
    minJahr: bounds.yearMin, sort: 'Preis aufsteigend'
  });

  let state = defaults();

  const $ = (sel) => document.querySelector(sel);
  const uniq = (key) => ['Alle', ...new Set(FAHRZEUGE.map(c => c[key]))];

  const el = {
    marke: $('#f-marke'), kraftstoff: $('#f-kraftstoff'), getriebe: $('#f-getriebe'),
    preis: $('#f-preis'), kmR: $('#f-km'), jahr: $('#f-jahr'), sort: $('#f-sort'),
    preisLabel: $('#l-preis'), kmLabel: $('#l-km'), jahrLabel: $('#l-jahr'),
    reset: $('#f-reset'), grid: $('#cars'), count: $('#result-count'),
    empty: $('#empty'), total: $('#total-cars'), dialog: $('#car-dialog')
  };

  if (!el.grid) return;

  function fillSelect(node, values) {
    node.innerHTML = values.map(v => `<option value="${v}">${v}</option>`).join('');
  }

  function setupFilters() {
    fillSelect(el.marke, uniq('brand'));
    fillSelect(el.kraftstoff, uniq('fuel'));
    fillSelect(el.getriebe, uniq('gear'));
    fillSelect(el.sort, Object.keys(SORTS));

    el.preis.min = bounds.priceMin; el.preis.max = bounds.priceMax; el.preis.step = 500;
    el.kmR.min = 5000; el.kmR.max = bounds.kmMax; el.kmR.step = 2500;
    el.jahr.min = bounds.yearMin; el.jahr.max = bounds.yearMax; el.jahr.step = 1;

    const bind = (node, key, num) => node.addEventListener('input', () => {
      state[key] = num ? Number(node.value) : node.value;
      render();
    });
    bind(el.marke, 'marke'); bind(el.kraftstoff, 'kraftstoff'); bind(el.getriebe, 'getriebe');
    bind(el.preis, 'maxPreis', true); bind(el.kmR, 'maxKm', true); bind(el.jahr, 'minJahr', true);
    bind(el.sort, 'sort');

    el.reset.addEventListener('click', (e) => { e.preventDefault(); state = defaults(); syncControls(); render(); });
    document.querySelectorAll('[data-reset]').forEach(a => {
      a.addEventListener('click', (e) => { e.preventDefault(); state = defaults(); syncControls(); render(); });
    });

    if (el.total) el.total.textContent = FAHRZEUGE.length;
    syncControls();
  }

  function syncControls() {
    el.marke.value = state.marke; el.kraftstoff.value = state.kraftstoff; el.getriebe.value = state.getriebe;
    el.preis.value = state.maxPreis; el.kmR.value = state.maxKm; el.jahr.value = state.minJahr;
    el.sort.value = state.sort;
  }

  function match(c) {
    return (state.marke === 'Alle' || c.brand === state.marke)
      && (state.kraftstoff === 'Alle' || c.fuel === state.kraftstoff)
      && (state.getriebe === 'Alle' || c.gear === state.getriebe)
      && c.price <= state.maxPreis && c.km <= state.maxKm && c.year >= state.minJahr;
  }

  function cardHTML(c) {
    return `
      <button class="card" type="button" data-id="${c.id}" aria-label="${c.title} – Details anzeigen">
        <div class="card__media">
          <img src="${c.image}" alt="${c.title}" loading="lazy">
          <span class="card__brand">${c.brand}</span>
        </div>
        <div class="card__body">
          <h3>${c.title}</h3>
          <div class="tags">
            <span class="tag">EZ ${c.ez}</span>
            <span class="tag">${km(c.km)}</span>
            <span class="tag">${c.fuel}</span>
            <span class="tag">${c.gear}</span>
            <span class="tag">${c.ps} PS</span>
          </div>
          <div class="card__foot">
            <div>
              <div class="price">${eur(c.price)}</div>
              <div class="price-note">${TAX_LABEL[c.tax]}</div>
              <div class="rate">Finanzierung ab ${eur(rate(c.price))}/Monat<sup>*</sup></div>
            </div>
            <span class="details">Details →</span>
          </div>
        </div>
      </button>`;
  }

  function render() {
    el.preisLabel.textContent = eur(state.maxPreis);
    el.kmLabel.textContent = km(state.maxKm);
    el.jahrLabel.textContent = state.minJahr;

    const list = FAHRZEUGE.filter(match).sort(SORTS[state.sort]);
    el.grid.innerHTML = list.map(cardHTML).join('');
    el.count.textContent = list.length === 1 ? '1 Fahrzeug' : list.length + ' Fahrzeuge';
    el.empty.hidden = list.length > 0;

    el.grid.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', () => openCar(card.dataset.id));
    });
  }

  function openCar(id) {
    const c = FAHRZEUGE.find(x => x.id === id);
    if (!c || !el.dialog) return;

    const specs = [
      ['Erstzulassung', c.ez],
      ['Kilometerstand', km(c.km)],
      ['Leistung', `${c.ps} PS (${c.kw} kW)`],
      ['Kraftstoff', c.fuel],
      ['Getriebe', c.gear],
      ['HU gültig bis', c.hu],
      ['Fahrzeughalter', c.owners],
      ['Verbrauch komb.', c.consumption],
      ['CO₂-Emissionen', c.co2]
    ];

    el.dialog.innerHTML = `
      <div class="modal__media">
        <img src="${c.image}" alt="${c.title}">
        <button class="modal__close" type="button" aria-label="Schließen" data-close>×</button>
        <span class="card__brand">${c.brand}</span>
      </div>
      <div class="modal__body">
        <div class="modal__head">
          <div>
            <h3>${c.title}</h3>
            <p class="rate" style="margin-top:6px">Effizienzklasse ${c.effClass} · ${c.owners} Vorbesitzer</p>
          </div>
          <div class="modal__price">
            <div class="price">${eur(c.price)}</div>
            <div class="price-note">${TAX_LABEL[c.tax]}</div>
            <div class="rate">Finanzierung ab ${eur(rate(c.price))}/Monat<sup>*</sup></div>
          </div>
        </div>
        <dl class="specs">
          ${specs.map(([k, v]) => `<div class="spec"><dt>${k}</dt><dd>${v}</dd></div>`).join('')}
        </dl>
        <h4 class="eyebrow" style="margin-bottom:10px">Ausstattung</h4>
        <div class="features">${c.features.map(f => `<span class="tag">${f}</span>`).join('')}</div>
        <p class="modal__desc">${c.desc}</p>
        <div class="modal__actions">
          <a class="btn btn--primary" href="${KONTAKT.telefonHref}">Probefahrt vereinbaren</a>
          <a class="btn btn--ghost" href="mailto:${KONTAKT.mail}?subject=${encodeURIComponent('Anfrage: ' + c.title)}">Per E-Mail anfragen</a>
        </div>
        <p class="disclosure">
          <sup>*</sup> Repräsentatives Finanzierungsbeispiel: Anzahlung ${Math.round(FINANZIERUNG.anzahlungAnteil * 100)} %,
          Laufzeit ${FINANZIERUNG.laufzeit} Monate, effektiver Jahreszins ${nf.format(FINANZIERUNG.zinsEff * 100)} %,
          gebundener Sollzins entsprechend. Bonität vorausgesetzt, Angebot freibleibend.<br>
          Angaben zu Verbrauch und CO₂-Emissionen nach WLTP. Weitere Informationen zum offiziellen
          Kraftstoffverbrauch und zu den CO₂-Emissionen neuer Personenkraftwagen sind dem „Leitfaden über den
          Kraftstoffverbrauch, die CO₂-Emissionen und den Stromverbrauch neuer Personenkraftwagen“ zu entnehmen.
        </p>
      </div>`;

    el.dialog.querySelector('[data-close]').addEventListener('click', () => el.dialog.close());
    el.dialog.showModal();
  }

  /* Klick auf den Hintergrund schließt den Dialog. */
  if (el.dialog) {
    el.dialog.addEventListener('click', (e) => { if (e.target === el.dialog) el.dialog.close(); });
  }

  /* Mobile Navigation */
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    links.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') { links.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }
    });
  }

  const yearNode = document.getElementById('year');
  if (yearNode) yearNode.textContent = new Date().getFullYear();

  setupFilters();
  render();
})();

/* ============================================================
   Queen of Retreats — Booking Flow JS
   v1.0 · 2026
   ============================================================ */

'use strict';

/* --- State --------------------------------------------------- */
const state = {
  currentStep: 1,
  totalSteps: 8,
  selectedDate: null,
  selectedRoom: null,
  guestCount: 1,
  guestType: 'solo',       // 'solo' | 'couple'
  paymentOption: 'deposit', // 'deposit' | 'full'
};

const RETREAT_DATES = [
  { id: 'd1', label: '7–14 June 2026',      nights: 7, spaces: 3,  status: 'limited',   priceFrom: 2195 },
  { id: 'd2', label: '21–28 June 2026',     nights: 7, spaces: 8,  status: 'available', priceFrom: 2195 },
  { id: 'd3', label: '5–12 July 2026',      nights: 7, spaces: 0,  status: 'soldout',   priceFrom: 2195 },
  { id: 'd4', label: '19–26 July 2026',     nights: 7, spaces: 6,  status: 'available', priceFrom: 2195 },
  { id: 'd5', label: '2–9 August 2026',     nights: 7, spaces: 2,  status: 'limited',   priceFrom: 2895 },
  { id: 'd6', label: '16–23 August 2026',   nights: 7, spaces: 10, status: 'available', priceFrom: 2195 },
];

const ROOMS = [
  { id: 'r1', name: 'Shared Garden Room',   type: 'Twin share · Garden view',     price: 2195, badge: null },
  { id: 'r2', name: 'Private Valley Room',  type: 'Double or twin · Valley view', price: 2895, badge: 'Most popular' },
  { id: 'r3', name: 'Quinta Suite',         type: 'Junior suite · Private terrace', price: 3750, badge: 'Premium' },
];

/* --- Init ---------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  // Clear hash so browser doesn't auto-scroll to step anchor
  history.replaceState(null, '', window.location.pathname);

  // Handle URL hash on load
  const hash = window.location.hash;
  const stepMatch = hash.match(/^#step-(\d)$/);
  if (stepMatch) {
    const n = parseInt(stepMatch[1]);
    if (n >= 1 && n <= 8) renderStep(n, false);
  } else {
    renderStep(1, false);
  }

  initNavButtons();
  initDateSelection();
  initRoomSelection();
  initGuestStepper();
  initGuestType();
  initPaymentToggle();
  initViewToggle();
  initCalendar();
  initAccordions();
  initTabs();
  initConditionalFields();
  initCardFormatting();
});

/* --- Step Navigation ----------------------------------------- */
function renderStep(n, animate = true) {
  const panels = document.querySelectorAll('.step-panel');
  panels.forEach(p => p.classList.remove('is-active'));

  const target = document.getElementById(`step-${n}`);
  if (!target) return;
  target.classList.add('is-active');

  state.currentStep = n;
  updateProgressBar(n);
  updateSidebar();
  updateNavButtons(n);

  // Sidebar visibility: hidden on step 1 and step 8
  const sidebar = document.getElementById('booking-sidebar');
  if (sidebar) {
    sidebar.classList.toggle('hidden', n === 1 || n === 8);
  }

  // Layout swap: step 1 and 8 are full-width
  const layout = document.getElementById('booking-layout');
  if (layout) {
    if (n === 1 || n === 8) {
      layout.classList.remove('booking-layout');
      layout.classList.add('booking-layout--full');
    } else {
      layout.classList.add('booking-layout');
      layout.classList.remove('booking-layout--full');
    }
  }

  // Don't scroll to top or alter hash (preserves scroll position on step change)
  history.replaceState(null, '', `#step-${n}`);
}

function updateProgressBar(current) {
  const steps = document.querySelectorAll('.progress-step[data-step]');
  steps.forEach(step => {
    const n = parseInt(step.dataset.step);
    step.classList.remove('is-done', 'is-active');
    if (n < current) step.classList.add('is-done');
    if (n === current) step.classList.add('is-active');

    const dot = step.querySelector('.progress-step__dot');
    if (dot) {
      dot.textContent = n < current ? '✓' : n;
    }
  });
}

function updateNavButtons(n) {
  const backBtn = document.getElementById('nav-back');
  const continueBtn = document.getElementById('nav-continue');
  const stepInfo = document.getElementById('nav-step-info');

  if (backBtn) backBtn.style.visibility = n === 1 ? 'hidden' : 'visible';
  if (stepInfo) stepInfo.textContent = `${n} of ${state.totalSteps}`;

  if (continueBtn) {
    if (n === 7) {
      continueBtn.textContent = 'Complete Booking';
      continueBtn.classList.add('btn--ink');
      continueBtn.classList.remove('btn--primary');
    } else if (n === 8) {
      continueBtn.classList.add('hidden');
    } else {
      continueBtn.textContent = 'Continue';
      continueBtn.classList.remove('btn--ink');
      continueBtn.classList.add('btn--primary');
      continueBtn.classList.remove('hidden');
    }
  }
}

function initNavButtons() {
  const backBtn = document.getElementById('nav-back');
  const continueBtn = document.getElementById('nav-continue');

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (state.currentStep > 1) renderStep(state.currentStep - 1);
    });
  }
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      if (!validateStep(state.currentStep)) return;
      if (state.currentStep < state.totalSteps) renderStep(state.currentStep + 1);
    });
  }

  // Step click on progress bar
  document.querySelectorAll('.progress-step[data-step]').forEach(step => {
    step.addEventListener('click', () => {
      const n = parseInt(step.dataset.step);
      if (n < state.currentStep) renderStep(n);
    });
  });
}

/* --- Validation --------------------------------------------- */
function validateStep(n) {
  switch (n) {
    case 1:
      if (!state.selectedDate) {
        showError('Please select a date to continue.');
        return false;
      }
      return true;
    case 2:
      if (!state.selectedRoom) {
        showError('Please select a room to continue.');
        return false;
      }
      return true;
    case 4: {
      const cb1 = document.getElementById('agree-policies');
      const cb2 = document.getElementById('agree-tcs');
      if (!cb1?.checked || !cb2?.checked) {
        showError('Please read and accept the policies to continue.');
        return false;
      }
      return true;
    }
    case 5: {
      const req = document.querySelectorAll('#step-5 [required]');
      let valid = true;
      req.forEach(field => {
        if (!field.value.trim()) {
          field.style.borderColor = 'var(--error)';
          valid = false;
        } else {
          field.style.borderColor = '';
        }
      });
      if (!valid) {
        showError('Please fill in all required fields.');
        return false;
      }
      return true;
    }
    default:
      return true;
  }
}

function showError(msg) {
  const existing = document.querySelector('.js-error-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'js-error-toast';
  toast.style.cssText = `
    position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
    background: var(--error-bg); color: var(--error); border: 1px solid var(--error);
    border-radius: var(--r-md); padding: var(--s3) var(--s6);
    font-size: var(--t-sm); font-weight: 500; z-index: 999;
    box-shadow: var(--shadow-md); white-space: nowrap;
  `;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

/* --- Date Selection ----------------------------------------- */
function initDateSelection() {
  // List view items
  document.querySelectorAll('.date-list-item[data-date-id]').forEach(item => {
    if (item.dataset.status === 'soldout') return;
    item.addEventListener('click', () => selectDate(item.dataset.dateId));
  });
}

function selectDate(id) {
  const date = RETREAT_DATES.find(d => d.id === id);
  if (!date || date.status === 'soldout') return;

  state.selectedDate = date;

  // Update list items
  document.querySelectorAll('.date-list-item[data-date-id]').forEach(el => {
    el.classList.toggle('is-selected', el.dataset.dateId === id);
  });

  // Update calendar
  document.querySelectorAll('.cal-day[data-date-id]').forEach(el => {
    el.classList.toggle('cal-day--selected', el.dataset.dateId === id);
    if (el.dataset.dateId === id) {
      el.classList.remove('cal-day--available', 'cal-day--limited');
    } else {
      restoreCalDay(el);
    }
  });

  updateSidebar();
}

function restoreCalDay(el) {
  const id = el.dataset.dateId;
  if (!id) return;
  const date = RETREAT_DATES.find(d => d.id === id);
  if (!date) return;
  el.className = `cal-day cal-day--${date.status}`;
}

/* --- Room Selection ----------------------------------------- */
function initRoomSelection() {
  document.querySelectorAll('.room-card[data-room-id]').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.roomId;
      state.selectedRoom = ROOMS.find(r => r.id === id) || null;
      document.querySelectorAll('.room-card[data-room-id]').forEach(c => {
        c.classList.toggle('is-selected', c.dataset.roomId === id);
      });
      updateSidebar();
    });
  });
}

/* --- Guest Stepper ------------------------------------------ */
function initGuestStepper() {
  const minus = document.getElementById('guest-minus');
  const plus  = document.getElementById('guest-plus');
  const val   = document.getElementById('guest-count');

  if (!minus || !plus || !val) return;

  minus.addEventListener('click', () => {
    if (state.guestCount > 1) {
      state.guestCount--;
      val.textContent = state.guestCount;
      minus.disabled = state.guestCount <= 1;
      updateSidebar();
    }
  });
  plus.addEventListener('click', () => {
    if (state.guestCount < 12) {
      state.guestCount++;
      val.textContent = state.guestCount;
      minus.disabled = false;
      updateSidebar();
    }
  });
}

/* --- Guest Type (solo/couple) ------------------------------- */
function initGuestType() {
  document.querySelectorAll('.guest-type-card[data-type]').forEach(card => {
    card.addEventListener('click', () => {
      state.guestType = card.dataset.type;
      document.querySelectorAll('.guest-type-card[data-type]').forEach(c => {
        c.classList.toggle('is-active', c.dataset.type === state.guestType);
      });
      state.guestCount = state.guestType === 'couple' ? 2 : 1;
      const val = document.getElementById('guest-count');
      if (val) val.textContent = state.guestCount;
      updateSidebar();
    });
  });
}

/* --- Payment Toggle ----------------------------------------- */
function initPaymentToggle() {
  document.querySelectorAll('.payment-option[data-payment]').forEach(opt => {
    opt.addEventListener('click', () => {
      state.paymentOption = opt.dataset.payment;
      document.querySelectorAll('.payment-option[data-payment]').forEach(o => {
        o.classList.toggle('is-active', o.dataset.payment === state.paymentOption);
      });
      updateSidebar();
    });
  });
}

/* --- View Toggle (Calendar / List) -------------------------- */
function initViewToggle() {
  const buttons  = document.querySelectorAll('.view-toggle__btn');
  const calView  = document.getElementById('cal-view');
  const listView = document.getElementById('list-view');
  if (!calView || !listView) return;

  const arrowsEl = document.getElementById('cal-arrows');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const view = btn.dataset.view;
      calView.classList.toggle('hidden', view !== 'calendar');
      listView.classList.toggle('hidden', view !== 'list');
      if (arrowsEl) arrowsEl.style.display = view === 'calendar' ? 'flex' : 'none';
    });
  });
}

/* --- Calendar ----------------------------------------------- */
function initCalendar() {
  renderCalendarMonth('cal-june', 2026, 5);
  renderCalendarMonth('cal-july', 2026, 6);
  renderCalendarMonth('cal-aug',  2026, 7);
  renderCalendarMonth('cal-sep',  2026, 8);
  renderCalendarMonth('cal-oct',  2026, 9);
  renderCalendarMonth('cal-nov',  2026, 10);
  renderCalendarMonth('cal-dec',  2026, 11);
  renderCalendarMonth('cal-jan27', 2027, 0);
  renderCalendarMonth('cal-feb27', 2027, 1);
  initCalCarousel();
}

function initCalCarousel() {
  const viewport  = document.querySelector('.cal-months-viewport');
  const track     = document.querySelector('.cal-months');
  const prevBtn   = document.getElementById('cal-prev');
  const nextBtn   = document.getElementById('cal-next');
  const arrowsEl  = document.getElementById('cal-arrows');
  if (!viewport || !track || !prevBtn || !nextBtn) return;

  const GAP     = 20; // --s5
  const VISIBLE = 3;
  let offset    = 0;

  function getCards() { return Array.from(track.querySelectorAll('.calendar')); }

  function setWidths() {
    const vpW       = viewport.offsetWidth;
    const cardWidth = (vpW - (VISIBLE - 1) * GAP) / VISIBLE;
    getCards().forEach(c => { c.style.width = cardWidth + 'px'; });
    applyTransform();
  }

  function applyTransform() {
    const cards = getCards();
    if (!cards.length) return;
    const step = cards[0].offsetWidth + GAP;
    track.style.transform = `translateX(-${offset * step}px)`;
    prevBtn.disabled = offset === 0;
    nextBtn.disabled = offset >= cards.length - VISIBLE;
    // Hide arrows if all months fit
    if (arrowsEl) arrowsEl.style.display = cards.length <= VISIBLE ? 'none' : 'flex';
  }

  prevBtn.addEventListener('click', () => { if (offset > 0) { offset--; applyTransform(); } });
  nextBtn.addEventListener('click', () => {
    const cards = getCards();
    if (offset < cards.length - VISIBLE) { offset++; applyTransform(); }
  });

  /* ── Drag (live tracking, snap to nearest on release) ── */
  let isDragging = false;
  let dragStartX = 0;
  let dragDelta  = 0;

  function getStep() {
    const cards = getCards();
    return cards.length ? cards[0].offsetWidth + GAP : 0;
  }

  viewport.addEventListener('pointerdown', e => {
    isDragging = true;
    dragStartX = e.clientX;
    dragDelta  = 0;
    track.style.transition = 'none';
    viewport.setPointerCapture(e.pointerId);
    viewport.style.cursor = 'grabbing';
  });

  viewport.addEventListener('pointermove', e => {
    if (!isDragging) return;
    dragDelta = e.clientX - dragStartX;
    const base = -(offset * getStep());
    track.style.transform = `translateX(${base + dragDelta}px)`;
  });

  viewport.addEventListener('pointerup', () => {
    if (!isDragging) return;
    isDragging = false;
    viewport.style.cursor = '';
    track.style.transition = '';

    const step      = getStep();
    const threshold = step * 0.2;
    const cards     = getCards();
    const maxOffset = cards.length - VISIBLE;

    if (dragDelta < -threshold && offset < maxOffset) offset++;
    else if (dragDelta > threshold && offset > 0) offset--;

    applyTransform();
  });

  viewport.addEventListener('pointercancel', () => {
    if (!isDragging) return;
    isDragging = false;
    viewport.style.cursor = '';
    track.style.transition = '';
    applyTransform();
  });

  // Prevent click-through on intentional drags
  viewport.addEventListener('click', e => {
    if (Math.abs(dragDelta) > 5) e.stopPropagation();
  }, true);

  setWidths();
  window.addEventListener('resize', setWidths);
}

function renderCalendarMonth(containerId, year, month) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Map retreat dates to day ranges
  const dayStates = {}; // day number → { status, dateId }
  // June retreat blocks: 7-14, 21-28
  // July retreat blocks: 5-12, 19-26
  if (month === 5) { // June
    for (let d = 7; d <= 14; d++)  dayStates[d] = { status: 'limited',   id: 'd1' };
    for (let d = 21; d <= 28; d++) dayStates[d] = { status: 'available', id: 'd2' };
  }
  if (month === 6) { // July
    for (let d = 5; d <= 12; d++)  dayStates[d] = { status: 'soldout',   id: 'd3' };
    for (let d = 19; d <= 26; d++) dayStates[d] = { status: 'available', id: 'd4' };
  }
  if (month === 7) { // August
    for (let d = 2; d <= 9;   d++) dayStates[d] = { status: 'limited',   id: 'd5' };
    for (let d = 16; d <= 23; d++) dayStates[d] = { status: 'available', id: 'd6' };
  }
  if (month === 8) { // September
    for (let d = 6; d <= 13;  d++) dayStates[d] = { status: 'available', id: 'd7' };
    for (let d = 20; d <= 27; d++) dayStates[d] = { status: 'limited',   id: 'd8' };
  }
  if (month === 9) { // October
    for (let d = 4; d <= 11;  d++) dayStates[d] = { status: 'available', id: 'd9' };
    for (let d = 18; d <= 25; d++) dayStates[d] = { status: 'soldout',   id: 'd10' };
  }
  if (month === 10) { // November
    for (let d = 1; d <= 8;   d++) dayStates[d] = { status: 'available', id: 'd11' };
    for (let d = 15; d <= 22; d++) dayStates[d] = { status: 'limited',   id: 'd12' };
  }
  if (month === 11) { // December
    for (let d = 6; d <= 13;  d++) dayStates[d] = { status: 'available', id: 'd13' };
    for (let d = 20; d <= 27; d++) dayStates[d] = { status: 'limited',   id: 'd14' };
  }
  if (year === 2027 && month === 0) { // January 2027
    for (let d = 3; d <= 10;  d++) dayStates[d] = { status: 'available', id: 'd15' };
    for (let d = 17; d <= 24; d++) dayStates[d] = { status: 'available', id: 'd16' };
  }
  if (year === 2027 && month === 1) { // February 2027
    for (let d = 7; d <= 14;  d++) dayStates[d] = { status: 'limited',   id: 'd17' };
    for (let d = 21; d <= 28; d++) dayStates[d] = { status: 'available', id: 'd18' };
  }

  const grid = container.querySelector('.calendar__grid');
  if (!grid) return;

  // Clear
  grid.innerHTML = '';

  // Empty cells for offset (Monday start)
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  for (let i = 0; i < startOffset; i++) {
    const empty = document.createElement('div');
    empty.className = 'cal-day cal-day--empty';
    grid.appendChild(empty);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement('div');
    const state = dayStates[d];
    cell.className = `cal-day${state ? ` cal-day--${state.status}` : ''}`;
    cell.textContent = d;
    if (state) {
      cell.dataset.dateId = state.id;
      if (state.status !== 'soldout') {
        cell.addEventListener('click', () => selectDate(state.id));
      }
    }
    grid.appendChild(cell);
  }
}

/* --- Sidebar Update ----------------------------------------- */
function updateSidebar() {
  // Date line
  const dateVal = document.getElementById('sidebar-date');
  const navDate = document.getElementById('nav-date');
  if (state.selectedDate) {
    if (dateVal) { dateVal.textContent = state.selectedDate.label; dateVal.classList.remove('placeholder'); }
    if (navDate) { navDate.textContent = state.selectedDate.label; navDate.classList.remove('placeholder'); }
  } else {
    if (dateVal) { dateVal.textContent = 'Select dates'; dateVal.classList.add('placeholder'); }
    if (navDate) { navDate.textContent = 'Select dates'; navDate.classList.add('placeholder'); }
  }

  // Room line
  const roomVal = document.getElementById('sidebar-room');
  const navRoom = document.getElementById('nav-room');
  if (state.selectedRoom) {
    if (roomVal) { roomVal.textContent = state.selectedRoom.name; roomVal.classList.remove('placeholder'); }
    if (navRoom) { navRoom.textContent = state.selectedRoom.name; navRoom.classList.remove('placeholder'); }
  } else {
    if (roomVal) { roomVal.textContent = 'Select room'; roomVal.classList.add('placeholder'); }
    if (navRoom) { navRoom.textContent = 'Select room'; navRoom.classList.add('placeholder'); }
  }

  // Guests line
  const guestVal = document.getElementById('sidebar-guests');
  const navGuests = document.getElementById('nav-guests');
  const guestLabel = state.guestCount === 1 ? '1 guest' : `${state.guestCount} guests`;
  if (guestVal) { guestVal.textContent = guestLabel; guestVal.classList.remove('placeholder'); }
  if (navGuests) { navGuests.textContent = guestLabel; }

  // Price breakdown
  updatePriceBreakdown();
}

function updatePriceBreakdown() {
  if (!state.selectedRoom) return;

  const base = state.selectedRoom.price;
  const count = state.guestCount;
  const total = base * count;
  const deposit = Math.ceil(total * 0.25);
  const balance = total - deposit;

  // Update sidebar + nav total
  const totalEl = document.getElementById('sidebar-total');
  if (totalEl) totalEl.textContent = `£${total.toLocaleString()}`;
  const navTotal = document.getElementById('nav-total');
  if (navTotal) navTotal.textContent = `£${total.toLocaleString()}`;

  const perEl = document.getElementById('sidebar-per');
  if (perEl) perEl.textContent = `per person`;

  // Update summary step price table
  const roomLineEl = document.getElementById('price-room-line');
  if (roomLineEl) roomLineEl.textContent = `£${base.toLocaleString()} × ${count} guest${count > 1 ? 's' : ''}`;

  const subtotalEl = document.getElementById('price-subtotal');
  if (subtotalEl) subtotalEl.textContent = `£${total.toLocaleString()}`;

  const totalSumEl = document.getElementById('price-total');
  if (totalSumEl) totalSumEl.textContent = `£${total.toLocaleString()}`;

  const depositEl = document.getElementById('price-deposit');
  if (depositEl) depositEl.textContent = `£${deposit.toLocaleString()}`;

  const balanceEl = document.getElementById('price-balance');
  if (balanceEl) balanceEl.textContent = `£${balance.toLocaleString()}`;

  // Payment step
  const payDepositEl = document.getElementById('pay-deposit-amount');
  if (payDepositEl) payDepositEl.textContent = `£${deposit.toLocaleString()}`;

  const payFullEl = document.getElementById('pay-full-amount');
  if (payFullEl) payFullEl.textContent = `£${total.toLocaleString()}`;

  const payNowEl = document.getElementById('pay-now-label');
  if (payNowEl) {
    const amount = state.paymentOption === 'deposit' ? deposit : total;
    payNowEl.textContent = `Pay £${amount.toLocaleString()} & Confirm Booking`;
  }

  const payBalanceEl = document.getElementById('pay-balance-note');
  if (payBalanceEl && state.paymentOption === 'deposit') {
    const dateStr = state.selectedDate ? `60 days before your arrival` : '60 days before arrival';
    payBalanceEl.textContent = `Balance of £${balance.toLocaleString()} due ${dateStr}.`;
  }
}

/* --- Accordions --------------------------------------------- */
function initAccordions() {
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const body = trigger.nextElementSibling;
      const isOpen = body?.classList.contains('is-open');
      trigger.classList.toggle('is-open', !isOpen);
      body?.classList.toggle('is-open', !isOpen);
    });
  });
}

/* --- Tabs ---------------------------------------------------- */
function initTabs() {
  document.querySelectorAll('.tabs__tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabList = tab.closest('.tabs');
      const target  = tab.dataset.tab;
      const scope   = tab.closest('.tabs-scope') || document;

      tabList.querySelectorAll('.tabs__tab').forEach(t => t.classList.remove('is-active'));
      tab.classList.add('is-active');

      scope.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.toggle('is-active', panel.dataset.panel === target);
      });
    });
  });
}

/* --- Conditional Fields ------------------------------------- */
function initConditionalFields() {
  document.querySelectorAll('[data-reveals]').forEach(trigger => {
    const targetId = trigger.dataset.reveals;
    const target   = document.getElementById(targetId);
    if (!target) return;
    trigger.addEventListener('change', () => {
      target.classList.toggle('hidden', !trigger.checked);
    });
  });
}

/* --- Card Formatting --------------------------------------- */
function initCardFormatting() {
  const cardNum = document.getElementById('card-number');
  if (cardNum) {
    cardNum.addEventListener('input', e => {
      let val = e.target.value.replace(/\D/g, '').slice(0, 16);
      e.target.value = val.match(/.{1,4}/g)?.join(' ') ?? val;
    });
  }

  const expiry = document.getElementById('card-expiry');
  if (expiry) {
    expiry.addEventListener('input', e => {
      let val = e.target.value.replace(/\D/g, '').slice(0, 4);
      if (val.length >= 3) val = val.slice(0, 2) + ' / ' + val.slice(2);
      e.target.value = val;
    });
  }
}

/* --- Edit links --------------------------------------------- */
document.addEventListener('click', e => {
  const target = e.target.closest('[data-goto-step]');
  if (target) {
    const step = parseInt(target.dataset.gotoStep);
    renderStep(step);
  }
});

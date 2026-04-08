/* ============================================================
   Queen of Retreats — Enquiry Flow JS
   v1.0 · 2026
   ============================================================ */

'use strict';

/* --- State --------------------------------------------------- */
const state = {
  currentStep: 1,
  totalSteps: 6,
  selectedDate: null,
  selectedRoom: null,
  guestCount: 1,
  guestType: 'solo',
};

const RETREAT_DATES = [
  { id: 'd1',  label: '7–14 June 2026',          nights: 7, spaces: 3,  status: 'limited',   priceFrom: 2195 },
  { id: 'd2',  label: '21–28 June 2026',          nights: 7, spaces: 8,  status: 'available', priceFrom: 2195 },
  { id: 'd3',  label: '5–12 July 2026',           nights: 7, spaces: 0,  status: 'soldout',   priceFrom: 2195 },
  { id: 'd4',  label: '19–26 July 2026',          nights: 7, spaces: 6,  status: 'available', priceFrom: 2195 },
  { id: 'd5',  label: '2–9 August 2026',          nights: 7, spaces: 2,  status: 'limited',   priceFrom: 2895 },
  { id: 'd6',  label: '16–23 August 2026',        nights: 7, spaces: 10, status: 'available', priceFrom: 2195 },
  { id: 'd7',  label: '6–13 September 2026',      nights: 7, spaces: 8,  status: 'available', priceFrom: 2195 },
  { id: 'd8',  label: '20–27 September 2026',     nights: 7, spaces: 3,  status: 'limited',   priceFrom: 2195 },
  { id: 'd9',  label: '4–11 October 2026',        nights: 7, spaces: 6,  status: 'available', priceFrom: 2195 },
  { id: 'd10', label: '18–25 October 2026',       nights: 7, spaces: 0,  status: 'soldout',   priceFrom: 2195 },
  { id: 'd11', label: '1–8 November 2026',        nights: 7, spaces: 10, status: 'available', priceFrom: 2195 },
  { id: 'd12', label: '15–22 November 2026',      nights: 7, spaces: 4,  status: 'limited',   priceFrom: 2195 },
  { id: 'd13', label: '6–13 December 2026',       nights: 7, spaces: 8,  status: 'available', priceFrom: 2195 },
  { id: 'd14', label: '20–27 December 2026',      nights: 7, spaces: 2,  status: 'limited',   priceFrom: 2195 },
  { id: 'd15', label: '3–10 January 2027',        nights: 7, spaces: 12, status: 'available', priceFrom: 2195 },
  { id: 'd16', label: '17–24 January 2027',       nights: 7, spaces: 8,  status: 'available', priceFrom: 2195 },
  { id: 'd17', label: '7–14 February 2027',       nights: 7, spaces: 3,  status: 'limited',   priceFrom: 2195 },
  { id: 'd18', label: '21–28 February 2027',      nights: 7, spaces: 10, status: 'available', priceFrom: 2195 },
];

const ROOMS = [
  { id: 'r1', name: 'Shared Garden Room',   type: 'Twin share · Garden view',     price: 2195, badge: null },
  { id: 'r2', name: 'Private Valley Room',  type: 'Double or twin · Valley view', price: 2895, badge: 'Most popular' },
  { id: 'r3', name: 'Quinta Suite',         type: 'Junior suite · Private terrace', price: 3750, badge: 'Premium' },
];

/* --- Init ---------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  history.replaceState(null, '', window.location.pathname);

  const hash = window.location.hash;
  const stepMatch = hash.match(/^#step-(\d)$/);
  if (stepMatch) {
    const n = parseInt(stepMatch[1]);
    if (n >= 1 && n <= 6) renderStep(n, false);
  } else {
    renderStep(1, false);
  }

  initNavButtons();
  initDateSelection();
  initRoomSelection();
  initGuestStepper();
  initGuestType();
  initViewToggle();
  initCalendar();
  initAccordions();
  initTabs();
  initConditionalFields();
});

/* --- Step Navigation ----------------------------------------- */
function renderStep(n, animate = true) {
  const panels = document.querySelectorAll('.step-panel');
  panels.forEach(p => p.classList.remove('is-active'));

  const target = document.getElementById(`step-${n}`);
  if (!target) return;
  target.classList.add('is-active');

  state.currentStep = n;
  window.scrollTo(0, 0);
  updateProgressBar(n);
  updateSidebar();
  updateNavButtons(n);

  // Enquiry nav summary: hide on step 6 (submitted), show on all others
  const bookingNav = document.querySelector('.booking-nav');
  if (bookingNav) {
    bookingNav.classList.toggle('booking-nav--no-summary', n === 6);
  }

  // Sidebar visibility: hidden on step 1 and step 6
  const sidebar = document.getElementById('booking-sidebar');
  if (sidebar) {
    sidebar.classList.toggle('hidden', n === 1 || n === 6);
  }

  // Layout swap: step 1 and 6 are full-width
  const layout = document.getElementById('booking-layout');
  if (layout) {
    if (n === 1 || n === 6) {
      layout.classList.remove('booking-layout');
      layout.classList.add('booking-layout--full');
    } else {
      layout.classList.add('booking-layout');
      layout.classList.remove('booking-layout--full');
    }
  }

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
    if (n === 5) {
      continueBtn.textContent = 'SUBMIT ENQUIRY';
      continueBtn.classList.add('btn--ink');
      continueBtn.classList.remove('btn--primary');
      continueBtn.classList.remove('hidden');
    } else if (n === 6) {
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
      const req = document.querySelectorAll('#step-4 [required]');
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
  document.querySelectorAll('.date-list-item[data-date-id]').forEach(item => {
    if (item.dataset.status === 'soldout') return;
    item.addEventListener('click', () => selectDate(item.dataset.dateId));
  });
}

function selectDate(id) {
  const date = RETREAT_DATES.find(d => d.id === id);
  if (!date || date.status === 'soldout') return;

  state.selectedDate = date;

  document.querySelectorAll('.date-list-item[data-date-id]').forEach(el => {
    el.classList.toggle('is-selected', el.dataset.dateId === id);
  });

  document.querySelectorAll('.cal-day[data-date-id]').forEach(el => {
    el.classList.toggle('cal-day--selected', el.dataset.dateId === id);
    if (el.dataset.dateId === id) {
      el.classList.remove('cal-day--available', 'cal-day--limited');
    } else {
      restoreCalDay(el);
    }
  });

  // Update selected date card in list view
  const panel = document.getElementById('date-selected-panel');
  const label = document.getElementById('date-selected-label');
  if (panel && label) {
    label.textContent = date.label;
    panel.classList.remove('is-hidden');
  }

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
      if (state.guestType === 'couple') {
        state.guestCount = 2;
      } else if (state.guestType === 'group') {
        const sel = document.getElementById('group-guest-count');
        state.guestCount = sel ? parseInt(sel.value) : 3;
      } else {
        state.guestCount = 1;
      }
      const val = document.getElementById('guest-count');
      if (val) val.textContent = state.guestCount;
      updateSidebar();
    });
  });

  // Group dropdown — activate card and update count when selection changes
  const groupSelect = document.getElementById('group-guest-count');
  if (groupSelect) {
    groupSelect.addEventListener('change', () => {
      state.guestType = 'group';
      document.querySelectorAll('.guest-type-card[data-type]').forEach(c => {
        c.classList.toggle('is-active', c.dataset.type === 'group');
      });
      state.guestCount = parseInt(groupSelect.value);
      updateSidebar();
    });
  }
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

  const GAP     = 20;
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
    if (arrowsEl) arrowsEl.style.display = cards.length <= VISIBLE ? 'none' : 'flex';
  }

  prevBtn.addEventListener('click', () => { if (offset > 0) { offset--; applyTransform(); } });
  nextBtn.addEventListener('click', () => {
    const cards = getCards();
    if (offset < cards.length - VISIBLE) { offset++; applyTransform(); }
  });

  let isDragging  = false;
  let pointerDown = false;
  let dragStartX  = 0;
  let dragDelta   = 0;
  let capturedId  = null;
  const DRAG_THRESHOLD = 6;

  function getStep() {
    const cards = getCards();
    return cards.length ? cards[0].offsetWidth + GAP : 0;
  }

  viewport.addEventListener('pointerdown', e => {
    pointerDown = true;
    isDragging  = false;
    dragStartX  = e.clientX;
    dragDelta   = 0;
    capturedId  = e.pointerId;
    track.style.transition = 'none';
  });

  viewport.addEventListener('pointermove', e => {
    if (!pointerDown) return;
    dragDelta = e.clientX - dragStartX;
    if (!isDragging && Math.abs(dragDelta) > DRAG_THRESHOLD) {
      isDragging = true;
      viewport.setPointerCapture(capturedId);
      viewport.style.cursor = 'grabbing';
    }
    if (!isDragging) return;
    const base = -(offset * getStep());
    track.style.transform = `translateX(${base + dragDelta}px)`;
  });

  viewport.addEventListener('pointerup', () => {
    pointerDown = false;
    viewport.style.cursor = '';
    track.style.transition = '';
    if (!isDragging) return;
    isDragging = false;

    const step      = getStep();
    const threshold = step * 0.2;
    const cards     = getCards();
    const maxOffset = cards.length - VISIBLE;

    if (dragDelta < -threshold && offset < maxOffset) offset++;
    else if (dragDelta > threshold && offset > 0) offset--;

    applyTransform();
  });

  viewport.addEventListener('pointercancel', () => {
    pointerDown = false;
    isDragging  = false;
    viewport.style.cursor = '';
    track.style.transition = '';
    applyTransform();
  });

  viewport.addEventListener('click', e => {
    if (Math.abs(dragDelta) > DRAG_THRESHOLD) e.stopPropagation();
  }, true);

  setWidths();
  window.addEventListener('resize', setWidths);
}

function renderCalendarMonth(containerId, year, month) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dayStates = {};
  if (month === 5) {
    for (let d = 7; d <= 14; d++)  dayStates[d] = { status: 'limited',   id: 'd1' };
    for (let d = 21; d <= 28; d++) dayStates[d] = { status: 'available', id: 'd2' };
  }
  if (month === 6) {
    for (let d = 5; d <= 12; d++)  dayStates[d] = { status: 'soldout',   id: 'd3' };
    for (let d = 19; d <= 26; d++) dayStates[d] = { status: 'available', id: 'd4' };
  }
  if (month === 7) {
    for (let d = 2; d <= 9;   d++) dayStates[d] = { status: 'limited',   id: 'd5' };
    for (let d = 16; d <= 23; d++) dayStates[d] = { status: 'available', id: 'd6' };
  }
  if (month === 8) {
    for (let d = 6; d <= 13;  d++) dayStates[d] = { status: 'available', id: 'd7' };
    for (let d = 20; d <= 27; d++) dayStates[d] = { status: 'limited',   id: 'd8' };
  }
  if (month === 9) {
    for (let d = 4; d <= 11;  d++) dayStates[d] = { status: 'available', id: 'd9' };
    for (let d = 18; d <= 25; d++) dayStates[d] = { status: 'soldout',   id: 'd10' };
  }
  if (month === 10) {
    for (let d = 1; d <= 8;   d++) dayStates[d] = { status: 'available', id: 'd11' };
    for (let d = 15; d <= 22; d++) dayStates[d] = { status: 'limited',   id: 'd12' };
  }
  if (month === 11) {
    for (let d = 6; d <= 13;  d++) dayStates[d] = { status: 'available', id: 'd13' };
    for (let d = 20; d <= 27; d++) dayStates[d] = { status: 'limited',   id: 'd14' };
  }
  if (year === 2027 && month === 0) {
    for (let d = 3; d <= 10;  d++) dayStates[d] = { status: 'available', id: 'd15' };
    for (let d = 17; d <= 24; d++) dayStates[d] = { status: 'available', id: 'd16' };
  }
  if (year === 2027 && month === 1) {
    for (let d = 7; d <= 14;  d++) dayStates[d] = { status: 'limited',   id: 'd17' };
    for (let d = 21; d <= 28; d++) dayStates[d] = { status: 'available', id: 'd18' };
  }

  const grid = container.querySelector('.calendar__grid');
  if (!grid) return;

  grid.innerHTML = '';

  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  for (let i = 0; i < startOffset; i++) {
    const empty = document.createElement('div');
    empty.className = 'cal-day cal-day--empty';
    grid.appendChild(empty);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement('div');
    const st = dayStates[d];
    cell.className = `cal-day${st ? ` cal-day--${st.status}` : ''}`;
    cell.textContent = d;
    if (st) {
      cell.dataset.dateId = st.id;
      if (st.status !== 'soldout') {
        cell.addEventListener('click', () => selectDate(st.id));
      }
    }
    grid.appendChild(cell);
  }
}

/* --- Sidebar Update ----------------------------------------- */
function updateSidebar() {
  const dateVal = document.getElementById('sidebar-date');
  const navDate = document.getElementById('nav-date');
  if (state.selectedDate) {
    if (dateVal) { dateVal.textContent = state.selectedDate.label; dateVal.classList.remove('placeholder'); }
    if (navDate) { navDate.textContent = state.selectedDate.label; navDate.classList.remove('placeholder'); }
  } else {
    if (dateVal) { dateVal.textContent = 'Select dates'; dateVal.classList.add('placeholder'); }
    if (navDate) { navDate.textContent = 'Select dates'; navDate.classList.add('placeholder'); }
  }

  const roomVal = document.getElementById('sidebar-room');
  const navRoom = document.getElementById('nav-room');
  if (state.selectedRoom) {
    if (roomVal) { roomVal.textContent = state.selectedRoom.name; roomVal.classList.remove('placeholder'); }
    if (navRoom) { navRoom.textContent = state.selectedRoom.name; navRoom.classList.remove('placeholder'); }
  } else {
    if (roomVal) { roomVal.textContent = 'Select room'; roomVal.classList.add('placeholder'); }
    if (navRoom) { navRoom.textContent = 'Select room'; navRoom.classList.add('placeholder'); }
  }

  const guestVal = document.getElementById('sidebar-guests');
  const navGuests = document.getElementById('nav-guests');
  const guestLabel = state.guestCount === 1 ? '1 guest' : `${state.guestCount} guests`;
  if (guestVal) { guestVal.textContent = guestLabel; guestVal.classList.remove('placeholder'); }
  if (navGuests) { navGuests.textContent = guestLabel; }

  updatePriceBreakdown();
}

function updatePriceBreakdown() {
  if (!state.selectedRoom) return;

  const base  = state.selectedRoom.price;
  const count = state.guestCount;
  const total = base * count;

  const totalEl = document.getElementById('sidebar-total');
  if (totalEl) totalEl.textContent = `£${total.toLocaleString()}`;
  const navTotal = document.getElementById('nav-total');
  if (navTotal) navTotal.textContent = `£${total.toLocaleString()}`;

  const perEl = document.getElementById('sidebar-per');
  if (perEl) perEl.textContent = `per person`;

  const roomLineEl = document.getElementById('price-room-line');
  if (roomLineEl) roomLineEl.textContent = `£${base.toLocaleString()} × ${count} guest${count > 1 ? 's' : ''}`;

  const subtotalEl = document.getElementById('price-subtotal');
  if (subtotalEl) subtotalEl.textContent = `£${total.toLocaleString()}`;

  const totalSumEl = document.getElementById('price-total');
  if (totalSumEl) totalSumEl.textContent = `£${total.toLocaleString()}`;
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

/* --- Edit links --------------------------------------------- */
document.addEventListener('click', e => {
  const target = e.target.closest('[data-goto-step]');
  if (target) {
    const step = parseInt(target.dataset.gotoStep);
    renderStep(step);
  }
});

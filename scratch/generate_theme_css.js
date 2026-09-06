const fs = require('fs');
const path = require('path');

const cssContent = `/* =====================================================================
   SubmitBridge — State-of-the-Art EdTech & SaaS Design System
   Electric Indigo • Pure White Glass Surfaces • Refined Slate Typography
   ===================================================================== */

@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

/* ── Design Tokens ──────────────────────────────────────────────────── */
:root {
  /* Brand Colors */
  --primary: #4f46e5;
  --primary-hover: #4338ca;
  --primary-active: #3730a3;
  --primary-light: #eef2ff;
  --primary-border: #c7d2fe;
  --primary-glow: rgba(79, 70, 229, 0.24);
  --brand-gradient: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
  --brand-gradient-hover: linear-gradient(135deg, #4338ca 0%, #4f46e5 100%);
  --hero-gradient: linear-gradient(135deg, #ffffff 0%, #f5f7ff 100%);

  /* Semantic Alerts */
  --success: #10b981;
  --success-dark: #059669;
  --success-light: #ecfdf5;
  --success-border: #a7f3d0;

  --danger: #ef4444;
  --danger-dark: #dc2626;
  --danger-light: #fef2f2;
  --danger-border: #fecaca;

  --warning: #f59e0b;
  --warning-dark: #d97706;
  --warning-light: #fffbeb;
  --warning-border: #fde68a;

  /* Neutrals & Surfaces */
  --bg-app: #f8fafc;
  --bg-subtle: #f1f5f9;
  --bg-card: #ffffff;
  --surface: #ffffff;
  --border: #e2e8f0;
  --border-light: #f1f5f9;
  --border-focus: #818cf8;

  /* Typography */
  --text-dark: #0f172a;
  --text-base: #334155;
  --text-muted: #64748b;
  --text-faint: #94a3b8;

  /* Shadows */
  --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.04);
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04);
  --shadow-card: 0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 8px 24px -4px rgba(15, 23, 42, 0.05);
  --shadow-card-hover: 0 16px 32px -8px rgba(79, 70, 229, 0.12), 0 4px 8px -2px rgba(15, 23, 42, 0.04);
  --shadow-modal: 0 25px 50px -12px rgba(15, 23, 42, 0.25);

  /* Radii */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-full: 9999px;

  /* Motion */
  --transition: 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}

/* ── Global Reset ───────────────────────────────────────────────────── */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: var(--bg-app);
  color: var(--text-base);
  line-height: 1.5;
  min-height: 100vh;
}

a {
  text-decoration: none;
  color: inherit;
}

button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  background: none;
}

input, textarea, select {
  font-family: inherit;
}

/* ── Shell & Container ──────────────────────────────────────────────── */
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  width: 100%;
}

.page-container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 28px 24px 64px;
}

.brand-gradient {
  background: var(--brand-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 800;
}

/* ── Base Card ──────────────────────────────────────────────────────── */
.card-neumorphic {
  background: var(--surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-card);
  transition: transform var(--transition), box-shadow var(--transition);
}

/* ── Sticky Frosted Glass Navbar ────────────────────────────────────── */
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  height: 68px;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.03);
}

.navbar__inner {
  max-width: 1240px;
  height: 100%;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.navbar__brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.navbar__logo-icon {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-md);
  background: var(--brand-gradient);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px var(--primary-glow);
  transition: transform var(--transition);
}

.navbar__brand:hover .navbar__logo-icon {
  transform: scale(1.05);
}

.navbar__brand-text {
  display: flex;
  flex-direction: column;
}

.navbar__logo-title {
  font-size: 17px;
  font-weight: 800;
  color: var(--text-dark);
  letter-spacing: -0.4px;
  line-height: 1.2;
}

.navbar__college-tag {
  font-size: 11px;
  font-weight: 600;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.navbar__nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--bg-subtle);
  padding: 4px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 6px 16px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  border-radius: var(--radius-full);
  transition: all var(--transition);
}

.nav-link:hover {
  color: var(--text-dark);
}

.nav-link--active {
  color: var(--primary);
  background: #ffffff;
  box-shadow: var(--shadow-sm);
}

.navbar__right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.teacher-pill {
  display: flex;
  align-items: center;
  gap: 9px;
  background: #ffffff;
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
  padding: 4px 12px 4px 5px;
  box-shadow: var(--shadow-xs);
}

.teacher-pill__avatar {
  width: 30px;
  height: 30px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  color: var(--primary);
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ffffff;
}

.teacher-pill__info {
  display: flex;
  flex-direction: column;
}

.teacher-pill__name {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-dark);
  line-height: 1.2;
}

.teacher-pill__role {
  font-size: 10px;
  font-weight: 600;
  color: var(--success-dark);
}

.btn-ghost-logout {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  border-radius: var(--radius-md);
  transition: all var(--transition);
}

.btn-ghost-logout:hover {
  color: var(--danger-dark);
  background: var(--danger-light);
}

/* ── Standard Buttons ───────────────────────────────────────────────── */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 9px 18px;
  font-size: 13px;
  font-weight: 600;
  border-radius: var(--radius-md);
  transition: all var(--transition);
  line-height: 1.25;
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none !important;
}

.btn-primary {
  background: var(--brand-gradient);
  color: #ffffff;
  box-shadow: 0 4px 14px 0 var(--primary-glow);
}

.btn-primary:hover:not(:disabled) {
  background: var(--brand-gradient-hover);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px 0 rgba(79, 70, 229, 0.38);
}

.btn-glow {
  position: relative;
}

.btn-primary-soft {
  background: var(--primary-light);
  color: var(--primary);
  border: 1px solid var(--primary-border);
}

.btn-primary-soft:hover:not(:disabled) {
  background: var(--primary);
  color: #ffffff;
  border-color: var(--primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--primary-glow);
}

.btn-secondary {
  background: #ffffff;
  color: var(--text-base);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-xs);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--bg-subtle);
  color: var(--text-dark);
  border-color: #cbd5e1;
}

.btn-success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
}

.btn-success:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35);
}

.btn-danger {
  background: var(--danger);
  color: #ffffff;
}

.btn-icon-danger {
  width: 30px;
  height: 30px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  transition: all var(--transition);
}

.btn-icon-danger:hover {
  color: var(--danger-dark);
  background: var(--danger-light);
  border-color: var(--danger-border);
}

.btn--sm {
  padding: 6px 12px;
  font-size: 12px;
  border-radius: var(--radius-sm);
}

.btn--lg {
  padding: 12px 24px;
  font-size: 14.5px;
  border-radius: var(--radius-md);
}

.btn--hero {
  padding: 12px 22px;
  font-size: 14px;
  font-weight: 700;
  border-radius: var(--radius-lg);
}

.btn--full {
  width: 100%;
}

.btn-copy-success {
  background: #ecfdf5 !important;
  color: #059669 !important;
  border-color: #a7f3d0 !important;
}

/* ── Badges & Chips ─────────────────────────────────────────────────── */
.badge-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3.5px 10px;
  font-size: 11.5px;
  font-weight: 600;
  border-radius: var(--radius-full);
  line-height: 1.2;
}

.badge-indigo {
  background: #eef2ff;
  color: #4f46e5;
  border: 1px solid #c7d2fe;
}

.badge-gray {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.badge-emerald {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
}

.badge-amber {
  background: #fffbeb;
  color: #b45309;
  border: 1px solid #fde68a;
}

.badge-red {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.badge-college {
  background: #ffffff;
  color: var(--text-dark);
  border: 1px solid #cbd5e1;
  font-weight: 700;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-radius: var(--radius-full);
}

.status-pill--success {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
}

.status-pill--danger {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.pulsing-dot {
  width: 6.5px;
  height: 6.5px;
  border-radius: var(--radius-full);
  background: currentColor;
  display: inline-block;
  animation: pulseDot 2s infinite ease-in-out;
}

.pulsing-dot--green {
  background: #10b981;
}

@keyframes pulseDot {
  0% { transform: scale(0.9); opacity: 0.8; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(0.9); opacity: 0.8; }
}

/* ── Dashboard Hero Banner ──────────────────────────────────────────── */
.dashboard-hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  background: var(--hero-gradient);
  border: 1px solid #e0e7ff;
  border-radius: var(--radius-xl);
  padding: 28px 32px;
  box-shadow: 0 4px 20px -2px rgba(79, 70, 229, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04);
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
}

.dashboard-hero::after {
  content: '';
  position: absolute;
  top: -50px;
  right: -50px;
  width: 220px;
  height: 220px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(255, 255, 255, 0) 70%);
  border-radius: 50%;
  pointer-events: none;
}

.dashboard-hero__badge-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.dashboard-hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--primary);
  background: #ffffff;
  border: 1px solid var(--primary-border);
  padding: 4px 11px;
  border-radius: var(--radius-full);
}

.dashboard-hero__session-tag {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
}

.dashboard-hero__title {
  font-size: 26px;
  font-weight: 800;
  color: var(--text-dark);
  letter-spacing: -0.6px;
  margin-bottom: 6px;
}

.dashboard-hero__subtitle {
  font-size: 13.5px;
  color: var(--text-muted);
  max-width: 620px;
  line-height: 1.5;
}

/* ── 3 Stat KPI Cards ───────────────────────────────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 28px;
}

.stat-card {
  background: #ffffff;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-card);
  transition: transform var(--transition), box-shadow var(--transition);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card-hover);
}

.stat-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.stat-card__icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-card__icon--indigo {
  background: #eef2ff;
  color: #4f46e5;
  border: 1px solid #c7d2fe;
}

.stat-card__icon--emerald {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
}

.stat-card__icon--amber {
  background: #fffbeb;
  color: #d97706;
  border: 1px solid #fde68a;
}

.stat-card__badge {
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 3px 8px;
  border-radius: var(--radius-full);
}

.stat-card__badge--indigo { background: #eef2ff; color: #4f46e5; }
.stat-card__badge--emerald { background: #ecfdf5; color: #059669; }
.stat-card__badge--amber { background: #fffbeb; color: #d97706; }

.stat-card__data {
  display: flex;
  flex-direction: column;
}

.stat-card__value {
  font-size: 28px;
  font-weight: 800;
  color: var(--text-dark);
  line-height: 1.1;
  letter-spacing: -0.5px;
}

.stat-card__label {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-muted);
  margin-top: 3px;
}

.stat-card__footer-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 500;
  color: var(--text-faint);
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--border-light);
}

/* ── Segmented Control / Tabs ───────────────────────────────────────── */
.section-toolbar {
  margin-bottom: 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.segmented-control {
  display: inline-flex;
  background: #e2e8f0;
  padding: 4px;
  border-radius: var(--radius-full);
  gap: 4px;
}

.segmented-control__item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 16px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  border-radius: var(--radius-full);
  transition: all var(--transition);
}

.segmented-control__item:hover {
  color: var(--text-dark);
}

.segmented-control__item.active {
  background: #ffffff;
  color: var(--text-dark);
  box-shadow: var(--shadow-sm);
}

.segmented-control__count {
  font-size: 11px;
  font-weight: 700;
  background: rgba(148, 163, 184, 0.2);
  padding: 2px 7px;
  border-radius: var(--radius-full);
}

.segmented-control__item.active .segmented-control__count {
  background: var(--primary-light);
  color: var(--primary);
}

/* ── Assignment Grid & Card ─────────────────────────────────────────── */
.assignment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 22px;
}

.assignment-card {
  background: #ffffff;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-card);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 22px;
  transition: transform var(--transition), box-shadow var(--transition);
}

.assignment-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card-hover);
}

.assignment-card__bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--brand-gradient);
}

.assignment-card--deleted .assignment-card__bar {
  background: var(--danger);
}

.assignment-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.assignment-card__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.assignment-card__actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.trash-banner {
  background: var(--danger-light);
  border: 1px solid var(--danger-border);
  border-radius: var(--radius-sm);
  padding: 7px 12px;
  margin-bottom: 12px;
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.trash-banner__warning {
  color: var(--danger-dark);
  font-weight: 600;
}

.trash-banner__time {
  color: var(--danger-dark);
  font-weight: 700;
}

.assignment-card__title {
  font-size: 17px;
  font-weight: 800;
  color: var(--text-dark);
  line-height: 1.35;
  margin-bottom: 14px;
  text-transform: capitalize;
}

.assignment-card__meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  background: var(--bg-subtle);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  margin-bottom: 16px;
  border: 1px solid var(--border-light);
}

.meta-pill {
  display: flex;
  flex-direction: column;
}

.meta-pill--full {
  grid-column: 1 / -1;
}

.meta-pill__label {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.meta-pill__value {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-dark);
  margin-top: 1px;
}

.assignment-card__footer {
  margin-top: auto;
}

.assignment-card__btn-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-card-primary {
  flex: 1;
  padding: 9px 14px;
  font-size: 12.5px;
  font-weight: 700;
}

.btn-card-share {
  padding: 9px 12px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.card-actions-dual {
  display: flex;
  gap: 8px;
}

/* ── Detail Page Layout ─────────────────────────────────────────────── */
.detail-top-bar {
  margin-bottom: 20px;
}

.btn-back-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 15px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-base);
  background: #ffffff;
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-xs);
  transition: all var(--transition);
}

.btn-back-pill:hover {
  background: var(--primary-light);
  color: var(--primary);
  border-color: var(--primary-border);
  transform: translateX(-2px);
}

.detail-hero-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 28px;
}

.detail-card-main {
  padding: 26px;
}

.detail-card-main__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.detail-card-main__title {
  font-size: 24px;
  font-weight: 800;
  color: var(--text-dark);
  line-height: 1.3;
  margin-bottom: 18px;
  text-transform: capitalize;
}

.detail-stats-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  background: var(--bg-subtle);
  border-radius: var(--radius-md);
  padding: 12px 18px;
  margin-bottom: 20px;
  border: 1px solid var(--border-light);
}

.detail-stat {
  display: flex;
  flex-direction: column;
}

.detail-stat__label {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.detail-stat__value {
  font-size: 15.5px;
  font-weight: 800;
  color: var(--text-dark);
  margin-top: 2px;
}

.text-indigo { color: var(--primary); }
.text-danger { color: var(--danger-dark); }

/* Info Boxes */
.info-box {
  border-radius: var(--radius-md);
  padding: 14px 18px;
  margin-bottom: 14px;
}

.info-box--neutral {
  background: #f8fafc;
  border: 1px solid var(--border);
}

.info-box--primary {
  background: #f5f7ff;
  border: 1px solid #e0e7ff;
}

.info-box__title {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--primary);
  margin-bottom: 8px;
}

.info-box--neutral .info-box__title {
  color: var(--text-muted);
}

.info-box__content {
  font-size: 13.5px;
  color: var(--text-base);
  line-height: 1.6;
}

.whitespace-pre-line {
  white-space: pre-line;
}

/* ── QR Code Card ───────────────────────────────────────────────────── */
.detail-card-qr {
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.qr-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 16px;
}

.qr-wrapper {
  background: #ffffff;
  padding: 14px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  margin-bottom: 16px;
}

.qr-image {
  width: 165px;
  height: 165px;
  display: block;
}

.qr-placeholder {
  width: 165px;
  height: 165px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 13px;
  background: var(--bg-subtle);
  border-radius: var(--radius-md);
}

.qr-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.btn-copy-link {
  background: var(--primary);
  color: #ffffff;
  font-weight: 700;
  padding: 9px 15px;
  border-radius: var(--radius-md);
  box-shadow: 0 4px 12px var(--primary-glow);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  transition: all var(--transition);
}

.btn-copy-link:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.btn-copy-link--copied {
  background: var(--success) !important;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35) !important;
}

.btn-portal-test {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
}

.qr-caption {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.4;
}

/* ── Submissions Table & Toolbar ────────────────────────────────────── */
.submissions-panel {
  padding: 26px;
  overflow: hidden;
}

.submissions-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 16px;
  flex-wrap: wrap;
}

.submissions-panel__badge-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.section-pill-tag {
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--primary);
  background: var(--primary-light);
  padding: 3px 8px;
  border-radius: var(--radius-full);
}

.submissions-count-chip {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--text-muted);
}

.submissions-panel__title {
  font-size: 20px;
  font-weight: 800;
  color: var(--text-dark);
}

.submissions-panel__subtitle {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 2px;
}

.submissions-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.submissions-search {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 6px 12px;
  width: 320px;
  max-width: 100%;
  box-shadow: var(--shadow-xs);
}

.submissions-search:focus-within {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.submissions-search__input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 13px;
  color: var(--text-dark);
  width: 100%;
}

.search-icon {
  color: var(--text-muted);
  flex-shrink: 0;
}

.search-clear-btn {
  color: var(--text-muted);
  font-size: 12px;
  cursor: pointer;
}

.submissions-filter-tabs {
  display: inline-flex;
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 3px;
  gap: 4px;
}

.filter-tab {
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  border-radius: var(--radius-sm);
  transition: all var(--transition);
}

.filter-tab:hover {
  color: var(--text-dark);
}

.filter-tab--active {
  background: #ffffff;
  color: var(--primary);
  font-weight: 700;
  box-shadow: var(--shadow-xs);
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 13px;
  white-space: nowrap;
}

.modern-table thead th {
  background: #f8fafc;
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--border);
}

.modern-table tbody tr {
  border-bottom: 1px solid #f1f5f9;
  transition: background var(--transition);
}

.modern-table tbody tr:hover {
  background: #f8faff;
}

.modern-table td {
  padding: 12px 14px;
  vertical-align: middle;
}

.cell-muted { color: var(--text-faint); font-weight: 600; }
.cell-roll { color: var(--text-dark); }
.cell-name { font-weight: 600; color: var(--text-base); }
.cell-time { color: var(--text-muted); font-size: 12px; }

.file-badge-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 9px;
  font-size: 12px;
  font-weight: 600;
  color: var(--primary);
  background: var(--primary-light);
  border: 1px solid var(--primary-border);
  border-radius: var(--radius-sm);
  transition: all var(--transition);
}

.file-badge-link:hover {
  background: var(--primary);
  color: #ffffff;
}

.text-faint-badge {
  font-size: 11px;
  color: var(--text-faint);
  font-style: italic;
}

.ai-mark-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ai-mark-pill {
  font-size: 12px;
  font-weight: 700;
  background: #f1f5f9;
  color: var(--text-dark);
  padding: 3px 8px;
  border-radius: var(--radius-sm);
}

.btn-link-summary {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--primary);
  text-decoration: underline;
  cursor: pointer;
}

.grade-action-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.input-grade {
  width: 58px;
  padding: 6px 8px;
  font-size: 13px;
  font-weight: 700;
  text-align: center;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: #ffffff;
  outline: none;
}

.input-grade:focus {
  border-color: var(--border-focus);
}

.btn-grade-approved {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 700;
}

.empty-filter-state {
  text-align: center;
  padding: 36px 16px;
  color: var(--text-muted);
  font-size: 13.5px;
}

/* ── Modal ──────────────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-card {
  width: 100%;
  max-width: 520px;
  background: #ffffff;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-modal);
  overflow: hidden;
}

.modal-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 22px;
  border-bottom: 1px solid var(--border);
}

.modal-card__title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-icon {
  font-size: 22px;
}

.modal-close-btn {
  font-size: 22px;
  line-height: 1;
  color: var(--text-muted);
  cursor: pointer;
}

.modal-card__body {
  padding: 22px;
}

.modal-score-banner {
  background: var(--primary-light);
  border: 1px solid var(--primary-border);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.modal-score-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.modal-score-number {
  font-size: 20px;
  font-weight: 800;
  color: var(--primary);
}

.modal-section {
  margin-bottom: 14px;
}

.modal-section__heading {
  display: block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.modal-text-block {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: var(--radius-sm);
  padding: 11px 13px;
  font-size: 13px;
  line-height: 1.55;
  color: var(--text-base);
}

.modal-text-block--highlight {
  background: #f5f7ff;
  border-color: #c7d2fe;
  color: #3730a3;
}

.modal-card__footer {
  padding: 14px 22px;
  background: #f8fafc;
  border-top: 1px solid var(--border);
}

/* ── Forms (Create Assignment) ──────────────────────────────────────── */
.create-container {
  max-width: 760px;
  margin: 0 auto;
}

.create-card {
  padding: 32px 36px;
}

.create-card__header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--border);
}

.create-card__icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: var(--brand-gradient);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px var(--primary-glow);
  flex-shrink: 0;
}

.create-card__title {
  font-size: 22px;
  font-weight: 800;
  color: var(--text-dark);
}

.create-card__subtitle {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 2px;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-row--2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-dark);
}

.form-input, .form-textarea {
  width: 100%;
  padding: 10px 13px;
  font-size: 13.5px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: #ffffff;
  color: var(--text-dark);
  outline: none;
  transition: border var(--transition), box-shadow var(--transition);
}

.form-input:focus, .form-textarea:focus {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.field-hint {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
}

/* Format Pill Selector */
.format-selection-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.format-pill-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--bg-subtle);
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition);
}

.format-pill-box input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--primary);
  cursor: pointer;
}

.format-pill-box__icon {
  font-size: 22px;
}

.format-pill-box strong {
  display: block;
  font-size: 13px;
  color: var(--text-dark);
}

.format-pill-box p {
  font-size: 11px;
  color: var(--text-muted);
  margin: 0;
}

.format-pill-box.active {
  background: #f5f7ff;
  border-color: var(--primary);
}

.form-submit-row {
  margin-top: 8px;
}

/* Create Success Screen */
.create-success-container {
  max-width: 540px;
  margin: 20px auto;
}

.success-card {
  padding: 36px 28px;
  text-align: center;
}

.success-badge {
  width: 54px;
  height: 54px;
  border-radius: var(--radius-full);
  background: #ecfdf5;
  color: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  border: 2px solid #a7f3d0;
}

.success-card__title {
  font-size: 20px;
  font-weight: 800;
  color: var(--text-dark);
  margin-bottom: 6px;
}

.success-card__desc {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 22px;
}

.success-qr-frame {
  display: inline-block;
  background: #ffffff;
  padding: 14px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  margin-bottom: 20px;
}

.success-qr-img {
  width: 180px;
  height: 180px;
  display: block;
}

.share-link-box {
  display: flex;
  gap: 8px;
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 6px;
  margin-bottom: 22px;
}

.share-link-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 6px 10px;
  font-size: 13px;
  color: var(--text-dark);
  outline: none;
}

.success-action-btns {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ── Auth (Login / Register) Pages ──────────────────────────────────── */
.auth-canvas {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #f8fafc;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  padding: 36px 32px;
  background: #ffffff;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-card);
}

.auth-header {
  text-align: center;
  margin-bottom: 18px;
}

.auth-logo-badge {
  width: 50px;
  height: 50px;
  border-radius: var(--radius-lg);
  background: var(--brand-gradient);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  box-shadow: 0 4px 14px var(--primary-glow);
}

.auth-title {
  font-size: 22px;
  font-weight: 800;
  color: var(--text-dark);
  letter-spacing: -0.5px;
}

.auth-subtitle {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 4px;
}

.auth-pill-tag {
  display: table;
  margin: 0 auto 20px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--primary);
  background: var(--primary-light);
  padding: 4px 12px;
  border-radius: var(--radius-full);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.auth-footer {
  margin-top: 22px;
  text-align: center;
  font-size: 13px;
  color: var(--text-muted);
}

.auth-link {
  color: var(--primary);
  font-weight: 700;
}

.auth-link:hover {
  text-decoration: underline;
}

/* ── Student Portal Styles ──────────────────────────────────────────── */
.student-canvas {
  min-height: 100vh;
  padding-bottom: 60px;
  background: #f8fafc;
}

.student-top-banner {
  background: #ffffff;
  border-bottom: 1px solid var(--border);
  padding: 20px 0;
  box-shadow: var(--shadow-xs);
}

.student-banner-inner {
  max-width: 760px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.student-banner-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.student-crest-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--brand-gradient);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px var(--primary-glow);
  flex-shrink: 0;
}

.student-banner-info {
  display: flex;
  flex-direction: column;
}

.student-portal-tag {
  display: inline-flex;
  font-size: 11px;
  font-weight: 700;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.student-college-heading {
  font-size: 19px;
  font-weight: 800;
  color: var(--text-dark);
  line-height: 1.25;
}

.student-dept-sub {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-muted);
}

.student-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 11.5px;
  font-weight: 700;
}

.student-content-container {
  max-width: 760px;
  margin: 28px auto 0;
  padding: 0 24px;
}

.student-card {
  padding: 28px 32px;
}

.student-card-title {
  font-size: 22px;
  font-weight: 800;
  color: var(--text-dark);
  margin-bottom: 14px;
  text-transform: capitalize;
}

.student-meta-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  background: var(--bg-subtle);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  margin-bottom: 20px;
  border: 1px solid var(--border-light);
}

.student-meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-muted);
}

.student-meta-item strong {
  color: var(--text-dark);
  font-weight: 700;
}

.form-section-title {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-dark);
}

.form-section-subtitle {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 18px;
}

.student-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Upload Dropzone */
.drop-zone {
  border: 2px dashed #cbd5e1;
  border-radius: var(--radius-lg);
  padding: 32px 20px;
  text-align: center;
  background: #f8fafc;
  cursor: pointer;
  transition: all var(--transition);
}

.drop-zone:hover {
  border-color: var(--primary);
  background: #f8faff;
}

.drop-zone--dragging {
  border-color: var(--primary);
  background: #eef2ff;
}

.drop-zone--selected {
  border-color: #10b981;
  background: #f0fdf4;
}

.upload-icon-circle {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background: #eef2ff;
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 10px;
}

.drop-prompt-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-dark);
}

.drop-prompt-sub {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 3px;
}

.drop-zone__file-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.file-icon-badge {
  color: #10b981;
  margin-bottom: 6px;
}

.file-name-text strong {
  display: block;
  font-size: 14px;
  color: var(--text-dark);
}

.file-name-text span {
  font-size: 12px;
  color: var(--text-muted);
}

.file-change-hint {
  font-size: 11.5px;
  color: var(--text-muted);
  margin-top: 5px;
}

.file-error-text {
  color: var(--danger-dark);
  font-size: 12px;
  font-weight: 600;
  margin-top: 4px;
}

.student-success-box {
  text-align: center;
  padding: 36px 28px;
}

.success-box-title {
  font-size: 20px;
  font-weight: 800;
  color: var(--success-dark);
  margin-bottom: 6px;
}

.success-box-desc {
  font-size: 13px;
  color: var(--text-muted);
}

/* ── Alerts ─────────────────────────────────────────────────────────── */
.alert {
  padding: 11px 15px;
  border-radius: var(--radius-md);
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 16px;
}

.alert-error {
  background: var(--danger-light);
  color: var(--danger-dark);
  border: 1px solid var(--danger-border);
}

.alert-success {
  background: var(--success-light);
  color: var(--success-dark);
  border: 1px solid var(--success-border);
}

.alert-info {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

/* ── Skeletons ──────────────────────────────────────────────────────── */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton-card {
  background: #ffffff;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  padding: 22px;
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-line {
  height: 15px;
  border-radius: var(--radius-sm);
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-line--pill { width: 85px; height: 22px; border-radius: var(--radius-full); }
.skeleton-line--title { width: 70%; height: 20px; }
.skeleton-line--text { width: 100%; height: 13px; }
.skeleton-line--btn { width: 100%; height: 36px; border-radius: var(--radius-md); margin-top: 6px; }

/* ── Empty State ────────────────────────────────────────────────────── */
.empty-state-card {
  padding: 44px 28px;
  text-align: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.empty-state__icon {
  font-size: 40px;
  margin-bottom: 10px;
}

.empty-state__title {
  font-size: 17px;
  font-weight: 800;
  color: var(--text-dark);
  margin-bottom: 6px;
}

.empty-state__desc {
  font-size: 13px;
  color: var(--text-muted);
  max-width: 440px;
  margin-bottom: 18px;
  line-height: 1.55;
}

/* ── Responsive ─────────────────────────────────────────────────────── */
@media (max-width: 900px) {
  .detail-hero-grid {
    grid-template-columns: 1fr;
  }
  .stats-grid {
    grid-template-columns: 1fr;
  }
  .dashboard-hero {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 640px) {
  .navbar__nav-links span {
    display: none;
  }
  .form-row--2col {
    grid-template-columns: 1fr;
  }
  .format-selection-row {
    grid-template-columns: 1fr;
  }
  .assignment-grid {
    grid-template-columns: 1fr;
  }
}
`;

const targetPath = path.resolve(__dirname, '../client/src/styles/global.css');
fs.writeFileSync(targetPath, cssContent, 'utf8');
console.log('Successfully wrote global.css');

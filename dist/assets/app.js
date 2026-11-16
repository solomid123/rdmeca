(() => {
  'use strict';
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#mobile-nav');
  if (toggle && nav) {
    const setOpen = open => {
      nav.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? toggle.dataset.closeLabel : toggle.dataset.openLabel);
    };
    toggle.addEventListener('click', () => setOpen(nav.hidden));
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !nav.hidden) { setOpen(false); toggle.focus(); }
    });
    document.addEventListener('click', e => {
      if (!nav.hidden && !e.target.closest('.site-header')) setOpen(false);
    });
    window.matchMedia('(min-width: 1081px)').addEventListener('change', e => {
      if (e.matches) setOpen(false);
    });
  }
  const form = document.querySelector('#enquiry-form');
  if (!form) return;
  const select = form.querySelector('#service');
  const requested = new URLSearchParams(location.search).get('service');
  if ([...select.options].some(o => o.value === requested)) select.value = requested;
  const lang = document.documentElement.lang;
  let enquiry = '';
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const name = String(values.get('name')).trim();
    const email = String(values.get('email')).trim();
    const message = String(values.get('message')).trim();
    if (!name || !message) {
      const field = !name ? form.querySelector('#name') : form.querySelector('#message');
      field.setCustomValidity(lang === 'fr' ? 'Merci de renseigner ce champ.' : 'Please fill in this field.');
      field.reportValidity();
      field.addEventListener('input', () => field.setCustomValidity(''), { once: true });
      return;
    }
    const service = select.value ? select.options[select.selectedIndex].text : (lang === 'fr' ? 'À définir' : 'To be defined');
    const company = String(values.get('company')).trim();
    const lines = lang === 'fr'
      ? [`Bonjour R&D MECA,`, '', `Je souhaite échanger sur le besoin suivant : ${service}.`, '', message, '', `Nom : ${name}`, `Société : ${company || '—'}`, `E-mail : ${email}`]
      : [`Hello R&D MECA,`, '', `I would like to discuss the following need: ${service}.`, '', message, '', `Name: ${name}`, `Company: ${company || '—'}`, `Email: ${email}`];
    enquiry = lines.join('\n');
    const subject = `${lang === 'fr' ? 'Demande de projet' : 'Project enquiry'} — ${service} — ${name}`;
    const result = document.querySelector('#enquiry-result');
    result.hidden = false;
    document.querySelector('#enquiry-preview').value = enquiry;
    window.location.href = `mailto:contact@rdmeca.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(enquiry)}`;
  });
  document.querySelector('#copy-enquiry').addEventListener('click', async e => {
    const button = e.currentTarget;
    const status = document.querySelector('#form-status');
    try {
      await navigator.clipboard.writeText(enquiry);
      status.textContent = button.dataset.copied;
    } catch {
      const preview = document.querySelector('#enquiry-preview');
      preview.focus(); preview.select();
      status.textContent = button.dataset.fallback;
    }
  });
})();

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.mobile-toggle');
  const nav = document.querySelector('.nav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('nav--open');
    });
  }

  const forms = document.querySelectorAll('#contact-form, #signup-form');

  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const data = {};
      formData.forEach((value, key) => {
        data[key] = value;
      });

      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Отправка...';
      btn.disabled = true;

      setTimeout(() => {
        form.reset();
        btn.textContent = '✓ Отправлено!';
        btn.disabled = false;

        setTimeout(() => {
          btn.textContent = originalText;
        }, 2000);
      }, 800);

      console.log('Форма отправлена (заглушка):', data);
    });
  });
});

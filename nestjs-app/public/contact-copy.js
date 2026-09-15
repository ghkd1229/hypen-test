(() => {
  const email = 'ghkkd1229@gmail.com';
  const status = document.createElement('span');
  status.className = 'contact-status';
  status.setAttribute('role', 'status');
  document.body.append(status);
  function fallbackCopy() {
    const active = document.activeElement;
    const field = document.createElement('textarea');
    field.value = email;
    field.setAttribute('readonly', '');
    field.style.cssText = 'position:fixed;top:0;left:-9999px;';
    document.body.append(field);
    field.select();
    let copied = false;
    try { copied = document.execCommand('copy'); }
    finally { field.remove(); active?.focus({preventScroll:true}); }
    if (!copied) throw new Error('Copy unavailable');
  }
  document.querySelectorAll('.contact-copy').forEach(button => {
    let timer, pending = false;
    button.addEventListener('click', async () => {
      if (pending) return;
      pending = true;
      try {
        try { await navigator.clipboard.writeText(email); }
        catch { fallbackCopy(); }
        clearTimeout(timer);
        button.classList.add('is-copied');
        button.setAttribute('aria-label', '이메일 주소 복사 완료');
        status.textContent = '이메일 주소가 복사되었습니다.';
        timer = setTimeout(() => {
          button.classList.remove('is-copied');
          button.setAttribute('aria-label', '이메일 주소 복사');
          status.textContent = '';
        }, 2200);
      } catch {
        status.textContent = '복사하지 못했습니다. 이메일 주소는 ' + email + '입니다.';
        window.prompt('이메일 주소를 복사해 주세요.', email);
      } finally { pending = false; }
    });
  });
})();

// Progressive enhancement only. Content, project details and links work without JavaScript.
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#site-nav');

if (menuButton && navigation) {
  document.documentElement.classList.add('js');
  menuButton.hidden = false;
  navigation.dataset.open = 'false';

  const setMenu = (open) => {
    navigation.dataset.open = String(open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.querySelector('span').textContent = open ? '−' : '+';
  };

  menuButton.addEventListener('click', () => {
    setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
  });

  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenu(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menuButton.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (!navigation.contains(event.target) && !menuButton.contains(event.target)) setMenu(false);
  });

  window.matchMedia('(min-width: 721px)').addEventListener('change', () => setMenu(false));
}

const year = document.querySelector('#year');
if (year) year.textContent = String(new Date().getFullYear());

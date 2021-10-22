'use strict';

const $headerNavItem = document.querySelector('[data-header-modal-id]');
const $headerCatalogModal = document.querySelector('#headerCatalogModal');

$headerNavItem.addEventListener('mouseenter', () => {
  $headerCatalogModal.classList.remove('header-modal--hide');
})

$headerCatalogModal.addEventListener('mouseleave', () => {
  $headerCatalogModal.classList.add('header-modal--hide');
})
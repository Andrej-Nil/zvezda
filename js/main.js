'use strict';
const $body = document.querySelector('body');
const $searchOpenBtn = document.querySelector('#searchOpenBtn');
const $searchModal = document.querySelector('#searchModal');
const $supportModalBtn = document.querySelector('#supportModalBtn');
const $supportModal = document.querySelector('#supportModal');



class Debaunce {
  constructor() { }
  debaunce = (fn, ms) => {
    let timeout;
    return function () {
      const fnCall = () => {
        fn(arguments)
      }
      clearTimeout(timeout);
      timeout = setTimeout(fnCall, ms)
    };
  }
}

class Server {
  constructor() {
    this._token = this.getToken();
    this.POST = 'GET';
    this.GET = 'GET';
    this.cityApi = '../json/city.json';
    this.fastOrderApi = '../json/getProd.json';
    this.addFavoriteApi = '../json/addFavorite.json';
    this.addBasketApi = '../json/addBasket.json';
    this.searchApi = '../json/search.json';
    this.removeBaskethApi = '../json/removeBasket.json';
    this.menuApi = '../json/sidebar.json';
    this.sidebarApi = '/json/sidebar.json';
    this.filterApi = '../json/filter.json';
    this.filterCheckboxApi = '../json/checkbox.json';
  }


  getSearchResult = async (data) => {
    data._token = this._token;
    const formData = this.createFormData(data)
    return await this.getResponse(this.POST, formData, this.searchApi);
  }

  getResponse = async (method, data, api) => {
    return await new Promise(function (resolve, reject) {
      const xhr = new XMLHttpRequest();
      let response = null
      xhr.open(method, api, true);
      xhr.send(data);
      xhr.onload = function () {
        if (xhr.status != 200) {
          console.log('Ошибка: ' + xhr.status);
          return;
        } else {
          response = JSON.parse(xhr.response);
          resolve(response);
          if (response) {
            console.log("Запрос отправлен");
          } else {
            console.log("Неудачная отправка");
          }
        }
      };
      xhr.onerror = function () {
        reject(new Error("Network Error"))
      };
    })
  }

  postForm = async ($form) => {
    const api = $form.action;
    const data = this.getFormData($form);
    return await this.getResponse(this.POST, data, api);
  }

  getFormData = ($form) => {
    let data = new FormData($form);
    data.append('_token', this._token);
    if ($form.id == 'fastOrdenForm') {
      const productInfo = this.getProductInfo($form);
      data.append('id', productInfo.id);
      data.append('count', productInfo.count);
    }
    return data;
  }

  createFormData = (data) => {
    const formData = new FormData()
    for (let key in data) {
      formData.append(`${key}`, data[key])
    }
    return formData;
  }

  getToken = () => {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta.getAttribute('content');
  }
}

class InputFile {
  changeFileInfo = ($inputFileWrap) => {
    const $inputFileBtnText = $inputFileWrap.querySelector('[data-file-text]');
    const $inputFileInfo = $inputFileWrap.querySelector('[data-info]');
    const $inputFile = $inputFileWrap.querySelector('[data-input]');
    const $clearBtn = $inputFileWrap.querySelector('[clear-file-btn]');
    const infoFile = this.getInfoFile($inputFile);



    this.setNameFile($inputFileBtnText, infoFile);
    this.showClearBtn($clearBtn);

    if ($inputFileInfo) {
      //this.showClearBtn($inputFileInfo);
    }
  }

  setNameFile = ($inputFileBtnText, infoFile) => {
    if (!(infoFile.name && $inputFileBtnText)) {
      return;
    }
    const size = this.getConvSize(infoFile.size)
    $inputFileBtnText.innerHTML = `${infoFile.name}. ${size}`
  }

  showClearBtn = ($clearBtn) => {
    if (!$clearBtn) {
      return;
    }

    $clearBtn.classList.add('file__clear-btn--is-show');
  };

  getConvSize = (size) => {
    const fsizekb = size / 1024;
    const fsizemb = fsizekb / 1024;
    const fsizegb = fsizemb / 1024;
    const fsizetb = fsizegb / 1024;
    let fsize = '';
    if (fsizekb <= 1024) {
      fsize = fsizekb.toFixed(2) + ' кб';
    } else if (fsizekb >= 1024 && fsizemb <= 1024) {
      fsize = fsizemb.toFixed(2) + ' мб';
    } else if (fsizemb >= 1024 && fsizegb <= 1024) {
      fsize = fsizegb.toFixed(2) + ' гб';
    } else {
      fsize = fsizetb.toFixed(2) + ' тб';
    }

    return fsize

  }


  getInfoFile = ($inputFile) => {
    if (!$inputFile.files[0]) {
      return false;
    }
    return $inputFile.files[0];
  }

  claerInputFile = ($inputFileWrap) => {

  }
}

class Render {
  constructor($parent) {
    this.$parent = $parent;
    this.declForTotalFindedItem = ['', 'а', 'ов'];
    //this.spinnerText = '';
    //this.errorMsg = '';
  }



  //Методы отресовки элементов
  renderSpiner = ($parent = this.$parent, spinnerText = '') => {
    this._render($parent, this.getSpinnerHtml, spinnerText);
  }

  renderErrorMessage = ($parent = this.$parent, messageText = '') => {
    this._render($parent, this.getErrorMessageHtml, messageText);
  }


  renderTotalFindedItem = (count, $parent = this.$parent) => {
    this._render($parent, this.getTotalFindedItemHtml, count);
  }

  renderSearchResultAll = (cards) => {
    this._render(this.$parent, this.getSearchResultAllWrapHtml);
    const $resultAllWrap = this.$parent.querySelector('[data-result-all]')
    this.renderSearchResultCards($resultAllWrap, cards);
  }

  renderSearchResultCards = ($parent, cards) => {
    this._render($parent, this.getSearchResultCardHtml, false, cards);
  }

  renderSearchResultProducts = (cards) => {
    this._render(this.$parent, this.getSearchResultProductWrapHtml);
    const $resultProductsWrap = this.$parent.querySelector('[data-search-products]');
    this.renderProductCards($resultProductsWrap, cards);
  }

  renderProductCards = ($parent, cards) => {
    this._render($parent, this.getProductCardHtml, false, cards);
  }

  getSearchResultAllWrapHtml = () => {
    return (/*html*/`
    <div data-result-all class="result__all">
    </div>`)
  }

  getSearchResultProductWrapHtml = () => {
    return (/*html*/`
    <div data-search-products class="product-tile product-tile--four-coll">
    </div>`)
  }

  getProductCardHtml = (card) => {
    const img = this.getImgHtml(card);
    const unit = card.unit ? `/${card.unit}` : '';
    return (/*html*/`
    <div data-id="${card.id}" class="product-card">
    <h3 class="product-card__title">
      <a href="product-page.html" class="product-card__link">
        ${card.title}
      </a>
    </h3>
    <div class="product-card__preview">
      <a href="product-page.html" class="product-card__link-img">
        ${img}
      </a>
    </div>
    <p class="product-card__desc">
     
    </p>
    <div class="product-card__bottom">
      <div class="product-card__price">
        <p class="product-card__current">${card.price_old} ₽${unit}</p>
        <p class="product-card__old">${card.price} ₽${unit}</p>
      </div>

      <span class="product-card__btn btn yellow-btn">
        <span class="product-card__value btn__value basket-icon">В корзину</span>
      </span>
    </div>
  </div>
    `)
  }
  //разметка
  getSearchResultCardHtml = (card) => {
    const descWithIllumination = this.getTextWithIllumination(card.str, card.desc);
    return (/*html*/`
    <div class="result-card">
    <div class="result-card__header">
      <a href="${card.type_slug}" class="result-card__area">${card.type}</a>
      <h3 class="result-card__title">
        <a href="${card.slug}" class="result-card__link">${card.title}</a>
      </h3>
    </div>

    <p class="result-card__desc">${descWithIllumination}</p>
  </div>`

    )
  }

  getTotalFindedItemHtml = (count) => {

    const decl = this.getDeclOfNum(count, ['', 'а', 'ов']);
    const end = count ? ':' : '.'
    return (/*html*/`
      <div class="search-result">
        <span class="search-result__count">Найдено ${count} результат${decl}${end}</span>
      </div>
    `)
  }

  getImgHtml = (card) => {
    const img = card.photo;
    const webp = card.photo_webp ? ` <source srcset="${card.photo_webp}"></source>` : '';

    return (/*html*/`
    <picture>
       ${webp}
        <img src="${img}" alt="" class="product-card__img">
        </picture>
    `)
  }

  getErrorMessageHtml = (text = '') => {
    return `<p class="error-message">${text}</p>`;
  }
  getSpinnerHtml = (text = '') => {
    const spinnerText = `<p class="spinner__text">${text}</p>`
    return (/*html*/`
      <div data-spinner class="spinner">
        <div class="spinner__dots">
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div class="spinner__text">${spinnerText}</div>
      </div>
    `)
  }

  //Общая функция отрисовки
  _render = ($parent = this.$parent, getHtmlMarkup, argument = false, array = false) => {
    let markupAsStr = '';
    if (!$parent) {
      return;
    }
    if (array) {
      array.forEach((item) => {
        markupAsStr = markupAsStr + getHtmlMarkup(item);
      })
    }
    if (!array) {
      markupAsStr = getHtmlMarkup(argument);
    }

    $parent.insertAdjacentHTML('beforeend', markupAsStr);
  }

  //Методы удаление элементов

  clearParent = ($parent = this.$parent) => {
    if (!$parent) {
      return;
    }
    $parent.innerHTML = '';
  }

  delete = ($parent = this.$parent, selector) => {
    const $el = $parent.querySelector(selector);
    $el.remove()
  }

  getDeclOfNum(number, decl) {
    const cases = [2, 0, 1, 1, 1, 2];
    return decl[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
  }

  getTextWithIllumination = (str, text) => {
    const reg = new RegExp(`${str}`, 'gi')
    const illuminationStr = /*html*/`<span
    class="result-card__light">${str}</span>`
    return text.replace(reg, illuminationStr);
  }

}

class Form {
  constructor(selectorForm,) {
    this.$form = document.querySelector(selectorForm);
    this.init();
  }

  init = () => {
    if (!this.$form) {
      return;
    }
    this.regTel = /^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{5,10}$/;
    this.regMail = /^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/;
    this.$inputs = this.$form.querySelectorAll('[data-input]');
    this.$submitBtn = this.$form.querySelector('[data-submit]');
    this.server = new Server();
    this.inputFile = new InputFile();
    this.formListener();
  }
  formHandler = (e) => {
    e.preventDefault();
  }

  formSubmit = (e) => {
    const target = e.target;
    if (!target.closest('[data-submit]')) {
      return;
    }
    const result = this.formCheck();

    if (!result) {
      return;
    }

    this.sendForm(this.form);

  }

  checkInput = ($input) => {
    const name = $input.getAttribute('name');
    let result = true;
    switch (name) {
      case 'phone':
        result = this.checkValue($input.value, this.regTel);
        this.visualizationInputStatus($input, result); ($input, result);
        break;
      case 'name':
        result = this.checkForEmpty($input.value);
        this.visualizationInputStatus($input, result);
        break;
      case 'consent':
        result = this.checkCheckbox($input);
        this.visualizationChekcboxStatus($input, result);
        break;

      //case 'email':
      //  result = this.checkValue($input.value, this.regMail);
      //this.statusVisualInput($input, result);
      //break;

      //case 'message':
      //result = this.checkForEmpty($input.value);
      //statusVisualInput(input, result);
      //break;

      //case 'password':
      //result = isEmptyInput(input.value);
      //statusVisualInput(input, result);
      //break;

      default: result = true;
    }
    return result;
  }

  inputHandler = (e) => {
    const $target = e.target
    if (!e.target.closest('[data-input]')) {
      return;
    }
    this.checkInput($target);
  }

  checkValue(value, reg) {
    const withOutSpace = value.trim()
    if (!withOutSpace) {
      return false;
    }
    return reg.test(withOutSpace);
  }

  checkForEmpty = (value) => {
    const withOutSpace = value.trim()
    if (!withOutSpace) {
      return false;
    } else {
      return true;
    }
  }

  visualizationInputStatus = ($input, result) => {
    if (result) {
      $input.classList.remove('input-error');
    } else {
      $input.classList.add('input-error');
    }
  }

  visualizationChekcboxStatus($checkbox, result) {
    const $checkboxBlock = $checkbox.closest('[data-checkbox]');
    if (!result) {
      $checkboxBlock.classList.add('animation-shake');
      setTimeout(() => {
        $checkboxBlock.classList.remove('animation-shake');

      }, 800)
      return;
    }
  }

  checkCheckbox(checkbox) {
    return checkbox.checked
  }


  formCheck = () => {
    let res = true;
    this.$inputs.forEach(($item) => {
      res = this.checkInput($item) && res;
    })
    if (!res) {
      console.log('not sent');
      return res;
    }
    if (res) {
      console.log('sent');
      return res;
    }
  }

  sendForm = async () => {
    this.response = await this.server.postForm(this.$form);
    console.log(this.response);
    if (!this.response.rez) {
      //this.resultBlockHide();
      //this.showErrorMessage(this.response.error);
    }

    if (this.response.rez) {
      this.clearForm();
      //this.resultBlockShow()
    }
  }

  clearForm = () => {
    this.$inputs.forEach(($item) => {
      $item.value = '';
    })
    //if (this.$textarea) {
    //  this.$textarea.value = '';
    //}

    //this.$formMsg.classList.remove('form__message--is-show');
    //this.$formMsg.innerHTML = '';

  }

  changeHandler = (e) => {
    const $target = e.target.closest('[data-file]');
    if ($target) {
      this.inputFile.changeFileInfo($target);
    }
  }

  defineInputFileElements = () => {
    if (!this.$inputFile) {
      return
    }

  };
  formListener = () => {
    this.$form.addEventListener('submit', this.formHandler);
    this.$form.addEventListener('click', this.formSubmit);
    this.$form.addEventListener('focusout', this.inputHandler);
    this.$form.addEventListener('change', this.changeHandler);
  }
}

class ModalForm extends Form {
  constructor(selectorForm) {
    super(selectorForm);
  }



}
class Modal {
  constructor(id) {
    this.$modal = document.querySelector(id);
    this.server = new Server();
  }


  open = () => {
    this.$modal.classList.remove('modal--is-hide');
    this.$modal.classList.add('modal--is-open');
    $body.classList.add('no-scroll');

  }

  close = () => {
    this.$modal.classList.remove('modal--is-open');
    setTimeout(() => {
      this.$modal.classList.add('modal--is-hide');
      $body.classList.remove('no-scroll');
    }, 500)
  }



  //listeners = (e) => {
  //  const target = e.target;
  //  if (target.hasAttribute('data-close')) {
  //    this.close()
  //  }
  //}
}



class SearchModal extends Modal {
  constructor(modalId) {
    super(modalId);
    this.init()
  }

  init = () => {
    if (!this.$modal) {
      return;
    }

    this.$searchContent = this.$modal.querySelector('#SearchContent');
    this.$area = this.$modal.querySelector('#searchArea')
    this.$searchInput = this.$modal.querySelector('#searchInput');
    this.$searchResultBlock = this.$modal.querySelector('#searchResult');
    this.$blinds = this.$modal.querySelector('#blinds');
    this.value = '';
    this.type = this.$area.querySelector('[checked]').value;
    this.$modal.addEventListener('click', this.listener);
    this.render = new Render(this.$searchResultBlock);
    this.debaunce = new Debaunce();
    this.response = null;
    this.areaListener()
    this.inputListener();

  }

  openSearchModal = () => {
    this.open()
    this.$blinds.classList.add('blinds--is-close');
    setTimeout(() => {
      this.$blinds.classList.add('blinds--is-hide');
      this.$modal.classList.add('search-modal__bg');
    }, 300)
  }

  closeSearchModal = () => {
    this.close()
    this.$blinds.classList.remove('blinds--is-hide');


    setTimeout(() => {
      this.$modal.classList.remove('search-modal__bg');
      this.$blinds.classList.remove('blinds--is-close');
    }, 300)

  }

  createSearchResult = async () => {
    this.render.clearParent();
    this.changeValue();

    if (this.value.length < 3) {
      return;
    }

    const data = this.getData();
    this.response = await this.server.getSearchResult(data);

    if (this.response.rez == 0) {
      console.log(`Ошибка: ${this.response.error.id}`);
    }
    if (this.response.rez == 1) {
      this.renderSearchContent();
    }
  }

  getData = () => {
    return {
      value: this.value,
      type: this.type,
    }
  }

  changeValue = () => {
    this.value = this.$searchInput.value.trim();
  }

  raiseContent = () => {
    this.$searchContent.classList.add('search-modal__content--up');
  }


  renderSearchContent = () => {
    if (this.response.count == 0) {
      this.render.renderTotalFindedItem(this.response.count);
    }
    if (this.response.count > 0) {
      this.raiseContent()
      setTimeout(() => {
        this.render.renderTotalFindedItem(this.response.count);
        this.renderSearchCards();
      }, 300);
    }
  }

  listener = (e) => {
    const target = e.target;
    if (target.hasAttribute('data-close')) {
      this.closeSearchModal()
    }
  }

  setActiveArea = () => {
    const $areaItems = this.$area.querySelectorAll('[data-area]');
    $areaItems.forEach((item) => {
      if (item.checked) {
        this.type = item.value;
      }
    })
  }

  renderSearchCards = () => {
    if (this.response.all.length) {
      //this.render.renderSearchResultAll(this.response.all)
    }
    if (this.response.products.length) {
      this.render.renderSearchResultProducts(this.response.products)
    }
  }

  inputListener = () => {
    if (!this.$searchInput) {
      return;
    }
    const createSearchResult = this.debaunce.debaunce(this.createSearchResult, 200);
    this.$searchInput.addEventListener('input', createSearchResult);
    this.$searchInput.addEventListener('paste', createSearchResult);
  }
  areaListener = () => {
    if (!this.$area) {
      return;
    }
    this.$area.addEventListener('input', this.setActiveArea)
  }
}


class CommunicationModal extends Modal {
  constructor(modalId) {
    super(modalId);
    this.init()
  }

  init = () => {
    if (!this.$modal) {
      return;
    }
    this.$modalBody = this.$modal.querySelector('[data-modal-body]');
    this.$modal.addEventListener('click', this.listeners);
    this.$form = new ModalForm('#supportModalForm');

  }

  //openModal = () => {
  //  this.open();
  //}

  listeners = (e) => {
    const target = e.target;
    if (target.hasAttribute('data-close')) {
      this.close();
    }
  }
}


const render = new Render();
const searchModal = new SearchModal('#searchModal');
const supportModal = new CommunicationModal('#supportModal');
if ($searchOpenBtn && $searchModal) {
  $searchOpenBtn.addEventListener('click', openSearchModal)
}

if ($supportModalBtn && $supportModalBtn) {
  $supportModalBtn.addEventListener('click', openOrderModal)
}



function openSearchModal() {
  searchModal.openSearchModal()
}

function openOrderModal() {
  supportModal.open()
}
document.addEventListener('input', tooglePlaceholder);
document.addEventListener('change', tooglePlaceholder);
function tooglePlaceholder(e) {
  const target = e.target.closest('[data-input]')
  if (!target) {
    return;
  }
  if (target.value.length > 0) {
    hidePlaceholder(target);
  }
  if (target.value.length == 0) {
    showPlaceholder(target);
  }
}

function hidePlaceholder(input) {
  input.classList.add('hide-placeholder');
}

function showPlaceholder(input) {
  input.classList.remove('hide-placeholder');
}


















//const $headerNavItem = document.querySelector('[data-header-modal-id]');
//const $headerCatalogModal = document.querySelector('#headerCatalogModal');

//class HeaderModals {
//  constructor() {
//    this.$headerTop = document.querySelector('#headerTop');
//    this.init();
//  }

//  init = () => {
//    if (!this.$headerTop) {
//      return;
//    }
//    this.$modal = null;
//    this.$headerItem = null;
//    this.listener();
//  }

//  overHeaderItem = (e) => {
//    const $headerItem = e.target.closest('[data-header-modal-id]');
//    if (!$headerItem) {
//      return;
//    };
//    console.log($headerItem)
//    this.$headerItem = $headerItem;
//    this.$modal = this.setModal();
//    this.open()

//  }

//  outHeaderItem = (e) => {

//  }

//  setModal = () => {
//    const modalId = this.$headerItem.dataset.headerModalId;
//    return document.querySelector(`#${modalId}`);
//  }

//  open = ($modal = this.$modal) => {
//    if ($modal.dataset.status === 'close') {
//      $modal.classList.add('header-modal--show');
//      this.$headerItem.classList.add('header-nav__item--action');
//      $modal.dataset.status = 'open';
//    } else if ($modal.dataset.status === 'open') {
//      return 'open';
//    } else {
//      return false;
//    }
//  }

//  listener = () => {
//    this.$headerTop.addEventListener('mouseover', this.overHeaderItem);
//    this.$headerTop.addEventListener('mouseout', this.outHeaderItem);
//  }
//}


//const headerModals = new HeaderModals();

//$headerTop.addEventListener('mouseover', toggleHeaderModal);

//function toggleHeaderModal(e) {
//  const $headerItem = e.target.closest('[data-header-modal-id]');
//  if (!$headerItem) {
//    return;
//  };
//  const modalId = $headerItem.dataset.headerModalId;
//  const $modal = document.querySelector(`#${modalId}`);

//  if ($modal.dataset.status === 'close') {
//    openHeaderModal($modal, $headerItem);
//  } else if ($modal.dataset.status === 'open') {
//    return 'open';
//  } else {
//    return false;
//  }
//}

//function openHeaderModal($modal, $headerItem) {
//  $modal.classList.add('header-modal--show');
//  $headerItem.classList.add('header-nav__item--action');
//  $modal.dataset.status = 'open';
//}



//$headerNavItem.addEventListener('mouseover', () => {
//$headerCatalogModal.classList.add('header-modal--show');
//$headerNavItem.classList.add('header-nav__item--action');
//})

//$headerNavItem.addEventListener('mouseout', (e) => {
//  if (e.relatedTarget === null) {
//    return;
//  }
//  if (e.relatedTarget.closest('[data-modal-inner]') || e.relatedTarget.closest('.header-nav__modal-arrow')) {
//    return
//  } else {
//    $headerCatalogModal.classList.remove('header-modal--show');
//    $headerNavItem.classList.remove('header-nav__item--action');
//  }
//})

//$headerCatalogModal.addEventListener('mouseout', (e) => {
//  if (e.relatedTarget === null) {
//    return;
//  }
//  if (e.relatedTarget.closest('[data-modal-inner]') || e.relatedTarget.closest('.header-nav__modal-arrow')) {
//    return
//  } else {
//    $headerCatalogModal.classList.remove('header-modal--show');
//    $headerNavItem.classList.remove('header-nav__item--action');
//  }
//})



//$headerCatalogModal.addEventListener('mouseleave', () => {
//  $headerCatalogModal.classList.add('header-modal--hide');
//});
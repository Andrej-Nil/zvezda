'use strict';
const $body = document.querySelector('body');
const $searchOpenBtn = document.querySelector('#searchOpenBtn');
const $searchModal = document.querySelector('#searchModal');
const $supportModalBtn = document.querySelector('#supportModalBtn');
const $supportModal = document.querySelector('#supportModal');
const $orderModalBtn = document.querySelector('#orderModalBtn');
const $orderModal = document.querySelector('#orderModal');



class Debaunce {
  constructor() { }
  debaunce = (fn, ms) => {
    let timeout;
    return function () {
      const fnCall = () => {
        fn(arguments[0])
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
    this.clearBasketApi = '../json/clearBasket.json';
    this.searchApi = '../json/search.json';
    this.removeProductApi = '../json/removeBasket.json';
    this.menuApi = '../json/sidebar.json';
    this.sidebarApi = '/json/sidebar.json';
    this.filterApi = '../json/filter.json';
    this.filterCheckboxApi = '../json/checkbox.json';
  }

  addBsasket = async (data) => {
    data._token = this._token;
    const formData = this.createFormData(data);
    return await this.getResponse(this.POST, formData, this.addBasketApi);
  }

  removeProduct = async (id) => {
    const data = {
      id: id,
      _token: this._token
    }
    const formData = this.createFormData(data);
    return await this.getResponse(this.POST, formData, this.removeProductApi);
  }

  clearBasket = async () => {
    const data = this.createFormData({ _token: this._token });
    return await this.getResponse(this.POST, data, this.clearBasketApi);

  }
  getSearchResult = async (data) => {
    data._token = this._token;
    const formData = this.createFormData(data)
    return await this.getResponse(this.POST, formData, this.searchApi);
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
}

class InputFile {
  constructor($inputFileBlock) {
    this.$inputFileBlock = $inputFileBlock;
    this.init();
  }

  init = () => {
    if (!this.$inputFileBlock) {
      return;
    }

    this.setElements()

  }
  setElements = () => {
    this.$label = this.$inputFileBlock.querySelector('[data-file-label]');
    this.$cloneLabel = this.createCloneLabel();
    this.$fileText = this.$inputFileBlock.querySelector('[data-file-text]');
    this.$input = this.$inputFileBlock.querySelector('[data-input]');
    this.$clearBtn = this.$inputFileBlock.querySelector('[clear-file-btn]');
    this.infoFile = null;
  }
  createCloneLabel = () => {
    return this.$label.cloneNode(true);;
  }
  changeFileName = () => {
    this.infoFile = this.getInfoFile();
    this.setNameFile();
    this.showClearBtn();
  }

  setNameFile = () => {
    if (!this.infoFile.name) {
      return;
    }
    const size = this.getConvSize()
    this.$fileText.innerHTML = `${this.infoFile.name}. ${size}`
  }

  showClearBtn = () => {
    if (!this.$clearBtn) {
      return;
    }
    this.$clearBtn.classList.add('file__clear-btn--is-show');
  };

  hideClearBtn = () => {
    if (!this.$clearBtn) {
      return;
    }
    this.$clearBtn.classList.remove('file__clear-btn--is-show');
  }

  getConvSize = () => {
    const size = this.infoFile.size
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


  getInfoFile = () => {
    if (!this.$input.files[0]) {
      return false;
    }
    return this.$input.files[0];
  }

  clear = () => {
    this.$label.remove();
    this.$inputFileBlock.insertAdjacentElement('afterbegin', this.$cloneLabel);
    this.hideClearBtn();
    this.setElements();

  }
}

class Render {
  constructor($parent = null) {
    this.$parent = $parent;
    this.declForTotalFindedItem = ['', 'а', 'ов'];
    //this.spinnerText = '';
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

  renderBasketCard = ($parent, cardData) => {

    this._render($parent, this.getBasketCardHtml, cardData, false, 'afterbegin')
  }

  renderInfoModalError = (errorMessage) => {
    this.clearParent(this.$parent)
    this._render(this.$parent, this.getInfoModalErrorHtml, errorMessage);
  }

  renderInfoModalSuccses = (message) => {
    this.clearParent(this.$parent)
    this._render(this.$parent, this.getInfoModalSuccsesHtml, message);
  }

  renderInfoModalConfirmation = (message) => {
    this.clearParent(this.$parent);
    this._render(this.$parent, this.getInfoModalConfirmationHtml, message);
  };
  //разметка
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

  getBasketCardHtml = (cardData) => {
    const discontPrice = (+cardData.price_old).toLocaleString();
    const currentPrice = (+cardData.price).toLocaleString();
    const unit = cardData.unit ? `/${cardData.unit}` : '';
    return (/*html*/`
      <div data-product="${cardData.id}" data-in-basket="1"  class="basket-card">
        <div class="basket-card__top">
          <div class="basket-card__preview">
            <a href="product-page.html" class="basket-card__preview-link">
              <picture>
                <img src="./img/image/product-card/product1.jpg" alt="" class="basket-card__img">
              </picture>
            </a>
          </div>

          <div class="basket-card__name">
            <a href="${cardData.category_slug}" class="basket-card__category">
            ${cardData.category}
            </a>
            <h2 class="basket-card__title">
              <a href="${cardData.slug}" class="basket-card__link">
              ${cardData.title}
              </a>

            </h2>
          </div>
        </div>


        <div data-counter class="basket-card__main">
          <div class="basket-card__center">
            <div class="basket-card__counter counter">
              <span data-dec class="basket-card__btn counter__btn">-</span>
              <input data-product-input class="basket-card__input counter__input" type="text" value="${cardData.count}">
              <span data-inc class="basket-card__btn counter__btn">+</span>
            </div>

            <div class="basket-card__price">
              <span class="basket-card__old">${discontPrice} ₽${unit}</span>
              <span class="basket-card__new">${currentPrice} ₽${unit}
              </span>
            </div>
          </div>

          <span data-delete-product class="basket-card__remove">
            <span class="basket-card__remove-text">Убрать из корзины</span>
            <i class="basket-card__remove-icon"></i>
          </span>
        </div>
      </div>
    `)
  }

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

  getInfoModalErrorHtml(errorMessage) {
    const errorMsg = 'Произошла ошибка, попробуйте позже.';
    const message = errorMessage ? errorMessage : errorMsg
    return ( /*html*/`
      <p class="info-modal__text white-color">${message}</p>
      <p class="info-modal__subtext white-color">Вы можете с вязаться с нами по телефону <a href="tel:+78987775544" class="info-modal__link white-color">+7 898 777 55 44</a> или написат нам на почту <a href="mailto:info@ntmk.ru" class="info-modal__link white-color">info@ntmk.ru</a></p>
    `)
  }

  getInfoModalSuccsesHtml(message) {
    const text = 'Успешная отправка!'
    const desc = message ? message : text
    return ( /*html*/`
      <p class="info-modal__text">${desc}</p>
      <p class="info-modal__subtext">Если у вас появились вопросы вы можете связаться с  нами по телефону <a href="tel:+78987775544" class="info-modal__link">+7 898 777 55 44</a> или написат нам на почту <a href="mailto:info@ntmk.ru" class="info-modal__link">info@ntmk.ru</a></p>
    `)
  }

  getInfoModalConfirmationHtml = (message) => {
    return ( /*html*/`
    <p class="info-modal__text white-color">${message}</p>
    <div class="info-modal__btns">
      <span data-answer="0" class="info-modal__btn btn clear-btn">Отмена</span>
      <span data-answer="1" class="info-modal__btn btn clear-btn">Очистить корзину</span>
    </div>
    `)
  }

  //Общая функция отрисовки
  _render = ($parent, getHtmlMarkup, argument = false, array = false, where = 'beforeend') => {
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

    $parent.insertAdjacentHTML(where, markupAsStr);
  }

  //Методы удаление элементов

  clearParent = ($parent = this.$parent) => {
    if (!$parent) {
      return;
    }
    $parent.innerHTML = '';
  }

  delete = ($el) => {
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
    this.$inputFileBlock = this.$form.querySelector('[data-file-block]');
    this.defineInputFileClass();
    this.formListener();
  }
  formHandler = (e) => {
    e.preventDefault();
  }

  formSubmit = () => {

    const result = this.formCheck();

    if (!result) {
      return null;
    }
    return this.sendForm(this.form);
  }

  checkInput = ($input) => {
    const name = $input.getAttribute('name');
    let result = true;
    switch (name) {
      case 'phone':
        result = this.checkValue($input.value, this.regTel);
        this.visualizationInputStatus($input, result);
        break;
      case 'name':
        result = this.checkForEmpty($input.value);
        this.visualizationInputStatus($input, result);
        break;
      case 'address':
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
    return await server.postForm(this.$form);
  }

  clearForm = () => {
    this.$inputs.forEach(($item) => {
      if ($item.name === 'file') {
        this.inputFile.clear();
        return;
      }

      $item.value = '';
      this.showPlaceholder($item);
    })
    //if (this.$textarea) {
    //  this.$textarea.value = '';
    //}

    //this.$formMsg.classList.remove('form__message--is-show');
    //this.$formMsg.innerHTML = '';

  }

  hidePlaceholder($input) {
    $input.classList.add('hide-placeholder');
  }

  showPlaceholder($input) {
    $input.classList.remove('hide-placeholder');
  }

  tooglePlaceholder($input) {
    if (!$input) {
      return;
    }
    if ($input.value.length > 0) {
      this.hidePlaceholder($input);
    }
    if ($input.value.length == 0) {
      this.showPlaceholder($input);
    }
  }


  changeHandler = (e) => {
    const $target = e.target;
    if ($target.closest('[data-file-block]')) {
      this.inputFile.changeFileName($target);
    }

    if ($target.closest('[data-input]')) {
      this.tooglePlaceholder($target);
    }
  }

  focusoutHandler = (e) => {
    const $target = e.target
    if (!e.target.closest('[data-input]')) {
      return;
    }
    this.checkInput($target);
  }

  inputHandler = (e) => {
    const $target = e.target;

    if ($target.closest('[data-input]')) {
      this.tooglePlaceholder($target);
    }
  }

  defineInputFileClass = () => {
    if (!this.$inputFileBlock) {
      return;
    }
    this.inputFile = new InputFile(this.$inputFileBlock);
  }
  clickHandler = (e) => {
    const target = e.target;
    if (target.closest('[clear-file-btn]')) {
      this.inputFile.clear();

    }
  }
  formListener = () => {
    this.$form.addEventListener('submit', this.formHandler);
    this.$form.addEventListener('click', this.clickHandler);
    this.$form.addEventListener('focusout', this.focusoutHandler);
    this.$form.addEventListener('input', this.inputHandler);
    this.$form.addEventListener('change', this.changeHandler);
  }

}

class FormPage extends Form {
  constructor(selectorForm) {
    super(selectorForm);
    this.initFeedbackForm();
  }
  initFeedbackForm = () => {
    if (!this.$form) {
      return;
    }
    this.$form.addEventListener('click', this.listeners);
  }

  sendFormPage = async () => {
    const response = await this.formSubmit();
    if (response === null) {
      return;
    }

    if (response.rez == 1) {
      succsesModal.showSuccses(response.desc);
      errorModal.close();
    }

    if (response.rez == 0) {
      console.log(`Ошибка: ${response.error.id}`);
      succsesModal.close()
      errorModal.showError(response.error.desc);
    }
  }

  listeners = (e) => {
    const $target = e.target;
    if ($target.closest('[data-submit]')) {
      this.sendFormPage()
    }

  }

}

class Modal {
  constructor(id) {
    this.$modal = document.querySelector(id);
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

}

class InfoModal {
  constructor(modalId) {
    this.$modal = document.querySelector(modalId);
    this.init();
  }

  init = () => {
    if (!this.$modal) {
      return;
    }
    this.$inner = this.$modal.querySelector('[data-modal-inner]');
    this.timeout = null;
    this.time = 10000;
    this.render = new Render(this.$inner);
    this.listeners()
  }

  open = (timeout = false) => {
    this.$modal.classList.remove('info-modal--hide');
    this.$modal.classList.add('info-modal--show');
    this.$modal.classList.add('info-modal--open');

    if (timeout) {
      this.createTimeout(this.close, this.time);
    }

  }

  close = () => {
    clearTimeout(this.timeout);
    this.$modal.classList.remove('info-modal--open');
    setTimeout(() => {
      this.$modal.classList.add('info-modal--close');
      this.$modal.classList.add('info-modal--hide');
    }, 300)
  }

  createTimeout = (fn, time) => {
    this.timeout = setTimeout(() => {
      fn();
    }, time)
  }

  clickHandler = (e) => {
    const $target = e.target;
    if ($target.closest('[data-close-info]')) {
      this.close();
    }
  }

  //mouseenterHandler = () => {
  //  clearTimeout(this.timeout);
  //}

  //mouseleaveHandler = () => {
  //  this.createTimeout(this.close, this.time);
  //}

  listeners = () => {
    this.$modal.addEventListener('click', this.clickHandler);
  }
}

class ErrorModal extends InfoModal {
  constructor(modalId) {
    super(modalId);
  }

  showError = (errorMessage = false) => {
    this.render.renderInfoModalError(errorMessage);
    this.open(true)
  }
}

class SuccsesModal extends InfoModal {
  constructor(modalId) {
    super(modalId);
  }

  showSuccses = (message = false) => {
    this.render.renderInfoModalSuccses(message);
    this.open(true)
  }
}

class ConfirmationModal extends InfoModal {
  constructor(modalId) {
    super(modalId);
    this.init();
  }
  showConfirmation = async (message = false) => {
    this.render.renderInfoModalConfirmation(message);
    this.open();

  }
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
    this.response = await server.getSearchResult(data);

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
    const createSearchResult = debaunce.debaunce(this.createSearchResult, 200);
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

class GaliriaModal extends Modal {
  constructor(modalId) {
    super(modalId);
    this.init()
  }

  init = () => {
    if (!this.$modal) {
      return;
    }

    this.$modalInner = this.$modal.querySelector('[data-modal-inner]')
    this.$source = this.$modal.querySelector('[srcset]');
    this.$img = this.$modal.querySelector('[src]');
    this.listners()
  }

  openGaleriaModal = (bigImgSrc) => {
    this.setSrcImg(bigImgSrc)
    this.$modalInner.classList.add('galeria-modal__inner--show');
    this.open();
  }

  closeGaleriaModal = () => {
    this.$modalInner.classList.remove('galeria-modal__inner--show');
    this.close();
  }

  setSrcImg = (bigImgSrc) => {
    console.log(`${bigImgSrc}.jpg`)
    if (this.$source) {
      this.$source.srcset = `${bigImgSrc}.jpg`
    }
    if (this.$img) {
      this.$img.src = `${bigImgSrc}.webp`
    }
  }

  clickHandler = (e) => {
    const $target = e.target;
    if ($target.closest('[data-close]')) {
      this.closeGaleriaModal();
    }
  }

  listners = () => {
    this.$modal.addEventListener('click', this.clickHandler)
  }
}

class CommunicationModal extends Modal {
  constructor(modalId, formId) {
    super(modalId);
    this.formId = formId;
    this.init()
  }

  init = () => {
    if (!this.$modal) {
      return;
    }
    this.$modalBody = this.$modal.querySelector('[data-modal-body]');
    this.$modal.addEventListener('click', this.listeners);
    this.form = new Form(this.formId);

  }

  sendForm = async () => {
    const response = await this.form.formSubmit();
    if (response === null) {
      return;
    }

    if (response.rez == 1) {
      this.form.clearForm();
      this.close();
      basket.deleteBasketContent();
      setTimeout(() => {
        succsesModal.showSuccses(response.desc);
      }, 300)

    }

    if (response.rez == 0) {
      console.log(`Ошибка: ${response.error.id}`);
      errorModal.showError(response.error.desc);
    }


  }

  clickHandler = (e) => {
    const $target = e.target
    if ($target.closest('[data-submit]')) {
      this.sendForm();
      errorModal.close();
    }
    if ($target.hasAttribute('data-close')) {
      this.close();
      errorModal.close();
    }
  }

  listeners = () => {
    this.$modal.addEventListener('click', this.clickHandler)
  }
}


class BigBgImg {
  constructor(blockId) {
    this.$block = document.querySelector(blockId);
    this.init();
  }

  init = () => {
    if (!this.$block) {
      return;
    }

    this.$bg = this.$block.querySelector('[data-bg-img]');
    this.$bgSrc = this.$block.querySelector('[data-bg-src]');
    this.$defaultBgImg = this.$bgSrc.srcset;
    this.curentBigImgSrc = null;
    this.$currentCardUnderCursor = null;
    this.listeners()
  }

  changeBigImg = ($card) => {
    if (!$card || $card === this.$currentCardUnderCursor) {
      return;
    }
    this.$currentCardUnderCursor = $card;
    this.curentBigImgSrc = $card.dataset.bigImgSrc

    //if ()


    this.setBgImg(this.curentBigImgSrc);
    this.showBg();

  }

  showBigImg = () => {

  }

  setBgImg = (srcImg) => {
    this.$bgSrc.srcset = srcImg;
  }
  showBg = () => {
    this.$bg.classList.add('services__bg--show');

  }

  removeBigImg = ($target) => {
    if (!$target.closest('[data-big-img-src]') === this.$currentCardUnderCursor && !$target.closest('[data-big-img-src]')) {
      return
    }

    this.$bg.classList.remove('services__bg--show');
    this.$currentCardUnderCursor = null;
  }



  mouseoverHandler = (e) => {
    const $target = e.target;
    if ($target.closest('[data-big-img-src]')) {
      const $card = $target.closest('[data-big-img-src]');
      this.changeBigImg($card);
    }

  }

  mouseoutHandler = (e) => {
    const $target = e.target;
    //const $card = $target.closest('[data-card-big-img]');
    this.removeBigImg($target);

  }

  listeners = () => {
    this.$block.addEventListener('mouseover', this.mouseoverHandler)
    this.$block.addEventListener('mouseout', this.mouseoutHandler)
  }
}

class Advantages {
  constructor(id) {
    this.advantages = document.querySelector(id);
    this.init();
  }

  init = () => {
    if (!this.advantages) {
      return;
    }
    this.contentHeight = null;
    this.duration = 1000;
    this.listener()
  }

  openCard = ($card) => {
    $card.classList.remove('advantage-card--change-color');
    this.contentHeight = this.getContentHeight($card);


    this.animate({
      duration: 500,
      timing(timeFraction) {
        return Math.pow(timeFraction, 2) * ((1.3 + 1) * timeFraction - 1.3)
      },
      draw(progress) {
        $card.style.height = progress * 522 + 'px';
      }
    })
    $card.classList.add('advantage-card--open-animaite');
  }

  getContentHeight = ($card) => {
    return $card.querySelector('[data-content]').offsetHeight;
  }

  clickHandler = (e) => {
    const $target = e.target;
    if ($target.closest('[data-card]')) {
      const $card = $target.closest('[data-card]');
      this.openCard($card);
    }
  }

  //const block = document.querySelector('#block');


  animate = ({ timing, draw, duration }) => {

    let start = performance.now();

    requestAnimationFrame(function animate(time) {
      // timeFraction изменяется от 0 до 1
      let timeFraction = (time - start) / duration;
      if (timeFraction > 1) timeFraction = 1;

      // вычисление текущего состояния анимации
      let progress = timing(timeFraction);

      draw(progress); // отрисовать её

      if (timeFraction < 1) {
        requestAnimationFrame(animate);
      }

    })
  }

  //function quad(timeFraction) {
  //  return Math.pow(timeFraction, 2)
  //}

  //  animate({
  //    duration: 700,
  //    timing(timeFraction) {
  //      return Math.pow(timeFraction, 2) * ((1.5 + 1) * timeFraction - 1.5)
  //    },
  //      draw(progress) {
  //  this.$card.style.top = progress * 522 + 'px';
  //}
  //  })



  listener = () => {
    this.advantages.addEventListener('click', this.clickHandler)
  }
}

class Slider {
  constructor(id) {
    this.$slider = document.querySelector(id);
    this.init();
  }

  init = () => {
    if (!this.$slider) {
      return;
    }
    this.$track = this.$slider.querySelector('[data-track]');
    this.$slides = this.$slider.querySelectorAll('[data-slide]');
    this.$controls = this.$slider.querySelector('[data-controls]');
    this.$prevArrow = this.$slider.querySelector('[data-prev]');
    this.$nextArrow = this.$slider.querySelector('[data-next]');
    this.displaySlides = this.setDisplaySlides();
    this.i = 0;
    this.touchStart = 0;
    this.touchPosition = 0;
    this.sensitivity = 50;
    this.listeners();
    this.toggleControls();
  }

  prev = () => {
    if (this.i == 0) {
      return;
    }
    this.i--;
    this.toggleArrow();
    this.trackShift();
  }

  next = () => {
    if (this.i >= this.$slides.length - this.displaySlides) {
      return;
    }
    this.i++;
    this.toggleArrow();
    this.trackShift();
  }

  toggleControls = () => {
    if (this.$controls)
      if (this.displaySlides >= this.$slides.length) {
        this.$controls.classList.add('section-controls__btn--hide');
      } else {
        this.$controls.classList.remove('section-controls__btn--hide');
      }
  }

  toggleArrow = () => {
    if (this.i == 0) {
      this.hideArrow(this.$prevArrow)
    } else {
      this.showArrow(this.$prevArrow)
    }

    if (this.i == this.$slides.length - this.displaySlides) {
      this.hideArrow(this.$nextArrow)
    } else {
      this.showArrow(this.$nextArrow)
    }
  }

  hideArrow = ($arrow) => {
    if (!$arrow) {
      return;
    }
    $arrow.classList.add('section-controls__btn--hide')
  }

  showArrow = ($arrow) => {
    if (!$arrow) {
      return;
    }
    $arrow.classList.remove('section-controls__btn--hide')
  }

  trackShift = () => {
    const trackShift = this.getShift();
    this.$track.style.transform = `translate(-${trackShift}px, 0)`;
  }

  getShift = () => {
    const step = this.getSlideWidth();
    return this.i * step;
  }

  getSlideWidth = () => {
    const slideWidth = this.$slides[0].offsetWidth;
    const slideMarginRight = parseInt(getComputedStyle(this.$slides[0], true).marginRight);
    const slideMarginLeft = parseInt(getComputedStyle(this.$slides[0], true).marginLeft);
    return slideWidth + slideMarginRight + slideMarginLeft;
  }
  setDisplaySlides = () => {
    const sliderWidth = this.$slider.offsetWidth;
    const slideWidth = this.getSlideWidth()
    return Math.ceil(sliderWidth / slideWidth);
  }

  clickHandler = (e) => {
    const $target = e.target;
    if ($target.hasAttribute('data-prev')) {
      this.prev()
    }

    if ($target.hasAttribute('data-next')) {
      this.next()
    }
  }

  resizeHandler = () => {
    this.displaySlides = this.setDisplaySlides();
    this.i = 0;
    this.trackShift();
    this.toggleControls();
  }

  startTouchMove = (e) => {
    this.touchStart = e.changedTouches[0].clientX;
    this.touchPosition = this.touchStart;
  }

  touchMove = (e) => {
    this.touchPosition = e.changedTouches[0].clientX;
  }

  touchEnd = () => {
    let distance = this.touchStart - this.touchPosition;
    if (distance > 0 && distance >= this.sensitivity) {
      this.next();
    }
    if (distance < 0 && distance * -1 >= this.sensitivity) {
      this.prev();
    }
  }


  listeners = () => {
    const resizeHandler = debaunce.debaunce(this.resizeHandler, 200);
    this.$slider.addEventListener('click', this.clickHandler);
    this.$slider.addEventListener('touchstart', (e) => { this.startTouchMove(e) });
    this.$slider.addEventListener('touchmove', (e) => { this.touchMove(e) });
    this.$slider.addEventListener('touchend', () => { this.touchEnd() });
    window.addEventListener('resize', resizeHandler);
  }
}

class Galeria {
  constructor(id) {
    this.$galeria = document.querySelector(id);
    this.init();
  }

  init = () => {

    if (!this.$galeria) {
      return;
    }
    this.modal = new GaliriaModal('#galeriaModal');
    //this.modal.openGaleriaModal(srcImg);
    this.listeners();
    //./img/image/other/certificateBig
  }

  openModal = ($card) => {
    const srcBigImg = $card.dataset.imgBigSrc;
    this.modal.openGaleriaModal(srcBigImg);
  }
  clickHandler = (e) => {
    const $target = e.target;
    if ($target.closest('[data-img-big-src]')) {
      const $card = $target.closest('[data-img-big-src]')
      this.openModal($card)
    }
  }
  listeners = () => {
    this.$galeria.addEventListener('click', this.clickHandler)
  }
}

class Product {
  constructor() {
    this.init();
  }
  init = () => {
    this.$totalItemInBasket = document.querySelector('#totalItemInBasket');
    this.response = null;
    this.$products = null;
    this.listeners();
  }

  addBasket = async ($product) => {
    const data = this.getData($product);
    this.response = await server.addBsasket(data);
    this.$products = document.querySelectorAll(`[data-product="${data.id}"]`)

    if (this.response.rez == 0) {
      console.log(`Ошибка: ${this.response.error.id}`);
      errorModal.showError(this.response.error.desc);
    }
    if (this.response.rez == 1) {
      this.setTotalItemInBasket(this.response.card.count);
      this.setProductsQuantity(this.response.content[0].count);
      basket.setTotalBasketPrice(this.response.card);
      if ($product.dataset.inBasket == 0) {
        this.changeProductsBtnToCounter();
        basket.addProdutCardInBasket(this.response.content[0]);
      }
    }

  }

  postQuantity = debaunce.debaunce(async (data) => {
    this.response = await server.addBsasket(data);
    if (this.response.rez == 0) {
      console.log(`Ошибка: ${this.response.error.id}`);
      return;
    }
    this.setProductsQuantity(this.response.content[0].count);
    basket.setTotalBasketPrice(this.response.card);
  }, 300)


  dec = ($product) => {
    const data = this.getData($product);
    this.$products = document.querySelectorAll(`[data-product="${data.id}"]`);
    if (data.count == 1) {
      return;
    }
    data.count -= 1;
    this.setProductsQuantity(data.count);
    this.postQuantity(data);
  }

  inc = ($product) => {
    const data = this.getData($product);
    this.$products = document.querySelectorAll(`[data-product="${data.id}"]`);
    data.count += 1;
    this.setProductsQuantity(data.count);
    this.postQuantity(data);
  }

  changeValue = ($product) => {
    const data = this.getData($product);
    this.$products = document.querySelectorAll(`[data-product="${data.id}"]`);
    this.setProductsQuantity(data.count);
    this.postQuantity(data);
  }

  setProductsQuantity = (quantity) => {
    this.$products.forEach(($item) => {
      $item.querySelector('[data-product-input]').value = quantity;
    })
  }

  changeProductsBtnToCounter = () => {
    this.$products.forEach(($item) => {
      this.hideProductBtn($item);
      this.showProductCounter($item);
      this.changeInBasket($item);
    })
  }
  changeProductsCounterToBtn = () => {
    this.$products.forEach(($item) => {
      this.hideProductCounter($item);
      this.showProductBtn($item);
      this.changeInBasket($item);
    })
  }

  changeInBasket = ($product,) => {
    if ($product.dataset.inBasket == 0) {
      $product.dataset.inBasket = 1;
    }
    if ($product.dataset.inBasket == 1) {
      $product.dataset.inBasket = 0;
    }

  }
  showProductBtn = ($product) => {
    $product.querySelector('[data-in-basket-btn]').classList.remove('product-card__btn--hide');
  }
  hideProductBtn = ($product) => {
    $product.querySelector('[data-in-basket-btn]').classList.add('product-card__btn--hide');
  }

  showProductCounter = ($product) => {
    $product.querySelector('[data-counter]').classList.remove('product-counter--hide');
  }

  hideProductCounter = ($product) => {
    $product.querySelector('[data-counter]').classList.add('product-counter--hide');
  }

  setTotalItemInBasket = (count) => {
    if (!this.$totalItemInBasket) {
      return;
    }
    this.$totalItemInBasket.innerHTML = count;
    this.toggleBasketIndicator(count);
  }

  toggleBasketIndicator = (count) => {
    if (count) {
      this.showBasketIndicator();
    } else {
      this.hideBasketIndicator();
    }
  }

  hideBasketIndicator = () => {
    this.$totalItemInBasket.classList.add('nav-icon__count--empty');
  }

  showBasketIndicator = () => {
    this.$totalItemInBasket.classList.remove('nav-icon__count--empty');
  }

  getData = ($product) => {
    const value = $product.querySelector('[data-product-input]').value;
    return {
      id: $product.dataset.product,
      count: this.checkValue(value),
    }
  }

  removeProduct = (id) => {
    this.$products = document.querySelectorAll(`[data-product="${id}"]`);
    this.changeProductsCounterToBtn();

  }

  checkValue = (value) => {
    value = parseInt(value)
    if (isNaN(value)) {
      value = 1;
    }
    if (value <= 1) {
      value = 1;
    }
    return value;
  }

  clickHandler = (e) => {
    const $target = e.target;
    if ($target.closest('[data-in-basket-btn]')) {
      const $product = $target.closest('[data-product]');
      this.addBasket($product);
    }

    if ($target.closest('[data-dec]')) {
      const $product = $target.closest('[data-product]');
      this.dec($product);
    }

    if ($target.closest('[data-inc]')) {
      const $product = $target.closest('[data-product]');
      this.inc($product);
    }

    //if ($target.closest('[data-delete-product]')) {
    //  const $product = $target.closest('[data-product]');
    //  this.removeProduct($product);
    //}
  }

  inputHandler = (e) => {
    const $target = e.target;
    if ($target.closest('[data-product-input]')) {
      const $product = $target.closest('[data-product]');
      this.changeValue($product);
    }
  }

  changeHandler = (e) => {
    const $target = e.target;
    if ($target.closest('[data-product-input]')) {
      const $product = $target.closest('[data-product]');
      this.changeValue($product);
    }
  }

  listeners = () => {
    document.addEventListener('click', this.clickHandler);
    document.addEventListener('input', this.inputHandler);
    document.addEventListener('change', this.inputHandler);
  }
}

class Basket {
  constructor(basketId) {
    this.$basket = document.querySelector(basketId);
    this.init();
  }

  init = () => {
    if (!this.$basket) {
      return;
    }

    this.$basketList = document.querySelector('#basketList');
    this.$totalBasketPrice = document.querySelector('[data-total-basket-price]');
    this.$totalBasketDiscont = document.querySelector('[data-total-basket-discont]');
    this.confirmationModal = new ConfirmationModal('#confirmationModal');
    this.$confirmationModal = document.querySelector('#confirmationModal');
    this.blockEmptyBasket = document.querySelector('#emptyBasket');
    this.confirmationQuestion = 'Это дествия очистить Вашу карзину. Удалить все товары?';
    this.listeners();
  }

  addProdutCardInBasket = (cardData) => {
    if (!this.$basketList) {
      return;
    }
    render.renderBasketCard(this.$basketList, cardData);
  };

  clearBasket = async () => {
    const response = await server.clearBasket();
    if (response.rez == 0) {
      console.log(`Ошибка: ${response.error.id}`);
      errorModal.showError(response.error.desc);

    }
    if (response.rez == 1) {
      this.confirmationModal.showConfirmation(this.confirmationQuestion);

    }
  }
  showBlockEmptyBasket = () => {
    this.blockEmptyBasket.classList.remove('basket-empty--hide');
  }

  deleteProduct = async ($product) => {
    const id = $product.dataset.product;
    this.response = await server.removeProduct(id);
    if (this.response.rez == 0) {
      console.log(`Ошибка: ${this.response.error.id}`);
      errorModal.showError(this.response.error.desc);
    }

    if (this.response.rez == 1) {
      render.delete($product);
      product.removeProduct(id);
      product.setTotalItemInBasket(this.response.card.count);
      this.setTotalBasketPrice(this.response.card);
    }
  }
  deleteBasketContent = () => {
    if (!this.$basket) {
      return;
    }
    render.clearParent(this.$basket);
    this.showBlockEmptyBasket();
    window.scrollTo(0, 0);

  }

  setTotalBasketPrice = (cardData) => {
    const totalPrice = (+cardData.total_price).toLocaleString();
    const discont = (+cardData.price_old - +cardData.total_price).toLocaleString();
    if (this.$totalBasketPrice) {
      this.$totalBasketPrice.innerHTML = `${totalPrice} ₽`
    }
    if (this.$totalBasketDiscont) {
      this.$totalBasketDiscont.innerHTML = `Ваша скидка ${discont} ₽`
    }
  }
  answerHandler = (btn) => {
    const answer = +btn.dataset.answer;
    if (answer) {
      this.confirmationModal.close();
      this.deleteBasketContent();
      product.setTotalItemInBasket(0)
      this.showBlockEmptyBasket();
    } else {
      this.confirmationModal.close();
    }
  }

  clickHandler = (e) => {
    if (e.target.closest('[data-clear-basket]')) {
      this.clearBasket();
    }
    if (e.target.closest('[data-delete-product]')) {
      const $product = e.target.closest('[data-product]');
      this.deleteProduct($product);
    }
    if (e.target.closest('[data-answer]')) {
      const answerBtn = e.target.closest('[data-answer]');
      this.answerHandler(answerBtn)
    }
  }

  listeners = () => {
    this.$basket.addEventListener('click', this.clickHandler);
    this.$confirmationModal.addEventListener('click', this.clickHandler)
  }

}

class Dropdown {
  constructor() {
    this.$openedDropdown = null;
    this.init();
  }

  init = () => {
    this.listeners();
  }

  open = ($dropdown) => {
    if ($dropdown != this.$openedDropdown) {
      this.close();
    }
    const $btn = $dropdown.querySelector('[data-dropdown-btn]');
    const $body = $dropdown.querySelector('[data-dropdown-body]');
    const $content = $dropdown.querySelector('[data-dropdown-content]');
    const widthContent = $content.offsetHeight;
    $btn.classList.add('select-arrow-up');
    $body.style.height = widthContent + 'px';
    $dropdown.dataset.dropdown = 'open';
    this.$openedDropdown = $dropdown;
  }

  close = () => {
    if (!this.$openedDropdown) {
      return;
    }
    const $btn = this.$openedDropdown.querySelector('[data-dropdown-btn]');
    const $body = this.$openedDropdown.querySelector('[data-dropdown-body]');
    $body.style.height = '0px';
    $btn.classList.remove('select-arrow-up');
    this.$openedDropdown.dataset.dropdown = 'close';
    this.$openedDropdown = null;
  }

  toggleDropdown = ($dropdown) => {
    if (!$dropdown) {
      this.close();
      return;
    }
    if ($dropdown.dataset.dropdown === 'close') {
      this.open($dropdown);
      return;
    }
    if ($dropdown.dataset.dropdown === 'open') {
      this.close();
      return;
    }
  }

  setDeliveryCompany = ($radio) => {
    const $dropdown = $radio.closest('[data-dropdown]');
    const $selectTitle = $dropdown.querySelector('[data-select-title]');
    const value = $radio.value;
    $selectTitle.innerHTML = value;
    this.close()
  }

  clickHandler = (e) => {
    if (e.target.closest('[data-dropdown-btn]')) {
      const $dropdown = e.target.closest('[data-dropdown]');
      this.toggleDropdown($dropdown)
    }
    if (!e.target.closest('[data-dropdown]')) {
      const $dropdown = e.target.closest('[data-dropdown]');
      this.toggleDropdown($dropdown)
    }
  }

  changeHandler = (e) => {
    if (e.target.closest('[data-radio ]'))
      this.setDeliveryCompany(e.target.closest('[data-radio ]'));
  }

  listeners = () => {
    document.addEventListener('click', this.clickHandler);
    document.addEventListener('change', this.changeHandler);
  }
}
const server = new Server();
const render = new Render();
const debaunce = new Debaunce()
const searchModal = new SearchModal('#searchModal');
const supportModal = new CommunicationModal('#supportModal', '#supportModalForm');
const succsesModal = new SuccsesModal('#succsesModal');
const confirmationModal = new ConfirmationModal('#confirmationModal');
const ordenModal = new CommunicationModal('#orderModal', '#orderModalForm');
const errorModal = new ErrorModal('#errorModal');
const feedBackForm = new FormPage('#feedbackForm');

const bigBgImg = new BigBgImg('#servise');
const advantages = new Advantages('#advantages');



const certificatesSlider = new Slider('#certificates');
const reviewsSlider = new Slider('#reviewsSlider');
const productSlider = new Slider('#productSlider');


const certificatesGaleria = new Galeria('#certificates');

const product = new Product();
const basket = new Basket('#basket');

const dropdown = new Dropdown();




if ($searchOpenBtn && $searchModal) {
  $searchOpenBtn.addEventListener('click', openSearchModal);
}

if ($supportModalBtn && $supportModalBtn) {
  $supportModalBtn.addEventListener('click', openSupportModal);
}


if ($orderModalBtn && $orderModal) {
  $orderModalBtn.addEventListener('click', openOrderModal);
}


function openSearchModal() {
  searchModal.openSearchModal()
}

function openSupportModal() {
  supportModal.open()
}
function openOrderModal() {
  ordenModal.open();
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
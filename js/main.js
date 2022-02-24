'use strict';
const $body = document.querySelector('body');
const $searchOpenBtn = document.querySelector('#searchOpenBtn');
const $searchModal = document.querySelector('#searchModal');
//const $supportModalBtn = document.querySelector('#supportModalBtn');
const $supportModal = document.querySelector('#supportModal');
const $orderModalBtn = document.querySelector('#orderModalBtn');
const $orderModal = document.querySelector('#orderModal');

const $queryModal = document.querySelector('#orderModal');

const $mobileMenu = document.querySelector('#mobileMenu');
const $mobileMenuBtn = document.querySelector('#mobileMenuBtn');

const $openCityModal = document.querySelector('#openCityModal');

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
    this.regionsApi = '../json/regions.json';
    this.cityApi = '../json/city.json';
    this.citiesDataApi = '../json/cityData.json';
    this.fastOrderApi = '../json/getProd.json';
    this.addFavoriteApi = '../json/addFavorite.json';
    this.addBasketApi = '../json/addBasket.json';
    this.clearBasketApi = '../json/clearBasket.json';
    this.searchApi = '../json/search.json';
    this.removeProductApi = '../json/removeBasket.json';
    this.menuApi = '../json/sidebar.json';
    //this.sidebarApi = '/json/sidebar.json';
    this.filterApi = '../json/filter.json';
    this.filterCheckboxApi = '../json/checkbox.json';
    this.catalogApi = '../json/catalog.json';
  }

  getMenu = async () => {
    const data = {
      _token: this._token
    }
    const formData = this.createFormData(data);
    return await this.getResponse(this.POST, formData, this.catalogApi);
  }

  getRegions = async () => {
    const data = {
      _token: this._token
    }
    const formData = this.createFormData(data);
    return await this.getResponse(this.POST, formData, this.regionsApi);
  }

  getCities = async (value) => {
    const data = {
      value: value,
      _token: this._token
    }
    const formData = this.createFormData(data);
    return await this.getResponse(this.POST, formData, this.cityApi);
  }

  getCitiesData = async () => {
    const data = {
      _token: this._token
    }
    const formData = this.createFormData(data);
    return await this.getResponse(this.POST, formData, this.citiesDataApi);
  }

  getPropertyData = async (data) => {
    data._token = this._token;
    const formData = this.createFormData(data);
    return await this.getResponse(this.POST, formData, this.filterApi);
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
    this.$clearBtn = this.$inputFileBlock.querySelector('[data-clear-file]');
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

class MainScreen {
  constructor(id) {
    this.$mainVideo = document.querySelector(id);
    this.init()
  }

  init = () => {
    if (!this.$mainVideo) {
      return;
    }

    this.$headerSlider = document.querySelector('#headerSlider');
    this.$activeSlide = this.$headerSlider.querySelector('.header__slide--show');

    this.$mainVideoNav = document.querySelector('#mainVideoNav');
    this.$src = this.$mainVideo.querySelector('source');
    this.$activeTab = this.$mainVideoNav.querySelector('.header-tab--active');
    this.$activeLine = this.$activeTab.querySelector('[data-progress]');
    this.$tab = null;
    this.idx = 1;
    this.listener();
  }

  changeSlide = () => {
    this.$activeSlide.classList.remove('header__slide--show');
    const $slide = this.$headerSlider.querySelector(`[data-slide="${this.idx}"]`);
    $slide.classList.add('header__slide--show');
    this.$activeSlide = $slide;
  }

  changeVideo = () => {
    this.$tab = this.$mainVideoNav.querySelector(`[data-idx="${this.idx}"]`);
    if (this.$tab.classList.contains('header-tab--active')) {
      return;
    }
    const src = this.$tab.dataset.videoTab;

    this.$src.src = src;
    this.$mainVideo.load();
    this.clearProgressLine()
    this.setActiveTab();

  }

  animationProgressLine = () => {
    if (isNaN(this.$mainVideo.duration)) {
      return;
    }
    const progress = this.$mainVideo.currentTime / this.$mainVideo.duration * 100;
    this.$activeLine.style.width = Math.round(progress) + '%';
  }

  clearProgressLine = () => {
    this.$activeLine.style.width = '0%';
  }

  autoChangeVideo = () => {
    this.idx++;
    if (this.idx > this.$mainVideoNav.children.length) {
      this.idx = 1;
    }
    this.changeVideo();
    this.changeSlide();
  }

  clickChangeVideo = () => {
    this.idx = this.$tab.dataset.idx;

    this.changeVideo();
    this.changeSlide();
  }

  setActiveTab = () => {
    this.$activeTab.classList.remove('header-tab--active');
    this.$tab.classList.add('header-tab--active');
    this.$activeTab = this.$tab;
    this.$activeLine = this.$activeTab.querySelector('[data-progress]');
  }

  clickHandler = (e) => {
    const $target = e.target
    if ($target.closest('[data-video-tab]')) {
      this.$tab = $target.closest('[data-video-tab]');
      this.clickChangeVideo()
    }
  }

  listener = () => {
    this.$mainVideoNav.addEventListener('click', this.clickHandler);
    this.$mainVideo.addEventListener('timeupdate', this.animationProgressLine);
    this.$mainVideo.addEventListener('ended', this.autoChangeVideo);
  }
}

class Render {
  constructor($parent = null) {
    this.$parent = $parent;
    this.declForTotalFindedItem = ['', 'а', 'ов'];
    //this.spinnerText = '';
  }



  //Методы отресовки элементов
  renderSpiner = (spinnerText = '', $parent = this.$parent) => {
    this._render($parent, this.getSpinnerHtml, spinnerText);
  }

  renderErrorMessage = (messageText = '', $parent = this.$parent) => {
    this._render($parent, this.getErrorMessageHtml, messageText);
  }

  renderCatalogList = (catalogList) => {
    this._render(this.$parent, this.getModalCatalogHtml, catalogList);
  }

  renderTotalFindedItem = (count, $parent = this.$parent) => {
    this._render($parent, this.getTotalFindedItemHtml, count);
  }

  renderSearchResultAll = (cards) => {
    this._render(this.$parent, this.getSearchResultAllWrapHtml);
    const $resultAllWrap = this.$parent.querySelector('[data-result-all]')
    this.renderSearchResultCards($resultAllWrap, cards);
  }

  renderRegions = (regionsList) => {
    this._render(this.$parent, this.getRegionsHtml, regionsList);
  }

  renderCityList = (cityList) => {
    this._render(this.$parent, this.getCityListHtml, cityList);
  }

  renderSearchResultCards = ($parent, cards) => {
    this._render($parent, this.getSearchResultCardHtml, false, cards);
  }

  renderSearchResultProducts = (cards) => {
    this._render(this.$parent, this.getSearchResultProductWrapHtml);
    const $resultProductsWrap = this.$parent.querySelector('[data-search-products]');
    this.renderProductCards($resultProductsWrap, cards);
  }

  renderProperty = (propertyList, $list) => {
    this._render($list, this.getPropertyListHtml, false, propertyList);
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

  getModalCatalogHtml = (catalogList) => {
    let list = '';
    catalogList.forEach((item) => {
      list += this.getCatalogListHtml(item);
    })


    return (/*html*/`
      <ul class="header-catalog__list">
        ${list}
      </ul>
    `)


  }

  getCatalogListHtml = (list) => {
    let ul = '';
    if (list.isSubmenu) {
      ul = this.getSubcatalogUlHtml(list.isSubmenu);
    }

    return (/*html*/`
      <li class="header-catalog__item">
        <a href="${list.slug}" class="header-catalog__link header-catalog__link--with-sublist">
          ${list.title}
        </a>
        ${ul}
      </li>
    `)


  }

  getSubcatalogUlHtml = (subcatalogList) => {
    let list = ''
    subcatalogList.forEach((item) => {
      list += this.getSubcatalogListHtml(item)
    })


    return (/*html*/`
     <ul class="header-catalog__sublist">
      ${list}
    </ul>
   `)
  }

  getSubcatalogListHtml = (li) => {
    let ul = ''
    if (li.isSubmenu) {
      ul = this.getSubcatalogUlHtml(li.isSubmenu);
    }

    return (/*html */`
      <li class="header-catalog__item">
          <a href="${li.slug}" class="header-catalog__link header-catalog__link--with-sublist">
          ${li.title}
          </a>
          ${ul}
      </li>
    `)
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
    return (/*html*/
      `<div data-id="${card.id}" class="product-card">
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
  </div>`
    )
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

  getRegionsHtml = (regionList) => {
    const regeonListHtml = this.getListHtml(this.getRegionHtml, regionList)
    return (/*html*/`
    <div class="region-list">
      ${regeonListHtml}
    </div>`)
  }
  getCityListHtml = (cityList) => {
    const cityListHtml = this.getListHtml(this.getAreaItemHtml, cityList)
    return (/*html*/`
    <ul class="region-list">
      ${cityListHtml}
    </ul>`)
  }

  getPropertyListHtml = (property) => {
    const isCheck = property.checked ? 'checked' : ''
    return (/*html*/`
      <li data-filter-item="${property.field_value_name}" class="dropdown__item">
        <label class="filter__label">
          <input data-checkbox-input type="checkbox" class="filter__checkbox" name="Матерьял" ${isCheck} value="Лист">
          <span data-name class="dropdown__link dropdown__item-link">${property.field_value_name}</span>
        </label>
      </li>
    `)

  }

  getRegionHtml = (region) => {
    const areaList = this.getListHtml(this.getAreaHtml, region.area);
    return (/*html*/`
    <div class="region">
      <h4 class="region__title">
      ${region.title}
      </h4>
      <ul  class="region__list">
        ${areaList}
      </ul>
    </div>`)
  }

  getAreaHtml = (area) => {
    const cityList = this.getListHtml(this.getAreaItemHtml, area.parent);
    return (/*html*/`
    <li class="region__item">
      <div data-area="close" class="area">
        <h5 data-area-btn class="area__title">
          ${area.title}
        </h5>
        <div data-area-body class="area__body">
          <ul data-area-list class="area__list">
            ${cityList}
          </ul>
        </div>
      </div>
    </li>
    `)
  }

  getAreaItemHtml = (city) => {
    return (/*html*/`
    <li class="area__item">
        <a href="${city.slug}" class="area__city">
        ${city.title}
        </a>
      </li>
    `)
  }

  getInfoModalErrorHtml = (errorMessage) => {
    const errorMsg = 'Произошла ошибка, попробуйте позже.';
    const message = errorMessage ? errorMessage : errorMsg
    return ( /*html*/`
      <p class="info-modal__text white-color">${message}</p>
      <p class="info-modal__subtext white-color">Вы можете с вязаться с нами по телефону <a href="tel:+78987775544" class="info-modal__link white-color">+7 898 777 55 44</a> или написат нам на почту <a href="mailto:info@ntmk.ru" class="info-modal__link white-color">info@ntmk.ru</a></p>
    `)
  }

  getInfoModalSuccsesHtml = (message) => {
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

  getListHtml = (getHtmlFn, arr) => {
    let list = '';
    arr.forEach((item) => {

      list += getHtmlFn(item);
    })

    return list;
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
    if (target.closest('[data-clear-file]')) {
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

class HeaderModal {
  constructor(modalId) {
    this.$modal = document.querySelector(`#${modalId}`);
    this.$target = document.querySelector(`[data-header-modal-id="${modalId}"]`);

    this.init();
  }

  init = () => {
    if (!this.$modal && !this.$target) {
      return;
    }
    this.$modalInner = this.$modal.querySelector('[data-modal-inner]')
    this.$targetParent = this.$target.closest('[data-nav-item]');
    this.listener();
  }


  open = () => {
    this.$modal.classList.add('header-modal--show');
    this.$target.classList.add('header-nav__item--action');
  }
  close = () => {
    this.$modal.classList.remove('header-modal--show');
    this.$target.classList.remove('header-nav__item--action');
  }

  targetParentLeaveHandler = (e) => {

    const relatedTarget = e.relatedTarget ? e.relatedTarget.closest('[data-modal-inner]') : null
    if (!(e.target === this.$targetParent && relatedTarget)) {
      this.close()
    }
  }

  modalLeaveHandler = (e) => {
    const relatedTarget = e.relatedTarget ? e.relatedTarget.closest('[data-nav-item]') : null
    if (!(e.target === this.$modalInner && relatedTarget === this.$targetParent)) {
      this.close();
    }
  }
  listener = () => {
    this.$target.addEventListener('mouseover', this.open);
    this.$modalInner.addEventListener('mouseleave', this.modalLeaveHandler);
    this.$targetParent.addEventListener('mouseleave', this.targetParentLeaveHandler);
  }

}

class CatalogModal extends HeaderModal {
  constructor(modalId) {
    super(modalId)
    this.init()
  }

  init = () => {
    if (!this.$modal && !this.$target) {
      return;
    }
    this.response = null;
    this.$catalogList = this.$modal.querySelector('[data-catalog-list]');
    this.render = new Render(this.$catalogList);
    this.listener();
  }

  createCatalog = async () => {
    if (this.$catalogList.children.length) {
      return;
    }
    this.render.renderSpiner('Загружаю...');
    this.response = await server.getMenu();
    if (this.response.rez == 0) {
      this.render.clearParent();
      console.log(`Ошибка: ${this.response.error.id}`)
      this.render.renderErrorMessage(this.response.error.desc)
    }
    if (this.response.rez == 1) {
      this.render.clearParent();
      this.render.renderCatalogList(this.response.content)
    }
  }

  hoverHandler = () => {
    this.createCatalog()
  }

  listener = () => {
    this.$target.addEventListener('mouseover', this.hoverHandler);
  }
}

class CityModal extends HeaderModal {
  constructor(modalId) {
    super(modalId);
    this.init()
  }

  init = () => {
    if (!this.$modal && !this.$target) {
      return;
    }
    this.regionsData = null;
    this.cityData = null;
    this.$input = this.$modal.querySelector('#searchCityInput');
    this.$regionList = this.$modal.querySelector('[data-region-list]');
    this.$cityList = this.$modal.querySelector('[data-city-list]');
    this.regionRender = new Render(this.$regionList);
    this.cityRender = new Render(this.$cityList);
    this.$area = null;
    this.$areaBtn = null;
    this.$areaBody = null;
    this.$areaList = null;
    this.listener();
  }

  createRegions = async () => {
    if (this.$regionList.children.length) {
      return;
    }
    this.regionRender.renderSpiner('Загружаю...');
    this.regionsData = await server.getRegions();
    if (this.regionsData.rez == 0) {
      this.regionRender.clearParent();
      console.log(`Ошибка: ${this.regionsData.error.id}`)
      this.regionRender.renderErrorMessage(this.regionsData.error.desc)
    }
    if (this.regionsData.rez == 1) {
      this.regionRender.clearParent();
      this.regionRender.renderRegions(this.regionsData.content);
    }
  }

  createCityList = async () => {
    const value = this.getValue();

    if (value === '') {
      this.switchRegionToCity()
      return;
    }

    this.cityRender.clearParent();
    this.cityRender.renderSpiner('Идет поиск...');
    this.switchCityToRegion();
    this.cityData = await server.getCities(value);
    if (this.cityData.rez == 0) {
      this.cityRender.clearParent();
      console.log(`Ошибка: ${this.cityData.error.id}`);
      this.cityRender.renderErrorMessage(this.cityData.error.desc);
    }
    if (this.cityData.rez == 1) {
      this.cityRender.clearParent();
      this.cityRender.renderCityList(this.cityData.content)

    }
  }

  switchRegionToCity = () => {
    this.$regionList.style.display = 'block';
    this.$cityList.style.display = 'none';
  }

  switchCityToRegion = () => {
    this.$regionList.style.display = 'none';
    this.$cityList.style.display = 'block';
  }

  toggleAreaList = () => {
    this.$area = this.$btn.closest('[data-area]');
    this.$areaBody = this.$area.querySelector('[data-area-body]');
    this.$areaList = this.$area.querySelector('[data-area-list]');
    if (this.$area.dataset.area === 'close') {
      this.openAreaList();
      return;
    }
    if (this.$area.dataset.area === 'open') {
      this.closeAreaList();
      return;
    }
  }
  getValue = () => {
    return this.$input.value.trim().toLowerCase();
  }
  openAreaList = () => {
    const heightList = this.$areaList.offsetHeight;
    this.$area.dataset.area = 'open';
    this.$areaBody.style.height = heightList + 'px';

    this.$btn.classList.add('area__title--open');
  }
  closeAreaList = () => {
    this.$area.dataset.area = 'close';
    this.$areaBody.style.height = 0 + 'px';
    this.$btn.classList.remove('area__title--open');
  }

  clickHandler = (e) => {
    if (e.target.closest('[data-area-btn]')) {
      this.$btn = e.target.closest('[data-area-btn]');
      this.toggleAreaList();
    }
    if (e.target.closest('[data-close]')) {
      this.close()
    }
  }

  hoverHandler = () => {
    this.createRegions()
  }

  inputHandler = () => {
    this.createCityList();
  }


  listener = () => {
    const inputHandler = debaunce.debaunce(this.inputHandler, 1000)
    this.$modal.addEventListener('click', this.clickHandler);
    this.$target.addEventListener('mouseover', this.hoverHandler);
    this.$modal.addEventListener('input', inputHandler);
    this.$modal.addEventListener('change', inputHandler);
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
    this.form = new Form(this.formId);
    this.listeners();
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

class QueryModal extends Modal {
  constructor(modalId, formId) {
    super(modalId);
    this.formId = formId;
    this.init();
  }

  init = () => {
    if (!this.$modal) {
      return;
    }
    this.$modalBody = this.$modal.querySelector('[data-modal-body]');
    this.form = new Form(this.formId);
    this.listeners()
  }

  clickHandler = (e) => {
    const $target = e.target
    //if ($target.closest('[data-submit]')) {
    //  this.sendForm();
    //  errorModal.close();
    //}
    if ($target.hasAttribute('data-close')) {

      this.close();
      errorModal.close();
    }
  }

  listeners = () => {
    this.$modal.addEventListener('click', this.clickHandler)
  }
}

class MobileMenu extends Modal {
  constructor(modalId) {
    super(modalId);
    this.init();
  }

  init = () => {
    if (!this.$modal) {
      return;
    }
    this.$modalBody = this.$modal.querySelector('[data-modal-body]');
    this.listeners()
  }

  clickHandler = (e) => {
    if (e.target.hasAttribute('data-close')) {
      this.close();
    }
    if (e.target.closest('#orderBtn')) {
      this.close();
      ordenModal.open()
    }

    if (e.target.closest('#supportBtn')) {
      this.close();
      supportModal.open();
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
    this.curentBigImgSrc = $card.dataset.bigImgSrc;


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
    this.$card = null
    this.listener()
  }

  openCard = () => {
    this.$card.classList.remove('advantage-card--hover');
    if (this.$card.dataset.card === 'open') {
      return;
    }
    this.openingCardAnimations();
    this.$card.dataset.card = 'open';


  }

  closeCard = () => {
    this.$card.classList.remove('advantage-card--hover');
    if (this.$card.dataset.card === 'close') {
      return;
    }
    this.closingCardAnimations();
    this.$card.dataset.card = 'close';
    setTimeout(() => {
      this.$card.classList.add('advantage-card--hover');
    }, 900)
  }


  // анимации элементов для открытия
  openingCardAnimations = () => {
    this.disclosureCard();
    this.showCloseBtn();
    this.hideStiker()
    this.imgWithOpenAnimation();
    this.showContentBlock('text');
    setTimeout(() => {
      this.showContentBlock('cards');
    }, 100);
    setTimeout(() => {
      this.showContentBlock('roll-up');
    }, 200)

  }

  disclosureCard = () => {

    const cardHeight = this.$card.offsetHeight;

    const cardContentHeight = this.$card.querySelector('[data-content]').offsetHeight;
    const sizeFluctuation = cardContentHeight * 10 / 100;
    this.$card.style.transition = 'height 0.2s ease-in-out';
    this.$card.style.height = (cardHeight - sizeFluctuation) + 'px';
    setTimeout(() => {
      this.$card.style.transition = '0.5s ease';
      this.$card.style.height = (cardContentHeight + sizeFluctuation) + 'px';
    }, 200);
    setTimeout(() => {
      this.$card.style.transition = ' 0.2s ease-out';
      this.$card.style.height = cardContentHeight + 'px';
    }, 700);
    setTimeout(() => {
      this.$card.style.transition = '';
    }, 900);
  }

  showCloseBtn = () => {
    const $closeBtn = this.$card.querySelector('[data-close-btn]');
    $closeBtn.style.transition = 'opacity 0.7s ease-in 0.3s, right ease-in-out 0.5s 0.3s';
    $closeBtn.style.opacity = '1';
    $closeBtn.style.right = '60px';
    setTimeout(() => {
      $closeBtn.style.transition = 'right ease-in-out 0.2s';
      $closeBtn.style.right = '40px';
    }, 800);
    setTimeout(() => {
      $closeBtn.style.transition = '';
    }, 900);
  }

  hideStiker = () => {
    const $stiker = this.$card.querySelector('[data-stiker]');
    $stiker.style.transition = 'transform 0.2s ease-in';
    $stiker.style.transform = 'translate(20px, 0)';
    setTimeout(() => {
      $stiker.style.transition = 'opacity 0.3s ease-in, transform 0.3s ease-in';
      $stiker.style.transform = 'translate(-150px, 0)';
      $stiker.style.opacity = '0';
    }, 200);

    setTimeout(() => {
      $stiker.style.transition = '';
    }, 600);

  }

  showContentBlock = (dataSelector) => {
    const $block = this.$card.querySelector(`[data-${dataSelector}]`);
    $block.style.transition = 'opacity 0.6s ease-in 0.2s, transform ease-in-out 0.5s 0.2s';
    $block.style.opacity = '1';
    $block.style.transform = ' translate(0, -20px)';
    setTimeout(() => {
      $block.style.transition = 'transform ease-in 0.2s';
      $block.style.transform = 'translate(0, 0px)';
    }, 700);
    setTimeout(() => {
      $block.style.transition = '';
      $block.style.transform = 'translate(0, 0px)';
    }, 900);

  }

  imgWithOpenAnimation = () => {
    const $img = this.$card.querySelector('[data-img]');
    const imgHeight = $img.offsetHeight;
    const maxHeight = 450;
    const sizeFluctuation = imgHeight * 10 / 100;

    $img.style.transition = 'height 0.2s ease-in-out';
    $img.style.height = imgHeight - sizeFluctuation + 'px'
    setTimeout(() => {
      $img.style.transition = 'height 0.5s ease';
      $img.style.height = maxHeight + sizeFluctuation + 'px'
    }, 200);
    setTimeout(() => {
      $img.style.transition = 'height 0.2s ease-out';
      $img.style.height = maxHeight + 'px'
    }, 700);
    setTimeout(() => {
      $img.style.transition = '';
    }, 900);

  }

  // анимации элементов для закрытия
  closingCardAnimations = () => {

    this.hideContentBlock('roll-up');
    setTimeout(() => {
      this.hideContentBlock('cards');
    }, 100);
    setTimeout(() => {
      this.hideContentBlock('text');
    }, 200);

    setTimeout(() => {
      this.collapsingCard();
      this.hideCloseBtn();
      this.showStiker();
      this.imgWithCloseAnimation();
    }, 300)
  }

  collapsingCard = () => {
    const cardHeight = this.$card.offsetHeight;
    const sizeFluctuation = cardHeight * 5 / 100;
    this.$card.style.transition = 'height 0.2s ease-in-out';
    this.$card.style.height = (cardHeight + sizeFluctuation) + 'px';
    setTimeout(() => {
      this.$card.style.transition = 'height 0.5s ease-in-out';
      this.$card.style.height = '';
    }, 200);
    setTimeout(() => {
      this.$card.style.transition = '';
    }, 900);
  }

  hideCloseBtn = () => {
    const $closeBtn = this.$card.querySelector('[data-close-btn]');
    $closeBtn.style.transition = 'right ease-in-out 0.2s';
    $closeBtn.style.right = '60px';
    setTimeout(() => {
      $closeBtn.style.transition = 'opacity 0.7s ease-in, right ease-in-out 0.7s';
      $closeBtn.style.opacity = '';
      $closeBtn.style.right = '';
    }, 200);
    setTimeout(() => {
      $closeBtn.style.transition = '';
    }, 900);
  }

  showStiker = () => {
    const $stiker = this.$card.querySelector('[data-stiker]');
    $stiker.style.transition = 'opacity 0.3s ease-in 0.2s, transform 0.3s ease-in 0.2s';
    $stiker.style.transform = '';
    $stiker.style.opacity = '';
    setTimeout(() => {
      $stiker.style.transition = '';
    }, 600);

  }

  imgWithCloseAnimation = () => {
    const $img = this.$card.querySelector('[data-img]');
    const imgHeight = $img.offsetHeight;
    const sizeFluctuation = imgHeight * 6 / 100;

    $img.style.transition = 'height 0.2s ease-in-out';
    $img.style.height = (imgHeight + sizeFluctuation) + 'px';
    setTimeout(() => {
      $img.style.transition = 'height 0.5s ease-in-out';
      $img.style.height = ''
    }, 200);
    setTimeout(() => {
      $img.style.transition = '';
    }, 900);
  }

  hideContentBlock = (dataSelector) => {
    const $block = this.$card.querySelector(`[data-${dataSelector}]`);
    $block.style.transition = 'transform ease-in 0.2s';

    $block.style.transform = 'translate(0, -20px)';
    setTimeout(() => {
      $block.style.transition = 'opacity 0.7s ease-in-out, transform ease-in 0.5s';
      $block.style.opacity = '';
      $block.style.transform = '';
    }, 200);
    setTimeout(() => {
      $block.style.transition = '';
    }, 900);

  }


  clickHandler = (e) => {
    const $target = e.target;
    if ($target.closest('[data-card]')) {
      this.$card = $target.closest('[data-card]');
      this.openCard();
    }
    if ($target.closest('[data-close-btn]') || $target.closest('[data-roll-up]')) {
      this.$card = $target.closest('[data-card]');
      this.closeCard();
    }
  }

  setCardHeight = () => {
    if (this.$card && this.$card.dataset.card === 'open') {
      const cardContentHeight = this.$card.querySelector('[data-content]').offsetHeight;
      this.$card.style.height = cardContentHeight + 'px';
    }

  }


  listener = () => {
    const setCardHeight = debaunce.debaunce(this.setCardHeight, 200);
    this.advantages.addEventListener('click', this.clickHandler);
    window.addEventListener('resize', () => {
      setCardHeight();
    })
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

    this.$dotsWrap = this.$slider.querySelector('[data-dots-track]');
    this.$activeDot = this.$slider.querySelector('.partners-slider__item--active');
    this.displaySlides = this.setDisplaySlides(this.$slider, this.$slides[0]);
    this.displayDotSlides = this.setDisplaySlides(this.$dotsWrap, this.$activeDot);
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
    this.trackShift(this.$slides[0]);
    if (this.$activeDot) {
      this.moveDotTrack();
    }
  }

  next = () => {
    if (this.i >= this.$slides.length - this.displaySlides) {
      return;
    }
    this.i++;
    this.toggleArrow();
    this.trackShift(this.$slides[0]);
    if (this.$activeDot) {
      this.moveDotTrack();
    }

  }

  toggleControls = () => {
    if (this.$controls)
      if (this.displaySlides >= this.$slides.length) {
        this.$controls.classList.add('hide-arrow');
      } else {
        this.$controls.classList.remove('hide-arrow');
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
    $arrow.classList.add('hide-arrow');
  }

  showArrow = ($arrow) => {
    if (!$arrow) {
      return;
    }
    $arrow.classList.remove('hide-arrow');
  }
  moveDotTrack = () => {
    this.changeActiveDot();
    if (this.i - 1 >= this.$slides.length - this.displayDotSlides) {
      return;
    }
    this.dotsTrackShift(this.$activeDot);
  }

  trackShift = ($slide) => {
    const trackShift = this.getShift($slide);
    this.$track.style.transform = `translate(-${trackShift}px, 0)`;
  }

  dotsTrackShift = ($slide) => {
    const trackShift = this.getShift($slide);
    this.$dotsWrap.style.transform = `translate(-${trackShift}px, 0)`;
  }

  getShift = ($slide) => {
    const step = this.getSlideWidth($slide);
    return this.i * step;
  }

  getSlideWidth = ($slide) => {
    const slideWidth = $slide.offsetWidth;
    const slideMarginRight = parseInt(getComputedStyle($slide, true).marginRight);
    const slideMarginLeft = parseInt(getComputedStyle($slide, true).marginLeft);
    return slideWidth + slideMarginRight + slideMarginLeft;
  }

  setDisplaySlides = ($slider, $slide) => {
    if (!$slider) {
      return;
    }
    const sliderWidth = $slider.offsetWidth;
    const slideWidth = this.getSlideWidth($slide)
    return Math.ceil(sliderWidth / slideWidth);
  }

  dotsControl = ($dot) => {
    this.i = $dot.dataset.dot;
    this.trackShift(this.$slides[0]);
    this.changeActiveDot();

  }

  changeActiveDot = () => {
    const $dot = this.$slider.querySelector(`[data-dot="${this.i}"]`)
    this.$activeDot.classList.remove('partners-slider__item--active');

    this.$activeDot = $dot;

    this.$activeDot.classList.add('partners-slider__item--active');
  }

  clickHandler = (e) => {
    const $target = e.target;
    if ($target.hasAttribute('data-prev')) {
      this.prev();
    }

    if ($target.hasAttribute('data-next')) {
      this.next();
    }

    if ($target.closest('[data-dot]')) {
      const $dot = $target.closest('[data-dot]');
      this.dotsControl($dot);
    }
  }

  resizeHandler = () => {
    this.displaySlides = this.setDisplaySlides(this.$slider, this.$slides[0]);
    this.displayDotSlides = this.setDisplaySlides(this.$dotsWrap, this.$activeDot);
    this.i = 0;
    this.trackShift(this.$slides[0]);
    this.toggleControls();
    this.toggleArrow();
    if (this.$dotsWrap) {
      this.changeActiveDot();
      this.dotsTrackShift(this.$activeDot);
    }


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
    if (e.target.closest('[data-radio]'))
      this.setDeliveryCompany(e.target.closest('[data-radio]'));
  }

  listeners = () => {
    document.addEventListener('click', this.clickHandler);
    document.addEventListener('change', this.changeHandler);
  }
}
class Filters {
  constructor(filtersWrapId) {
    this.$filtersWrap = document.querySelector(filtersWrapId);
    this.init();
  }

  init = () => {
    if (!this.$filtersWrap) {
      return;
    }
    this.categoryId = this.$filtersWrap.dataset.categoryId;
    this.searchProductsInput =
      this.listeners();
  }

  open = async ($filter) => {
    if (!$filter.dataset.loading) {
      await this.createPropsList($filter);
    }
    this.openList($filter);
  }

  openList = ($filter) => {
    const $btn = $filter.querySelector('[data-filter-btn]');
    const $body = $filter.querySelector('[data-filter-body]');
    const $content = $filter.querySelector('[data-filter-content]');
    const widthContent = $content.offsetHeight;
    $btn.classList.add('dropdown__top--active');
    $body.style.height = widthContent + 'px';
    $filter.dataset.filter = 'open';
  }

  close = ($filter) => {
    const $btn = $filter.querySelector('[data-filter-btn]');
    const $body = $filter.querySelector('[data-filter-body]');
    $body.style.height = '0px';
    $btn.classList.remove('dropdown__top--active');
    $filter.dataset.filter = 'close';
  }

  toggleFilter = ($filter) => {
    if ($filter.dataset.filter === 'close') {
      this.open($filter);
      return;
    }
    if ($filter.dataset.filter === 'open') {
      this.close($filter);
      return;
    }
  }

  createPropsList = async ($filter) => {
    const $list = $filter.querySelector('[data-filter-list]');
    render.clearParent($list);
    render.renderSpiner('Идет загрузка...', $list);
    const data = {
      categotyId: this.categoryId,
      filterId: $filter.dataset.filterId,
    }

    const response = await server.getPropertyData(data);
    if (response.rez === 0) {
      console.log(`Ошибка: id ${response.error.id}`);
      render.clearParent($list);
      render.renderErrorMessage(response.error.desc, $list)
    }
    if (response.rez === 1) {
      render.clearParent($list);
      render.renderProperty(response.content, $list);
      $filter.dataset.loading = 1;
    }
  }

  searchProperty = ($input) => {
    const $filter = $input.closest('[data-filter]');
    const $propsList = $filter.querySelectorAll('[data-filter-item]')
    const value = $input.value.trim().toLowerCase();
    this.findProps($propsList, value);
  }

  findProps = ($propsList, value) => {
    $propsList.forEach(($item) => {
      const propsValue = $item.dataset.filterItem.trim().toLowerCase();
      console.log(value, propsValue)
      if (propsValue.includes(value)) {
        this.showProperty($item);


      } else {
        this.hideProperty($item);
      }
    })
  }

  showProperty = ($property) => {
    $property.classList.remove('dropdown__item--hide');
  }

  hideProperty = ($property) => {
    $property.classList.add('dropdown__item--hide');
  }
  clickHandler = (e) => {
    if (e.target.closest('[data-filter-btn]')) {
      const $filter = e.target.closest('[data-filter]');
      this.toggleFilter($filter);
    }
  }

  inputHandler = (e) => {
    if (e.target.closest('[data-filter-search]')) {
      this.searchProperty(e.target);
    }
  }

  canselSubmit = (e) => {
    if (e.key == 'Enter') {
      e.preventDefault();
    }
  }

  keypressHandler = (e) => {
    if (e.target.closest('[data-filter-search]')) {

      this.canselSubmit(e);

    }
  }

  listeners = () => {
    this.$filtersWrap.addEventListener('click', this.clickHandler);
    this.$filtersWrap.addEventListener('input', this.inputHandler);
    this.$filtersWrap.addEventListener('change', this.inputHandler);
    this.$filtersWrap.addEventListener('keypress', this.keypressHandler);

  }
}

class FilterForm {
  constructor(id) {
    this.$form = document.querySelector(id);
    this.init();
  }

  init = () => {
    if (!this.$form) {
      return;
    }

    this.$inputsSearchList = this.$form.querySelectorAll('[data-search-input]');
    this.$filters = this.$form.querySelector('#filters');
    this.$filtersWrap = this.$form.querySelector('#filtersWrap');
    this.value = '';
    this.listeners();
  }

  openFilters = () => {
    this.$filters.classList.add('filters--closed');
    this.$filters.classList.add('filters--open');
  }

  closeFilters = () => {
    this.$filters.classList.remove('filters--open');
    setTimeout(() => {
      this.$filters.classList.remove('filters--closed');
    }, 300);
  }

  resetForm = () => {
    this.resetFilters();
    this.clearSearchInputs();
  }

  resetFilters = () => {
    const allFilters = this.$form.querySelectorAll('[data-checkbox-input]');
    allFilters.forEach((chechbox) => {
      if (chechbox.checked) {
        chechbox.checked = false;
      }
    })
  }

  setNewValue = () => {
    this.$inputsSearchList.forEach(($input) => {
      $input.value = this.value;
    })
  }

  changeSearchInputValue = ($input) => {
    this.value = $input.value;
    this.setNewValue();

  }

  clearSearchInputs = () => {
    this.value = '';
    this.setNewValue();
  }

  clickHandler = (e) => {
    if (e.target.closest('[data-reset]')) {
      this.resetForm();
    }

    if (e.target.closest('#openFiltersBtn')) {
      this.openFilters();
    }
    if (e.target.closest('[data-close]')) {
      this.closeFilters();
    }
  }

  changeHandler = (e) => {
    if (e.target.closest('[data-radio]')) {
      this.$form.submit();
    }
    if (e.target.closest('[data-search-input]')) {
      this.changeSearchInputValue(e.target);
    }
  }

  inputHandler = (e) => {
    if (e.target.closest('[data-search-input]')) {
      this.changeSearchInputValue(e.target);
    }

  }

  listeners = () => {
    this.$form.addEventListener('click', this.clickHandler);
    this.$form.addEventListener('change', this.changeHandler);
    this.$form.addEventListener('input', this.inputHandler);
  }
}

class About {
  constructor(aboutListId) {
    this.$about = document.querySelector(aboutListId);
    this.init();
  }
  init = () => {
    if (!this.$about) {
      return;
    }
    this.lastScroll = window.scrollY;
    this.$currentPic = this.$about.querySelector('#currentPic');
    this.$newPic = this.$about.querySelector('#newPic');
    this.$stages = this.$about.querySelectorAll('[data-stage]');
    this.currentStageNum = this.getCurrentStageNum();
    this.$currentStage = this.$stages[this.currentStageNum];
    this.$aboutMainImg = this.$about.querySelector('#aboutMainImg');
    this.$aboutShadow = document.querySelector('#aboutShadow');
    this.changeMainImgPosition();
    this.changeImg();
    this.listeners();
  }
  changeMainImgPosition = () => {
    const aboutCoord = this.$about.getBoundingClientRect();
    const pointChangePos = aboutCoord.bottom - document.documentElement.clientHeight;
    if (pointChangePos <= 0) {
      this.$aboutMainImg.classList.add('about-main-img--stop');
      this.$aboutShadow.classList.add('about__shadow--hide');
    } else {
      this.$aboutMainImg.classList.remove('about-main-img--stop');
      this.$aboutShadow.classList.remove('about__shadow--hide');
    }

  }
  toggleImg = () => {
    if (window.scrollY > this.lastScroll) {
      this.changePicWhenScrollDown();
    } else {
      this.changePicWhenScrollUp();
    }
    this.lastScroll = window.scrollY;
  }

  changePicWhenScrollDown = () => {
    if (this.currentStageNum >= this.$stages.length - 1) {
      return;
    }
    const coord = this.$currentStage.getBoundingClientRect();
    if (coord.y < 50) {
      this.currentStageNum = this.currentStageNum + 1;
      this.$currentStage = this.$stages[this.currentStageNum];
      this.changeImg()
    }
  }

  changePicWhenScrollUp = () => {
    if (this.currentStageNum <= 0) {
      return;
    }
    const coord = this.$stages[this.currentStageNum - 1].getBoundingClientRect();
    if (coord.y > 0) {
      this.currentStageNum = this.currentStageNum - 1;
      this.$currentStage = this.$stages[this.currentStageNum];
      this.changeImg()
    }
  }

  changeAndShowNewPic = (src) => {
    this.$newPic.src = src;
    this.$newPic.style.transition = 'opacity 0.3s';
    this.$newPic.style.opacity = '1';
  }

  changeCurrentPic = (src) => {
    this.$currentPic.src = src;
  }

  hideNewPic = () => {
    this.$newPic.style.transition = '';
    this.$newPic.style.opacity = '0';
  }

  changeImg = () => {
    const src = this.$currentStage.dataset.src;
    this.changeAndShowNewPic(src);
    setTimeout(() => {
      this.changeCurrentPic(src);
      this.hideNewPic()
    }, 300);

  }

  getCurrentStageNum = () => {
    let currentStageNum = null;
    for (let i = 0; i <= this.$stages.length - 1; i++) {
      const coord = this.$stages[i].getBoundingClientRect();
      if (coord.y > 0) {
        currentStageNum = +this.$stages[i].dataset.stage;
        break;
      }
    }

    if (currentStageNum === undefined || currentStageNum === null) {
      currentStageNum = this.$stages.length - 1;
    }

    return currentStageNum;
  };


  listeners = () => {
    document.addEventListener('scroll', this.changeMainImgPosition);
    document.addEventListener('scroll', this.toggleImg);
  }
}

class Description {
  constructor(id) {
    this.$desc = document.querySelector(id);
    this.init();
  }

  init = () => {
    if (!this.$desc) {
      return;
    }
    this.$descWrap = this.$desc.querySelector('#descTextWrap');
    this.$descText = this.$desc.querySelector('#descText');
    this.$btn = this.$desc.querySelector('#descBtn');
    this.listeners();
  }
  open = () => {
    const descTextHeight = this.$descText.offsetHeight;
    this.$descWrap.style.height = descTextHeight + 'px';
    this.$btn.innerHTML = 'Свернуть'
    this.$btn.classList.add('about-company__blink--open')
    this.$descWrap.dataset.status = 'open';
  }
  close = () => {
    this.$descWrap.style.height = '';
    this.$btn.innerHTML = 'Развернуть';
    this.$btn.classList.remove('about-company__blink--open');
    this.$descWrap.dataset.status = 'close';
  }

  toggleDesc = () => {
    if (!this.$descWrap) {
      return;
    }

    if (this.$descWrap.dataset.status === 'close') {
      this.open();
    } else if (this.$descWrap.dataset.status === 'open') {
      this.close();
    }

  }
  clickHandler = (e) => {
    if (e.target.closest('#descBtn')) {
      this.toggleDesc()
    }
  }

  listeners = () => {
    this.$desc.addEventListener('click', this.clickHandler);
  }
}

class AboutMap {
  constructor(mapId) {
    this.$map = document.querySelector('#' + mapId);
    this.mapId = mapId;
    this.init();
  }

  init = () => {
    if (!this.$map) {
      return;
    }
    this.currentCityCoords = this.$map.dataset.coord.split(',');
    this.map = null;
    this.response = null;
    this.baseSettingsMap = {
      center: [63, 104],
      zoom: 3,
      controls: ['zoomControl'],
    }
    this.zoneMap = {
      restrictMapArea: [
        [80, 0],
        [20, 220]
      ],
    }

    this.createMap();

  }

  createMap = async () => {
    this.response = await server.getCitiesData();
    if (this.response.rez === 0) {
      console.log('Ошибка: id ' + this.response.error.id);
      ymaps.ready(this.initMapWithOneCity);
    }
    if (this.response.rez === 1) {
      ymaps.ready(this.initMapWithAllCities);
    }
  }

  initMapWithAllCities = async () => {
    this.map = new ymaps.Map(
      this.mapId,
      this.baseSettingsMap,
      this.zoneMap
    );
    this.map.behaviors.disable('scrollZoom');
    this.map.panes.append('greyBackground', this.getBgColor());
    this.map.geoObjects.add(await this.getCountryArea('RU', '#3b3f45', '#212f41'));
    this.map.geoObjects.add(await this.getCountryArea('KZ', '#33363a', '#212f41'));

    const geoObjectList = this.getMarkList()
    const clusterer = this.getClusterer();
    this.map.geoObjects.add(clusterer);
    clusterer.add(geoObjectList);
  }

  initMapWithOneCity = async () => {
    this.map = new ymaps.Map(
      this.mapId,
      this.baseSettingsMap,
      this.zoneMap
    );

    this.map.behaviors.disable('scrollZoom');
    this.map.panes.append('greyBackground', this.getBgColor());
    this.map.geoObjects.add(await this.getCountryArea('RU', '#3b3f45', '#212f41'));
    this.map.geoObjects.add(await this.getCountryArea('KZ', '#33363a', '#212f41'));
    this.map.geoObjects.add(this.getCurrentCityMark());
  }

  getBgColor = () => {
    return new ymaps.pane.StaticPane(this.map, {
      zIndex: 100, css: {
        width: '100%', height: '100%', backgroundColor: '#212f41'
      }
    });
  }

  getCountryArea = async (iso, bgColor, bdColor) => {
    const country = await ymaps.borders.load(iso, {
      lang: 'ru'
    });

    const regions = new ymaps.GeoObjectCollection(null, {
      fillColor: bgColor,
      strokeColor: bdColor,
      hasHint: false,
      cursor: 'arrow'
    });

    for (let i = 0; i < country.features.length; i++) {
      regions.add(new ymaps.GeoObject(country.features[i]));
    }
    return regions
  }

  getCurrentCityMark = () => {

    const coord = this.$map.dataset.coord.split(',');
    const nameCity = this.$map.dataset.city;
    const markHtml = ymaps.templateLayoutFactory.createClass(
      `<div class="map-mark map-mark--active">
        <span class="map-mark__content">$[properties.iconContent]</span>
      </div>
      `
    );

    const options = {
      "iconLayout": "default#imageWithContent",
      "iconImageHref": "../img/icon/star.svg",
      "iconImageSize": [50, 50],
      "iconImageOffset": [-17, -26],
      "iconContentOffset": [0, 0]
    }
    options.iconContentLayout = markHtml

    const mark = new ymaps.Placemark(
      coord,
      {
        "iconContent": nameCity
      },
      options
    );
    //mark.events.add('click', function (e) {
    //  location = e.get('target').options.get('href');
    //});
    return mark;
  }

  getClusterer = () => {
    return new ymaps.Clusterer({
      clusterOpenBalloonOnClick: false,
      clusterDisableClickZoom: true,
      minClusterSize: 200,
    });
  }

  getMarkList = () => {
    return this.response.content.map((item) => {
      const cls = item.current ? 'map-mark map-mark--active' : 'map-mark';
      let markHtml = ymaps.templateLayoutFactory.createClass(
        `
  			  <div class="${cls}">
  					<span class="map-mark__content">$[properties.iconContent]</span>

  				</div>
  				`
      );
      const options = item.options
      options.iconContentLayout = markHtml

      const mark = new ymaps.Placemark(
        item.coord,
        item.propertis,
        options
      );
      mark.events.add('click', function (e) {
        location = e.get('target').options.get('href');
      });
      return mark;
    });
  }

}

class ContactMap {
  constructor(mapId) {
    this.$map = document.querySelector('#' + mapId);
    this.mapId = mapId;
    this.init();
  }

  init = () => {

    this.createMap();

  }

  createMap = () => {
    this.map = new google.maps.Map(this.$map, {
      center: { lat: -34.397, lng: 150.644 },
      zoom: 8,
    });

  }

  initMap = () => {
    //this.map = new ymaps.Map(
    //  this.mapId,
    //  this.baseSettingsMap,
    //);
  }


}

const server = new Server();
const render = new Render();
const debaunce = new Debaunce();
const mainScreen = new MainScreen('#mainVideo');
const searchModal = new SearchModal('#searchModal');
const supportModal = new CommunicationModal('#supportModal', '#supportModalForm');
const succsesModal = new SuccsesModal('#succsesModal');
const confirmationModal = new ConfirmationModal('#confirmationModal');
const ordenModal = new CommunicationModal('#orderModal', '#orderModalForm');
const mobileMenu = new MobileMenu('#mobileMenu')

const queryModal = new QueryModal('#queryModal', '#queryModalForm');
const errorModal = new ErrorModal('#errorModal');

const catalogModal = new CatalogModal('headerCatalogModal');
const cityModal = new CityModal('selectCityModal');

const feedBackForm = new FormPage('#feedbackForm');
const productionOrderForm = new FormPage('#productionOrderForm');

const bigBgImg = new BigBgImg('#servise');
const advantages = new Advantages('#advantages');

const partnersSlider = new Slider('#partnersSlider');
const certificatesSlider = new Slider('#certificates');
const reviewsSlider = new Slider('#reviewsSlider');
const productSlider = new Slider('#productSlider');


const certificatesGaleria = new Galeria('#certificates');

const product = new Product();
const basket = new Basket('#basket');

const dropdown = new Dropdown();
const filters = new Filters('#filtersWrap');
const filterForm = new FilterForm('#filterForm');
const about = new About('#about');
const aboutMap = new AboutMap('aboutMap');
//const contactMap = new ContactMap('contactMap');
const description = new Description('#description');

if ($searchOpenBtn && $searchModal) {
  $searchOpenBtn.addEventListener('click', openSearchModal);
}

if ($supportModal) {
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-support-btn]')) {
      openSupportModal()
    }
  });
}

if ($orderModalBtn && $orderModal) {
  $orderModalBtn.addEventListener('click', openOrderModal);
}

if ($queryModal) {
  document.addEventListener('click', openQueryModal);
}

if ($mobileMenu && $mobileMenuBtn) {
  $mobileMenuBtn.addEventListener('click', openMobileModal);
}


if ($openCityModal) {
  $openCityModal.addEventListener('click', openCityModal);
}



function openSearchModal() {
  searchModal.openSearchModal();
}

function openSupportModal() {
  supportModal.open();
}
function openOrderModal() {
  ordenModal.open();
}

function openCityModal() {
  cityModal.open();
}

function openMobileModal() {
  mobileMenu.open();
}

function openQueryModal(e) {
  if (e.target.closest(`[data-query-btn]`)) {
    queryModal.open();
  }

}


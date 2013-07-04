/******************************************************
 * Copyright 2013 by Abaddon <abaddongit@gmail.com>
 * @author Abaddon <abaddongit@gmail.com>
 * @version 1.0.0
 * @description js - плагин для автоподгрузки контента
 *  при достижении конца страницы
 * @params:
 *  controllerUrl - адрес php файла куда отправляются запросы
 *  responceType - тип возвращаемых данных(html, json)
 *  indentToScroll - высота от конца стрицы, с которой
 *   начинает срабатывать автоподгрузка
 *  elementSelector - селектор прокручиваемых элементов
 *   по умолчанию div
 *  start - начальная страница пагинации
 *  controller - название контроллера, если название не
 *   указано, то название берется из url-ла
 *  limit - сколько подгружать записей
 *  hidePager - если установлено 0 то вместо автоподгрузки
 *   выводится ссылка по нажатию на которую происзодит
 *   подгрузка
 *  pagerText - текст кнопки для подгрузки
 *  noPagerTest - Текст выводится когда больше не хрена подгружать
 *  pagerTpl - html блок кнопки
 *  dop - сюда можно писать любые значения в виде объекта
 *   они будут переданны в качестве параметров запроса
 *  inBlock - выводит контент внутри блока, автоподгрузка
 *   расчитывается относительно этого блока, а не от окна
 *  blockHeihgt - высота блока со скроллом
 *  inverScroll - переворачивает автоподгрузку
 *   при загрузке скрол показывается в самом низу страницы
 *   и автоподгрузка срабатыват когда поднимается вверх
 ******************************************************/
/*global window, $, jQuery, document */
(function($) {
    "use strict";
    function miniScroll(o, conf) {
        this.el = o;
        this.pager = o.find('.pager');
        this.option = conf;
        this.elCount = 0;
        this.scroll = false;
        //Чистим все по дефолту
        this.destroy();
        //Инициализация
        this.init(this.option);
    }

    /*****************************
     *Ф-я инициализации плагина
     * @description на страницу добавляется блок
     *  pager с необходимыми данными
     *  и регистрируются события
     *  прокрутки
     *****************************/
    miniScroll.prototype.init = function() {
        this.buildUI();
        this.bindUIEvents();
    };
    /********************************************
     * Ф-я чистки
     * @description Очищает все события и 
     *  необходимые элементы
     *******************************************/
    miniScroll.prototype.destroy = function() {
        $(window).unbind('scroll', $.proxy(this, 'onScroll'));
        $(window).unbind('scroll', $.proxy(this, 'topScroll'));
        this.el.unbind('scroll', $.proxy(this, 'topScroll'));
        this.el.unbind('scroll', $.proxy(this, 'onBlockScroll'));
        this.pager.unbind('click', $.proxy(this, 'onClick'));
        this.pager.remove();
        this.elCount = 0;
        this.scroll = false;

    };
    /**********************************************
     * Ф-я создания интерфейса для раьоты плагина
     * @description Добавляет необходимые блоки и 
     *  перестраивает старые в зависимости от 
     *  вызова плагина
     **********************************************/
    miniScroll.prototype.buildUI = function() {
        var el = this.el, conf = this.option, elCount, offset;

        if (conf.controller === '') {
            //берем название контроллера из адреса
            conf.controller = window.location.pathname;
        }

        //Подсчитывем кол-во элементов внутри контейнера
        elCount = this.elementCount();

        //Если кол-во элементов меньше чем лимит то не выводит pager
        if (elCount >= conf.limit) {

            //Если надо включать подгрузку по скроллу вверх

            //Если прокрутка должна считаться внутри какого-то блока, а не относительно окна
            if (conf.inBlock === 1) {
                //ставим элементу фиксированную высоту и вертикальный скролл
                if (conf.blockHeihgt !== 0) {
                    el.css({'height': conf.blockHeihgt, 'overflow-y': 'scroll'});
                }
                //если нужно инвертировать скролл то перемещаем ползунок ввниз блока
                if (conf.inverScroll === 1) {
                    //переметываем страницу в самый низ
                    el.scrollTop($(document).height());
                }
            } else {
                //если нужно инвертировать скролл то перемещаем ползунок ввниз страницы
                if (conf.inverScroll === 1) {
                    //переметываем страницу в самый низ
                    $(document.body).animate({scrollTop: $(document).height()}, 10);
                }
            }

            //Добаляем pager в контейнер
            if (this.pager[0] === undefined) {
                if (conf.inverScroll === 1) {
                    el.prepend(conf.pagerTpl);
                } else {
                    el.append(conf.pagerTpl);
                }

                this.pager = el.find('.pager');
            }

            //заполняем pager дефолтовыми настройками
            offset = Math.max(conf.start - 1, 0) * conf.limit;//offset
            this.pager.data({'limit': conf.limit, 'offset': offset, 'start': conf.start, 'controller': conf.controller});

            //Смотрим показывать ли pager
            if (conf.hidePager === 1) {
                this.pager.css('display', 'none');
            } else {
                this.pager.text(conf.pagerText);
            }

            //разрешаем скролл
            this.scroll = true;
        } else {
            //запрещаем скролл
            this.scroll = false;
        }
    };
    /************************************************
     * Ф-я подсчитывает кол-во скроллерного элемента
     ***********************************************/
    miniScroll.prototype.elementCount = function() {
        this.elCount = this.el.children(this.option.elementSelector).length;
        return this.elCount;
    };
    /*****************************************************
     * Ф-я регистрации событий
     * @description Регистрирует необходимые 
     *  события в нужном контексте
     ****************************************************/
    miniScroll.prototype.bindUIEvents = function() {
        if (this.scroll) {
            if (this.option.hidePager === 1) {
                if (this.option.inBlock === 1) {
                    if (this.option.inverScroll === 1) {
                        this.el.bind('scroll', $.proxy(this, 'topScroll'));
                    } else {
                        this.el.bind('scroll', $.proxy(this, 'onBlockScroll'));
                    }
                } else {
                    if (this.option.inverScroll === 1) {
                        $(window).bind('scroll', $.proxy(this, 'topScroll'));
                    } else {
                        $(window).bind('scroll', $.proxy(this, 'onScroll'));
                    }
                }
            } else {
                this.pager.bind('click', $.proxy(this, 'onClick'));
            }
        }
    };
    /************************************************
     * Ф-я отправляет запрос при включенном pager-ре
     * @description отправляет запрос при клики на
     *  pager 
     ***********************************************/
    miniScroll.prototype.onClick = function() {
        //отправляем запрос по клику
        this.request();
    };

    /************************************************
     * Ф-я отправляет запрос при скролле внутри блока 
     ***********************************************/
    miniScroll.prototype.onBlockScroll = function() {
        var scrollTop = this.el.scrollTop() + this.option.indentToScroll, block_height = this.el[0].clientHeight, scrollHeight = this.el[0].scrollHeight;

        if (scrollTop >= scrollHeight - block_height) {
            this.request();
        }
    };
    /**************************************************
     * Ф-я отправляет запрос при скролле вверх страницы 
     *************************************************/
    miniScroll.prototype.topScroll = function() {
        var scrollTop;

        if (this.option.inBlock === 1) {
            scrollTop = $(this.el).scrollTop();
        } else {
            scrollTop = $(window).scrollTop();
        }
        if (scrollTop === 0) {
            this.request();
        }
    };
    /*****************************************************
     * Ф-я отправляет запрос при скролле относительно окна 
     *****************************************************/
    miniScroll.prototype.onScroll = function() {
        var scrollTop = $(window).scrollTop() + this.option.indentToScroll, wind_height = $(window).height(), page_height = $(document).height();
        if (scrollTop >= page_height - wind_height) {
            this.request();
        }
    };
    /****************************************************
     * Расширяет объект который передается на сервер в 
     *  качестве параметров
     * @param {Object} val базовый объект с настройками
     ***************************************************/
    miniScroll.prototype.extendData = function(val) {
        if (this.option.dop !== undefined) {
            val = $.extend({}, val, this.option.dop);
        }
        return val;
    };

    miniScroll.prototype.preparePreloder = function() {
        var elWidth = this.el.width(),
                preloder = '<div class="preloder" style="position: fixed; width: ' + elWidth + 'px; text-align: center;" ><img style="" src="' + this.option.preloderPath + '" /></div>';
        return preloder;
    }

    /************************************************
     * Ф-я отправляет запрос на сервер
     ***********************************************/
    miniScroll.prototype.request = function() {
        if (this.scroll === true) {
            var variable = {
                page: this.pager.data('start'),
                limit: this.pager.data('limit'),
                offset: this.pager.data('offset'),
                url: this.pager.data('controller'),
                userid: this.el.data('userid')
            }, o = this, pager = this.pager, conf = this.option, el = this.el, need, loaded;

            //пополняем дополнительными данными 
            variable = this.extendData(variable);

            //запрещаем скролл
            this.scroll = false;

            variable = conf.beforeSend(variable);

            //отправляем запрос на сервер
            $.ajax({
                type: 'POST',
                dataType: this.option.responceType,
                processData: true,
                url: this.option.controllerUrl,
                data: variable,
                cache: false,
                beforeSend: function() {
                    if (conf.preloder) {
                        var preloder = o.preparePreloder();

                        if (conf.inverScroll === 1) {
                            preloder = $(preloder).css('top', 0);
                        } else {
                            preloder = $(preloder).css('bottom', 0);
                        }
                        $(el).children(conf.elementSelector).last().after(preloder);
                    }
                },
                success: function(data) {
                    //ф-я доступная через конфиг

                    conf.success.call(this, data, el);

                    //Проверяем нужна ли еще подгрузка
                    need = conf.limit * (variable.page);//сколько должно быть
                    loaded = o.elementCount();//сколько всего загруженно
                    //console.log('complited');
                    //Если общее кол-во загруженных элементов меньше чем их должно быть, то удаляем pager
                    if (loaded < need) {
                        o.destroy();
                        //выводим сообщение, что больше прогружать не чего
                        if (conf.inverScroll === 1) {
                            el.children(conf.elementSelector).first().before(conf.noPagerTest);
                        } else {
                            el.children(conf.elementSelector).last().after(conf.noPagerTest);
                        }
                    } else {
                        //Если все норм, то вгоняем новые данные в pager и разрешаем прокрутку
                        conf.start++;
                        pager.data({'offset': Math.max(conf.start - 1, 0) * conf.limit, 'start': conf.start});
                        //запрещаем скролл
                        o.scroll = true;
                    }

                    //отматываем скролл вниз на высоту полученных элементов
                    if (conf.inverScroll === 1) {
                        var blocksHeight = el.find(conf.elementSelector).first().height() * conf.limit;

                        if (conf.inBlock === 1) {
                            $(el).scrollTop(blocksHeight);
                        } else {
                            $(document.body).animate({scrollTop: blocksHeight}, 10);
                        }
                    }

                    //Сносим прелодер
                    $('.preloder').remove();
                }
            });
        }
    };

    jQuery.fn.miniScroll = function(options) {
        //Дефолтовые настройки
        var def = {
            controllerUrl: '/index-ajax.php',
            responceType: 'html',
            indentToScroll: 300,
            elementSelector: 'div',
            start: 2,
            controller: '',
            limit: 3,
            hidePager: 1,
            pagerText: 'показать еще',
            noPagerTest: 'Больше нет!',
            pagerTpl: '<a class="pager"></a>',
            dop: {},
            inBlock: 0,
            inverScroll: 0,
            preloder: 1,
            preloderPath: 'assets/img/preloader.gif',
            blockHeihgt: 0,
            success: function(data, o) {
                //Добавляем полученные элементы перед pager 
                o.find('.pager').before(data);
            },
            beforeSend: function(total) {
                return total;
            }
        }, sc;

        //Расшииряем настройки по умолчанию, теми которые были переданны при вызове
        $.extend(def, options);
        return this.each(function() {
            sc = new miniScroll($(this), def);
        });
    };
}(jQuery));

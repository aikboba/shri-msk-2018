(function() {

    //Items List Objects
    function itemsList(listId)
    {
        var id = listId;
        var list = document.getElementById(id);
        var scrollControl = document.querySelector('[data-for = "' + id + '"]');
        var controlMethod = scrollControl.getAttribute("data-method");
        var scrollControlItem = scrollControl.getElementsByClassName('scroll-btn');
        var itemsCount = list.childElementCount;
        var items = list.getElementsByClassName('label-item');
        if ( controlMethod == 'vertical' )
        {
            var offsetMargin = items[1].offsetTop - items[0].offsetTop;
            var offsetProp = 'marginTop';
        }
        else if ( controlMethod == 'horizontal' )
        {
            var offsetMargin = items[1].offsetLeft - items[0].offsetLeft;
            var offsetProp = 'marginLeft';
        }
        var itemMargin = items[0].style[offsetProp];
        var currentItem = 0;

        return {
            init: function() {
                //Show scroll items controls
                if ( (list.scrollHeight > list.clientHeight || list.scrollWidth > list.clientWidth) && list.childElementCount > 1 )
                {
                    scrollControl.classList.add("active");
                }

                //Scroll actions
                for (var i = 0; i < scrollControlItem.length; i++)
                {//Loop controls (prev, next)
                    scrollControlItem[i].addEventListener('click', function () {

                        var controlDirect = this.getAttribute("data-direct");
                        var controlType = this.getAttribute("data-type");

                        switch(controlDirect) {
                            case 'next':
                                if ( controlMethod == 'vertical' || controlMethod == 'horizontal' ) {
                                    if (currentItem < (itemsCount - 1)) {
                                        itemMargin -= offsetMargin;
                                        items[0].style[offsetProp] = itemMargin + 'px';
                                        currentItem++;
                                    }
                                    if (currentItem >= (itemsCount - 1) && controlType !== null && controlType == 'dual') {
                                        this.classList.add("vice-versa");
                                        this.dataset.direct = "prev";
                                    }
                                }
                                break;

                            case 'prev':
                                if ( controlMethod == 'vertical' || controlMethod == 'horizontal' ) {
                                    if (currentItem > 0) {
                                        itemMargin += offsetMargin;
                                        items[0].style[offsetProp] = itemMargin + 'px';
                                        currentItem--;
                                    }
                                    if (currentItem <= 0 && controlType !== null && controlType == 'dual') {
                                        this.classList.remove("vice-versa");
                                        this.dataset.direct = "next";
                                    }
                                }
                                break;
                        }
                    });
                }
            }
        }
    }

    //Items List Objects Init
    var itemsListArr = [];
    var labelsList = document.getElementsByClassName('label-list');
    for (var i = 0; i < labelsList.length; i++) {
        itemsListArr[i] = itemsList(labelsList[i].getAttribute("id"));
        itemsListArr[i].init();
    }

    //Popups
    var popupsList = document.getElementsByClassName('label-item');
    for (var i = 0; i < popupsList.length; i++)
    {
        popupsList[i].addEventListener('click', function() {
            var target = this.getAttribute("data-for");
            var popup = document.getElementById(target);
            var type = this.getAttribute("data-type");
            var id = this.getAttribute("data-id");

            if ( target !== null && popup !== null && type !== null && id !== null )
            {
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        var devicesArr = JSON.parse(this.responseText);
                        var deviceData = devicesArr.filter(obj=>obj.id===id)[0];

                        switch(type) {
                            case 'lights':
                                var popupContent = '\
                                        <h3 class="popup-title">' + deviceData.name + '</h3>\
                                        <span class="popup-remark">' + deviceData.status + '</span>\
                                        <div class="tabs">\
                                            <button type="button" class="tab-item current-item">Вручную</button>\
                                            <button type="button" class="tab-item">Дневной свет</button>\
                                            <button type="button" class="tab-item">Вечерний свет</button>\
                                            <button type="button" class="tab-item">Рассвет</button>\
                                        </div>\
                                        <div class="temper-range-wrap">\
                                            <input\
                                                type="range" name="temperature"\
                                                id="temperRange" class="popup-range light-range"\
                                                min="0" max="100" value="' + deviceData.value + '"\
                                            />\
                                            <span class="vals min-val"><img src="static/graph/light-white-less.svg" alt="Свет" height="40" /></span>\
                                            <span class="vals max-val"><img src="static/graph/light-white.svg" alt="Свет" height="40" /></span>\
                                        </div>\
                                        <span class="current-value">\
                                            <img\
                                                src="static/graph/light.svg"\
                                                onerror="this.src=\'static/graph/light@2x.png\'"\
                                                alt="Свет"\
                                                height="40"\
                                            />\
                                        </span>';
                                break;

                            case 'floor':
                                var popupContent = '\
                                        <h3 class="popup-title">' + deviceData.name + '</h3>\
                                        <span class="popup-remark">' + deviceData.status + '</span>\
                                        <div class="reostat-wrap">\
                                            <div id="reostatContainer" class="reostat-container">\
                                                <div class="reostat-inner">\
                                                    <div id="rangeValue" class="current-val noselect">' + deviceData.value + '</div>\
                                                </div>\
                                                <div id="reostatIndicator" class="reostat-indicator"></div>\
                                            </div>\
                                        </div>\
                                        <span class="current-value">\
                                            <span>+' + deviceData.value + '</span>\
                                            <img\
                                                src="static/graph/temper.svg"\
                                                onerror="this.src=\'static/graph/temper@2x.png\'"\
                                                alt="Температура отопления"\
                                                height="40"\
                                            />\
                                        </span>';

                                break;

                            case 'temperature':
                                var popupContent = '\
                                        <h3 class="popup-title">' + deviceData.name + '</h3>\
                                        <span class="popup-remark">' + deviceData.status + '</span>\
                                            <div class="tabs">\
                                                <button type="button" class="tab-item current-item">Вручную</button>\
                                                <button type="button" class="tab-item">Холодно</button>\
                                                <button type="button" class="tab-item">Тепло</button>\
                                                <button type="button" class="tab-item">Жарко</button>\
                                            </div>\
                                            <div class="temper-range-wrap">\
                                                <input\
                                                    type="range" name="temperature"\
                                                    id="temperRange" class="popup-range temper-range"\
                                                    min="-10" max="30" value="' + deviceData.value + '"\
                                                    oninput="rangeValue.innerHTML=(this.value > 0 ? \'+\' : \'\') + this.value"\
                                                />\
                                                <span class="vals min-val">-10</span>\
                                                <span class="vals max-val">+30</span>\
                                            </div>\
                                            <span class="current-value">\
                                            <span id="rangeValue">+' + deviceData.value + '</span>\
                                            <img\
                                                src="static/graph/temper.svg"\
                                                onerror="this.src=\'static/graph/temper@2x.png\'"\
                                                alt="Температура отопления"\
                                                height="40"\
                                            />\
                                        </span>';
                                break;
                        }

                        document.getElementById('popupContent').innerHTML = popupContent;
                        fadeIn(popup, 500);
                        document.body.classList.add("popup-active");

                        var closeBtn = popup.getElementsByClassName('close-popup')[0];
                        var popupForm = popup.getElementsByTagName('form')[0];
                        closeBtn.addEventListener('click', function() {
                            fadeOut(popup, 500);
                            document.body.classList.remove("popup-active");
                        }, false);
                        popupForm.addEventListener('submit', function() {
                            fadeOut(popup, 500);
                            document.body.classList.remove("popup-active");
                            return false;
                        }, false);

                        if ( document.getElementById('reostatContainer') !== null )
                        {
                            var rheostat = new Rheostat('reostatContainer', 'reostatIndicator');
                            rheostat.addEvent('valueChanged', function(value){
                                var rangeValue = document.getElementById('rangeValue');
                                rangeValue.innerHTML = (value > 0 ? '+' : '') + value;
                            });
                        }
                    }
                };
                xmlhttp.open("GET", "/json/" + type + ".json", true);
                xmlhttp.send();
            }
        }, false);
    }

    //Functions
    //Popups
    function fadeIn(el, time) {
        el.style.opacity = 0;
        el.style.display = 'flex';

        var last = +new Date();
        var tick = function() {
            el.style.opacity = +el.style.opacity + (new Date() - last) / time;
            last = +new Date();

            if (+el.style.opacity < 1) {
                (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
            }
        };

        tick();
    }
    function fadeOut(el, time) {
        el.style.opacity = 1;

        var last = +new Date();
        var tick = function () {
            el.style.opacity = -el.style.opacity + (new Date() - last) / time;
            last = +new Date();

            if (-el.style.opacity > 0) {
                (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
            }
        };

        tick();
        el.style.display = 'none';
    }

})();
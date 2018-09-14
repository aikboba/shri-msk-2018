(function() {

    //Show scroll items controls
    var labelsList = document.getElementsByClassName('label-list');
    for (var i = 0; i < labelsList.length; i++)
    {
        var elId = labelsList[i].getAttribute("id");
        var height = document.getElementById(elId).clientHeight;
        var width = document.getElementById(elId).clientWidth;
        var contentHeight = document.getElementById(elId).scrollHeight;
        var contentWidth = document.getElementById(elId).scrollWidth;
        if ( (contentHeight > height || contentWidth > width) && labelsList[i].childElementCount > 1 )
        {
            document.querySelector('[data-for = "' + elId + '"]').classList.add("active");
        }
    }
    //Items scrolling
    /*var labelsScrollers = document.getElementsByClassName('label-list-scroller');
    for (var i = 0; i < labelsScrollers.length; i++)
    {
        labelsScrollers[i].addEventListener('click', function() {
            var target = this.getAttribute("data-for");
            var method = this.getAttribute("data-method");
            var direct = this.getAttribute("data-direct");
            var itemsList = document.getElementById(target);
            var itemsCount = itemsList.childElementCount;
            var items = itemsList.getElementsByClassName('label-item');
            var currentItem = items[1];

            scrollToElm( items, currentItem , 600 );
        });
    }*/

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
        var tick = function() {
            el.style.opacity = -el.style.opacity + (new Date() - last) / time;
            last = +new Date();

            if (-el.style.opacity > 0) {
                (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
            }
        };

        tick();
        el.style.display = 'none';
    }
    //Scroll
    function scrollToElm(container, elm, duration){
        var pos = getRelativePos(elm);
        scrollTo( container, pos.top , 2);  // duration in seconds
    }
    function getRelativePos(elm){
        var pPos = elm.parentNode.getBoundingClientRect(), // parent pos
            cPos = elm.getBoundingClientRect(), // target pos
            pos = {};

        pos.top    = cPos.top    - pPos.top + elm.parentNode.scrollTop,
            pos.right  = cPos.right  - pPos.right,
            pos.bottom = cPos.bottom - pPos.bottom,
            pos.left   = cPos.left   - pPos.left;

        return pos;
    }
    function scrollTo(element, to, duration, onDone) {
        var start = element.scrollTop,
            change = to - start,
            startTime = performance.now(),
            val, now, elapsed, t;

        function animateScroll(){
            now = performance.now();
            elapsed = (now - startTime)/1000;
            t = (elapsed/duration);

            element.scrollTop = start + change * easeInOutQuad(t);

            if( t < 1 )
                window.requestAnimationFrame(animateScroll);
            else
                onDone && onDone();
        };

        animateScroll();
    }
    function easeInOutQuad(t){ return t<.5 ? 2*t*t : -1+(4-2*t)*t }

})();
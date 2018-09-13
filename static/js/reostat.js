var Rheostat = new Class({
    Implements: [Events, Options],

    // Задаем опци по умолчанию.
    options: {
        radius: 80,

        // Диапазон величин регулируемого параметра.
        minValue: 0,
        maxValue: 100,

        // Ограничение углов вращения индикатора.
        minAngle: 50,
        maxAngle: 310,

        // Сдвиг нуля шкалы в градусах.
        angleOffset: -90,

        // Развернуть ли шкалу?
        reversed: true
    },

    // Константы для конвертирования градусов в радианы и наоборот.
    deg2rad: Math.PI / 180,
    rad2deg: 180 / Math.PI,

    // Флаг, указывающий на то, что мы зажали левую кнопку мыши на контроле.
    captured: false,

    angle: 0,
    mouseAngle: 0,
    oldMouseAngle: 0,

    // Конструктор.
    initialize: function(container, indicator, options){
        this.setOptions(options);
        this.indicator = $(indicator);
        this.container = $(container);

        // Добавляем обработку событий мыши.
        this.container.addEvents({
            'mousedown': this.captureMouse.bind(this),
            'mousewheel': this.handleWheel.bind(this),
        });

        document.addEvents({
            'mousemove': this.updateAngle.bind(this),
            'mouseup': this.releaseMouse.bind(this)
        });

        // Размер контейнера нам нужен для того, чтобы сместить систему координат индикатора
        // из левого верхнего угла контейнера в его центр.
        var containerSize = this.container.getSize();
        var indicatorSize = this.indicator.getSize();
        this.offset = {
            x: Math.floor(containerSize.x / 2) - Math.floor(indicatorSize.x / 2),
            y: Math.floor(containerSize.y / 2) - Math.floor(indicatorSize.y / 2)
        };

        // Угол по умолчанию в начало шкалы.
        this.angle = this.options.minAngle + this.options.angleOffset;
        this.updateIndicatorPosition();

        // Показываем спрятанный по умолчанию индикатор.
        this.indicator.fade('hide').fade('in');
    },

    // Обработка колесика мыши.
    handleWheel: function(e){
        // Вычисление угла.
        var wheelAngle = this.angle + e.wheel;
        if ((wheelAngle >= this.options.minAngle) && (wheelAngle <= this.options.maxAngle)){
            this.oldMouseAngle = this.mouseAngle = this.angle = wheelAngle;
            this.updateIndicatorPosition();
        }
    },

    // Запоминаем, что контрол захвачен мышью.
    captureMouse: function(e){
        this.captured = true;

        // Выставляем индикатор в место клика.
        var mouseAngle = this.getMouseAngle(e);
        if ((mouseAngle >= this.options.minAngle) && (mouseAngle <= this.options.maxAngle)){
            this.oldMouseAngle = this.mouseAngle = this.angle = mouseAngle;
            this.updateIndicatorPosition();
        }
    },

    // Стираем флаг захвата.
    releaseMouse: function(){
        this.captured = false;
    },

    // В этом методе считается угол по положению курсора мыши.
    getMouseAngle: function(e){
        var containerPosition = this.container.getPosition();

        // Катеты нашего треугольника.
        // К mouseLeft я прибавил 0.1 для того, чтобы избежать возможного деления на ноль впоследствии.
        var mouseLeft = e.client.x - this.offset.x - containerPosition.x + 0.1;
        var mouseTop = this.offset.y - e.client.y + containerPosition.y;

        // Вычисление угла наклона курсора (т.к. Math.atan() возвращает значение в радианах,
        // для более простого оперирования с ним переведем его в градусы).
        var angle = Math.atan(mouseTop / mouseLeft) * this.rad2deg;

        // Т.к. функция арктангенса может вернуть нам значения только от -90 до +90, то
        // если курсор находится в левой половине к углу прибавим 180. Иначе в левой половине
        // мы индикатор никогда не увидим.
        if (mouseLeft < 0)
            angle += 180;

        // Еще одна проверка, чтобы иметь сплошную последовательность значений от 0 до 360 градусов.
        if (angle < 0)
            angle += 360;

        return angle - this.options.angleOffset;
    },

    // Вычисляем угол поворота индикатора на основе направления движения курсора мыши.
    updateAngle: function(e){
        // Захвачен ли контрол мышью?
        if (this.captured){
            var mouseAngle = this.getMouseAngle(e);

            // Приращение угла индикатора.
            var diffAngle = mouseAngle - this.oldMouseAngle;

            // Проверка пересачения границ.
            if ((this.angle + diffAngle >= this.options.minAngle) && (this.angle + diffAngle <= this.options.maxAngle))
                this.angle += diffAngle;

            this.oldMouseAngle = this.mouseAngle = mouseAngle;
            this.updateIndicatorPosition();
        }
    },

    // Считаем значение в соответствии с заданными минимальным и максимальным значениями регулируемой величины.
    updateValue: function(){
        var value = Math.floor(
            (this.options.maxValue - this.options.minValue + 1) *
            (this.angle - this.options.minAngle) /
            (this.options.maxAngle - this.options.minAngle)
        );

        // Генерируем событие об изменившемся значении.
        this.fireEvent('valueChanged', (this.options.reversed) ? this.options.maxValue - value : value);
    },

    // Обновление положения индикатора.
    updateIndicatorPosition: function(){
        // Переводим угол в радианы для передачи его в Math.cos() и Math.sin().
        var radAngle = (this.angle + this.options.angleOffset) * this.deg2rad;
        var left = this.options.radius * Math.cos(radAngle) + this.offset.x;

        // Обратите внимание на знак "-". Этим мы разворачиваем ось y наоборот.
        var top = -this.options.radius * Math.sin(radAngle) + this.offset.y;

        // Позиционирование индикатора.
        this.indicator.setStyles({left: left, top: top});

        // Обновляем значение.
        this.updateValue();
    }
});
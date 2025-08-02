ymaps.ready(function () {
    const myMap = new ymaps.Map("yandex-map", {
      center: [58.0105, 56.2502], // Пример: Пермь (замени на координаты нужного места)
      zoom: 11,
      controls: ['zoomControl', 'fullscreenControl']
    });

    const myPlacemark = new ymaps.Placemark([58.0105, 56.2502], {
      hintContent: 'SYLVA RIVER',
      balloonContent: 'Загородные домики Sylva River'
    }, {
      preset: 'islands#greenDotIcon'
    });

    myMap.geoObjects.add(myPlacemark);
    myMap.behaviors.disable('scrollZoom'); // отключить зум колесом мыши
  });
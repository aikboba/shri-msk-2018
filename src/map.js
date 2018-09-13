import { loadList, loadDetails } from './api';
import { getDetailsContentLayout } from './details';
import { createFilterControl } from './filter';

export default function initMap(ymaps, containerId) {
  const myMap = new ymaps.Map(containerId, {
    center: [55.76, 37.64],
    controls: [],
    zoom: 10
  });

  const objectManager = new ymaps.ObjectManager({
    clusterize: true,
    gridSize: 64,
    clusterIconLayout: 'default#pieChart',
    clusterDisableClickZoom: false,
    geoObjectOpenBalloonOnClick: false,
    geoObjectHideIconOnBalloonOpen: false,
    geoObjectBalloonContentLayout: getDetailsContentLayout(ymaps)
  });

  objectManager.clusters.options.set('preset', 'islands#greenClusterIcons');

  loadList().then(data => {
    objectManager.add(data);
    myMap.geoObjects.add(objectManager);
    //console.log(data.features);
  });

  // details
  objectManager.objects.events.add('click', event => {
    const objectId = event.get('objectId');//console.log(objectId);
    const obj = objectManager.objects.getById(objectId);

    var res = objectManager.objects.balloon.open(objectId);console.log(res);

    /*if (!obj.properties.details) {
      loadDetails(objectId).then(data => {//console.log(data);
        obj.properties.details = data;
        objectManager.objects.balloon.setData(obj);
      });
    }*/
  });

  // filters
  const listBoxControl = createFilterControl(ymaps);
  myMap.controls.add(listBoxControl);

  var filterMonitor = new ymaps.Monitor(listBoxControl.state);
  filterMonitor.add('filters', filters => {
    objectManager.setFilter(
      obj => filters[obj.isActive ? 'active' : 'defective']
    );
  });

  //myMap.geoObjects.add(objectManager);
  //console.log(myMap.geoObjects);
  //console.log(objectManager.objects.getById(1));
}

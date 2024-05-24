var map = L.map('map').setView([51.505, -0.09], 13)
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map)

const konvaContainer = document.getElementById('konva-container')
const stage = new Konva.Stage({
  container: konvaContainer,
  width: window.innerWidth,
  height: window.innerHeight,
})
const layer = new Konva.Layer()
stage.add(layer)

const img = new Image()
img.src =
  'https://assets-global.website-files.com/65943d23dc44e6ce92eb6b67/65fc9f534c1398dac499304d_commercial_search-p-800.jpg'
img.onload = function () {
  const latlng = L.latLng(51.5, -0.09)
  const originalPoint = map.latLngToContainerPoint(latlng)
  const initialZoom = map.getZoom()

  // Maximum width for the image
  const MAX_IMAGE_WIDTH = 200

  // Calculate scaling factor to fit the image within the maximum width
  const scale = MAX_IMAGE_WIDTH / img.width
  const originalWidth = img.width * scale
  const originalHeight = img.height * scale

  const konvaImage = new Konva.Image({
    image: img,
    x: originalPoint.x,
    y: originalPoint.y,
    width: originalWidth,
    height: originalHeight,
    draggable: true,
    offsetX: originalWidth / 2,
    offsetY: originalHeight / 2,
  })
  layer.add(konvaImage)
  layer.draw()

  // Create transformer
  const tr = new Konva.Transformer({
    nodes: [konvaImage],
    keepRatio: false,
    enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    rotateEnabled: true,
    visible: false,
  })
  layer.add(tr)

  // Toggle transformer visibility on image click
  konvaImage.on('click', function () {
    tr.visible(!tr.visible())
    layer.draw()
  })

  // Disable map interactions when manipulating the image
  konvaImage.on('transformstart', function () {
    map.dragging.disable()
    map.touchZoom.disable()
    map.doubleClickZoom.disable()
    map.scrollWheelZoom.disable()
    map.boxZoom.disable()
    map.keyboard.disable()
  })

  konvaImage.on('transformend', function () {
    map.dragging.enable()
    map.touchZoom.enable()
    map.doubleClickZoom.enable()
    map.scrollWheelZoom.enable()
    map.boxZoom.enable()
    map.keyboard.enable()
  })

  konvaImage.on('dragstart', function () {
    map.dragging.disable()
  })

  konvaImage.on('dragend', function () {
    map.dragging.enable()
  })

  // Hide transformer when clicking outside the image
  stage.on('click', function (e) {
    if (e.target === stage) {
      tr.visible(false)
      layer.draw()
    }
  })

  // Update image position and scale on map move or zoom
  map.on('move', updateImagePositionAndScale)
  map.on('zoom', updateImagePositionAndScale)

  function updateImagePositionAndScale() {
    const point = map.latLngToContainerPoint(latlng)
    const zoomScale = map.getZoomScale(map.getZoom(), initialZoom)

    konvaImage.position({
      x: point.x,
      y: point.y,
    })
    konvaImage.width(originalWidth * zoomScale)
    konvaImage.height(originalHeight * zoomScale)

    layer.batchDraw()
  }

  // Redraw Konva stage on window resize
  window.addEventListener('resize', function () {
    stage.width(window.innerWidth)
    stage.height(window.innerHeight)
    stage.draw()
  })
}

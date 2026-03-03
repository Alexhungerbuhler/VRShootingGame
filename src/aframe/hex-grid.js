// Composant A‑Frame pour un pavage hexagonal au sol

// Conversion cube <-> axial (coordonnées hexagonales)
function cubeToAxial(cube) {
  return { q: cube.q, r: cube.r };
}

function axialToCube(hex) {
  var q = hex.q;
  var r = hex.r;
  var s = -q - r;
  return { q: q, r: r, s: s };
}

// Distance entre deux hex en coordonnées cube
function cubeDistance(a, b) {
  return (
    (Math.abs(a.q - b.q) +
      Math.abs(a.r - b.r) +
      Math.abs(a.s - b.s)) / 2
  );
}

// Conversion axial -> position monde (layout à sommet plat / flat‑top)
function axialToWorld(q, r, cellSize, basePosition) {
  // Formules standard pour hexagones "flat‑top"
  var xOffset = cellSize * (1.5 * q);
  var zOffset = cellSize * (Math.sqrt(3) * (r + q / 2));

  return {
    x: basePosition.x + xOffset,
    y: basePosition.y,
    z: basePosition.z + zOffset,
  };
}

// Génération des sommets (vertices) d'un hexagone 2D, centré en (0,0)
function createHexVertices(radius) {
  var vertices = [];

  // Hexagone "flat‑top" : on part d'un angle -30° puis on ajoute 60° à chaque fois
  for (var i = 0; i < 6; i++) {
    var angle = (Math.PI / 180) * (60 * i - 30);
    var x = radius * Math.cos(angle);
    var y = radius * Math.sin(angle);

    vertices.push(new THREE.Vector2(x, y));
  }

  return vertices;
}

// Création de la forme (Shape) à partir des sommets
function createHexShape(radius) {
  var verts = createHexVertices(radius);

  var shape = new THREE.Shape();

  // On se place sur le premier sommet
  shape.moveTo(verts[0].x, verts[0].y);

  // Puis on trace les arêtes entre chaque sommet
  for (var i = 1; i < verts.length; i++) {
    shape.lineTo(verts[i].x, verts[i].y);
  }

  // On ferme la forme en revenant au premier sommet
  shape.lineTo(verts[0].x, verts[0].y);

  return shape;
}

AFRAME.registerComponent('hex-grid', {
  schema: {
    // taille du pavage (1 = centre seul, 2 = centre + 6 voisins, ...)
    size: { type: 'int', default: 2 },
    // couleur des tuiles
    color: { type: 'color', default: '#4af' },
    // rayon de chaque tuile (hexagone)
    cellsize: { type: 'number', default: 1 },
    // hauteur de chaque tuile
    height: { type: 'number', default: 0.2 },
    // activer / désactiver le biseau (chanfrein)
    bevel: { type: 'boolean', default: false },
  },

  init: function () {
    var el = this.el;
    var data = this.data;

    // Position de base du centre du pavage
    var basePosition =
      el.getAttribute('position') || { x: 0, y: 0, z: 0 };

    // Rayon du pavage en coordonnées hex (>= 1)
    var radius = Math.max(1, Math.round(data.size));

    // Centre en coordonnées cube
    var centerCube = { q: 0, r: 0, s: 0 };

    // On nettoie d'éventuels anciens enfants si le composant est ré‑initialisé
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }

    // --- Géométrie commune : extrude d'un hexagone 2D en prisme 3D ---
    var shape = createHexShape(data.cellsize);

    var extrudeSettings = {
      depth: data.height,
      bevelEnabled: !!data.bevel,
      bevelThickness: data.height * 0.2,
      bevelSize: data.cellsize * 0.12,
      bevelSegments: 2,
      curveSegments: 1,
      steps: 1,
    };

    var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    // On couche la géométrie pour qu'elle soit à plat sur le plan XZ
    geometry.rotateX(-Math.PI / 2);
    // On recentre autour de (0,0,0) en Y pour un placement plus simple
    geometry.translate(0, -data.height / 2, 0);

    var material = new THREE.MeshStandardMaterial({
      color: data.color,
      flatShading: true,
    });

    // Parcours d'un cube englobant puis filtrage par distance hex
    for (var q = -radius + 1; q <= radius - 1; q++) {
      for (var r = -radius + 1; r <= radius - 1; r++) {
        var axial = { q: q, r: r };
        var cube = axialToCube(axial);
        var dist = cubeDistance(centerCube, cube);

        if (dist < radius) {
          // Coordonnées monde pour cet hex (centre)
          var pos = axialToWorld(
            q,
            r,
            data.cellsize,
            basePosition
          );

          // Création de l'entité pour cette tuile
          var tile = document.createElement('a-entity');

          // Position : centre du prisme hexagonal sur le sol
          tile.setAttribute('position', {
            x: pos.x,
            y: pos.y + data.height / 2,
            z: pos.z,
          });

          // Mesh Three.js : prisme hexagonal extrudé
          var mesh = new THREE.Mesh(geometry, material);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          tile.setObject3D('mesh', mesh);

          el.appendChild(tile);
        }
      }
    }
  },
});

// Primitive A‑Frame pour utiliser facilement le pavage :
// <a-hex-grid size="4" color="#ff0000" cellsize="1" height="0.2"></a-hex-grid>
AFRAME.registerPrimitive('a-hex-grid', {
  defaultComponents: {
    'hex-grid': {},
  },
  mappings: {
    size: 'hex-grid.size',
    color: 'hex-grid.color',
    cellsize: 'hex-grid.cellsize',
    height: 'hex-grid.height',
    bevel: 'hex-grid.bevel',
  },
});


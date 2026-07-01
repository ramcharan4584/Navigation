const blocks = {
  admin: {
    name: "Admin Block",
    route: ["cp1", "cp2", "cp3", "cp4", "cp5", "cp6"],
    info: "Go straight from Main Gate to reach Admin Block."
  },

  library: {
    name: "Library Block",
    route: ["cp1", "cp2", "cp3", "cp4", "cp5", "cp40", "cp6", "cp8","cp11", "cp12"],
    info: "Go straight through Admin Block road and continue to Library Block."
  },

  block1: {
    name: "Academic Block 1",
    route: ["cp1", "cp2", "cp3", "cp45", "cp41", "cp44", "cp46", "cp47", "cp48", "cp49"],
    info: "Take the left-side road and reach Academic Block 1."
  },

  block2: {
    name: "Academic Block 2",
    route: ["cp1", "cp2", "cp3", "cp19", "cp20", "cp22", "cp26", "cp27", "cp28", "cp17", "cp16"],
    info: "Take the right-side road and reach Academic Block 2."
  },

  biotech: {
    name: "Biotech Block",
    route: ["cp1", "cp2", "cp3", "cp19", "cp20", "cp22", "cp26", "cp27" ,"cp24"],
    info: "Take the right-side road and reach Biotech Block."
  },

  cet3: {
    name: "CET 3",
    route: ["cp1", "cp2", "cp3", "cp19", "cp20", "cp22", "cp26", "cp27", "cp28", "cp31", "cp34", "cp35", "cp29"],
    info: "Take the right-side academic road and reach CET 3."
  },

  classrooms: {
    name: "Classrooms",
    route: ["cp1", "cp2", "cp3", "cp19", "cp20", "cp22","cp26", "cp27", "cp28", "cp31", "cp34", "cp25"],
    info: "Take the right-side academic road and reach Classrooms."
  },

  cricketground: {
    name: "Cricket Ground",
    route: ["cp1", "cp2", "cp3", "cp19", "cp20", "cp22", "cp26", "cp27", "cp28", "cp31", "cp32", "cp33"],
    info: "Take the right-side road from Main Gate and reach Cricket Ground."
  },

  canteen: {
    name: "Canteen",
    route: ["cp1", "cp2", "cp3", "cp19", "cp20", "cp21"],
    info: "Take the right-side road from Main Gate and reach Canteen."
  },

  firstyear: {
    name: "First Year Block",
    route: ["cp1", "cp2", "cp3", "cp19", "cp20", "cp22", "cp26", "cp27", "cp28", "cp23"],
    info: "Take the right-side road from Main Gate and reach First Year Block."
  },

  cet12: {
    name: "CET 1 & 2",
    route: ["cp1", "cp2", "cp3", "cp19", "cp20", "cp22", "cp26", "cp27", "cp28", "cp31", "cp34", "cp35", "cp37"],
    info: "Take the right-side road from Main Gate and reach CET 1 & 2."
  },

  mechanical: {
    name: "Mechanical Lab - 1",
    route: ["cp1", "cp2", "cp3", "cp19", "cp20", "cp22", "cp26", "cp27", "cp28", "cp31", "cp34", "cp36"],
    info: "Take the right-side road from Main Gate and reach Mechanical Lab - 1."
  },

  lab: {
    name: "Mechanical Lab - 2",
    route: ["cp1", "cp2", "cp3", "cp19", "cp20", "cp22", "cp26", "cp27", "cp28", "cp31", "cp34", "cp52"],
    info: "Take the right-side road from Main Gate and reach Mechanical Lab - 2."
  },

  cafeteria: {
    name: "Cafeteria",
    route: ["cp1", "cp2", "cp3", "cp19", "cp20", "cp22", "cp26", "cp27", "cp28", "cp31", "cp38", "cp39"],
    info: "Take the right-side road from Main Gate and reach the Cafeteria."
  },

  stationery: {
    name: "Stationery",
    route: ["cp1", "cp2", "cp3", "cp4", "cp5", "cp40", "cp6", "cp8","cp11", "cp42", "cp43"],
    info: "Go straight through Admin Block road and continue to reach Stationery."
  },

  university : {
    name: "University Block",
    route: ["cp1", "cp2", "cp3", "cp45", "cp41", "cp44", "cp46", "cp47", "cp10", "cp51"],
    info: "Take the left-side road from Main Gate and reach the University Block."
  },

  volleyball: {
    name: "Volleyball Court",
    route: ["cp1", "cp2", "cp3", "cp45", "cp41", "cp44", "cp46", "cp47","cp53"],
    info: "Take the left-side road from Main Gate and reach the Volleyball Court."
  },

  football: {
    name: "Football Ground",
    route: ["cp1", "cp2", "cp3", "cp54"],
    info: "Take the left-side road from Main Gate and reach the Football Ground."
  },

};

function navigateToBlock() {
  const selected = document.getElementById("blockSelect").value;
  const routeLine = document.getElementById("routeLine");
  const infoCard = document.getElementById("infoCard");

  document.querySelectorAll(".marker").forEach(marker => {
    marker.classList.remove("active");
  });

  document.querySelector(".main-gate").classList.add("active");

  if (!selected) {
    routeLine.setAttribute("points", "");
    showCheckpoints([]);
    infoCard.innerHTML = `
      <h2>Select a destination</h2>
      <p>The route will be shown from Main Gate.</p>
    `;
    return;
  }

  const block = blocks[selected];

  if (!block) {
    routeLine.setAttribute("points", "");
    showCheckpoints([]);
    infoCard.innerHTML = `
      <h2>Route not added</h2>
      <p>This location marker is added, but checkpoint route is not connected yet.</p>
    `;
    return;
  }

  const points = block.route.map(cpId => getPointFromElement(cpId));

  const polylinePoints = points
    .map(point => `${point.x},${point.y}`)
    .join(" ");

  routeLine.setAttribute("points", polylinePoints);

  showCheckpoints(points);

  const marker = document.getElementById(selected);
  if (marker) marker.classList.add("active");

  infoCard.innerHTML = `
    <h2>${block.name}</h2>
    <p>${block.info}</p>
  `;
}

function getPointFromElement(id) {
  const el = document.getElementById(id);

  if (!el) {
    console.error(`Checkpoint missing: ${id}`);
    return { x: 0, y: 0 };
  }

  return {
    x: parseFloat(el.style.left),
    y: parseFloat(el.style.top)
  };
}

function showCheckpoints(points) {
  const layer = document.getElementById("checkpointLayer");
  if (!layer) return;

  layer.innerHTML = "";

  points.forEach((point, index) => {
    const cp = document.createElement("div");
    cp.className = "checkpoint";

    if (index === 0) cp.classList.add("start");
    if (index === points.length - 1) cp.classList.add("end");

    cp.style.left = `${point.x}%`;
    cp.style.top = `${point.y}%`;
    cp.innerText = index + 1;

    layer.appendChild(cp);
  });
}

let currentZoom = 1;

function applyZoom() {
  const mapWrapper = document.querySelector(".map-wrapper");
  const zoomValue = document.getElementById("zoomValue");

  mapWrapper.style.transform = `scale(${currentZoom})`;
  mapWrapper.style.transformOrigin = "top center";

  zoomValue.innerText = `${Math.round(currentZoom * 100)}%`;
}

function zoomIn() {
  if (currentZoom < 1.8) {
    currentZoom += 0.1;
    applyZoom();
  }
}

function zoomOut() {
  if (currentZoom > 0.4) {
    currentZoom -= 0.1;
    applyZoom();
  }
}

function resetZoom() {
  currentZoom = 1;
  applyZoom();
}
const blocks = {
  admin: {
    name: "Admin Block",
    route: ["cp1", "cp2", "cp3", "cp4", "cp5", "cp6"],
    info: "Go straight from Main Gate to reach Admin Block."
  },

  library: {
    name: "Library Block",
    route: ["cp1", "cp2", "cp3", "cp4", "cp5", "cp6", "cp7", "cp8", "cp9", "cp10", "cp11", "cp12"],
    info: "Go straight through Admin Block road and continue to Library Block."
  },

  block2: {
    name: "Academic Block 2",
    route: ["cp1", "cp2", "cp3", "cp19", "cp20", "cp21", "cp22", "cp23", "cp24", "cp25", "cp26", "cp27"],
    info: "Take the right-side road and reach Academic Block 2."
  },

  biotech: {
    name: "Biotech Block",
    route: ["cp1", "cp2", "cp3", "cp19", "cp20", "cp21", "cp22", "cp23", "cp24", "cp25", "cp26"],
    info: "Take the right-side road and reach Biotech Block."
  },

  cet3: {
    name: "CET 3",
    route: ["cp1", "cp2", "cp3", "cp19", "cp20", "cp21", "cp22", "cp23", "cp24", "cp25", "cp26", "cp27", "cp28", "cp29", "cp30", "cp31", "cp32", "cp33", "cp34", "cp35"],
    info: "Take the right-side academic road and reach CET 3."
  },

  classrooms: {
    name: "Classrooms",
    route: ["cp1", "cp2", "cp3", "cp19", "cp20", "cp21", "cp22", "cp23", "cp24", "cp25", "cp26", "cp27", "cp28", "cp29", "cp30", "cp31", "cp32"],
    info: "Take the right-side academic road and reach Classrooms."
  },

  canteen: {
    name: "Canteen",
    route: ["cp1", "cp2", "cp3", "cp19", "cp20", "cp21", "cp22", "cp23"],
    info: "Take the right-side road from Main Gate and reach Canteen."
  }
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
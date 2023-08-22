
let svg = d3.select("svg"),
    width = +svg.node().getBoundingClientRect().width,
    height = +svg.node().getBoundingClientRect().height;

// svg objects
let link, node;
// the data - an object with nodes and links
let graph;
let filteredGraph;
let keyword;

let color = d3.scaleOrdinal(d3.schemeCategory10);

// load the data
d3.json("Character Map.json", function (error, _graph) {
    if (error) throw error;
    graph = _graph;
    filteredGraph = _graph;
    initializeDisplay();
    initializeSimulation();
});

d3.select("#filter-button").on("click", function () {
    keyword = document.getElementById("filter-input").value;
    const maxLevels = +document.getElementById("maxLevels").value;
    filteredGraph = subsetGraphByKeyword(keyword, maxLevels);
    console.log("Filtered Nodes:", filteredGraph.nodes);
    console.log("Filtered Links:", filteredGraph.links);

    simulation.nodes(filteredGraph.nodes);
    simulation.force("link").links(filteredGraph.links);

    initializeDisplay(); // Reinitialize the visualization with the filtered data
    initializeSimulation(); // Reinitialize the simulation with the filtered data
});

//////////// FORCE SIMULATION //////////// 

// force simulator
let simulation = d3.forceSimulation();

// set up the simulation and event to update locations after each tick
function initializeSimulation() {
    simulation.nodes(filteredGraph.nodes);
    initializeForces();
    simulation.on("tick", ticked);
}

// values for all forces
let forceProperties = {
    center: {
        x: 0.5,
        y: 0.5
    },
    charge: {
        enabled: true,
        strength: -100,
        distanceMin: 10,
        distanceMax: 2000
    },
    collide: {
        enabled: true,
        strength: .7,
        iterations: 1,
        radius: 5
    },
    forceX: {
        enabled: true,
        strength: .1,
        x: .5
    },
    forceY: {
        enabled: true,
        strength: .1,
        y: .5
    },
    link: {
        enabled: true,
        distance: 30,
        iterations: 1
    }
}

// add forces to the simulation
function initializeForces() {
    // add forces and associate each with a name
    simulation
        .force("link", d3.forceLink())
        .force("charge", d3.forceManyBody())
        .force("collide", d3.forceCollide())
        .force("center", d3.forceCenter())
        .force("forceX", d3.forceX())
        .force("forceY", d3.forceY());
    // apply properties to each of the forces
    updateForces();
}

// apply new force properties
function updateForces() {
    // get each force by name and update the properties
    simulation.force("center")
        .x(width * forceProperties.center.x)
        .y(height * forceProperties.center.y);
    simulation.force("charge")
        .strength(forceProperties.charge.strength * forceProperties.charge.enabled)
        .distanceMin(forceProperties.charge.distanceMin)
        .distanceMax(forceProperties.charge.distanceMax);
    simulation.force("collide")
        .strength(forceProperties.collide.strength * forceProperties.collide.enabled)
        .radius(forceProperties.collide.radius)
        .iterations(forceProperties.collide.iterations);
    simulation.force("forceX")
        .strength(forceProperties.forceX.strength * forceProperties.forceX.enabled)
        .x(width * forceProperties.forceX.x);
    simulation.force("forceY")
        .strength(forceProperties.forceY.strength * forceProperties.forceY.enabled)
        .y(height * forceProperties.forceY.y);
    simulation.force("link")
        .id(function (d) { return d.id; })
        .distance(forceProperties.link.distance)
        .iterations(forceProperties.link.iterations)
        .links(forceProperties.link.enabled ? filteredGraph.links : []);

    // updates ignored until this is run
    // restarts the simulation (important if simulation has already slowed down)
    simulation.alpha(1).restart();
}



//////////// DISPLAY ////////////

// generate the svg objects and force simulation
function initializeDisplay() {

    clearGraph(); // Clear existing nodes and links

    // set the data and properties of link lines
    link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(filteredGraph.links)
        .enter().append("line")
        .attr("stroke-width", 2)
        .attr("stroke", "black") // Set link color based on the group attribute
        .attr("marker-end", "url(#arrowhead)"); // Use the arrowhead marker for the link's end


    // Append arrowhead markers to the <defs> element
    svg.append("defs").selectAll("marker")
        .data(["arrowhead"]) // Give a unique ID for the marker
        .enter().append("marker")
        .attr("id", function (d) { return d; })
        .attr("viewBox", "0 -5 10 10") // Set the viewBox to define the marker's coordinate system
        .attr("refX", 15) // Set the x-coordinate for the arrowhead
        .attr("refY", 0) // Set the y-coordinate for the arrowhead
        .attr("markerWidth", 6) // Set the marker width
        .attr("markerHeight", 6) // Set the marker height
        .attr("orient", "auto") // Automatically orient the arrowhead based on the link's direction
        .append("path")
        .attr("d", "M0,-5L10,0L0,5"); // Define the arrowhead path


    // set the data and properties of node circles
    node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(filteredGraph.nodes)
        .enter().append("circle")
        .attr("r", function (d) {
            if (d.id.includes(keyword)) {
                return 20; // Adjust the size as needed
            } else {
                return 5;
            }
        })
        .attr("fill", function (d) {
            if (d.id.includes(keyword)) {
                return "purple"; // Set the color for keyword nodes
            } else {
                return color(d.group);
            }
        })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    // Append the node IDs as text labels
    nodeLabels = svg.append("g")
        .attr("class", "node-label")
        .selectAll(".node-label")
        .data(filteredGraph.nodes)
        .enter().append("text")
        .attr("class", "node-label")
        .text(function (d) { return d.id; });

    nodeLabels.style("font-size", "12px"); // Set initial font size

    // node tooltip
    node.append("title")
        .text(function (d) { return d.id; });

    // Add event listeners to nodes for hover and click
    node.on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut);

    // visualize the graph
    updateDisplay();
}

// update the display based on the forces (but not positions)
function updateDisplay() {
    node
        .attr("r", forceProperties.collide.radius)
        .attr("stroke", forceProperties.charge.strength > 0 ? "blue" : "red")
        .attr("stroke-width", forceProperties.charge.enabled == false ? 0 : Math.abs(forceProperties.charge.strength) / 15);

    link
        .attr("stroke-width", forceProperties.link.enabled ? 1 : .5)
        .attr("opacity", forceProperties.link.enabled ? 1 : 0);
}

// update the display positions after each simulation tick
function ticked() {
    link
        .attr("x1", function (d) { return d.source.x; })
        .attr("y1", function (d) { return d.source.y; })
        .attr("x2", function (d) { return d.target.x; })
        .attr("y2", function (d) { return d.target.y; })
        .attr("marker-end", function (d) {
            const arrowheadScale = 2000; // Adjust the scale factor as needed
            return `url(#arrowhead) scale(${arrowheadScale}) translate(0, 700)`; // Translate to center vertically
        });

    node
        .attr("cx", function (d) { return d.x; })
        .attr("cy", function (d) { return d.y; });

    // Update node label positions
    nodeLabels
        .attr("x", function (d) { return d.x; })
        .attr("y", function (d) { return d.y; });

    // d3.select('#alpha_value').style('flex-basis', (simulation.alpha() * 100) + '%');
}


// Event handler for mouseover
function handleMouseOver(d) {
    d3.select(this).select("circle").attr("r", 7); // Increase circle radius
    d3.select(this).select(".node-label").style("font-size", "16px"); // Increase text size
}

// Event handler for mouseout
function handleMouseOut(d) {
    d3.select(this).select("circle").attr("r", 5); // Reset circle radius
    d3.select(this).select(".node-label").style("font-size", "12px"); // Reset text size
}

// Function to subset graph based on a keyword
function subsetGraphByKeyword(keyword, maxLevels) {
    const keywordNodes = graph.nodes.filter(node => node.id.includes(keyword));
    const keywordNodeIds = new Set(keywordNodes.map(node => node.id));

    const connectedNodeIds = new Set(keywordNodeIds);
    const newLinks = [];

    function findConnectedNodes(nodeId, currentLevel) {
        if (currentLevel > maxLevels) {
            return;
        }

        const linksConnectedToNode = graph.links.filter(link => link.source.id === nodeId || link.target.id === nodeId);
        linksConnectedToNode.forEach(link => {
            const otherNodeId = link.source.id === nodeId ? link.target.id : link.source.id;
            if (!connectedNodeIds.has(otherNodeId)) {
                connectedNodeIds.add(otherNodeId);
                newLinks.push(link); // Preserve the original link
                findConnectedNodes(otherNodeId, currentLevel + 1);
            }
        });
    }

    keywordNodeIds.forEach(nodeId => findConnectedNodes(nodeId, 1));

    const filteredNodes = graph.nodes.filter(node => connectedNodeIds.has(node.id));
    const filteredLinks = newLinks; // Use only the new links created during expansion

    return {
        nodes: filteredNodes,
        links: filteredLinks
    };
}


function clearGraph() {
    // Remove existing nodes and links from the SVG
    //     svg.selectAll(".node-label").remove();
    //     svg.selectAll(".nodes").selectAll("*").remove();
    //     svg.selectAll(".links").selectAll("*").remove();
    //     svg.selectAll(".node-label").remove();
    svg.selectAll("*").remove();
}
//////////// UI EVENTS ////////////

function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0.0001);
    d.fx = null;
    d.fy = null;
}

// update size-related forces
d3.select(window).on("resize", function () {
    width = +svg.node().getBoundingClientRect().width;
    height = +svg.node().getBoundingClientRect().height;
    updateForces();
});

// convenience function to update everything (run after UI input)
function updateAll() {
    updateForces();
    updateDisplay();
}
function onload() {
  console.log("Executing script");

  var mouse = [480, 250],
    count = 0;

  var svg = d3.select("body").append("svg")
    .attr("width", "100%")
    .attr("height", "5000px");

  var nsq = 25;

  var g = svg.selectAll("g")
    .data(d3.range(nsq))
    .enter().append("g")
    .attr("transform", "translate(" + mouse + ")");


  g.append("rect")
    .attr("rx", 6)
    .attr("ry", 6)
    .attr("x", -nsq / 2)
    .attr("y", -nsq / 2)
    .attr("width", nsq)
    .attr("height", nsq)
    .attr("transform", function (d, i) { return "scale(" + (1 - d / nsq) * nsq + ")"; })
    .style("fill", d3.scale.category20c());

  g.datum(function (d) {
    return { center: mouse.slice(), angle: 0 };
  });

  svg.on("mousemove", function () {
    mouse = d3.mouse(this);
  });

  d3.timer(function () {
    count++;
    g.attr("transform", function (d, i) {
      d.center[0] += (mouse[0] - d.center[0]) / (i + 5);
      d.center[1] += (mouse[1] - d.center[1]) / (i + 5);
      d.angle += Math.sin((count + i) / 10) * 7;
      return "translate(" + d.center + ")rotate(" + d.angle + ")";
    });
  });
}

function sample() {
  alert("here")
}

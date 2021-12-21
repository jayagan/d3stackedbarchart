import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

export default () => {
  const container = useRef(null);
  const [num, setNum] = useState(1);

  useEffect(() => {
    if (container.current) {
    //   const data = new Array(num).fill(20);
      const root = d3.select(container.current);
      const parentWidth = container.current.clientWidth;
      const parentHeight = container.current.clientHeight;
   // Based on an example by Mike Bostock
// http://bl.ocks.org/mbostock/3943967
// =============================================

// m is the number of values per series.
const m = 40;
// n is number of series
const n = 4;
// xz is an array of m elements, representing the x-values shared by all series.
const xz = d3.range(m);
// yz is an array of n elements, representing the y-values of each of the n series.
// Each yz[i] is an array of m non-negative numbers representing a y-value for xz[i].
const yz = d3.range(n).map(() => bumps(m));
// The y01z array has the same structure as yz, but with stacked [y₀, y₁] instead of y.
const y01z = d3.stack().keys(d3.range(n))(d3.transpose(yz));
// The max y value 
const yMax = d3.max(yz, y => d3.max(y));
const y1Max = d3.max(y01z, y => d3.max(y, d => d[1] ));

const svg = root;
root.attr("width", parentWidth).attr("height", parentHeight);
const margin = {top: 40, right: 10, bottom: 20, left: 10}
const width = parseInt(root.attr("width") - margin.left - margin.right)
const height = parseInt(root.attr("height") - margin.top - margin.bottom)
const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`)

const x = d3.scaleBand()
  .domain(xz)
  .rangeRound([0, width])
  .padding(0.08);

const y = d3.scaleLinear()
  .domain([0, y1Max])
  .range([height, 0]);

const color = d3.scaleOrdinal()
  .domain(d3.range(n))
  .range(d3.schemePastel2);

const series = g.selectAll(".series")
  .data(y01z)
  .enter()
  .append("g")
    .attr("fill", (d, i) => color(i));

var rect = series.selectAll("rect")
  .data(d => d)
  .enter()
  .append("rect")
    .attr("x", (d, i) => x(i))
    .attr("y", height)
    .attr("width", x.bandwidth())
    .attr("height", 0);

rect.transition()
  .delay((d, i) => i * 10)
  .attr("y", (d) => y(d[1]))
  .attr("height", (d) => y(d[0]) - y(d[1]));

g.append("g")
  .attr("class", "axis axis--x")
  .attr("transform", `translate(0, ${height})`)
  .call(d3.axisBottom(x)
    .tickSize(0)
    .tickPadding(6));

g.append("g")
  .attr("class", "axis axis--y")
  .call(d3.axisLeft(y)
    .tickSize(0)
    .tickPadding(6));

d3.selectAll("input").on("change", changed);

const timeout = d3.timeout(() => {
  d3.select("input[value=\"grouped\"]")
    .property("checked", true)
    .dispatch("change");
}, 2000);

function changed(event) {
  timeout.stop();
  if (this.value === "grouped") transitionGrouped();
  else transitionStacked();
}

const transitionGrouped = () => {
  y.domain([0, yMax])
  rect
    .transition()
    .duration(500)
    .delay((_, i) => i * 5)
    .attr("x", (_, i, el) => x(i) + x.bandwidth() / n * el[i].parentNode.__data__.key)
    .attr("width", x.bandwidth() / n)
    .transition()
    .attr("y", d => y(d[1] - d[0]))
    .attr("height", d => y(0) - y(d[1] - d[0]));
}

const transitionStacked = () => {
  y.domain([0, y1Max])
  rect
    .transition()
    .duration(500)
    .delay((_, i) => i * 5)
    .attr("y", d => y(d[1]))
    .attr("height", d => y(d[0]) - y(d[1]))
    .transition()
    .attr("x", (_, i) => x(i))
    .attr("width", x.bandwidth());
}

// Returns an array of m psuedorandom, smoothly-varying non-negative numbers.
// Inspired by Lee Byron’s test data generator.
// http://leebyron.com/streamgraph/
function bumps(m) {
  var values = [], i, j, w, x, y, z;

  // Initialize with uniform random values in [0.1, 0.2).
  for (i = 0; i < m; ++i) {
    values[i] = 0.1 + 0.1 * Math.random();
  }

  // Add five random bumps.
  for (j = 0; j < 5; ++j) {
    x = 1 / (0.1 + Math.random());
    y = 2 * Math.random() - 0.5;
    z = 10 / (0.1 + Math.random());
    for (i = 0; i < m; i++) {
      w = (i / m - y) * z;
      values[i] += x * Math.exp(-w * w);
    }
  }

  // Ensure all values are positive.
  for (i = 0; i < m; ++i) {
    values[i] = Math.max(0, values[i]);
  }

  return values;
}
  
    }
  }, [container, num]);

  return (
    <div>
    
      <svg
        style={{ marginTop: 20, width: 800, height: 500, background: "#eee" }}
        ref={container}
      />
    </div>
  );
};

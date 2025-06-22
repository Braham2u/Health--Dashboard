
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

function D3Chart({ data }) {
  const ref = useRef();

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const width = 700;
    const height = 400;
    const margin = { top: 60, right: 60, bottom: 60, left: 60 };

    const x = d3.scaleTime()
      .domain(d3.extent(data, d => new Date(d.time)))
      .range([margin.left, width - margin.right]);

    const y1 = d3.scaleLinear()
      .domain([50, 200]).nice()
      .range([height - margin.bottom, margin.top]);

    const y2 = d3.scaleLinear()
      .domain([35, 40]).nice()
      .range([height - margin.bottom, margin.top]);

    const lineHeart = d3.line()
      .x(d => x(new Date(d.time)))
      .y(d => y1(d.heartRate));

    const lineTemp = d3.line()
      .x(d => x(new Date(d.time)))
      .y(d => y2(d.temperature));

    svg.attr("width", width).attr("height", height);

    // Title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "20px")
      .attr("font-weight", "bold")
      .text("Athlete Vital Monitor");

    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(5));

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y1))
      .append("text")
      .attr("fill", "steelblue")
      .attr("x", 6)
      .attr("y", 12)
      .text("Heart Rate (bpm)");

    svg.append("g")
      .attr("transform", `translate(${width - margin.right},0)`)
      .call(d3.axisRight(y2))
      .append("text")
      .attr("fill", "tomato")
      .attr("x", -6)
      .attr("y", 12)
      .attr("text-anchor", "end")
      .text("Temperature (°C)");

    // Main lines
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", lineHeart);

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "tomato")
      .attr("stroke-width", 2)
      .attr("d", lineTemp);

    // 🔴 Highlight HR outliers
    const hrValues = data.map(d => d.heartRate).sort((a, b) => a - b);
    const q1 = d3.quantile(hrValues, 0.25);
    const q3 = d3.quantile(hrValues, 0.75);
    const iqr = q3 - q1;
    const lower = q1 - 1.5 * iqr;
    const upper = q3 + 1.5 * iqr;

    svg.selectAll("circle.hr-outlier")
      .data(data.filter(d => d.heartRate < lower || d.heartRate > upper))
      .enter()
      .append("circle")
      .attr("class", "hr-outlier")
      .attr("cx", d => x(new Date(d.time)))
      .attr("cy", d => y1(d.heartRate))
      .attr("r", 4)
      .attr("fill", "red");

    // 🟣 Draw box plot (HR only, right below chart)
    const boxY = height - 20;
    const scale = d3.scaleLinear()
      .domain([d3.min(hrValues), d3.max(hrValues)])
      .range([margin.left, width - margin.right]);

    svg.append("line")
      .attr("x1", scale(d3.min(hrValues)))
      .attr("x2", scale(d3.max(hrValues)))
      .attr("y1", boxY)
      .attr("y2", boxY)
      .attr("stroke", "#999")
      .attr("stroke-width", 2);

    svg.append("rect")
      .attr("x", scale(q1))
      .attr("y", boxY - 10)
      .attr("width", scale(q3) - scale(q1))
      .attr("height", 20)
      .attr("fill", "rgba(0,0,255,0.2)");

    svg.append("line")
      .attr("x1", scale(d3.median(hrValues)))
      .attr("x2", scale(d3.median(hrValues)))
      .attr("y1", boxY - 10)
      .attr("y2", boxY + 10)
      .attr("stroke", "blue")
      .attr("stroke-width", 2);

    // Label for box plot
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", boxY + 30)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Heart Rate Distribution (Box Plot)");
  }, [data]);

  return <svg ref={ref}></svg>;
}

export default D3Chart;

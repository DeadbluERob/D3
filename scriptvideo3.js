const margin = { top: 30, right: 20, bottom: 50, left: 50 },
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

const x = d3.scaleBand().range([0, width]).padding(0.1);
const y = d3.scaleLinear().range([height, 0]);

const svg = d3.select("#chart-container").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("http://localhost:3000/NTDOY.csv").then(data => {
  const parseDate = d3.timeParse("%Y-%m-%d");
data.forEach(d => {
  d.Date = parseDate(d.Date);
  d.yearMonth = d3.timeFormat("%Y-%m")(d.Date); // Format as "YYYY-MM"
  d.Close = +d.Close;
});

  x.domain(data.map(d => d.Date));
  y.domain([0, d3.max(data, d => d.Close)]);
// Parse the date and extract the month and year


// Group the data by month and year
const groupedData = Array.from(d3.group(data, d => d.yearMonth), ([key, value]) => ({key, value}));

// Update the x-axis scale
x.domain(groupedData.map(d => d.key));

// Update the bars
svg.selectAll(".bar")
  .data(groupedData)
  .enter().append("rect")
  .attr("class", "bar")
  .attr("x", d => x(d.key))
  .attr("width", x.bandwidth())
  .attr("y", d => y(d3.mean(d.value, v => v.Close))) // Use the average close price for each month
  .attr("height", d => height - y(d3.mean(d.value, v => v.Close)))
  .attr("fill", "steelblue");
    
  const fromDateInput = d3.select("#fromDate");
const toDateInput = d3.select("#toDate");

const sliderRange = d3
  .sliderBottom()
  .min(d3.min(data, d => d.Date))
  .max(d3.max(data, d => d.Date))
  .width(900)
  .tickFormat(d3.timeFormat('%m-%Y')) // Format as "YYYY-MM"
  .ticks(12)
  .default([d3.min(data, d => d.Date), d3.max(data, d => d.Date)])
  .fill('#85bb65')
  .on('onchange', val => {
    d3.select('p#value-range').text(val.map(d3.timeFormat('%m-%Y')).join('-'));
    const [minDate, maxDate] = val;
    const filteredData = data.filter(d => d.Date >= minDate && d.Date <= maxDate);
    update(filteredData);

    // Update text box values
    fromDateInput.property("value", d3.timeFormat('%m-%Y')(minDate));
    toDateInput.property("value", d3.timeFormat('%m-%Y')(maxDate));
  });

 // Hide tooltip when not interacting with the slider


 const gRange = d3
 .select('div#slider-range')
 .append('svg')
 .attr('width', 960)
 .attr('height', 100)
 .append('g')
 .attr('transform', 'translate(30,30)');

gRange.call(sliderRange);

// Modify the slider handles
d3.selectAll(".d3-slider-handle")
 .append('circle')
 .attr('cx', 0)
 .attr('cy', 0)
 .attr('r', 5) // radius of the circle
 .attr('fill', 'purple'); // Increase the radius of the handles

  function update(data) {
    x.domain(data.map(d => d.Date));
  
    const bars = svg.selectAll(".bar")
      .data(data);
  
    bars.exit().remove();
  
    bars.enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.Date))
      .attr("width", x.bandwidth())
      .attr("y", d => y(d.Close))
      .attr("height", d => height - y(d.Close))
      .merge(bars) // Merges the enter and update selections
      .attr("x", d => x(d.Date))
      .attr("width", x.bandwidth())
      .attr("y", d => y(d.Close))
      .attr("height", d => height - y(d.Close));
  }
});
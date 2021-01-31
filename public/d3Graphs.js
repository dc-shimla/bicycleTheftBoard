//use d3 queue to load files simultaneously
d3.queue()
  .defer(d3.csv, "/public/dataFiles/Toronto_bicycleTheftData_2014_2019.csv")
  //.defer(d3.csv, "dataFiles/Canada_data.csv")
  .await(function (error, file_1) {
    //remove file1
    if (error) throw error;

    //console.log(file_1)

    //figures value assignment
    document.getElementById("figures1_totalStolenBikes").innerHTML = Number(
      file_1.length
    ).toLocaleString();

    document.getElementById("figures1_valueStolenBikes").innerHTML =
      "$" +
      Number(d3.sum(file_1, (d) => d.Cost_of_Bike).toFixed(0)).toLocaleString();

    //Remove rows with null and 0.0 for row count for calculatingn Average Value of a Stolen Bike
    //Group rows based on Cost_of_Bike, create object and get length of array with "" key or "0.0" key
    var rowCountBikeCostNull = d3.group(file_1, (d) => d.Cost_of_Bike).get("")
      .length;
    var rowCountBikeCostZero = d3
      .group(file_1, (d) => d.Cost_of_Bike)
      .get("0.0").length;
    //console.log(rowCountBikeCostNull)
    //console.log(rowCountBikeCostZero)
    var rowCountBikeCostNullorZero =
      rowCountBikeCostNull + rowCountBikeCostZero;
    //console.log(rowCountBikeCostNullorZero)

    //rows with a valid Bike Cost = Total rows in file - rows where Bike Cost is Null or Zero
    var rowCountValidBikeCost = Number(
      file_1.length - rowCountBikeCostNullorZero
    );
    //console.log(Number(file_1.length))
    //console.log(rowCountValidBikeCost)

    //Calculate average cost of a bike
    document.getElementById("figures1_avgValueStolenBike").innerHTML =
      "$" +
      Number(
        d3.sum(file_1, (d) => d.Cost_of_Bike) / rowCountValidBikeCost
      ).toFixed(0);

    //BarChart1

    var tooltip = d3.select("#column4").append("div").attr("class", "toolTip");

    var margin = { top: 20, right: 20, bottom: 50, left: 100 },
      width = 800 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

    var x = d3.scaleBand().rangeRound([0, width], 0.1).paddingInner(0.01);

    var y = d3.scaleLinear().range([height, 0]);

    var xAxis = d3.axisBottom().scale(x);

    var yAxis = d3.axisLeft().scale(y).ticks(10);

    var svg = d3
      .select("#column4")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var totalThefts = Number(file_1.length);

    //Group rows based on Occurrence_Year and create object
    var yearlyThefts = d3.group(file_1, (d) => d.Occurrence_Year);

    var bar1Data = [
      {
        name: "2014",
        value: yearlyThefts.get("2014").length,
      },
      {
        name: "2015",
        value: yearlyThefts.get("2015").length,
      },

      {
        name: "2016",
        value: yearlyThefts.get("2016").length,
      },
      {
        name: "2017",
        value: yearlyThefts.get("2017").length,
      },
      {
        name: "2018",
        value: yearlyThefts.get("2018").length,
      },
      {
        name: "2019",
        value: yearlyThefts.get("2019").length,
      },
    ];

    var theftPercentage = [
      parseFloat((yearlyThefts.get("2014").length / totalThefts) * 100).toFixed(
        2
      ),
      parseFloat((yearlyThefts.get("2015").length / totalThefts) * 100).toFixed(
        2
      ),
      parseFloat((yearlyThefts.get("2016").length / totalThefts) * 100).toFixed(
        2
      ),
      parseFloat((yearlyThefts.get("2017").length / totalThefts) * 100).toFixed(
        2
      ),
      parseFloat((yearlyThefts.get("2018").length / totalThefts) * 100).toFixed(
        2
      ),
      parseFloat((yearlyThefts.get("2019").length / totalThefts) * 100).toFixed(
        2
      ),
    ];

    //for bar colors
    var huecolor = d3.scaleSequential(d3.interpolateRainbow).domain([0, 7]);

    x.domain(
      bar1Data.map(function (d) {
        return d.name;
      })
    );
    y.domain([
      0,
      d3.max(bar1Data, function (d) {
        return d.value;
      }),
    ]);

    svg
      .append("g")
      .attr("class", "axisblack")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    svg
      .append("g")
      .attr("class", "axisblack")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Value");

    svg
      .selectAll(".bar")
      .data(bar1Data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", function (d) {
        return x(d.name);
      })
      .attr("width", x.bandwidth())
      .attr("y", function (d) {
        return y(d.value);
      })
      .style("fill", function (d, i) {
        return huecolor(i);
      })
      .attr("height", function (d) {
        return height - y(d.value);
      })
      .on("mousemove", function (d) {
        tooltip
          .style("left", d3.event.pageX - 50 + "px")
          .style("top", d3.event.pageY - 70 + "px")
          .style("display", "inline-block")
          .html(
            "<b>" +
              d.name +
              "</b>" +
              "<br>" +
              Number(parseFloat(d.value).toFixed(0)).toLocaleString()
          );
      })
      .on("mouseout", function (d) {
        tooltip.style("display", "none");
      });

    //text labels on bars for x-axis
    svg
      .selectAll(".text")
      .data(theftPercentage)
      .enter()
      .append("text")
      .text(function (d) {
        return d + "%";
      })
      .attr("text-anchor", "middle")
      .attr("x", function (d, i) {
        return (i + 1) * (width / theftPercentage.length) - x.bandwidth() / 2;
      })
      .attr("y", function (d, i) {
        return height - 5;
      })
      .attr("font-family", "sans-serif")
      .attr("font-size", "30px")
      .attr("fill", "white")
      .attr("stroke", "black")
      .attr("stroke-width", "0.8")
      .attr("text-anchor", "middle");

    //label for Y-axis
    svg
      .append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("x", -115)
      .attr("y", -70)
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .text("Numbe of Bicycles Stolen")
      .style("font-size", 12)
      .style("font-weight", 400);

    //label for X-axis
    svg
      .append("text")
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("x", width / 2 - 15)
      .attr("y", height + 45)
      .text("Year")
      .style("font-size", 12)
      .style("font-weight", 400);

    //BarChart2

    var tooltip = d3.select("#column5").append("div").attr("class", "toolTip");

    var margin = { top: 20, right: 20, bottom: 50, left: 100 },
      width = 800 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

    var x = d3.scaleBand().rangeRound([0, width], 0.1).paddingInner(0.01);

    var y = d3.scaleLinear().range([height, 0]);

    var xAxis = d3.axisBottom().scale(x);

    var yAxis = d3.axisLeft().scale(y).ticks(10);

    var svg = d3
      .select("#column5")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var totalThefts = Number(file_1.length);

    //Group rows based on Occurrence_Year and create object
    var recoveryStatus = d3.group(file_1, (d) => d.Status);

    var bar2Data = [
      {
        name: "Stolen",
        value: recoveryStatus.get("STOLEN").length,
      },
      {
        name: "Recovered",
        value: recoveryStatus.get("RECOVERED").length,
      },
      {
        name: "Unkown",
        value: recoveryStatus.get("UNKNOWN").length,
      },
    ];

    var theftPercentage = [
      parseFloat(
        (recoveryStatus.get("STOLEN").length / totalThefts) * 100
      ).toFixed(2),
      parseFloat(
        (recoveryStatus.get("RECOVERED").length / totalThefts) * 100
      ).toFixed(2),
      parseFloat(
        (recoveryStatus.get("UNKNOWN").length / totalThefts) * 100
      ).toFixed(2),
    ];

    //for bar colors
    var huecolor = d3.scaleSequential(d3.interpolateRainbow).domain([0, 7]);

    x.domain(
      bar2Data.map(function (d) {
        return d.name;
      })
    );
    y.domain([
      0,
      d3.max(bar2Data, function (d) {
        return d.value;
      }),
    ]);

    svg
      .append("g")
      .attr("class", "axisblack")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    svg
      .append("g")
      .attr("class", "axisblack")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Value");

    svg
      .selectAll(".bar")
      .data(bar2Data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", function (d) {
        return x(d.name);
      })
      .attr("width", x.bandwidth())
      .attr("y", function (d) {
        return y(d.value);
      })
      .style("fill", function (d, i) {
        return huecolor(i);
      })
      .attr("height", function (d) {
        return height - y(d.value);
      })
      .on("mousemove", function (d) {
        tooltip
          .style("left", d3.event.pageX - 50 + "px")
          .style("top", d3.event.pageY - 70 + "px")
          .style("display", "inline-block")
          .html(
            "<b>" +
              d.name +
              "</b>" +
              "<br>" +
              Number(parseFloat(d.value).toFixed(0)).toLocaleString()
          );
      })
      .on("mouseout", function (d) {
        tooltip.style("display", "none");
      });

    //text labels on bars for x-axis
    svg
      .selectAll(".text")
      .data(theftPercentage)
      .enter()
      .append("text")
      .text(function (d) {
        return d + "%";
      })
      .attr("text-anchor", "middle")
      .attr("x", function (d, i) {
        return (i + 1) * (width / theftPercentage.length) - x.bandwidth() / 2;
      })
      .attr("y", function (d, i) {
        return height - 5;
      })
      .attr("font-family", "sans-serif")
      .attr("font-size", "30px")
      .attr("fill", "white")
      .attr("stroke", "black")
      .attr("stroke-width", "0.8")
      .attr("text-anchor", "middle");

    //label for Y-axis
    svg
      .append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("x", -115)
      .attr("y", -70)
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .text("Numbe of Bicycles")
      .style("font-size", 12)
      .style("font-weight", 400);

    //label for X-axis
    svg
      .append("text")
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("x", width / 2 - 15)
      .attr("y", height + 45)
      .text("Status")
      .style("font-size", 12)
      .style("font-weight", 400);

    //donutChart1
    (function (d3) {
      "use strict";

      var toolTip2 = d3
        .select("#column6")
        .append("div")
        .attr("class", "toolTip2");

      toolTip2.append("div").attr("class", "label");

      toolTip2.append("div").attr("class", "count");

      toolTip2.append("div").attr("class", "percent");

      //-------------------------------
      var PremiseTypeTheftCountsRolled = d3.rollups(
        file_1,
        (v) => v.length,
        (d) => d.Premise_Type
      );

      //console.log(PremiseTypeTheftCountsRolled)
      //console.log(PremiseTypeTheftCountsRolled.length)

      //console.log(PremiseTypeTheftCountsRolled[0][0])
      //console.log(PremiseTypeTheftCountsRolled[0][1])

      var donutChart1Data = [];

      for (var i = 0; i < PremiseTypeTheftCountsRolled.length; i += 1) {
        donutChart1Data.push({
          name: PremiseTypeTheftCountsRolled[i][0],
          value: PremiseTypeTheftCountsRolled[i][1],
        });
      }

      //console.log(donutChart1Data)

      //sort array of objects in descending order
      donutChart1Data.sort((a, b) => (a.value > b.value ? -1 : 1));
      //console.log(donutChart1Data_test.sort((a, b) => (a.value > b.value) ? -1 : 1))
      //-------------------------------

      var width = 360;
      var height = 360;
      var radius = Math.min(width, height) / 2;

      var color = d3.scaleOrdinal([
        "#6e40aa",
        "#fe4b83",
        "#FF704E",
        "#D2C934",
        "#6BF75C",
      ]);

      var svg = d3
        .select("#column6")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

      var donutWidth = 75;

      var arc = d3
        .arc()
        .innerRadius(radius - donutWidth)
        .outerRadius(radius);

      var pie = d3
        .pie()
        .value(function (d) {
          return d.value;
        })
        .sort(null);

      var legendRectSize = 18;
      var legendSpacing = 4;

      var path = svg
        .selectAll("path")
        .data(pie(donutChart1Data))
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", function (d, i) {
          return color(d.data.name);
        });

      path.on("mouseover", function (d) {
        var total = d3.sum(
          donutChart1Data.map(function (d) {
            return d.value;
          })
        );

        var percent = Math.round((1000 * d.data.value) / total) / 10;

        toolTip2.select(".label").html(d.data.name);
        toolTip2
          .select(".count")
          .html(Number(Math.round(d.data.value)).toLocaleString());
        toolTip2.select(".percent").html(percent + "%");
        toolTip2
          .style("left", d3.event.pageX - 50 + "px")
          .style("top", d3.event.pageY - 70 + "px")
          .style("display", "inline-block")
          .style("display", "block");
      });

      path.on("mouseout", function () {
        toolTip2.style("display", "none");
      });

      var legend = svg
        .selectAll(".legend")
        .data(color.domain())
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) {
          var height = legendRectSize + legendSpacing;
          var offset = (height * color.domain().length) / 2;
          var horz = -2 * legendRectSize;
          var vert = i * height - offset;
          return "translate(" + horz + "," + vert + ")";
        });

      legend
        .append("rect")
        .attr("width", legendRectSize)
        .attr("height", legendRectSize)
        .style("fill", color)
        .style("stroke", color);

      legend
        .append("text")
        .attr("x", legendRectSize + legendSpacing)
        .attr("y", legendRectSize - legendSpacing)
        .text(function (d) {
          return d;
        });

      //barChart3

      var tooltip = d3
        .select("#column7")
        .append("div")
        .attr("class", "toolTip");

      var margin = { top: 20, right: 20, bottom: 150, left: 70 },
        width = 1300 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

      var x = d3.scaleBand().rangeRound([0, width], 0.1).paddingInner(0.01);

      var y = d3.scaleLinear().range([height, 0]);

      var xAxis = d3.axisBottom().scale(x);

      var yAxis = d3.axisLeft().scale(y).ticks(20);

      var svg = d3
        .select("#column7")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      //-------------------------------
      var neighbourhoodTheftCountsRolled = d3.rollups(
        file_1,
        (v) => v.length,
        (d) => d.Neighbourhood
      );

      //console.log(neighbourhoodTheftCountsRolled)
      //console.log(neighbourhoodTheftCountsRolled.length)

      //console.log(neighbourhoodTheftCountsRolled[0][0])
      //console.log(neighbourhoodTheftCountsRolled[0][1])

      var bar3Data = [];

      //console.log(neighbourhoodTheftCountsRolled[0][0])
      //console.log(neighbourhoodTheftCountsRolled[0][1])

      for (var i = 0; i < neighbourhoodTheftCountsRolled.length; i += 1) {
        bar3Data.push({
          name: neighbourhoodTheftCountsRolled[i][0],
          value: neighbourhoodTheftCountsRolled[i][1],
        });
      }

      //console.log(bar3Data)

      //sort array of objects in descending order
      bar3Data.sort((a, b) => (a.value > b.value ? -1 : 1));
      //console.log(donutChart1Data_test.sort((a, b) => (a.value > b.value) ? -1 : 1))
      //-------------------------------

      //for bar colors
      var huecolor = d3.scaleSequential(d3.interpolateRainbow).domain([0, 7]);

      x.domain(
        bar3Data.map(function (d) {
          return d.name;
        })
      );
      y.domain([
        0,
        d3.max(bar3Data, function (d) {
          return d.value;
        }),
      ]);

      svg
        .append("g")
        .attr("class", "axisblack")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .style("font-size", 6)
        .style("text-anchor", "end")
        .attr("dx", "-1.2em")
        .attr("dy", "-.8em")
        .attr("transform", "rotate(-65)");

      svg
        .append("g")
        .attr("class", "axisblack")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Value");

      svg
        .selectAll(".bar")
        .data(bar3Data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function (d) {
          return x(d.name);
        })
        .attr("width", x.bandwidth())
        .attr("y", function (d) {
          return y(d.value);
        })
        .style("fill", function (d, i) {
          return huecolor(i);
        })
        .attr("height", function (d) {
          return height - y(d.value);
        })
        .on("mousemove", function (d) {
          tooltip
            .style("left", d3.event.pageX - 50 + "px")
            .style("top", d3.event.pageY - 70 + "px")
            .style("display", "inline-block")
            .html(
              "<b>" +
                d.name +
                "</b>" +
                "<br>" +
                Number(parseFloat(d.value).toFixed(0)).toLocaleString()
            );
        })
        .on("mouseout", function (d) {
          tooltip.style("display", "none");
        });

      //label for Y-axis
      svg
        .append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("x", -115)
        .attr("y", -70)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("Number of Bicycles Stolen")
        .style("font-size", 12)
        .style("font-weight", 400);

      //label for X-axis
      svg
        .append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", width / 2 + 55)
        .attr("y", height + 148)
        .text("Neighbourhood Name and Hood ID")
        .style("font-size", 12)
        .style("font-weight", 400);
    })(window.d3);

    //end of d3 function
  });

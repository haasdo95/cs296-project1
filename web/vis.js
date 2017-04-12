"use strict";

/* Boilerplate jQuery */
$(function() {
  $.get("res/uiuc_demographics_2005_15.csv")
   .done(function (csvData) {
     var data = d3.csvParse(csvData);
     visualize(data);
   })
  .fail(function(e) {
     alert("Failed to load CSV file!");
  });
});

/* Visualize the data in the visualize function */
var visualize = function(data) {
  console.log(data);
  var majorCount = [];

  data = data.filter(function (d) {
      return d.Fall == "2015";
  })

  var groupData = _.groupBy(data, "Major Name");
  groupData = _.toArray(groupData);
  console.log(groupData);
  // groupData is now an array of arrays(a major)
  groupData.forEach(function (major) {
      var majorName = major[0]["Major Name"];
      var mj = {
          Total: 0,
          Male: 0,
      }
      for (let m of major) {
          mj.Total += Number(m.Total);
          mj.Male += Number(m.Male);
      }
      mj.majorName = majorName;
      mj.Female = mj.Total - mj.Male;
      majorCount.push(mj);
  })
  majorCount = majorCount.sort(function (m1, m2) {
      return m1.Total - m2.Total
  })
  console.log(majorCount);

  var desiredNumOfMajor = [];
  desiredNumOfMajor.push(Math.floor(majorCount.length * 0.4));
  desiredNumOfMajor.push(Math.floor(majorCount.length * 0.3));
  desiredNumOfMajor.push(Math.floor(majorCount.length * 0.12));
  desiredNumOfMajor.push(Math.floor(majorCount.length * 0.12));
  desiredNumOfMajor.push(majorCount.length - desiredNumOfMajor.reduce(function (cumu, m) {
      return cumu + m
  }))
  var desiredNumOfMajorCumu = _.reduce(desiredNumOfMajor, function (acc, n) {
      acc.push( (acc.length > 0 ? acc[acc.length-1] : 0) + n);
      return acc
  }, [])
  console.log(desiredNumOfMajor);
  console.log(desiredNumOfMajorCumu);
  var thresholds = [];
  var thres = 0;
  desiredNumOfMajor.forEach(function (num) {
      thres += num;
      thresholds.push(majorCount[thres-1].Total);
  })
  console.log(thresholds);
  var thetaIncs = desiredNumOfMajor.map(function (num) {
      return 2 * Math.PI/num;
  })
  console.log(thetaIncs);
  // == BOILERPLATE ==
  var margin = { top: 50, right: 50, bottom: 50, left: 50 },
     width = 1200 - margin.left - margin.right,
     height = 800; // hardcode

  var svg = d3.select("#chart")
              .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .style("width", width + margin.left + margin.right)
              .style("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", "translate(" + (margin.left + width/2) + "," + (margin.top + height/2) + ")")

  // == Your code! :) ==
  	var svgEnter = svg.selectAll("ewww")
     				.data(majorCount)
     				.enter();

  	svgEnter.append("circle")
     .attr("radLevel", function (d, i) {
         for(var radLevel = 0; radLevel < desiredNumOfMajorCumu.length; ++radLevel) {
             if (desiredNumOfMajorCumu[radLevel] > i) {
                 break;
             }
         }
         return radLevel;
     })
     .attr("r", function () {
         return 10; // hardcode
     })
     .attr("cx", function (d, i) {
         var radLevel = d3.select(this).attr("radLevel");
         var radius = (-radLevel + 6) * 70; // real distance
         return radius * Math.cos(thetaIncs[radLevel] * i);
     })
     .attr("cy", function (d, i) {
         var radLevel = d3.select(this).attr("radLevel");
         var radius = (-radLevel + 5) * 70; // real distance
         return radius * Math.sin(thetaIncs[radLevel] * i);
     })
     .attr("fill", function (d,i) {

     })

    for (var i = 6; i >= 0; i--) {
      svg.append("ellipse")
        .attr("cx",0)
        .attr("cy",0)
        .attr("rx",(width/2)*(i/6))
        .attr("ry",(height/2)*(i/6)*6.5/6)
        .attr("fill", "hsla(225, 100%, 50%, 0.1)");
    }
};

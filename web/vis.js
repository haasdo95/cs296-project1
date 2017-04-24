"use strict";

var data = null;

var checkedColleges = {
    "KP " : true,
    "KM " : true,
    "KT " : true,
    "KV " : true,
    "LC " : true,
    "KY " : true,
    "KL " : true,
    "KN " : true,
    "KR " : true,
    "KS " : true,
    "LG " : true,
    "NB " : true,
    "KW " : true,
    "LN " : true,
    "LL " : true,
    "KU " : true,
    "LP " : true,
    "LE " : true,
    "LM " : true
};

/* Boilerplate jQuery */
$(function() {
  $.get("res/uiuc_demographics_2005_15.csv")
   .done(function (csvData) {
     data = d3.csvParse(csvData);
     var tempData = data.filter(function (d) { // filtered by year
         return d["Fall"] == "2015";
     });
     visualize(tempData);
   })
  .fail(function(e) {
     alert("Failed to load CSV file!");
  });
});

$("#uncheck").on("click", function (event) {
    console.log("Uncheck You!");
    $(".form-check-input").prop("checked", false);
    checkedColleges = {};
    $("svg").remove();
    visualize([]);
})

$("#sb").on("change", function (event) {
    $("#chosenYear").text(2000+Number($(this).val()));
    if (!data) {
        return;
    }
    console.log("Now the dict is: ", checkedColleges);
    var tempData = data.filter(function (d) { // filtered by year
        return (d["Fall"] == $("#chosenYear").text()) && checkedColleges[d["College"]];
    });
    $("svg").remove();
    visualize(tempData);
})

$(".form-check-input").on("change", function (event) {
    var chosen = event.target;
    if (chosen.checked) { // newly checked
        checkedColleges[chosen.getAttribute("college")+" "] = true;
    } else { // newly unchecked
        delete checkedColleges[chosen.getAttribute("college")+" "];
    }
    if (!data) {
        return;
    }
    console.log("Now the dict is: ", checkedColleges);
    var tempData = data.filter(function (d) { // filtered by year
        return (d["Fall"] == $("#chosenYear").text()) && checkedColleges[d["College"]];
    });
    $("svg").remove();
    visualize(tempData);
})

/* Visualize the data in the visualize function */
var visualize = function(data) {
  console.log("CALLED!");
  console.log(data);
  if (!data.length) { // empty svg
      var svg = d3.select("#chart")
            .append("svg");
      return;
  }
  var majorCount = [];

  var groupData = _.groupBy(data, "Major Name");
  groupData = _.toArray(groupData);
  // console.log(groupData);
  // groupData is now an array of arrays(a major)
  groupData.forEach(function (major) {
      var majorName = major[0]["Major Name"];
      var college = major[0]["College"];
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
      mj.college = college;
      mj.femalpre = mj.Female*1.0/mj.Total;
      if(mj.Total!=0){
        majorCount.push(mj);
    }
  })
  majorCount = majorCount.sort(function (m1, m2) {
      return m1.Total - m2.Total
  })

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
  // console.log(desiredNumOfMajor);
  // console.log(desiredNumOfMajorCumu);
  // var thresholds = [];
  // var thres = 0;
  // desiredNumOfMajor.forEach(function (num) {
  //     thres += num;
    //   thresholds.push(majorCount[thres-1].Total);
  // })
  // console.log(thresholds);
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
              .attr("transform", "translate(" + (width/2) + "," + (height/2 + 100) + ")")

  // == Your code! :) ==
  var tip = d3.tip()
           .attr('class', 'd3-tip')
  	   .style("transition","all 0.2s linear")
           .html(function(d) {

             return "<div>" + "Major Name: "+d.majorName  + "</div>"+
					"<div>" + "Total: " + d.Total  + " students"+"</div>"+
		     "<div>" + "Female: " + d.Female  + " students"+"</div>"+
                    "<div>" + "Female Precentage: "+Math.round(d.femalpre*100)+"%"+"</div>";
           });
           svg.call(tip);

  for (var i = 4; i >= -1; i--) {
      svg.append("ellipse")
               .attr("cx",0)
               .attr("cy",0)
               .attr("rx",(6-i)*70)
               .attr("ry",(5-i)*70)
               .attr("fill", "hsla(33, 100%, 50%, 0.1)");
  }

  svg.selectAll("ewww")
     .data(majorCount)
     .enter()
     .append("circle")
     .attr("radLevel", function (d, i) {
         for(var radLevel = 0; radLevel < desiredNumOfMajorCumu.length; ++radLevel) {
             if (desiredNumOfMajorCumu[radLevel] > i) {
                 break;
             }
         }
         return radLevel;
     })
     .attr("r", function (d) {
         var radius = Math.log2(d.Total)*1.7;
         return Math.max(radius, 5);
     })
     .attr("fill-opacity",0.7)

     .attr("fill", function (d) {
         var maxpinkr = 255;
         var maxpinkg = 100;
         var maxpinkb = 150;

         var maxbluer = 97;
         var maxblueg = 168;
         var maxblueb = 255;

         var red = maxpinkr*d.femalpre+(1-d.femalpre)*maxbluer;
         if(red>255){
             red = 255;
         }
         var green = maxpinkg*d.femalpre+(1-d.femalpre)*maxblueg;
         if(green>255) {
             green = 255;
         }
         var blue = maxpinkb*d.femalpre+(1-d.femalpre)*maxblueb;
         if(blue>255) {
             blue = 255;
         }
         return d3.rgb(red, green, blue);
     })

     .on("mouseover",function(d,i){
		 tip.show(d);
         d3.select(this).transition()
         .attr("r",function(d){
             var radius = Math.log2(d.Total)*4.0;
             return Math.max(radius, 10);
         })
         .attr("fill",function(d){
             return d3.rgb(0,225,50);
         });
        }
     )
     .on("mouseout",function(d,i){
		 tip.hide(d,i);
         d3.select(this).transition()
         .attr("r",function(d){
             var radius = Math.log2(d.Total)*1.7;
             return Math.max(radius, 5);
         })
         .attr("fill",function(d){
             var maxpinkr = 255;
             var maxpinkg = 100;
             var maxpinkb = 150;

             var maxbluer = 97;
             var maxblueg = 168;
             var maxblueb = 255;
             return d3.rgb(maxpinkr*d.femalpre+(1-d.femalpre)*maxbluer
                 ,maxpinkg*d.femalpre+(1-d.femalpre)*maxblueg
                 , maxpinkb*d.femalpre+(1-d.femalpre)*maxblueb);
             });
            }
        )
        .transition()
        .attr("cx", function (d, i) {
            var radLevel = d3.select(this).attr("radLevel");
            var radius = (-radLevel + 6) * 70; // real distance
            return radius * Math.cos(thetaIncs[radLevel] * i);
        })
        .transition()
        .attr("cy", function (d, i) {
            var radLevel = d3.select(this).attr("radLevel");
            var radius = (-radLevel + 5) * 70; // real distance
            return radius * Math.sin(thetaIncs[radLevel] * i);
        })
};

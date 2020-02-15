/********** To create the glyphs for any selected drug on the overview- by default for furosemide Drug */
function read_glyph_data(searchDrug, check_flag){
    var Drugs = 2;
    var width = 120;
    var height = 120 + 15;
    var originX =60;
    var originY = 60 + 15;
    var main_radius=0;
    var pi = Math.PI/180;
    var color = ['#016c59', '#d0d1e6', '#a6bddb', '#67a9cf', '#1c9099'];
    var Drugs_check =0;
    var obj = {};
    var list = [];
    var drugs_list = [];

    d3.text("data/Q4_2014_rules_new.txt", function(unparsedData){
    var data = d3.tsv.parseRows(unparsedData);
    for ( var row=1; row<data.length;row++){
            var id =  data[row][0]
            var No_of_drugs = 2
            var ADR = data [row][2]
            var No_of_itmes = (Math.pow(2,No_of_drugs) - 1) * 3 + 4
            drugs_split(data[row][3])
            if(check_flag=='drug'){
                if(drugs_list.indexOf(searchDrug) > -1){
                    for ( i =3; i<No_of_itmes && data[row][i]!=''; i=i+3){
                          obj['name'] = data[row][i]
                          obj['support']= +data[row][i+1]
                          obj['Conf'] = +data[row][i+2]
                          list.push(obj)
                          obj ={}
                      }
                      plot(list, id, ADR, No_of_drugs)
                      list = []
                  }
                drugs_list = [];
              }
            
            else if (check_flag=='list'){
                for (i = 0; i<searchDrug.length; i++){

                  if(drugs_list.indexOf(searchDrug[i]) > -1){
                    for ( i =3; i<No_of_itmes && data[row][i]!=''; i=i+3){
                       // Splitting the drug names to search for the specific drug
                          // console.log(drugs_list)
                          obj['name'] = data[row][i]
                          obj['support']= +data[row][i+1]
                          obj['Conf'] = +data[row][i+2]
                          list.push(obj)
                          obj ={}
                      }
                      plot(list, id, ADR, No_of_drugs)
                      list = []
                  }
                drugs_list = [];
                }

            }

       } //end for
    });

    function plot(data,id, ADR, No_of_drugs){
    //    console.log(data)
       var No_of_rules = Math.pow(2, No_of_drugs) - 2
       var flag =0;
       var end_sub_index=0;
       var check = No_of_drugs- 1;
       var angle = 360/ No_of_rules;
       var subrules_conf = [];
       var svgContainer = d3.select("#vis")
                            .append("svg")
                            .attr("width",width)
                            .attr("height", height)


      var div = d3.select("body")
                  .append("div")
                  .attr("class", "toolTip");

      var MainCirlce = svgContainer.selectAll("g")
          .data(data)
          .enter()


      var circle = MainCirlce
           .append("circle")
           .attr("cx", originX)
           .attr("cy", originY)
           .attr("r",function(d,i){
              if( i==0){
                    return d.Conf/2;
                } else
                    return 
            })
           .style("fill",color[0]) 
           .on("mousemove", function(d){
            div.style("left", d3.event.pageX+10+"px");
            div.style("top", d3.event.pageY-25+"px");
            div.style("display", "inline-block");
            div.html("Drugname: "+ (d.name)+"<br>"+ "Support: " + (d.support) +"<br>"+ "Confidence: " + (d.Conf));
        })

        .on("mouseout", function(d){
            div.style("display", "none");
        })

        var arc = d3.svg.arc()
                   .outerRadius(function(d,i){
                      if (i==0){
                           main_radius= d.Conf/2
                           return 0
                      }
                      else if (i!==0){
                          return d.Conf
                      }
                   })  
                   .innerRadius(0) 
                   .startAngle(function (d,i ){
                    if (i!=0){
                      return (i-1) *angle* (pi)
                    }
                  })
                  .endAngle(function (d,i ){
                    if (i!=0){
                      return (i)* angle * (pi)
                    }
                  });          

       var paths =  MainCirlce.append("path")
        .attr("d", arc)
        .style("fill", color[1])
        .style("fill", function(d,i){
          if (i==0 ){
              return color[0]
          }
          else if (i > 0){
              return color[1]
            }
        })
        .attr("transform", function(d,i){
            return "translate("+originX + "," + originY + ") rotate(" +  ((-1)* (Math.PI))+  ")"
         })
       .on("mousemove", function(d){
            div.style("left", d3.event.pageX+10+"px");
            div.style("top", d3.event.pageY-25+"px");
            div.style("display", "inline-block");
            div.html("Drugname: "+ (d.name)+"<br>"+ "ADR: " + ADR +"<br>"+ "Support: " + (d.support) +"<br>"+ "Confidence: " + (d.Conf) + "<br>"+ "Rank: " + (id));
        })
        .on("mouseout", function(d){
            div.style("display", "none");
        })
        .on("click", function(d,i){
            d.name = d.name.replace(/[\[\]']+/g,'')
            prepare_reports(d.name.toLowerCase(), "drug")
        })
    }

    function drugs_split(str){
            /* To remove the square brackets from the drug names */
                str = str.replace(/[\[\]']+/g,'')
                str=  str.split(" ");
                for (i = 0; i < str.length; i++){
                  drugs_list.push(str[i].toLowerCase())
                }
    }


}
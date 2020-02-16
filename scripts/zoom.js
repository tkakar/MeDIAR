/*code to build the overview --- the network diagram*/
var obj = {};
var drugs_list = [];
var matrix=null, nodes =null;
var search_drug=null;
var filter_rb_val = 'both' ;
var overall_data=null;
var link_distance = 50;
var selected_node = null;
var selected_interaction=null;
var selected_Score = null;
var menu_selection=null;
var DME_LIST=[];
var reportsCount=0;
var rules_data =null, reports_data=null;
var obj = {};
// var drugs_list = [];
// var matrix, nodes;
// var search_drug;
// var filter_rb_val = 'both' ;
// var overall_data=null;
// var link_distance = 50;
// var selected_node = null;
// var selected_interaction=null;
// var selected_Score = null;
// var menu_selection=null;
// var DME_LIST=[];
// var rules_data, reports_data, reportsCount;
var assigned_drugs= ['lansoprazole', 'byetta', 'ondansetron', 'omeprazole', 'fluororasil', 'metformin', 'abilify', 'victoza', 'zometa', 'furosemide','lantus', 'atorvastatin','humira', 'dexamethasone', 'simavastatin'];

/*tooltip on mousover, used throughtout*/
var div = d3.select("body")
            .append("div")
            .attr("class", "toolTip");

// console.log(div)

/* mouseover for the filter menu*/   
function mouseOverText(event, text){
    // console.log(text)
    div.style("left", d3.event.pageX+"px");
    div.style("top",  d3.event.pageY+"px");
    div.style("display", "inline-block");
    div.html(text)
}

d3.select("#reset_button")
    .on("click", function(){
    //   console.log("clicked")
      selected_drugs = [];
      d3.selectAll("#div_graph > svg").remove();
      d3.selectAll("#div_profile > svg").remove();
      d3.selectAll("#vis > svg").remove();
      d3.selectAll("#div_table > table").remove();
      prepare_data();
      prepare_profile("furosemide","node")
      prepare_reports("furosemide", "drug")
      read_glyph_data("furosemide", "drug")
    })
    .on("mousemove",function(event) {
        mouseOverText(event, "Resets any drug selection filters, reloads the whole views")
    })
    /*WHEN MOUSE out then remove the tooltip text*/        
    .on("mouseout", function(d){
                div.style("display", "none");
    });

  
/*When the drugs are selected from menu, the data changes and all the visualizations are updated for the new data*/
d3.selectAll("#drugs_menu").on("change",function(event) {
  		    var selected_drugs=[]
            d3.selectAll("#vis *").remove();
            d3.selectAll("#pinned_graphs *").remove();
            d3.select(this).selectAll("option").filter(function (d, i) { if (this.selected) selected_drugs.push (this.value); return this.selected; });
			 var sel_overall =[];
			 drugs_list = [];
                	// console.log(search_drug, data)
                	overall_data.forEach(function(d){
                			// console.log(d['drugs'], selected_drugs[s])
                			for(var s=0;s<selected_drugs.length;s++){
                				if (d["drugs"].indexOf(selected_drugs[s]) !== -1){
		            				sel_overall.push(d)
		            				drugs_split(d["drugs"])
                				} 
                			}
                	})
         d3.selectAll("#div_graph > svg").remove();
         var drugs_list_no_duplicates = remove_duplicates(drugs_list)
         drugs_list=[];
         createAdjacencyMatrix (drugs_list_no_duplicates, JSON.parse(JSON.stringify(sel_overall)));
         prepare_profile(selected_drugs[0], "node")
         prepare_reports(selected_drugs[0], "drug")
         read_glyph_data(selected_drugs[0], "drug")
         d3.select("#report_heading").text("Reports for selected Drug " + selected_drugs[0] + ": " + reportsCount);
         d3.select("#galaxy_heading").text("Score Glyphs for the selected Drug: " + selected_node);
})   /*end menu change*/ 
         


/* WHEN MOUSE OVER ON THE DRUGS MENU, DISPLAY tooltip TEXT*/
d3.selectAll("#drugs_menu")
    .on("mousemove",function(event) {
        console.log("move")
        mouseOverText(event, "Select a drug to view its interactions (DIARs)")
    })
    /*WHEN MOUSE out then remove the tooltip text*/        
    .on("mouseout", function(d){
                div.style("display", "none");
    });

/* when a value is searched in the search box*/
d3.select('#search_txbox')
    .on('change', function() {
            d3.selectAll("#div_graph > svg").remove();
            link_distance = 100;
            search_drug=this.value.toLowerCase()
                prepare_data (filter_rb_val)
    })
    .on("mousemove", function(event){
        mouseOverText(event, "Search a drugname to see its interactions (DIARs)")
    })
    .on("mouseout", function(d){
        div.style("display", "none");
    });

/* update data when the Score slider is moved*/
d3.select("#nScore")
   .on("input", function() {
        d3.selectAll("#div_graph > svg").remove();
        d3.select("#nScore_value").text(this.value);
        prepare_data(+this.value);
    })
    .on("mousemove", function(event){
        mouseOverText(event, "Change the score to filter interactions (DIARs)")
    })
    .on("mouseout", function(d){
        div.style("display", "none");
    });
    
/* prepare data and check for any of the filters and update accordingly*/  
function prepare_data(status_val){
	var overall = [], search_overall = [];
	 d3.text("data/Q4_2014_rules_new.txt", function(unparsedData)
        {
         var data = d3.csv.parseRows(unparsedData);
         var status = ['known', 'unknown']
         var data = d3.tsv.parseRows(unparsedData);
         var len = data.length;
         for ( var row=1; row<len;row++){
              var Rank = data[row][0]
              var Score = data[row][1]
              // var No_of_drugs = data[row][2]
              var ADR = data [row][2]
              var drugs_comb = data[row][3].toLowerCase()
              var id = data[row][13]
              drugs_comb = drugs_comb.replace(/[\[\]']+/g,'')
              drugs_comb= drugs_comb.split(" ")
              drugs_comb = drugs_comb;
                  obj['Score'] = +d3.round(Score,4)
               	  obj['Rank'] = Rank;
                  obj['status']=data[row][12]
                  obj['ADR'] = ADR
                  obj['drugs'] = drugs_comb
                  obj['p_id'] = id
                  obj['drug_comb'] = data[row][3]
                  obj['Score'] = +d3.round(Score,4)
                  obj['support'] = +data[row][4]

                  if (status_val){
                  		if (status_val =='known' && obj.status=='known'){
                  			drugs_split(drugs_comb);
                  			overall.push(obj)
                  			obj ={}
                  		}
                  		else if(status_val=='unknown' && obj.status=='unknown'){
                  			 drugs_split(drugs_comb)
                  			 overall.push(obj)
                  			 obj ={}
                  		}
                  		 else if (status_val == 'both'){
		                  	drugs_split(drugs_comb)
		                  	overall.push(obj)
		                  	obj ={}
		                 }
		                 else if (Number.isFinite(status_val)){
		                 	var sc = +d3.round(Score,4)
		                 	 if (sc > (status_val-0.01) ){
		                 	 	drugs_split(drugs_comb)
				                  	overall.push(obj)
				                  	obj ={}
		                 	 }
		                 }
                  }
                  
                  else if (!status_val){
                  	 if(selected_Score){

                  	 }
                  	 else{
                  	drugs_split(drugs_comb)
                  	overall.push(obj)
                  	obj ={}
                  	 }
                  }
         }
         if (overall)
         		set_data(overall)
      });
	
}

/*this function sets the data if it is for the assigned drugs or just one search drugs or all data*/
function set_data(data){
	var search_flag=0
	overall_data = data 
    var sel_overall =[];
	var search_overall =[];
	if(search_drug){
		drugs_list = [];
                	// console.log(search_drug, data)
        overall_data.forEach(function(d){
            if (d["drugs"].indexOf(search_drug) !== -1){
                search_overall.push(d)
                drugs_split(d["drugs"])
                overall_data = search_overall
                search_flag = 1;
            } 
                				
            })
            if(search_flag == 0){
                    alert("Drug not found!!")
                    return 0;
            }
            else
                search_flag = 0
    } 
    else {
    drugs_list=[];
        overall_data.forEach(function(d){               
            for(var s=0;s<assigned_drugs.length;s++){
                if (d["drugs"].indexOf(assigned_drugs[s]) !== -1){
                    sel_overall.push(d)
                    drugs_split(d["drugs"])
                } 
            }
        })
    }// end else
            

    var drugs_list_no_duplicates = remove_duplicates(drugs_list)
    drugs_list_no_duplicates.sort();
// console.log(sel_overall, overall_data)

    d3.selectAll("#drugs_menu")
        .selectAll("option")
        .data(drugs_list_no_duplicates)
        .enter()
        .append("option")
        .attr("value", function(d) {return d; })
        .text(function(d) { return d; }); 

    if (sel_overall){
        createAdjacencyMatrix (drugs_list_no_duplicates, JSON.parse(JSON.stringify(sel_overall)));
    }
         drugs_list=[];
}


/*this function bulids the network diagram, by first converting the data into a form accepted by force layout */
function createAdjacencyMatrix (nodes_data, links){
        /**** variables used throught the code and also the force layout initialization such as beharior on dragging a node etc.*/
        var low_color="#fecc5c", low_med_color="#fd8d3c",  med_color="#f03b20", high_color= "hsl(0, 100%, 25%)"
        var default_node_color = "#2196f3"; // "#E8CDDC"; "#2d8653";
        var default_link_color =  "grey"//"#A9A9A9";
        var nominal_base_node_size = 12;
        var nominal_text_size = 12;
        var max_text_size = 24;
        var nominal_stroke = 2.5;
        var max_stroke = 5;
        var max_base_node_size = 36;
        var min_zoom = 0.1;
        var max_zoom = 7;
        var svg = d3.select("#div_graph").append("svg");
        var zoom = d3.behavior.zoom().scaleExtent([min_zoom,max_zoom])
        var g = svg.append("g")
    
        var w = $('#div_graph').innerWidth()
		var h = $('#div_graph').innerHeight()

		var n = 50;  // to converge the force layout to make it static
		var keyc = true, keys = true, keyt = true, keyr = true, keyx = true, keyd = true, keyl = true, keym = true, keyh = true, key1 = true, key2 = true, key3 = true, key0 = true

		var focus_node = null, highlight_node = null;

		var text_center = false;
		var outline = false;

		var min_Score = 0;
		var max_Score = 1;

		var color = d3.scale.linear()
                            .domain([min_Score, (min_Score+max_Score)/2, max_Score])
                            .range(["#fcae91","#de2d26", "#a50f15"]);

		var highlight_color = "#2196f3";
		var highlight_trans = 0.1;
		  
		var size = d3.scale.pow().exponent(1)
		  .domain([1,100])
		  .range([8,24]);
			
		var force = d3.layout.force()
		  .linkDistance(link_distance)
          .charge(-500)
		  .size([w,h])

	    var drag = d3.behavior.drag()
					        .on("dragstart", dragstart)
					        .on("drag", dragmove)
					        .on("dragend", dragend);

	   function dragstart(d, i) {
	    // console.log("Hi")
	        force.stop() // stops the force auto positioning before you start dragging
	    }

	    function dragmove(d, i) {

	        d.px += d3.event.dx;
	        d.py += d3.event.dy;
	        d.x += d3.event.dx;
	        d.y += d3.event.dy; 
	        tick(); // this is the key to make it work together with updating both px,py,x,y on d !
	    }

	    function dragend(d, i) {
	        tick();
	    }



		svg.style("cursor","move");

		/* To convert the nodes data to have IDs -- this is the format used by the nodes under force layout.. these ids are not the report ids, these ids match
         each link with the nodes */
		var n_l = nodes_data.length;
   		var drug_list_to_object ={}
   		var drug_list =[]

         for (var i = 0; i<n_l; i++){
                      // console.log(i)
                    drug_list_to_object['id'] =nodes_data[i]
                    drug_list.push(drug_list_to_object)
                    drug_list_to_object={}
         }
  		var nodes = drug_list;

  		/* To convert the links data to have IDs as indexes instead of names*/
  		var hash_lookup = [];
	    // make it so we can lookup nodes in O(1):
	    nodes.forEach(function(d, i) {
	     hash_lookup[d.id] = d;
	    });

	    links.forEach(function(d, i) {
		    d.source = hash_lookup[d.source];
		    d.target = hash_lookup[d.target];
		 });

		function isConnected(a, b) {
            // var linkedByIndex;
			/* For actual example uncomment below line, our data has different format*/
	        // return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index] || a.index == b.index;
	        return linkedByIndex[a.id + "," + b.id] || linkedByIndex[b.id + "," + a.id] || a.index == b.index;
	    }

		function hasConnections(a) {
			for (var property in linkedByIndex) {
					s = property.split(",");
					var rev_property =  s[1] + ',' + s[0]
					// console.log((s[0] == a.id || s[1] == a.id) && (linkedByIndex[property] || linkedByIndex[rev_property] ), property)
					if ((s[0] == a.id || s[1] == a.id) && (linkedByIndex[property] || linkedByIndex[rev_property] ) )return true;
			}
			return false;
		}
		
    /*calling force library to build the network-- actually it converts data to a source and target format*/	
	  		
        force
            .nodes(nodes)
            .links(links)
            // .start();


        /*setting up  the link, its styles, its behavior on click and mouse over etc*/  
        var link = g.selectAll(".link")
            .data(links)
            .enter().append("line")
            .attr("class", "link")
            .style("stroke", function(d){
            if (d.Score<0 || d.Score<=0)
                return low_color;
            else if (d.Score>0 && d.Score<=0.01)
                return low_med_color;
            else if (d.Score>0.01 && d.Score<=0.2)
                return med_color;
            else if (d.Score>0.2)
                return high_color;
            })
            .style("stroke-width", function(d) { 
                if (d.status=='known')
                    return 2;
                else
                    return 5;
            })
            .style("stroke-dasharray",function(d,i) {
            if (d.status=='known'){
                    return  ("3,3");
            }
            })
            .on("click", function(d){
                exit_highlight();
                d3.select(this).style("stroke",highlight_color)
                selected_interaction = d
                if(selected_interaction){
                    prepare_profile(selected_interaction, "link")
                    d3.select("#report_heading").text("Reports for Interaction (" + selected_interaction.drugs[0]+ " - " + selected_interaction.drugs[1] + ") : " + reportsCount);
                    prepare_reports(selected_interaction,"")
                }
        
            })
            .on("mousemove", function(d){
                    mouseOverText(event, "Click the interaction to see reports and score<br> Drugs: "+ (d.source.id)+ " - " + d.target.id + "<br>"+ "ADR: " + d.ADR +"<br>"+ "Reports Count: " + d.support +"<br>"+ "Score: " + d.Score  +"<br>"+  "Status: " + d.status) 
            })

            .on("mouseout", function(d){
                div.style("display", "none");
            });


    var node = g.selectAll(".node")
            .data(nodes)
            .enter().append("g")
            .attr("class", "node")
            .call(drag)

        
    node.on("dblclick.zoom", function(d) { d3.event.stopPropagation();
    var dcx = (window.innerWidth/2-d.x*zoom.scale());
    var dcy = (window.innerHeight/2-d.y*zoom.scale());
    zoom.translate([dcx,dcy]);
        g.attr("transform", "translate("+ dcx + "," + dcy  + ")scale(" + zoom.scale() + ")");

    });

    
    var tocolor = "fill";
    var towhite = "stroke";
    if (outline) {
        // console.log("outline")
        tocolor = "stroke"
        towhite = "fill"
    }

		/*setting the style of the color*/		
	var circle = node.append("circle")
                    .attr("r", 10)
                    .style("stroke", function(d) { 
                        return default_node_color; 
                    })
                    .style("stroke-width", 5)
                    .style("fill", 'white');
		  	
						
	var text = g.selectAll(".text")
                .data(nodes)
                .enter().append("text")
                .attr("dy", "-.15em")
                .style("font-size", nominal_text_size + "px")
 
    if (text_center)
        text.text(function(d) { return d.id; })
        .style("text-anchor", "middle");
    else 
    text.attr("dx", function(d) {return (size(d.size)||nominal_base_node_size);})
        .text(function(d) { return '\u2002'+d.id; });


    /*mouseover a node creates a div with some information and disappears on mouseout*/
	node.on("mouseover", function(d) {
			// set_highlight(d);
		})
        .on("mousedown", function(d) { //d3.event.stopPropagation();
            focus_node = d;
        })
        .on("mousemove", function(d){
            mouseOverText(event,"Click drug "+ (d.id)+ " to filter its data" )
        })
        .on("mouseout", function(d){
            div.style("display", "none");
        })
        .on('contextmenu', function(d){ 
            d3.event.preventDefault();
            var x =  d3.event.pageX -180//+"px"
            var y =  d3.event.pageY- 50//+"px"
            menu(x,y,d);
        })
        .on('click', function(d){
            exit_highlight();
            d3.selectAll("#div_buttons").style("visibility","visible")
            d3.select(this).select("circle").style("fill",highlight_color).style("stroke", highlight_color);
            selected_node = d.id;
            if(selected_node){
                d3.selectAll("#vis > *").remove()
                d3.selectAll("#pinned_graphs > *").remove()
                read_glyph_data(selected_node, "drug")
                prepare_reports(selected_node, "drug")
                d3.select("#report_heading").text("Reports for selected Drug " + selected_node + ": " + reportsCount);
                d3.select("#galaxy_heading").text("Score Glyphs for the selected Drug: " + selected_node);
            }
        })
				


    /*when node is not selected anymore, change everything back to normal*/
	function exit_highlight(){
        highlight_node = null;
        svg.style("cursor","move");
        if (highlight_color!="white"){
            circle.style("stroke", default_node_color);
            circle.style("fill", "white");
            text.style("font-weight", "normal");
        //   link.style("stroke", function(d){
        // 			return color(d.Score)
        //     })   
            link.style("stroke", function(d){
                    if (d.Score<0 || d.Score<=0)
                        return low_color;
                    else if (d.Score>0 && d.Score<=0.01)
                        return low_med_color;
                    else if (d.Score>0.01 && d.Score<=0.2)
                        return med_color;
                    else if (d.Score>0.2)
                        return high_color;
            })
            .style("stroke-width", function(d) { 
                    if (d.status=='known')
                        return 2;
                    else
                        return 5;
            })
            .style("stroke-dasharray",function(d,i) {
                if (d.status=='known'){
                        return  ("3,3");
                }					
            })
        }			

	}

    function set_focus(d){	
        if (highlight_trans<1)  {
            circle.style("opacity", function(o) {
                        return isConnected(d, o) ? 1 : highlight_trans;
            });

            text.style("opacity", function(o) {
                return isConnected(d, o) ? 1 : highlight_trans;
            });
            
            link.style("opacity", function(o) {
                return o.source.index == d.index || o.target.index == d.index ? 1 : 0;
            });		
        }
    }

    /*change of color on highlighting or selection*/
    function set_highlight(d){
        svg.style("cursor","pointer");
        if (focus_node!==null)
            d = focus_node;
        highlight_node = d;
        if (highlight_color!="white"){
                // console.log(d)
            circle.style(tocolor, function(o) {
                        return isConnected(d, o) ? highlight_color : "white";
            });
            text.style("font-weight", function(o) {
                        return isConnected(d, o) ? "bold" : "normal";
            });
            link.style("stroke-width", function(o) {return ( o.Score>0.1)? 5:2})
                .style("stroke", function(o) {
                        return o.source.index == d.index || o.target.index == d.index ? highlight_color : (o.status=='unknown'? "red":default_link_color);
                });
        }
    }
		 	
		/*function to zoom the network diagram*/
    zoom.on("zoom", function() {
        var stroke = nominal_stroke;
        if (nominal_stroke*zoom.scale()>max_stroke) stroke = max_stroke/zoom.scale();
        // link.style("stroke-width",stroke);
        link.style("stroke", function(d){
            if (d.Score<0 || d.Score<=0)
                return low_color;
            else if (d.Score>0 && d.Score<=0.01)
                return low_med_color;
            else if (d.Score>0.01 && d.Score<=0.2)
                return med_color;
            else if (d.Score>0.2)
                return high_color;
        })
        .style('stroke-width', function(d){
            if (d.status=='known')
                return 2;
            else
                return 5;
        })
        circle.style("stroke-width",5);
                
        var base_radius = nominal_base_node_size;
        if (nominal_base_node_size*zoom.scale()>max_base_node_size) base_radius = max_base_node_size/zoom.scale();
            circle.attr("d", d3.svg.symbol()
                  .size(function(d) { return Math.PI*Math.pow(size(d.size)*base_radius/nominal_base_node_size||base_radius,2); })
                  .type(function(d) { return d.type; }))       				
        if (!text_center) text.attr("dx", function(d) { return (size(d.size)*base_radius/nominal_base_node_size||base_radius); });   			
            var text_size = nominal_text_size;
        if (nominal_text_size*zoom.scale()>max_text_size) text_size = max_text_size/zoom.scale();
            text.style("font-size",text_size + "px");
        g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    });
			 
    svg.call(zoom);	  
    new ResizeSensor($('#div_graph'), function(){
            console.log('resize')
            resize();
    });
						
    resize();
    d3.select(window).on("resize", resize)//.on("keydown", keydown);


    force.start()
            .on("tick", tick);

  	for (let i = 0; i < n; ++i)  force.tick();
  	force.stop();

      /*force layout goes through iteration to stablize.. so position adjustment with each iteration*/
    function tick(){        
            node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
            text.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
            
            link.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });
    }
			  

/*function to resize the windows upon zoom in */		  
    function resize() {
            // var width = window.innerWidth, height = window.innerHeight;
            var width = $('#div_graph').innerWidth()
            var height = $('#div_graph').innerHeight()
            svg.attr("width", width).attr("height", height);
            
            force.size([force.size()[0]+(width-w)/zoom.scale(),force.size()[1]+(height-h)/zoom.scale()]).resume();
            w = width;
            h = height;
    }
			
    /*function to set the menu on right click and calling appropriate function, 
    not using currently*/  
    function contextMenu1() {
        var height,
            width, 
            margin = 0.1, // fraction of width
            items = [], 
            rescale = false, 
            style = {
                'rect': {
                    'mouseout': {
                        'fill': 'rgb(244,244,244)', 
                        'stroke': 'white', 
                        'stroke-width': '1px',
                        'padding' : '5px',
                        'border': '1px solid black'
                    }, 
                    'mouseover': {
                        'fill': 'rgb(200,200,200)'
                    }
                }, 
                'text': {
                    'fill': 'steelblue', 
                    'font-size': '14'
                }
            };  // end style
        
        function menu(x, y, rules_d) {
        // console.log("menu")
            d3.select('.context-menu').remove();
            scaleItems();

            // Draw the menu
            svg
                .append('g').attr('class', 'context-menu')
                .selectAll('tmp')
                .data(items).enter()
                .append('g').attr('class', 'menu-entry')
                .style({'cursor': 'pointer'})
                .on('mouseover', function(){ 
                // console.log(d3.select(this))
                    d3.select(this).select('rect').style(style.rect.mouseover) })
                .on('mouseout', function(){ 
                    d3.select(this).select('rect').style(style.rect.mouseout) });
            
            d3.selectAll('.menu-entry')
                .append('rect')
                .attr('x', x)
                .attr('y', function(d, i){ return y + (i * height); })
                .attr('width', width)
                .attr('height', height)
                .style(style.rect.mouseout)
                .on ("click", function(st){
                    // console.log("menu_clicked", st, rules_d)
                    if(st == 'Show Profile')
                        prepare_profile(rules_d.id,"node")
                });
            
            // console.log(rules_d)
            d3.selectAll('.menu-entry')
                .append('text')
                .text(function(d){ return d; })
                .attr('x', x)
                .attr('y', function(d, i){ return y + (i * height); })
                .attr('dy', height - margin / 2)
                .attr('dx', margin)
                .style(style.text);

            // Other interactions
            d3.select('body')
                .on('click', function() {
                    d3.select('.context-menu').remove();
                });

        }  // end menu
        
        menu.items = function(e) {
            if (!arguments.length) return items;
            for (i in arguments) items.push(arguments[i]);
            rescale = true;
            return menu;
        }// end menu items

        /*Automatically set width, height, and margin;*/
        function scaleItems() {
            if (rescale) {
                svg.selectAll('tmp')
                    .data(items).enter()
                    .append('text')
                    .text(function(d){ return d; })
                    .style(style.text)
                    .attr('x', -1000)
                    .attr('y', -1000)
                    .attr('class', 'tmp');
                var z = d3.selectAll('.tmp')[0]
                        .map(function(x){ return x.getBBox(); });
                width = d3.max(z.map(function(x){ return x.width; }));
                margin = margin * width;
                width =  width + 2 * margin;
                height = d3.max(z.map(function(x){ return x.height + margin / 2; }));
            
                // cleanup
                d3.selectAll('.tmp').remove();
                rescale = false;
            }
        }// end scaleIems

            return menu;
    } // end ContextMenu

}// end 

/*call galaxy for the selected data*/
function prepare_galaxy(selected_drugs){
    build_Galaxy(selected_drugs,"selected")
}

function prepare_profile(drugname, check){
/* To have profile for a single DDI by selecting the node, again check is a flag for node or link being clicked and prepare data accordingly*/
    // console.log(drugname)
        if(check=='node'){
                rules_data.forEach(function(d){
                    if (d.key == drugname){
                        selected_Drug = d
                        return false;       
                    } 
                });
        }

		/* To have profile for a single DDI by selecting the link*/
		else if(check=="link"){
			var drug1= drugname["drugs"][0]
			var drug2=drugname["drugs"][1]
			var DDI ={};
			var drugs_DDI=[]
			rules_data.forEach(function(d){
		          if (d.key == drug1 || d.key==drug2){
		          	d.values.forEach(function(ddi){
		          		if (ddi.key==drug1 || ddi.key==drug2){
				          	 DDI['drug1']= drug1
				          	 DDI['drug2']= drug2
		          			 DDI['values']= ddi.values
			                 selected_Drug = d
				             return false;      
		          		}
		          	})
		          } 
		      });
		}//end else if
}//end prepare profile


 /*setting the default for the filters of label status*/
 d3.selectAll("input[name='known']").property("checked", false)
 d3.selectAll("input[name='unknown']").property("checked", false)

 /*changes made when label is changed, calling the prepare data function, how the other filter button should look like etc*/
 d3.selectAll("input[name='filter']").on('change', function() {
          filter_rb_val = this.value
          d3.selectAll("#div_graph > svg").remove();
          var val = this.value
         
          if (val=='known'){
            prepare_data(val);

            d3.selectAll("input[name='unknown']").property("checked", false)
            d3.selectAll("input[name='both']").property("checked", false)
          }
          else if(val=='unknown'){

          	 prepare_data(val);
          }
          else if(val=='both'){
          	 prepare_data();

          }
    })
    .on("mousemove",function(event) {
    mouseOverText(event, "Filter the type of interactions (DIARs) you want")
    })
    /*WHEN MOUSE out then remove the tooltip text*/        
    .on("mouseout", function(d){
            div.style("display", "none");
    });

/*function to match ids for interaction as well as drugs if clicked on any ones*/
function prepare_reports(d, check){
      /*d is the data passed from click, 
      check is  a flag to see if a "node" (drug) was clicked or "link" (interaction) is clicked
      as the reports will be different for each 
      */
      var p_id = []
      var ddi=[];
      /*remove the existing tale*/
     	d3.selectAll("#div_table > table").remove();

      /*if drug is clicked, then grab the ids from the rules data for this drug*/
      if(check=="drug"){
            rules_data.forEach(function(x){
                    if (x.key == d){
                        x.values.forEach(function(ddi){
                            p_id = ddi['values'][0].id[0]
                        })
                    } 
            });
      }
      /*if interaction is clicked*/
      else{
           /*if interaction is clicked, then ids are in the passes data (d) split them*/
        //    console.log(d.drugs[0])
           p_id = d.p_id.split(",")
      }
  

      /*below code adds columns to the table and put data in each cell for the reports*/
      d3.selectAll("#div_table")
        .style("visibility", "visible")

      columns = ["primaryId","event_dt","rept_dt","rept_cod","occr_country","age","age_cod","age_grp", "sex","wt","wt_cod","drugname","SideEffect", "occp_cod","reporter_country",]
      
      var table = d3.select("#div_table").append("table").attr("class","report_table")
                .attr("style", "margin: 20px; border: 2px"),
            thead = table.append("thead"),
            tbody = table.append("tbody");

      thead.append("tr")
		    .selectAll("th")
		    .data(columns)
		    .enter()
		    .append("th")
            .attr("height",30)
            .text(function(column) { return column.toUpperCase(); }) 

      var matched_reports=[];
      reports_data.forEach(function (d){
                  if (p_id.toString().indexOf(d.key) !== -1){
                     matched_reports.push(d.values[0])
                  }
      });
      
      reportsCount = matched_reports.length

      if (check=='drug')
            d3.select("#report_heading").text("Reports for selected Drug " + d + ": " + reportsCount);
      else
            d3.select("#report_heading").text("Reports for Interaction (" + d.drugs[0]+ " - " + d.drugs[1] + ") : " + reportsCount);

      /*create a row for each object in the data*/
      var rows = tbody.selectAll("tr")
                      .data(matched_reports)
                      .enter()
                      .append("tr");

    		/*create a cell in each row for each column*/
      var cells   = rows.selectAll("td")
                        .data(function(row) {
                            return columns.map(function(column) {
                                return {column: column, value: row[column]};
                            });
                        })
                        .enter()
                        .append("td")
                        .text(function(d) { //console.log(d); 
                                return d.value.toLowerCase(); 
                        });


         cells.style("width", function(d,i){
            if(d.column== "drugname"){
              return "300px";
            }
         })
   
         rows.on("click", function(d){
            d3.select(this).style("background-color", "#3182bd").style("color","#fff")
         }) 
         .on("mouseover", function(d){
           d3.select(this).style("background-color", "#3182bd").style("color","#fff")
         }) 
         .on("mouseout", function(d,i){ //correct index is passed here!
            d3.select(this).style("color", "black")
            d3.select(this).style("background-color", function(d2,j) {
              /* alternate rows different color*/
                if (i % 2 === 0){
                   return "#eff3ff";
                 }
                else {
                   return "#9ecae1";
                 }
            })
         });       
 }


function transform_data(data){
     var len = data.length;
     /*ADRs are comma separated strings, so checking each string (ADR) whether its a DME or not*/
     /* splitting the id's by comma */
     data.map(function(d,i){
          var charArr =[];
           charArr.push(d.id.split(','));
           d.id = charArr
           d.ADR=  d.ADR.toLowerCase();
           var splitted_ADR= d.ADR.split(',')
           var splitted_ADR_len= splitted_ADR.length
           var severity_check = 0
           for(var ad=0; ad<splitted_ADR_len; ad++){
              if (DME_LIST.indexOf(splitted_ADR[ad])!==-1){
                 severity_check = severity_check+ 1
                 // console.log("yes", splitted_ADR[ad])              
              }            
           }
          /*adding severity attribute to the data*/ 
          if(severity_check>0){
                d.severity = "severe"
                severity_check=0
                // console.log(d)
          } 
          else{
            d.severity="not severe"
          }
           
      })

     /*to not make changes in the original data as JS has this problem, making a change in copy makes changes in the original variables*/
     data_copy = JSON.parse(JSON.stringify(data));
      /*  to create double sided links a-> b and x -> a */
     var drug1_array= []
     data_copy.forEach(function(d,i){
          d.Drug1= d.Drug1.toLowerCase();
          d.Drug2= d.Drug2.toLowerCase();
          if (i== 0 || drug1_array.indexOf(d.Drug1) == -1)
               drug1_array.push(d.Drug1)

          if (drug1_array.indexOf(d.Drug2) != -1){
                // console.log(d)
                var obj_copy= JSON.parse(JSON.stringify(d));
                var temp = obj_copy.Drug1;
                obj_copy.Drug1 = obj_copy.Drug2;
                obj_copy.Drug2 = temp
                /* Do change the support and conf of individual drugs too*/
                // console.log(obj_copy)
                data_copy.push(obj_copy)
          }
          if (drug1_array.indexOf(d.Drug2)==-1){
                    // console.log(d)
                var obj_copy= JSON.parse(JSON.stringify(d));
                var temp = obj_copy.Drug1;
                obj_copy.Drug1 = obj_copy.Drug2;
                obj_copy.Drug2 = temp
                /* Do change the support and conf of individual drugs too*/
                data_copy.push(obj_copy)
          }

      })
      /*converting json object into groups: first group each row by a drug & for each drug group by interacting drugs*/
      var row_data = d3.nest()
                          .key(function(d){
                              return d.Drug1
                          })
                          .sortKeys(d3.ascending)
                          .key(function(d){
                            return d.Drug2
                          })
                          .sortKeys(d3.ascending)
                          .entries(data_copy)
           /*calling function to set the global variable for rules*/               
           set_rules_data(row_data)               
}  


/* function to read the csv files for DME and rules and reports and call functions to prepare data in the acceptable format*/
prepare_raw_data = function(error, rawData, rep_data, dme) {
    dme.forEach(function(d){
          // console.log(d)
          DME_LIST.push(d.ADR.toLowerCase())
        })
    
    var data = transform_data(rawData)
    /*read rules data as key value pair where ids are the keys */
    var r_data = d3.nest()
                    .key(function(d) {  
                      return d.primaryId })
                    .entries(rep_data);

    set_report_data(r_data);

    prepare_data();
    /*default view for the profile and reports*/
    prepare_profile("furosemide","node")
    prepare_reports("furosemide", "drug")
    read_glyph_data("furosemide", "drug")
      
};  // end prepare_data

/*setting global variable's value*/
function set_rules_data(data){
    if (data!== undefined || data !==null){
        if (data.keys){
            rules_data= data
        }
    }
}

/* setting global variable's value */
 function set_report_data(data){
    if (data!== undefined || data !==null){
          if (data.keys){
            reports_data= data
          }
    }
}  

/*drugs are in one column, we need to split them and put them in a source-target layout */
function drugs_split(str){
    var temp_array =[]

/* To remove the square brackets from the drug names */
    obj['source'] = str[0].toLowerCase();
    obj['target'] = str[1].toLowerCase();

    drugs_list.push (str[0].toLowerCase())
    drugs_list.push(str[1].toLowerCase())
    temp_array.push(str[0].toLowerCase())
    temp_array.push(str[1].toLowerCase())
    // console.log(temp_array)
    return temp_array
 }

/*removes duplicates from drug names*/      
function remove_duplicates(data){
                /* To remove the duplicate drug names */
        uniqueArray = data.filter(function(item, pos, self) {
                return self.indexOf(item) == pos;
        })
        return uniqueArray
 }


/* start reading data from here and call prepare_raw_data function*/
queue().defer(d3.tsv, "data/Q4_2014_rules_new.txt").defer(d3.tsv, "data/Q4_2014_new.txt").defer(d3.csv, "data/DME.csv").await(prepare_raw_data);


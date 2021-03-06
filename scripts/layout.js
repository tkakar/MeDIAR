//******* This code sets the layout of the interface ****** ///

var myLayout; 

$(window).load(function() {
    createHeaderMenu();
});

$(document).ready(function () {
    myLayout = $('body').layout({
        south:{size:150},
        north__resizable: false
        // ,south:{state:close}
        ,onresizeall:  function (Instance, state) { toggleMaximize( state.container.maximizedPane ); }
    });
    myLayout.close("south")

    myLayout
        .bindButton('#toggleAllPanes', 'toggle', 'west')
        .bindButton('#toggleAllPanes', 'toggle', 'east')
 });


function toggleMaximize ( paneName, cbPane ) {
    var	pane		= cbPane || paneName
        $Pane		= myLayout.panes[ pane ]
    ,	state		= myLayout.state
    ,	s			= state[ pane ]
    ,	container	= state.container
    ,	isMaximized	= null
    ,	panePaddingAndBorderHeight = s.outerHeight - s.css.height
    ,	panePaddingAndBorderWidth  = s.outerWidth  - s.css.width
    ;
    if (pane==="south") {
        // console.log(s.css.height, panePaddingAndBorderHeight)
        if ($Pane.height() == s.css.height) {
            $Pane.css({
                height:	container.innerHeight- panePaddingAndBorderHeight //-135
            ,	zIndex:	3
            });
            isMaximized = true;
        }
        else { // RESET pane to what state says it *should be*
            $Pane.css({
                height:	s.css.height
            ,	zIndex:	1
            });
            isMaximized = false;
        }
    }
    else if (pane==="east" || pane==="west") {
        if ($Pane.width() == s.css.width) {
            s.top = $Pane.css("top"); // save value | TODO: add top/bottom/left/right to state.pane.css data
            // console.log(s.top)
            $Pane.css({
            /*	need to also set top & height if want to cover north/south panes
               if only want to cover west-center-east panes, then DO NOT set top or height!
                top:	container.insetTop,*/

                // top:80,
                height:	container.innerHeight - 20- panePaddingAndBorderHeight, //-120
                width:	container.innerWidth  - 20 - panePaddingAndBorderWidth
            ,	zIndex:	3
            });
            isMaximized = true;
        }
        else { /*RESET pane to what state says it *should be**/ 
            $Pane.css({
                top:	s.top
            ,	height:	s.css.height
            ,	width:	s.css.width
            ,	zIndex:	1
            });
            isMaximized = false;
        }
    }
    /*if no valid pane was passed, then exit now*/
    if (isMaximized === null) return;

    /*set flags so can check a pane's state to see if it is 'maximized'*/
    s.maximized = isMaximized;
    /*set var for use by onresizeall callback to re-maximize pane after window.resize*/
    container.maximizedPane = isMaximized ? pane : '';

    /*OPTIONALLY show/hide all other panes in Layout*/
    for (var i=0; i<5; i++) {
        var name = $.layout.config.allPanes[ i ]
        ,	$P = myLayout.panes[ name ];
        if (!$P || name == pane) continue; // SKIP un/maximized pane
        if (isMaximized && $P.is(":visible")) {
            state[ name ].hiddenByMaximize  = true; // set a state-flag
            $P.css("visibility", "hidden"); // make pane invisible
            if (name !== "center")
                myLayout.resizers[ name ].hide(); // ditto for its resizer-bar
        }
        else if (!isMaximized && state[ name ].hiddenByMaximize ) {
            state[ name ].hiddenByMaximize  = false; // clear flag
            $P.css("visibility", "visible"); // reset visibility
            if (name !== "center")
                myLayout.resizers[ name ].show(); // ditto for its resizer-bar
        }
    }

    // if maximized, add events to catch pane.close or resizeAll, which UN-maximize the pane
    if (isMaximized) {
        $Pane.bind("layoutpaneonclose_start.toggleMaximize", toggleMaximize)
            .bind("layoutpaneonresize_start.toggleMaximize", toggleMaximize);
            // TODO: pane.onresize is not reliably firing when layout resized
            //		try adding a callback to layoutonresize_start as well, pane = state.container.maximizedPane
    }
    else {
        // remove events (above) added when pane was maximized
        $Pane.unbind(".toggleMaximize");
    }
};



function createHeaderMenu(){
    var main_drug_radius = 5;
    var known_r = 3;
    var unknown_r = 6;
    var main_drug_color=  "#2196f3"  ;//"green"
    var default_link_color = '#FAEBD7'; //'#fe9929'

    var min_score = -0.1;
    var max_score = 1;

    /*color comain for the legends*/
    var color = d3.scale.linear()
                    .domain([min_score, (min_score+max_score)/2, max_score])
                    .range(["hsl(0, 100%, 80%)", "hsl(0, 100%, 64%)","hsl(0, 100%, 25%)"]); 


    var color_severity = d3.scale.linear()
                            .domain([0,1,5])
                            .range(["#fed98e", '#a3a3c2', '#666699']);

    var threshold = d3.scale.quantize()
    .domain([-0.1, 0, 1,0.01, 0.1])
    .range(["#fecc5c", "#fd8d3c", "#f03b20", "#800000"]);

    var x = d3.scale.linear()
    .domain([0, 1])
    .range([0, 240]);

    var xAxis = d3.svg.axis()
                .orient("bottom")
                .tickSize(13)
                .tickValues(threshold.domain())
                .tickFormat(function(d) { return d === 0.5 ? formatPercent(d) : formatNumber(100 * d); });

    var g = d3.select("#legend_svg").append("g")


    g.select("g").call(xAxis)
    g.select(".domain")
    .remove();


        
    g.selectAll("rect")
    .data(threshold.range().map(function(color) {
    var d = threshold.invertExtent(color);
    return d;
    }))
    .enter().insert("rect", ".tick")
    .attr("height", 20)
    .attr("width", 45)
    .attr("x", function(d,i) { //console.log(i); 
        return i*45; })
    .attr("fill", function(d) { return threshold(d[0]); });

    /*############### Legend for the DME #################*/          
    var formatPercent = d3.format(".0%"),
    formatNumber = d3.format(".0f");

    var sev_threshold = d3.scale.quantize()
                          .range(["#016c59", '#016c59', '', '', '#d0d1e6','#d0d1e6']);

    var sev_g = d3.select("#legend_svg_severity").append("g")

    sev_g.select("g").call(xAxis)
    sev_g.select(".domain")
         .remove();
    sev_g.selectAll("rect")
        .data(sev_threshold.range().map(function(color) {
        var d = sev_threshold.invertExtent(color);
        return d;
        }))
    .enter().insert("rect", ".tick")
    .attr("height", 20)
    .attr("width", 30)
    .attr("x", function(d,i) { //console.log(i); 
        return i*30; })
    .attr("fill", function(d,i) { 
        if (i===0 || i===5 || i===4 || i===1) return sev_threshold(d[0])
        else return '#0a0a67'
        }); 

}
 
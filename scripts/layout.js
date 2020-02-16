var myLayout; 

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
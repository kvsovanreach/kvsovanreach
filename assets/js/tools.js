$( document ).ready(function() {
    var heights = $(".kong-tool-card-content").map(function() {
        return $(this).height();
    }).get(),

    maxHeight = Math.max.apply(null, heights);

    $(".kong-tool-card-content").height(maxHeight);
});
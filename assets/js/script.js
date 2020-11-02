  $(document).ready(function() {
    $(this).scrollTop(0);
    $('.hide-me-now').each( function(i){
        var bottom_of_object = $(this).position().top + 20;
        var bottom_of_window = $(window).scrollTop() + $(window).height();
        if( bottom_of_window > bottom_of_object  ){
            $(this).css({opacity: 0.0, visibility: "visible"}).animate({opacity: 1}, 1000);
        }
        
    }); 
      $(window).scroll( function(){
          $('.hide-me').each( function(i){
              var bottom_of_object = $(this).position().top + 20;
              var bottom_of_window = $(window).scrollTop() + $(window).height();
              if( bottom_of_window > bottom_of_object  ){
                  $(this).css({opacity: 0.0, visibility: "visible"}).animate({opacity: 1}, 1500);
              }
          }); 
      
      });
      
  });
  
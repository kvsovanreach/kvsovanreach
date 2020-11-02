$(document).ready(function() {

	// function setThemeFromCookie() {
	// 	// Check if the cookie is set 
	// 	if ((typeof Cookies.get('mode') !== undefined) || (typeof Cookies.get('mode') !== "undefined") ) {
	// 		$('body').addClass("dark-mode");
	// 		$('#darkmode').attr('checked', true); // toggle change
	// 	} else {
	// 		$('body').removeClass("dark-mode");
	// 		$('#darkmode').attr('checked', false); // toggle change
	// 	}
	// }
	
	// setThemeFromCookie();
	$('#darkmode').attr('checked', true);
	$('#darkmode').on('change', function(e){

		if ($(this).is(':checked')) {
			$('body').addClass('dark-mode');
			// Cookies.set('mode', 'dark-mode', { expires: 7 });
			
		} else {
			$('body').removeClass('dark-mode');
			// Cookies.remove('mode');
		}
	});
});	
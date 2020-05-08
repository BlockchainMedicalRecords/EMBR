$(document).ready(function() {
	$(".footer a, .navbar a.navbar-brand").hover(
		//This is mouseover
		function() {
			// console.log($(this));
			$(this)[0].children[0].style.color = '#D7AA45';
			$(this)[0].children[1].style.color = '#F36B1D';
		//This is mouseleave
		}, function() {
			$(this)[0].children[0].style.color = '#F36B1D';
			$(this)[0].children[1].style.color = '#D7AA45';
	});
});




//
//Author: Team32
//File: pharmDisp.js
//Purpose: script for phramDisp.ejs
//
$(document).ready(function() {
	$(".invoice-footer button").hover(
		//mousehover
		function() {
			$(this)[0].firstChild.style.color = '#F33259';
			$(this)[0].lastChild.style.color ='#337ab7';

		//mouseleave
		}, function() {
			$(this)[0].firstChild.style.color = '#337ab7';
			$(this)[0].lastChild.style.color ='#F33259';
	});
})
(function () {
	'use strict';

	const body = document.body;

	// run code
	enableJS();

	// functions declarations  
	function enableJS() {
		body.classList.replace('no-js', 'js-enabled');
	}
	function $(element) {
		return document.querySelector(element);
	}
	function $$(elements) {
		return document.querySelectorAll(elements);
	}

	// Ice-breaker
	$$('.icebreaker .ice-q').forEach(i => i.addEventListener('click', nextQuestion, false));
	const sets = $$('fieldset');
	let current = 0;
	let currentSet = sets[current];


	// Show next set
	function nextQuestion() {
		current++;
		if (current < sets.length) {
			currentSet.classList.remove('active');
			currentSet = sets[current];
			currentSet.classList.add('active');
		}
		if (current + 1 >= sets.length) {
			$('.icebreaker h4').remove();
			$('.icebreaker-option').remove();
			$('.icebreaker h2').textContent = '🎉 Ice-breaker';
		}
		// let currentProgress = $('progress').value;
		$('progress').value = $('progress').value + 16.6;
	}

	// Close icebreaker
	$$('.icebreaker__close').forEach(i => i.addEventListener('click', closeBreaker, false));
	function closeBreaker() {
		body.classList.remove('is-icebreaker-active');
		body.classList.remove('is-icebreaker-r-active');
	}


	$$('.icebreaker__open').forEach(i => i.addEventListener('click', openBreaker, false));
	function openBreaker() {
		body.classList.add('is-icebreaker-active');
	}


	// Icebreaker-result
	if ($('.ice-breaker--msg')) {
		$('.ice-breaker--msg').addEventListener('click', iceBreakerOpen, false);
	}

	function iceBreakerOpen() {
		$('body').classList.add('is-icebreaker-r-active');
	}
})();

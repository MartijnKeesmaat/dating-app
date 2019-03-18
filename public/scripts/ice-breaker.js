(function () {
	'use strict';

	var body = document.body;

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

	function nextQuestion() {
		current++;
		if (current < sets.length) {
			currentSet.classList.remove('active');
			currentSet = sets[current];
			currentSet.classList.add('active');
		}
		if (current + 1 >= sets.length) {
			$('.icebreaker h4').remove();
			$('.icebreaker h2').textContent = '🎉 Ice-breaker';
		}

	}

})();

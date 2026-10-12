/* global jQuery, multivendorx */
jQuery(document).ready(function ($) {
	$('#linked_store').select2({
		ajax: {
			url: multivendorx.ajaxurl,
			dataType: 'json',
			delay: 250,
			data: function (params) {
				return {
					term: params.term,
					action: 'multivendorx_search_stores',
					nonce: multivendorx.nonce,
				};
			},
			processResults: function (data) {
				return {
					results: data,
				};
			},
		},
		minimumInputLength: 3,
		placeholder: multivendorx.select_text,
		allowClear: true,
	});
});

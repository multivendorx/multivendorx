/* global jQuery,distanceShippingFrontend,google,mapboxgl */

jQuery(document).ready(function ($) {
	const { __ } = wp.i18n;
	var opts = distanceShippingFrontend;
	if ($('#multivendorx_user_location_lat').length === 0) {
		return;
	}

	if (opts.map_provider === 'google_map') {
		initGoogleMap(opts);
	} else if (opts.map_provider === 'mapbox') {
		initMapboxMap(opts);
	}

	/* -----------------------------
	 * GOOGLE MAPS (UNCHANGED LOGIC)
	 * ----------------------------- */
	function initGoogleMap(opts) {
		var lat =
			$('#multivendorx_user_location_lat').val() || opts.default_lat;
		var lng =
			$('#multivendorx_user_location_lng').val() || opts.default_lng;
		var latlng = new google.maps.LatLng(lat, lng);

		var map = new google.maps.Map(
			document.getElementById('multivendorx-user-location-map'),
			{
				center: latlng,
				zoom: parseInt(opts.default_zoom),
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				mapId: opts.google_map_id,
			}
		);

		const markerEl = document.createElement('div');
		markerEl.style.width = '16px';
		markerEl.style.height = '16px';
		markerEl.style.borderRadius = '50%';
		markerEl.style.background = '#ef4444';
		markerEl.style.border = '2px solid white';
		markerEl.style.boxShadow = '0 0 4px rgba(0,0,0,0.4)';

		var marker = new google.maps.marker.AdvancedMarkerElement({
			map: map,
			position: latlng,
			content: markerEl,
			gmpDraggable: true,
		});

		var geocoder = new google.maps.Geocoder();
		var input = document.getElementById('multivendorx_user_location');
		var autocomplete = new google.maps.places.Autocomplete(input);

		autocomplete.bindTo('bounds', map);

		autocomplete.addListener('place_changed', function () {
			var place = autocomplete.getPlace();
			if (!place.geometry || !place.geometry.location) {
				return;
			}
			map.setCenter(place.geometry.location);
			marker.position = place.geometry.location;
			bindData(
				place.formatted_address,
				place.geometry.location.lat(),
				place.geometry.location.lng()
			);
		});

		marker.addListener('dragend', function (event) {
			const position = event.latLng;

			geocoder.geocode({ location: position }, function (res, status) {
				if (status === 'OK' && res[0]) {
					bindData(
						res[0].formatted_address,
						position.lat(),
						position.lng()
					);
				}
			});
		});
	}
	/* -----------------------------
	 * MAPBOX WITH CUSTOM AUTOCOMPLETE
	 * ----------------------------- */
	function initMapboxMap(opts) {
		mapboxgl.accessToken = opts.mapbox_token;

		var lat =
			$('#multivendorx_user_location_lat').val() || opts.default_lat;
		var lng =
			$('#multivendorx_user_location_lng').val() || opts.default_lng;

		var map = new mapboxgl.Map({
			container: 'multivendorx-user-location-map',
			style: opts.mapbox_style,
			center: [lng, lat],
			zoom: opts.default_zoom,
		});

		var marker = new mapboxgl.Marker({ draggable: true })
			.setLngLat([lng, lat])
			.addTo(map);

		// Create custom autocomplete for Mapbox
		var searchTimeout;
		$('#multivendorx_user_location').on('input', function () {
			clearTimeout(searchTimeout);
			var query = $(this).val();

			if (query.length < 3) {
				removeSuggestions();
				return;
			}

			searchTimeout = setTimeout(function () {
				searchMapboxAddress(query, map, marker);
			}, 300);
		});

		// Close suggestions when clicking elsewhere
		$(document).on('click', function (e) {
			if (
				!$(e.target).closest(
					'#multivendorx_user_location, #mapbox-suggestions'
				).length
			) {
				removeSuggestions();
			}
		});

		function searchMapboxAddress(query, map, marker) {
			$.ajax({
				url:
					'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
					encodeURIComponent(query) +
					'.json',
				data: {
					access_token: opts.mapbox_token,
					limit: 5,
					types: 'address,place',
					proximity: lng + ',' + lat,
					country: opts.mapbox_country || '',
					language: opts.mapbox_language || 'en',
				},
				success: function (response) {
					if (response.features && response.features.length) {
						showAddressSuggestions(response.features, map, marker);
					} else {
						removeSuggestions();
					}
				},
				error: function () {
					removeSuggestions();
					console.warn('Mapbox geocoding request failed.');
				},
			});
		}

		function showAddressSuggestions(features, map, marker) {
			removeSuggestions();

			var suggestions = $(
				'<ul id="mapbox-suggestions" style="position: absolute; z-index: 1000; background: white; border: 1px solid #ddd; list-style: none; margin: 0; padding: 0; max-height: 200px; overflow-y: auto; width: 100%;"></ul>'
			);

			$.each(features, function (index, feature) {
				var li = $(
					'<li style="padding: 8px; cursor: pointer; border-bottom: 1px solid #eee;"></li>'
				).text(feature.place_name);
				li.on('click', function () {
					$('#multivendorx_user_location').val(feature.place_name);
					removeSuggestions();

					// Update map and marker
					var coordinates = feature.center;
					map.flyTo({
						center: coordinates,
						zoom: 14,
					});
					marker.setLngLat(coordinates);

					// Bind data
					bindData(
						feature.place_name,
						coordinates[1],
						coordinates[0]
					);
				});
				suggestions.append(li);
			});

			suggestions.insertAfter('#multivendorx_user_location');
		}

		function removeSuggestions() {
			$('#mapbox-suggestions').remove();
		}

		marker.on('dragend', function () {
			var pos = marker.getLngLat();
			reverseGeocodeMapbox(pos.lat, pos.lng);
		});
	}

	function reverseGeocodeMapbox(lat, lng) {
		$.get(
			'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
			lng +
			',' +
			lat +
			'.json',
			{
				access_token: opts.mapbox_token,
				limit: 1,
			},
			function (res) {
				if (res.features && res.features.length) {
					bindData(res.features[0].place_name, lat, lng);
				}
			}
		);
	}

	/* -----------------------------
	 * SHARED DATA PIPELINE
	 * ----------------------------- */
	function bindData(address, lat, lng) {
		$('#multivendorx_user_location').val(address);
		$('#multivendorx_user_location_lat').val(lat);
		$('#multivendorx_user_location_lng').val(lng);
		$(document.body).trigger('update_checkout');
	}
});

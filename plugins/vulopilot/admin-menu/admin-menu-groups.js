/**
 * Grafts collapsible group headers onto the native #toplevel_page_vulopilot
 * admin menu — see Admin::enqueue_menu_grouping_assets()'s docblock for
 * why this exists as hand-written vanilla JS rather than a webpack entry.
 *
 * Only ever shows/hides and inserts a header before the <li> elements
 * WordPress itself already rendered (from Admin::add_menus()'s $submenus
 * list) — never re-parents them, so src/app.tsx's own
 * `#toplevel_page_vulopilot > ul > li > a` selector (used to toggle the
 * 'current' class as the hash tab changes) keeps matching every item
 * regardless of which group it ends up visually under.
 *
 * window.vulopilotMenuGroups is localized by that same PHP method:
 * { groups: [ { id, label, icon } ], tabToGroup: { [tabId]: groupId },
 * tabToIcon: { [tabId]: dashiconClass } }.
 */
( function () {
	'use strict';

	/**
	 * Pulls the `tab` value out of an `admin.php?page=vulopilot#&tab=xxx`
	 * style href — every real VuloPilot submenu link is built this way
	 * (Admin::add_menus()), so this is the one thing that reliably
	 * identifies which page an <li> points to regardless of its
	 * (translated) label text.
	 *
	 * @param {string} href Anchor href.
	 * @return {string|null} The tab id, or null if this isn't a tab link
	 * (e.g. the vendored License page, which uses its own real admin URL).
	 */
	function getTabFromHref( href ) {
		var match = ( href || '' ).match( /[#&]tab=([^&]+)/ );
		return match ? decodeURIComponent( match[ 1 ] ) : null;
	}

	function getActiveTab() {
		return getTabFromHref( window.location.hash ) || 'dashboard';
	}

	// groupId -> { members: HTMLLIElement[], toggle: HTMLAnchorElement, expanded: boolean }
	var groupState = {};

	function setExpanded( groupId, expanded ) {
		var state = groupState[ groupId ];

		if ( ! state ) {
			return;
		}

		state.expanded = expanded;
		state.toggle.setAttribute( 'aria-expanded', String( expanded ) );

		state.members.forEach( function ( li ) {
			li.classList.toggle( 'vulopilot-menu-group-collapsed', ! expanded );
		} );
	}

	function buildGroups() {
		var config = window.vulopilotMenuGroups;
		var submenu = document.querySelector(
			'#toplevel_page_vulopilot > ul.wp-submenu'
		);

		if ( ! config || ! submenu || submenu.dataset.vulopilotGrouped ) {
			return;
		}

		submenu.dataset.vulopilotGrouped = 'true';

		var activeTab = getActiveTab();
		var items = Array.prototype.slice.call( submenu.children );

		config.groups.forEach( function ( group ) {
			var members = items.filter( function ( li ) {
				var anchor = li.querySelector( 'a' );
				var tab = anchor && getTabFromHref( anchor.getAttribute( 'href' ) );
				return tab && config.tabToGroup[ tab ] === group.id;
			} );

			if ( ! members.length ) {
				return;
			}

			var expanded = members.some( function ( li ) {
				var anchor = li.querySelector( 'a' );
				return getTabFromHref( anchor.getAttribute( 'href' ) ) === activeTab;
			} );

			var header = document.createElement( 'li' );
			header.className = 'vulopilot-menu-group';

			var toggle = document.createElement( 'a' );
			toggle.href = '#';
			toggle.className = 'vulopilot-menu-group-toggle';
			toggle.setAttribute( 'aria-expanded', String( expanded ) );
			toggle.innerHTML =
				'<span class="dashicons ' +
				group.icon +
				'" aria-hidden="true"></span>' +
				'<span class="vulopilot-menu-group-label">' +
				group.label +
				'</span>' +
				'<span class="dashicons dashicons-arrow-down-alt2 vulopilot-menu-group-chevron" aria-hidden="true"></span>';

			toggle.addEventListener( 'click', function ( event ) {
				event.preventDefault();
				event.stopPropagation();
				setExpanded( group.id, ! groupState[ group.id ].expanded );
			} );

			header.appendChild( toggle );
			members[ 0 ].parentNode.insertBefore( header, members[ 0 ] );

			members.forEach( function ( li ) {
				li.classList.add( 'vulopilot-menu-group-child' );
				li.classList.toggle( 'vulopilot-menu-group-collapsed', ! expanded );
			} );

			groupState[ group.id ] = {
				members: members,
				toggle: toggle,
				expanded: expanded,
			};
		} );
	}

	/**
	 * Prepends a dashicon to every real submenu <a> that has a matching
	 * entry in tabToIcon — covers both standalone items (Dashboard, Brand
	 * Visibility, WooCommerce, Automation, Health, Settings) and grouped
	 * children (GEO, SEO, Performance, etc.), so the whole menu reads
	 * consistently rather than only the group headers having icons.
	 * Guarded per-anchor (not just per-submenu) since it runs after
	 * buildGroups() has already inserted the synthetic group-header <li>s,
	 * which have no tab id and are skipped naturally.
	 */
	function addItemIcons() {
		var config = window.vulopilotMenuGroups;
		var submenu = document.querySelector(
			'#toplevel_page_vulopilot > ul.wp-submenu'
		);

		if ( ! config || ! config.tabToIcon || ! submenu ) {
			return;
		}

		submenu.querySelectorAll( 'li > a' ).forEach( function ( anchor ) {
			if ( anchor.querySelector( '.vulopilot-menu-item-icon' ) ) {
				return;
			}

			var tab = getTabFromHref( anchor.getAttribute( 'href' ) );
			var icon = tab && config.tabToIcon[ tab ];

			if ( ! icon ) {
				return;
			}

			var iconSpan = document.createElement( 'span' );
			iconSpan.className = 'dashicons ' + icon + ' vulopilot-menu-item-icon';
			iconSpan.setAttribute( 'aria-hidden', 'true' );
			anchor.insertBefore( iconSpan, anchor.firstChild );
		} );
	}

	/**
	 * Re-expands whichever group contains the newly-active tab — the
	 * hash itself (not the 'current' class app.tsx's own effect sets,
	 * which lags behind React mounting) is the source of truth here, so
	 * this works immediately on every hash change with no race condition.
	 */
	function syncActiveGroup() {
		var config = window.vulopilotMenuGroups;

		if ( ! config ) {
			return;
		}

		var activeGroupId = config.tabToGroup[ getActiveTab() ];

		if ( activeGroupId && groupState[ activeGroupId ] && ! groupState[ activeGroupId ].expanded ) {
			setExpanded( activeGroupId, true );
		}
	}

	function init() {
		buildGroups();
		addItemIcons();
		syncActiveGroup();
		window.addEventListener( 'hashchange', syncActiveGroup );
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', init );
	} else {
		init();
	}
} )();

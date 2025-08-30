<?php
/**
 * Admin class file
 *
 * @package CatalogX
 */

namespace CatalogX;

defined( 'ABSPATH' ) || exit;

/**
 * CatalogX Admin class
 *
 * @class       Admin class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class Admin {

    /**
     * Constructor for Admin class
     */
    public function __construct() {
        // Register admin menu.
        add_action( 'admin_menu', array( $this, 'add_menu' ) );
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_script' ) );
		// Allow URL.
        add_filter( 'allowed_redirect_hosts', array( $this, 'allow_catalogx_redirect_host' ) );
        // For load translation.
        add_action( 'load_script_textdomain_relative_path', array( $this, 'textdomain_relative_path' ), 10, 2 );
    }

    /**
     * Add menu in admin panal
     *
     * @return void
     */
    public function add_menu() {

        add_menu_page(
            'CatalogX',
            'CatalogX',
            'manage_woocommerce',
            'catalogx',
            array( $this, 'menu_page_callback' ),
            'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIKCSB2aWV3Qm94PSIwIDAgMTA4MCA4OTguMSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTA4MCA4OTguMTsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiNGRkZGRkY7fQoJLnN0MXtmaWxsOiNmZmZmO30KPC9zdHlsZT4KPGc+Cgk8Zz4KCQk8Zz4KCQkJPGc+CgkJCQk8cGF0aCBjbGFzcz0ic3QwIiBkPSJNLTExOC45Ni0zNDYuMDRjLTAuNDQsMC0wLjgxLTAuMTYtMS4xMS0wLjQ5Yy0wLjMtMC4zMy0wLjQ1LTAuNjktMC40NS0xLjA4YzAtMC4zOSwwLjE0LTAuNzksMC40Mi0xLjE4CgkJCQkJbDcuMzktMTBsMS45MiwyLjgybC02LjcyLDkuMDlDLTExNy45MS0zNDYuMzItMTE4LjM4LTM0Ni4wNC0xMTguOTYtMzQ2LjA0eiBNLTExOC43Mi0zNzAuN2MwLjU2LDAsMS4wMywwLjI2LDEuNDMsMC43NwoJCQkJCWwxNS43MSwyMS4wOGMwLjI2LDAuMywwLjM4LDAuNjUsMC4zOCwxLjA1YzAsMC41Ni0wLjIsMC45OS0wLjU5LDEuMzFjLTAuNCwwLjMxLTAuNzksMC40Ny0xLjE4LDAuNDcKCQkJCQljLTAuNTYsMC0xLjAzLTAuMjYtMS40My0wLjc3bC0xNS43MS0yMS4wOGMtMC4yNi0wLjMtMC4zOC0wLjY1LTAuMzgtMS4wNWMwLTAuNTEsMC4xOS0wLjkzLDAuNTYtMS4yNwoJCQkJCUMtMTE5LjU3LTM3MC41NC0xMTkuMTYtMzcwLjctMTE4LjcyLTM3MC43eiBNLTEwMi44My0zNzAuNjdjMC40NiwwLDAuODUsMC4xNywxLjE3LDAuNTFjMC4zMSwwLjM0LDAuNDcsMC43LDAuNDcsMS4xCgkJCQkJYzAsMC4zNy0wLjEzLDAuNzMtMC4zOCwxLjA4bC03LjMyLDkuNzlsLTEuOTktMi43NWw2LjY1LTguODhDLTEwMy44My0zNzAuMzktMTAzLjM3LTM3MC42Ny0xMDIuODMtMzcwLjY3eiIvPgoJCQk8L2c+CgkJCTxnPgoJCQkJPGc+CgkJCQkJPHBhdGggY2xhc3M9InN0MCIgZD0iTS0xODkuMDEtMzY1LjkzaDYuNDljMC4zNywwLDAuNjgsMC4xMiwwLjkzLDAuMzdjMC4yNSwwLjI1LDAuMzcsMC41NiwwLjM3LDAuOTMKCQkJCQkJYzAsMC4zNy0wLjEyLDAuNjctMC4zNywwLjkxYy0wLjI1LDAuMjQtMC41NiwwLjM2LTAuOTMsMC4zNmgtNi40OWMtMC4zNywwLTAuNjgtMC4xMi0wLjkzLTAuMzcKCQkJCQkJYy0wLjI1LTAuMjUtMC4zNy0wLjU2LTAuMzctMC45M2MwLTAuMzcsMC4xMi0wLjY3LDAuMzctMC45MUMtMTg5LjY5LTM2NS44MS0xODkuMzgtMzY1LjkzLTE4OS4wMS0zNjUuOTN6IE0tMTg2LjExLTM2OS41MwoJCQkJCQljMC40MSwwLDAuNzQsMC4xMywwLjk5LDAuNGMwLjI2LDAuMjcsMC4zOSwwLjYsMC4zOSwxLjAxdjEyLjgyYzAsMC4zMywwLjA2LDAuNiwwLjE3LDAuOGMwLjExLDAuMiwwLjI2LDAuMzQsMC40NiwwLjQxCgkJCQkJCWMwLjE5LDAuMDcsMC4zOSwwLjExLDAuNTksMC4xMWMwLjIsMCwwLjM4LTAuMDQsMC41NC0wLjExYzAuMTYtMC4wNywwLjM1LTAuMTEsMC41Ny0wLjExYzAuMjIsMCwwLjQyLDAuMSwwLjYxLDAuMwoJCQkJCQljMC4xOCwwLjIsMC4yOCwwLjQ4LDAuMjgsMC44M2MwLDAuNDQtMC4yNCwwLjgtMC43MiwxLjA4Yy0wLjQ4LDAuMjgtMC45OSwwLjQxLTEuNTUsMC40MWMtMC4zMSwwLTAuNjgtMC4wMy0xLjExLTAuMDgKCQkJCQkJYy0wLjQyLTAuMDYtMC44My0wLjE5LTEuMjMtMC40MWMtMC40LTAuMjItMC43My0wLjU4LTAuOTktMS4wNmMtMC4yNy0wLjQ5LTAuNC0xLjE3LTAuNC0yLjA2di0xMi45MwoJCQkJCQljMC0wLjQsMC4xNC0wLjc0LDAuNDEtMS4wMUMtMTg2LjgzLTM2OS4zOS0xODYuNDktMzY5LjUzLTE4Ni4xMS0zNjkuNTN6Ii8+CgkJCQkJPHBhdGggY2xhc3M9InN0MCIgZD0iTS0xNTguMDEtMzUyLjk3YzAsMC40MS0wLjEzLDAuNzQtMC40LDEuMDFjLTAuMjcsMC4yNy0wLjU5LDAuNC0wLjk4LDAuNGMtMC4zOSwwLTAuNzEtMC4xMy0wLjk4LTAuNAoJCQkJCQljLTAuMjctMC4yNy0wLjQtMC42LTAuNC0xLjAxdi0xNy42M2MwLTAuNCwwLjE0LTAuNzQsMC40MS0xLjAxYzAuMjgtMC4yNywwLjYxLTAuNCwwLjk5LTAuNGMwLjQxLDAsMC43MywwLjEzLDAuOTgsMC40CgkJCQkJCWMwLjI1LDAuMjcsMC4zNywwLjYsMC4zNywxLjAxVi0zNTIuOTd6Ii8+CgkJCQkJPHBhdGggY2xhc3M9InN0MCIgZD0iTS0xNDAuMjQtMzU4LjgzYzAsMS40Ny0wLjMyLDIuNzgtMC45NywzLjkxYy0wLjY0LDEuMTMtMS41MiwyLjAyLTIuNjMsMi42NwoJCQkJCQljLTEuMTEsMC42NS0yLjM1LDAuOTctMy43MywwLjk3Yy0xLjM4LDAtMi42My0wLjMyLTMuNzMtMC45N2MtMS4xMS0wLjY0LTEuOTktMS41My0yLjY0LTIuNjdjLTAuNjUtMS4xMy0wLjk4LTIuNDQtMC45OC0zLjkxCgkJCQkJCWMwLTEuNDksMC4zMy0yLjgsMC45OC0zLjk0YzAuNjUtMS4xMywxLjUzLTIuMDMsMi42NC0yLjY4YzEuMTEtMC42NSwyLjM1LTAuOTgsMy43My0wLjk4YzEuMzgsMCwyLjYzLDAuMzMsMy43MywwLjk4CgkJCQkJCWMxLjExLDAuNjUsMS45OCwxLjU1LDIuNjMsMi42OEMtMTQwLjU2LTM2MS42NC0xNDAuMjQtMzYwLjMyLTE0MC4yNC0zNTguODN6IE0tMTQzLTM1OC44M2MwLTEuMDEtMC4yLTEuODktMC42MS0yLjY0CgkJCQkJCWMtMC40MS0wLjc1LTAuOTUtMS4zMy0xLjY0LTEuNzVjLTAuNjktMC40Mi0xLjQ2LTAuNjQtMi4zMS0wLjY0Yy0wLjg1LDAtMS42MiwwLjIxLTIuMzIsMC42NGMtMC43LDAuNDItMS4yNSwxLjAxLTEuNjYsMS43NQoJCQkJCQljLTAuNDEsMC43NS0wLjYxLDEuNjMtMC42MSwyLjY0YzAsMC45OCwwLjIsMS44NCwwLjYxLDIuNmMwLjQsMC43NiwwLjk2LDEuMzUsMS42NiwxLjc3YzAuNywwLjQyLDEuNDcsMC42NCwyLjMyLDAuNjQKCQkJCQkJYzAuODUsMCwxLjYyLTAuMjEsMi4zMS0wLjY0YzAuNjktMC40MiwxLjI0LTEuMDEsMS42NC0xLjc3Qy0xNDMuMjEtMzU2Ljk5LTE0My0zNTcuODUtMTQzLTM1OC44M3oiLz4KCQkJCQk8cGF0aCBjbGFzcz0ic3QwIiBkPSJNLTEzMS4wNy0zNjYuNDNjMC43NywwLDEuNDksMC4xMywyLjE2LDAuMzljMC42NiwwLjI2LDEuMjQsMC41OSwxLjczLDAuOThjMC40OSwwLjQsMC44NywwLjgxLDEuMTUsMS4yMwoJCQkJCQljMC4yOCwwLjQyLDAuNDEsMC43OSwwLjQxLDEuMTFsLTAuNjEsMC4wM3YtMi4yMWMwLTAuMzksMC4xMy0wLjcyLDAuMzktMC45OWMwLjI2LTAuMjgsMC41OS0wLjQxLDAuOTktMC40MQoJCQkJCQljMC40LDAsMC43NCwwLjEzLDAuOTksMC40YzAuMjYsMC4yNywwLjM5LDAuNiwwLjM5LDEuMDF2MTIuMjFjMCwxLjU1LTAuMzMsMi44MS0wLjk5LDMuOGMtMC42NiwwLjk5LTEuNTQsMS43MS0yLjY0LDIuMTcKCQkJCQkJYy0xLjEsMC40Ni0yLjMsMC42OS0zLjYxLDAuNjljLTAuNDYsMC0xLTAuMDYtMS42My0wLjE4Yy0wLjYzLTAuMTItMS4yLTAuMjYtMS43My0wLjQzYy0wLjUyLTAuMTctMC44OS0wLjMzLTEuMDktMC41CgkJCQkJCWMtMC40Mi0wLjIyLTAuNy0wLjQ4LTAuODQtMC43N2MtMC4xNC0wLjI5LTAuMTQtMC41OS0wLjAxLTAuODhjMC4xNy0wLjQxLDAuNDEtMC42NSwwLjczLTAuNzVjMC4zMi0wLjA5LDAuNjktMC4wNiwxLjA5LDAuMDgKCQkJCQkJYzAuMTcsMC4wNiwwLjQ1LDAuMTYsMC44NCwwLjNjMC40LDAuMTUsMC44MywwLjI4LDEuMzEsMC40YzAuNDgsMC4xMiwwLjkzLDAuMTgsMS4zNSwwLjE4YzEuNDYsMCwyLjU2LTAuMzQsMy4zMi0xLjAyCgkJCQkJCWMwLjc2LTAuNjgsMS4xMy0xLjYsMS4xMy0yLjc2di0yLjQ5bDAuMywwLjE5Yy0wLjA2LDAuMzctMC4yMywwLjc1LTAuNTMsMS4xNWMtMC4yOSwwLjQtMC42NywwLjc2LTEuMTIsMS4wOQoJCQkJCQljLTAuNDUsMC4zMy0wLjk4LDAuNi0xLjU3LDAuODJjLTAuNiwwLjIxLTEuMjEsMC4zMi0xLjg0LDAuMzJjLTEuMzEsMC0yLjQ4LTAuMzMtMy41Mi0wLjk4Yy0xLjA0LTAuNjUtMS44Ni0xLjU1LTIuNDYtMi42OAoJCQkJCQljLTAuNi0xLjEzLTAuOS0yLjQ0LTAuOS0zLjkxYzAtMS40NywwLjMtMi43OCwwLjktMy45MWMwLjYtMS4xMywxLjQxLTIuMDMsMi40NS0yLjY4CgkJCQkJCUMtMTMzLjQ5LTM2Ni4xLTEzMi4zNC0zNjYuNDMtMTMxLjA3LTM2Ni40M3ogTS0xMzAuNjUtMzYzLjg2Yy0wLjksMC0xLjcsMC4yMi0yLjM4LDAuNjVjLTAuNjgsMC40My0xLjIyLDEuMDMtMS42LDEuNzgKCQkJCQkJYy0wLjM5LDAuNzYtMC41OCwxLjYxLTAuNTgsMi41N2MwLDAuOTYsMC4xOSwxLjgxLDAuNTgsMi41N2MwLjM5LDAuNzYsMC45MiwxLjM1LDEuNiwxLjhjMC42OCwwLjQ0LDEuNDcsMC42NiwyLjM4LDAuNjYKCQkJCQkJYzAuODgsMCwxLjY3LTAuMjIsMi4zNS0wLjY1YzAuNjgtMC40MywxLjIyLTEuMDMsMS42LTEuOGMwLjM5LTAuNzYsMC41OC0xLjYzLDAuNTgtMi41OGMwLTAuOTYtMC4xOS0xLjgxLTAuNTgtMi41NwoJCQkJCQljLTAuMzktMC43Ni0wLjkyLTEuMzUtMS42LTEuNzhDLTEyOC45OC0zNjMuNjQtMTI5Ljc3LTM2My44Ni0xMzAuNjUtMzYzLjg2eiIvPgoJCQkJPC9nPgoJCQkJPGc+CgkJCQkJPHBhdGggY2xhc3M9InN0MCIgZD0iTS0xOTkuNDMtMzUxLjc3Yy00LDAtNy4yNS0zLjI1LTcuMjUtNy4yNWMwLTQsMy4yNS03LjI1LDcuMjUtNy4yNWM0LDAsNy4yNSwzLjI1LDcuMjUsNy4yNQoJCQkJCQlDLTE5Mi4xOC0zNTUuMDMtMTk1LjQzLTM1MS43Ny0xOTkuNDMtMzUxLjc3eiBNLTE5OS40My0zNjQuMjNjLTIuODcsMC01LjIxLDIuMzQtNS4yMSw1LjIxYzAsMi44NywyLjM0LDUuMjEsNS4yMSw1LjIxCgkJCQkJCWMyLjg3LDAsNS4yMS0yLjM0LDUuMjEtNS4yMUMtMTk0LjIyLTM2MS45LTE5Ni41Ni0zNjQuMjMtMTk5LjQzLTM2NC4yM3oiLz4KCQkJCQk8cGF0aCBjbGFzcz0ic3QwIiBkPSJNLTE5My4yNS0zNTIuMzhoMC44M2MwLjM1LDAsMC42NC0wLjI5LDAuNjQtMC42NHYtMTIuMDFjMC0wLjM1LTAuMjktMC42NC0wLjY0LTAuNjRoLTAuODMKCQkJCQkJYy0wLjM1LDAtMC42NCwwLjI5LTAuNjQsMC42NHYxMi4wMUMtMTkzLjg5LTM1Mi42Ny0xOTMuNjEtMzUyLjM4LTE5My4yNS0zNTIuMzh6Ii8+CgkJCQk8L2c+CgkJCQk8Zz4KCQkJCQk8cGF0aCBjbGFzcz0ic3QwIiBkPSJNLTE3Mi4yMy0zNTEuNzdjLTQsMC03LjI1LTMuMjUtNy4yNS03LjI1YzAtNCwzLjI1LTcuMjUsNy4yNS03LjI1YzQsMCw3LjI1LDMuMjUsNy4yNSw3LjI1CgkJCQkJCUMtMTY0Ljk4LTM1NS4wMy0xNjguMjMtMzUxLjc3LTE3Mi4yMy0zNTEuNzd6IE0tMTcyLjIzLTM2NC4yM2MtMi44NywwLTUuMjEsMi4zNC01LjIxLDUuMjFjMCwyLjg3LDIuMzQsNS4yMSw1LjIxLDUuMjEKCQkJCQkJYzIuODcsMCw1LjIxLTIuMzQsNS4yMS01LjIxQy0xNjcuMDItMzYxLjktMTY5LjM2LTM2NC4yMy0xNzIuMjMtMzY0LjIzeiIvPgoJCQkJCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0tMTY2LjA1LTM1Mi4zOGgwLjgzYzAuMzUsMCwwLjY0LTAuMjksMC42NC0wLjY0di0xMi4wMWMwLTAuMzUtMC4yOS0wLjY0LTAuNjQtMC42NGgtMC44MwoJCQkJCQljLTAuMzUsMC0wLjY0LDAuMjktMC42NCwwLjY0djEyLjAxQy0xNjYuNjktMzUyLjY3LTE2Ni40MS0zNTIuMzgtMTY2LjA1LTM1Mi4zOHoiLz4KCQkJCTwvZz4KCQkJPC9nPgoJCTwvZz4KCQk8Zz4KCQkJPGc+CgkJCQk8Zz4KCQkJCQk8Zz4KCQkJCQkJPGc+CgkJCQkJCQk8cGF0aCBjbGFzcz0ic3QwIiBkPSJNLTIzNy44OS0zNzkuMDljLTMuMzUtMC4wNy02LjE2LDMuODItNC43Nyw2LjIybDExLDE4Ljk2YzAuNiwxLjA0LDEuNzgsMS43NywzLjE1LDIuMDMKCQkJCQkJCQljMC4wMS0wLjAyLDAuMDItMC4wNCwwLjA0LTAuMDZjMC43Ny0xLjEzLDIuMDctMS44OCwzLjU0LTEuODhjMS40NywwLDIuNzcsMC43NCwzLjU0LDEuODhjMC4wNCwwLjA1LDAuMDcsMC4xMSwwLjEsMC4xNgoJCQkJCQkJCWMxLjg0LDAsMy45MywwLDUuOSwwYzAuMDMtMC4wNiwwLjA3LTAuMTEsMC4xLTAuMTZjMC43Ny0xLjEzLDIuMDctMS44OCwzLjU0LTEuODhjMS40NywwLDIuNzcsMC43NCwzLjU0LDEuODgKCQkJCQkJCQljMC4wNCwwLjA1LDAuMDcsMC4xMSwwLjEsMC4xNmMwLjcyLDAsMS4xNy0wLjc4LDAuOC0xLjRjLTAuNjUtMS4xLTIuOTItMy40OS00LjU0LTMuNTJjLTAuMDcsMC0wLjEzLDAuMDEtMC4yLDAuMDIKCQkJCQkJCQljLTIuMTYsMC40Mi00LjgsMC43Ny03LjgxLDAuOGMtMC45NywwLjAxLTEuOS0wLjAxLTIuNzktMC4wNmMtMy41Ny0wLjItNS45My0wLjU3LTcuNzItMy42NmMtMS40NC0yLjQ5LTIuODktNC45OC00LjMzLTcuNDcKCQkJCQkJCQljLTEuOTMtMy4zMiwwLjQ2LTcuNzgsNC4zLTcuN2wyMy43MiwwLjQ5YzEuNjcsMC4wMywzLjQ5LTEuODksNC4yLTIuOTljMC4zOS0wLjYxLDAuMTktMS4wOS0wLjUzLTEuMUwtMjM3Ljg5LTM3OS4wOXoiLz4KCQkJCQkJCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0tMjI1LjM1LTM1Mi4xNGMtMS4xOCwwLTIuMjMsMC42LTIuODUsMS41MWMtMC4wMSwwLjAxLTAuMDIsMC4wMy0wLjAzLDAuMDUKCQkJCQkJCQljLTAuNTMsMC44MS0wLjczLDEuODUtMC40LDIuOTRjMC4zMiwxLjA3LDEuMTksMS45MywyLjI3LDIuMjNjMi4zMywwLjY2LDQuNDUtMS4wNyw0LjQ1LTMuMjljMC0wLjY2LTAuMTktMS4yNy0wLjUxLTEuOAoJCQkJCQkJCWMtMC4wMy0wLjA0LTAuMDUtMC4wOS0wLjA4LTAuMTNDLTIyMy4xMi0zNTEuNTQtMjI0LjE2LTM1Mi4xNC0yMjUuMzUtMzUyLjE0eiIvPgoJCQkJCQkJPHBhdGggY2xhc3M9InN0MCIgZD0iTS0yMTIuMTYtMzUyLjE0Yy0xLjE4LDAtMi4yMywwLjYtMi44NSwxLjUxYy0wLjAzLDAuMDQtMC4wNiwwLjA5LTAuMDgsMC4xMwoJCQkJCQkJCWMtMC41LDAuOC0wLjY3LDEuODMtMC4zNCwyLjg5YzAuMzMsMS4wNiwxLjE5LDEuODksMi4yNiwyLjJjMi4zMywwLjY2LDQuNDUtMS4wNyw0LjQ1LTMuMjljMC0wLjY2LTAuMTktMS4yNy0wLjUxLTEuOAoJCQkJCQkJCWMtMC4wMy0wLjA0LTAuMDUtMC4wOS0wLjA4LTAuMTNDLTIwOS45My0zNTEuNTQtMjEwLjk4LTM1Mi4xNC0yMTIuMTYtMzUyLjE0eiIvPgoJCQkJCQk8L2c+CgkJCQkJPC9nPgoJCQkJPC9nPgoJCQk8L2c+CgkJCTxnPgoJCQkJPGc+CgkJCQkJPHBhdGggY2xhc3M9InN0MCIgZD0iTS0yMDkuNzctMzY4LjE0aC05LjMxYy0wLjE2LDAtMC4yOC0wLjEzLTAuMjgtMC4yOHYtMC4zN2MwLTAuMTYsMC4xMy0wLjI4LDAuMjgtMC4yOGg5LjMxCgkJCQkJCWMwLjE2LDAsMC4yOCwwLjEzLDAuMjgsMC4yOHYwLjM3Qy0yMDkuNDgtMzY4LjI2LTIwOS42MS0zNjguMTQtMjA5Ljc3LTM2OC4xNHoiLz4KCQkJCQk8cGF0aCBjbGFzcz0ic3QwIiBkPSJNLTIxMi4xNS0zNjQuN2gtNy4wOGMtMC4xNiwwLTAuMjgtMC4xMy0wLjI4LTAuMjh2LTAuMzdjMC0wLjE2LDAuMTMtMC4yOCwwLjI4LTAuMjhoNy4wOAoJCQkJCQljMC4xNiwwLDAuMjgsMC4xMywwLjI4LDAuMjh2MC4zN0MtMjExLjg3LTM2NC44My0yMTEuOTktMzY0LjctMjEyLjE1LTM2NC43eiIvPgoJCQkJCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0tMjE0Ljg1LTM2MS4yNmgtNC4yMmMtMC4xNiwwLTAuMjgtMC4xMy0wLjI4LTAuMjh2LTAuMzdjMC0wLjE2LDAuMTMtMC4yOCwwLjI4LTAuMjhoNC4yMgoJCQkJCQljMC4xNiwwLDAuMjgsMC4xMywwLjI4LDAuMjh2MC4zN0MtMjE0LjU3LTM2MS4zOS0yMTQuNjktMzYxLjI2LTIxNC44NS0zNjEuMjZ6Ii8+CgkJCQk8L2c+CgkJCTwvZz4KCQk8L2c+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8Zz4KCQkJPGc+CgkJCQk8Zz4KCQkJCQk8cGF0aCBjbGFzcz0ic3QxIiBkPSJNMTM2LjA3LDAuMDJDNDcuMjktMS44MS0yNy4yNywxMDEuMzQsOS42OCwxNjUuMDNsMjkxLjU4LDUwMi42NmMxNS45NywyNy41Myw0Ny4xMiw0Ni45Niw4My40Nyw1My43NQoJCQkJCQljMC4zMy0wLjUsMC42Mi0xLjAyLDAuOTUtMS41MmMyMC40MS0zMC4wNSw1NC44Ni00OS44LDkzLjkzLTQ5LjhjMzkuMDcsMCw3My41MSwxOS43NSw5My45Miw0OS44CgkJCQkJCWMwLjk2LDEuNDEsMS44MywyLjg5LDIuNzMsNC4zNWM0OC43LDAsMTA0LjEyLDAsMTU2LjMzLDBjMC45LTEuNDYsMS43Ny0yLjk0LDIuNzMtNC4zNWMyMC40MS0zMC4wNSw1NC44Ni00OS44LDkzLjkzLTQ5LjgKCQkJCQkJYzM5LjA3LDAsNzMuNTEsMTkuNzUsOTMuOTIsNDkuOGMwLjk2LDEuNDEsMS44MywyLjg5LDIuNzMsNC4zNWMxOS4wNCwwLDMwLjktMjAuNzgsMjEuMTUtMzcuMTMKCQkJCQkJYy0xNy4zMy0yOS4wNS03Ny4zMi05Mi40MS0xMjAuNDctOTMuMjNjLTEuOC0wLjAzLTMuNTcsMC4xNC01LjM0LDAuNDljLTU3LjM3LDExLjI2LTEyNy4yOSwyMC4zOC0yMDcuMDUsMjEuMTYKCQkJCQkJYy0yNS42NCwwLjI1LTUwLjMxLTAuMzgtNzMuOTMtMS42OWMtOTQuNjYtNS4yNi0xNTcuMjEtMTUuMDUtMjA0Ljc4LTk3LjA2Yy0zOC4yOC02NS45OS03Ni41Ni0xMzEuOTktMTE0Ljg1LTE5Ny45OAoJCQkJCQljLTUxLjExLTg4LjEsMTIuMjMtMjE5LjI5LDExNC4wNi0yMTcuMTlsNjI4LjgsNS45NWM0NC4yMSwwLjkxLDkyLjYyLTUwLjA5LDExMS4zMy03OS4yOGMxMC4zMy0xNi4xMSw0Ljk1LTI4Ljg2LTE0LjE4LTI5LjI1CgkJCQkJCUwxMzYuMDcsMC4wMnoiLz4KCQkJCQk8cGF0aCBjbGFzcz0ic3QxIiBkPSJNNDY4LjU5LDcxNC41Yy0zMS4zOCwwLTU5LjA0LDE1Ljg2LTc1LjQzLDQwYy0wLjI3LDAuNC0wLjUsMC44Mi0wLjc2LDEuMjIKCQkJCQkJYy0xNC4wOCwyMS40NC0xOS40NSw0OS4xMS0xMC42OSw3OC4wN2M4LjYsMjguNDQsMzEuNTgsNTEuMDUsNjAuMTUsNTkuMTljNjEuNzgsMTcuNiwxMTcuODgtMjguMzIsMTE3Ljg4LTg3LjM0CgkJCQkJCWMwLTE3LjQ4LTQuOTgtMzMuNzgtMTMuNTEtNDcuNjVjLTAuNzItMS4xNy0xLjQyLTIuMzYtMi4xOS0zLjQ5QzUyNy42Myw3MzAuMzYsNDk5Ljk3LDcxNC41LDQ2OC41OSw3MTQuNXoiLz4KCQkJCQk8cGF0aCBjbGFzcz0ic3QxIiBkPSJNODE4LjIzLDcxNC41Yy0zMS4zOCwwLTU5LjA0LDE1Ljg2LTc1LjQzLDQwYy0wLjc3LDEuMTQtMS40NywyLjMyLTIuMTksMy40OQoJCQkJCQljLTEzLjEzLDIxLjM0LTE3Ljg0LDQ4LjQxLTguOTcsNzYuNzJjOC43OSwyOC4wNCwzMS42MSw1MC4yMyw1OS44Nyw1OC4yN2M2MS43NywxNy41OCwxMTcuODYtMjguMzMsMTE3Ljg2LTg3LjM0CgkJCQkJCWMwLTE3LjQ4LTQuOTgtMzMuNzgtMTMuNTEtNDcuNjVjLTAuNzItMS4xNy0xLjQyLTIuMzYtMi4xOS0zLjQ5Qzg3Ny4yNyw3MzAuMzYsODQ5LjYxLDcxNC41LDgxOC4yMyw3MTQuNXoiLz4KCQkJCTwvZz4KCQkJPC9nPgoJCTwvZz4KCTwvZz4KCTxnPgoJCTxnPgoJCQk8cGF0aCBjbGFzcz0ic3QxIiBkPSJNODg4LjkxLDI5MC40NEg2MjcuNzZjLTAuMTYsMC0wLjI4LTAuMTMtMC4yOC0wLjI4di0yNC4xNWMwLTAuMTYsMC4xMy0wLjI4LDAuMjgtMC4yOGgyNjEuMTUKCQkJCWMwLjE2LDAsMC4yOCwwLjEzLDAuMjgsMC4yOHYyNC4xNUM4ODkuMTksMjkwLjMxLDg4OS4wNywyOTAuNDQsODg4LjkxLDI5MC40NHoiLz4KCQkJPHBhdGggY2xhc3M9InN0MSIgZD0iTTgyNS42NywzODEuNjFINjIzLjU5Yy0wLjE2LDAtMC4yOC0wLjEzLTAuMjgtMC4yOHYtMjQuMTVjMC0wLjE2LDAuMTMtMC4yOCwwLjI4LTAuMjhoMjAyLjA4CgkJCQljMC4xNiwwLDAuMjgsMC4xMywwLjI4LDAuMjh2MjQuMTVDODI1Ljk2LDM4MS40OCw4MjUuODMsMzgxLjYxLDgyNS42NywzODEuNjF6Ii8+CgkJCTxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik03NTQuMDksNDcyLjc4SDYyNy43NmMtMC4xNiwwLTAuMjgtMC4xMy0wLjI4LTAuMjh2LTI0LjE1YzAtMC4xNiwwLjEzLTAuMjgsMC4yOC0wLjI4aDEyNi4zMwoJCQkJYzAuMTYsMCwwLjI4LDAuMTMsMC4yOCwwLjI4djI0LjE1Qzc1NC4zNyw0NzIuNjUsNzU0LjI0LDQ3Mi43OCw3NTQuMDksNDcyLjc4eiIvPgoJCTwvZz4KCTwvZz4KPC9nPgo8L3N2Zz4K',
            50
        );

        $submenus = array(
            'enquiry-messages' => array(
                'name'   => __( 'Enquiry Messages', 'catalogx' ),
                'subtab' => '',
            ),
            'quote-requests'   => array(
                'name'   => __( 'Quotation Requests', 'catalogx' ),
                'subtab' => '',
            ),
            'wholesale-users'  => array(
                'name'   => __( 'Wholesale Users', 'catalogx' ),
                'subtab' => '',
            ),
            'rules'            => array(
                'name'   => __( 'Dynamic Pricing Rules', 'catalogx' ),
                'subtab' => '',
            ),
            'settings'         => array(
                'name'   => __( 'Settings', 'catalogx' ),
                'subtab' => 'all-settings',
            ),
            'modules'          => array(
                'name'   => __( 'Modules', 'catalogx' ),
                'subtab' => '',
            ),
        );

        foreach ( $submenus as $slug => $submenu ) {
            // prepare subtab if subtab is exist.
            $subtab = '';

            if ( $submenu['subtab'] ) {
                $subtab = '&subtab=' . $submenu['subtab'];
            }

            add_submenu_page(
                'catalogx',
                $submenu['name'],
                $submenu['name'],
                'manage_woocommerce',
                'catalogx#&tab=' . $slug . $subtab,
                '__return_null'
            );
        }

        if ( ! Utill::is_khali_dabba() ) {
            add_submenu_page(
                'catalogx',
                __( 'Upgrade to Pro', 'catalogx' ),
                '<style>
                    a:has(.upgrade-to-pro){
                        background: linear-gradient(-28deg, #C4A9E8, #7848B9, #852AFF) !important;
                        color: White !important;
                    };
                    padding: 5px 0;
                </style>
                <div class="upgrade-to-pro"><i style="margin-right: 0.25rem" class="dashicons dashicons-awards"></i>' . __( 'Upgrade to pro', 'catalogx' ) . '</div>',
                'manage_woocommerce',
                '',
                array( $this, 'handle_external_redirects' )
            );
        }

        remove_submenu_page( 'catalogx', 'catalogx' );
    }

    /**
     * Callback function for menu page
     *
     * @return void
     */
    public function menu_page_callback() {
        echo '<div id="admin-main-wrapper"></div>';
    }

    /**
     * Enqueue javascript and css
     *
     * @return void
     */
    public function enqueue_admin_script() {

        if ( get_current_screen()->id !== 'toplevel_page_catalogx' ) {
			return;
        }

        // Support for media.
        wp_enqueue_media();

        // Enque script and style.
        FrontendScripts::admin_load_scripts();
        FrontendScripts::enqueue_script( 'catalogx-admin-script' );
        FrontendScripts::enqueue_script( 'catalogx-components-script' );
        FrontendScripts::enqueue_style( 'catalogx-components-style' );
        FrontendScripts::localize_scripts( 'catalogx-admin-script' );
    }

    /**
	 * Redirct to pro shop url.
     *
	 * @return never
	 */
	public function handle_external_redirects() {
		wp_safe_redirect( esc_url_raw( CATALOGX_PRO_SHOP_URL ) );
		exit;
	}

	/**
     * Allow CatalogX domain for safe redirection using wp_safe_redirect().
     *
     * @param string[] $hosts List of allowed hosts.
     * @return string[] Modified list with CatalogX domain included.
     */
    public function allow_catalogx_redirect_host( $hosts ) {
        $parsed_url = wp_parse_url( CATALOGX_PRO_SHOP_URL );

        if ( isset( $parsed_url['host'] ) ) {
            $hosts[] = $parsed_url['host'];
        }

        return $hosts;
    }

    /**
     * Filters the relative path for the plugin's textdomain.
     *
     * This method can be used to adjust the location where translation files are loaded from.
     *
     * @param string $path Relative path to the .mo file.
     * @param string $url  URL to the .mo file.
     * @return string Modified path.
     */
    public function textdomain_relative_path( $path, $url ) {
        if ( strpos( $url, 'woocommerce-catalog-enquiry' ) !== false ) {
            foreach ( CatalogX()->block_paths as $key => $new_path ) {
                if ( strpos( $url, $key ) !== false ) {
                    $path = $new_path;
                }
            }

            if ( strpos( $url, 'block' ) === false ) {
                $path = 'assets/js/components.js';
            }
        }

        return $path;
    }
}

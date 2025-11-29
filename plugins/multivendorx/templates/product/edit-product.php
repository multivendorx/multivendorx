<?php

// $subtab = get_query_var('subtab');
// $value = get_query_var('value');

// if ($subtab === 'edit') {
// if (!empty($value)) {
// MultiVendorX()->store->products->call_edit_product();
// } else {
// if ( MultiVendorX()->setting->get_setting('category_pyramid_guide') == 'yes' ) {
// MultiVendorX()->store->products->call_add_product();
// }
// }
// }

$self           = $args['self'];
$product_object = $args['product_object'];
$post           = $args['post'];

$get_product_data_tabs = $self->get_product_data_tabs();
$product_fileds        = MultiVendorX()->setting->get_setting( 'products_fields', array() );

?>

    <form id="mvx-edit-product-form" class="woocommerce form-horizontal" method="post">
        <div class="page-title-wrapper">
            <div class="page-title">
                <div class="title">Add Product</div>
                <div class="breadcrumbs">
                    <span><a href="#">Products</a></span>
                    <span> / <a href="">Add Product</a></span>
                </div>
            </div>

            <div class="buttons-wrapper">
                <?php
                $primary_action = __( 'Submit', 'multivendorx' );    // default value
                if ( current_user_can( 'publish_products' ) ) {
                    if ( ! empty( $product_object->get_id() ) && get_post_status( $product_object->get_id() ) === 'publish' ) {
                        $primary_action = __( 'Update', 'multivendorx' );
                    } else {
                        $primary_action = __( 'Publish', 'multivendorx' );
                    }
                }
                ?>
                <input type="submit" class="admin-btn btn-purple" name="submit-data"
                    value="<?php echo esc_attr( $primary_action ); ?>" id="mvx_frontend_dashboard_product_submit" />
                <input type="submit" class="admin-btn btn-light-blue" name="draft-data"
                    value="<?php esc_attr_e( 'Draft', 'multivendorx' ); ?>" id="mvx_frontend_dashboard_product_draft" />
                <input type="hidden" name="status" value="<?php echo esc_attr( get_post_status( $post ) ); ?>">
                <?php wp_nonce_field( 'mvx-product', 'mvx_product_nonce' ); ?>
            </div>
        </div>

        <div class="container-wrapper">
            <div class="card-wrapper w-65">
                <div class="card-content">
                    <div class="card-header">
                        <div class="left">
                            <div class="title">
                                Product Title
                            </div>
                        </div>
                    </div>
                    <div class="form-group-wrapper">
                        <!-- <strong
                                class="editable-content"><?php echo isset( $_POST['post_title'] ) ? wc_clean( $_POST['post_title'] ) : htmlspecialchars( $product_object->get_title( 'edit' ) ); ?></strong> -->

                        <input type="text" class="basic-input" name="post_title" id="post_title"
                            value="<?php echo htmlspecialchars( $product_object->get_title( 'edit' ) ); ?>" ?>
                        <input type="hidden" name="original_post_title"
                            value="<?php echo htmlspecialchars( $product_object->get_title( 'edit' ) ); ?>">
                        <input type="hidden" name="post_ID" value="<?php echo $product_object->get_id(); ?>">
                        <input type="hidden" name="original_post_status"
                            value="<?php echo esc_attr( get_post_status( $post ) ); ?>">

                    </div>

                </div>
                <div class="card-content">
                    <div class="card-header">
                        <div class="left">
                            <div class="title">
                                Product short description
                            </div>
                        </div>
                    </div>
                    <div class="form-group-wrapper">
                        <div class="form-group">
                            <?php
                            $settings = array(
                                'textarea_name' => 'product_excerpt',
                                'textarea_rows' => get_option( Utill::WORDPRESS_SETTINGS['rows'], 10 ),
                                'quicktags'     => array( 'buttons' => 'em,strong,link' ),
                                'tinymce'       => array(
                                    'theme_advanced_buttons1' => 'bold,italic,strikethrough,separator,bullist,numlist,separator,blockquote,separator,justifyleft,justifycenter,justifyright,separator,link,unlink,separator,undo,redo,separator',
                                    'theme_advanced_buttons2' => '',
                                ),
                                'editor_css'    => '<style>#wp-product_excerpt-editor-container .wp-editor-area{height:6.25rem; width:100%;}</style>',
                            );
                            if ( ! apply_filters( 'mvx_vendor_product_excerpt_richedit', true ) ) {
                                $settings['tinymce'] = $settings['quicktags'] = $settings['media_buttons'] = false;
                            }
                            wp_editor( htmlspecialchars_decode( isset( $_POST['product_excerpt'] ) ? wc_clean( $_POST['product_excerpt'] ) : $product_object->get_short_description( 'edit' ) ), 'product_excerpt', $settings );
                            ?>
                        </div>
                    </div>
                </div>
                <div class="card-content">
                    <div class="card-header">
                        <div class="left">
                            <div class="title">
                                Product description
                            </div>
                        </div>
                    </div>
                    <div class="form-group-wrapper">
                        <div class="form-group">
                            <?php
                            $settings = array(
                                'textarea_name' => 'product_description',
                                'textarea_rows' => get_option( Utill::WORDPRESS_SETTINGS['rows'], 10 ),
                                'quicktags'     => array( 'buttons' => 'em,strong,link' ),
                                'tinymce'       => array(
                                    'theme_advanced_buttons1' => 'bold,italic,strikethrough,separator,bullist,numlist,separator,blockquote,separator,justifyleft,justifycenter,justifyright,separator,link,unlink,separator,undo,redo,separator',
                                    'theme_advanced_buttons2' => '',
                                ),
                                'editor_css'    => '<style>#wp-product_description-editor-container .wp-editor-area{height:10.938rem; width:100%;}</style>',
                            );
                            if ( ! apply_filters( 'mvx_vendor_product_description_richedit', true ) ) {
                                $settings['tinymce'] = $settings['quicktags'] = $settings['media_buttons'] = false;
                            }
                            wp_editor( $product_object->get_description( 'edit' ), 'product_description', $settings );
                            ?>
                        </div>
                    </div>
                </div>
                <div class="card-content">
                    <div id="woocommerce-product-data" class="add-product-info-holder">

                        <div class="add-product-info-header row-padding">
                            <div class="select-group">
                                <label for="product-type"><?php esc_html_e( 'Product Type', 'multivendorx' ); ?></label>
                                <select class="form-control basic-select" id="product-type" name="product-type">
                                    <?php foreach ( wc_get_product_types() as $value => $label ) : ?>
                                        <option value="<?php echo esc_attr( $value ); ?>" <?php echo selected( $product_object->get_type(), $value, false ); ?>>
                                            <?php echo esc_html( $label ); ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            <?php
                            $product_type_options = $self->get_product_type_options();
                            $required_types       = array();
                            foreach ( $product_type_options as $type ) {
                                if ( isset( $type['wrapper_class'] ) ) {
                                    $classes = explode( ' ', str_replace( 'show_if_', '', $type['wrapper_class'] ) );
                                    foreach ( $classes as $class ) {
                                        $required_types[ $class ] = true;
                                    }
                                }
                            }
                            ?>
                            <?php
                            if ( $self->mvx_is_allowed_product_type( array_keys( $required_types ) ) ) :
                                ?>
                                <div class="pull-right">
                                    <?php foreach ( $self->get_product_type_options() as $key => $option ) : ?>
                                        <?php
                                        if ( ! empty( $post->ID ) && metadata_exists( 'post', $post->ID, '_' . $key ) ) {
                                            $selected_value = isset( $_POST[ '_' . $key ] ) && $_POST[ '_' . $key ] == 'on' ? true : ( is_callable( array( $product_object, "is_$key" ) ) ? $product_object->{"is_$key"}() : 'yes' === get_post_meta( $post->ID, '_' . $key, true ) );
                                        } else {
                                            $selected_value = 'yes' === ( isset( $_POST[ '_' . $key ] ) && $_POST[ '_' . $key ] == 'on' ? 'yes' : ( isset( $option['default'] ) ? $option['default'] : 'no' ) );
                                        }
                                        ?>
                                        <label for="<?php echo esc_attr( $option['id'] ); ?>"
                                            class="<?php echo esc_attr( $option['wrapper_class'] ); ?> tips"
                                            data-tip="<?php echo esc_attr( $option['description'] ); ?>"><input type="checkbox"
                                                name="<?php echo esc_attr( $option['id'] ); ?>"
                                                id="<?php echo esc_attr( $option['id'] ); ?>" <?php echo checked( $selected_value, true, false ); ?> />
                                            <?php echo esc_html( $option['label'] ); ?></label>
                                    <?php endforeach; ?>
                                </div>
                            <?php endif; ?>
                        </div>

                        <!-- product Info Tab start -->
                        <div class="product-info-tab-wrapper" role="tabpanel">
                            <!-- Nav tabs start -->
                            <div>
                                <div class="tab-nav-direction-wrapper"></div>
                                <ul class="nav nav-tabs" role="tablist" id="product_data_tabs">
                                    <?php foreach ( $get_product_data_tabs as $key => $tab ) : ?>
                                        <?php if ( apply_filters( 'mvx_frontend_dashboard_product_data_tabs_filter', ( ! isset( $tab['p_type'] ) || array_key_exists( $tab['p_type'], $self->mvx_get_product_types() ) ), $key, $tab ) ) : ?>
                                            <li role="presentation"
                                                class="nav-item <?php echo esc_attr( $key ); ?>_options <?php echo esc_attr( $key ); ?>_tab <?php echo esc_attr( isset( $tab['class'] ) ? implode( ' ', (array) $tab['class'] ) : '' ); ?>">
                                                <a class="nav-link" href="#<?php echo esc_attr( $tab['target'] ); ?>"
                                                    aria-controls="<?php echo $tab['target']; ?>" role="tab"
                                                    data-toggle="tab"><span><?php echo esc_html( $tab['label'] ); ?></span></a>
                                            </li>
                                        <?php endif; ?>
                                    <?php endforeach; ?>
                                    <?php do_action( 'mvx_product_write_panel_tabs', $post->ID ); ?>
                                </ul>
                            </div>
                            <!-- Nav tabs End -->

                            <!-- Tab content start -->
                            <div class="tab-content">
                                <?php
                                MultiVendorX()->util->get_template(
                                    'product/views/html-product-data-general.php',
                                    array(
										'self'           => $self,
										'product_object' => $product_object,
										'post'           => $post,
                                    )
                                );
                                MultiVendorX()->util->get_template(
                                    'product/views/html-product-data-inventory.php',
                                    array(
										'self'           => $self,
										'product_object' => $product_object,
										'post'           => $post,
                                    )
                                );
                                MultiVendorX()->util->get_template(
                                    'product/views/html-product-data-linked-products.php',
                                    array(
										'self'           => $self,
										'product_object' => $product_object,
										'post'           => $post,
                                    )
                                );
                                MultiVendorX()->util->get_template(
                                    'product/views/html-product-data-attributes.php',
                                    array(
										'self'           => $self,
										'product_object' => $product_object,
										'post'           => $post,
                                    )
                                );
                                do_action( 'mvx_after_attribute_product_tabs_content', $self, $product_object, $post );

                                MultiVendorX()->util->get_template(
                                    'product/views/html-product-data-advanced.php',
                                    array(
										'self'           => $self,
										'product_object' => $product_object,
										'post'           => $post,
                                    )
                                );
                                ?>
                                <?php do_action( 'mvx_product_tabs_content', $self, $product_object, $post ); ?>
                            </div>
                            <!-- Tab content End -->
                        </div>
                        <!-- product Info Tab End -->
                    </div>
                </div>
            </div>

            <!-- right section start -->
            <div class="card-wrapper w-35">
                <div class="card-content">
                    <div class="card-header">
                        <div class="left">
                            <div class="title">
                                Upload Image
                            </div>
                        </div>
                    </div>
                    <div class="product-gallery-wrapper">
                        <div class="featured-img upload_image">
                            <?php $featured_img = isset( $_POST['featured_img'] ) ? wc_clean( $_POST['featured_img'] ) : ( $product_object->get_image_id( 'edit' ) ? $product_object->get_image_id( 'edit' ) : '' ); ?>
                            <a href="#" class="upload_image_button tips <?php echo $featured_img ? 'remove' : ''; ?>"
                                <?php echo current_user_can( 'upload_files' ) ? '' : 'data-nocaps="true" '; ?>data-title="<?php esc_attr_e( 'Product image', 'multivendorx' ); ?>"
                                data-button="<?php esc_attr_e( 'Set product image', 'multivendorx' ); ?>"
                                rel="<?php echo esc_attr( $post->ID ); ?>">
                                <div class="upload-placeholder pos-middle">
                                    <i class="mvx-font ico-image-icon"></i>
                                    <p><?php _e( 'Click to upload Image', 'multivendorx' ); ?></p>
                                </div>
                                <img
                                    src="<?php echo $featured_img ? esc_url( wp_get_attachment_image_src( $featured_img, $image_size )[0] ) : esc_url( wc_placeholder_img_src() ); ?>" />
                                <input type="hidden" name="featured_img" class="upload_image_id"
                                    value="<?php echo esc_attr( $featured_img ); ?>" />
                            </a>
                        </div>
                        <!-- <div id="product_images_container" class="custom-panel">
                            <h3><?php _e( 'Product gallery', 'multivendorx' ); ?></h3>
                            <ul class="product_images">
                                <?php
                                if ( metadata_exists( 'post', $post->ID, '_product_image_gallery' ) ) {
                                    $product_image_gallery = get_post_meta( $post->ID, '_product_image_gallery', true );
                                } else {
                                    // Backwards compatibility.
                                    $attachment_ids        = get_posts( 'post_parent=' . $post->ID . '&numberposts=-1&post_type=attachment&orderby=menu_order&order=ASC&post_mime_type=image&fields=ids&meta_key=_woocommerce_exclude_image&meta_value=0' );
                                    $attachment_ids        = array_diff( $attachment_ids, array( get_post_thumbnail_id() ) );
                                    $product_image_gallery = isset( $_POST['product_image_gallery'] ) ? wc_clean( $_POST['product_image_gallery'] ) : implode( ',', $attachment_ids );
                                }

                                $attachments         = array_filter( explode( ',', $product_image_gallery ) );
                                $update_meta         = false;
                                $updated_gallery_ids = array();

                                if ( ! empty( $attachments ) ) {
                                    foreach ( $attachments as $attachment_id ) {
                                        $attachment = wp_get_attachment_image( $attachment_id, 'thumbnail' );

                                        // if attachment is empty skip
                                        if ( empty( $attachment ) ) {
                                            $update_meta = true;
                                            continue;
                                        }

                                        echo '<li class="image" data-attachment_id="' . esc_attr( $attachment_id ) . '">
                                                ' . $attachment . '
                                                <ul class="actions">
                                                    <li><a href="#" class="delete tips" data-tip="' . esc_attr__( 'Delete image', 'multivendorx' ) . '">' . __( 'Delete', 'multivendorx' ) . '</a></li>
                                                </ul>
                                            </li>';

                                        // rebuild ids to be saved
                                        $updated_gallery_ids[] = $attachment_id;
                                    }

                                    // need to update product meta to set new gallery ids
                                    if ( $update_meta ) {
                                        update_post_meta( $post->ID, '_product_image_gallery', implode( ',', $updated_gallery_ids ) );
                                    }
                                }
                                ?>
                            </ul>
                            <input type="hidden" id="product_image_gallery" name="product_image_gallery"
                                value="<?php echo esc_attr( $product_image_gallery ); ?>" />
                            <p class="add_product_images">
                                <a href="#" <?php echo current_user_can( 'upload_files' ) ? '' : 'data-nocaps="true" '; ?>data-choose="<?php esc_attr_e( 'Add images to product gallery', 'multivendorx' ); ?>"
                                    data-update="<?php esc_attr_e( 'Add to gallery', 'multivendorx' ); ?>"
                                    data-delete="<?php esc_attr_e( 'Delete image', 'multivendorx' ); ?>"
                                    data-text="<?php esc_attr_e( 'Delete', 'multivendorx' ); ?>"><?php _e( 'Add product gallery images', 'multivendorx' ); ?></a>
                            </p>
                        </div> -->
                        <?php do_action( 'mvx_product_manager_right_panel_after', $post->ID ); ?>
                    </div>
                </div>
                <div class="card-content">
                    <div class="card-header">
                        <div class="left">
                            <div class="title">
                                Product categories
                            </div>
                        </div>
                    </div>
                    <div class="form-group-wrapper">
                        <?php
                        $product_categories = $self->mvx_get_product_terms_HTML( 'product_cat', $post->ID, apply_filters( 'mvx_vendor_can_add_product_category', false, get_current_user_id() ) );
                        ?>
                        <?php if ( $product_categories ) : ?>
                            <div class="panel panel-default pannel-outer-heading">
                                <div class="panel-body panel-content-padding form-group-wrapper">
                                    <?php
                                    echo $product_categories;
                                    ?>
                                </div>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
                <div class="card-content">
                    <div class="card-header">
                        <div class="left">
                            <div class="title">
                                Product tags
                            </div>
                        </div>
                    </div>
                    <div class="form-group-wrapper">
                        <?php
                        $product_tags = $self->mvx_get_product_terms_HTML( 'product_tag', $post->ID, apply_filters( 'mvx_vendor_can_add_product_tag', true, get_current_user_id() ), false );
                        ?>
                        <?php if ( $product_tags && ! empty( $product_fileds ) && in_array( 'product_tag', $product_fileds ) ) : ?>
                            <div class="panel panel-default pannel-outer-heading">
                                <div class="panel-body panel-content-padding form-group-wrapper">
                                    <div class="form-group">
                                        <div class="col-md-12">
                                            <?php
                                            echo $product_tags;
                                            ?>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
                <div class="card-content">
                    <div class="card-header">
                        <div class="left">
                            <div class="title">
                                Brands
                            </div>
                        </div>
                    </div>
                    <div class="form-group-wrapper">
                        <?php
                        $product_brands = $self->mvx_get_product_terms_HTML( 'product_brand', $post->ID, apply_filters( 'mvx_vendor_can_add_product_category', false, get_current_user_id() ) );
                        ?>
                        <?php if ( $product_brands ) : ?>
                            <div class="panel panel-default pannel-outer-heading">
                                <div class="panel-body panel-content-padding form-group-wrapper">
                                    <?php
                                    echo $product_brands;
                                    ?>
                                </div>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>

                <div class="">
                    <div class="pull-right full-1080">
                        <?php
                        $current_visibility = $product_object->get_catalog_visibility();
                        $current_featured   = wc_bool_to_string( $product_object->get_featured() );
                        $visibility_options = wc_get_product_visibility_options();
                        ?>

                        <!-- <p class="cat-visiblity"><?php esc_html_e( 'Catalog visibility:', 'multivendorx' ); ?>
                            <strong id="catalog-visibility-display">
                                <?php

                                echo isset( $visibility_options[ $current_visibility ] ) ? esc_html( $visibility_options[ $current_visibility ] ) : esc_html( $current_visibility );

                                if ( 'yes' === $current_featured ) {
                                    echo ', ' . esc_html__( 'Featured', 'multivendorx' );
                                }
                                ?>
                            </strong>
                            <button type="button" class="editabble-button" data-toggle="collapse"
                                data-target="#product_visiblity"><i class="mvx-font ico-downarrow-2-icon"
                                    title="<?php _e( 'Edit', 'multivendorx' ); ?>"></i> <span>edit</span></button>
                        </p> -->

                        <!--
                        <div id="product_visiblity" class="mvx-clps collapse dropdown-panel">
                            <input type="hidden" name="current_visibility" id="current_visibility"
                                value="<?php echo esc_attr( $current_visibility ); ?>" />
                            <input type="hidden" name="current_featured" id="current_featured"
                                value="<?php echo esc_attr( $current_featured ); ?>" />
                            <div class="product-visibility-toggle-inner">
                                <?php
                                foreach ( $visibility_options as $name => $label ) {
                                    echo '<div class="form-group"><label><input type="radio" name="_visibility" id="_visibility_' . esc_attr( $name ) . '" value="' . esc_attr( $name ) . '" ' . checked( $current_visibility, $name, false ) . ' data-label="' . esc_attr( $label ) . '" /> <span for="_visibility_' . esc_attr( $name ) . '" class="selectit">' . esc_html( $label ) . '</span></label></div>';
                                }
                                if ( apply_filters( 'mvx_feature_product_is_enable', true ) ) {
                                    echo '<hr><div class="form-group"><label><input type="checkbox" name="_featured" class="mt-0" id="_featured" ' . checked( $current_featured, 'yes', false ) . ' data-label="' . __( 'Featured', 'multivendorx' ) . '" /> <span for="_featured">' . esc_html__( 'This is a featured product', 'multivendorx' ) . '</label></label></div>';
                                }
                                ?>
                                <div class="buttons-wrapper">
                                    <button type="button"
                                        class="admin-btn btn-green"><?php esc_html_e( 'Ok', 'multivendorx' ); ?></button>
                                    <a href="javascript:void(0)" class="admin-btn btn-red" data-toggle="collapse"
                                        data-target="#product_visiblity"><?php esc_html_e( 'Cancel', 'multivendorx' ); ?></a>
                                </div>
                            </div>
                        </div>
                        -->
                    </div>
                </div>
            </div> <!-- right section end -->
        </div>
    </form>
</div>
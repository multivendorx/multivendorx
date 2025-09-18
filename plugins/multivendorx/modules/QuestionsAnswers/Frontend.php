<?php
/**
 * MultiVendorX Frontend class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\QuestionsAnswers;
use MultiVendorX\FrontendScripts;


/**
 * MultiVendorX Questions & Answers Frontend class
 *
 * @class       Frontend class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class Frontend {
    /**
     * Frontend class constructor function.
     */
    public function __construct() {
        add_filter('woocommerce_product_tabs', array($this, 'product_questions_answers_tab'));
        add_action( 'wp_enqueue_scripts', array( $this, 'load_scripts' ) );

    }

    public function load_scripts() {
        FrontendScripts::load_scripts();
        FrontendScripts::enqueue_script( 'multivendorx-qna-frontend-script' );
        FrontendScripts::localize_scripts( 'multivendorx-qna-frontend-script' );
    }

    public function product_questions_answers_tab($tabs) {
        $tabs['product_qna'] = [
            'title'    => __( 'Questions & Answers', 'multivendorx' ),
            'priority' => 50,
            'callback' => array($this, 'multivendorx_product_qna_tab_content'),
        ];
        return $tabs;
    }

    /**
     * Add Question and answer tab html
     *
     * @return void
     */
    public function multivendorx_product_qna_tab_content() {
        global $product;
        MultiVendorX()->util->get_template( 'store-single-product-qna-tab.php', ['product_id' => $product->get_id()] );
    }
    
}
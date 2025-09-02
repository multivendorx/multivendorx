<?php
/**
 * MultiVendorX Email class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Emails;


class NewStoreEmail extends MultiVendorXEmails {
    public function __construct() {
        $this->id             = 'new_store_registered';
        $this->title          = __( 'New Store Registered', 'multivendorx' );
        $this->description    = __( 'This email is sent when a new store registers.', 'multivendorx' );
        $this->heading        = __( 'New Store Registration', 'multivendorx' );
        $this->subject        = __( '[{site_title}] A new store has registered', 'multivendorx' );

        // Call parent constructor (important)
        parent::__construct();
    }

    /**
     * Trigger email
     */
    public function trigger( $store_id ) {
        $this->recipient = get_option( 'admin_email' );

        if ( ! $this->is_enabled() || ! $this->get_recipient() ) {
            return;
        }

        $this->send( 
            $this->get_recipient(), 
            $this->get_subject(), 
            $this->get_content(), 
            $this->get_headers(), 
            $this->get_attachments() 
        );
    }

    /**
     * Email content HTML
     */
    public function get_content_html() {
       
    }

    /**
     * Email content plain
     */
    public function get_content_plain() {
        
    }
}

<?php
/**
 * PostPublishedTrigger class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\AutomationEngine\Triggers;

defined( 'ABSPATH' ) || exit;

/**
 * `transition_post_status` fires for every post status change on every
 * post type, so should_fire() filters it down to a genuine
 * draft/pending/future-to-publish transition on `post_type = 'post'` —
 * WooCommerce products transitioning to publish are ProductCreatedTrigger's
 * job, not this one's.
 *
 * @class       PostPublishedTrigger class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class PostPublishedTrigger extends AbstractObjectEventTrigger {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'post_published';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Post published', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    protected function get_wp_hook(): string {
        return 'transition_post_status';
    }

    /**
     * @inheritDoc
     */
    protected function get_accepted_args(): int {
        return 3;
    }

    /**
     * @inheritDoc
     */
    protected function get_object_type(): string {
        return 'post';
    }

    /**
     * @inheritDoc
     */
    protected function should_fire( array $hook_args ): bool {
        $new_status = $hook_args[0] ?? '';
        $old_status = $hook_args[1] ?? '';
        $post       = $hook_args[2] ?? null;

        return 'publish' === $new_status
            && 'publish' !== $old_status
            && isset( $post->post_type )
            && 'post' === $post->post_type;
    }

    /**
     * @inheritDoc
     */
    protected function extract_object_id( array $hook_args ): ?int {
        $post = $hook_args[2] ?? null;

        return isset( $post->ID ) ? absint( $post->ID ) : null;
    }
}

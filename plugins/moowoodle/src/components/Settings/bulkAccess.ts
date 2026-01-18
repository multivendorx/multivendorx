import { __ } from '@wordpress/i18n';
export default {
    id: 'bulk-access',
    priority: 40,
    name: __( 'Bulk Access & Gifting', 'moowoodle' ),
    desc: __(
        'Distribute courses through gifting and group enrollments.',
        'moowoodle'
    ),
    icon: 'adminfont-contact-form',
    submitUrl: 'settings',
    proDependent: true,
    modal: [
        {
            key: 'bulk_access_enable',
            type: 'checkbox',
            desc: __(
                'Allow buyers (e.g., teachers or managers) to purchase multiple seats and assign them to users.',
                'moowoodle'
            ),
            label: __( 'Classroom mode / group purchase', 'moowoodle' ),
            options: [
                {
                    key: 'bulk_access_enable',
                    value: 'bulk_access_enable',
                },
            ],
            proSetting: true,
            look: 'toggle',
        },
        {
            key: 'seat_reassignment',
            type: 'checkbox',
            desc: __(
                'Enable buyers to remove users and reassign seats when needed - great for managing rotating teams or classrooms.',
                'moowoodle'
            ),
            label: __( 'Seat reassignment', 'moowoodle' ),
            options: [
                {
                    key: 'seat_reassignment',
                    value: 'seat_reassignment',
                },
            ],
            proSetting: true,
            look: 'toggle',
        },
        {
            key: 'gift_someone',
            type: 'checkbox',
            desc: __(
                "Let buyers gift a course by entering someone else's details during checkout.",
                'moowoodle'
            ),
            label: __( 'Gift someone', 'moowoodle' ),
            options: [
                {
                    key: 'gift_someone',
                    value: 'gift_someone',
                },
            ],
            proSetting: true,
            look: 'toggle',
        },
    ],
};

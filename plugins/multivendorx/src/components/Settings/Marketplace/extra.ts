import { __ } from '@wordpress/i18n';

export default {
    id: 'extra',
    priority: 6,
    headerTitle: __( 'Extra', 'multivendorx' ),
    headerDescription: __(
        'Set up sales flow and catalog mode with integrated enquiry and quotation management.',
        'multivendorx'
    ),
    icon: 'adminlib-cart',
    submitUrl: 'settings',
    modal: [
        // ─── Existing field (unchanged) ───────────────────────────────────────
        {
            key: 'display_pdf',
            type: 'multi-checkbox-table',
            label: __( 'Attachment', 'multivendorx' ),
            classes: 'gridTable',
            rows: [
                { key: 'allow_download_pdf',  label: __( 'Download as PDF',   'multivendorx' ) },
                { key: 'attach_pdf_to_email', label: __( 'Attach with Email', 'multivendorx' ) },
            ],
            columns: [
                { key: 'enquiry_pdf_permission', label: __( 'Enquiry', 'multivendorx' ), moduleEnabled: 'enquiry' },
                { key: 'quote_pdf_permission',   label: __( 'Quote',   'multivendorx' ), moduleEnabled: 'quote'   },
            ],
            proSetting: true,
        },

        // ─── Business Hours ───────────────────────────────────────────────────
        //
        // All four toggles live inside this single field so they all render
        // as consistent inline pill toggles — no dependency on setting-toggle.
        //
        // headerToggles   → rendered as row 1 (Enable Store Time, 24/7 Operation)
        //   hidesTable    → when enable_store_time is OFF, table + row 2 are hidden
        //   disablesShifts → when always_open is ON, all time inputs are disabled
        //
        // lunchBreakToggle / splitShiftToggle → rendered as row 2 (mutually exclusive)
        //   isLunchBreak  → column visible only when lunch_break is ON
        //   isSplitShift  → column visible only when split_shift is ON
        {
            key:   'business_hours',
            type:  'multi-checkbox-table',
            label: __( 'Shop Open & Close Timings', 'multivendorx' ),

            // ── Row 1: master toggles ──────────────────────────────────────
            headerToggles: [
                {
                    key:        'enable_store_time',
                    label:      __( 'Enable Store Time', 'multivendorx' ),
                    icon:       'clock',
                    hidesTable: true,   // table hidden when this is OFF
                },
            ],

            // ── Row 2: column toggles (mutually exclusive) ─────────────────
            lunchBreakToggle: {
                key:   'lunch_break',
                label: __( 'Enable Lunch Break', 'multivendorx' ),
                icon:  'coffee',
            },
            splitShiftToggle: {
                key:   'split_shift',
                label: __( 'Split Shift (2 Time Slots)', 'multivendorx' ),
                icon:  'split-shift',
            },

            // ── Days ───────────────────────────────────────────────────────
            rows: [
                { key: 'sunday',    label: __( 'Sunday',    'multivendorx' ), enabledKey: 'active_days' },
                { key: 'monday',    label: __( 'Monday',    'multivendorx' ), enabledKey: 'active_days' },
                { key: 'tuesday',   label: __( 'Tuesday',   'multivendorx' ), enabledKey: 'active_days' },
                { key: 'wednesday', label: __( 'Wednesday', 'multivendorx' ), enabledKey: 'active_days' },
                { key: 'thursday',  label: __( 'Thursday',  'multivendorx' ), enabledKey: 'active_days' },
                { key: 'friday',    label: __( 'Friday',    'multivendorx' ), enabledKey: 'active_days' },
                { key: 'saturday',  label: __( 'Saturday',  'multivendorx' ), enabledKey: 'active_days' },
            ],

            // ── Columns ────────────────────────────────────────────────────
            columns: [
                {
                    key:   'shift1',
                    label: __( 'First Shift', 'multivendorx' ),
                    type:  'shift',
                    // No flag → always visible
                },
                {
                    key:          'lunch_break',
                    label:        __( 'Lunch Break', 'multivendorx' ),
                    type:         'shift',
                    isLunchBreak: true,   // hidden until lunch_break toggle is ON
                },
                {
                    key:          'shift2',
                    label:        __( 'Second Shift', 'multivendorx' ),
                    type:         'shift',
                    isSplitShift: true,   // hidden until split_shift toggle is ON
                },
            ],
        },

        // ─── Existing field (unchanged) ───────────────────────────────────────
        {
            key:   'custom_css_product_page',
            type:  'textarea',
            desc:  __( 'Put your custom css here, to customize the enquiry form.', 'multivendorx' ),
            label: __( 'Addional CSS', 'multivendorx' ),
        },
    ],
};
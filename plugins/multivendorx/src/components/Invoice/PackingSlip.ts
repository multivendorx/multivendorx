import { __ } from '@wordpress/i18n';
import packingSlip1 from '../../assets/template/packingSlip/packingSlip1';

export default {
    id: 'packing-slip',
    name: __('Packing Slip', 'multivendorx'),
    desc: __(
        'Set up when and how invoices are generated in your marketplace.',
        'multivendorx'
    ),
    icon: 'adminfont-invoice',
    submitUrl: 'settings',
    modal: [
        {
            key: 'invoice_template_builder',
            type: 'color-setting',
            label: __('Templates and design', 'multivendorx'),
            moduleEnabled: 'invoice',
            showPdfButton: true,
            templates: [
                 {
                    key: 'packing_slip',
                    label: __('Packing Slip Invoice', 'multivendorx'),
                    preview: packingSlip1,
                    component: packingSlip1,
                    pdf: packingSlip1,
                },
            ],
            predefinedOptions: [
                {
                    key: 'orchid_bloom',
                    label: 'Orchid Bloom',
                    value: 'orchid_bloom',
                    colors: {
                        colorPrimary: '#FF5959',
                        colorSecondary: '#FADD3A',
                        colorAccent: '#49BEB6',
                        colorSupport: '#075F63',
                    },
                },
                {
                    key: 'emerald_edge',
                    label: 'Emerald Edge',
                    value: 'emerald_edge',
                    colors: {
                        colorPrimary: '#e6b924',
                        colorSecondary: '#d888c1',
                        colorAccent: '#6b7923',
                        colorSupport: '#6e97d0',
                    },
                },
                {
                    key: 'solar_ember',
                    label: 'Solar Ember',
                    value: 'solar_ember',
                    colors: {
                        colorPrimary: '#fe900d',
                        colorSecondary: '#6030db',
                        colorAccent: '#17cadb',
                        colorSupport: '#a52fff',
                    },
                },
                {
                    key: 'crimson_blaze',
                    label: 'Crimson Blaze',
                    value: 'crimson_blaze',
                    colors: {
                        colorPrimary: '#04e762',
                        colorSecondary: '#f5b700',
                        colorAccent: '#dc0073',
                        colorSupport: '#008bf8',
                    },
                },
                {
                    key: 'golden_ray',
                    label: 'Golden Ray',
                    value: 'golden_ray',
                    colors: {
                        colorPrimary: '#0E117A',
                        colorSecondary: '#399169',
                        colorAccent: '#12E2A4',
                        colorSupport: '#DCF516',
                    },
                },
                {
                    key: 'obsidian_night',
                    label: 'Obsidian Night',
                    value: 'obsidian_night',
                    colors: {
                        colorPrimary: '#00eed0',
                        colorSecondary: '#0197af',
                        colorAccent: '#4b227a',
                        colorSupport: '#02153d',
                    },
                },
                {
                    key: 'obsidian',
                    label: 'Obsidian',
                    value: 'obsidian',
                    colors: {
                        colorPrimary: '#7ccc63',
                        colorSecondary: '#f39c12',
                        colorAccent: '#e74c3c',
                        colorSupport: '#2c3e50',
                    },
                },
                {
                    key: 'black',
                    label: 'black',
                    value: 'black',
                    colors: {
                        colorPrimary: '#2c3e50',
                        colorSecondary: '#2c3e50',
                        colorAccent: '#2c3e50',
                        colorSupport: '#2c3e50',
                    },
                },
            ],
        },
    ]}
import React from 'react';
import { useSetting } from '@zyra/core';
import PreviewFrame from './PreviewFrame';

/** Settings → Subscription Form Designer: a preview of the VuloForm subscription form. */
const VuloFormPanel: React.FC = () => {
	const { setting } = useSetting();
	const selectedFormId = Number(setting.vuloform_subscription_form_id) || 0;

	return <PreviewFrame formId={selectedFormId} />;
};

export default VuloFormPanel;

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// import { __ } from '@wordpress/i18n';

// import {
//     NavigatorHeader,
//     PopupUI,
//     ButtonInputUI,
//     getApiLink,
// } from 'zyra';

// import RulesTable, {
//     RuleRow,
// } from './RulesTable';

// import RulePopup from './RulePopup';

// const dummyRules: RuleRow[] = [
//     {
//         id: 1,
//         name: 'Nike Wholesale Discount',

//         applicable_type: 'Product',
//         applicable_value: 'Nike Shoes',

//         user_type: 'Role',
//         user_value: 'Wholesale Customer',

//         applicable_for: 'Product',
//         for_whom: 'Wholesale Customer',

//         discount: '10% Off',
//         status: 'Active',
//     },
// ];

// export default function Rules() {
//     const [rules, setRules] =
//         useState<RuleRow[]>([]);

//     const [popupOpen, setPopupOpen] =
//         useState(false);

//     const [editingRule, setEditingRule] =
//         useState<RuleRow | null>(null);

//     const [confirmOpen, setConfirmOpen] =
//         useState(false);

//     const [selectedRule, setSelectedRule] =
//         useState<RuleRow | null>(null);

//     const [isLoading, setIsLoading] =
//         useState(false);

//     /**
//  * Fetch rules
//  */
//     const fetchRules = async () => {
//         try {
//             const response = await axios.get(
//                 getApiLink(appLocalizer, 'rules'), {
//                 headers: { 'X-WP-Nonce': appLocalizer.nonce },
//             }
//             );

//             setRules(response.data || []);
//         } catch (error) {
//             console.error(
//                 'Error fetching rules:',
//                 error
//             );
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchRules();
//     }, []);

//     /**
//      * Create rule
//      */
//     const handleAddRule = async (
//         rule: RuleRow
//     ) => {
//         try {
//             await axios.post(
//                 getApiLink(appLocalizer, 'rules'),
//                 {
//                     rule,
//                 },
//                 {
//                     headers: { 'X-WP-Nonce': appLocalizer.nonce },
//                 }
//             );

//             await fetchRules();

//             setPopupOpen(false);
//         } catch (error) {
//             console.error(
//                 'Error adding rule:',
//                 error
//             );
//         }
//     };

//     /**
//      * Update rule
//      */
//     const handleUpdateRule = async (
//         id: number,
//         updatedRule: RuleRow
//     ) => {
//         try {
//             await axios.put(
//                 getApiLink(appLocalizer, 'rules'),
//                 {
//                     id,
//                     rule: updatedRule,
//                 },
//                 {
//                     headers: { 'X-WP-Nonce': appLocalizer.nonce },
//                 },
//             );

//             await fetchRules();

//             setEditingRule(null);

//             setPopupOpen(false);
//         } catch (error) {
//             console.error(
//                 'Error updating rule:',
//                 error
//             );
//         }
//     };

//     /**
//      * Delete rule
//      */
//     const handleDeleteRule = async (
//         id: number
//     ) => {
//         try {
//             await axios.delete(
//                 getApiLink(appLocalizer, 'rules'),
//                 {
//                     headers: {
//                         'X-WP-Nonce':
//                             appLocalizer.nonce,
//                     },

//                     data: { id },
//                 }
//             );

//             await fetchRules();
//         } catch (error) {
//             console.error(
//                 'Error deleting rule:',
//                 error
//             );
//         }
//     };

//     /**
//      * Save handler
//      */
//     const handleSaveRule = (
//         rule: RuleRow
//     ) => {
//         if (editingRule?.id) {
//             handleUpdateRule(
//                 editingRule.id,
//                 rule
//             );
//         } else {
//             handleAddRule(rule);
//         }
//     };

//     const handleConfirmDelete = async () => {
//         if (!selectedRule?.id) {
//             return;
//         }

//         try {
//             await handleDeleteRule(
//                 selectedRule.id
//             );
//         } catch (error) {
//             console.error(error);
//         } finally {
//             setConfirmOpen(false);

//             setSelectedRule(null);
//         }
//     };

//     return (
//         <>
//             <NavigatorHeader
//                 headerTitle={__(
//                     'Rules',
//                     'catalogx'
//                 )}
//                 headerDescription={__(
//                     'Manage pricing rules.',
//                     'catalogx'
//                 )}
//                 buttons={[
//                     {
//                         label: __(
//                             'Add New Rule',
//                             'catalogx'
//                         ),

//                         icon: 'plus',

//                         onClick: () => {
//                             setEditingRule(null);
//                             setPopupOpen(true);
//                         },
//                     },
//                 ]}
//             />

//             <RulesTable
//                 rows={rules}
//                 onEdit={(row) => {
//                     setEditingRule(row);
//                     setPopupOpen(true);
//                 }}
//                 onDelete={(row) => {
//                     setSelectedRule(row);
//                     setConfirmOpen(true);
//                 }}
//                 isLoading={isLoading}
//             />

//             <RulePopup
//                 open={popupOpen}
//                 rule={editingRule}
//                 onClose={() => {
//                     setPopupOpen(false);
//                     setEditingRule(null);
//                 }}
//                 onSave={handleSaveRule}
//             />
//             <PopupUI
//                 open={confirmOpen}
//                 width={25}
//                 onClose={() => {
//                     setConfirmOpen(false);
//                     setSelectedRule(null);
//                 }}
//                 header={{
//                     title: __('Delete Rule', 'catalogx'),

//                     description: __(
//                         'Are you sure you want to delete this rule?',
//                         'catalogx'
//                     ),
//                 }}
//                 footer={
//                     <ButtonInputUI
//                         buttons={[
//                             {
//                                 text: __('Cancel', 'catalogx'),

//                                 color: 'red',

//                                 icon: 'close',

//                                 onClick: () => {
//                                     setConfirmOpen(false);
//                                     setSelectedRule(null);
//                                 },
//                             },

//                             {
//                                 text: __('Delete', 'catalogx'),

//                                 icon: 'delete',

//                                 onClick:
//                                     handleConfirmDelete,
//                             },
//                         ]}
//                     />
//                 }
//             />
//         </>
//     );
// }


import { useState } from 'react';

import './Rules.scss';
import { NavigatorHeader, PopupUI } from 'zyra';
import ShowProPopup from '../Popup/Popup';
import { __ } from '@wordpress/i18n';

const Rules = () => {
    const [openPopup, setopenPopup] = useState(false);

    if (appLocalizer.khali_dabba) {
        return <div id="rules-list-table"></div>;
    }

    return (
        <div id="rules-list-table">
            {openPopup && (
                <PopupUI
                    position="lightbox"
                    open={openPopup}
                    onClose={() => setopenPopup(false)}
                    width={31.25}
                    height="auto"
                >
                    <ShowProPopup />
                </PopupUI>
            )}
            <NavigatorHeader
                headerIcon="rules"
                headerDescription={__(
                    'Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet, facere atque alias quasi aperiam nesciunt.',
                    'catalogx'
                )}
                headerTitle={__('Rules', 'catalogx')}
            />
            <div
                className="dynamic-rule-img image-wrapper"
                onClick={() => {
                    setopenPopup(true);
                }}
            ></div>
        </div>
    );
};

export default Rules;

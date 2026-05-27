// import React, { useMemo, useEffect, useState } from 'react';
// import { __ } from '@wordpress/i18n';

// import {
//     InfoItem,
//     TableCard,
// } from 'zyra';

// export interface RuleRow {
//     id?: number;

//     name?: string;

//     applicable_type?: 'Product' | 'Category' | 'Brand';
//     applicable_value?: string;

//     user_type?: 'User' | 'Role';
//     user_value?: string;

//     applicable_for?: string;
//     for_whom?: string;

//     discount?: string;

//     quantity_enabled?: boolean;
//     quantity?: string | number;

//     status?: string;
// }

// interface Props {
//     rows: RuleRow[];
//     onEdit?: (row: RuleRow) => void;
//     onDelete?: (row: RuleRow) => void;
//     isLoading?: boolean;
// }

// type ApplicableFilter =
//     | 'Product'
//     | 'Category'
//     | 'Brand';

// type UserFilter =
//     | 'User'
//     | 'Role';
// console.log("RulesTable component rendered");

// export default function RulesTable({ rows, onEdit, onDelete }: Props) {
//     /**
//      * Filtered rows
//      */
//     const [filteredRows, setFilteredRows] =
//         useState<RuleRow[]>(rows);

//     useEffect(() => {
//         setFilteredRows(rows);
//     }, [rows]);

//     /**
//      * Active tabs
//      */
//     const [applicableFilter, setApplicableFilter] =
//         useState<ApplicableFilter>('Product');

//     const [userFilter, setUserFilter] =
//         useState<UserFilter>('User');

//     /**
//      * Dynamic dropdown options
//      */
//     const applicableOptions = useMemo(() => {
//         const values = rows
//             .filter(
//                 (row) =>
//                     row.applicable_type ===
//                     applicableFilter
//             )
//             .map((row) => row.applicable_value);

//         return Array.from(new Set(values))
//             .filter(Boolean)
//             .map((value) => ({
//                 label: String(value),
//                 value: String(value),
//             }));
//     }, [rows, applicableFilter]);

//     const userOptions = useMemo(() => {
//         const values = rows
//             .filter(
//                 (row) =>
//                     row.user_type === userFilter
//             )
//             .map((row) => row.user_value);

//         return Array.from(new Set(values))
//             .filter(Boolean)
//             .map((value) => ({
//                 label: String(value),
//                 value: String(value),
//             }));
//     }, [rows, userFilter]);

//     /**
//      * Table headers
//      */
//     const headers = {
//         name: {
//             label: __('Name', 'catalogx'),
//             render: (row: RuleRow) => (
//                 <InfoItem title={row.name} />
//             ),
//         },

//         applicable_for: {
//             label: __('Applicable For', 'catalogx'),
//         },

//         for_whom: {
//             label: __('For Whom', 'catalogx'),
//         },

//         discount: {
//             label: __('Discount', 'catalogx'),
//         },
//         quantity: {
//             label: __('Quantity', 'catalogx'),

//             render: (row: RuleRow) =>
//                 row.quantity_enabled
//                     ? row.quantity
//                     : '-',
//         },

//         status: {
//             label: __('Status', 'catalogx'),
//             type: 'status',

//             statusClass: (row: RuleRow) =>
//                 String(row.status).toLowerCase(),
//         },

//         action: {
//             type: 'action',

//             label: __('Action', 'catalogx'),

//             actions: [
//                 {
//                     label: __('Edit', 'catalogx'),
//                     icon: 'edit',

//                     onClick: (row: RuleRow) => {
//                         onEdit?.(row);
//                     },
//                 },

//                 {
//                     label: __('Delete', 'catalogx'),
//                     icon: 'delete',

//                     onClick: (row: RuleRow) => {
//                         onDelete?.(row);
//                         console.log('Delete', row);
//                     },
//                 },
//             ],
//         },
//     };

//     /**
//      * Query update
//      */
//     const handleQueryUpdate = (query: any) => {
//         let updatedRows = [...rows];

//         /**
//          * Search
//          */
//         const searchValue = String(
//             query?.searchValue || ''
//         ).toLowerCase();

//         if (searchValue) {
//             updatedRows = updatedRows.filter((row) =>
//                 Object.values(row).some((value) =>
//                     String(value)
//                         .toLowerCase()
//                         .includes(searchValue)
//                 )
//             );
//         }

//         /**
//          * Applicable filter
//          */
//         const applicableValue =
//             query?.filter?.applicable_filter;

//         if (applicableValue) {
//             updatedRows = updatedRows.filter(
//                 (row) =>
//                     row.applicable_type ===
//                     applicableFilter &&
//                     row.applicable_value ===
//                     applicableValue
//             );
//         }

//         /**
//          * User filter
//          */
//         const userValue =
//             query?.filter?.user_filter;

//         if (userValue) {
//             updatedRows = updatedRows.filter(
//                 (row) =>
//                     row.user_type === userFilter &&
//                     row.user_value === userValue
//             );
//         }

//         setFilteredRows(updatedRows);
//     };

//     console.log('rows');
// console.log('applicableOptions', applicableOptions);
// console.log('userOptions', userOptions);

//     return (
//         <div className="rules-page-wrapper">
//             {/* FILTER TABS */}
//             <div className="rules-filter-section">
//                 {/* LEFT FILTER */}
//                 <div className="rules-filter-group">
//                     <div className="rules-filter-tabs">
//                         {[
//                             'Product',
//                             'Category',
//                             'Brand',
//                         ].map((item) => (
//                             <button
//                                 key={item}
//                                 className={`rules-filter-tab ${applicableFilter ===
//                                         item
//                                         ? 'active'
//                                         : ''
//                                     }`}
//                                 onClick={() =>
//                                     setApplicableFilter(
//                                         item as ApplicableFilter
//                                     )
//                                 }
//                             >
//                                 {item}
//                             </button>
//                         ))}
//                     </div>
//                 </div>

//                 {/* RIGHT FILTER */}
//                 <div className="rules-filter-group">
//                     <div className="rules-filter-tabs">
//                         {['User', 'Role'].map(
//                             (item) => (
//                                 <button
//                                     key={item}
//                                     className={`rules-filter-tab ${userFilter === item
//                                             ? 'active'
//                                             : ''
//                                         }`}
//                                     onClick={() =>
//                                         setUserFilter(
//                                             item as UserFilter
//                                         )
//                                     }
//                                 >
//                                     {item}
//                                 </button>
//                             )
//                         )}
//                     </div>
//                 </div>
//             </div>

//             {/* TABLE */}
//             <TableCard
//                 title={__('Rules', 'catalogx')}
//                 headers={headers}
//                 rows={filteredRows}
//                 totalRows={filteredRows.length}
//                 search={{
//                     placeholder: __(
//                         'Search rules...',
//                         'catalogx'
//                     ),
//                 }}
//                 filters={[
//                     {
//                         key: 'applicable_filter',
//                         label: applicableFilter,
//                         type: 'select',
//                         size: 18,
//                         options: applicableOptions,
//                     },

//                     {
//                         key: 'user_filter',
//                         label: userFilter,
//                         type: 'select',
//                         size: 18,
//                         options: userOptions,
//                     },
//                 ]}
//                 onQueryUpdate={handleQueryUpdate}
//             />
//         </div>
//     );
// }

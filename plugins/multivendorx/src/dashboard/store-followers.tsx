/*global  appLocalizer*/
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { getApiLink, Table, TableCell } from 'zyra';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { formatTimeAgo } from '@/services/commonFunction';

type FollowerRow = {
	date: string;
	id: number;
	name: string;
	email: string;
};

const StoreFollower: React.FC = () => {
	const [data, setData] = useState<FollowerRow[]>([]);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [totalRows, setTotalRows] = useState<number>(0);
	const [pageCount, setPageCount] = useState(0);

	// Fetch total rows on mount
	useEffect(() => {
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'store'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				count: true,
				follower: 'follower',
				store_id: appLocalizer.store_id,
			},
		})
			.then((response) => {
				setTotalRows(response.data || 0);
				setPageCount(Math.ceil(response.data / pagination.pageSize));
			})
			.catch(() => {
				console.log(__('Failed to load total rows', 'multivendorx'));
			});
	}, []);

	useEffect(() => {
		const currentPage = pagination.pageIndex + 1;
		const rowsPerPage = pagination.pageSize;
		requestData(rowsPerPage, currentPage);
		setPageCount(Math.ceil(totalRows / rowsPerPage));
	}, []);

	const requestData = (rowsPerPage: number, currentPage: number) => {
		setData(null);
	
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'store'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				store_id: appLocalizer.store_id,
				page: currentPage,
				row: rowsPerPage,
				follower: 'follower',
			},
		})
			.then((response) => {
				setData(response.data || []);
			})
			.catch((error) => {
				console.error('Store fetch failed:', error);
				setData([]);
			});
	};


	const requestApiForData = (rowsPerPage: number, currentPage: number) => {
		requestData(rowsPerPage, currentPage);
	};

	const columns: ColumnDef<FollowerRow>[] = [
		{
			header: __('Name', 'multivendorx'),
			cell: ({ row }) => <TableCell>{row.original.name}</TableCell>,
		},
		{
			header: __('Email', 'multivendorx'),
			cell: ({ row }) => <TableCell>{row.original.email}</TableCell>,
		},
		{
			header: __('Followed On', 'multivendorx'),
			cell: ({ row }) => {
				return (
					<TableCell title={'date'}>
						{formatTimeAgo(row.original.date)}
					</TableCell>
				);
			},
		},
	];

	return (
		<>
			<div className="page-title-wrapper">
				<div className="page-title">
					<div className="title">
						{__('Store Followers', 'multivendorx')}
					</div>
					<div className="des">
						{__(
							'See all your store followers, engage with them, and grow your loyal customer base.',
							'multivendorx'
						)}
					</div>
				</div>
			</div>

			<div className="admin-table-wrapper">
				<Table
					data={data}
					columns={columns}
					defaultRowsPerPage={10}
					pageCount={pageCount}
					pagination={pagination}
					onPaginationChange={setPagination}
					handlePagination={requestApiForData}
					perPageOption={[10, 25, 50]}
					totalCounts={totalRows}
				/>
			</div>
		</>
	);
};

export default StoreFollower;

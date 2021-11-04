import React from 'react';
import { getToken, getUser } from '../utils/Common';
import Requests from '../utils/requests';
import { KINDOFTOURISM } from '../utils/Constants';
import review from '../fonts/review.png'
import rejected from '../fonts/rejected.png'
import accepted from '../fonts/accepted.png'

import DataTable from 'react-data-table-component'

export default class Dashboard extends React.Component {
	columns = [
		{
			name: 'Название спорт. организации',
			selector: 'group_name',
			sortable: false,
			right: false,
			wrap: true,
			width: "280px",
			center: true
		},
		{
			name: 'Общий регоин',
			selector: 'global_region',
			sortable: false,
			wrap: true,
			center: true
		},
		{
			name: 'Вид туризма',
			selector: 'kind',
			sortable: false,
			cell: row => KINDOFTOURISM[row.kind],
			center: true,
		},
		{
			name: 'Категория сложности',
			selector: 'difficulty_category',
			sortable: false,
			width: "230px",
			center: true
		},
		{
			name: 'Статус',
			selector: 'status',
			sortable: false,
			cell: row => <img height="50px" src={row.status} />,
			center: true
		},
		{
			name: 'Дата начала',
			selector: 'start_date',
			sortable: false,
			center: true,
		},
		{
			name: 'Дата завершения',
			selector: 'end_date',
			sortable: false,
			center: true
		},
	];

	constructor(props) {
		super(props);
		this.user = getUser();
		this.state = {
			error: null,
			isLoaded: false,
			trips: [],
		};
		this.handleLogout = this.handleLogout.bind(this);
	}

	async componentDidMount() {
		let config = {
			headers: {
				Authorization: 'Token ' + getToken() //the token is a variable which holds the token
			}
		};
		const request = new Requests();
		await request.get("http://localhost:8000/api/trips", config)
			.then(
				(result) => {
					this.setState({
						trips: result.data.map(item => {
							item.status = this.renderImage(item.status);
							return item;
						})
					});
				},
				(error) => {
					this.setState({
						isLoaded: true,
						error
					});
				});
	}

	handleLogout(target) {
		// removeUserSession();

		//this.props.history.push(`/review`); не работает
	};

	renderImage(status) {
		if (status === "on_review") {
			return review;
		} else if (status === "rejected") {
			return rejected
		}
		return accepted;
	}
	render() {
		return (
			<DataTable
				columns={this.columns}
				data={this.state.trips}
				subHeaderWrap={false}
				fixedHeader={true}
				onRowClicked={(target) => { this.handleLogout(target) }}
				pagination
				paginationComponentOptions={{
					rowsPerPageText: 'Страница: ',
					rangeSeparatorText: 'из', noRowsPerPage: true,
					selectAllRowsItem: false, selectAllRowsItemText: 'All'
				}}
			/>
		);
	}
}
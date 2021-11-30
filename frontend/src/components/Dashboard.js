import React from 'react';
import { getEmkk, getToken, getUser } from '../utils/Common';
import Requests from '../utils/requests';
import { KINDOFTOURISM } from '../utils/Constants';
import review from '../fonts/review.png';
import rejected from '../fonts/rejected.png';
import accepted from '../fonts/accepted.png';
import DataTable from 'react-data-table-component';

export default class Dashboard extends React.Component {
	addedCoumns = [
		{
			name: 'Руководитель',
			selector: row => row.leader,
			sortable: false,
			center: true,
			wrap: true,
			cell: row => `${row.leader.first_name} ${row.leader.last_name[0]}. ${row.leader.patronymic}.`
		},
		{
			name: 'Локальный район',
			selector: row => row.local_region,
			sortable: false,
			wrap: true,
		}
	]
	columns = [
		{
			name: 'Название спорт. организации',
			selector: row => row.group_name,
			sortable: false,
			center: true,
			wrap: true,
		},
		{
			name: 'Общий регион',
			selector: row => row.global_region,
			sortable: false,
			wrap: true,
		},
		{
			name: 'Вид туризма',
			selector: row => row.kind,
			sortable: true,
			cell: row => KINDOFTOURISM[row.kind],

		},
		{
			name: 'Категория сложности',
			selector: row => row.difficulty_category,
			center: true,
			width: "100px"
		},
		{
			name: 'Статус',
			selector: row => row.status,
			sortable: false,
			center: true,
			cell: row => <img height="50px" src={row.status} alt="status" />,
		},
		{
			name: 'Дата начала',
			selector: row => row.start_date,
			sortable: true,
		},
		{
			name: 'Дата завершения',
			selector: row => row.end_date,
			sortable: false,
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
		this.isMyApps = this.props.isMyApps;
		if (!this.isMyApps) {
			this.columns.splice(0, 0, this.addedCoumns[0]);
			this.columns.splice(2, 0, this.addedCoumns[1]);
		}
		this.onClickOnRow = this.onClickOnRow.bind(this);
	}

	async componentDidMount() {
		const request = new Requests();
		const config = getToken() ? {
			headers: {
				Authorization: 'Token ' + getToken()
			}
		} : {};

		if (this.props.isMyReview) {
			await request.get(`${process.env.REACT_APP_URL}/api/trips/work?available=0`, config)
				.then(result => {
					this.setState({
						trips: result.data.map(item => {
							item.status = this.renderImage(item.status);
							return item;
						})
					});
				})
			return;
		}

		if (this.props.isReview) {
			await request.get(`${process.env.REACT_APP_URL}/api/trips/work?available=1`, config)
				.then(result => {
					this.setState({
						trips: result.data.map(item => {
							item.status = this.renderImage(item.status);
							return item;
						})
					});
				})
			return;
		}

		await request.get(`${process.env.REACT_APP_URL}/api/trips`, config)
			.then(
				(result) => {
					if (this.isMyApps) {
						this.setState({
							trips: result.data.filter(trip => trip.leader.username === this.user).map(item => {
								item.status = this.renderImage(item.status);
								return item;
							})
						});
					} else {
						this.setState({
							trips: result.data.map(item => {
								item.status = this.renderImage(item.status);
								return item;
							})
						});
					}

				},
				(error) => {
					this.setState({
						isLoaded: true,
						error
					});
				});
	}

	onClickOnRow(target) {
		if (!getEmkk()) {
			return;
		}

		if (this.props.isReview) {
			this.props.history.push({
				pathname: '/home/application',
				state: { id: target.id, isReview: this.props.isReview },
			});
		} if (this.props.isMyReview) {
			this.props.history.push({
				pathname: '/home/application',
				state: { id: target.id, isMyReview: this.props.isMyReview },
			});
		} else {
			this.props.history.push({
				pathname: '/home/application',
				state: { id: target.id },
			});
		}


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
				onRowClicked={row => { this.onClickOnRow(row); }}
				pagination
				highlightOnHover
				pointerOnHover
				subHeaderAlign="left"
				noDataComponent="Таблица пустая"
				paginationComponentOptions={{
					rowsPerPageText: 'Страница: ',
					rangeSeparatorText: 'из', noRowsPerPage: true,
					selectAllRowsItem: false
				}}
			/>
		);
	}
}
import React from 'react';
import { getEmkk, getToken, getUser, caseInsensitiveSort } from '../utils/Common';
import Requests from '../utils/requests';
import { KIND_OF_TOURISM } from '../utils/Constants';
import review from '../images/review.png';
import rejected from '../images/rejected.png';
import accepted from '../images/accepted.png';
import DataTable from 'react-data-table-component';


export default class Dashboard extends React.Component {

	addedCoumns = [
		{
			name: 'Руководитель',
			selector: row => row.leader,
			center: true,
			wrap: true,
			sortable: true,
			sortFunction: caseInsensitiveSort,
			cell: row => `${row.leader.first_name} ${row.leader.last_name[0]}. ${row.leader.patronymic}.`
		},
		{
			name: 'Локальный район',
			selector: row => row.local_region,
			sortable: false,
			wrap: true,
			sortable: true,
		}
	]

	columns = [
		{
			name: 'Название спорт. организации',
			selector: row => row.group_name,
			sortable: false,
			center: true,
			wrap: true,
			sortable: true,
		},
		{
			name: 'Общий регион',
			selector: row => row.global_region,
			wrap: true,
			sortable: true,
		},
		{
			name: 'Вид туризма',
			selector: row => row.kind,
			sortable: true,
			cell: row => KIND_OF_TOURISM[row.kind],

		},
		{
			name: 'Категория сложности',
			selector: row => row.difficulty_category,
			center: true,
			width: "100px",
			sortable: true,
		},
		{
			name: 'Статус',
			selector: row => row.status,
			sortable: true,
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
			sortable: true,
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

		if (this.props.isMyReview || this.props.isReview) {
			await request.get(`${process.env.REACT_APP_URL}/api/trips/work?available=${this.props.isReview ? 1 : 0}`, config)
				.then(result => {
					this.setState({
						trips: result.data.map(item => {
							item.status = this.renderImage(item.status);
							return item;
						})
					});
				})
		} else {
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



	}

	onClickOnRow(target) {
		// if (!getEmkk() || (target.leader.username !== getUser() && !this.props.isReview && !this.props.isMyReview)) {
		// 	return;
		// }
		let state = {};
		const id = target.id;
		if (this.props.isReview) {
			state = { id: id, isReview: this.props.isReview }
		} else if (this.props.isMyReview) {
			state = { id: id, isMyReview: this.props.isMyReview }
		} else {
			state = { id: id }
		}

		this.props.history.push({
			pathname: '/home/application',
			state: state,
		});

	};



	renderImage(status) {
		if (status === "on_review" || status == "at_issuer") {
			return review;
		} else if (status === "rejected") {
			return rejected;
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
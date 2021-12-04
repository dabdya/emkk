import React from 'react';
import { getEmkk, getToken, getUser, caseInsensitiveSort, getReviewer } from '../utils/Common';
import Requests from '../utils/requests';
import { KIND_OF_TOURISM } from '../utils/Constants';
import review from '../images/review.png';
import rejected from '../images/rejected.png';
import accepted from '../images/accepted.png';
import at_issuer from '../images/at_issuer.png';
import DataTable from 'react-data-table-component';


export default class Dashboard extends React.Component {

	addedColumns = [
		{
			name: 'Руководитель',
			selector: row => row.leader,
			center: true,
			wrap: true,
			sortable: true,
			sortFunction: caseInsensitiveSort,
			cell: row => `${row.leader.first_name} ${row.leader.last_name[0]}. ${row.leader?.patronymic && row.leader.patronymic[0]}.`
		},
		{
			name: 'Локальный район',
			selector: row => row.local_region,
			wrap: true,
			sortable: true,
		}
	]

	columns = [
		{
			name: 'Организация',
			selector: row => row.group_name,
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
		this._isMounted = false;
		this.user = getUser();
		this.state = {
			error: null,
			isLoaded: false,
			trips: [],
		};
		this.isMyApps = this.props.isMyApps;
		if (!this.isMyApps) {
			this.columns.splice(0, 0, this.addedColumns[0]);
			this.columns.splice(2, 0, this.addedColumns[1]);
		}
		this.onClickOnRow = this.onClickOnRow.bind(this);
	}

	componentDidMount() {
		const request = new Requests();
		const config = getToken() ? {
			headers: {
				Authorization: 'Token ' + getToken()
			}
		} : {};

		this._isMounted = true;

		if (this.props.isMyReview) {
			request.get(`${process.env.REACT_APP_URL}/api/trips?filter=work`, config)
				.then(result => {
					this._isMounted && this.setState({
						trips: result.data.map(item => {
							item.status = this.renderImage(item.status);
							return item;
						})
					});
				})
		} else {
			request.get(`${process.env.REACT_APP_URL}/api/trips${this.isMyApps ? "?filter=my" : ""}`, config)
				.then(
					(result) => {
						this._isMounted && this.setState({
							trips: result.data.map(item => {
								item.status = this.renderImage(item.status);
								return item;
							})
						});
					},
					(error) => {
						this._isMounted && this.setState({
							isLoaded: true,
							error
						});
					});
		}
	}

	componentWillUnmount() {
		this._isMounted = false;
	}

	onClickOnRow(target) {
		if ((!getEmkk() || target.leader.username !== getUser()) && !getReviewer()) {
			return;
		}
		const id = target.id;
		const state = this.props.isMyReview ? { id: id, isMyReview: this.props.isMyReview } : { id: id };

		this.props.history.push({
			pathname: '/home/application',
			state: state,
		});

	};



	renderImage(status) {
		if (status === "on_review") {
			return review;
		} else if (status === "rejected") {
			return rejected;
		} else if (status === "at_issuer") {
			return at_issuer;
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
				highlightOnHover={getEmkk()}
				pointerOnHover={getEmkk()}
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
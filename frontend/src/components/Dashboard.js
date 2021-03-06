import React from "react";
import DataTable from "react-data-table-component";
import { withRouter } from "react-router-dom";
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { getUser, caseInsensitiveSort } from "../utils/Common";
import request from "../utils/requests";
import { KIND_OF_TOURISM } from "../utils/Constants";
import review from "../images/review.png";
import rejected from "../images/rejected.png";
import accepted from "../images/accepted.png";
import at_issuer from "../images/at_issuer.png";
import rework from "../images/rework.png";
import on_route from "../images/on_route.png";
import take_papers from "../images/take_papers.png";
import alarm from "../images/alarm.png";
import route_completed from "../images/route_completed.png";



class Dashboard extends React.Component {

	addedColumns = [
		{
			name: "Руководитель",
			selector: row => row.leader,
			center: true,
			wrap: true,
			sortable: true,
			sortFunction: caseInsensitiveSort,
			cell: row => `${row.leader.first_name} ${row.leader.last_name[0]}. ${row.leader.patronymic ? row.leader.patronymic[0] + "." : ""}`
		},
		{
			name: "Локальный район",
			selector: row => row.local_region,
			wrap: true,
			sortable: true,
		}
	]

	columns = [
		{
			name: "Организация",
			selector: row => row.group_name,
			center: true,
			wrap: true,
			sortable: true,
		},
		{
			name: "Общий регион",
			selector: row => row.global_region,
			wrap: true,
			sortable: true,
		},
		{
			name: "Вид туризма",
			selector: row => row.kind,
			sortable: true,
			cell: row => KIND_OF_TOURISM[row.kind],

		},
		{
			name: "Категория сложности",
			selector: row => row.difficulty_category,
			center: true,
			width: "160px",
			sortable: true,
		},
		{
			name: "Статус",
			selector: row => row.status,
			sortable: true,
			center: true,
			cell: row => <img height="50px" src={row.status} alt="status" />,
		},
		{
			name: "Дата начала",
			selector: row => row.start_date,
			sortable: true,
		},
		{
			name: "Дата завершения",
			selector: row => row.end_date,
			sortable: true,
		},
	];


	constructor(props) {
		super(props);
		this.user = getUser();
		this.state = { trips: [], };
		this.isMyApps = this.props.isMyApps;
		if (!this.isMyApps) {
			this.columns.splice(0, 0, this.addedColumns[0]);
			this.columns.splice(2, 0, this.addedColumns[1]);
		}
		this.onClickOnRow = this.onClickOnRow.bind(this);
		this.filter = this.filter.bind(this);
		this.updateTrips = this.updateTrips.bind(this);
	}

	async componentDidMount() {
		const url = this.props.isMyReview ? "/api/trips?filter=work" : `/api/trips${this.isMyApps ? "?filter=my" : ""}`;
		const data = (await request.get(url)).data;
		this.updateTrips(data)
	}

	updateTrips(data) {
		this.setState({
			trips: data.map(item => {
				item.status = this.getImage(item.status);
				return item;
			})
		});
	}

	onClickOnRow(target) {
		if (this.props.roles.secretary) {
			this.props.history.push(`/home/application/${target.id}`);
			return;
		}

		if ((!this.props.roles.emkkMember || target.leader.username !== getUser()) && !this.props.roles.reviewer && !this.props.roles.issuer) {
			return;
		}
		this.props.history.push(`/home/application/${target.id}`);

	};

	async filter(e) {
		const url = e.target.value === "all" ? "/api/trips?filter=work" : "/api/trips?filter=unreviewed";
		const data = (await request.get(url)).data;
		this.updateTrips(data)
	}


	getImage(status) {
		if (status === "on_review") {
			return review;
		} else if (status === "rejected") {
			return rejected;
		} else if (status === "at_issuer") {
			return at_issuer;
		} else if (status === "on_rework") {
			return rework;
		} else if (status === "on_route") {
			return on_route;
		} else if (status === "take_papers") {
			return take_papers;
		} else if (status === "alarm") {
			return alarm;
		} else if (status === "route_completed") {
			return route_completed;
		}
		return accepted;
	}

	render() {
		return (
			<div id="dashboard">
				<DataTable
					columns={this.columns}
					data={this.state.trips}
					subHeaderWrap={false}
					fixedHeader={true}
					onRowClicked={row => { this.onClickOnRow(row); }}
					pagination
					highlightOnHover={this.props.roles.emkkMember}
					pointerOnHover={this.props.roles.emkkMember}
					subHeaderAlign="left"
					noDataComponent="Таблица пустая"
					paginationComponentOptions={{
						rowsPerPageText: "Страница: ",
						rangeSeparatorText: "из",
						selectAllRowsItem: true,
						selectAllRowsItemText: "Все"
					}}
				/>
				{this.props.isMyReview &&
					<ToggleButtonGroup
						exclusive
						onChange={this.filter}
						style={{ marginLeft: 40 }}
					>
						<ToggleButton value="all" >
							Все
						</ToggleButton>
						<ToggleButton value="my">
							Без моей рецензии
						</ToggleButton>
					</ToggleButtonGroup>}
				<div className="legend">
					<div className="flex">
						<img height="50px" width="50px" src={accepted} alt="accepted" />
						<p> - Заявка одобрена</p>
					</div>
					<div className="flex">
						<img height="50px" width="50px" src={at_issuer} alt="at_issuer" />
						<p> - Заявка у выпускающего</p>
					</div>
					<div className="flex">
						<img height="50px" width="50px" src={review} alt="review" />
						<p> - Заявка на рецензии</p>
					</div>
					<div className="flex">
						<img height="50px" width="50px" src={rework} alt="rework" />
						<p>- Заявка на доработке</p>
					</div>
					<div className="flex">
						<img height="50px" width="50px" src={rejected} alt="rejected" />
						<p> - Заявка отклонена</p>
					</div>
				</div>
				<div className="legend">
					<div className="flex">
						<img height="50px" src={on_route} alt="on_route" />
						<p>- На маршруте</p>
					</div>
					<div className="flex">
						<img height="50px" src={take_papers} alt="take_papers" />
						<p> - Документы готовы</p>
					</div>
					<div className="flex">
						<img height="50px" src={route_completed} alt="route_completed" />
						<p>- Маршрут завершён</p>
					</div>
					<div className="flex">
						<img height="50px" width="50px" src={alarm} alt="alarm" />
						<p>- Аварийная ситуация</p>
					</div>
				</div>
			</div>
		);
	}
}

export default withRouter(Dashboard);

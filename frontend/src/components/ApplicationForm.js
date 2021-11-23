import React from 'react';
import { GLOBALAREA } from '../utils/Constants';
import { Autocomplete, TextField } from '@mui/material'


export default class ApplicationForm extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			groupName: "Ivan",
			leaderFullName: "Ivan", // не нужен
			generalArea: "Поиск...	",
			localArea: "Ivan",
			routeStartDate: new Date(),
			routeEndDate: new Date(),
			controlStartDate: new Date(),
			controlEndDate: new Date(),
			controlStartRegion: "деревня Хлопинки",
			controlEndRegion: "деревня икниплоХ",
			routeBook: null,
			cartographicMaterial: null,
			participantsReferences: null,
			insurancePolicyScans: null,
			routeDifficulty: 1,
			participantsNumber: 1,
			tourismKind: null,
			coordinatorName: "1", // два поля: имя координатора и его телефон. Было одно -- coordinatorInfo
			coordinatorPhoneNumber: "1",
			insuranceCompanyName: "1",
			insurancePolicyValidityDuration: new Date(),
			buttonIsPressed: false
		};

		this.open = this.open.bind(this);
		this.close = this.close.bind(this);
	}


	async onSubmit(event) {
	}

	close = () => {
		this.setState(() => ({ buttonIsPressed: false }))
		window.location.href = '/';
	}

	open = () => {
		this.setState(() => ({ buttonIsPressed: true }))
	}

	render() {
		const tourismVariants = ["Пеший", "Лыжный", "Водный", "Горный", "Пеше-водный",
			"Спелео", "Велотуризм", "Парусный", "Конный", "Авто-мото"];
		return (
			<form className="application" style={{
				display: "grid",
				gridTemplateColumns: "auto auto",
				gridColumnGap: "0px",
				gridRowGap: "10px",
			}}>
				<div className="cell">
					<TextField
						required
						id="outlined"
						label="Название спортивной организации"
						style={{ width: '100%' }}
						InputProps={{ inputProps: { tabIndex: "1" } }}
						variant="filled"
					/>
				</div>
				<div className="cell">
					<TextField
						required
						id="outlined"
						label="Координатор"
						style={{ width: '100%' }}
						variant="filled"
					/>
				</div>
				<div className="cell">
					<Autocomplete
						openOnFocus
						id="combo-box-demo"
						options={GLOBALAREA}
						style={{ width: '100%' }}
						renderInput={(params) => <TextField {...params} inputProps={{ ...params.inputProps, tabIndex: 2 }}
							label="Общий район" />}

					/>
				</div>
				<div className="cell">
					<TextField
						required
						id="outlined"
						label="Населённый пункт начала маршрута"
						style={{ width: '100%' }}
					/>
				</div>
				<div className="cell">
					<TextField
						required
						id="outlined"
						label="Локальный район"
						style={{ width: '100%' }}
						InputProps={{ inputProps: { tabIndex: "3" } }}
					/>
				</div>
				<div className="cell">
					<TextField
						id="outlined"
						label="Контрольный срок сообщения о начале маршрута"
						type="date"
						style={{ width: '100%' }}
						InputLabelProps={{
							shrink: true
						}}
					/>
				</div>
				<div className="cell">
					<label >sdsdgdsg</label>
					<input />
				</div>
			</form >
		)
	}

}
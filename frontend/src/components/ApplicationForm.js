import React from "react";
import { withRouter } from "react-router-dom";
import ShowModal from "./ShowModal"
import { GLOBAL_AREA, KIND_OF_TOURISM } from "../utils/Constants";
import request from "../utils/requests"
import HelpIcon from "@mui/icons-material/Help";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import { Autocomplete, TextField, Button } from "@mui/material"
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

class ApplicationForm extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			buttonIsPressed: false,
			routeBookCount: 0,
			cartographicMaterialCount: 0,
			participantsReferencesCount: 0,
			insurancePolicyScansCount: 0,
		};
		this.app = {
			group_name: "",
			global_region: "",
			local_region: "",
			start_date: null,
			end_date: null,
			control_start_date: "",
			control_end_date: "",
			control_start_region: "",
			control_end_region: "",
			difficulty_category: 0,
			participants_count: 0,
			kind: null,
			coordinator_name: "",
			coordinator_phone_number: "",
			insurance_company_name: "",
			insurance_number: "",
			insurance_policy_validity_duration: null,
			files: [],
		}


		this.open = this.open.bind(this);
		this.close = this.close.bind(this);
		this.uploadFile = this.uploadFile.bind(this);
		this.changeInputRegister = this.changeInputRegister.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
		this.handleTag = this.handleTag.bind(this);
	}


	async onSubmit(event) {
		event.preventDefault()
		const { files, ...rest } = this.app;

		if (!rest.control_start_date) {
			rest.control_start_date = rest.start_date;
		}
		if (!rest.control_end_date) {
			rest.control_end_date = rest.end_date;
		}

		await request.post("/api/trips", rest)
			.then(respForm => {
				this.open();

				const form = new FormData();
				for (const file of this.app.files) {
					form.append("file", file);
				}
				request.post(`/api/trips/${respForm.data.id}/documents`, form);
			});
	}

	changeInputRegister(event) {
		event.persist();

		this.app[event.target.name] = event.target.value;
	};

	handleTag(value, fieldName) {

		if (fieldName === "kind") {
			this.app[fieldName] = KIND_OF_TOURISM[value];
		} else {
			this.app[fieldName] = value;
		}
	};

	close() {
		this.setState({ buttonIsPressed: false })
		this.props.history.push("/");
	}

	uploadFile(event) {
		const filesArr = Array.prototype.slice.call(event.target.files);
		this.app.files = [...this.app.files, ...filesArr]
	}

	open() {
		this.setState({ buttonIsPressed: true })
	}

	render() {
		const tourismVariants = ["??????????", "????????????", "????????????", "????????????", "????????-????????????",
			"????????????", "????????????????????", "????????????????", "????????????", "????????-????????"];
		return (
			<form className="application"
				onSubmit={this.onSubmit}>
				<div className="cell">
					<TextField
						required
						fullWidth
						id="group_name"
						name="group_name"
						label="???????????????? ???????????????????? ??????????????????????"
						InputProps={{ inputProps: { tabIndex: 1, autoComplete: "off" } }}
						variant="filled"
						onChange={this.changeInputRegister}
					/>
				</div>
				<div className="cell">
					<TextField
						required
						fullWidth
						id="coordinator_name"
						name="coordinator_name"
						label="?????? ????????????????????????"
						InputProps={{ inputProps: { tabIndex: 12, autoComplete: "off" } }}
						variant="filled"
						onChange={this.changeInputRegister}
					/>
				</div>
				<div className="cell">
					<Autocomplete
						openOnFocus
						fullWidth
						id="global_region"
						options={GLOBAL_AREA}
						onInputChange={(_, value) => this.handleTag(value, "global_region")}
						renderInput={(params) =>
							<TextField {...params}
								variant="filled"
								inputProps={{ ...params.inputProps, tabIndex: 2 }}
								label="?????????? ??????????"
								required />}
					/>
				</div>
				<div className="cell">
					<TextField
						required
						fullWidth
						id="coordinator_phone_number"
						type="tel"
						name="coordinator_phone_number"
						label="???????????????????? ?????????????? ????????????????????????"
						placeholder="+799999999999 ?????? 89999999999"
						variant="filled"
						InputProps={{ inputProps: { tabIndex: 13, pattern: "\\+?[78][0-9]{10}", autoComplete: "off" } }}
						onChange={this.changeInputRegister}
					/>
				</div>
				<div className="cell">
					<TextField
						required
						fullWidth
						id="local_region"
						label="?????????????????? ??????????"
						name="local_region"
						InputProps={{ inputProps: { tabIndex: 3, autoComplete: "off" } }}
						variant="filled"
						onChange={this.changeInputRegister}
					/>
				</div>
				<div className="cell">
					<TextField
						required
						fullWidth
						id="control_start_region"
						name="control_start_region"
						label="???????????????????? ?????????? ???????????? ????????????????"
						variant="filled"
						InputProps={{ inputProps: { tabIndex: 14, autoComplete: "off" } }}
						onChange={this.changeInputRegister}
					/>
				</div>
				<div className="cell">
					<Autocomplete
						openOnFocus
						fullWidth
						id="difficulty_category"
						options={["1", "2", "3", "4", "5", "6"]}
						onInputChange={(_, value) => this.handleTag(value, "difficulty_category")}
						renderInput={(params) =>
							<TextField {...params}
								variant="filled"
								inputProps={{ ...params.inputProps, tabIndex: 4 }}
								label="?????????????????? ??????????????????" required />}
					/>
				</div>
				<div className="cell">
					<TextField
						fullWidth
						id="control_start_date"
						label="?????????????????????? ???????? ?????????????????? ?? ???????????? ????????????????"
						name="control_start_date"
						type="date"
						InputProps={{ inputProps: { tabIndex: 15 } }}
						InputLabelProps={{ shrink: true }}
						variant="filled"
						onChange={this.changeInputRegister}
					/>
				</div>
				<div className="cell">
					<Autocomplete
						openOnFocus
						fullWidth
						id="kind"
						options={tourismVariants}
						onInputChange={(_, value) => this.handleTag(value, "kind")}
						renderInput={(params) =>
							<TextField {...params}
								variant="filled"
								inputProps={{ ...params.inputProps, tabIndex: 5 }}
								label="?????? ??????????????"
								required />}

					/>
				</div>
				<div className="cell">
					<TextField
						required
						fullWidth
						id="control_end_region"
						label="???????????????????? ?????????? ?????????????????? ????????????????"
						name="control_end_region"
						InputProps={{ inputProps: { tabIndex: 16, autoComplete: "off" } }}
						variant="filled"
						onChange={this.changeInputRegister}
					/>
				</div>
				<div className="cell">
					<TextField
						required
						fullWidth
						id="start_date"
						label="???????? ???????????? ???? ??????????????"
						name="start_date"
						type="date"
						variant="filled"
						InputProps={{ inputProps: { tabIndex: 6 } }}
						InputLabelProps={{ shrink: true }}
						onChange={this.changeInputRegister}
					/>
				</div>
				<div className="cell">
					<TextField
						fullWidth
						id="control_end_date"
						label="?????????????????????? ???????? ?????????????????? ???? ?????????????????? ????????????????"
						name="control_end_date"
						type="date"
						variant="filled"
						InputProps={{ inputProps: { tabIndex: 17 } }}
						InputLabelProps={{ shrink: true }}
						onChange={this.changeInputRegister}
					/>
				</div>
				<div className="cell">
					<TextField
						required
						fullWidth
						id="end_date"
						label="???????? ???????????? ?? ????????????????"
						name="end_date"
						type="date"
						variant="filled"
						InputProps={{ inputProps: { tabIndex: 7 }, autoComplete: "off" }}
						InputLabelProps={{
							shrink: true
						}}
						onChange={this.changeInputRegister}
					/>
				</div>
				<div className="cell">
					<div className="cell-file">
						<label className="custom-file-upload">
							<input type="file" multiple
								onChange={(event) => {
									this.uploadFile(event);
									this.setState({ routeBookCount: this.state.routeBookCount + event.target.files.length })
								}} />
							?????????????????? ???????????????????? ????????????
						</label>
						<Tooltip
							placement="top-start"
							tabIndex={18}
							title="???????????? ?????????? ??????????:
							??????_??????????_??????????????????????????????_??????????_??????????????????. ???????????????? ?? ?????????????? pdf, doc/docx, xls/xlsx">
							<IconButton>
								<HelpIcon />
							</IconButton>
						</Tooltip>
					</div>
					{this.state.routeBookCount >= 1 && `?????????????????? ????????????: ${this.state.routeBookCount}`}
				</div>
				<div className="cell">
					<TextField
						required
						fullWidth
						id="participants_count"
						name="participants_count"
						label="???????????????????? ????????????????????"
						variant="filled"
						InputProps={{ inputProps: { tabIndex: 8, pattern: "[0-9]+", autoComplete: "off" } }}
						onChange={this.changeInputRegister}
					/>
				</div>
				<div className="cell">
					<div className="cell-file">
						<label className="custom-file-upload">
							<input type="file" multiple
								onChange={(event) => {
									this.uploadFile(event);
									this.setState({ cartographicMaterialCount: this.state.cartographicMaterialCount + event.target.files.length })
								}} />
							?????????????????? ???????????????????????????????? ????????????????
						</label>
						<Tooltip
							placement="top-start"
							tabIndex={19}
							title="???????????? ?????????? ??????????:
							??????_??????????_??????????????????????????????_??????????_??????????????????_??????????">
							<IconButton>
								<HelpIcon />
							</IconButton>
						</Tooltip>
					</div>
					{this.state.cartographicMaterialCount >= 1 && `?????????????????? ????????????: ${this.state.cartographicMaterialCount}`}
				</div>
				<div className="cell">
					<TextField
						required
						fullWidth
						id="insurance_company_name"
						label="???????????????????????? ?????????????????? ????????????????"
						name="insurance_company_name"
						variant="filled"
						InputProps={{ inputProps: { tabIndex: 9, autoComplete: "off" } }}
						onChange={this.changeInputRegister}
					/>
				</div>
				<div className="cell">
					<div className="cell-file">
						<label className="custom-file-upload">
							<input type="file" multiple
								onChange={(event) => {
									this.uploadFile(event);
									this.setState({ participantsReferencesCount: this.state.participantsReferencesCount + event.target.files.length })
								}} />
							?????????????????? ?????????????? ????????????????????
						</label>
						<Tooltip
							placement="top-start"
							tabIndex={20}
							title="?????????????? ????????????????????">
							<IconButton>
								<HelpIcon />
							</IconButton>
						</Tooltip>
					</div>
					{this.state.participantsReferencesCount >= 1 && `?????????????????? ????????????: ${this.state.participantsReferencesCount}`}
				</div>
				<div className="cell">
					<TextField
						required
						fullWidth
						id="insurance_number"
						label="?????????? ????????????"
						name="insurance_number"
						variant="filled"
						InputProps={{ inputProps: { tabIndex: 10, autoComplete: "off" } }}
						onChange={this.changeInputRegister}
					/>
				</div>

				<div className="cell">
					<div className="cell-file">
						<label className="custom-file-upload" >
							<input type="file" multiple
								onChange={(event) => {
									this.uploadFile(event);
									this.setState({ insurancePolicyScansCount: this.state.insurancePolicyScansCount + event.target.files.length })
								}} />
							?????????????????? ?????????? ?????????????????? ??????????????
						</label>
						<Tooltip
							placement="top-start"
							tabIndex={20}
							title="???????????? ?????????? ??????????:
							??????_??????????_??????????????????????????????_??????????_??????????????????_????????????">
							<IconButton>
								<HelpIcon />
							</IconButton>
						</Tooltip>
					</div>
					{this.state.insurancePolicyScansCount >= 1 && `?????????????????? ????????????: ${this.state.insurancePolicyScansCount}`}
				</div>
				<div className="cell">
					<TextField
						required
						fullWidth
						id="insurance_policy_validity_duration"
						label="???????? ?????????????????? ?????????????????? ??????????????"
						name="insurance_policy_validity_duration"
						type="date"
						variant="filled"
						InputProps={{ inputProps: { tabIndex: 11 } }}
						InputLabelProps={{ shrink: true }}
						onChange={this.changeInputRegister}
					/>
				</div>
				<div className="cell">
					<Button variant="contained" endIcon={<AssignmentTurnedInIcon />}
						type="submit"
						tabIndex={21}
						style={{ marginRight: "1.75rem", width: "90%", backgroundColor: "#136DAB" }}
					>?????????????????? ????????????</Button>
				</div>
				{this.state.buttonIsPressed && <ShowModal header="????????" close={this.close} message="???????????? ????????????!" />}
			</form >
		)
	}
}

export default withRouter(ApplicationForm);
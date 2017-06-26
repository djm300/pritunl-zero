/// <reference path="../References.d.ts"/>
import * as React from 'react';
import Styles from '../Styles';
import * as UserActions from '../actions/UserActions';
import * as UserTypes from '../types/UserTypes';
import UserStore from '../stores/UserStore';
import Page from './Page';
import PageHeader from './PageHeader';
import PagePanel from './PagePanel';
import PageInput from './PageInput';
import PageInputButton from './PageInputButton';
import PageSwitch from './PageSwitch';
import PageSave from './PageSave';

interface Props {
	userId: string;
}

interface State {
	changed: boolean;
	disabled: boolean;
	message: string;
	addRole: string;
	user: UserTypes.User;
}

const css = {
	role: {
		margin: '9px 5px 0 5px',
		height: '20px',
	} as React.CSSProperties,
};

export default class UserDetailed extends React.Component<Props, State> {
	constructor(props: any, context: any) {
		super(props, context);
		this.state = {
			changed: false,
			disabled: false,
			message: '',
			addRole: '',
			user: UserStore.user,
		};
	}

	componentDidMount(): void {
		UserActions.load(this.props.userId);
		UserStore.addChangeListener(this.onChange);
	}

	componentWillUnmount(): void {
		UserActions.unload();
		UserStore.removeChangeListener(this.onChange);
	}

	onChange = (): void => {
		this.setState({
			...this.state,
			user: UserStore.user,
		});
	}

	onSave = (): void => {
		this.setState({
			...this.state,
			disabled: true,
		});
		UserActions.commit(this.state.user).then((): void => {
			this.setState({
				...this.state,
				message: 'Your changes have been saved',
				changed: false,
				disabled: false,
			})
		});
	}

	set = (name: string, val: any): void => {
		let user = {
			...this.state.user,
		} as any;

		user[name] = val;

		this.setState({
			...this.state,
			changed: true,
			message: '',
			user: user,
		});
	}

	onAddRole = (): void => {
		let roles = this.state.user.roles.slice(0);

		if (roles.indexOf(this.state.addRole) === -1) {
			roles.push(this.state.addRole);
		}

		this.setState({
			...this.state,
			changed: true,
			message: '',
			addRole: '',
			user: {
				...this.state.user,
				roles: roles,
			},
		});
	}

	onRemoveRole = (role: string): void => {
		let roles = this.state.user.roles.slice(0);

		let i = roles.indexOf(role);
		if (i === -1) {
			return;
		}

		roles.splice(i, 1);

		this.setState({
			...this.state,
			changed: true,
			message: '',
			addRole: '',
			user: {
				...this.state.user,
				roles: roles,
			},
		});
	}

	render(): JSX.Element {
		let user = this.state.user;
		if (!user) {
			return <div/>;
		}

		let roles: JSX.Element[] = [];
		for (let role of user.roles) {
			roles.push(
				<div
					className="pt-tag pt-tag-removable pt-intent-primary"
					style={css.role}
				>
					{role}
					<button
						className="pt-tag-remove"
						onClick={(): void => {
							this.onRemoveRole(role);
						}}
					/>
				</div>
			);
		}

		return <Page>
			<PageHeader title="User Info"/>
			<div className="layout horizontal wrap">
				<PagePanel className="layout vertical">
					<PageInput
						label="Username"
						type="text"
						placeholder="Enter username"
						value={user.username}
						onChange={(val): void => {
							this.set('username', val);
						}}
					/>
					<PageInput
						label="Password"
						type="password"
						placeholder="Change password"
						value={user.password}
						onChange={(val): void => {
							this.set('password', val);
						}}
					/>
					<PageSwitch
						label="Administrator"
						checked={user.administrator === 'super'}
						onToggle={(): void => {
							if (user.administrator === 'super') {
								this.set('administrator', '');
							} else {
								this.set('administrator', 'super');
							}
						}}
					/>
				</PagePanel>
				<PagePanel>
					<label className="pt-label">
						Roles
						<div>
							{roles}
						</div>
					</label>
					<PageInputButton
						label="Add"
						type="text"
						placeholder="Add role"
						value={this.state.addRole}
						onChange={(val): void => {
							this.setState({
								...this.state,
								addRole: val,
							});
						}}
						onSubmit={this.onAddRole}
					/>
				</PagePanel>
			</div>
			<PageSave
				message={this.state.message}
				changed={this.state.changed}
				disabled={this.state.disabled}
				onCancel={(): void => {
					this.setState({
						...this.state,
						changed: false,
						message: 'Your changes have been discarded',
						addRole: '',
						user: UserStore.user,
					});
				}}
				onSave={this.onSave}
			/>
		</Page>;
	}
}
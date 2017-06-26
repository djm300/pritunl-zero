/// <reference path="../References.d.ts"/>
import Dispatcher from '../dispatcher/Dispatcher';
import * as Events from 'events';
import * as UserTypes from '../types/UserTypes';
import * as GlobalTypes from '../types/GlobalTypes';

class UsersStore extends Events.EventEmitter {
	_users: UserTypes.Users = [];
	_page: number;
	_pageCount: number;
	_count: number;
	_token = Dispatcher.register((this._callback).bind(this));

	get users(): UserTypes.Users {
		return this._users;
	}

	get page(): number {
		return this._page || 0;
	}

	get pageCount(): number {
		return this._pageCount || 50;
	}

	get count(): number {
		return this._count || 0;
	}

	emitChange(): void {
		this.emit(GlobalTypes.CHANGE);
	}

	addChangeListener(callback: () => void): void {
		this.on(GlobalTypes.CHANGE, callback);
	}

	removeChangeListener(callback: () => void): void {
		this.removeListener(GlobalTypes.CHANGE, callback);
	}

	_traverse(page: number): void {
		this._page = page;
	}

	_sync(users: UserTypes.Users, count: number): void {
		this._count = count;
		this._users = users;
		this.emitChange();
	}

	_callback(action: UserTypes.UserDispatch): void {
		switch (action.type) {
			case UserTypes.TRAVERSE:
				this._traverse(action.data.page);
				break;

			case UserTypes.SYNC:
				this._sync(action.data.users, action.data.count);
				break;
		}
	}
}

export default new UsersStore();
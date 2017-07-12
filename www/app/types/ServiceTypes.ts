/// <reference path="../References.d.ts"/>
export const SYNC = 'service.sync';
export const TRAVERSE = 'service.traverse';
export const FILTER = 'service.filter';
export const CHANGE = 'service.change';

export interface Service {
	id: string;
	name?: string;
}

export type Services = Service[];

export type ServiceRo = Readonly<Service>;
export type ServicesRo = ReadonlyArray<ServiceRo>;

export interface ServiceDispatch {
	type: string;
	data?: {
		id?: string;
		service?: Service;
		services?: Services;
	};
}
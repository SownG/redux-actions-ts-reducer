import { ActionFunctions, handleActions, Reducer, ReducerMap, ReducerMapValue } from 'redux-actions';

type ActionTypeOrActionCreator<P> = ActionFunctions<P> | string;

/**
 * @type S - State that all reducer functions (combined with this class) should use.
 * @type Payload - Payload for actions - type will be updated based on added reducer function action types on returned object type
 */
export class ReducerFactory<S, Payload = never> {
	private reducerMap: ReducerMap<S, Payload> = {};

	public constructor(private state: S) {
	}

	/**
	 * When using this method overload, reducers state parameter and return type are inferred.
	 * See other overloads that also infer action payload type (or provide it for this method manually as generic type parameter).
	 * @type P - action payload type (`void` by default that effectively prevents using reducer action payload unless payload type is mentioned with generic parameter type)
	 */
	public addReducer<P = void>(actionType: string, reducer: Reducer<S, P>): ReducerFactory<S, Payload | P>;
	/**
	 * When using this method overload, then reducer action type is also inferred
	 * (in addition to reducer state type for state parameter and return type).
	 * @type P - action payload type
	 */
	public addReducer<P>(actionCreator: ActionFunctions<P>, reducer: Reducer<S, P>): ReducerFactory<S, Payload | P>;
	public addReducer<P>(actionTypeOrActionCreator: ActionTypeOrActionCreator<P>, reducer: Reducer<S, P>) {
		return this.addReducerInternal(actionTypeOrActionCreator, reducer);
	}

	/**
	 * Usually it is easier and safer to use `addReducer(...)` methods instead of this method,
	 * but sometimes it can become useful - for example when You can generate reducers for some actions automatically
	 * (for example table paging/sorting/filtering related reducers)
	 */
	public addReducers<P>(anotherReducerMap: ReducerMap<S, P>) {
		for (const actionType in anotherReducerMap) {
			const reducerFunction = anotherReducerMap[actionType];
			this.addReducerInternal(actionType, reducerFunction);
		}
		return this.asAllowingPayload<P>();
	}

	private addReducerInternal<P>(actionTypeOrActionCreator: ActionTypeOrActionCreator<P>, reducer: ReducerMapValue<S, P>) {
		const reducerMap: ReducerMap<S, Payload | P> = this.reducerMap;
		reducerMap[actionTypeOrActionCreator.toString()] = reducer;
		return this.asAllowingPayload<P>();
	}

	/**
	 * Simply returns `this`
	 * (but return type is improved, so that `P` is included in allowed `Payload` type)
	 */
	protected asAllowingPayload<P>(): ReducerFactory<S, Payload | P> {
		return this;
	}

	/**
	 * creates Redux reducer that can be used to create Redux store
	 */
	public toReducer(): Reducer<S, Payload> {
		return handleActions(this.reducerMap, this.state);
	}
}

import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route } from 'react-router-dom';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import { render } from '@testing-library/react';
import { rootReducer } from '../store/reducers';

export function createTestStore(preloadedState) {
  return createStore(rootReducer, preloadedState, applyMiddleware(thunk));
}

export function renderWithProviders(
  ui,
  {
    route = '/',
    path = '/',
    store = createTestStore(),
  } = {}
) {
  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>
          <Route path={path}>{ui}</Route>
        </MemoryRouter>
      </Provider>
    ),
  };
}

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as pagesDuck from '../pages';
import * as utilsDuck from '../utils';
import { API } from '../../constants/api';
import nock from 'nock';

import { page, new_page } from './fixtures';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Actions::Pages', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('fetches pages successfully', () => {
    nock(API)
      .get('/pages/page-dir')
      .reply(200, [page]);

    const expectedActions = [
      { type: pagesDuck.FETCH_PAGES_REQUEST },
      { type: pagesDuck.FETCH_PAGES_SUCCESS, pages: [page] },
    ];

    const store = mockStore({ pages: [], isFetching: false });

    return store.dispatch(pagesDuck.fetchPages('page-dir')).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('fetches the page successfully', () => {
    nock(API)
      .get(`/pages/page.md`)
      .reply(200, page);

    const expectedActions = [
      { type: pagesDuck.FETCH_PAGE_REQUEST },
      { type: pagesDuck.FETCH_PAGE_SUCCESS, page },
    ];

    const store = mockStore({ page: {}, isFetching: true });

    return store.dispatch(pagesDuck.fetchPage(null, 'page.md')).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('deletes the page successfully', () => {
    nock(API)
      .delete(`/pages/page-dir/test/test.md`)
      .reply(200);

    const expectedActions = [
      { type: pagesDuck.DELETE_PAGE_SUCCESS },
      { type: pagesDuck.FETCH_PAGES_REQUEST },
    ];

    const store = mockStore({});

    return store
      .dispatch(pagesDuck.deletePage('page-dir/test', 'test.md'))
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
  });

  it('creates DELETE_PAGE_FAILURE when deleting a page failed', () => {
    nock(API)
      .delete(`/pages/page.md`)
      .replyWithError('something awful happened');

    const expectedAction = {
      type: pagesDuck.DELETE_PAGE_FAILURE,
      error: 'something awful happened',
    };

    const store = mockStore({ pages: [page] });

    return store.dispatch(pagesDuck.deletePage('page.md')).then(() => {
      expect(store.getActions()[0].type).toEqual(expectedAction.type);
    });
  });

  it('updates the page successfully', () => {
    nock(API)
      .put(`/pages/page.md`)
      .reply(200, page);

    const expectedActions = [
      { type: utilsDuck.CLEAR_ERRORS },
      { type: pagesDuck.PUT_PAGE_SUCCESS, page },
    ];

    const store = mockStore({ metadata: { metadata: page } });

    return store.dispatch(pagesDuck.putPage('', 'page.md')).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('creates the page successfully', () => {
    nock(API)
      .put(`/pages/${new_page.path}`)
      .reply(200, page);

    const expectedActions = [
      { type: utilsDuck.CLEAR_ERRORS },
      { type: pagesDuck.PUT_PAGE_SUCCESS, page },
    ];

    const store = mockStore({ metadata: { metadata: page } });

    return store.dispatch(pagesDuck.createPage('')).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('creates the page with autogenerated filename', () => {
    nock(API)
      .put(`/pages/${new_page.path}`)
      .reply(200, page);

    const expectedActions = [
      { type: utilsDuck.CLEAR_ERRORS },
      { type: pagesDuck.PUT_PAGE_SUCCESS, page },
    ];

    const store = mockStore({
      metadata: { metadata: { ...new_page, path: '' } },
    });

    return store.dispatch(pagesDuck.createPage('')).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('creates PUT_PAGE_FAILURE when updating page failed', () => {
    nock(API)
      .put(`/pages/${page.name}`)
      .replyWithError('something awful happened');

    const expectedActions = [
      { type: utilsDuck.CLEAR_ERRORS },
      { type: pagesDuck.PUT_PAGE_FAILURE, error: 'something awful happened' },
    ];

    const store = mockStore({ metadata: { metadata: page } });

    return store.dispatch(pagesDuck.putPage(page.name)).then(() => {
      expect(store.getActions()[1].type).toEqual(expectedActions[1].type);
    });
  });

  it('creates VALIDATION_ERROR if required field is not provided.', () => {
    const expectedActions = [
      {
        type: utilsDuck.VALIDATION_ERROR,
        errors: ['The filename is not valid.'],
      },
    ];

    const store = mockStore({ metadata: { metadata: { path: '.invalid.' } } });

    store.dispatch(pagesDuck.putPage(page.name));
    expect(store.getActions()).toEqual(expectedActions);
  });
});

import * as ActionTypes from '../constants/actionTypes';
import _ from 'underscore';
import { get } from '../utils/fetch';
import { versionsAPIUrl, versionAPIUrl } from '../constants/api';

export function listVersions() {
  return (dispatch) => {
    dispatch({ type: ActionTypes.LIST_VERSIONS_REQUEST});
    return get(
      versionAPIUrl('list'),
      { type: ActionTypes.LIST_VERSIONS_SUCCESS, name: 'versions'},
      { type: ActionTypes.LIST_VERSIONS_FAILURE, name: 'error'},
      dispatch
    );
  };
}

export function createVersion() {
  return (dispatch, getState) => {
    dispatch({ type: ActionTypes.CREATE_VERSION_REQUEST});
    return get(
      versionAPIUrl('create'),
      { type: ActionTypes.CREATE_VERSION_SUCCESS, name: 'version'},
      { type: ActionTypes.CREATE_VERSION_FAILURE, name: 'error'},
      dispatch
    );
  };
}

export function saveVersion() {
  return (dispatch, getState) => {
    dispatch({ type: ActionTypes.SAVE_VERSION_REQUEST});
    return get(
      versionAPIUrl('save'),
      { type: ActionTypes.SAVE_VERSION_SUCCESS, name: 'version'},
      { type: ActionTypes.SAVE_VERSION_FAILURE, name: 'error'},
      dispatch
    );
  };
}

export function loadVersion(name) {
  console.log('loadVersion', arguments);
  return (dispatch, getState) => {
    dispatch({ type: ActionTypes.LOAD_VERSION_REQUEST});
    return get(
      versionAPIUrl(`load?version=${name}`),
      { type: ActionTypes.LOAD_VERSION_SUCCESS, name: 'version'},
      { type: ActionTypes.LOAD_VERSION_FAILURE, name: 'error'},
      dispatch
    );
  };
}

export function promoteVersion() {
  return (dispatch, getState) => {
    dispatch({ type: ActionTypes.PROMOTE_VERSION_REQUEST});
    return get(
      versionAPIUrl('promote'),
      { type: ActionTypes.PROMOTE_VERSION_SUCCESS, name: 'version'},
      { type: ActionTypes.PROMOTE_VERSION_FAILURE, name: 'error'},
      dispatch
    );
  };
}

export function deleteVersion() {
  return (dispatch) => {
    dispatch({ type: ActionTypes.DELETE_VERSION_REQUEST});
    return get(
      versionAPIUrl('delete'),
      { type: ActionTypes.DELETE_VERSION_SUCCESS, name: 'version'},
      { type: ActionTypes.DELETE_VERSION_FAILURE, name: 'error'},
      dispatch
    );
  };
}

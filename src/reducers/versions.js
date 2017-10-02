import {
  LIST_VERSIONS_REQUEST, LIST_VERSIONS_SUCCESS, LIST_VERSIONS_FAILURE,
  CREATE_VERSION_REQUEST, CREATE_VERSION_SUCCESS, CREATE_VERSION_FAILURE,
  SAVE_VERSION_REQUEST, SAVE_VERSION_SUCCESS, SAVE_VERSION_FAILURE,
  LOAD_VERSION_REQUEST, LOAD_VERSION_SUCCESS, LOAD_VERSION_FAILURE,
  PROMOTE_VERSION_REQUEST, PROMOTE_VERSION_SUCCESS, PROMOTE_VERSION_FAILURE,
  DELETE_VERSION_REQUEST, DELETE_VERSION_SUCCESS, DELETE_VERSION_FAILURE
} from '../constants/actionTypes';

export default function versions(state = {
  versions: [],
  version: {},
  isFetching: false,
  updated: false
}, action) {
  switch (action.type) {
    case LIST_VERSIONS_REQUEST:
    case CREATE_VERSION_REQUEST:
    case SAVE_VERSION_REQUEST:
    case LOAD_VERSION_REQUEST:
    case PROMOTE_VERSION_REQUEST:
    case DELETE_VERSION_REQUEST:
      return Object.assign({}, state, {
        isFetching: true
      });
    case LIST_VERSIONS_SUCCESS:
      return Object.assign({}, state, {
        versions: action.versions,
        isFetching: false
      });
    case LIST_VERSIONS_FAILURE:
      return Object.assign({}, state, {
        versions: [],
        isFetching: false
      });
    case CREATE_VERSION_SUCCESS:
    case SAVE_VERSION_SUCCESS:
    case LOAD_VERSION_SUCCESS:
    case PROMOTE_VERSION_SUCCESS:
    case DELETE_VERSION_SUCCESS:
      return Object.assign({}, state, {
        version: action.version,
        isFetching: false
      });
    case CREATE_VERSION_FAILURE:
    case SAVE_VERSION_FAILURE:
    case LOAD_VERSION_FAILURE:
    case PROMOTE_VERSION_FAILURE:
    case DELETE_VERSION_FAILURE:
    default:
      return Object.assign({}, state, {
        isFetching: false
      });
  }
}

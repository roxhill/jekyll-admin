import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'underscore';
import DocumentTitle from 'react-document-title';
import Breadcrumbs from '../../components/Breadcrumbs';
import Button from '../../components/Button';
import { listVersions, createVersion, loadVersion, promoteVersion, deleteVersion } from '../../actions/versions';
import { getDeleteMessage, getSureMessage, getNotFoundMessage } from '../../constants/lang';
import { ADMIN_PREFIX } from '../../constants';

export class Versions extends Component {

  componentDidMount() {
    const { listVersions, params } = this.props;
    listVersions(params.splat);
  }

  componentWillReceiveProps(nextProps) {
    const { listVersions } = nextProps;
    if (this.props.params.splat !== nextProps.params.splat) {
      listVersions(nextProps.params.splat);
    }
  }

  handleClickNew() {
    console.log('handleClickNew');
    const { createVersion, params } = this.props;
    createVersion(params.splat, name);
  }

  handleClickPublish(name) {
    console.log('handleClickPublish');
    const { promoteVersion, params } = this.props;
    if (window.confirm(getSureMessage())) {
      promoteVersion(params.splat, name);
    }
  }

  handleClickDelete(name) {
    console.log('handleClickDelete');
    const { deleteVersion, params } = this.props;
    if (window.confirm(getDeleteMessage(name))) {
      deleteVersion(params.splat, name);
    }
  }

  handleClickLoad(name) {
    console.log('handleClickLoad');
    const { loadVersion, params } = this.props;
    loadVersion(params.splat, name);
  }

  renderVersionRow(version) {
    const { name, active, prod } = version;
    return (
      <tr key={name}>
        <td className="row-title">
          <strong>
            <i className="fa fa-file-text-o" aria-hidden="true" />
            {name}
          </strong>
        </td>
        <td>
          <div className="row-actions">
            <Button
              onClick={() => active && !prod && this.handleClickPublish(name)}
              type="publish"
              icon="cloud-upload"
              active={active && !prod}
              thin />
            <Button
              onClick={() => active && this.handleClickDelete(name)}
              type="delete"
              icon="trash"
              active={active && !prod}
              thin />
            <Button
              onClick={() => active || this.handleClickLoad(name)}
              type="load"
              icon="eye"
              active={!active && !prod}
              thin />
          </div>
        </td>
      </tr>
    );
  }

  renderRows() {
    const { versions } = this.props;
    return _.map(versions, entry => {
      return this.renderVersionRow(entry);
    });
  }

  renderTable() {
    return (
      <div className="content-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th className="th-actions">Actions</th>
            </tr>
          </thead>
          <tbody>{this.renderRows()}</tbody>
        </table>
      </div>
    );
  }

  render() {
    const { isFetching, versions, params } = this.props;

    if (isFetching) {
      return null;
    }

    const title = 'Versions';

    return (
      <DocumentTitle title={title}>
        <div>
          <div className="content-header">
            <Breadcrumbs type="versions" splat={''} />
            <div className="page-buttons">
              <Button
                onClick={() => this.handleClickNew()}
                type="new"
                icon="plus"
                active={true}
              />
            </div>
          </div>
          {
            versions.length > 0 && this.renderTable()
          }
          {
            !versions.length && <h1>{getNotFoundMessage('versions')}</h1>
          }
        </div>
      </DocumentTitle>
    );
  }
}

Versions.propTypes = {
  versions: PropTypes.array.isRequired,
  listVersions: PropTypes.func.isRequired,
  createVersion: PropTypes.func.isRequired,
  loadVersion: PropTypes.func.isRequired,
  promoteVersion: PropTypes.func.isRequired,
  deleteVersion: PropTypes.func.isRequired,
  isFetching: PropTypes.bool.isRequired,
  params: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
  isFetching: state.versions.isFetching,
  versions: state.versions.versions,
  version: state.versions.version
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  listVersions,
  createVersion,
  loadVersion,
  promoteVersion,
  deleteVersion
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Versions);

import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'underscore';
import DocumentTitle from 'react-document-title';
import Breadcrumbs from '../../components/Breadcrumbs';
import Button from '../../components/Button';
import { listVersions, loadVersion } from '../../actions/versions';
import { getDeleteMessage, getNotFoundMessage } from '../../constants/lang';
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

  handleClickLoad(name) {
    const { loadVersion, params } = this.props;
    const confirm = window.confirm(getDeleteMessage(name));
    if (confirm) {
      loadVersion(params.splat, name);
    }
  }

  renderVersionRow(version) {
    const { name } = version;
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
              onClick={() => this.handleClickLoad(name)}
              type="view"
              icon="eye"
              active={true}
              thin />
          </div>
        </td>
      </tr>
    );
  }

  renderRows() {
    const versions = this.props.versions || [];
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
    const { isFetching, params } = this.props;
    const versions = this.props.versions || [];

    console.log(this.props);

    if (isFetching) {
      return null;
    }

    const title = 'Versions';

    return (
      <DocumentTitle title={title}>
        <div>
          <div className="content-header">
            <Breadcrumbs type="versions" splat={params.splat || ''} />
            <div className="version-buttons">
              <Link className="btn btn-active">New version</Link>
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
  loadVersion: PropTypes.func.isRequired,
  isFetching: PropTypes.bool.isRequired,
  params: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
  isFetching: state.versions.isFetching
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  listVersions,
  loadVersion
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Versions);

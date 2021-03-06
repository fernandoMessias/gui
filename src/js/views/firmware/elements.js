import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import ImageStore from '../../stores/ImageStore';
import ImageActions from '../../actions/ImageActions';
import TemplateStore from '../../stores/TemplateStore';
import TemplateActions from '../../actions/TemplateActions';
import { NewPageHeader } from "../../containers/full/PageHeader";
import AltContainer from 'alt-container';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { Link } from 'react-router'
import { DojotBtnLink } from "../../components/DojotButton";
import util from '../../comms/util';
import LoginStore from '../../stores/LoginStore';
import { Loading } from "../../components/Loading";

// UI elements
import Dropzone from 'react-dropzone'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import MaterialInput from "../../components/MaterialInput";
import toaster from "../../comms/util/materialize";

class UploadDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [] 
    }
    this.dismiss = this.dismiss.bind(this);
    this.save = this.save.bind(this);
  }

  onDrop(files) {
      this.setState({
        files
      });
    }

  dismiss(event) {
    event.preventDefault();
    this.props.closeModal();
  }

  save(event) {
    event.preventDefault();
    console.log("save", this.state.files);

    if (this.state.files.length == 0)
    {
      toaster.warning("No image added.");
      return;
    }

    // let sha1 = util.getSHA1(this.state.files[0]);
    // template_id: this.props.template,
    let img_binary = {
      image_id: this.props.image.id,
      binary: this.state.files[0]};
      ImageActions.triggerUpdate(img_binary, () => {
         toaster.success('Image added.');
          this.props.closeModal();
      })
  }
    
  render() {

    return (
      <div>
        <div className="full-background" onClick={this.dismiss}> </div>
        <div className="modal">
          <div className="modal-content full">
            <div className="background-info">
              <div>Click below to upload a .hex file</div>
              <section>
                <div className="dropzone">
                  <Dropzone multiple={false} onDrop={this.onDrop.bind(this)}>
                    <p>Drop the file here or click to select image to upload.</p>
                  </Dropzone>
                </div>
                <aside className="listFiles">
                  <ul>
                    {
                      this.state.files.map(f => <li key={f.name}>{f.name} - {f.size} bytes</li>)
                    }
                  </ul>
                </aside>
                <div className="modal-footer right">
                  <button type="button" className="btn-flat btn-ciano waves-effect waves-light" onClick={this.dismiss}>cancel</button>
                  <button type="submit" className="btn-flat btn-red waves-effect waves-light" onClick={this.save}>save</button>
                </div>
              </section>
            </div>
          </div>

        </div>
      </div>
    )
  }
}

class NewImageCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fw_version: ""
    }
    this.save = this.save.bind(this);
    this.cancel = this.cancel.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }


  save(e) {
    e.preventDefault();
    if (this.state.fw_version == "")
    {      
      toaster.warning('Missing Firmware version.');
      return;  
    }

    let img = { 
      label: this.props.template.label,
      fw_version: this.state.fw_version,
      sha1: ""
    };
    ImageActions.triggerInsert(img, (img) => {
      toaster.success('Image created.');
      this.props.refreshImages();
    });
    this.props.setNewImage(false);
  }

  cancel() {
    this.props.setNewImage(false);
  }

  handleChange(event) {
    event.preventDefault();
    this.setState({ fw_version: event.target.value });
  }

  render() {
    return (
      <div className="image-card image-card-attributes">
        <div className="lst-blockquote col s12 blockblock">
          <div className="attr-row ">
          
            {/* <div className="attr-name">Firmware Version</div> */}
            <div className="input-field col s12">
                    <MaterialInput
              className="mt0px"
              id="fw_version"
              name="fw_version"
              value={this.state.fw_version}
              onChange={this.handleChange}
              > Firmware Version </MaterialInput>
            </div>

          </div>

          {/* <div className="attr-content black-attr-row">
            <label>No image saved. </label>
            <span>Binary Hash</span>
            <div className="searchBtn" title="Add a Binary file" onClick={this.openBinaryModal}>
              <i className="fa fa-search" />
            </div>
          </div> */}
          <div className="attr-row">
            <div className="row right">
              <div className="col s6">
                <button type="submit" className="btn-light btn-light-2 waves waves-light" onClick={this.save}>Save</button>
              </div>           
              <div className="col s6">
                <button type="button" className="btn-light btn-light-2 waves waves-light" onClick={this.cancel}>Cancel</button>
              </div>           
            </div>
          </div>

        </div >
      </div >
    )
  }
}

class ImageCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      starred: false,
      modal_opened: false 
    }
    this.images = [];
    this.removeImage = this.removeImage.bind(this);
    this.clickStar = this.clickStar.bind(this);
    this.removeBinary = this.removeBinary.bind(this);
    this.openBinaryModal = this.openBinaryModal.bind(this);
    this.closeUploadModal = this.closeUploadModal.bind(this);
  }

  removeImage(e)
  {
    e.preventDefault();
    ImageActions.triggerRemoval(this.props.image, () => {
      toaster.error('Image removed.');
    })
  }

  closeUploadModal() {
    console.log("closeUploadModal");
    this.setState({ modal_opened: false });
  }

  openBinaryModal() {
    this.setState({ modal_opened: true });
  }


  clickStar() {
    this.props.updateDefaultVersion(this.props.image.fw_version);
  }


  removeBinary(){
    // let img_binary = {
    //   template_id: this.props.template_id,
    //   image_id: this.props.image.id,
    //   fw_version: this.props.image.fw_version,
    //   has_image: false, 
    //   binary: "",
    //   sha1: ""
    // };
    // console.log("removeBinary", img_binary);
    ImageActions.triggerRemovalBinary(this.props.image.id, () => {
      toaster.success('Image updated.');
    })
    // this.props.changeState(0);
  }

  componentDidMount() {
    console.log("this.props.image.fw_version", this.props.image.fw_version);
    console.log("this.props.default_version", this.props.default_version);
    if (this.props.image.fw_version == this.props.default_version && this.props.default_version)
      this.setState({ starred: true });
  }

  render() {
    // console.log("asdsdsd")
    // console.log("this.props.template", this.props.template);
    // console.log("this.props.image", this.props.image);

    let binaryInfo = null;
  if (this.props.image.has_image)
    binaryInfo = <div className="attr-content black-attr-row">
      <label>Image added.</label>
      <span> Binary file</span>
      <div onClick={this.removeBinary} className="searchBtn" title="Remove Binary file">
        <i className="fa fa-trash" />
      </div>
      
    </div>;
  else
    binaryInfo = <div className="attr-content black-attr-row">
        <label>No image saved. </label>
      <span>Binary file</span>
        <div className="searchBtn" title="Add a Binary file" onClick={this.openBinaryModal.bind(this)}>
          <i className="fa fa-upload" />
        </div>
        
      </div>;
    

    return (
      <div className="image-card image-card-attributes">
        {this.state.modal_opened === true && <UploadDialog closeModal={this.closeUploadModal} image={this.props.image} template={this.props.template_id} />}
        <div className="lst-blockquote col s12 pr">
          <div onClick={this.removeImage} className="remove-image-icon " title="Remove Image">
            <i className="fa fa-trash" />
          </div>

          <div className="star-icon  " title={(this.state.starred ? "" : "Update default version")} onClick={this.clickStar}>
            <i className={"fa " + (this.state.starred ? "  fa-thumb-tack pin-icon" : "fa-download")} />
          </div>

          <div className="attr-row">
            <div className="icon">
              {/* <i className="fa fa-hdd" /> */}
            </div>
            <div className={"attr-content"}>
              <label className="truncate" title={this.props.image.fw_version}>{this.props.image.fw_version}</label>
              <span>Firmware Version</span>
            </div>
          </div>
          <div className="attr-row">
            <div className="icon">
              {/* <img src={"images/update.png"} /> */}
            </div>
            <div className={"attr-content"}>
              <label>{util.iso_to_date(this.props.image.created)} </label>
              <span>Created At</span>
            </div>
          </div>
          {binaryInfo}
          
        </div>
      </div>
    )
  }
}

export { ImageCard, NewImageCard };

import React, {Component} from 'react';
import {Card, Image} from 'react-native-elements';
import storage from '@react-native-firebase/storage';

class StoreCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      url: null,
    };
  }

  getImage = async () => {
    const image = this.props.store.displayImage;

    const ref = storage().ref(image);
    const url = await ref.getDownloadURL();

    this.setState({url});
  };

  componentDidMount() {
    this.getImage();
  }

  render() {
    const {store} = this.props;
    const {url} = this.state;

    return (
      <Card>
        {{url} && (
          <Image source={{uri: url}} style={{width: '100%', height: 200}} />
        )}
      </Card>
    );
  }
}

export default StoreCard;

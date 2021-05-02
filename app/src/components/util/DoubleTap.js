import React from 'react';
import { TouchableWithoutFeedback } from 'react-native';

/**
 * Function that detects a double tap for a component. Currently unused
 * 
 * @module DoubleTap
 */
//https://medium.com/handlebar-labs/instagram-style-double-tap-with-react-native-49e757f68de
export class DoubleTap extends React.Component {
  static defaultProps = {
    delay: 300,
    onDoubleTap: () => null,
  };

  lastTap = null;

  // https://gist.github.com/brunotavares/3c9a373ba5cd1b4ff28b
  handleDoubleTap = () => {
    const now = Date.now();
    if (this.lastTap && (now - this.lastTap) < this.props.delay) {
      this.props.onDoubleTap();
    } else {
      this.lastTap = now;
    }
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={this.handleDoubleTap}>
        {this.props.children}
      </TouchableWithoutFeedback>
    );
  }
}
import React from 'react';
import { TouchableWithoutFeedback } from 'react-native';

/**
 * Function that detects a double tap for a component.
 * https://medium.com/handlebar-labs/instagram-style-double-tap-with-react-native-49e757f68de
 * @example 
 * <DoubleTap onDoubleTap={doubleTapFunction}>
 *  <Image
 *    source={{ uri: `https://images.pexels.com/photos/671557/pexels-photo-671557.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=${w.width}` }}
 *    style={{ width: w.width, height: w.width }}
 *    resizeMode="cover"
 *  />
 * </DoubleTap>
 * @module DoubleTap
 */
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
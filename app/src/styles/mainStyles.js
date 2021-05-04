import { StyleSheet } from 'react-native';

const mainStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    color: '#28b573',
    textAlign: 'center',
    marginTop: 50,
    right: 1
  },

  large_title : { 
      fontSize: 40,
      color: '#28b573',
      position: 'absolute',
      top: 70
  },
});

export default mainStyles;
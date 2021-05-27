import { StyleSheet, StatusBar, Platform } from 'react-native';

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

  screen: {
      backgroundColor: 'white',
      height: '100%',
      paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  bodyContainer: {
      flex: 1,
      zIndex: Platform.OS === 'ios' ? 0 : 1,
  },
  footerContainer: {
      alignSelf: "flex-end",
      width: '100%',
      zIndex: 10,
  },
  titleNoPadding: {
    fontSize: 24,
    fontWeight: "bold",
    color: '#28b573',
    textAlign: 'center',
  },
});

export default mainStyles;
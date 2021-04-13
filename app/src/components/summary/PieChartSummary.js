
import React from 'react';
import { Text, View, Dimensions } from 'react-native';
import { PieChart } from 'react-native-svg-charts'

class PieChartSummary extends React.PureComponent {

    constructor(props) {
      super(props);
      this.state = {
        selectedSlice: {
          label: 'All Categories',
          value: 0
        },
        labelWidth: 0
      }
    }
    render() {
      const { labelWidth, selectedSlice } = this.state;
      const { label, value } = selectedSlice;
      const keys = ['Dining', 'Grocery', 'Drugstore', 'Gas', 'Home', 'Travel', 'Others'];
      const values = [15, 25, 35, 45, 55, 65, 75];
      const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#2E2B5F', '#8B00FF']
      const data = keys.map((key, index) => {
          return {
            key,
            value: values[index],
            arc: { padAngle: label === key ? 0.1 : 0 },
            svg: { fill: colors[index] },
            onPress: () => this.setState({ selectedSlice: { label: key, value: values[index] } })
          }
        })
      const deviceWidth = Dimensions.get('window').width
  
      return (
        <View style={{ justifyContent: 'center', flex: 1 }}>
          <PieChart
            style={{ height: 400 }}
            outerRadius={'80%'}
            innerRadius={'45%'}
            data={data}
          />
          <Text
            onLayout={({ nativeEvent: { layout: { width } } }) => {
              this.setState({ labelWidth: width });
            }}
            style={{
              position: 'absolute',
              left: deviceWidth / 2 - labelWidth / 2,
              textAlign: 'center'
            }}>
            {`${label} \n $${value}`}
          </Text>
        </View>
      )
    }
  }
  
  export default PieChartSummary;
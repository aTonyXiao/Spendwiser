
import React, { useState } from 'react';
import { Text, View, Dimensions } from 'react-native';
import { PieChart } from 'react-native-svg-charts'
import { Ionicons } from '@expo/vector-icons';

export function PieChartSummary({
  curCategory,
  setCurCategory,
  keys,
  values,
  setModalVisible
  }) {
    const { label, value } = curCategory;
    const [labelWidth, setLabelWidth] = useState(0);
    const colors = ['#FF0000', '#FF7F00', '#FFD700', '#00FF00', '#0000FF', '#2E2B5F', '#8B00FF']
    const data = keys.map((key, index) => {
        return {
          key,
          value: values[index],
          arc: { padAngle: label === key ? 0.1 : 0 },
          svg: { fill: colors[index] },
          onPress: () => setCurCategory({ label: key, value: values[index] })
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
            setLabelWidth(width);
          }}
          style={{
            position: 'absolute',
            left: deviceWidth / 2 - labelWidth / 2,
            textAlign: 'center'
          }}>
          {`${label} \n $${value.toFixed(2)} \n`}
          <View style={{flexDirection:'row', alignItems: 'flex-end', marginBottom: 10}}>
              <Text 
                  style={{color: 'blue'}}
                  onPress={() => {setModalVisible(3)}}
              >Show Transactions</Text>
              <Ionicons
                  name="chevron-forward"
                  color="blue"
                  size={15}
              ></Ionicons>
          </View> 
        </Text>
      </View>
    )
  };

import React, { useState } from 'react';
import { Text, View, Dimensions, FlatList, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-svg-charts'
import { Ionicons } from '@expo/vector-icons';

export function PieChartSummary({
  curCategory,
  setCurCategory,
  keys,
  values,
  setModalVisible,
  colors,
  }) {
    const { label, value } = curCategory;
    const [labelWidth, setLabelWidth] = useState(0);
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
     // Render legend in flatlist
    function renderLegend({cat, index}) {
      if (values[index] !== 0) {
        return (
            <View style={styles.legendItem}>
                <Ionicons
                    name="cube"
                    color={colors[index]}
                    size={15}
                ></Ionicons>
                <Text>{keys[index]}</Text>
            </View>
        );
      }
    }

    return (
      <View style={{ justifyContent: 'center', flex: 1 }}>
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
            textAlign: 'center',
          }}>
          {`${label} \n $${value.toFixed(2)} \n`}
          <Text 
              style={{color: 'blue'}}
              onPress={() => {setModalVisible(3)}}
          >Show Transactions</Text>
          <Ionicons
              name="chevron-forward"
              color="blue"
              size={15}
          ></Ionicons>
        </Text>
      </View>
      <View style={styles.legendContainer}>
                    <FlatList
                        data={keys}
                        renderItem={renderLegend}
                        numColumns={4}
                        keyExtractor={(index) => index.toString()}
                    />
                </View>
      </View>
    )
  };

  const styles = StyleSheet.create({
    legendContainer: {
      alignItems: 'center',
      marginBottom: 10
    },
    legendItem: {
        flexDirection: 'row',
        margin: 5,
    }
  });
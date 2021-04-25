import React, { useEffect, useState } from 'react'
import { Text, View, StyleSheet } from 'react-native';
import { YAxis, Grid, BarChart } from 'react-native-svg-charts'
import * as scale from 'd3-scale'
import { Ionicons } from '@expo/vector-icons';
import { summaryHelper } from './SummaryHelper';

export function StackedChartCompare(
    {
        compareTransPeriod1,
        compareTransPeriod2,
        keys,
        curCard,
    }) {
        let periodData1 = Array(7).fill(0);
        let periodData2 = Array(7).fill(0);
        const [overallSpending, setOverallSpending] = useState(Array(2).fill(0));
        const [barData, setBarData] = useState([
            {
                data: periodData1.map((value) => ({ value })),
                svg: {
                    fill: 'blue',
                },
            },
            {
                data: periodData2.map((value) => ({ value })),
            },
        ]);

        useEffect(() => {
            for (var i = 0; i < compareTransPeriod1.length; i++) {
                if (curCard === null || curCard["cardId"] === compareTransPeriod1[i]["cardId"]) {
                    periodData1[summaryHelper.matchTransactionToCategory(compareTransPeriod1[i])]
                    += parseFloat(compareTransPeriod1[i]['amountSpent']);
                }
            }
            for (var i = 0; i < compareTransPeriod2.length; i++) {
                if (curCard === null || curCard["cardId"] === compareTransPeriod2[i]["cardId"]) {
                    periodData2[summaryHelper.matchTransactionToCategory(compareTransPeriod2[i])]
                    += parseFloat(compareTransPeriod2[i]['amountSpent']);
                }
            }

            setBarData([
                {
                    data: periodData1.map((value) => ({ value })),
                    svg: {
                        fill: '#0000CD',
                    },
                },
                {
                    data: periodData2.map((value) => ({ value })),
                },
            ]);
            setOverallSpending([periodData1.reduce((a, b) => a + b, 0), periodData2.reduce((a, b) => a + b, 0)])
        }, [curCard, compareTransPeriod1, compareTransPeriod2]);



    return (
        <View style={{ flex: 1, paddingHorizontal: 10}}>
            <View style={{ flexDirection: 'row', flex: 1, paddingVertical: 8 }}>
                <YAxis
                    data={barData[0].data}
                    yAccessor={({ index }) => index}
                    scale={scale.scaleBand}
                    contentInset={{ top: 10, bottom: 10 }}
                    spacing={0.2}
                    formatLabel={(_, index) => keys[index]}
                    svg={{ fontSize: 12, fill: 'black' }}
                />
                <BarChart
                    style={ { flex: 2, marginLeft: 8 } }
                    data={barData}
                    horizontal={true}
                    yAccessor={({ item }) => item.value}
                    svg={{
                        fill: '#228B22',
                    }}
                    contentInset={ { top: 10, bottom: 10 } }
                    spacing={0.2}
                    gridMin={0}
                >
                    <Grid direction={Grid.Direction.VERTICAL}/>
                </BarChart>       
            </View>
            {/* Legend */}
            <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                    <Ionicons
                        name="cube"
                        color={'#0000CD'}
                        size={20}
                    ></Ionicons>
                    <View style={{flexDirection: 'column', alignItems: 'center'}}>
                        <Text>1st Period</Text>
                        <Text>${overallSpending[0].toFixed(2)}</Text>
                    </View>
                </View>
                <View style={styles.legendItem}>
                    <Ionicons
                        name="cube"
                        color={'#228B22'}
                        size={20}
                    ></Ionicons>
                    <View style={{flexDirection: 'column', alignItems: 'center'}}>
                        <Text>2nd Period</Text>
                        <Text>${overallSpending[1].toFixed(2)}</Text>
                    </View>
                </View>
            </View>
            {/* Overall */}
            <Text style={{paddingHorizontal: 10, textAlign: 'center'}}>
                You spent {overallSpending[0] === 0 ? 0 : (overallSpending[0] * 100/overallSpending[1]).toFixed(2)}% 
                more
                {"\n"}
                this month than last month.
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    legendContainer: {
      alignItems: 'center',
      margin: 10,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 5,
    }
  });
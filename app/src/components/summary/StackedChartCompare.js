import React, { useEffect, useState } from 'react'
import { Text, View, StyleSheet } from 'react-native';
import { XAxis, Grid, BarChart } from 'react-native-svg-charts'
import * as scale from 'd3-scale'
import { Ionicons } from '@expo/vector-icons';
import { summaryHelper } from './SummaryHelper';

export function StackedChartCompare(
    {
        transactions,
        keys,
        curCard,
    }) {
        let thisMonthData = Array(7).fill(0);
        let lastMonthData = Array(7).fill(0);
        const [overallSpending, setOverallSpending] = useState(Array(2).fill(0));
        const [barData, setBarData] = useState([
            {
                data: thisMonthData.map((value) => ({ value })),
                svg: {
                    fill: 'blue',
                },
            },
            {
                data: lastMonthData.map((value) => ({ value })),
            },
        ]);

        useEffect(() => {
            for (var i = 0; i < transactions.length; i++) {
                if (curCard === null || curCard["cardId"] === transactions[i]["cardId"]) {
                    if(summaryHelper.InTimeFrame("This month", transactions[i]["dateAdded"].toDate())) {
                        thisMonthData[summaryHelper.matchTransactionToCategory(transactions[i])] += parseFloat(transactions[i]['amountSpent']);
                    } else {
                        lastMonthData[summaryHelper.matchTransactionToCategory(transactions[i])] += parseFloat(transactions[i]['amountSpent']);
                    }
                }
            }
            setBarData([
                {
                    data: thisMonthData.map((value) => ({ value })),
                    svg: {
                        fill: '#0000CD',
                    },
                },
                {
                    data: lastMonthData.map((value) => ({ value })),
                },
            ]);
            setOverallSpending([thisMonthData.reduce((a, b) => a + b, 0), lastMonthData.reduce((a, b) => a + b, 0)])
        }, [curCard, transactions]);



    return (
        <View style={{ flex: 1, paddingHorizontal: 20 }}>
            <BarChart
                style={ { flex: 2 } }
                data={ barData }
                yAccessor={({ item }) => item.value}
                svg={{
                    fill: '#228B22',
                }}
                contentInset={ { top: 30, bottom: 30 } }
            >
                <Grid/>
            </BarChart>
            <XAxis
            data={ barData[0].data }
            scale={ scale.scaleBand }
            formatLabel={ ( index ) => keys[index] }
            svg={{ fontSize: 8, fill: 'black' }}
            />
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
import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Footer } from '../util/Footer';
import { CategoryModal } from './CategoryModal';
import { PieChartSummary } from './PieChartSummary';
import { Ionicons } from '@expo/vector-icons';
import { user } from '../../network/user';
import { summaryHelper } from './SummaryHelper';
import { ListSummary } from './ListSummary';

const modalType = {
    DISABLED: 0,
    TIME: 1,
    CATEGORY: 2,
    TRANSACTIONS: 3,
}
const keys = ['Dining', 'Grocery', 'Drugstore', 'Gas', 'Home', 'Travel', 'Others'];

export function SpendingSummary({navigation}) {
    const [modalVisible, setModalVisible] = useState(modalType.DISABLED);
    const [curCategory, setCurCategory] = useState({
        label: 'All categories',
        value: 0,
    });
    const [curTimeframe, setCurTimeframe] = useState('This month');
    const [transactions, setTransactions] = useState([]);
    const [values, setValues] = useState([]);
    const [listViewEnabled, setListViewEnabled] = useState(false);

    function changeCategory(cat) {
        console.log(cat);
        setCurCategory({
            label: cat,
            value: cat === "All categories" ? values.reduce((a, b) => a + b, 0) : values[keys.indexOf(cat)],
        });
    };

    function processTransactionsForSumamry(transaction) {
        let tmpValues = values;
        tmpValues[summaryHelper.matchTransactionToCategory(transaction)] += parseFloat(transaction['amountSpent']);
        setValues(tmpValues);
        setCurCategory((prevState) => {
            return { ...prevState, value: tmpValues.reduce((a, b) => a + b, 0)};
        });
    };

    function getTimeFrame() {
        let endTimeFrame, startTimeFrame;
        let month, date, year;
        switch (curTimeframe) {                
            case "Last month":
                [month, date, year] = new Date().toLocaleDateString("en-US").split("/");
                endTimeFrame = new Date("20" + (month - 1 !== -1 ? year : year - 1), (month - 1) % 12, 0);
                startTimeFrame = new Date("20" + (month - 2 !== -1 ? year : year - 1), (month - 2) % 12);
                break;
            case "Last 3 months":
                endTimeFrame = new Date();
                [month, date, year] = new Date().toLocaleDateString("en-US").split("/");
                startTimeFrame = new Date("20" + (month - 3 >= 0 ? year : year - 1), month - 3 % 12);
                break;
            default: 
                /* Last Month */
                endTimeFrame = new Date();
                [month, date, year] = new Date().toLocaleDateString("en-US").split("/");
                startTimeFrame = new Date("20" + year, month - 1);
                break;
        }
        return [startTimeFrame, endTimeFrame];
    }

    useEffect(() => {
        if (transactions.length == 0) {
            return;
        }
        processTransactionsForSumamry(transactions[transactions.length - 1]);
    }, [transactions]);

    useEffect(() => {
        setValues(Array(7).fill(0));
        setTransactions([]);
        setCurCategory({
            label: 'All categories',
            value: 0,
        });
        const userId = user.getUserId();
        let [startTimeFrame, endTimeFrame] = getTimeFrame();
        console.log(startTimeFrame);
        console.log(endTimeFrame);
        user.getTimeFrameTransactions(userId, startTimeFrame, endTimeFrame, (data) => {
            setTransactions(oldData => [...oldData, data]);
        });
    }, [curTimeframe]);

    return (
        <SafeAreaView style={styles.screen}>
            <CategoryModal
                modalType = {modalType}
                modalVisible = {modalVisible}
                setModalVisible = {setModalVisible}
                curTimeframe = {curTimeframe}
                setCurTimeframe = {setCurTimeframe}
                curCategory = {curCategory}
                changeCategory = {changeCategory}
                values = {values}
                transactions = {transactions}
            />
            <Text style={styles.header}>Spendings & Transactions</Text>
            {/* Tabs */}
            <View style={styles.tabContainer}>
                <View style={styles.tab}>
                    <Text>Time period</Text>
                    <Text>Category</Text>
                </View>
                <View style={styles.tab}>
                    <View style={{flexDirection:'row', alignItems: 'flex-end'}}>
                        <Text 
                            style={{color: 'blue'}}
                            onPress={() => {setModalVisible(modalType.TIME)}}
                        >{curTimeframe}</Text>
                        <Ionicons
                            name="chevron-down"
                            color="blue"
                            size={15}
                        ></Ionicons>
                    </View>
                    <View style={{flexDirection:'row', alignItems: 'flex-end'}}>
                        <Text 
                            style={{color: 'blue'}}
                            onPress={() => {setModalVisible(modalType.CATEGORY)}}
                        >{curCategory.label}</Text>
                        <Ionicons
                            name="chevron-down"
                            color="blue"
                            size={15}
                        ></Ionicons>
                    </View> 
                </View>
            </View>
            {/* Content */}
            <View style={styles.contentContainer}>
                {!(listViewEnabled) ?
                    <PieChartSummary
                        style={{height:500}}
                        values={values}
                        keys={keys}
                        curCategory={curCategory}
                        setCurCategory={setCurCategory}
                        setModalVisible={setModalVisible}
                    />
                    :
                    <ListSummary
                        setModalVisible={setModalVisible}
                        changeCategory={changeCategory}
                        values={values}
                    />
                }
            </View>
            <View style={styles.viewType}>
                <Ionicons
                    name="list-outline"
                    color="blue"
                    size={15}
                ></Ionicons>
                <Text 
                    style={{color: 'blue', marginLeft: 5}}
                    onPress={() => {setListViewEnabled(!listViewEnabled)}}
                >{listViewEnabled ? "Chart View" : "List View"}</Text>
            </View>
            {/* Footer */}
            <View style={styles.footerContainer}>
                <Footer navigation={navigation} />
            </View>
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: 'white',
        height: '100%',
        paddingTop: StatusBar.currentHeight,
        alignItems: 'center',
        flexDirection: 'column',
    },
    header: {
        fontSize: 24,
        paddingTop: 10,
    },
    tabContainer: {
        marginTop: 10,
        width: '100%',
        paddingHorizontal: 20,
        flexDirection: 'column',
        justifyContent: 'space-between',
        paddingBottom: 10,
        borderBottomWidth: 0.5,
    },
    tab: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    contentContainer: {
        flex: 1,
        width: '100%',
    },
    viewType: {
        flexDirection:'row',
        alignItems: 'flex-end',
        paddingBottom: 20,
        width: '100%',
        justifyContent: 'center',
    },
    footerContainer: { 
        width: '100%',
        backgroundColor: 'white',
        // position: 'absolute', 
        bottom: 0, 
        paddingBottom: 35,
        marginTop: 0
    }
});
import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { Footer } from '../util/Footer';
import { CategoryModal } from './CategoryModal';
import { PieChartSummary } from './PieChartSummary';
import { Ionicons } from '@expo/vector-icons';
import { user } from '../../network/user';
import { summaryHelper } from './SummaryHelper';
import { ListSummary } from './ListSummary';
import { HeaderAndTabContent } from './HeaderAndTabContent';
import { ChartCompare } from './ChartCompare';
import { ChartBudget } from './ChartBudget';
import * as storage from '../../local/storage';
import { useFocusEffect } from '@react-navigation/native';

const modalType = {
    DISABLED: 0,
    TIME: 1,
    CATEGORY: 2,
    TRANSACTIONS: 3,
    CARDS: 4,
    MODE: 5,
    MONTH: 6,
    LIMITS: 7,
}
const modeType = {
    SUMMARY: "Summary",
    COMPARE: "Compare",
    BUDGET: "Budget",
}
const keys = ['Dining', 'Grocery', 'Drugstore', 'Gas', 'Home', 'Travel', 'Others'];
const colors = ['#FF0000', '#FF7F00', '#FFD700', '#228B22', '#0000FF', '#2E2B5F', '#8B00FF']

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
    const [cards, setCards] = useState([]);
    const [curCard, setCurCard] = useState(null);
    const [mode, setMode] = useState(modeType.SUMMARY);
    // Compare and Budget mode variables
    const [compareTransPeriod1, setCompareTransPeriod1] = useState([]);
    const [compareTransPeriod2, setCompareTransPeriod2] = useState([]);
    const [compareTimeframe, setCompareTimeframe] = useState([]);
    const [whichPeriod, setWhichPeriod] = useState(0);
    const [categoriesLimit, setCategoriesLimit] = useState(Array(7).fill(0));

    const userId = user.getUserId();
    function getCardFromDB(myCards) {
        setCards(myCards);
    }

    function changeCategory(cat) {
        setCurCategory({
            label: cat,
            value: cat === "All categories" ? values.reduce((a, b) => a + b, 0) : values[keys.indexOf(cat)],
        });
    };

    function setCurCardFromModal(cardName) {
        let curCardIdx = -1;
        if (cardName === "All Cards") {
            setCurCard(null);
        } else {
            curCardIdx = cards.findIndex(x => x["cardName"] === cardName);
            setCurCard(cards[curCardIdx]);
        }
        let tmpValues = Array(7).fill(0);
        for (var i = 0; i < transactions.length; i++) {
            if (curCardIdx === -1 || transactions[i]["cardId"] === cards[curCardIdx]["cardId"]) {
                tmpValues[summaryHelper.matchTransactionToCategory(transactions[i])] += parseFloat(transactions[i]['amountSpent']);
            }
        }
        setValues(tmpValues);
        setCurCategory({label: "All Categories", value: tmpValues.reduce((a, b) => a + b, 0)});
    };

    function setNewPeriod(date) {
        const dateSplit = date.split(' ');
        let newCompare = compareTimeframe;
        if (whichPeriod === 1) {
            newCompare[0] = new Date(dateSplit[0], dateSplit[1] - 1);
            setCompareTransPeriod1([]);
        } else {
            newCompare[1] = new Date(dateSplit[0], dateSplit[1] - 1);
            setCompareTransPeriod2([]);
        }
        setCompareTimeframe(newCompare);
        getCompareTimeframeTransactions(newCompare)
    }
    
    // Get transactions for compare mode
    function getCompareTimeframeTransactions(newCompareTimeframe) {
        if (newCompareTimeframe.length === 0) {
            return;
        }
        if (whichPeriod === 1 || whichPeriod === 0) {
            // end time frame is the last day of the month
            let endTimeFrame0 = new Date(newCompareTimeframe[0].getFullYear(), newCompareTimeframe[0].getMonth() + 1, 0, 23, 59, 59, 59);
            user.getTimeFrameTransactions(userId, newCompareTimeframe[0], endTimeFrame0, (data) => {
                if (data !== null) {
                    setCompareTransPeriod1(oldData => {
                        console.log("Old data: ");
                        console.log(oldData);
    
                        console.log("New data: ");
                        console.log([... new Set([...oldData, data])]);
                        return [... new Set([...oldData, data])]
                    });
                }
            });
        }
        if (whichPeriod === 2 || whichPeriod === 0) {
            let endTimeFrame1 = new Date(newCompareTimeframe[1].getFullYear(), newCompareTimeframe[1].getMonth() + 1, 0, 23, 59, 59, 59);
            user.getTimeFrameTransactions(userId, newCompareTimeframe[1], endTimeFrame1, (data) => {
                if (data !== null) {
                    setCompareTransPeriod2(oldData => {return [... new Set([...oldData, data])]});
                }
            });
        }
    };

    // Change category limits
    function changeCategoriesLimit(newCategoriesLimit) {
        setCategoriesLimit(newCategoriesLimit);
        storage.storeCategoriesLimit(newCategoriesLimit);
    }

    // Check if any new transactions added when screen is focused
    useFocusEffect(
        useCallback(() => {
            if (compareTimeframe.length !== 0) {
                let check = new Date();
                while (user.newTransactions.length > 0) {
                    let trans = user.newTransactions.pop();
                    // If new transaction not in transaction array list then add it in
                    if (!(transactions.some(e => e.id === trans.id))) {
                        setTransactions(oldData => [...oldData, trans]);
                    }
                    if (check.getMonth() == compareTimeframe[0].getMonth()) {
                        if (!(compareTransPeriod1.some(e => e.id === trans.id))) {
                            setCompareTransPeriod1(oldData => [...oldData, trans]);
                        }
                    }
                    if (check.getMonth() == compareTimeframe[1].getMonth()) {
                        if (!(compareTransPeriod2.some(e => e.id === trans.id))) {
                            setCompareTransPeriod2(oldData => [...oldData, trans]);
                        }
                    }
                }
            } else {
                user.newTransactions = [];
            }
        })
    )

    // process each transaction retrieved from db after timeframe change
    useEffect(() => {
        if (transactions.length == 0) {
            return;
        }
        let tmpValues = values;
        let transaction = transactions[transactions.length - 1];
        console.log(transaction);
        if (curCard === null || transaction["cardId"] === curCard["cardId"])
            tmpValues[summaryHelper.matchTransactionToCategory(transaction)] += parseFloat(transaction['amountSpent']);
        setValues(tmpValues);
        setCurCategory((prevState) => {
            return { ...prevState, value: tmpValues.reduce((a, b) => a + b, 0)};
        });
    }, [transactions]);

    // Get transactions from db when timeframe change
    useEffect(() => {
        setValues(Array(7).fill(0));
        setTransactions([]);
        setCurCategory({
            label: 'All categories',
            value: 0,
        });
        let [startTimeFrame, endTimeFrame] = summaryHelper.getTimeFrame(curTimeframe);
        user.getTimeFrameTransactions(userId, startTimeFrame, endTimeFrame, (data) => {
            if (data !== null)
                setTransactions(oldData => [... new Set([...oldData, data])]);
        });
    }, [curTimeframe]);

    // Load card names and id, and COMPARE mode info when mount
    useEffect(() => {
        summaryHelper.getDbCards(getCardFromDB);
        let [startTimeFrame, endTimeFrame] = summaryHelper.getTimeFrame("Last 2 months");
        let thisMonth = new Date(endTimeFrame.getFullYear(), endTimeFrame.getMonth());
        setCompareTimeframe([thisMonth, startTimeFrame]);
        getCompareTimeframeTransactions([thisMonth, startTimeFrame]);
        storage.getCategoriesLimit((val) => {
            if (val !== null)
                setCategoriesLimit(val);
        });
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            summaryHelper.getDbCards(getCardFromDB);
            let [startTimeFrame, endTimeFrame] = summaryHelper.getTimeFrame("Last 2 months");
            let thisMonth = new Date(endTimeFrame.getFullYear(), endTimeFrame.getMonth());
            setCompareTimeframe([thisMonth, startTimeFrame]);
            getCompareTimeframeTransactions([thisMonth, startTimeFrame]);
            storage.getCategoriesLimit((val) => {
                if (val !== null)
                    setCategoriesLimit(val);
            });
        });
        return unsubscribe; 
    }, [navigation]);

    return (
        <View style={styles.screen}>
            <StatusBar barStyle='dark-content'/>
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
                cards = {cards}
                curCard = {curCard}
                setCurCardFromModal = {setCurCardFromModal}
                modeType={modeType}
                mode={mode}
                setMode={setMode}
                categoriesLimit={categoriesLimit}
                changeCategoriesLimit={changeCategoriesLimit}
            />

            {/* Header and Tabs */}
            <HeaderAndTabContent
                modalType={modalType}
                curCard={curCard}
                curTimeframe={curTimeframe}
                mode={mode}
                modeType={modeType}
                curCategory={curCategory}
                setModalVisible={setModalVisible}
                compareTimeframe={compareTimeframe}
                setNewPeriod={setNewPeriod}
                whichPeriod={whichPeriod}
                setWhichPeriod={setWhichPeriod}
            />
            {/* Content */}
            <View style={styles.contentContainer}>
                {mode === modeType.SUMMARY && !(listViewEnabled) &&
                    <PieChartSummary
                        style={{height:500}}
                        values={values}
                        keys={keys}
                        curCategory={curCategory}
                        setCurCategory={setCurCategory}
                        setModalVisible={setModalVisible}
                        colors={colors}
                    />
                }
                {mode === modeType.SUMMARY && listViewEnabled &&
                    <ListSummary
                        setModalVisible={setModalVisible}
                        changeCategory={changeCategory}
                        values={values}
                    />
                    
                }
                {mode === modeType.COMPARE &&
                    <ChartCompare
                        compareTransPeriod1={compareTransPeriod1}
                        compareTransPeriod2={compareTransPeriod2}
                        keys={keys}
                        curCard={curCard}
                        compareTimeframe={compareTimeframe}
                    />
                }
                {mode === modeType.BUDGET &&
                    <ChartBudget
                        compareTransPeriod1={compareTransPeriod1}
                        categoriesLimit={categoriesLimit}
                        keys={keys}
                        curCard={curCard}
                        compareTimeframe={compareTimeframe}
                    />
                }
            </View>
            {mode === modeType.SUMMARY &&
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
            }
            {/* Footer */}
            <View style={styles.footerContainer}>
                <Footer navigation={navigation} />
            </View>
        </View>
    )
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: 'white',
        height: '100%',
        paddingTop: Constants.statusBarHeight,
        alignItems: 'center',
        flexDirection: 'column',
    },
    contentContainer: {
        flex: 5,
        width: '100%',
    },
    viewType: {
        flexDirection:'row',
        alignItems: 'flex-end',
        paddingBottom: 10,
        width: '100%',
        justifyContent: 'center',
    },
    footerContainer: { 
        width: '100%',
        backgroundColor: 'white',
        bottom: 0, 
        paddingBottom: 35,
        marginTop: 0
    },
});
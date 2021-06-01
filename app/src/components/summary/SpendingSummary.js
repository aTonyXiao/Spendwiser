import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
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
import { StackActions, useFocusEffect } from '@react-navigation/native';
import mainStyles from '../../styles/mainStyles';

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
    const [values, setValues] = useState(Array(7).fill(0));
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

    /**
     * A callback function that updates the state of cards array
     * @param {Array} myCards - array of user's cards retrieved from the database
     */
    function getCardFromDB(myCards) {
        setCards(myCards);
    }

    /**
     * Function to change the current category in summary mode
     * @param {string} cat - new category to change to curCategory to
     */
    function changeCategory(cat) {
        setCurCategory({
            label: cat,
            value: cat === "All categories" ? values.reduce((a, b) => a + b, 0) : values[keys.indexOf(cat)],
        });
    };


    /**
     * Function to change current card of the spend analyzer to filter transactions from
     * @param {string} cardName - name of the card the user wants to view transactions from
     */
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

    /**
     * Function to set new month period for COMPARE and BUDGET modes
     * whichPeriod state determines if the user wants to set the first or second month period
     * @param {Date} date - date object with month and year that the user has chosen to update to
     */
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
    
    /**
     * Get transactions based on parameter array's month period for COMPARE and BUDGET mode
     * @param {Array} newCompareTimeframe - array of two Data objects 
     */
    function getCompareTimeframeTransactions(newCompareTimeframe) {
        if (newCompareTimeframe.length === 0) {
            return;
        }
        if (whichPeriod === 1 || whichPeriod === 0) {
            // end time frame is the last day of the month
            let endTimeFrame0 = new Date(newCompareTimeframe[0].getFullYear(), newCompareTimeframe[0].getMonth() + 1, 0, 23, 59, 59, 59);
            user.getTimeFrameTransactions(userId, newCompareTimeframe[0], endTimeFrame0, (data) => {
                setCompareTransPeriod1(oldData => [...oldData, data]);
            });
        }
        if (whichPeriod === 2 || whichPeriod === 0) {
            let endTimeFrame1 = new Date(newCompareTimeframe[1].getFullYear(), newCompareTimeframe[1].getMonth() + 1, 0, 23, 59, 59, 59);
            user.getTimeFrameTransactions(userId, newCompareTimeframe[1], endTimeFrame1, (data) => {
                setCompareTransPeriod2(oldData => [...oldData, data]);
            });
        }
    };

    /**
     * Set and store new category limits for BUDGET mode
     * @param {Array} newCategoriesLimit - an array of integers representing the limits of each category
     */
    function changeCategoriesLimit(newCategoriesLimit) {
        setCategoriesLimit(newCategoriesLimit);
        storage.storeCategoriesLimit(newCategoriesLimit);
    }

    /**
     * Process and add transaction to the values array if the transaction is within the card filter
     * @param {Object} transaction - transaction object retrieved from database
     */
    function processTransaction(transaction) {
        let tmpValues = values;
        if (curCard === null || transaction["cardId"] === curCard["cardId"])
            tmpValues[summaryHelper.matchTransactionToCategory(transaction)] += parseFloat(transaction['amountSpent']);
        setValues(tmpValues);
        setCurCategory((prevState) => {
            return { ...prevState, value: tmpValues.reduce((a, b) => a + b, 0)};
        });
    };

     /**
      * useFocusEffect called when spend analyzer in focus
      * Checks if spend analyzer screen requires update
      * Requires update when transactions are added, edited, or deleted. Also when cards are added or deleted
      */
     useFocusEffect(
        useCallback(() => {
            if (compareTimeframe.length !== 0) {
                if (user.newOrDeletedCards) {
                    user.newTransactions = [];
                    user.editedTransactions = [];
                    user.newOrDeletedCards = false;
                    navigation.dispatch(
                        StackActions.replace('SpendingSummary')
                    )
                }
                if (user.newTransactions.length > 0 || user.editedTransactions.length > 0)
                    setMode(modeType.SUMMARY);
                let check = new Date();
                while (user.newTransactions.length > 0) {
                    let trans = user.newTransactions.pop();
                    // If new transaction not in transaction array list then add it in
                    if (curTimeframe === 'This month' || curTimeframe === 'Last 3 months') {
                        if (!(transactions.some(e => e.docId === trans.docId))) {
                            setTransactions(oldData => summaryHelper.addSortedNewTransaction(oldData, trans));
                            processTransaction(trans);
                        }
                    }
                    if (check.getMonth() == compareTimeframe[0].getMonth()) {
                        if (!(compareTransPeriod1.some(e => e.docId === trans.docId))) {
                            setCompareTransPeriod1(oldData => [...oldData, trans]);
                        }
                    }
                    if (check.getMonth() == compareTimeframe[1].getMonth()) {
                        if (!(compareTransPeriod2.some(e => e.docId === trans.docId))) {
                            setCompareTransPeriod2(oldData => [...oldData, trans]);
                        }
                    }
                }
                while (user.editedTransactions.length > 0) {
                    let trans = user.editedTransactions.pop();
                    // If edited/ deleted transaction not synced
                    if (curTimeframe === 'This month' || curTimeframe === 'Last 3 months') {
                        if (transactions.some(e => e.docId === trans.docId)) {
                            let tmpTransactions = [...transactions];
                            let idx = tmpTransactions.findIndex((element) => element.docId === trans.docId);
                            let editedTrans = tmpTransactions[idx];
                            let prevAmount = editedTrans.amountSpent;
                            if (trans.amountSpent === null) {
                                tmpTransactions.splice(idx, 1);
                            } else {
                                editedTrans.amountSpent = trans.amountSpent;
                                tmpTransactions.splice(idx, 1, editedTrans);
                            }
                            setTransactions(tmpTransactions);
                            let tmpValues = values;
                            if (curCard === null || transaction["cardId"] === curCard["cardId"]) {
                                if (trans.amountSpent !== null)
                                    tmpValues[summaryHelper.matchTransactionToCategory(editedTrans)] += 
                                        parseFloat(editedTrans['amountSpent'])- parseFloat(prevAmount);
                                else
                                    tmpValues[summaryHelper.matchTransactionToCategory(editedTrans)] -= parseFloat(prevAmount);
                                setValues(tmpValues);
                                if (curCategory.label === "All categories")
                                    setCurCategory((prevState) => {
                                        return { ...prevState, value: tmpValues.reduce((a, b) => a + b, 0)};
                                    });
                                }
                        }
                    }
                    if (check.getMonth() == compareTimeframe[0].getMonth()) {
                        if (compareTransPeriod1.some(e => e.docId === trans.docId)) {
                            let tmpTransactions = [...compareTransPeriod1];
                            let idx = tmpTransactions.findIndex((element) => element.docId === trans.docId);
                            let editedTrans = tmpTransactions[idx];
                            if (trans.amountSpent === null) {
                                tmpTransactions.splice(idx, 1);
                            } else {
                                editedTrans.amountSpent = trans.amountSpent;
                                tmpTransactions.splice(idx, 1, editedTrans);
                            }
                            setTransactions(tmpTransactions);
                            setCompareTransPeriod1(tmpTransactions);
                        }
                    }
                    if (check.getMonth() == compareTimeframe[1].getMonth()) {
                        if (compareTransPeriod2.some(e => e.docId === trans.docId)) {
                            let tmpTransactions = [...compareTransPeriod2];
                            let idx = tmpTransactions.findIndex((element) => element.docId === trans.docId);
                            let editedTrans = tmpTransactions[idx];
                            if (trans.amountSpent === null) {
                                tmpTransactions.splice(idx, 1);
                            } else {
                                editedTrans.amountSpent = trans.amountSpent;
                                tmpTransactions.splice(idx, 1, editedTrans);
                            }
                            setTransactions(tmpTransactions);
                            setCompareTransPeriod2(tmpTransactions);
                        }
                    }
                }
            } else {
                user.newTransactions = [];
                user.editedTransactions = [];
            }
        })
    )

    /**
     * useEffect called on curTimeFrame state change
     * Retrieve transactions from database based on new curTimeFrame
     * Call to database function has a callback, processTransactions(), to add transaction data to value array
     */
    useEffect(() => {
        setTransactions([]);
        setCurCategory({
            label: 'All categories',
            value: 0,
        });
        let [startTimeFrame, endTimeFrame] = summaryHelper.getTimeFrame(curTimeframe);
        user.getTimeFrameTransactions(userId, startTimeFrame, endTimeFrame, (data) => {
            if (data !== null) {
                setTransactions(oldData => summaryHelper.addSortedNewTransaction(oldData, data));
                processTransaction(data);
            }
        });
    }, [curTimeframe]);

    /**
     * useEffect called on mount
     * Loads card names and id, and initialize COMPARE and BUDGET mode info
     */
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

    return (
        <SafeAreaView style={mainStyles.screen}>
            <StatusBar barStyle='dark-content'/>
            <CategoryModal
                modalType = {modalType}
                modalVisible = {modalVisible}
                setModalVisible = {setModalVisible}
                curTimeframe = {curTimeframe}
                setCurTimeframe = {setCurTimeframe}
                setValues = {setValues}
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
            <View style={mainStyles.bodyContainer}>
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
            </View>
            {/* Footer */}
            <View style={mainStyles.footerContainer}>
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